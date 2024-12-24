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
// Body: { url: "https://www.instagram.com/p/.../" }
// ----------------------------------------------------
app.post('/api/download', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: 'Instagram URL is required.' });
    }

    // 1) Fetch the page HTML
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
          'AppleWebKit/537.36 (KHTML, like Gecko) ' +
          'Chrome/58.0.3029.110 Safari/537.36',
      },
    });
    const $ = cheerio.load(response.data);

    // 2) Attempt from OG tags first
    let videoUrl =
      $('meta[property="og:video:secure_url"]').attr('content') ||
      $('meta[property="og:video"]').attr('content') ||
      null;
    let imageUrl = $('meta[property="og:image"]').attr('content') || null;

    // 3) If no OG video, parse window._sharedData for Reels or GraphVideo
    if (!videoUrl) {
      const scriptTag = $('script')
        .filter((i, el) => {
          const content = $(el).html().trim();
          return content.startsWith('window._sharedData');
        })
        .first()
        .html();

      if (scriptTag) {
        const jsonStr = scriptTag.substring(
          scriptTag.indexOf('{'),
          scriptTag.lastIndexOf('}') + 1
        );

        try {
          const dataObj = JSON.parse(jsonStr);
          const postPage = dataObj?.entry_data?.PostPage?.[0]?.graphql?.shortcode_media;
          if (postPage) {
            // Check if it's a video / reel
            if (postPage.is_video === true && postPage.video_url) {
              videoUrl = postPage.video_url;
            }

            // If still no video, it may be an image post (or a multi-photo carousel).
            if (!videoUrl) {
              // Attempt to get highest-res image
              if (postPage.display_url) {
                imageUrl = postPage.display_url;
              }
              if (postPage.display_resources?.length) {
                const resources = postPage.display_resources;
                const largest = resources[resources.length - 1].src;
                imageUrl = largest || imageUrl;
              }
            }
          }
        } catch (err) {
          console.error('Error parsing window._sharedData JSON:', err);
        }
      }
    }

    // 4) If we still have no media
    if (!videoUrl && !imageUrl) {
      return res.status(404).json({
        success: false,
        error: 'No media found. Possibly private or changed structure.',
      });
    }

    // 5) Respond with the found URLs
    return res.status(200).json({ success: true, videoUrl, imageUrl });
  } catch (err) {
    console.error('Error scraping Instagram:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to download media. Please check the URL or try again.',
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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
