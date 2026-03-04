const axios = require("axios");
const { incrementCall, incrementIndexedFiles } = require("./statsService");
let vectorStore = [];

/**
 * Generate Embedding (IMPORTANT CHANGE)
 */
async function generateEmbedding(text) {
  const res = await axios.post(
    "http://localhost:11434/api/embeddings",
    {
      model: "nomic-embed-text", // ✅ CHANGED
      prompt: text,
    }
  );
incrementCall("embedding");
  return res.data.embedding;
}

/**
 * Split large files into chunks
 */
function chunkText(text, chunkSize = 500) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Index file properly
 */
async function indexFile(filename, content) {
  const chunks = chunkText(content);

  for (const chunk of chunks) {
    const embedding = await generateEmbedding(chunk);

    vectorStore.push({
      filename,
      content: chunk,
      embedding,
    });
  }

  incrementIndexedFiles(); // ✅ added
}

/**
 * Cosine similarity
 */
function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (normA * normB);
}

/**
 * Search Repo (RAG IMPLEMENTED)
 */
async function searchRepo(query) {
  const queryEmbedding = await generateEmbedding(query);

  const scored = vectorStore.map(file => ({
    ...file,
    score: cosineSimilarity(queryEmbedding, file.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);

  const topChunks = scored.slice(0, 5);

  const context = topChunks.map(r => r.content).join("\n\n");

  // 🔥 Ask LLaMA to answer using context
  const response = await axios.post(
    "http://localhost:11434/api/generate",
    {
      model: "llama3",
      prompt: `
You are a senior developer.
Answer the question using the repository context below.

Context:
${context}

Question:
${query}
      `,
      stream: false,
    }
  );

  return response.data.response;
}

module.exports = {
  indexFile,
  searchRepo,
  vectorStore
};