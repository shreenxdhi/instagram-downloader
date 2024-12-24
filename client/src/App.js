import React, { useState } from 'react';
import './App.css';

function App() {
  const [instaUrl, setInstaUrl] = useState('');
  const [type, setType] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const downloadMedia = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading media:', error.message);
      setErrorMsg('Failed to download media.');
    }
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setType('');
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
        setErrorMsg(data.error || 'Error fetching media.');
      } else {
        setType(data.type || 'unknown');
        setVideoUrl(data.videoUrl || '');
        setImageUrl(data.imageUrl || '');
      }
    } catch (error) {
      console.error('Error fetching media:', error.message);
      setErrorMsg('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInstaUrl('');
    setType('');
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
            placeholder="e.g. https://www.instagram.com/reel/..."
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
        {type === 'reel' && videoUrl && (
          <div>
            <h3>Reel Preview:</h3>
            <video
              className="insta-video"
              controls
              src={videoUrl}
              style={{ width: 'auto', height: 'auto', display: 'block', margin: '0 auto' }}
            >
              Sorry, your browser doesn’t support embedded videos.
            </video>
            <button
              className="download-btn"
              onClick={() => downloadMedia(videoUrl, 'instagram-reel.mp4')}
            >
              Download Reel
            </button>
          </div>
        )}
        {type === 'post' && imageUrl && (
          <div>
            <h3>Post Preview:</h3>
            <img
              className="insta-image"
              src={imageUrl}
              alt="Instagram Post"
              style={{ width: 'auto', height: 'auto', display: 'block', margin: '0 auto' }}
            />
            <button
              className="download-btn"
              onClick={() => downloadMedia(imageUrl, 'instagram-post.jpg')}
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
