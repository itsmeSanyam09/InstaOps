import React, { useState } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const App = () => {
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadId, setUploadId] = useState("");
  const [deployed, setDeployed] = useState(false);
  const handleClick = async () => {
    setUploading(true);
    const res = await axios.post(`${BACKEND_URL}/deploy`, {
      repoUrl: input,
    });
    setUploadId(`${res.data.id}`);
    const interval = setInterval(async () => {
      const response = await axios.get(
        `${BACKEND_URL}/status?id=${res.data.id}`
      );

      if (response.data.status === "deployed") {
        clearInterval(interval);
        setDeployed(true);
      }
    }, 4000);
  };
  return (
    <div id="main">
      <div className="container">
        <p>Enter the Repository's url</p>
        <input
          type="text"
          placeholder="https://github.com/username/repo"
          className="inputme"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="button"
          className="deploy"
          onClick={async () => {
            await handleClick();
          }}
          disabled={uploading}
        >
          {deployed
            ? "Deployed"
            : uploading
            ? `Deploying(${uploadId})`
            : "Deploy"}
        </button>
      </div>
      {deployed && (
        <div className="container">
          <label htmlFor="deployed-url">Deployed URL</label>

          <input
            type="text"
            placeholder="https://github.com/username/repo"
            className="inputme"
            value={`https://${uploadId}.${
              import.meta.env.VITE_BACKEND_DOMAIN
            }`}
          />
          <button type="button" className="deploy">
            <a
              href={`https://${uploadId}.${
                import.meta.env.VITE_BACKEND_DOMAIN
              }`}
              target="_blank"
            >
              Visit Site
            </a>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
