const path = require('path');
const fs = require('fs');
const srcDirPath = path.join(__dirname, 'styles');
const bundlePath = path.join(__dirname, 'project-dist', 'bundle.css');

const addStylesToBundle = async () => {
  const srcFiles = await (await fs.promises.readdir(srcDirPath, {withFileTypes: true})).filter(it => it.isFile()).map(it => it.name).forEach(it => {
    let filePath = path.join(srcDirPath, it);
    let fileExt = path.extname(filePath);
    if (fileExt === '.css') {
      fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
          throw err;
        }

        let codeToAdd = `${data}\n`;
        
        fs.appendFile(bundlePath, codeToAdd, 'utf-8', (err) => {
          if (err) {
            throw err;
          }
        })
      });
    }
  })

  
}

const deleteBundleFile = async () => {
  return new Promise((resolve, reject) => {
    fs.unlink(bundlePath, (err) => {
      if (err) {
        return reject(err.message);
      }
      resolve();
    })
  })
}

const createBundleFile = async () => {
  return new Promise((resolve, reject) => {
    fs.writeFile(bundlePath, '', (err) => {
      if (err) {
        return reject(err.message);
      }
      resolve();
    })
  })
}

fs.access(bundlePath, fs.constants.F_OK, (err) => {
  if (err) {
    createBundleFile().then(() => addStylesToBundle());
  } else {
    deleteBundleFile().then(() => createBundleFile()).then(() => addStylesToBundle());
  }
})
