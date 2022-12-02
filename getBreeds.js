const fs = require('fs');

const spellVariants = JSON.parse(
  fs.readFileSync('./input/SpellVariants.json', {
    encoding: 'utf-8',
  })
);

let orderedVariants = [];

for (let i = 1; i <= 20; i++) {
  const breed = spellVariants.filter((spellPair) => spellPair.breedId === i && spellPair.breedId != 19);
  let unifiedBreed = [];
  console.log(breed);
  breed.forEach((breed) => {
    unifiedBreed = [...unifiedBreed, ...breed.spellIds];
  });
  orderedVariants = [...orderedVariants, { breed: i, spells: unifiedBreed }];
}

try {
  fs.unlinkSync('./temp/breedList.json');
} catch (err) {
  console.error('No matching file');
}

fs.writeFileSync('./temp/breedList.json', JSON.stringify(orderedVariants));
