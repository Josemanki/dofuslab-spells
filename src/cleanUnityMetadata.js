import fs from 'fs';
import { join } from 'path';
import { writeOutput } from './utils.js';

const filenames = [
  'effects',
  'spell_levels',
  'spell_pairs',
  'spells',
  'spell_states',
  'spell_types',
  'spell_variants',
  'monsters',
];

const tempDir = join(process.cwd(), 'temp');

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

for (const filename of filenames) {
  console.log(`Cleaning Unity metadata on ${filename}.json`);
  const fileData = JSON.parse(
    fs.readFileSync(`./input/${filename}.json`, {
      encoding: 'utf-8',
    })
  );

  const cleanData = fileData.references.RefIds.map((refId) => refId.data);

  writeOutput(`./temp/${filename}.json`, cleanData);
}
