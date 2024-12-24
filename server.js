const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Endpoint to fetch Instagram media details
app.post('/api/download', async (req, res) => {
  const { url } = req.body;

  if (!url || !url.startsWith('https://www.instagram.com/')) {
    return res.status(400).json({ success: false, error: 'Invalid Instagram URL.' });
  }

  try {
    console.log(`Fetching Instagram URL: ${url}`); // Log the URL being processed

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
      },
    });

    const $ = cheerio.load(response.data);

    // Debugging: Log the first 500 characters of the HTML
    console.log($.html().substring(0, 500));

    // Try extracting metadata from structured JSON
    const scriptTag = $('script[type="application/ld+json"]').html();
    let jsonData;
    if (scriptTag) {
      try {
        jsonData = JSON.parse(scriptTag);
        console.log('Parsed JSON Data:', jsonData); // Log the parsed JSON data
      } catch (err) {
        console.log('Error parsing JSON metadata:', err.message);
      }
    }

    // Check for video or image type in JSON metadata
    let type = 'unknown';
    let videoUrl = null;
    let imageUrl = null;

    if (jsonData && jsonData['@type'] === 'VideoObject') {
      type = 'reel';
      videoUrl = jsonData.contentUrl;
    } else if (jsonData && jsonData['@type'] === 'ImageObject') {
      type = 'post';
      imageUrl = jsonData.contentUrl;
    }

    // Fallback to scraping meta tags for video/image URLs
    if (!videoUrl && !imageUrl) {
      const videoMetaTag = $('meta[property="og:video"]').attr('content');
      const imageMetaTag = $('meta[property="og:image"]').attr('content');

      if (videoMetaTag) {
        type = 'reel';
        videoUrl = videoMetaTag;
      } else if (imageMetaTag) {
        type = 'post';
        imageUrl = imageMetaTag;
      }
    }

    // If no media found
    if (!videoUrl && !imageUrl) {
      console.log('No media found for this URL.');
      return res.status(404).json({ success: false, error: 'Unable to find media metadata.' });
    }

    // Return the result
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
