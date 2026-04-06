import { KIRYUU, decodeHtml } from '../api/_utils.js';

const AJAX = `${KIRYUU}/wp-admin/admin-ajax.php`;

const headers = {
  'Origin':     'https://v2.kiryuu.to',
  'Referer':    'https://v2.kiryuu.to/',
  'Accept':     'application/json, text/html',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

export default async function handler(req, res) {
  const path     = req.query.path;
  const action   = req.query.action;
  const manga_id = req.query.manga_id;

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    // Chapter list
    if (action === 'chapter_list' && manga_id) {
      let numericId = manga_id;

      if (isNaN(manga_id)) {
        const wpRes  = await fetch(`${KIRYUU}/wp-json/wp/v2/manga?slug[]=${manga_id}&_fields=id`, { headers });
        const wpData = await wpRes.json();
        numericId    = wpData?.[0]?.id;
        if (!numericId) return res.json({ data: [] });
      }

      const url  = `${AJAX}?manga_id=${numericId}&page=999&action=chapter_list`;
      const html = await fetch(url, { headers }).then(r => r.text());

      const chapters = [];
      const linkRe = /href="(https:\/\/v2\.kiryuu\.to\/manga\/[^"]+)"/g;
      const nameRe = /<span>([^<]+)<\/span>/g;
      const dateRe = /datetime="([^"]+)"/g;

      const links = [...html.matchAll(linkRe)].map(m => m[1]);
      const names = [...html.matchAll(nameRe)].map(m => m[1].trim());
      const dates = [...html.matchAll(dateRe)].map(m => m[1]);

      links.forEach((link, i) => {
        chapters.push({
          url:  link,
          name: names[i] || `Chapter ${i + 1}`,
          date: dates[i] || '',
        });
      });

      return res.json({ data: chapters });
    }

    // WP JSON API
    const wpPath   = path || '/wp-json/wp/v2/manga?per_page=24&page=1&orderby=modified&order=desc&_embed';
    const response = await fetch(`${KIRYUU}${wpPath}`, { headers });
    const data     = await response.json();

    // Fix class_list — konversi object {} jadi array []
    const fixed = Array.isArray(data) ? data.map(item => ({
      ...item,
      class_list: Array.isArray(item.class_list)
        ? item.class_list
        : item.class_list && typeof item.class_list === 'object'
          ? Object.values(item.class_list)
          : [],
      title: {
        ...item.title,
        rendered: decodeHtml(item.title?.rendered || ''),
      },
    })) : data;

    res.status(response.status).json(fixed);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
