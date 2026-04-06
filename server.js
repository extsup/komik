import express from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Aggregator routes
import latestHandler  from './api/latest.js';
import popularHandler from './api/popular.js';
import searchHandler  from './api/search.js';

// Source proxy routes
import shinigamiHandler from './source/shinigami.js';
import kiryuuHandler    from './source/kiryuu.js';
import komikcastHandler from './source/komikcast.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ─── CORS middleware ──────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ─── Aggregator ───────────────────────────────────────────────────────────────
app.get('/api/latest',  latestHandler);
app.get('/api/popular', popularHandler);
app.get('/api/search',  searchHandler);

// ─── Source proxy ─────────────────────────────────────────────────────────────
app.get('/api/shinigami', shinigamiHandler);
app.get('/api/kiryuu',    kiryuuHandler);
app.get('/api/komikcast', komikcastHandler);

// ─── Frontend ─────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
