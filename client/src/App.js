/**
 * client/src/App.js
 */
import React, { useState } from 'react';
import './App.css';

function App() {
  const [instaUrl, setInstaUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // -------------------------
  // Download File Helpers
  // -------------------------
  const downloadFile = (fileUrl, fileName) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // -------------------------
  // Handle Form Submission
  // -------------------------
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
        body: JSON.stringify({ url: instaUrl }),
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

  // -------------------------
  // Clear the Input and Results
  // -------------------------
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

        {/* VIDEO PREVIEW & DOWNLOAD BUTTON */}
        {videoUrl && (
          <div className="media-container">
            <h3>Video Preview:</h3>
            <video className="insta-video" controls src={videoUrl}>
              Sorry, your browser doesn't support embedded videos.
            </video>
            <button
              onClick={() => downloadFile(videoUrl, 'instagram-video.mp4')}
              className="download-btn"
            >
              Download Video
            </button>
          </div>
        )}

        {/* IMAGE PREVIEW & DOWNLOAD BUTTON */}
        {imageUrl && (
          <div className="media-container">
            <h3>Image Preview:</h3>
            <img
              className="insta-image"
              src={imageUrl}
              alt="Instagram content"
            />
            <button
              onClick={() => downloadFile(imageUrl, 'instagram-image.jpg')}
              className="download-btn"
            >
              Download Image
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
