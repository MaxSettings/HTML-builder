const path = require('path');
const fs = require('fs');
const promises = require('fs/promises');

const distDirPath = path.join(__dirname, 'project-dist');
const tempPath = path.join(__dirname, 'template.html');
const componentsPath = path.join(__dirname, 'components');
const srcStylesDirPath = path.join(__dirname, 'styles');
const srcAssetsDirPath = path.join(__dirname, 'assets');
const distAssetsDirPath = path.join(__dirname, 'project-dist/assets');

// Функция удаления папки project-dist
const deleteDistDir = async () => {
  return new Promise((resolve, reject) => {
    fs.rmdir(distDirPath, { recursive: true, force: true }, (err) => {
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

  templateReadableStream.on('data', (chunk) => { 
    template = chunk.toString();
    fs.readdir(componentsPath, (err, components) => {
      if (err) {
        throw err;
      }

      components.forEach(component => {

        let componentReadableStream = fs.createReadStream(path.join(componentsPath, component));

        componentReadableStream.on('data', (chunk) => {

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
// Функция создания файла style.css
const createCssFile = async () => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path.join(distDirPath, 'style.css'), '', (err) => {
      if (err) {
        return reject(err.message);
      }
      resolve();
    })
  })
}
// Функция добавление стилей в общий файл
const addStylesToBundle = async () => {
  await (await fs.promises.readdir(srcStylesDirPath, {withFileTypes: true})).filter(it => it.isFile()).map(it => it.name).forEach(it => {
    let filePath = path.join(srcStylesDirPath, it);
    let fileExt = path.extname(filePath);
    if (fileExt === '.css') {
      fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
          throw err;
        }

        let codeToAdd = `${data}\n`;
        
        fs.appendFile(path.join(distDirPath, 'style.css'), codeToAdd, 'utf-8', (err) => {
          if (err) {
            throw err;
          }
        })
      });
    }
  })
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
    .then(() => createCssFile())
    .then(() => addDistHtmlFile())
    .then(() => addStylesToBundle())
    .then(() => copyDir(srcAssetsDirPath, distAssetsDirPath));
  } else {
    deleteDistDir()
    .then(() => createDistDir())
    .then(() => createCssFile())
    .then(() => addDistHtmlFile())
    .then(() => addStylesToBundle())
    .then(() => copyDir(srcAssetsDirPath, distAssetsDirPath));
  }
})