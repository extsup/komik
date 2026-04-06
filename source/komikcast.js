import { KOMIKCAST } from '../api/_utils.js';

export default async function handler(req, res) {
  const path = req.query.path || '/series?includeMeta=true&sort=latest&sortOrder=desc&take=24&page=1';

  try {
    const response = await fetch(`${KOMIKCAST}${path}`, {
      headers: {
        'Origin':     'https://v1.komikcast.fit',
        'Referer':    'https://v1.komikcast.fit/',
        'Accept':     'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    const data = await response.text();

    res.setHeader('Content-Type', 'application/json');
    res.status(response.status).send(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
