const fs = require('fs');
const path = require('path');

async function getFilesList() {
  const files = await (await fs.promises.readdir(path.join(__dirname, 'secret-folder'), {withFileTypes: true})).filter(it => it.isFile()).map(it => it.name);

  for (let file of files) {
    let filePath = path.join(__dirname, 'secret-folder', file);
    let fileExt = path.extname(filePath);

    fs.stat(filePath, async (err, stats) => {
      if (err) console.log(err);
      console.log(`${path.basename(filePath, fileExt)} - ${fileExt.slice(1)} - ${stats.size}b`);
    });
  }
};

getFilesList();