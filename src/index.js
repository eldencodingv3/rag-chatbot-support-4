const express = require("express");
const path = require("path");
const fs = require("fs");
const { initVectorStore } = require("./vectorStore");
const { generateResponse } = require("./chat");

const app = express();
const PORT = process.env.PORT || 3000;

let vectorStoreReady = false;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", vectorStore: vectorStoreReady, timestamp: new Date().toISOString() });
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    if (!vectorStoreReady) {
      return res.status(503).json({ error: "Vector store is still initializing. Please try again shortly." });
    }

    const { message } = req.body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ error: "Message is required." });
    }

    const { reply, sources } = await generateResponse(message.trim());
    res.json({ reply, sources });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "An error occurred while processing your message." });
  }
});

// Error handling middleware
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error." });
});

// Startup
function start() {
  // Start server first so it can respond to health checks immediately
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);

    // Initialize vector store in the background after server is listening
    initializeVectorStore();
  });
}

async function initializeVectorStore() {
  try {
    const faqPath = path.join(__dirname, "..", "data", "faqs.json");
    const faqData = JSON.parse(fs.readFileSync(faqPath, "utf-8"));
    console.log(`Loaded ${faqData.length} FAQs from ${faqPath}`);

    await initVectorStore(faqData);
    vectorStoreReady = true;
    console.log("Vector store initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize vector store:", err.message);
    console.error("The server is running but /api/chat will return 503 until the vector store is ready.");
  }
}

start();
