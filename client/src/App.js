import React, { useState } from "react";
import axios from "axios";
import "./App.css";

// InstaVideo component to display video
const InstaVideo = ({ data }) => {
  return (
    <video controls className="insta-video">
      <source src={data} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
};

const App = () => {
  const [input, setInput] = useState(""); // For the Instagram link input
  const [data, setData] = useState(""); // For the video URL
  const [loader, setLoader] = useState(false); // To handle loading state
  const [error, setError] = useState(""); // To handle error messages

  // Function to fetch video/post data from the API
  const getVideo = async () => {
    const options = {
      method: "GET",
      url: import.meta.env.VITE_URL, // Environment variable for API URL
      params: {
        url: `${input}`, // Instagram URL entered by the user
      },
      headers: {
        "X-RapidAPI-Key": import.meta.env.VITE_Rapid_Key, // RapidAPI Key
        "X-RapidAPI-Host": import.meta.env.VITE_Rapid_Host, // RapidAPI Host
      },
    };

    try {
      setLoader(true);
      const response = await axios.request(options);

      // Extract the video/post URL from the response
      setData(response?.data?.result[0]?.url);
      setLoader(false);
      setError(""); // Clear any previous error
    } catch (error) {
      setLoader(false);
      // Handle errors gracefully
      if (error.message === "Network Error") {
        setError("Please check your internet connection.");
      } else {
        setError(error.response?.data?.message || "Something went wrong.");
      }
    }
  };

  return (
    <>
      <div className="main">
        <h1>Instagram Downloader</h1>
        <input
          placeholder="Paste Instagram Post/Reel Link"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          type="url"
          className="input-box"
        />
        <button onClick={getVideo} className="download-btn" disabled={loader}>
          {loader ? "Loading..." : "Download"}
        </button>
      </div>
      <div className="videoContainer">
        {data ? (
          <InstaVideo data={data} />
        ) : (
          error && <h3 className="error">{error}</h3>
        )}
      </div>
    </>
  );
};

export default App;
