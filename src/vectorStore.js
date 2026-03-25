const lancedb = require("@lancedb/lancedb");
const { getEmbedding } = require("./embeddings");

let table = null;

/**
 * Initialize the vector store with FAQ data.
 * Generates embeddings for each FAQ and stores them in a LanceDB table.
 * @param {Array<{question: string, answer: string}>} faqs
 */
async function initVectorStore(faqs) {
  console.log("Generating embeddings for FAQs...");

  const data = [];
  for (let i = 0; i < faqs.length; i++) {
    const faq = faqs[i];
    const vector = await getEmbedding(faq.question + " " + faq.answer);
    data.push({
      id: i,
      question: faq.question,
      answer: faq.answer,
      vector: Float32Array.from(vector),
    });
    console.log(`  Embedded FAQ ${i + 1}/${faqs.length}`);
  }

  const db = await lancedb.connect("data/lancedb");

  // Drop existing table if it exists, then create fresh
  try {
    await db.dropTable("faqs");
  } catch (_) {
    // Table may not exist yet — that's fine
  }

  table = await db.createTable("faqs", data);
  console.log("Vector store initialized with", data.length, "FAQ entries.");
}

/**
 * Search for FAQs similar to the given query.
 * @param {string} query - The user's query text.
 * @param {number} limit - Max number of results to return.
 * @returns {Promise<Array<{question: string, answer: string, _distance: number}>>}
 */
async function searchSimilar(query, limit = 3) {
  if (!table) {
    throw new Error("Vector store not initialized. Call initVectorStore first.");
  }
  const queryVector = await getEmbedding(query);
  const results = await table
    .vectorSearch(Float32Array.from(queryVector))
    .limit(limit)
    .toArray();
  return results;
}

module.exports = { initVectorStore, searchSimilar };
