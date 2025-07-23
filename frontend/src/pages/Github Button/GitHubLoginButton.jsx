// src/components/GitHubLoginButton.jsx
import React from "react";

const GitHubLoginButton = ({ text = "Continue with GitHub", disabled = false }) => {
  const handleLogin = () => {
    if (!disabled) {
      // THIS IS THE LINE TO CHANGE
      // Use the VITE_API_URL environment variable here for your deployed backend URL
      window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/github`; 
    }
  };

  return ( 
    <button 
      className="github-btn" 
      onClick={handleLogin} 
      disabled={disabled}
      style={{ backgroundColor: "#155fdc", color: "white" }} // dark GitHub-like theme
    >
      <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub" />
      {text}
    </button>
  );
};

export default GitHubLoginButton;