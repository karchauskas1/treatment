const { del, list } = require('@vercel/blob');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { slotId } = req.body;
    if (!slotId) {
      return res.status(400).json({ error: 'Missing slotId' });
    }

    // Find blob by prefix
    const { blobs } = await list({ prefix: `treatment/${slotId}` });
    if (blobs.length > 0) {
      await del(blobs.map(b => b.url));
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Delete error:', err);
    return res.status(500).json({ error: 'Delete failed' });
  }
};
