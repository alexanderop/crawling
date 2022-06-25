import fs from 'fs';
import path from 'path';

// function that generates a new file with the current date and saves messages in it
const logger = (message) => {
  const date = new Date();
  const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  const fileName = `${dateString}.txt`;
  const baseDir = path.join(path.resolve(), './logs');
  const filePath = path.join(baseDir, fileName);

  // create new file
  fs.writeFileSync(filePath, message);
  // fs.appendFile(filePath, message, (err) => {
  //     if (err) throw err;
  // }
  // );
};

export default logger;
