# RAG Chatbot - Customer Support

A Node.js RAG (Retrieval-Augmented Generation) chatbot that answers customer support questions using FAQ documents, LanceDB vector search, and OpenAI GPT-3.5-turbo.

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set environment variables (see below)
4. Start the server: `npm start`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `PORT` | Server port (default: 3000) | No |

## Updating the FAQ Dataset

Edit `data/faqs.json` to add, remove, or modify FAQ entries. Each entry should have:
- `question`: The FAQ question
- `answer`: The detailed answer

After updating, restart the server to re-generate embeddings and rebuild the vector store.

## Architecture

- **Express.js** server serving API routes and static frontend
- **LanceDB** embedded vector database for similarity search
- **OpenAI text-embedding-ada-002** for generating embeddings
- **OpenAI GPT-3.5-turbo** for generating natural language responses
- Simple HTML/CSS/JS chat interface

## API Endpoints

- `GET /` — Chat interface
- `GET /api/health` — Health check
- `POST /api/chat` — Send a message, get a RAG-powered response
