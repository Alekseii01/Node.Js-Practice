import fs from 'fs';
import path from 'path';
import { Logger } from '../logger/logger.js';

const logger = new Logger('./generated-logs');

let currentFolder = '';

function createNewFolder() {
  const folderName = new Date().toISOString().replace(/[:.]/g, '-');
  currentFolder = path.join(logger.basePath, folderName);
  fs.mkdirSync(currentFolder, { recursive: true });
  console.log(`Created folder, ${currentFolder}`);
}

createNewFolder();
setInterval(createNewFolder, 60 * 1000);

setInterval(() => {
  if (!currentFolder) return;

  const fileName = `log-${Date.now()}.txt`;
  const filePath = path.join(currentFolder, fileName);

  const logEntry = logger.generateLogEntry();
  logger.writeLog(filePath, logEntry);

  console.log(`Wrote log file, ${fileName}`);
}, 10 * 1000);
