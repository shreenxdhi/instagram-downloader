/**
 * server.js
 */

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Parse JSON in request bodies
app.use(express.json());

// POST /api/download
// Body: { url: "https://instagram.com/p/xxxx" }
// Returns: { success: true, videoUrl, imageUrl } or { success: false, error }
app.post('/api/download', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'Instagram URL is required.'
      });
    }

    // 1) Fetch HTML
    const response = await axios.get(url, {
      headers: {
        // Spoof a User-Agent to reduce chance of 429 blocks
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
          'AppleWebKit/537.36 (KHTML, like Gecko) ' +
          'Chrome/58.0.3029.110 Safari/537.36'
      }
    });
    const $ = cheerio.load(response.data);

    // 2) Attempt to extract from OG tags
    let videoUrl =
      $('meta[property="og:video:secure_url"]').attr('content') ||
      $('meta[property="og:video"]').attr('content') ||
      null;
    let imageUrl = $('meta[property="og:image"]').attr('content') || null;

    // 3) If no video from OG, parse window._sharedData (for Reels or other posts)
    if (!videoUrl) {
      const scriptTag = $('script')
        .filter((i, el) => {
          const html = $(el).html().trim();
          return html.startsWith('window._sharedData');
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
          const postPage =
            dataObj?.entry_data?.PostPage?.[0]?.graphql?.shortcode_media;
          if (postPage) {
            // Attempt to get the real video_url if it exists
            if (postPage.video_url) {
              videoUrl = postPage.video_url;
            }
            // If no OG image, try display_url (or largest resource)
            if (!imageUrl && postPage.display_url) {
              imageUrl = postPage.display_url;
            }

            // 4) If there's an array of display_resources, pick the largest
            if (postPage.display_resources && postPage.display_resources.length) {
              // The largest resource is usually the last
              const resources = postPage.display_resources;
              const largest = resources[resources.length - 1]?.src;
              // Override if we want the largest image
              if (largest) {
                imageUrl = largest;
              }
            }
          }
        } catch (err) {
          console.error('Error parsing window._sharedData JSON:', err);
        }
      }
    }

    // 5) If still no media found, return error
    if (!videoUrl && !imageUrl) {
      return res.status(404).json({
        success: false,
        error: 'No media found. Possibly a private link or changed structure.'
      });
    }

    // 6) Return results
    return res.status(200).json({
      success: true,
      videoUrl,
      imageUrl
    });
  } catch (err) {
    console.error('Error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to scrape Instagram. Please try again.'
    });
  }
});

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client', 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
  });
}

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
