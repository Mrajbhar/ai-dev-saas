const axios = require("axios");
const { reviewPR } = require("../services/openaiService");

// 1️⃣ Redirect to GitHub Login
exports.githubLogin = (req, res) => {
  const redirectUrl =
    `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo`;

  res.redirect(redirectUrl);
};

// 2️⃣ GitHub OAuth Callback
exports.githubCallback = async (req, res) => {
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

  const accessToken = response.data.access_token;

  // TODO: Save accessToken in DB linked to user

  res.send("GitHub Connected Successfully");
};

// 3️⃣ Webhook (Auto PR Review)
exports.githubWebhook = async (req, res) => {
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

      console.log("AI Review:", review);

      // TODO: Post review back to GitHub
    }
  }

  res.sendStatus(200);
};