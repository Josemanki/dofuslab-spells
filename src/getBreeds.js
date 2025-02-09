import fs from 'fs';
import { BREED_TO_CLASS_MAP } from './constants.js';
import { writeOutput } from './utils.js';

const spellVariants = JSON.parse(
  fs.readFileSync('./temp/spell_variants.json', {
    encoding: 'utf-8',
  })
);

let orderedVariants = [];

console.log('Processing breeds...');

for (const breedId in BREED_TO_CLASS_MAP) {
  console.log(`Processing breed: ${BREED_TO_CLASS_MAP[breedId]}`);

  let breedSpellPairs = [];

  const breed = spellVariants.filter(
    (spellPair) => spellPair.breedId == breedId
  );

  breed.forEach((breed) => {
    breedSpellPairs = [...breedSpellPairs, breed.spellIds.Array];
  });

  orderedVariants = [
    ...orderedVariants,
    { breed: breedId, spells: breedSpellPairs },
  ];
}

writeOutput('./temp/breedList.json', orderedVariants);
