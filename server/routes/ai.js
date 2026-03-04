const express = require("express");
const router = express.Router();

const { askAI } = require("../services/openaiService");
const { indexFile } = require("../services/vectorService");
const { getStats } = require("../services/statsService");
const os = require("os");
const axios = require("axios");
/**
 * PR Review
 */

router.post("/ask", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ result: "Query is required." });
    }

    const result = await askAI(query);

    res.json({ result });

  } catch (error) {
    console.error("Ask AI Error:", error.message);
    res.status(500).json({
      result: "AI request failed. Make sure Ollama is running.",
    });
  }
});

router.post("/review-pr", async (req, res) => {
  try {
    const { diff } = req.body;

    if (!diff) {
      return res.status(400).json({ result: "PR diff is required." });
    }

    const result = await reviewPR(diff);

    res.json({ result });
  } catch (error) {
    console.error("PR Review Error:", error.message);
    res.status(500).json({
      result: "PR review failed. Make sure Ollama is running.",
    });
  }
});

/**
 * Explain Code
 */
router.post("/explain", async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ result: "Code input is required." });
    }

    const result = await explainCode(code);

    res.json({ result });
  } catch (error) {
    console.error("Explain Error:", error.message);
    res.status(500).json({
      result: "Code explanation failed. Make sure Ollama is running.",
    });
  }
});

/**
 * Index File (for vector search)
 */
router.post("/index-file", async (req, res) => {
  try {
    const { filename, content } = req.body;

    if (!content) {
      return res.status(400).json({ result: "Content is required for indexing." });
    }

    await indexFile(filename || "manual-input", content);

    res.json({ result: "File indexed successfully." });
  } catch (error) {
    console.error("Index Error:", error.message);
    res.status(500).json({
      result: "Indexing failed. Check Ollama embedding model.",
    });
  }
});

/**
 * Search Repo
 */
router.post("/search-repo", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ result: "Search query is required." });
    }

    const results = await searchRepo(query);

    res.json({ result: results });
  } catch (error) {
    console.error("Search Error:", error.message);
    res.status(500).json({
      result: "Search failed. Ensure embeddings model is running.",
    });
  }
});

router.get("/system-status", async (req, res) => {
  try {
    await axios.get("http://localhost:11434"); // check Ollama

    res.json({
      ollama: "Running",
      cpu: os.cpus().length + " cores",
      memory: (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + " GB",
      freeMemory: (os.freemem() / 1024 / 1024 / 1024).toFixed(2) + " GB",
      platform: os.platform(),
    });
  } catch (error) {
    res.json({
      ollama: "Stopped"
    });
  }
});

router.get("/stats", (req, res) => {
  res.json(getStats());
});
module.exports = router;