import { NextRequest, NextResponse } from 'next/server';
import { processDocument, chunkText } from '@/lib/document-processor';
import { addDocuments } from '@/lib/vector-store';

// Configure route to handle large file uploads
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds timeout

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const processedDocs = [];

    for (const file of files) {
      console.log(`📄 Processing file: ${file.name} (${file.size} bytes)`);
      
      const { text, metadata } = await processDocument(file);
      console.log(`📝 Extracted text length: ${text.length} characters`);
      
      const chunks = chunkText(text);
      console.log(`✂️ Created ${chunks.length} chunks`);

      const docs = chunks.map((chunk, idx) => ({
        id: `${file.name}-${Date.now()}-${idx}`,
        text: chunk,
        metadata: {
          ...metadata,
          chunkIndex: idx,
          totalChunks: chunks.length,
        },
      }));

      console.log(`🔄 Adding ${docs.length} documents to vector store...`);
      await addDocuments(docs);
      console.log(`✅ Documents added successfully`);
      
      processedDocs.push({
        filename: file.name,
        chunks: chunks.length,
      });
    }

    return NextResponse.json({
      success: true,
      documents: processedDocs,
    });
  } catch (error: any) {
    console.error('Document processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process documents' },
      { status: 500 }
    );
  }
}
