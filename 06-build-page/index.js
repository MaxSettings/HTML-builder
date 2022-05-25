const path = require('path');
const fs = require('fs');
const promises = require('fs/promises');

const distDirPath = path.join(__dirname, 'project-dist');
const tempPath = path.join(__dirname, 'template.html');
const componentsPath = path.join(__dirname, 'components');
const srcStylesDirPath = path.join(__dirname, 'styles');
const bundlePath = path.join(distDirPath, 'style.css');
const srcAssetsDirPath = path.join(__dirname, 'assets');
const distAssetsDirPath = path.join(__dirname, 'project-dist/assets');

// Функция удаления папки project-dist
const deleteDistDir = async () => {
  return new Promise((resolve, reject) => {
    fs.rm(distDirPath, { recursive: true, force: true }, (err) => {
      if (err) {
        return reject(err.message);
      }
      resolve();
    })
  })
}
// Функция создания папки project-dist
const createDistDir = async () => {
  return new Promise((resolve, reject) => {
    fs.mkdir(distDirPath, (err) => {
      if (err) {
        return reject(err.message);
      }
      resolve();
    })
  })
}
// Функция добавления итоговой html-разметки
const addDistHtmlFile = async () => {
  let templateReadableStream = fs.createReadStream(tempPath, "utf8");

  templateReadableStream.on('data', async (chunk) => { 
    template = chunk.toString();
    fs.readdir(componentsPath, async (err, components) => {
      if (err) {
        throw err;
      }

      components.forEach(component => {

        let componentReadableStream = fs.createReadStream(path.join(componentsPath, component));

        componentReadableStream.on('data', async (chunk) => {

          template = template.replace(`{{${component.slice(0, component.length - 5)}}}`, chunk);
          
          fs.writeFile(path.join(distDirPath, 'index.html'), template, (err) => {
            if (err) {
              throw err;
            }
          });
        });
      });
    });
  });
}
// Функция добавление стилей в общий файл
const createCssBundle = async () => {
  let bundleStyles = '';
  const srcFiles = await promises.readdir(srcStylesDirPath, {withFileTypes: true});

  for(let i = 0; i < srcFiles.length; i++) {
    if (!srcFiles[i].isFile() || path.extname(srcFiles[i].name) !== '.css') {
      srcFiles.splice(i, 1);
    }
  }

  for (let i = 0; i < srcFiles.length; i++) {
    let filePath = path.join(srcStylesDirPath, srcFiles[i].name);
    bundleStyles += await promises.readFile(filePath, 'utf-8');
  }
  promises.writeFile(bundlePath, bundleStyles);
}
// Функция копирования папки
const copyDir = async (srcDirName, copyDirName) => {
  await promises.mkdir(copyDirName, {recursive: true});

  let files = await promises.readdir(srcDirName, {withFileTypes: true});

  for(let i = 0; i < files.length; i ++) {
    if (files[i].isFile()) {

      let srcFile = path.join(srcDirName, files[i].name);
      let copyFile = path.join(copyDirName, files[i].name);

      await promises.copyFile(srcFile, copyFile);
    } else {
      copyDir(path.join(srcDirName, files[i].name), path.join(copyDirName, files[i].name));
    }
  }
}
// Обновление папки project-dist
fs.access(distDirPath, fs.constants.F_OK, (err) => {
  if (err) {
    createDistDir()
    .then(() => addDistHtmlFile())
    .then(() => createCssBundle())
    .then(() => copyDir(srcAssetsDirPath, distAssetsDirPath));
  } else {
    deleteDistDir()
    .then(() => createDistDir())
    .then(() => addDistHtmlFile())
    .then(() => createCssBundle())
    .then(() => copyDir(srcAssetsDirPath, distAssetsDirPath));
  }
})