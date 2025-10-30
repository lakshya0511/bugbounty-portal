import express from "express";
import fetch from "node-fetch";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.mjs";

dotenv.config();
const router = express.Router();

const {
  GITHUB_OAUTH_CLIENT_ID,
  GITHUB_OAUTH_CLIENT_SECRET,
  JWT_SECRET,
  FRONTEND_URL,
  BACKEND_URL,
} = process.env;

// Check required env vars
if (
  !GITHUB_OAUTH_CLIENT_ID ||
  !GITHUB_OAUTH_CLIENT_SECRET ||
  !JWT_SECRET ||
  !FRONTEND_URL
) {
  console.warn("⚠️ Missing GitHub OAuth or JWT environment variables");
}

/**
 * 1️⃣ Redirect user to GitHub OAuth
 */
router.get("/github", (req, res) => {
  const redirectUri = `${BACKEND_URL || `${req.protocol}://${req.get("host")}`}/api/auth/github/callback`;

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_OAUTH_CLIENT_ID}&scope=read:user&redirect_uri=${encodeURIComponent(
    redirectUri
  )}`;

  console.log("🔁 Redirecting to:", githubAuthUrl);
  res.redirect(githubAuthUrl);
});

/**
 * 2️⃣ Handle GitHub OAuth callback
 */
router.get("/github/callback", async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).json({ error: "Missing code from GitHub" });

    // Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: GITHUB_OAUTH_CLIENT_ID,
        client_secret: GITHUB_OAUTH_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error("❌ Failed to obtain GitHub access token", tokenData);
      return res.status(400).json({ error: "GitHub token exchange failed" });
    }

    // Fetch user info from GitHub
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    });

    const githubUser = await userResponse.json();
    if (!githubUser?.login) {
      console.error("❌ Failed to fetch GitHub user data", githubUser);
      return res.status(400).json({ error: "Failed to fetch GitHub user" });
    }

    // Upsert user in MongoDB
    const user = await User.findOneAndUpdate(
      { githubUsername: githubUser.login },
      {
        $setOnInsert: {
          githubUsername: githubUser.login,
          role: "reporter",
          totalPoints: 0,
        },
      },
      { upsert: true, new: true }
    );

    // Sign JWT
    const payload = {
      id: user._id,
      githubUsername: user.githubUsername,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    // Redirect to frontend with token
    const redirectUrl = `${FRONTEND_URL}/auth/success?token=${token}`;
    console.log("✅ Redirecting user to frontend:", redirectUrl);
    res.redirect(redirectUrl);
  } catch (err) {
    console.error("❌ GitHub OAuth callback error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * 3️⃣ Profile endpoint – verify JWT
 */
router.get("/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: "Missing Authorization header" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).select("-__v");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      id: user._id,
      githubUsername: user.githubUsername,
      role: user.role,
      totalPoints: user.totalPoints,
    });
  } catch (err) {
    console.error("❌ Profile fetch error:", err.message);
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

export default router;
