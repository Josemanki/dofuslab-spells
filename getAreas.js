const fs = require('fs');

const effectData = JSON.parse(
  fs.readFileSync('./input/Effects.json', {
    encoding: 'utf-8',
  })
);

const spellIdData = JSON.parse(
  fs.readFileSync('./temp/spellIdList.json', {
    encoding: 'utf-8',
  })
);

const spellLevelData = JSON.parse(
  fs.readFileSync('./input/SpellLevels.json', {
    encoding: 'utf-8',
  })
);

const enData = JSON.parse(
  fs.readFileSync('./input/i18n_en.json', {
    encoding: 'utf-8',
  })
);

const areaSet = new Set();

console.log(spellLevelData[0]);

  const areas = spellIdData.forEach((dofusClass) => {
    dofusClass.forEach((spell) => {
      spell.spellLevels.forEach((spellLevel) => {
        const foundSpell = spellLevelData.find((spellLevelInData) => spellLevelInData.id === spellLevel);
        foundSpell?.effects?.forEach((effect) => {
          const area = effect.rawZone.split(',')[0];
          areaSet.add(area);
        });
      });
    });
  });

  console.log(areaSet);

  try {
    fs.unlinkSync('./temp/effectList.json');
  } catch (err) {
    console.error('No matching file');
  }

  fs.writeFileSync('./temp/effectList.json', JSON.stringify(effectList));
  fs.writeFileSync('./temp/modifiableEffectList.json', JSON.stringify(modifiableEffectList));
