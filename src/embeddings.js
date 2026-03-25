const OpenAI = require("openai");

const openai = new OpenAI();

/**
 * Generate an embedding vector for the given text using OpenAI text-embedding-ada-002.
 * @param {string} text - The text to embed.
 * @returns {Promise<number[]>} A 1536-dimensional float array.
 */
async function getEmbedding(text) {
  const res = await openai.embeddings.create({
    input: text,
    model: "text-embedding-ada-002",
  });
  return res.data[0].embedding;
}

module.exports = { getEmbedding };
