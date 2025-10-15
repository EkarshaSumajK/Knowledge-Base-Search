'use client';

import { useState, useEffect } from 'react';
import { FileIcon, RefreshCwIcon } from 'lucide-react';

interface DocumentInfo {
  filename: string;
  chunks: number;
  uploadedAt: string;
}

export function DocumentList() {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/vector-store');
      const data = await response.json();
      
      // Group by filename and count chunks
      const docMap = new Map<string, DocumentInfo>();
      
      data.documents?.forEach((doc: any) => {
        const filename = doc.metadata?.filename || 'Unknown';
        if (docMap.has(filename)) {
          const existing = docMap.get(filename)!;
          existing.chunks++;
        } else {
          docMap.set(filename, {
            filename,
            chunks: 1,
            uploadedAt: doc.metadata?.uploadedAt || new Date().toISOString(),
          });
        }
      });
      
      setDocuments(Array.from(docMap.values()));
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  if (documents.length === 0 && !loading) {
    return null;
  }

  return (
    <div className="mb-4 bg-card rounded-lg p-4 border border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <FileIcon className="h-4 w-4" />
          Documents in Knowledge Base ({documents.length})
        </h3>
        <button
          onClick={fetchDocuments}
          disabled={loading}
          className="p-1 hover:bg-accent rounded transition-colors"
          title="Refresh"
        >
          <RefreshCwIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <div className="space-y-2">
        {documents.map((doc, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2 bg-secondary rounded text-sm"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <FileIcon className="h-3 w-3 text-primary flex-shrink-0" />
              <span className="truncate text-foreground">{doc.filename}</span>
            </div>
            <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
              {doc.chunks} chunks
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
