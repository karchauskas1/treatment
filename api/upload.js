const { put } = require('@vercel/blob');

module.exports.config = {
  api: { bodyParser: { sizeLimit: '6mb' } }
};

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { slotId, image } = req.body;
    if (!slotId || !image) {
      return res.status(400).json({ error: 'Missing slotId or image' });
    }

    // image is base64 data URL, convert to buffer
    const matches = image.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: 'Invalid image format' });
    }

    const contentType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const ext = contentType.includes('png') ? 'png' : 'jpg';
    const filename = `treatment/${slotId}.${ext}`;

    const blob = await put(filename, buffer, {
      access: 'public',
      contentType,
      addRandomSuffix: false,
    });

    return res.status(200).json({ url: blob.url, slotId });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Upload failed' });
  }
};
