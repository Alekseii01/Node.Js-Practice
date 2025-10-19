import fs from 'fs';
import path from 'path';

export class Logger {
  constructor(basePath = './logs') {
    this.basePath = basePath;
    if (!fs.existsSync(basePath)) fs.mkdirSync(basePath, { recursive: true });
  }

  generateLogEntry() {
    const types = ['success', 'error', 'info'];
    const type = types[Math.floor(Math.random() * types.length)];
    const timestamp = new Date().toISOString();
    const message = `This is a ${type} log message.`;
    return JSON.stringify({ timestamp, type, message });
  }

  writeLog(filePath, content) {
    fs.appendFileSync(filePath, content + '\n');
  }
}
