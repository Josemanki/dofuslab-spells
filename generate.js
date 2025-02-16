import { execSync } from 'child_process';
import { cleanTempDirectory } from './src/utils.js';

const args = process.argv.slice(2);
const keepTempFiles = args.includes('--keep-temp-files');

function runScript(script, args) {
  const argsString = args ? args.join(' ') : '';
  execSync(`node ${script} ${argsString}`, { stdio: 'inherit' });
}

runScript('src/cleanUnityMetadata.js');
runScript('src/getBreeds.js');
runScript('src/getNameAndDescription.js');
runScript('src/getEffectList.js');
runScript('src/getSpellLevels.js', args);

if (!keepTempFiles) {
  cleanTempDirectory();
}
