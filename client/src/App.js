<div className="result">
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
