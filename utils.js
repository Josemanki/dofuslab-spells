import fs from 'fs';

export const writeOutput = (path, data) => {
    try {
        fs.unlinkSync(path);
    } catch (err) {
        console.error('No matching file');
    }

    fs.writeFileSync(path, JSON.stringify(data));
}