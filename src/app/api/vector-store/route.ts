import { NextResponse } from 'next/server';
import { getVectorStoreStats, clearVectorStore, deleteDocumentByFilename } from '@/lib/vector-store';

export async function GET() {
  try {
    const stats = await getVectorStoreStats();
    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get stats' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const filename = url.searchParams.get('filename');
    
    if (filename) {
      // Delete specific document
      const result = await deleteDocumentByFilename(filename);
      return NextResponse.json(result);
    } else {
      // Delete all documents
      const result = await clearVectorStore();
      return NextResponse.json(result);
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete documents' },
      { status: 500 }
    );
  }
}
