const path = require('path');
const promises = require('fs/promises');
const srcDirPath = path.join(__dirname, 'styles');
const bundlePath = path.join(__dirname, 'project-dist', 'bundle.css');

const createCssBundle = async () => {
  let bundleStyles = '';
  const srcFiles = await promises.readdir(srcDirPath, {withFileTypes: true});

  for(let i = 0; i < srcFiles.length; i++) {
    if (!srcFiles[i].isFile() || path.extname(srcFiles[i].name) !== '.css') {
      srcFiles.splice(i, 1);
    }
  }

  for (let i = 0; i < srcFiles.length; i++) {
    let filePath = path.join(srcDirPath, srcFiles[i].name);
    bundleStyles += await promises.readFile(filePath, 'utf-8');
  }
  promises.writeFile(bundlePath, bundleStyles);
}

createCssBundle();

