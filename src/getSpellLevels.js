import fs from 'fs';
import {
  effectsWithSpells,
  effectsWithStates,
  effectsWithSummons,
  effectsWithoutTranslations,
  modifiableEffectStrings,
  damageIncreaseEffectId,
} from './constants.js';
import { StatTemplateParser } from './templateEngine.js';
import { getSpellMetaProperties, writeOutput } from './utils.js';
import { parseMask } from './effects/masks.js';
import { effectCategory } from './effects/categories.js';
import { buildConditionLabel, BASE_CONDITION, withDelayed } from './effects/labels.js';
import { overrides } from './overrides.js';

const debugEnabled = process.argv.includes('--with-debug-effects');
const includeCustomEffects = process.argv.includes('--include-custom-effects');

const spellIdList = JSON.parse(
  fs.readFileSync('./temp/spellIdList.json', {
    encoding: 'utf-8',
  })
);

const fullSpellList = JSON.parse(
  fs.readFileSync('./temp/spells.json', {
    encoding: 'utf-8',
  })
);

const fullStateList = JSON.parse(
  fs.readFileSync('./temp/spell_states.json', {
    encoding: 'utf-8',
  })
);

const enData = JSON.parse(
  fs.readFileSync('./input/en.json', {
    encoding: 'utf-8',
  })
);

const esData = JSON.parse(
  fs.readFileSync('./input/es.json', {
    encoding: 'utf-8',
  })
);

const deData = JSON.parse(
  fs.readFileSync('./input/de.json', {
    encoding: 'utf-8',
  })
);

const frData = JSON.parse(
  fs.readFileSync('./input/fr.json', {
    encoding: 'utf-8',
  })
);

const ptData = JSON.parse(
  fs.readFileSync('./input/pt.json', {
    encoding: 'utf-8',
  })
);

const spellLevelData = JSON.parse(
  fs.readFileSync('./temp/spell_levels.json', {
    encoding: 'utf-8',
  })
);

const effectData = JSON.parse(
  fs.readFileSync('./temp/effects.json', {
    encoding: 'utf-8',
  })
);

const monsterData = JSON.parse(
  fs.readFileSync('./temp/monsters.json', {
    encoding: 'utf-8',
  })
);

const getSpellRange = (min, max) => {
  return {
    minRange: min,
    maxRange: max,
  };
};

const datasets = {
  en: enData.entries,
  fr: frData.entries,
  de: deData.entries,
  es: esData.entries,
  it: enData.entries,
  pt: ptData.entries,
};

const statsParser = new StatTemplateParser();

// Resolves state ids to localized names for condition labels (e.g. "A,E2020").
// State names can carry the same spell/color markup as descriptions
// (e.g. "{{spell,24510,1::Telefrag}}"), so they go through the same sanitizer.
const stateNameCtx = {
  stateName: (id, lang) => {
    const state = fullStateList.find((stateToFind) => stateToFind.id == id);
    if (!state) return null;
    const raw = datasets[lang][state.nameId];
    return raw ? statsParser.sanitizeSpellText(raw) : raw;
  },
};

const parseEffect = (effect, lang) => {
  const foundEffect = effectData.find(
    (effectToFind) => effectToFind.id === effect.effectId
  );
  // Calculate state name to replace the state id
  if (effectsWithStates.includes(effect.effectId)) {
    const foundState = fullStateList.find(
      (stateToFind) => stateToFind.id == effect.value
    );
    const stateName = datasets[lang][foundState.nameId];

    return statsParser.parse(
      datasets[lang][foundEffect.descriptionId],
      [effect.diceNum, effect.diceSide, stateName, effect.duration],
      lang
    );
  }

  // Calculate spell name to replace the spell id
  if (effectsWithSpells.includes(effect.effectId)) {
    const foundSpell = fullSpellList.find(
      (spellToFind) => spellToFind.id == effect.diceNum
    );
    const spellName = datasets[lang][foundSpell.nameId];

    return statsParser.parse(
      datasets[lang][foundEffect.descriptionId],
      [spellName, effect.diceSide, effect.value, effect.duration],
      lang
    );
  }

  // Calculate monster name to replace the monster id
  if (effectsWithSummons.includes(effect.effectId)) {
    const foundMonster = monsterData.find(
      (monsterToFind) => monsterToFind.id == effect.diceNum
    );
    const monsterName = datasets[lang][foundMonster.nameId];

    return statsParser.parse(
      datasets[lang][foundEffect.descriptionId],
      [monsterName, effect.diceSide, effect.value, effect.duration],
      lang
    );
  }

  // Removes the effect of the #2 spell - unique special case
  if (effect.effectId == 406) {
    const foundSpell = fullSpellList.find(
      (spellToFind) => spellToFind.id == effect.value
    );
    const spellName = datasets[lang][foundSpell.nameId];

    return statsParser.parse(
      datasets[lang][foundEffect.descriptionId],
      [effect.diceNum, spellName, effect.value, effect.duration],
      lang
    );
  }

  return statsParser.parse(
    datasets[lang][foundEffect.descriptionId],
    [effect.diceNum, effect.diceSide, effect.value, effect.duration],
    lang
  );
};

// Pushback (5) and Shields (1020) carry their value in diceNum only, so it
// belongs on maxStat with an empty minStat.
const isSingleValueStat = (effectId) => effectId === 5 || effectId === 1020;

const toStatEntry = (candidate) => ({
  stat: candidate.stat,
  minStat: candidate.minStat,
  maxStat: candidate.maxStat,
});

// Collapses exact-duplicate conditional entries (same label + stat + values).
// The label already encodes the delay annotation (e.g. "(in 3 turns)"), so an
// immediate and a delayed hit with the same values are kept distinct here.
const dedupeConditionalEntries = (entries) => {
  const seen = new Set();
  const out = [];
  for (const entry of entries) {
    const key = `${entry.condition.en}|${entry.stat}|${entry.minStat}|${entry.maxStat}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(entry);
  }
  return out;
};

// Decides how a spell level's modifiable effects are surfaced. The two buckets
// are mutually exclusive per slot:
//  - modifiableEffect: used only when NOTHING in the slot is conditional —
//    plain damage/heals/shields with nothing to disambiguate.
//  - conditionalEffect: as soon as any effect is conditional (mask carries
//    state/life/monster tokens) or the slot applies different kinds of effect
//    to different teams, EVERY modifiable effect moves here. Plain simple-mask
//    effects become the "Base" (unconditional) case; team-split effects keep
//    their team label.
// A kind-split is when the same category maps to different teams (damage on A,
// heal on a) — those plain effects are differentiated by team, not "Base".
const detectKindSplit = (plain) => {
  const categoriesByTeam = {};
  for (const candidate of plain) {
    const team = candidate.mask.teamKey ?? 'none';
    (categoriesByTeam[team] ??= new Set()).add(candidate.category);
  }
  const teams = Object.keys(categoriesByTeam);
  const distinct = new Set(teams.map((t) => [...categoriesByTeam[t]].sort().join('|')));
  return teams.length >= 2 && distinct.size >= 2;
};

// Builds labelled conditional entries for a set of candidates. A "Base"
// (unconditional default) effect is either a simple-mask effect, or a token
// effect whose conditions just negate all the buff-states this slot keys on
// positively (e.g. "without I/II/III" when the variants are "with I/II/III").
const buildLabelledEntries = (set, isKindSplit, isBaseEquivalent, isDelayed) => {
  const labelFor = (candidate) => {
    if (isKindSplit && !candidate.mask.hasConditions) {
      return buildConditionLabel(candidate.mask, stateNameCtx);
    }
    if (!candidate.mask.hasConditions || isBaseEquivalent(candidate)) {
      return BASE_CONDITION;
    }
    return buildConditionLabel(candidate.mask, stateNameCtx);
  };
  return set.map((candidate) => {
    const label = labelFor(candidate);
    return {
      condition: isDelayed ? withDelayed(label) : label,
      ...toStatEntry(candidate),
    };
  });
};

const routeModifiables = (candidates) => {
  const positiveStateIds = new Set();
  for (const c of candidates) {
    for (const cond of c.mask.conditions) {
      if (cond.type === 'state' && cond.positive) positiveStateIds.add(cond.id);
    }
  }
  const isBaseEquivalent = (candidate) => {
    const conds = candidate.mask.conditions;
    if (conds.length === 0 || positiveStateIds.size === 0) return false;
    if (!conds.every((cond) => cond.type === 'state' && !cond.positive)) return false;
    const negated = new Set(conds.map((cond) => cond.id));
    return [...positiveStateIds].every((id) => negated.has(id));
  };

  const tokenConditioned = candidates.filter((c) => c.mask.hasConditions);
  const plain = candidates.filter((c) => !c.mask.hasConditions);
  const isKindSplit = detectKindSplit(plain);
  // A delay only needs a label when there's another effect to distinguish it
  // from. A lone effect has nothing to disambiguate, so it stays modifiable
  // even when delayed (e.g. Plotter's single "Best element damage").
  const needsDelayedLabel = candidates.some((c) => c.delay > 0) && candidates.length > 1;

  // Plain immediate stats with nothing to disambiguate → flat modifiable.
  // Identical entries are kept: a repeated effect is a genuine multi-hit
  // (e.g. Ember hits twice for the same Fire damage), not a duplicate.
  if (tokenConditioned.length === 0 && !isKindSplit && !needsDelayedLabel) {
    return { modifiableEffect: plain.map(toStatEntry) };
  }

  // Otherwise every effect is a labelled conditional line. Delayed effects
  // (delay > 0 — they land when the stack expires or the target changes) keep
  // their stack/team label plus a "(Delayed)" marker, and are ordered after the
  // immediate lines to mirror the game's separate section.
  const immediate = candidates.filter((c) => !(c.delay > 0));
  const delayed = candidates.filter((c) => c.delay > 0);
  const conditionalEffect = dedupeConditionalEntries([
    ...buildLabelledEntries(immediate, isKindSplit, isBaseEquivalent, false),
    ...buildLabelledEntries(
      delayed,
      detectKindSplit(delayed.filter((c) => !c.mask.hasConditions)),
      isBaseEquivalent,
      true
    ),
  ]);
  return { conditionalEffect };
};

// The per-cast base-damage bonus. Repeated applications are added by the user
// in-app, so we take one value; the count feeds the stack cap below.
const getDamageIncrease = (effects) => {
  const first = effects.find((e) => e && e.effectId === damageIncreaseEffectId);
  return first ? first.value : undefined;
};

// The stack cap:
//  - maxStack < 0  → unlimited (kept as the -1 sentinel; e.g. Peat Bog)
//  - maxStack > 0  → the declared cap (e.g. Arcane Torrent's 6)
//  - maxStack == 0 → derive from the number of base-damage applications, the
//    concurrent-reachable stacks (e.g. Atonement Arrow's two pulses → 2).
// Spells that hide the cap in a state chain (e.g. Toxines) aren't derived here
// and are left for the manual pass.
const getDamageIncreaseMaxStacks = (eff) => {
  const applications = eff.effects.Array.filter(
    (e) => e && e.effectId === damageIncreaseEffectId
  ).length;
  if (applications === 0) return undefined;
  if (eff.maxStack < 0) return -1;
  return eff.maxStack > 0 ? eff.maxStack : applications;
};

const getEffects = (effects) => {
  if (effects.length === 0) {
    return {};
  }

  const validModifiableKeys = Object.keys(modifiableEffectStrings);
  const candidates = [];
  let customEffects = { en: [], fr: [], de: [], es: [], it: [], pt: [] };

  effects.forEach((effect) => {
    if (effectsWithoutTranslations.includes(effect.effectId)) return;
    // Promoted to damageIncrease below — don't also render it as text.
    if (effect.effectId === damageIncreaseEffectId) return;
    if (validModifiableKeys.includes(String(effect.effectId))) {
      const singleValue = isSingleValueStat(effect.effectId);
      candidates.push({
        stat: modifiableEffectStrings[effect.effectId],
        category: effectCategory(effect.effectId),
        minStat: singleValue ? null : effect.diceNum,
        maxStat: singleValue ? String(effect.diceNum) : effect.diceSide,
        mask: parseMask(effect.targetMask),
        delay: effect.delay,
      });
    } else if (includeCustomEffects) {
      customEffects = {
        en: [...customEffects.en, parseEffect(effect, 'en')],
        fr: [...customEffects.fr, parseEffect(effect, 'fr')],
        de: [...customEffects.de, parseEffect(effect, 'de')],
        es: [...customEffects.es, parseEffect(effect, 'es')],
        it: [...customEffects.it, parseEffect(effect, 'it')],
        pt: [...customEffects.pt, parseEffect(effect, 'pt')],
      };
    }
  });

  const damageIncrease = getDamageIncrease(effects);
  return {
    ...routeModifiables(candidates),
    ...(damageIncrease !== undefined ? { damageIncrease } : {}),
    customEffect: customEffects.en.length === 0 ? {} : customEffects,
  };
};

const translatedSpells = {};
const debugTranslations = {};
// Spells whose derived values look uncertain and have no override yet — written
// to output/review.json so the manual pass has a shortlist instead of a re-hunt.
const reviewEntries = [];
// Override ids that actually matched a spell this run; anything in overrides but
// not here is dead (the spell was removed/re-id'd) and gets reported.
const appliedOverrideIds = new Set();

Object.entries(spellIdList).forEach(([breed, breedSpellPairs]) => {
  const classSpells = breedSpellPairs.map((spellPair) =>
    spellPair.map((spell) => {
      const spellOverride = overrides[spell.id] ?? {};
      if (overrides[spell.id]) appliedOverrideIds.add(String(spell.id));
      const effects = spell.spellLevels.map((spellLevelId) => {
        const eff = spellLevelData.find((spellToFind) => {
          return spellToFind.id == spellLevelId;
        });

        const { isLinear, needLos, needsFreeCell, modifiableRange } =
          getSpellMetaProperties(eff);

        const aoeType = null;
        const damageIncreaseMaxStacks = getDamageIncreaseMaxStacks(eff);
        return {
          level: eff.minPlayerLevel ? String(eff.minPlayerLevel) : null,
          apCost: eff.apCost ? String(eff.apCost) : null,
          cooldown: eff.minCastInterval ? String(eff.minCastInterval) : null,
          baseCritRate: eff.criticalHitProbability
            ? String(eff.criticalHitProbability)
            : null,
          castsPerPlayer: eff.maxCastPerTarget
            ? String(eff.maxCastPerTarget)
            : null,
          castsPerTurn: eff.maxCastPerTurn ? String(eff.maxCastPerTurn) : null,
          needLos: needLos,
          modifiableRange: modifiableRange,
          isLinear: isLinear,
          needsFreeCell: needsFreeCell,
          aoeType: aoeType,
          spellRange: getSpellRange(eff.minRange, eff.range),
          ...(damageIncreaseMaxStacks !== undefined ? { damageIncreaseMaxStacks } : {}),
          normalEffects: getEffects(eff.effects.Array),
          criticalEffects: getEffects(eff.criticalEffect.Array),
          // Manual overrides win over the derived values.
          ...spellOverride,
        };
      });

      // Flag unresolved uncertain derivations (unlimited stack cap, no
      // override) for the manual pass.
      if (
        !overrides[spell.id] &&
        effects.some((grade) => grade.damageIncreaseMaxStacks === -1)
      ) {
        reviewEntries.push({
          spellId: spell.id,
          name: datasets['en'][spell.nameId],
          description: statsParser.sanitizeSpellText(
            datasets['en'][spell.descriptionId]
          ),
          breed,
          field: 'damageIncreaseMaxStacks',
          reason:
            'derived to -1 (unlimited) — verify the real cap or add an override',
        });
      }

      return {
        name: {
          en: datasets['en'][spell.nameId],
          fr: datasets['fr'][spell.nameId],
          de: datasets['de'][spell.nameId],
          es: datasets['es'][spell.nameId],
          it: `[!] ${datasets['it'][spell.nameId]}`,
          pt: datasets['pt'][spell.nameId],
        },
        description: {
          en: statsParser.sanitizeSpellText(datasets['en'][spell.descriptionId]),
          fr: statsParser.sanitizeSpellText(datasets['fr'][spell.descriptionId]),
          de: statsParser.sanitizeSpellText(datasets['de'][spell.descriptionId]),
          es: statsParser.sanitizeSpellText(datasets['es'][spell.descriptionId]),
          it: `[!] ${statsParser.sanitizeSpellText(
            datasets['it'][spell.descriptionId]
          )}`,
          pt: statsParser.sanitizeSpellText(datasets['pt'][spell.descriptionId]),
        },
        imageUrl: `spell/${spell.icon}.png`,
        effects,
      };
    })
  );

  translatedSpells[breed] = classSpells.sort((a, b) => {
    const levelA = parseInt(a[0].effects[0].level || 0);
    const levelB = parseInt(b[0].effects[0].level || 0);
    return levelA - levelB;
  });

  if (debugEnabled) {
    const classDebugSpells = breedSpellPairs.map((spellPair) =>
      spellPair.map((spell) => ({
        id: spell.id,
        name: datasets['en'][spell.nameId],
      }))
    );

    debugTranslations[breed] = classDebugSpells;
  }
});

writeOutput('./output/translatedEffects.json', translatedSpells);

const deadOverrides = Object.keys(overrides)
  .filter((id) => !appliedOverrideIds.has(id))
  .map((id) => ({ spellId: Number(id), override: overrides[id] }));

writeOutput('./output/review.json', {
  needsReview: reviewEntries,
  deadOverrides,
});
console.log(
  `Review: ${reviewEntries.length} spell(s) need a manual check (see output/review.json)`
);
if (deadOverrides.length) {
  console.warn(
    `Warning: ${deadOverrides.length} dead override(s) — no spell matches id(s): ${deadOverrides
      .map((d) => d.spellId)
      .join(', ')}`
  );
}
debugEnabled && writeOutput('./temp/debugEffects.json', debugTranslations);
