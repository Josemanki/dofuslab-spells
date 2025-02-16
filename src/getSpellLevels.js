import fs from 'fs';
import {
  effectsWithSpells,
  effectsWithStates,
  effectsWithSummons,
  effectsWithoutTranslations,
  modifiableEffectStrings,
} from './constants.js';
import { StatTemplateParser } from './templateEngine.js';
import { writeOutput } from './utils.js';

const debugEnabled = process.argv.includes('--with-debug-effects');

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

const getEffects = (effects) => {
  if (effects.length === 0) {
    return {};
  }

  const validModifiableKeys = Object.keys(modifiableEffectStrings);
  const modifiableEffect = [];
  let customEffects = { en: [], fr: [], de: [], es: [], it: [], pt: [] };

  effects.forEach((effect) => {
    if (effectsWithoutTranslations.includes(effect.effectId)) return;
    if (validModifiableKeys.includes(String(effect.effectId))) {
      modifiableEffect.push({
        stat: modifiableEffectStrings[effect.effectId],
        minStat:
          // 5 Pushback, 1020 Shields - should always be on maxStat
          effect.effectId === 5 || effect.effectId === 1020
            ? null
            : effect.diceNum,
        maxStat:
          // 5 Pushback, 1020 Shields - should always be on maxStat
          effect.effectId === 5 || effect.effectId === 1020
            ? String(effect.diceNum)
            : effect.diceSide,
      });
    } else {
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

  return {
    modifiableEffect: modifiableEffect,
    customEffect: customEffects.en.length === 0 ? {} : customEffects,
  };
};

const translatedSpells = {};
const debugTranslations = {};

Object.entries(spellIdList).forEach(([breed, breedSpellPairs]) => {
  const flattenedSpellPairs = breedSpellPairs.flat();

  const classSpells = flattenedSpellPairs.map((spell) => {
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
      effects: spell.spellLevels.map((spellLevelId) => {
        const eff = spellLevelData.find((spellToFind) => {
          return spellToFind.id == spellLevelId;
        });

        const aoeType = null;
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
          needLos: eff.castTestLos,
          modifiableRange: eff.rangeCanBeBoosted,
          isLinear: eff.castInLine,
          needsFreeCell: eff.needFreeCell,
          aoeType: aoeType,
          spellRange: getSpellRange(eff.minRange, eff.range),
          normalEffects: getEffects(eff.effects.Array),
          criticalEffects: getEffects(eff.criticalEffect.Array),
        };
      }),
    };
  });

  translatedSpells[breed] = classSpells;

  if (debugEnabled) {
    const classDebugSpells = flattenedSpellPairs.map((spell) => {
      return {
        id: spell.id,
        name: datasets['en'][spell.nameId],
      };
    });

    debugTranslations[breed] = classDebugSpells;
  }
});

writeOutput('./output/translatedEffects.json', translatedSpells);
debugEnabled && writeOutput('./temp/debugEffects.json', debugTranslations);
