const { list } = require('@vercel/blob');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { blobs } = await list({ prefix: 'treatment/' });

    const images = {};
    for (const blob of blobs) {
      // Extract slotId from pathname: "treatment/slot_3.jpg" -> "slot_3"
      const match = blob.pathname.match(/treatment\/(.+)\.\w+$/);
      if (match) {
        images[match[1]] = blob.url;
      }
    }

    return res.status(200).json(images);
  } catch (err) {
    console.error('List error:', err);
    return res.status(500).json({ error: 'Failed to list images' });
  }
};
