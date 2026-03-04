const express = require("express");
const router = express.Router();
const axios = require("axios");
const { reviewPR } = require("../services/openaiService");

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

    const repos = await axios.get(
      "https://api.github.com/user/repos",
      {
        headers: {
          Authorization: `Bearer ${githubAccessToken}`
        }
      }
    );

    res.json(repos.data);

  } catch (error) {

    console.error("Repo fetch error:", error.message);

    res.status(500).json({ message: "Failed to fetch repos" });
  }

});


/**
 * 4️⃣ Get All Files (Like GitHub)
 */
router.get("/repos/:owner/:repo/files", async (req, res) => {

  try {

    const { owner, repo } = req.params;

    // Get repository info first
    const repoInfo = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Authorization: `Bearer ${githubAccessToken}`
        }
      }
    );

    const branch = repoInfo.data.default_branch;

    // Get recursive file tree
    const tree = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
      {
        headers: {
          Authorization: `Bearer ${githubAccessToken}`
        }
      }
    );

    const files = tree.data.tree.filter(item => item.type === "blob");

    res.json(files);

  } catch (error) {

    console.error("File tree error:", error.response?.data || error.message);

    res.status(500).json({ message: "Failed to fetch files" });
  }

});


/**
 * 5️⃣ Get File Content
 */
router.get("/repos/:owner/:repo/file", async (req, res) => {

  try {

    const { owner, repo } = req.params;
    const { path } = req.query;

    const file = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: {
          Authorization: `Bearer ${githubAccessToken}`
        }
      }
    );

    const content = Buffer
      .from(file.data.content, "base64")
      .toString("utf-8");

    res.json({ content });

  } catch (error) {

    console.error("File content error:", error.response?.data || error.message);

    res.status(500).json({ message: "Failed to fetch file content" });
  }

});


/**
 * 6️⃣ Webhook for PR Review
 */
router.post("/webhook", async (req, res) => {

  try {

    const event = req.headers["x-github-event"];

    if (event === "pull_request") {

      const action = req.body.action;

      if (action === "opened" || action === "synchronize") {

        const pr = req.body.pull_request;

        const diffResponse = await axios.get(pr.diff_url, {
          headers: {
            Accept: "application/vnd.github.v3.diff"
          }
        });

        const diff = diffResponse.data;

        const review = await reviewPR(diff);

        console.log("🤖 AI Review Generated");
        console.log(review);
      }
    }

    res.sendStatus(200);

  } catch (error) {

    console.error("Webhook error:", error.message);

    res.sendStatus(500);
  }

});

module.exports = router;