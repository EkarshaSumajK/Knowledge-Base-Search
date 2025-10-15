# Quick Start Guide 🚀

Get your Knowledge Base Search Engine running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up ChromaDB

Choose one option:

### Option A: Docker (Recommended)
```bash
docker run -d -p 8000:8000 chromadb/chroma
```

### Option B: Python
```bash
pip install chromadb
chroma run --path ./chroma_data
```

## Step 3: Add Your OpenAI API Key

Edit `.env.local`:
```bash
OPENAI_API_KEY=sk-your-actual-key-here
```

Get your key from: https://platform.openai.com/api-keys

## Step 4: Start the App

```bash
npm run dev
```

Open http://localhost:3000

## Step 5: Upload & Query

**Option 1: Bulk Upload (Top of Page)**
1. Use the upload section at the top
2. Add some PDF/TXT/DOCX files
3. Wait for processing

**Option 2: Inline Upload (Chat)**
1. Click the attachment icon in the chat input
2. Select files or drag-and-drop
3. Files are automatically uploaded when you send

4. Ask questions about your documents!

## Example Questions

After uploading documents about your project:
- "What is the main purpose of this project?"
- "Summarize the key features"
- "What technologies are used?"

## RAG is Always On

All queries automatically search through your uploaded documents to provide accurate, context-aware answers with citations.

## Switch Themes

Click the sun/moon icon in the header to toggle dark/light mode.

## Troubleshooting

### "ChromaDB connection failed"
- Make sure ChromaDB is running on port 8000
- Check: `curl http://localhost:8000/api/v1/heartbeat`

### "OpenAI API error"
- Verify your API key in `.env.local`
- Check you have credits: https://platform.openai.com/usage

### "Document upload failed"
- Supported formats: PDF, TXT, DOCX only
- Max file size: Check your server limits

## Next Steps

- Read the full [README.md](./README.md) for architecture details
- Customize models in `src/app/page.tsx`
- Adjust chunk size in `src/lib/document-processor.ts`
- Add more document types

Happy searching! 🎉
