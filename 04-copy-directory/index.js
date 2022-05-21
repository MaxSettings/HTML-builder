const fs = require('fs');
const path = require('path');

async function copyDir() {
  const srcDirPath = path.join(__dirname, 'files');
  const copyDirPath = path.join(__dirname, 'files-copy');

  const srcFiles = await (await fs.promises.readdir(srcDirPath, {withFileTypes: true})).filter(it => it.isFile()).map(it => it.name);

  const removeCopyDir = async () => {
    return new Promise((resolve, reject) => {
      fs.rmdir(copyDirPath, { recursive: true, force: true }, (err) => {
        if (err) {
          return reject(err.message);
        }
        resolve();
      })
    })
  }

  const createCopyDir = async () => {
    return new Promise((resolve, reject) => {
      fs.mkdir(copyDirPath, (err) => {
        if (err) {
          return reject(err.message);
        }
        resolve();
      })
    })
  }

  const copyFiles = async () => {
    return new Promise((resolve, reject) => {

    for (let file of srcFiles) {
      fs.copyFile(path.join(srcDirPath, file), path.join(copyDirPath, file), (err) => {
        if (err) {
          return reject(err.message);
        }
        resolve();
      });
    }
    })
  }

  fs.access(copyDirPath, fs.constants.F_OK, (err) => {
    if (err) {
      createCopyDir().then(() => copyFiles());
    } else {
      removeCopyDir().then(() => createCopyDir()).then(() => copyFiles());
    }
  })
}
copyDir();
