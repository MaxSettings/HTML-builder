const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { stdin, stdout } = process;
const rl = readline.createInterface(stdin, stdout);

console.log('Hello! Start type your text');

rl.on('line', input => {
  if (input === 'exit') {
    console.log('Text input completed. Good luck!');
    rl.close();
  } else {
    // Проверка, существует ли файл для вывода
    fs.access(path.join(__dirname, 'output.txt'), fs.constants.F_OK, (err) => {
      if (err) {
        // Если не существует, то файл создается
        fs.writeFile(path.join(__dirname, 'output.txt'), '', (error) => {
          if (error) {
            return console.error(error.message);
          } 
        });
      };
  
      // Чтение файла
      fs.readFile(path.join(__dirname, 'output.txt'), (error) => {
        if (error) {
          return console.error(error.message);
        } 

        // Запись введенного текста в файл
        fs.appendFile(path.join(__dirname, 'output.txt'), input, (error) => {
          if (error) return console.error(error.message);
        });
      });
    });
  }
})

// Слушатель события нажатия Ctrl + C
rl.on('SIGINT', () => {
  console.log('Text input finished. Good luck!');
  rl.close();
});