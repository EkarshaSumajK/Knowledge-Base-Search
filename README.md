# Knowledge Base Search Engine 🔍

A RAG-powered (Retrieval-Augmented Generation) document search system that allows users to upload documents and ask questions, receiving synthesized answers with citations from the AI.

## 🎯 Features

- **Multiple Input Methods**:
  - Upload PDF, TXT, and DOCX files
  - Paste text directly with optional title
  - Drag-and-drop files in chat
- **RAG Implementation**: Always-on vector embeddings with ChromaDB for semantic search
- **AI Synthesis**: LLM-powered answer generation with document citations (temperature: 0 for deterministic responses)
- **Dark/Light Mode**: Full theme support with system preference detection
- **Fixed Model**: Gemini 2.5 Flash for optimal performance
- **Real-time Streaming**: Streaming responses using AI SDK
- **Source Citations**: Automatic citation of source documents
- **Reasoning Display**: View model reasoning process (for supported models)
- **Document Management**: View, refresh, and delete individual documents or clear entire knowledge base
- **Inline Document Upload**: Attach documents directly in chat using AI Elements

## 🏗️ Architecture

### Backend Components

1. **Document Processing** (`src/lib/document-processor.ts`)

   - Extracts text from PDF, DOCX, and TXT files
   - Chunks documents (1000 chars with 200 char overlap)
   - Maintains metadata for source tracking
   - Safety limits to prevent memory issues

2. **Vector Store** (`src/lib/vector-store.ts`)

   - ChromaDB v2 API for vector storage
   - Google text-embedding-004 model for embeddings
   - Cosine similarity search
   - Batch processing (100 documents per batch)
   - Custom NoOp embedding function (we provide pre-computed embeddings)

3. **API Routes**
   - `/api/documents` - Document ingestion endpoint (POST)
   - `/api/chat` - RAG-powered chat endpoint with streaming (POST)
   - `/api/vector-store` - Get stats (GET), delete documents (DELETE)

### Frontend Components

- **AI Elements**: Pre-built chat UI components from AI SDK
- **Theme System**: next-themes for dark/light mode
- **Document Manager**:
  - Collapsible interface with document count
  - Tab-based input (File Upload / Paste Text)
  - Document list with chunk counts
  - Individual and bulk delete options
  - Auto-expand when documents exist
- **Chat Interface**: Conversation view with message history, sources, and reasoning

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Google AI API key (for Gemini and embeddings)
- ChromaDB (runs locally via Docker or Python)

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
# Create .env.local and add your API key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key_here
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

**Option 1: File Upload Tab**

1. Expand the "Knowledge Base Documents" section
2. Click "Upload Files" tab
3. Select or drag-and-drop PDF, TXT, or DOCX files
4. Click "Upload" to process and index documents

**Option 2: Paste Text Tab**

1. Expand the "Knowledge Base Documents" section
2. Click "Paste Text" tab
3. Optionally add a document title
4. Paste your text content
5. Click "Add to Knowledge Base"

**Option 3: Inline Chat Attachments**

1. Click the attachment icon in the chat input
2. Select files to attach
3. Files are automatically uploaded to the knowledge base when you send the message

Documents are automatically chunked and embedded for semantic search.

### Asking Questions

1. Type your question in the chat input
2. Optionally attach documents directly in the chat (they'll be automatically uploaded to the knowledge base)
3. Press Enter or click Send
4. View synthesized answer with source citations from your knowledge base

### RAG Mode

RAG (Retrieval-Augmented Generation) is always enabled. All queries automatically:

- Search through your uploaded documents using semantic similarity
- Retrieve top 5 most relevant chunks
- Provide context-aware answers with source citations
- Use temperature 0 for deterministic, factual responses

## 🛠️ Technical Implementation

### Document Ingestion Flow

```
Upload/Paste → Extract Text → Chunk (1000 chars, 200 overlap) →
Generate Embeddings (Google text-embedding-004) →
Store in ChromaDB v2 (batch of 100)
```

### Query Flow

```
User Query → Generate Query Embedding → Search ChromaDB (cosine similarity) →
Retrieve Top-5 Documents → Construct Prompt → LLM Synthesis (Gemini 2.5 Flash, temp=0) →
Stream Response with Citations
```

### RAG Prompt Structure

The system uses a comprehensive prompt that:

- Provides knowledge base context from retrieved documents
- Instructs natural, conversational responses
- Emphasizes accuracy and transparency
- Formats responses with proper structure (paragraphs, bullets, bold)
- Only uses information from the knowledge base
- Acknowledges when information is unavailable

## 🎨 Customization

### Changing the Model

Edit `src/app/page.tsx`:

```typescript
const DEFAULT_MODEL = "gemini-2.5-flash"; // Change to your preferred model
```

Update `src/app/api/chat/route.ts` to support different providers (OpenAI, Anthropic, etc.).

### Adjusting Chunk Size

Edit `src/lib/document-processor.ts`:

```typescript
chunkText(text, chunkSize: 1500, overlap: 300) // Adjust parameters
```

### Changing Embedding Model

Edit `src/lib/vector-store.ts`:

```typescript
model: google.textEmbeddingModel("text-embedding-004"); // Current model
// Or use a different provider:
// model: openai.embedding('text-embedding-3-large')
```

Note: If changing embedding models, you'll need to re-embed all existing documents.

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
GOOGLE_GENERATIVE_AI_API_KEY=...  # For Gemini chat and embeddings

# Optional (if using other providers)
OPENAI_API_KEY=sk-...             # For OpenAI models
ANTHROPIC_API_KEY=sk-ant-...      # For Claude models
```

### ChromaDB Configuration

Default: `http://localhost:8000/api/v2` (ChromaDB v2 API)

To change, update `src/lib/vector-store.ts`:

```typescript
const client = new ChromaClient({
  path: "http://your-chroma-host:8000/api/v2",
});
```

**Important**: The application uses ChromaDB v2 API with custom embedding functions.

## 📦 Project Structure

```
knowledge-base-search-engine/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts          # RAG chat endpoint (streaming)
│   │   │   ├── documents/route.ts     # Document upload endpoint
│   │   │   └── vector-store/route.ts  # Vector store stats & delete
│   │   ├── layout.tsx                 # Root layout with theme
│   │   ├── page.tsx                   # Main chat interface
│   │   └── globals.css                # Global styles
│   ├── components/
│   │   ├── ai-elements/               # AI SDK UI components
│   │   ├── document-manager.tsx       # Upload & document list
│   │   ├── theme-provider.tsx         # Theme context
│   │   └── theme-toggle.tsx           # Dark/light toggle
│   └── lib/
│       ├── document-processor.ts      # Text extraction & chunking
│       └── vector-store.ts            # ChromaDB v2 integration
├── .env.local                         # Environment variables
├── package.json                       # Dependencies
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

**Common Error**: "The v1 API is deprecated. Please use /v2 apis"

- Solution: Ensure `path` in vector-store.ts includes `/api/v2`

**Common Error**: "Cannot instantiate a collection with the DefaultEmbeddingFunction"

- Solution: Use custom NoOpEmbeddingFunction (already implemented)

### Embedding API Errors

- Check GOOGLE_GENERATIVE_AI_API_KEY is set correctly
- Verify API key is valid and has quota
- Check rate limits (batch processing helps)

### Document Upload Fails

- Ensure file is PDF, TXT, or DOCX
- Check file size (large files may timeout - 60s limit)
- Verify ChromaDB is accessible
- Check console logs for specific errors

### Text Paste Not Working

- Ensure text is not empty
- Check that ChromaDB is running
- Verify embeddings API is accessible

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

Built with [Next.js](https://nextjs.org/), [AI SDK](https://sdk.vercel.ai/), and [ChromaDB](https://www.trychroma.com/)
