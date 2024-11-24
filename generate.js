import { execSync } from 'child_process';

function runScript(script) {
  execSync(`node ${script}`, { stdio: 'inherit' });
}

runScript('src/cleanUnityMetadata.js');
runScript('src/getBreeds.js');
runScript('src/getNameAndDescription.js');
runScript('src/getEffectList.js');
runScript('src/getSpellLevels.js');
