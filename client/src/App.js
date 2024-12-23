import React, { useState } from 'react';

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
        headers: {
          'Content-Type': 'application/json'
        },
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

  return (
    <div className="container">
      <h1>Instagram Downloader</h1>
      <form onSubmit={handleDownload}>
        <div className="form-group">
          <label htmlFor="insta-url">Paste Instagram Post/Reel URL</label>
          <input
            id="insta-url"
            type="text"
            placeholder="e.g. https://www.instagram.com/p/xxxxxxxxx/"
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
        {videoUrl && (
          <p>
            Video found!{' '}
            <a href={videoUrl} target="_blank" rel="noopener noreferrer">
              Click here to open
            </a>{' '}
            or right-click and "Save video as..."
          </p>
        )}
        {imageUrl && (
          <p>
            Image found!{' '}
            <a href={imageUrl} target="_blank" rel="noopener noreferrer">
              Click here to open
            </a>{' '}
            or right-click and "Save image as..."
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
