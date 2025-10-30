import React from "react";
import "./Login.css";
import { FaGithub } from "react-icons/fa";

const Login = () => {
  const openOAuth = () => {
    window.location.href = `${
      process.env.REACT_APP_API_URL || "http://localhost:4000"
    }/api/auth/github`;
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Welcome to BugBounty Portal</h1>
        <p className="login-subtitle">
          Sign in using your GitHub account to continue.
        </p>

        <button className="login-btn" onClick={openOAuth}>
          <FaGithub className="github-icon" />
          Login with GitHub
        </button>

        <p className="login-note">
          Reporters are created by default. Reviewers are assigned manually.
        </p>
      </div>
    </div>
  );
};

export default Login;
