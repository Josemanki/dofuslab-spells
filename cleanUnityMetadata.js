const fs = require('fs');

const filenames = [
    'EffectsRoot',
    'SpellConversionsRoot',
    'SpellLevelsRoot',
    'SpellPairsRoot',
    'SpellsRoot',
    'SpellStatesRoot',
    'SpellTypesRoot',
    'SpellVariantsRoot',
]

for (const filename of filenames) {
    console.log(`Cleaning ${filename}.json`);
    const fileData = JSON.parse(
        fs.readFileSync(`./input/${filename}.json`, {
            encoding: 'utf-8',
        })
    );

    const cleanData = fileData.references.RefIds.map((refId) => refId.data)

    try {
        fs.unlinkSync(`./temp/Cleaned/${filename}.json`);
    } catch (err) {
        console.error('No matching file');
    }

    fs.writeFileSync(`./temp/Cleaned/${filename}.json`, JSON.stringify(cleanData));
}