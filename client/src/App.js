import React, { useState } from 'react';
import './App.css';

function App() {
  const [instaUrl, setInstaUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDownload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setVideoUrl('');
    setImageUrl('');

    if (!instaUrl) {
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
        <button type="submit" disabled={loading}>
          {loading ? 'Downloading...' : 'Download'}
        </button>
      </form>

      <div className="result">
        {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}

        {/* VIDEO PREVIEW */}
        {videoUrl && (
          <div className="media-container">
            <h3>Video Preview:</h3>
            <video className="insta-video" controls src={videoUrl}>
              Sorry, your browser doesn't support embedded videos.
            </video>
            <p>
              <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                Open Video in New Tab
              </a>
            </p>
          </div>
        )}

        {/* IMAGE PREVIEW */}
        {imageUrl && (
          <div className="media-container">
            <h3>Image Preview:</h3>
            <img className="insta-image" src={imageUrl} alt="Instagram content" />
            <p>
              <a href={imageUrl} target="_blank" rel="noopener noreferrer">
                Open Image in New Tab
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
