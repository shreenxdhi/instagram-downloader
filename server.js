const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());

// -------------------------------
// ROUTE: /api/download
// -------------------------------
// Expects a JSON body: { url: "INSTAGRAM_POST_URL" }
// Returns a JSON object:
// { success: true, videoUrl: "...", imageUrl: "..." } OR { success: false, error: "..." }
app.post('/api/download', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: 'Instagram URL is required.' });
    }

    // Fetch the HTML of the Instagram post/reel
    const response = await axios.get(url, {
      headers: {
        // Spoof a User-Agent to avoid request blocks
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
                      '(KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);

    // Attempt to extract video or image from meta tags
    const videoUrl = $('meta[property="og:video"]').attr('content') || null;
    const imageUrl = $('meta[property="og:image"]').attr('content') || null;

    if (!videoUrl && !imageUrl) {
      return res.status(404).json({
        success: false,
        error: 'No media found. The link might be invalid or private.'
      });
    }

    return res.status(200).json({
      success: true,
      videoUrl,
      imageUrl
    });
  } catch (error) {
    console.error('Error fetching Instagram URL:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to download media. Please check the URL or try again later.'
    });
  }
});

// -------------------------------
// Serve static files (React build) in production
// -------------------------------
if (process.env.NODE_ENV === 'production') {
  // Serve the static files from the React app
  app.use(express.static(path.join(__dirname, 'client', 'build')));

  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
