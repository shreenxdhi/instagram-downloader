const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.post('/api/download', async (req, res) => {
  const { url } = req.body;

  if (!url || !url.startsWith('https://www.instagram.com/')) {
    return res.status(400).json({ success: false, error: 'Invalid Instagram URL.' });
  }

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
      },
    });

    const $ = cheerio.load(response.data);

    // Extract video or image URL
    const videoMeta = $('meta[property="og:video"]').attr('content');
    const imageMeta = $('meta[property="og:image"]').attr('content');

    if (videoMeta) {
      return res.status(200).json({
        success: true,
        type: 'reel',
        videoUrl: videoMeta,
        imageUrl: null,
      });
    } else if (imageMeta) {
      return res.status(200).json({
        success: true,
        type: 'post',
        videoUrl: null,
        imageUrl: imageMeta,
      });
    } else {
      return res.status(404).json({ success: false, error: 'Unable to find media metadata.' });
    }
  } catch (error) {
    console.error('Error fetching Instagram media:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch Instagram media.' });
  }
});

if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, 'client', 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
  });
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
