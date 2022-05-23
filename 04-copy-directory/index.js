const fs = require('fs');
const path = require('path');
const promises = require('fs/promises');
const filesDirPath = path.join(__dirname, 'files');
const copyDirPath = path.join(__dirname, 'files-copy');

const copyDir = async (srcDirName, copyDirName) => {

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
    let files = await promises.readdir(srcDirName, {withFileTypes: true});

    for (let i = 0; i < files.length; i ++) {
      if (files[i].isFile()) {

        let srcFile = path.join(srcDirName, files[i].name);
        let copyFile = path.join(copyDirName, files[i].name);
        
        await promises.copyFile(srcFile, copyFile);
      } else {
        copyDir(path.join(srcDirName, files[i].name), path.join(copyDirName, files[i].name));
      }
    }
  }

  fs.access(copyDirPath, fs.constants.F_OK, (err) => {
    if (err) {
      createCopyDir().then(() => copyFiles());
    } else {
      removeCopyDir().then(() => createCopyDir()).then(() => copyFiles());
    }
  })
}

copyDir(filesDirPath, copyDirPath);


