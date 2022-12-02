const fs = require('fs');

const spellIdList = JSON.parse(
  fs.readFileSync('./spellIdList.json', {
    encoding: 'utf-8',
  })
);

const enData = JSON.parse(
  fs.readFileSync('./i18n_en.json', {
    encoding: 'utf-8',
  })
);

const esData = JSON.parse(
  fs.readFileSync('./i18n_es.json', {
    encoding: 'utf-8',
  })
);

const deData = JSON.parse(
  fs.readFileSync('./i18n_de.json', {
    encoding: 'utf-8',
  })
);

const frData = JSON.parse(
  fs.readFileSync('./i18n_fr.json', {
    encoding: 'utf-8',
  })
);

const itData = JSON.parse(
  fs.readFileSync('./i18n_it.json', {
    encoding: 'utf-8',
  })
);

const ptData = JSON.parse(
  fs.readFileSync('./i18n_pt.json', {
    encoding: 'utf-8',
  })
);

const enSpells = enData.texts;
const esSpells = esData.texts;
const deSpells = deData.texts;
const frSpells = frData.texts;
const itSpells = itData.texts;
const ptSpells = ptData.texts;

let translatedSpells = [];

spellIdList.forEach((classArray) => {
  let translatedClassSpells = [];
  classArray.forEach((spell) => {
    translatedClassSpells = [
      ...translatedClassSpells,
      {
        id: spell.id,
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
      },
    ];
  });
  translatedSpells = [...translatedSpells, translatedClassSpells];
});

try {
  fs.unlinkSync('translatedSpells.json');
} catch (err) {
  console.error('No matching file');
}

fs.writeFileSync('translatedSpells.json', JSON.stringify(translatedSpells));

[81, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 108];
