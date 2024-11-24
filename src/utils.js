import fs from 'fs';

export const writeOutput = (path, data) => {
  try {
    fs.unlinkSync(path);
  } catch (err) {
    console.error(`No matching file for ${path}, creating...`);
  }

  fs.writeFileSync(path, JSON.stringify(data));
};

export const cleanTempDirectory = () => {
  console.log('Cleaning temp directory...');
  fs.rm('./temp', { recursive: true }, (err) => {
    if (err) {
      console.error(err);
    }
  });
};
