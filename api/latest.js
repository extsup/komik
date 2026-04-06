import { fetchShinigami, fetchKomikcast, fetchKiryuu, deduplicate } from './_utils.js';

export default async function handler(req, res) {
  const page     = parseInt(req.query.page || '1');
  const pageSize = parseInt(req.query.page_size || '24');

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    const [shn, kc, kry] = await Promise.allSettled([
      fetchShinigami({ page, pageSize, sort: 'latest' }),
      fetchKomikcast({ page, pageSize, sort: 'latest' }),
      fetchKiryuu({ page, pageSize, orderby: 'modified' }),
    ]);

    console.log('SHN:', shn.status, shn.status === 'rejected' ? shn.reason?.message : shn.value?.length + ' items');
    console.log('KC:', kc.status, kc.status === 'rejected' ? kc.reason?.message : kc.value?.length + ' items');
    console.log('KRY:', kry.status, kry.status === 'rejected' ? kry.reason?.message : kry.value?.length + ' items');

    const all = [
      ...(shn.status === 'fulfilled' ? shn.value : []),
      ...(kc.status  === 'fulfilled' ? kc.value  : []),
      ...(kry.status === 'fulfilled' ? kry.value : []),
    ];

    const data = deduplicate(all).sort((a, b) => {
      const ta = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const tb = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return tb - ta;
    });

    res.json({ data, hasNextPage: data.length >= pageSize });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
