const express = require("express");
const router = express.Router();
const axios = require("axios");
const { reviewPR } = require("../services/openaiService");

// ✅ Store token in memory (temporary for dev)
let githubAccessToken = null;

/**
 * 1️⃣ Redirect to GitHub Login
 */
router.get("/login", (req, res) => {
  const redirectUrl =
    `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo`;

  res.redirect(redirectUrl);
});

/**
 * 2️⃣ GitHub OAuth Callback
 */
router.get("/callback", async (req, res) => {
  try {
    const code = req.query.code;

    if (!code) {
      return res.status(400).send("No code received from GitHub");
    }

    const response = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      },
      { headers: { Accept: "application/json" } }
    );

    githubAccessToken = response.data.access_token;

    console.log("✅ GitHub Connected");

    // Redirect back to frontend GitHub page
    res.redirect("http://localhost:5173/github");

  } catch (error) {
    console.error("GitHub OAuth Error:", error.response?.data || error.message);
    res.status(500).send("GitHub authentication failed");
  }
});

/**
 * 3️⃣ Get User Repositories
 */
router.get("/repos", async (req, res) => {
  try {
    if (!githubAccessToken) {
      return res.status(401).json({ message: "GitHub not connected" });
    }

    const repos = await axios.get(
      "https://api.github.com/user/repos",
      {
        headers: {
          Authorization: `Bearer ${githubAccessToken}`,
          Accept: "application/vnd.github+json"
        }
      }
    );

    res.json(repos.data);

  } catch (error) {
    console.error("Fetch Repo Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to fetch repositories" });
  }
});

/**
 * 4️⃣ Webhook for Auto PR Review
 */
router.post("/webhook", async (req, res) => {
  try {
    const event = req.headers["x-github-event"];

    if (event === "pull_request") {

      const action = req.body.action;

      if (action === "opened" || action === "synchronize") {

        const pr = req.body.pull_request;
        const repo = req.body.repository;

        const diffUrl = pr.diff_url;

        const diffResponse = await axios.get(diffUrl, {
          headers: {
            Accept: "application/vnd.github.v3.diff"
          }
        });

        const diff = diffResponse.data;

        const review = await reviewPR(diff);

        console.log("🤖 AI Review Generated");

        // TODO: Post comment back to GitHub
      }
    }

    res.sendStatus(200);

  } catch (error) {
    console.error("Webhook Error:", error.message);
    res.sendStatus(500);
  }
});
/**
 * Get File Content
 */
router.get("/repos/:owner/:repo/file", async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { path } = req.query;

    if (!githubAccessToken) {
      return res.status(401).json({ message: "GitHub not connected" });
    }

    const file = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: {
          Authorization: `Bearer ${githubAccessToken}`,
          Accept: "application/vnd.github+json"
        }
      }
    );

    const content = Buffer.from(file.data.content, "base64").toString("utf-8");

    res.json({ content });

  } catch (error) {
    console.error("File fetch error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to fetch file content" });
  }
});

module.exports = router;