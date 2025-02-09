import fs from 'fs';
import { writeOutput } from './utils.js';
import { modifiableEffectStrings } from './constants.js';

const modifiableEffects = Object.keys(modifiableEffectStrings).map(Number);

const effectData = JSON.parse(
  fs.readFileSync('./temp/effects.json', {
    encoding: 'utf-8',
  })
);

const enData = JSON.parse(
  fs.readFileSync('./input/en.json', {
    encoding: 'utf-8',
  })
);

const frData = JSON.parse(
  fs.readFileSync('./input/fr.json', {
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

const ptData = JSON.parse(
  fs.readFileSync('./input/pt.json', {
    encoding: 'utf-8',
  })
);

const enTranslations = enData.entries;
const frTranslations = frData.entries;
const esTranslations = esData.entries;
const deTranslations = deData.entries;
const ptTranslations = ptData.entries;

// Some effects contain sprite addons with a format similar to <sprite src="chance">
// the regex below targets that because this format is not usable by DofusLab
const removeSpriteText = (descriptionText) =>
  (descriptionText || '').replace(/<sprite[^>]*>\s/g, '');

let allEffects = effectData.map((effect) => ({
  effectId: effect.id,
  effectDescriptions: {
    en: removeSpriteText(enTranslations[effect.descriptionId]),
    fr: removeSpriteText(frTranslations[effect.descriptionId]),
    es: removeSpriteText(esTranslations[effect.descriptionId]),
    de: removeSpriteText(deTranslations[effect.descriptionId]),
    pt: removeSpriteText(ptTranslations[effect.descriptionId]),
  },
}));

let dofuslabModifiableEffects = modifiableEffects.map((effectId) => {
  const data = effectData.find((effectInData) => effectId === effectInData.id);

  // Some effects contain sprite addons with a format similar to <sprite src="chance">
  // the regex below targets that because this format is not usable by DofusLab
  return {
    [data.id]: (enTranslations[data.descriptionId] || '').replace(
      /<sprite[^>]*>\s/g,
      ''
    ),
  };
});

writeOutput('./temp/effectList.json', allEffects);
writeOutput('./temp/modifiableEffectList.json', dofuslabModifiableEffects);
