import fs from 'fs';
import { writeOutput } from './utils.js';
import { buffEffectStrings } from './constants.js';

const spellIdList = JSON.parse(
  fs.readFileSync('./temp/spellIdList.json', {
    encoding: 'utf-8',
  })
);

const enData = JSON.parse(
  fs.readFileSync('./input/en.json', {
    encoding: 'utf-8',
  })
);

const spellLevelData = JSON.parse(
  fs.readFileSync('./temp/spell_levels.json', {
    encoding: 'utf-8',
  })
);

export function getSpellName(spell, enData) {
  return enData.entries[spell.nameId];
}

export function getSpellLevels(spell, spellLevelData) {
  return spell.spellLevels.map((spellLevelId) => {
    const spellData = spellLevelData.find(
      (foundSpellLevel) => spellLevelId === foundSpellLevel.id
    );

    if (
      !spellData.effects['Array'].some(
        (effect) => effect.effectId in buffEffectStrings
      )
    ) {
      return;
    }

    return {
      level: spellData.minPlayerLevel,
      buffs: spellData.effects['Array']
        .map((effect) => {
          const criticalEffect = spellData.criticalEffect['Array'].find(
            (critEffect) => critEffect.effectId === effect.effectId
          );

          return {
            stat: buffEffectStrings[effect.effectId],
            incrementBy: effect.diceNum,
            critIncrementBy: criticalEffect?.diceNum || null,
            maxStacks: spellData.maxStack > 0 ? spellData.maxStack : 1,
          };
        })
        .filter((buff) => Boolean(buff.stat)),
    };
  });
}

export function filterBuffs(classBuffs) {
  return classBuffs.filter((buff) => {
    return buff.levels.every((level) => level !== undefined);
  });
}

const buffs = {};

Object.entries(spellIdList).forEach(([breed, breedSpellPairs]) => {
  const flattenedSpellPairs = breedSpellPairs.flat();

  const classBuffs = flattenedSpellPairs.reduce((acc, spell) => {
    const spellName = getSpellName(spell, enData);
    const spellLevels = getSpellLevels(spell, spellLevelData);

    acc.push({
      name: spellName,
      levels: spellLevels,
    });
    return acc;
  }, []);

  const filteredBuffs = filterBuffs(classBuffs);

  buffs[breed] = filteredBuffs;
});

writeOutput('./output/buffs.json', buffs);
