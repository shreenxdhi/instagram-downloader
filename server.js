/**
 * server.js
 */
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// ----------------------------------------------------
// POST /api/download
// Body: { url: "https://www.instagram.com/reel/.../" }
// ----------------------------------------------------
app.post('/api/download', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: 'Instagram URL is required.' });
    }

    // 1. Fetch the page HTML
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
          'AppleWebKit/537.36 (KHTML, like Gecko) ' +
          'Chrome/58.0.3029.110 Safari/537.36',
      },
    });
    const $ = cheerio.load(response.data);

    // 2. Attempt to extract metadata from OG tags
    let videoUrl =
      $('meta[property="og:video:secure_url"]').attr('content') ||
      $('meta[property="og:video"]').attr('content') ||
      null;
    let imageUrl = $('meta[property="og:image"]').attr('content') || null;

    // 3. Parse window._sharedData for detailed information
    let type = 'unknown';
    const scriptTag = $('script')
      .filter((i, el) => {
        const content = $(el).html().trim();
        return content.startsWith('window._sharedData');
      })
      .first()
      .html();

    if (scriptTag) {
      const jsonStr = scriptTag.substring(scriptTag.indexOf('{'), scriptTag.lastIndexOf('}') + 1);
      try {
        const dataObj = JSON.parse(jsonStr);
        const postPage = dataObj?.entry_data?.PostPage?.[0]?.graphql?.shortcode_media;

        if (postPage) {
          const { __typename, is_video } = postPage;

          // Determine type based on typename and is_video
          if (__typename === 'GraphVideo' && is_video) {
            type = 'reel';
            videoUrl = postPage.video_url || videoUrl;
          } else if (__typename === 'GraphImage' || __typename === 'GraphSidecar') {
            type = 'post';
            if (postPage.display_resources?.length) {
              const largestResource = postPage.display_resources.pop();
              imageUrl = largestResource?.src || imageUrl;
            }
          } else if (url.includes('/reel/')) {
            type = 'reel'; // Infer from URL structure
          }
        }
      } catch (err) {
        console.error('Error parsing JSON from window._sharedData:', err.message);
      }
    }

    // 4. If no media is found
    if (!videoUrl && !imageUrl) {
      return res.status(404).json({
        success: false,
        error: 'No media found. The link might be private or Instagram’s structure changed.',
      });
    }

    // 5. Return the media details and type
    return res.status(200).json({
      success: true,
      type,
      videoUrl,
      imageUrl,
    });
  } catch (err) {
    console.error('Error scraping Instagram:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch Instagram media. Please check the URL or try again later.',
    });
  }
});

// Serve React in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client', 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
  });
}

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
