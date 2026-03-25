const OpenAI = require("openai");
const { searchSimilar } = require("./vectorStore");

const openai = new OpenAI();

const SYSTEM_PROMPT = `You are a helpful customer support assistant for an e-commerce store.
Answer the customer's question based ONLY on the FAQ context provided below.
Be friendly, concise, and accurate.
If the provided context does not contain relevant information to answer the question,
politely let the customer know that you don't have information on that topic and suggest
they contact support directly.`;

/**
 * Generate a RAG-powered response to a user message.
 * @param {string} userMessage - The user's message.
 * @returns {Promise<{reply: string, sources: Array<{question: string, answer: string}>}>}
 */
async function generateResponse(userMessage) {
  // 1. Search vector store for similar FAQs
  const results = await searchSimilar(userMessage, 3);

  // 2. Build context from retrieved FAQs
  const sources = results.map((r) => ({
    question: r.question,
    answer: r.answer,
  }));

  let contextBlock = "";
  if (sources.length > 0) {
    contextBlock = sources
      .map(
        (s, i) =>
          `FAQ ${i + 1}:\nQ: ${s.question}\nA: ${s.answer}`
      )
      .join("\n\n");
  }

  // 3. Call OpenAI chat completion
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `FAQ Context:\n${contextBlock || "No relevant FAQs found."}\n\nCustomer Question: ${userMessage}`,
    },
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages,
    temperature: 0.7,
    max_tokens: 500,
  });

  const reply = completion.choices[0].message.content;

  return { reply, sources };
}

module.exports = { generateResponse };
