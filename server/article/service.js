const fs = require('fs/promises');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

async function ensureDataDirectory() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    console.log('Data directory ensured.');
  } catch (error) {
    console.error('Failed to ensure data directory:', error);
  }
}

async function readArticleFile(id) {
  const filePath = path.join(DATA_DIR, `${id}.json`);
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function writeArticleFile(id, article) {
  const filePath = path.join(DATA_DIR, `${id}.json`);
  try {
    await fs.writeFile(filePath, JSON.stringify(article, null, 2), 'utf8');
  } catch (error) {
    throw error;
  }
}

async function deleteArticleFile(id) {
  const filePath = path.join(DATA_DIR, `${id}.json`);
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
  return true;
}

async function getAllArticleIds() {
  try {
    const files = await fs.readdir(DATA_DIR);
    return files.filter(file => file.endsWith('.json')).map(file => path.basename(file, '.json'));
  } catch (error) {
    throw error;
  }
}

module.exports = {
  ensureDataDirectory,
  readArticleFile,
  writeArticleFile,
  deleteArticleFile,
  getAllArticleIds,
};