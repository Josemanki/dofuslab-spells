// '-': 'diagonale de %1 case',
// A: 'tout le monde',
// a: 'tout le monde',
// C: 'cercle de %1 case',
// D: 'Damier de %1 case',
// L: 'ligne de %1 case',
// O: 'anneau de %1 case',
// Q: 'croix de %1 case',
// T: 'ligne perpendiculaire de %1 case',
// U: 'demi-cercle de %1 case',
// V: 'cône de %1 case',
// X: 'croix de %1 case',
// G: 'carré de %1 case',
// '+': 'croix diagonale de %1 case',
// '*': 'étoile de %1 case',
// p: 'case',
// P: 'case',

const fs = require('fs');

  const spells = JSON.parse(
    fs.readFileSync('./input/Spells.json', {
      encoding: 'utf-8',
    })
  );

  const breedList = JSON.parse(
    fs.readFileSync('./temp/breedList.json', {
      encoding: 'utf-8',
    })
  );

  let orderedSpells = [];

  breedList.forEach((breedItem) => {
    let spellGroup = [];
    breedItem.spells.forEach((singleSpell) => {
      const foundSpell = spells.filter((spellInSpells) => spellInSpells.id === singleSpell);
      spellGroup = [
        ...spellGroup,
        {
          id: foundSpell[0].id,
          icon: foundSpell[0].iconId,
          nameId: foundSpell[0].nameId,
          descriptionId: foundSpell[0].descriptionId,
          spellLevels: foundSpell[0].spellLevels,
        },
      ];
    });
    console.log(spellGroup);
    orderedSpells = [...orderedSpells, spellGroup];
  });

  try {
    fs.unlinkSync('./temp/spellIdList.json');
  } catch (err) {
    console.error('No matching file');
  }

  fs.writeFileSync('./temp/spellIdList.json', JSON.stringify(orderedSpells));