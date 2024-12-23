const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());

// ---------------------------------------------------------------------
// POST /api/download
// ---------------------------------------------------------------------
// Body: { url: 'https://www.instagram.com/.../' }
// Returns:
//   { success: true, videoUrl, imageUrl } or { success: false, error }
// ---------------------------------------------------------------------
app.post('/api/download', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: 'Instagram URL is required.' });
    }

    // Fetch the HTML of the Instagram post or reel
    const response = await axios.get(url, {
      headers: {
        // Spoof a User-Agent to reduce chances of being blocked
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
          'AppleWebKit/537.36 (KHTML, like Gecko) ' +
          'Chrome/58.0.3029.110 Safari/537.36',
      },
    });

    const $ = cheerio.load(response.data);

    // 1. Attempt to extract video or image from standard OG tags
    let videoUrl =
      $('meta[property="og:video:secure_url"]').attr('content') ||
      $('meta[property="og:video"]').attr('content') ||
      null;
    let imageUrl = $('meta[property="og:image"]').attr('content') || null;

    // 2. If no video in OG tags, parse window._sharedData from a <script> tag
    if (!videoUrl) {
      const scriptTag = $('script')
        .filter((i, el) => {
          // Look for the script that starts with "window._sharedData"
          return $(el).html().trim().startsWith('window._sharedData');
        })
        .first()
        .html();

      if (scriptTag) {
        // Extract JSON substring: from first '{' up to the last '}'
        const jsonStr = scriptTag.substring(
          scriptTag.indexOf('{'),
          scriptTag.lastIndexOf('}') + 1
        );
        try {
          // Parse the JSON to access the media details
          const dataObj = JSON.parse(jsonStr);

          // Typically, we find the media URL under:
          // dataObj.entry_data.PostPage[0].graphql.shortcode_media
          const postPage = dataObj?.entry_data?.PostPage?.[0]?.graphql?.shortcode_media;
          if (postPage) {
            // If the post is a video or a reel, 'video_url' may exist
            videoUrl = postPage.video_url || null;
            // If we didn't get an image from OG tags, try fallback to 'display_url'
            imageUrl = imageUrl || postPage.display_url || null;

            // If it's a multi-photo or multi-video carousel:
            // you might need to parse postPage.edge_sidecar_to_children.edges
            // for multiple media items.
          }
        } catch (err) {
          console.error('JSON parse error:', err);
        }
      }
    }

    // 3. If we still don't have a video or image, return an error
    if (!videoUrl && !imageUrl) {
      return res.status(404).json({
        success: false,
        error: 'No media found. The link might be invalid, private, or structure changed.',
      });
    }

    // 4. Return the found media
    return res.status(200).json({
      success: true,
      videoUrl,
      imageUrl,
    });
  } catch (error) {
    console.error('Error fetching Instagram URL:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to download media. Please check the URL or try again later.',
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
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
