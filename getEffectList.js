const fs = require('fs');

  const modifiableEffects = [81, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 108];

  const effectData = JSON.parse(
    fs.readFileSync('./input/Effects.json', {
      encoding: 'utf-8',
    })
  );

  const enData = JSON.parse(
    fs.readFileSync('./input/i18n_en.json', {
      encoding: 'utf-8',
    })
  );

  const enTranslations = enData.texts;

  let effectList = effectData.map((effect) => ({
    effectId: effect.id,
    effectDescription: enTranslations[effect.descriptionId],
  }));

  let modifiableEffectList = modifiableEffects.map((effectId) => {
    const data = effectData.find((effectInData) => effectId === effectInData.id);
    return {
      [data.id]: enTranslations[data.descriptionId],
    };
  });

  try {
    fs.unlinkSync('./temp/effectList.json');
  } catch (err) {
    console.error('No matching file');
  }

  fs.writeFileSync('./temp/effectList.json', JSON.stringify(effectList));
  fs.writeFileSync('./temp/modifiableEffectList.json', JSON.stringify(modifiableEffectList));