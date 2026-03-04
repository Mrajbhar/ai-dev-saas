const axios = require("axios");
const { incrementCall } = require("./statsService");
const { searchRepo, vectorStore } = require("./vectorService");

// Universal AI handler
async function askAI(query) {

  // If repo has indexed data → use RAG
  if (vectorStore.length > 0) {
    return await searchRepo(query);
  }

  // Otherwise → normal LLaMA response
  const res = await axios.post("http://localhost:11434/api/generate", {
    model: "llama3",
    prompt: `You are a senior AI developer assistant. Answer clearly and professionally:\n\n${query}`,
    stream: false,
  });

  incrementCall("llama");

  return res.data.response;
}

module.exports = {
  askAI
};