// src/pages/LoginPage.jsx
import React from "react";
import GitHubLoginButton from "../Github Button/GitHubLoginButton";
import "./LoginPage.css";

const LoginPage = () => {
  return (
    <div className="auth-container">
      <h1>Welcome Back 👋</h1>
      <p className="subtitle">Log in to clean up your GitHub repositories.</p>

      <GitHubLoginButton text="Sign in with GitHub" />

      <div className="info-box">
        <h3>Why GitHub?</h3>
        <ul>
          <li>Secure OAuth login</li>
          <li>No password required</li>
          <li>Direct access to your repos</li>
        </ul>
      </div>

      <button className="demo-btn">Try Demo Account</button>
    </div>
  );
};

export default LoginPage;
