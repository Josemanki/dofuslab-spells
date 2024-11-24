import fs from 'fs';
import { writeOutput } from './utils.js';

const englishTranslations = JSON.parse(
  fs.readFileSync('./input/en.i18n.json', {
    encoding: 'utf-8',
  })
);

const spells = JSON.parse(
  fs.readFileSync('./temp/SpellsRoot.json', {
    encoding: 'utf-8',
  })
);

const breedList = JSON.parse(
  fs.readFileSync('./temp/breedList.json', {
    encoding: 'utf-8',
  })
);

let spellsByClass = [];

breedList.forEach((breed) => {
  let classSpells = [];

  breed.spells.forEach((spellPair) => {
    const currentSpellPair = spellPair.map((singleSpell) => {
      const foundSpell = spells.filter(
        (spellInSpells) => spellInSpells.id === singleSpell
      );

      return {
        id: foundSpell[0].id,
        icon: foundSpell[0].iconId,
        nameId: foundSpell[0].nameId,
        descriptionId: foundSpell[0].descriptionId,
        spellLevels: foundSpell[0].spellLevels.Array,
      };
    });

    const firstSpellName =
      englishTranslations.entries[currentSpellPair[0].nameId];
    const secondSpellName =
      englishTranslations.entries[currentSpellPair[1].nameId];

    console.log(`Generated pair: ${firstSpellName} | ${secondSpellName}`);

    classSpells = [...classSpells, currentSpellPair];
  });

  spellsByClass = [...spellsByClass, classSpells];
});

writeOutput('./temp/spellIdList.json', spellsByClass);
