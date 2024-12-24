const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Endpoint to fetch Instagram media details
app.post('/api/download', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ success: false, error: 'URL is required.' });
  }

  try {
    // Fetch the Instagram page HTML
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
      },
    });

    const $ = cheerio.load(response.data);

    // Extract structured data from <script type="application/ld+json">
    const scriptTag = $('script[type="application/ld+json"]').html();
    if (!scriptTag) {
      return res.status(404).json({ success: false, error: 'Unable to find media metadata.' });
    }

    const jsonData = JSON.parse(scriptTag);

    // Determine type and extract URLs
    let type = 'unknown';
    let videoUrl = null;
    let imageUrl = null;

    if (jsonData['@type'] === 'VideoObject') {
      type = 'reel';
      videoUrl = jsonData.contentUrl;
    } else if (jsonData['@type'] === 'ImageObject') {
      type = 'post';
      imageUrl = jsonData.contentUrl;
    }

    if (!videoUrl && !imageUrl) {
      return res.status(404).json({ success: false, error: 'No media found for this URL.' });
    }

    return res.status(200).json({
      success: true,
      type,
      videoUrl,
      imageUrl,
    });
  } catch (error) {
    console.error('Error fetching Instagram media:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch Instagram media.' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, 'client', 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
  });
}

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
