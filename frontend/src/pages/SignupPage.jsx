// src/pages/SignupPage.jsx
import React, { useState } from "react";
import GitHubLoginButton from "./GitHubLoginButton";

const SignupPage = () => {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="auth-container">
      <h1>Create Your Account 🚀</h1>
      <p className="subtitle">Sign up to start organizing your GitHub projects.</p>

      {/* <GitHubLoginButton text="Sign up with GitHub" disabled={!accepted} /> */}
      <GitHubLoginButton  text="Sign up with GitHub" disabled={!accepted}/>


      <div className="form-group">
        <label>
          <input
            type="checkbox"
            onChange={(e) => setAccepted(e.target.checked)}
          />
          I agree to the <a href="#">Terms of Service</a>
        </label>
      </div>

      <p className="info-text">
        We'll send you a welcome email with your setup link.
      </p>
    </div>
  );
};

export default SignupPage;
