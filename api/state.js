const { put, list } = require('@vercel/blob');

// Increase body size limit to 10MB
module.exports.config = {
  api: { bodyParser: { sizeLimit: '10mb' } }
};

module.exports = async function handler(req, res) {
  const stateKey = 'treatment/page-state.json';

  if (req.method === 'GET') {
    // Load saved state
    try {
      const { blobs } = await list({ prefix: stateKey });
      if (blobs.length === 0) {
        return res.status(200).json({ state: null });
      }
      // Fetch the actual content
      const response = await fetch(blobs[0].url);
      const state = await response.json();
      return res.status(200).json({ state });
    } catch (err) {
      console.error('Load state error:', err);
      return res.status(200).json({ state: null });
    }
  }

  if (req.method === 'POST') {
    // Save state
    try {
      const { html } = req.body;
      if (!html) {
        return res.status(400).json({ error: 'Missing html' });
      }

      const blob = await put(stateKey, JSON.stringify({ html, savedAt: Date.now() }), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
      });

      return res.status(200).json({ ok: true, url: blob.url });
    } catch (err) {
      console.error('Save state error:', err);
      return res.status(500).json({ error: 'Save failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
