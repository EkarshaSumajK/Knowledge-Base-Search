import { embed, embedMany } from 'ai';
import { google } from '@ai-sdk/google';
import { ChromaClient, IEmbeddingFunction } from 'chromadb';

// Custom embedding function that does nothing (we provide our own embeddings)
class NoOpEmbeddingFunction implements IEmbeddingFunction {
  async generate(texts: string[]): Promise<number[][]> {
    // This should never be called since we provide embeddings directly
    throw new Error('Embedding function should not be called');
  }
}

// Initialize ChromaDB client with v2 API
const client = new ChromaClient({
  path: 'http://localhost:8000/api/v2', // Use v2 API endpoint
});

const COLLECTION_NAME = 'knowledge_base';

// Get or create collection
async function getCollection() {
  try {
    return await client.getOrCreateCollection({
      name: COLLECTION_NAME,
      metadata: { 'hnsw:space': 'cosine' },
      embeddingFunction: new NoOpEmbeddingFunction(),
    });
  } catch (error) {
    console.error('Error getting collection:', error);
    throw error;
  }
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

  // Add to ChromaDB
  const collection = await getCollection();
  
  await collection.add({
    ids: documents.map(doc => doc.id),
    embeddings: allEmbeddings,
    documents: texts,
    metadatas: documents.map(doc => doc.metadata),
  });
  
  console.log(`✅ Added ${documents.length} documents to ChromaDB`);
}

export async function searchDocuments(query: string, topK: number = 5) {
  try {
    const collection = await getCollection();
    const count = await collection.count();
    
    console.log(`📚 ChromaDB has ${count} documents`);
    
    if (count === 0) {
      console.log('⚠️ Vector store is empty!');
      return [];
    }

    const { embedding } = await embed({
      model: google.textEmbeddingModel('text-embedding-004'),
      value: query,
    });

    const results = await collection.query({
      queryEmbeddings: [embedding],
      nResults: topK,
    });

    const topResults = [];
    
    if (results.documents && results.documents[0]) {
      for (let i = 0; i < results.documents[0].length; i++) {
        topResults.push({
          text: results.documents[0][i] || '',
          metadata: results.metadatas?.[0]?.[i] || {},
          distance: results.distances?.[0]?.[i] || 0,
        });
      }
    }
    
    console.log(`✅ Returning ${topResults.length} results from ChromaDB`);
    return topResults;
  } catch (error) {
    console.error('Error searching documents:', error);
    return [];
  }
}

// Helper function to check vector store status
export async function getVectorStoreStats() {
  try {
    const collection = await getCollection();
    const count = await collection.count();
    
    // Get all documents (limit to 1000 for performance)
    const results = await collection.get({
      limit: 1000,
    });
    
    const documents = [];
    if (results.documents) {
      for (let i = 0; i < results.documents.length; i++) {
        documents.push({
          id: results.ids[i],
          textPreview: (results.documents[i] || '').substring(0, 100) + '...',
          metadata: results.metadatas?.[i] || {},
        });
      }
    }
    
    return {
      documentCount: count,
      documents,
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    return {
      documentCount: 0,
      documents: [],
    };
  }
}

// Clear all documents from vector store
export async function clearVectorStore() {
  try {
    await client.deleteCollection({ name: COLLECTION_NAME });
    await getCollection(); // Recreate empty collection
    console.log('🗑️ ChromaDB collection cleared');
    return { success: true, message: 'All documents removed' };
  } catch (error: any) {
    console.error('Error clearing vector store:', error);
    throw new Error(error.message || 'Failed to clear vector store');
  }
}

// Delete documents by filename
export async function deleteDocumentByFilename(filename: string) {
  try {
    const collection = await getCollection();
    
    // Get all documents with this filename
    const results = await collection.get({
      where: { filename },
    });
    
    if (results.ids.length > 0) {
      await collection.delete({
        ids: results.ids,
      });
      
      console.log(`🗑️ Deleted ${results.ids.length} chunks for file: ${filename}`);
      
      return { 
        success: true, 
        message: `Deleted ${results.ids.length} chunks`,
        deletedCount: results.ids.length,
      };
    }
    
    return {
      success: true,
      message: 'No documents found with that filename',
      deletedCount: 0,
    };
  } catch (error: any) {
    console.error('Error deleting document:', error);
    throw new Error(error.message || 'Failed to delete document');
  }
}
