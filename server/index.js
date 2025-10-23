const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 4000;
const DATA_DIR = path.join(__dirname, 'data');

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  })
);
app.use(express.json());

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

app.get('/articles', async (req, res) => {
  try {
    const files = await fs.readdir(DATA_DIR);
    const articlePromises = files.map(async (file) => {
      if (file.endsWith('.json')) {
        const id = path.basename(file, '.json');
        const article = await readArticleFile(id);
        if (article) {
          return { id: article.id, title: article.title };
        }
      }
      return null;
    });

    const articles = (await Promise.all(articlePromises)).filter(Boolean);
    res.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ message: 'Failed to fetch articles.' });
  }
});

app.get('/articles/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const article = await readArticleFile(id);
    if (article) {
      res.json(article);
    } else {
      res.status(404).json({ message: 'Article not found.' });
    }
  } catch (error) {
    console.error(`Error fetching article ${id}:`, error);
    res.status(500).json({ message: 'Failed to retrieve article.' });
  }
});

app.post('/articles', async (req, res) => {
  const { title, content } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ message: 'Title is required.' });
  }
  if (!content || content.trim() === '') {
    return res.status(400).json({ message: 'Content is required.' });
  }

  const id = uuidv4();
  const newArticle = { id, title: title.trim(), content: content.trim() };
  const filePath = path.join(DATA_DIR, `${id}.json`);

  try {
    await fs.writeFile(filePath, JSON.stringify(newArticle, null, 2), 'utf8');
    res
      .status(201)
      .json({
        id: newArticle.id,
        title: newArticle.title,
        message: 'Article created successfully.',
      });
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ message: 'Failed to create article.' });
  }
});

ensureDataDirectory().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
