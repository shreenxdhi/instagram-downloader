import React, { useState } from 'react';
import './App.css';
import { FaFacebook, FaTwitter, FaWhatsapp, FaInstagram } from 'react-icons/fa';

function App() {
  const [instaUrl, setInstaUrl] = useState('');
  const [type, setType] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Function to download media
  const downloadFile = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle form submission
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
      console.error('Error fetching media:', error);
      setErrorMsg('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Clear input and results
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

        {/* Handle Reels */}
        {type === 'reel' && videoUrl && (
          <div className="media-container">
            <h3>Reel Preview:</h3>
            <video className="insta-video" controls src={videoUrl}>
              Sorry, your browser doesn’t support embedded videos.
            </video>
            <button
              className="download-btn"
              onClick={() => downloadFile(videoUrl, 'instagram-reel.mp4')}
            >
              Download Reel
            </button>
          </div>
        )}

        {/* Handle Posts */}
        {type === 'post' && imageUrl && (
          <div className="media-container">
            <h3>Post Preview:</h3>
            <img className="insta-image" src={imageUrl} alt="Instagram Post" />
            <button
              className="download-btn"
              onClick={() => downloadFile(imageUrl, 'instagram-post.jpg')}
            >
              Download Image
            </button>
          </div>
        )}

        {/* Unknown Type */}
        {type === 'unknown' && (
          <p style={{ color: 'orange' }}>Unable to determine the type of content.</p>
        )}
      </div>

      <footer>
        <p>Made with ❤️ by Shreenidhi Vasishta</p>
        <div className="social-icons">
          <a
            href="https://facebook.com/sharer/sharer.php?u=https://instagram-downloader-3qi2.onrender.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on Facebook"
          >
            <FaFacebook size={24} />
          </a>
          <a
            href="https://twitter.com/intent/tweet?url=https://instagram-downloader-3qi2.onrender.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on Twitter"
          >
            <FaTwitter size={24} />
          </a>
          <a
            href="https://wa.me/?text=Check%20out%20this%20Instagram%20Downloader:%20https://instagram-downloader-3qi2.onrender.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on WhatsApp"
          >
            <FaWhatsapp size={24} />
          </a>
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on Instagram"
          >
            <FaInstagram size={24} />
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
