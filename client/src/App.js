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
      setErrorMsg('Failed to download media. Please try again.');
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
          <button
            type="submit"
            disabled={loading}
            className={loading ? 'loading-btn download-btn' : 'download-btn'}
          >
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
            <h3 className="preview-title">Reel Preview:</h3>
            <video
              className="insta-video"
              controls
              src={videoUrl}
              style={{
                display: 'block',
                margin: '20px auto',
                border: '2px solid #ff8a00',
                borderRadius: '10px',
                boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
              }}
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
            <h3 className="preview-title">Post Preview:</h3>
            <img
              className="insta-image"
              src={imageUrl}
              alt="Instagram Post"
              style={{
                display: 'block',
                margin: '20px auto',
                border: '2px solid #ff8a00',
                borderRadius: '10px',
                boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
              }}
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
      <footer>
        <p>Made with ❤️ by Shreenidhi Vasishta</p>
        <div className="social-icons">
          <a
            href="https://facebook.com/sharer/sharer.php?u=https://instagram-downloader-r6x6.onrender.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on Facebook"
          >
            <i className="fab fa-facebook"></i>
          </a>
          <a
            href="https://twitter.com/intent/tweet?url=https://instagram-downloader-r6x6.onrender.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on Twitter"
          >
            <i className="fab fa-twitter"></i>
          </a>
          <a
            href="https://wa.me/?text=Check%20out%20this%20Instagram%20Downloader:%20https://instagram-downloader-r6x6.onrender.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on WhatsApp"
          >
            <i className="fab fa-whatsapp"></i>
          </a>
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit Instagram"
          >
            <i className="fab fa-instagram"></i>
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
