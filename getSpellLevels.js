const fs = require('fs');

const spellIdList = JSON.parse(
  fs.readFileSync('./temp/spellIdList.json', {
    encoding: 'utf-8',
  })
);

const fullSpellList = JSON.parse(
  fs.readFileSync('./input/Spells.json', {
    encoding: 'utf-8',
  })
);

const fullStateList = JSON.parse(
  fs.readFileSync('./input/SpellStates.json', {
    encoding: 'utf-8',
  })
);

const enData = JSON.parse(
  fs.readFileSync('./input/i18n_en.json', {
    encoding: 'utf-8',
  })
);

const esData = JSON.parse(
  fs.readFileSync('./input/i18n_es.json', {
    encoding: 'utf-8',
  })
);

const deData = JSON.parse(
  fs.readFileSync('./input/i18n_de.json', {
    encoding: 'utf-8',
  })
);

const frData = JSON.parse(
  fs.readFileSync('./input/i18n_fr.json', {
    encoding: 'utf-8',
  })
);

const itData = JSON.parse(
  fs.readFileSync('./input/i18n_it.json', {
    encoding: 'utf-8',
  })
);

const ptData = JSON.parse(
  fs.readFileSync('./input/i18n_pt.json', {
    encoding: 'utf-8',
  })
);

const spellLevelData = JSON.parse(
  fs.readFileSync('./input/SpellLevels.json', {
    encoding: 'utf-8',
  })
);

const effectData = JSON.parse(
  fs.readFileSync('./input/Effects.json', {
    encoding: 'utf-8',
  })
);

const formatAoe = (aoeStr, aoeWidth) => {
  const capitalizedStr = aoeStr?.charAt(0).toUpperCase().concat(aoeStr?.slice(1));
  if (aoeWidth == 1) {
    const correctWidth = capitalizedStr?.replace('%1', aoeWidth);
    return correctWidth?.replace(/{~ps}|{~pern}|{pern}/, '').replace('{~sa}{~pe}', 'a');
  }
  const correctWidth = capitalizedStr?.replace('%1', aoeWidth);
  return correctWidth
    ?.replace('{~ps}', 's')
    .replace(/{~pern}|{pern}/, 'ern')
    .replace('{~sa}{~pe}', 'e');
};

const getSpellAoe = (aoe) => {
  const aoeDictionary = {
    '-': 67012,
    A: 66069,
    a: 66069,
    C: 67696,
    // D: 'Damier de %1 case',
    L: 66560,
    O: 67255,
    Q: 67503,
    T: 67608,
    U: 860249,
    V: 582358,
    X: 67503,
    G: 66064,
    '+': 458622,
    '*': 458613,
    p: 'case',
    P: 'case',
  };

  singleAoe = aoe?.rawZone.split(',')[0];
  newAoe = singleAoe?.substring(0, 1);
  aoeWidth = singleAoe?.substring(1, 10);
  if (!aoe || newAoe === 'P' || newAoe === 'p') {
    return null;
  } else {
    return {
      en: formatAoe(enData.texts[aoeDictionary[newAoe]], aoeWidth),
      fr: formatAoe(frData.texts[aoeDictionary[newAoe]], aoeWidth),
      de: formatAoe(deData.texts[aoeDictionary[newAoe]], aoeWidth),
      es: formatAoe(esData.texts[aoeDictionary[newAoe]], aoeWidth),
      it: formatAoe(itData.texts[aoeDictionary[newAoe]], aoeWidth),
      pt: formatAoe(ptData.texts[aoeDictionary[newAoe]], aoeWidth),
    };
  }
};

const getSpellRange = (min, max) => {
  return {
    minRange: min,
    maxRange: max,
  };
};

const getEffects = (effects) => {
  if (effects.length === 0) {
    return {};
  }

  const validModifiableKeys = Object.keys(modifiableEffectStrings);
  const modifiableEffect = [];
  let customEffects = { en: [], fr: [], de: [], es: [], it: [], pt: [] };
  // en: [], fr: [], de: [], es: [], it: [], pt: []

  effects.forEach((effect) => {
    if (validModifiableKeys.includes(String(effect.effectId))) {
      modifiableEffect.push({
        stat: modifiableEffectStrings[effect.effectId],
        minStat: effect.effectId === 5 || effect.effectId === 1020 ? null : effect.diceNum,
        maxStat: effect.effectId === 5 || effect.effectId === 1020 ? String(effect.diceNum) : effect.diceSide,
      });
    } else {
      const foundEffect = effectData.find((effectToFind) => effectToFind.id === effect.effectId);
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

      const exceptionStates = [1036, 280, 281, 290, 1035, 1036, 1045, 1181, 2022];

      const formatAndReplace = (translationId, dataset, lang) => {
        if (effect.effectId == 293) {
          const foundSpell = fullSpellList.find((spellToFind) => spellToFind.id == effect.diceNum);
          return dataset.texts[translationId]
            .replace('#1', dataset.texts[foundSpell.nameId])
            .replace('#3', effect.value);
        } else if (effect.effectId == 950 || effect.effectId == 951) {
          // console.log(value);
          const foundState = fullStateList.find((stateToFind) => stateToFind.id == effect.value);
          return dataset.texts[translationId].replace(
            '#3',
            foundState ? dataset.texts[foundState.nameId] : effect.value
          );
        } else if (exceptionStates.includes(effect.effectId)) {
          const foundSpell = fullSpellList.find((spellToFind) => spellToFind.id == effect.diceNum);
          return dataset.texts[translationId]
            .replace('#1', dataset.texts[foundSpell.nameId])
            .replace('#2', effect.diceSide)
            .replace('#3', effect.value);
        } else if (effect.diceNum > 12000) {
          return dataset.texts[translationId].replace('#2', effect.diceSide);
        } else if (effect.value > 12000) {
          const foundSpell = fullSpellList.find((spellToFind) => spellToFind.id == effect.value);
          return dataset.texts[translationId].replace('#2', dataset.texts[foundSpell.nameId]);
        } else {
          if (effect.diceSide === 0) {
            return dataset.texts[translationId]
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
              .replace('#1{~1~2 bis }#2 (Schaden)', `${effect.diceNum} (Schaden)`)
              .replace('#1{~1~2 a }#2 (daños)', `${effect.diceNum} (daños)`)
              .replace('#1{~1~2 a }#2 (danni)', `${effect.diceNum} (danni)`)
              .replace('#1{~1~2 a }#2 (danos)', `${effect.diceNum} (danos)`)
              .replace('#1', effect.diceNum)
              .concat('', calculateEffectDuration(effect.duration, lang));
            // .replace('#1', effect.diceNum);
          } else {
            return dataset.texts[translationId]
              .replace(/#1{~1~2 to -}#2|#1{~1~2 to }#2/, `${effect.diceNum} to ${effect.diceSide}`)
              .replace(/#1{~1~2 à -}#2|#1{~1~2 à }#2/, `${effect.diceNum} à ${effect.diceSide}`)
              .replace(/#1{~1~2 bis -}#2|#1{~1~2 bis }#2/, `${effect.diceNum} bis ${effect.diceSide}`)
              .replace(/#1{~1~2 a -}#2|#1{~1~2 a }#2/, `${effect.diceNum} a ${effect.diceSide}`)
              .replace('+#1{~1~2 bis +}#2', `${effect.diceNum} bis ${effect.diceSide}`)
              .replace('#1{~1~2 bis +}#2', `${effect.diceNum}`)
              .replace('{~p}{~z}', '')
              .replace('{~ps}{~zs}', 's')
              .replace('{~sa}{~pe}{~ze}', 'a')
              .replace('{~so}{~pi}{~zi}', 'o')
              .replace('#1{~1~2 to }#2 (damage)', `${effect.diceNum} to ${effect.diceSide} (damage)`)
              .replace('#1{~1~2 bis }#2 (Schaden)', `${effect.diceNum} bis ${effect.diceSide} (Schaden)`)
              .replace('#1{~1~2 a }#2 (daños)', `${effect.diceNum} a ${effect.diceSide} (daños)`)
              .replace('#1{~1~2 a }#2 (danni)', `${effect.diceNum} a ${effect.diceSide} (danni)`)
              .replace('#1{~1~2 a }#2 (danos)', `${effect.diceNum} a ${effect.diceSide} (danos)`)
              .replace('#1', effect.diceNum)
              .concat('', calculateEffectDuration(effect.duration, lang));
            // .replace('{~1~2 to -}#2', effect.diceSide);
            // .replace('#1', effect.diceNum);
          }
        }
      };
      customEffects = {
        en: [...customEffects.en, formatAndReplace(getTranslationId(effect.value), enData, 'en')],
        fr: [...customEffects.fr, formatAndReplace(getTranslationId(effect.value), frData, 'fr')],
        de: [...customEffects.de, formatAndReplace(getTranslationId(effect.value), deData, 'de')],
        es: [...customEffects.es, formatAndReplace(getTranslationId(effect.value), esData, 'es')],
        it: [...customEffects.it, formatAndReplace(getTranslationId(effect.value), itData, 'it')],
        pt: [...customEffects.pt, formatAndReplace(getTranslationId(effect.value), ptData, 'pt')],
      };

      Object.entries(customEffects).forEach((item) => {
        customEffects[item[0]] = item[1].filter((item) => item != '#1');
      });

      // console.log(customEffects);
    }
    // console.log(customEffects);
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
  108: 'HP restored',
  1020: 'Shield',
};

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
      console.log(spell.id);
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
            const effectArray = eff.effects.filter((item) =>
              Object.keys(modifiableEffectStrings).includes(String(item.effectId))
            );

            const aoeType = getSpellAoe(effectArray?.[0]);
            return {
              level: eff.minPlayerLevel ? String(eff.minPlayerLevel) : null,
              apCost: eff.apCost ? String(eff.apCost) : null,
              cooldown: eff.minCastInterval ? String(eff.minCastInterval) : null,
              baseCritRate: eff.criticalHitProbability ? String(eff.criticalHitProbability) : null,
              castsPerPlayer: eff.maxCastPerTarget ? String(eff.maxCastPerTarget) : null,
              castsPerTurn: eff.maxCastPerTurn ? String(eff.maxCastPerTurn) : null,
              needLos: eff.castTestLos,
              modifiableRange: eff.rangeCanBeBoosted,
              isLinear: eff.castInLine,
              needsFreeCell: eff.needFreeCell,
              aoeType: aoeType === {} ? null : aoeType,
              spellRange: getSpellRange(eff.minRange, eff.range),
              normalEffects: getEffects(eff.effects),
              criticalEffects: getEffects(eff.criticalEffect),
            };
          }),
        },
      ];
    });
    translatedSpells = [...translatedSpells, translatedClassSpells];
  });

  try {
    fs.unlinkSync('./output/translatedEffects.json');
  } catch (err) {
    console.error('No matching file');
  }

  fs.writeFileSync('./output/translatedEffects.json', JSON.stringify(translatedSpells));