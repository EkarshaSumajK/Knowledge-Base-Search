# Knowledge Base Search Engine 🔍

A RAG-powered (Retrieval-Augmented Generation) document search system that allows users to upload documents and ask questions, receiving synthesized answers with citations from the AI.

## 🎯 Features

- **Document Upload**: Support for PDF, TXT, and DOCX files via dedicated upload or drag-and-drop in chat
- **RAG Implementation**: Always-on vector embeddings with ChromaDB for semantic search
- **AI Synthesis**: LLM-powered answer generation with document citations
- **Dark/Light Mode**: Full theme support with system preference detection
- **Model Selection**: Choose between GPT-4o, GPT-4o Mini, or GPT-3.5 Turbo
- **Real-time Streaming**: Streaming responses using AI SDK
- **Source Citations**: Automatic citation of source documents
- **Reasoning Display**: View model reasoning process (for supported models)
- **Inline Document Upload**: Attach documents directly in chat using AI Elements

## 🏗️ Architecture

### Backend Components

1. **Document Processing** (`src/lib/document-processor.ts`)
   - Extracts text from PDF, DOCX, and TXT files
   - Chunks documents for optimal retrieval
   - Maintains metadata for source tracking

2. **Vector Store** (`src/lib/vector-store.ts`)
   - ChromaDB for vector storage
   - OpenAI embeddings (text-embedding-3-small)
   - Cosine similarity search

3. **API Routes**
   - `/api/documents` - Document ingestion endpoint
   - `/api/chat` - RAG-powered chat endpoint with streaming

### Frontend Components

- **AI Elements**: Pre-built chat UI components
- **Theme System**: next-themes for dark/light mode
- **Document Upload**: Drag-and-drop file upload interface
- **Chat Interface**: Conversation view with message history

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- OpenAI API key
- ChromaDB (runs locally)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd knowledge-base-search-engine
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy .env.local and add your API keys
OPENAI_API_KEY=your_openai_api_key_here
```

4. Start ChromaDB (in a separate terminal):
```bash
# Using Docker
docker run -p 8000:8000 chromadb/chroma

# Or using Python
pip install chromadb
chroma run --path ./chroma_data
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### Uploading Documents

**Option 1: Bulk Upload Section (Always Visible)**
1. Use the upload section at the top of the page
2. Select or drag-and-drop PDF, TXT, or DOCX files
3. Click "Upload" to process and index documents

**Option 2: Inline Chat Attachments**
1. Click the attachment icon in the chat input
2. Select files to attach
3. Files are automatically uploaded to the knowledge base when you send the message

Documents are automatically chunked and embedded for semantic search.

### Asking Questions

1. Type your question in the chat input
2. Optionally attach documents directly in the chat (they'll be automatically uploaded to the knowledge base)
3. Select your preferred AI model
4. Press Enter or click Send
5. View synthesized answer with source citations from your knowledge base

### RAG Mode

RAG (Retrieval-Augmented Generation) is always enabled. All queries automatically search through your uploaded documents to provide context-aware answers with citations.

## 🛠️ Technical Implementation

### Document Ingestion Flow

```
Upload → Extract Text → Chunk → Generate Embeddings → Store in ChromaDB
```

### Query Flow

```
User Query → Generate Query Embedding → Search ChromaDB → 
Retrieve Top-K Documents → Construct Prompt → LLM Synthesis → 
Stream Response with Citations
```

### RAG Prompt Structure

```typescript
const systemPrompt = `You are a helpful AI assistant with access to a knowledge base. 
Use the following documents to answer the user's question accurately and succinctly.

RETRIEVED DOCUMENTS:
[Document 1] ...
[Document 2] ...

Instructions:
- Answer based on the provided documents
- Cite specific documents when making claims
- Be concise and accurate
- If information is not in the documents, acknowledge it`;
```

## 🎨 Customization

### Adding More Models

Edit `src/app/page.tsx`:

```typescript
const models = [
  { name: 'GPT 4o', value: 'gpt-4o' },
  { name: 'Claude 3.5', value: 'claude-3-5-sonnet' }, // Add new model
];
```

Update `src/app/api/chat/route.ts` to support the new provider.

### Adjusting Chunk Size

Edit `src/lib/document-processor.ts`:

```typescript
chunkText(text, chunkSize: 1500, overlap: 300) // Adjust parameters
```

### Changing Embedding Model

Edit `src/lib/vector-store.ts`:

```typescript
model: openai.embedding('text-embedding-3-large') // Use larger model
```

## 📊 Evaluation Metrics

### Retrieval Accuracy
- Top-K precision: Measures relevant documents in top results
- Semantic similarity scores: ChromaDB distance metrics

### Synthesis Quality
- Answer relevance: Does the answer address the question?
- Citation accuracy: Are sources correctly referenced?
- Conciseness: Is the answer appropriately detailed?

### Code Structure
- Modular architecture with clear separation of concerns
- Type-safe TypeScript implementation
- Reusable components and utilities
- Error handling and validation

## 🔧 Configuration

### Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-...           # For embeddings and chat

# Optional
ANTHROPIC_API_KEY=sk-ant-...    # For Claude models
AI_GATEWAY_API_KEY=vck-...      # For Vercel AI Gateway
```

### ChromaDB Configuration

Default: `http://localhost:8000`

To change, update `src/lib/vector-store.ts`:

```typescript
const client = new ChromaClient({
  path: "http://your-chroma-host:8000"
});
```

## 📦 Project Structure

```
knowledge-base-search-engine/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts          # RAG chat endpoint
│   │   │   └── documents/route.ts     # Document upload endpoint
│   │   ├── layout.tsx                 # Root layout with theme
│   │   └── page.tsx                   # Main chat interface
│   ├── components/
│   │   ├── ai-elements/               # AI SDK UI components
│   │   ├── document-upload.tsx        # Upload interface
│   │   ├── theme-provider.tsx         # Theme context
│   │   └── theme-toggle.tsx           # Dark/light toggle
│   └── lib/
│       ├── document-processor.ts      # Text extraction & chunking
│       └── vector-store.ts            # ChromaDB integration
├── .env.local                         # Environment variables
└── README.md
```

## 🎥 Demo Video

[Link to demo video showing:]
- Document upload process
- Asking questions with RAG enabled
- Viewing source citations
- Comparing RAG vs non-RAG responses
- Theme switching

## 🐛 Troubleshooting

### ChromaDB Connection Error
```bash
# Ensure ChromaDB is running
docker ps | grep chroma
# Or restart ChromaDB
docker restart <chroma-container-id>
```

### Embedding API Errors
- Check OPENAI_API_KEY is set correctly
- Verify API key has sufficient credits
- Check rate limits

### Document Upload Fails
- Ensure file is PDF, TXT, or DOCX
- Check file size (large files may timeout)
- Verify ChromaDB is accessible

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

Built with [Next.js](https://nextjs.org/), [AI SDK](https://sdk.vercel.ai/), and [ChromaDB](https://www.trychroma.com/)
