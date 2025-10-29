const app = require('./app');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env.dev'), quiet: true });
const PORT = process.env.VITE_API_PORT || 3001;
if (!process.env.VITE_API_PORT) {
  console.warn('VITE_API_PORT is not set. Using default port 3001.');
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
