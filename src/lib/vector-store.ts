import { embed, embedMany } from 'ai';
import { google } from '@ai-sdk/google';
import fs from 'fs';
import path from 'path';

// Simple in-memory vector store
interface VectorDocument {
  id: string;
  text: string;
  embedding: number[];
  metadata: any;
}

// File path for persistence
const VECTOR_STORE_PATH = path.join(process.cwd(), 'vector-store.json');

// Load vector store from file or initialize empty
function loadVectorStore(): VectorDocument[] {
  try {
    if (fs.existsSync(VECTOR_STORE_PATH)) {
      const data = fs.readFileSync(VECTOR_STORE_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      console.log(`📂 Loaded ${parsed.length} documents from disk`);
      return parsed;
    }
  } catch (error) {
    console.error('Error loading vector store:', error);
  }
  return [];
}

// Save vector store to file
function saveVectorStore(store: VectorDocument[]) {
  try {
    fs.writeFileSync(VECTOR_STORE_PATH, JSON.stringify(store, null, 2));
    console.log(`💾 Saved ${store.length} documents to disk`);
  } catch (error) {
    console.error('Error saving vector store:', error);
  }
}

// In-memory storage with file persistence
let vectorStore: VectorDocument[] = loadVectorStore();

// Calculate cosine similarity between two vectors
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

export async function addDocuments(
  documents: { id: string; text: string; metadata: any }[]
) {
  const BATCH_SIZE = 100; // Google's limit
  const texts = documents.map((doc) => doc.text);
  const allEmbeddings: number[][] = [];

  // Process in batches of 100
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(texts.length / BATCH_SIZE)}`);
    
    const { embeddings } = await embedMany({
      model: google.textEmbeddingModel('text-embedding-004'),
      values: batch,
    });
    
    allEmbeddings.push(...embeddings);
  }

  // Add to in-memory store
  documents.forEach((doc, idx) => {
    vectorStore.push({
      id: doc.id,
      text: doc.text,
      embedding: allEmbeddings[idx],
      metadata: doc.metadata,
    });
  });

  // Persist to disk
  saveVectorStore(vectorStore);
  
  console.log(`Added ${documents.length} documents. Total: ${vectorStore.length}`);
}

export async function searchDocuments(query: string, topK: number = 5) {
  // Reload from disk to ensure we have latest data
  vectorStore = loadVectorStore();
  
  console.log(`📚 Vector store has ${vectorStore.length} documents`);
  
  if (vectorStore.length === 0) {
    console.log('⚠️ Vector store is empty!');
    return [];
  }

  const { embedding } = await embed({
    model: google.textEmbeddingModel('text-embedding-004'),
    value: query,
  });

  // Calculate similarity for all documents
  const results = vectorStore.map((doc) => ({
    text: doc.text,
    metadata: doc.metadata,
    similarity: cosineSimilarity(embedding, doc.embedding),
  }));

  // Sort by similarity (highest first) and return top K
  const topResults = results
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK)
    .map(({ text, metadata, similarity }) => ({
      text,
      metadata,
      distance: 1 - similarity, // Convert similarity to distance
    }));
  
  console.log(`✅ Returning ${topResults.length} results`);
  return topResults;
}

// Helper function to check vector store status
export function getVectorStoreStats() {
  return {
    documentCount: vectorStore.length,
    documents: vectorStore.map(doc => ({
      id: doc.id,
      textPreview: doc.text.substring(0, 100) + '...',
      metadata: doc.metadata,
    })),
  };
}
