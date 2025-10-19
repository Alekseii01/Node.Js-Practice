import fs from 'fs';
import path from 'path';
import process from 'process';
import { Logger } from '../logger/logger.js';

const logger = new Logger('./generated-logs');

const args = process.argv.slice(2);
const typeArg = args.find(arg => arg.startsWith('--type='));
const filterType = typeArg ? typeArg.split('=')[1] : null;

if (args.includes('--help')) {
  console.log('Usage: node index.js [--type=success|error|info]');
  process.exit(0);
}

function analyzeLogs() {
  if (!fs.existsSync(logger.basePath)) {
    console.error('No logs found');
    return;
  }

  const folders = fs.readdirSync(logger.basePath);
  let stats = { success: 0, error: 0, info: 0 };

  for (const folder of folders) {
    const folderPath = path.join(logger.basePath, folder);
    if (!fs.lstatSync(folderPath).isDirectory()) continue;

    const files = fs.readdirSync(folderPath);
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      try {
        const content = fs.readFileSync(filePath, 'utf-8').trim();
        if (!content) continue;

        const log = JSON.parse(content);
        if (log.type && stats.hasOwnProperty(log.type)) {
          stats[log.type]++;
        }
      } catch {
        console.warn(`Skipping malformed file, ${filePath}`);
      }
    }
  }

  if (filterType) {
    if (!stats.hasOwnProperty(filterType)) {
      console.error(`Unknown log type, ${filterType}`);
      return;
    }
    console.log(`Filtered logs (${filterType}), ${stats[filterType]}`);
  } else {
    console.log('Log statistics,');
    console.log(stats);
  }
}

analyzeLogs();
