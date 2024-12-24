import React, { useState } from 'react';
import './App.css';

function App() {
  const [instaUrl, setInstaUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Force a file download in the browser
  const downloadFile = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setVideoUrl('');
    setImageUrl('');

    if (!instaUrl.trim()) {
      setErrorMsg('Please enter an Instagram URL.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: instaUrl })
      });
      const data = await response.json();

      if (!data.success) {
        setErrorMsg(data.error || 'Error downloading media.');
      } else {
        if (data.videoUrl) {
          setVideoUrl(data.videoUrl);
        }
        if (data.imageUrl) {
          setImageUrl(data.imageUrl);
        }
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Clear form & results
  const handleClear = () => {
    setInstaUrl('');
    setVideoUrl('');
    setImageUrl('');
    setErrorMsg('');
    setLoading(false);
  };

  return (
    <div className="container">
      <h1>Instagram Downloader</h1>

      <form onSubmit={handleDownload}>
        <div className="form-group">
          <label htmlFor="insta-url">Paste Instagram Post/Reel URL</label>
          <input
            id="insta-url"
            type="text"
            placeholder="e.g. https://www.instagram.com/p/XXXXXXXXX/"
            value={instaUrl}
            onChange={(e) => setInstaUrl(e.target.value)}
          />
        </div>

        <div className="button-group">
          <button type="submit" disabled={loading}>
            {loading ? 'Downloading...' : 'Download'}
          </button>
          <button type="button" className="clear-btn" onClick={handleClear}>
            Clear
          </button>
        </div>
      </form>

      <div className="result">
        {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}

        {/* If a video is found, show <video> preview & Download button */}
        {videoUrl && (
          <div className="media-container">
            <h3>Video Preview:</h3>
            <video className="insta-video" controls src={videoUrl}>
              Sorry, your browser doesn't support embedded videos.
            </video>
            <button
              className="download-btn"
              onClick={() => downloadFile(videoUrl, 'instagram-video.mp4')}
            >
              Download Video
            </button>
          </div>
        )}

        {/* If no video but an image is found, show <img> preview & Download button */}
        {!videoUrl && imageUrl && (
          <div className="media-container">
            <h3>Image Preview:</h3>
            <img
              className="insta-image"
              src={imageUrl}
              alt="Instagram content"
            />
            <button
              className="download-btn"
              onClick={() => downloadFile(imageUrl, 'instagram-image.jpg')}
            >
              Download Image
            </button>
          </div>
        )}
      </div>

      {/*  FOOTER SECTION  */}
      <footer>
        <p>Made with ❤️ by Shreenidhi Vasishta</p>
        <p>Share this tool:</p>
        <div className="social-icons">
          <a
            href="https://facebook.com/sharer/sharer.php?u=https://instagram-downloader-rmbp.onrender.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Facebook
          </a>
          {' | '}
          <a
            href="https://twitter.com/intent/tweet?url=https://instagram-downloader-rmbp.onrender.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Twitter
          </a>
          {' | '}
          <a
            href="https://wa.me/?text=Check%20out%20this%20Instagram%20Downloader%20by%20Shreenidhi%20Vasishta:%20https://instagram-downloader-rmbp.onrender.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
