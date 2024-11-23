import fs from 'fs';
import {
  effectIdsWithSpells,
  effectsWithoutTranslations,
} from './constants.js';
import { StatTemplateParser } from './templateEngine.js';
import { writeOutput } from './utils.js';

const spellIdList = JSON.parse(
  fs.readFileSync('./temp/spellIdList.json', {
    encoding: 'utf-8',
  })
);

const fullSpellList = JSON.parse(
  fs.readFileSync('./temp/Cleaned/SpellsRoot.json', {
    encoding: 'utf-8',
  })
);

const fullStateList = JSON.parse(
  fs.readFileSync('./temp/Cleaned/SpellStatesRoot.json', {
    encoding: 'utf-8',
  })
);

const enData = JSON.parse(
  fs.readFileSync('./input/en.i18n.json', {
    encoding: 'utf-8',
  })
);

const esData = JSON.parse(
  fs.readFileSync('./input/es.i18n.json', {
    encoding: 'utf-8',
  })
);

const deData = JSON.parse(
  fs.readFileSync('./input/de.i18n.json', {
    encoding: 'utf-8',
  })
);

const frData = JSON.parse(
  fs.readFileSync('./input/fr.i18n.json', {
    encoding: 'utf-8',
  })
);

const ptData = JSON.parse(
  fs.readFileSync('./input/pt.i18n.json', {
    encoding: 'utf-8',
  })
);

const spellLevelData = JSON.parse(
  fs.readFileSync('./temp/Cleaned/SpellLevelsRoot.json', {
    encoding: 'utf-8',
  })
);

const effectData = JSON.parse(
  fs.readFileSync('./temp/Cleaned/EffectsRoot.json', {
    encoding: 'utf-8',
  })
);

const getSpellRange = (min, max) => {
  return {
    minRange: min,
    maxRange: max,
  };
};

const statsParser = new StatTemplateParser();

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
          effect.effectId === 5 || effect.effectId === 1020
            ? null
            : effect.diceNum,
        maxStat:
          effect.effectId === 5 || effect.effectId === 1020
            ? String(effect.diceNum)
            : effect.diceSide,
      });
    } else {
      const foundEffect = effectData.find(
        (effectToFind) => effectToFind.id === effect.effectId
      );
      const foundSpell = effect.value ? fullSpellList[effect.value] : null;

      const getTranslationId = (value) => {
        if (value && value < 12000) {
          return foundEffect.descriptionId;
        } else if (effect.diceNum > 12000) {
          return foundEffect.descriptionId;
        } else if (effect.value > 12000) {
          return foundEffect.descriptionId;
          // .replace('#2', enData.texts[foundSpell.nameId]);
        } else {
          if (effect.diceSide === 0) {
            return foundEffect.descriptionId;
            // .replace(/#1{~1~2 to -}#2|#1{~1~2 to -}#2/, effect.diceNum);
            // .replace('{~1~2 to -}#2', effect.diceNum);
            // .replace('#1', effect.diceNum);
          } else {
            return foundEffect.descriptionId;
            // .replace('{~1~2 to -}#2', effect.diceSide);
            // .replace('#1', effect.diceNum);
          }
        }
      };

      const calculateEffectDuration = (duration, lang) => {
        if (duration === 0) {
          return '';
        }
        if (duration === 1) {
          switch (lang) {
            case 'en':
              return ` (${duration} turn)`;
            case 'fr':
              return ` (${duration} tour)`;
            case 'de':
              return ` (${duration} runde)`;
            case 'es':
            case 'it':
            case 'pt':
              return ` (${duration} turno)`;
          }
        }
        switch (lang) {
          case 'en':
            return ` (${duration} turns)`;
          case 'fr':
            return ` (${duration} tours)`;
          case 'de':
            return ` (${duration} runden)`;
          case 'it':
            return ` (${duration} turni)`;
          case 'es':
          case 'pt':
            return ` (${duration} turnos)`;
        }
      };

      const formatAndReplace = (translationId, dataset, lang) => {
        // effectId 293 increases base damage of the spell that is in the diceNum
        if (effect.effectId == 293) {
          const foundSpell = fullSpellList.find(
            (spellToFind) => spellToFind.id == effect.diceNum
          );
          return dataset.entries[translationId]
            .replace('#1', dataset.entries[foundSpell.nameId])
            .replace('#3', effect.value);
        }

        if (effect.effectId == 950 || effect.effectId == 951) {
          const foundState = fullStateList.find(
            (stateToFind) => stateToFind.id == effect.value
          );
          return dataset.entries[translationId].replace(
            '#3',
            foundState ? dataset.entries[foundState.nameId] : effect.value
          );
        }

        if (effectIdsWithSpells.includes(effect.effectId)) {
          const foundSpell = fullSpellList.find(
            (spellToFind) => spellToFind.id == effect.diceNum
          );
          return dataset.entries[translationId]
            .replace('#1', dataset.entries[foundSpell?.nameId])
            .replace('#2', effect.diceSide)
            .replace('#3', effect.value);
        }

        if (effect.diceNum > 12000) {
          return dataset.entries[translationId].replace('#2', effect.diceSide);
        }

        if (effect.value > 12000) {
          const foundSpell = fullSpellList.find(
            (spellToFind) => spellToFind.id == effect.value
          );
          return dataset.entries[translationId].replace(
            '#2',
            dataset.entries[foundSpell?.nameId] || 'NOT FOUND SPELL >12000'
          );
        } else {
          if (effect.diceSide === 0) {
            return dataset.entries[translationId]
              .replace(
                /#1{~1~2 to -}#2|#1{~1~2 to -}#2|#1{~1~2 à }#2|#1{~1~2 to }#2|#1{~1~2 bis }#2|#1{~1~2 a }#2/,
                effect.diceNum
              )
              .replace('#1{~1~2 à -}#2', effect.diceNum)
              .replace('#1{~1~2 bis +}#2', effect.diceNum)
              .replace('#1{~1~2 bis -}#2', effect.diceNum)
              .replace('#1{~1~2 a -}#2', effect.diceNum)
              .replace('#1{~1~2 bis +}#2', effect.diceNum)
              .replace('+#1{~1~2 bis +}#2', effect.diceNum)
              .replace('#1{~1~2 bei }#2 ', effect.diceNum)
              .replace('{~ps}{~zs}', 's')
              .replace('{~p}{~z}', '')
              .replace('{~sa}{~pe}{~ze}', 'e')
              .replace('{~so}{~pi}{~zi}', 'i')
              .replace('#1{~1~2 to }#2 (damage)', `${effect.diceNum} (damage)`)
              .replace(
                '#1{~1~2 bis }#2 (Schaden)',
                `${effect.diceNum} (Schaden)`
              )
              .replace('#1{~1~2 a }#2 (daños)', `${effect.diceNum} (daños)`)
              .replace('#1{~1~2 a }#2 (danni)', `${effect.diceNum} (danni)`)
              .replace('#1{~1~2 a }#2 (danos)', `${effect.diceNum} (danos)`)
              .replace('#1', effect.diceNum)
              .concat('', calculateEffectDuration(effect.duration, lang));
            // .replace('#1', effect.diceNum);
          } else {
            return dataset.entries[translationId]
              .replace(
                /#1{~1~2 to -}#2|#1{~1~2 to }#2/,
                `${effect.diceNum} to ${effect.diceSide}`
              )
              .replace(
                /#1{~1~2 à -}#2|#1{~1~2 à }#2/,
                `${effect.diceNum} à ${effect.diceSide}`
              )
              .replace(
                /#1{~1~2 bis -}#2|#1{~1~2 bis }#2/,
                `${effect.diceNum} bis ${effect.diceSide}`
              )
              .replace(
                /#1{~1~2 a -}#2|#1{~1~2 a }#2/,
                `${effect.diceNum} a ${effect.diceSide}`
              )
              .replace(
                '+#1{~1~2 bis +}#2',
                `${effect.diceNum} bis ${effect.diceSide}`
              )
              .replace('#1{~1~2 bis +}#2', `${effect.diceNum}`)
              .replace('{~p}{~z}', '')
              .replace('{~ps}{~zs}', 's')
              .replace('{~sa}{~pe}{~ze}', 'a')
              .replace('{~so}{~pi}{~zi}', 'o')
              .replace(
                '#1{~1~2 to }#2 (damage)',
                `${effect.diceNum} to ${effect.diceSide} (damage)`
              )
              .replace(
                '#1{~1~2 bis }#2 (Schaden)',
                `${effect.diceNum} bis ${effect.diceSide} (Schaden)`
              )
              .replace(
                '#1{~1~2 a }#2 (daños)',
                `${effect.diceNum} a ${effect.diceSide} (daños)`
              )
              .replace(
                '#1{~1~2 a }#2 (danni)',
                `${effect.diceNum} a ${effect.diceSide} (danni)`
              )
              .replace(
                '#1{~1~2 a }#2 (danos)',
                `${effect.diceNum} a ${effect.diceSide} (danos)`
              )
              .replace('#1', effect.diceNum)
              .concat('', calculateEffectDuration(effect.duration, lang));
            // .replace('{~1~2 to -}#2', effect.diceSide);
            // .replace('#1', effect.diceNum);
          }
        }
      };
      customEffects = {
        en: [
          ...customEffects.en,
          statsParser.parse(
            enData.entries[getTranslationId(effect.value)],
            [effect.diceNum, effect.diceSide, effect.value],
            'en'
          ),
        ],
        fr: [
          ...customEffects.fr,
          formatAndReplace(getTranslationId(effect.value), frData, 'fr'),
        ],
        de: [
          ...customEffects.de,
          formatAndReplace(getTranslationId(effect.value), deData, 'de'),
        ],
        es: [
          ...customEffects.es,
          formatAndReplace(getTranslationId(effect.value), esData, 'es'),
        ],
        it: [
          ...customEffects.it,
          formatAndReplace(getTranslationId(effect.value), enData, 'en'),
        ],
        pt: [
          ...customEffects.pt,
          formatAndReplace(getTranslationId(effect.value), ptData, 'pt'),
        ],
      };

      Object.entries(customEffects).forEach((item) => {
        customEffects[item[0]] = item[1].filter((item) => item != '#1');
      });
    }
  });
  return {
    modifiableEffect: modifiableEffect,
    customEffect: customEffects.en.length === 0 ? {} : customEffects,
  };
};

const modifiableEffectStrings = {
  5: 'Pushback damage',
  81: 'HP restored',
  91: 'Water steal',
  92: 'Earth steal',
  93: 'Air steal',
  94: 'Fire steal',
  95: 'Neutral steal',
  96: 'Water damage',
  97: 'Earth damage',
  98: 'Air damage',
  99: 'Fire damage',
  100: 'Neutral damage',
  108: 'Fire healing',
  1020: 'Shield',
  2822: 'Best element damage',
  2998: 'Water healing',
  2999: 'Air healing',
  3000: 'Earth healing',
  3001: 'Neutral healing',
  3002: 'Best element healing',
};

const enSpells = enData.entries;
const esSpells = esData.entries;
const deSpells = deData.entries;
const frSpells = frData.entries;
const itSpells = enData.entries;
const ptSpells = ptData.entries;

let translatedSpells = [];

spellIdList.forEach((classArray) => {
  let translatedClassSpells = [];
  classArray.flat().forEach((spell) => {
    translatedClassSpells = [
      ...translatedClassSpells,
      {
        name: {
          en: enSpells[spell.nameId],
          fr: frSpells[spell.nameId],
          de: deSpells[spell.nameId],
          es: esSpells[spell.nameId],
          it: itSpells[spell.nameId],
          pt: ptSpells[spell.nameId],
        },
        description: {
          en: enSpells[spell.descriptionId],
          fr: frSpells[spell.descriptionId],
          de: deSpells[spell.descriptionId],
          es: esSpells[spell.descriptionId],
          it: itSpells[spell.descriptionId],
          pt: ptSpells[spell.descriptionId],
        },
        imageUrl: `spell/${spell.icon}.png`,
        effects: spell.spellLevels.map((spellLevelId) => {
          const eff = spellLevelData.find((spellToFind) => {
            return spellToFind.id == spellLevelId;
          });
          const effectArray = eff.effects.Array.filter((item) =>
            Object.keys(modifiableEffectStrings).includes(String(item.effectId))
          );

          // const aoeType = getSpellAoe(effectArray?.[0]);
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
            castsPerTurn: eff.maxCastPerTurn
              ? String(eff.maxCastPerTurn)
              : null,
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
      },
    ];
  });
  translatedSpells = [...translatedSpells, translatedClassSpells];
});

writeOutput('./output/translatedEffects.json', translatedSpells);
