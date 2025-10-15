'use client';

import { useState, useEffect } from 'react';
import { UploadIcon, FileIcon, XIcon, RefreshCwIcon, CheckCircleIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

interface DocumentInfo {
  filename: string;
  chunks: number;
  uploadedAt: string;
}

interface DocumentManagerProps {
  onUploadComplete?: () => void;
}

export function DocumentManager({ onUploadComplete }: DocumentManagerProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchDocuments = async () => {
    setLoadingDocs(true);
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
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setError(null);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      setFiles([]);
      setUploadSuccess(true);
      await fetchDocuments(); // Refresh document list
      
      if (onUploadComplete) {
        onUploadComplete();
      }
      
      setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const triggerFileInput = () => {
    document.getElementById('file-upload')?.click();
  };

  return (
    <div className="bg-card rounded-lg border border-border">
      {/* Header - Always Visible */}
      <div
        className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors rounded-t-lg cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <UploadIcon className="h-5 w-5 text-muted-foreground" />
          <div className="text-left">
            <h2 className="text-base font-semibold text-foreground">
              Knowledge Base Documents
            </h2>
            <p className="text-xs text-muted-foreground">
              {documents.length} {documents.length === 1 ? 'document' : 'documents'} uploaded
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {documents.length > 0 && isExpanded && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                fetchDocuments();
              }}
              disabled={loadingDocs}
              className="p-2 hover:bg-accent rounded transition-colors"
              title="Refresh document list"
            >
              <RefreshCwIcon className={`h-4 w-4 ${loadingDocs ? 'animate-spin' : ''}`} />
            </button>
          )}
          {isExpanded ? (
            <ChevronUpIcon className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="p-4 pt-0 space-y-4 border-t border-border">
          {/* Success Message */}
          {uploadSuccess && (
            <div className="p-3 bg-primary/10 text-primary rounded-lg flex items-center gap-2 border border-primary/20">
              <CheckCircleIcon className="h-5 w-5" />
              <span>Documents uploaded successfully!</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm border border-destructive/20">
              {error}
            </div>
          )}

          {/* Upload Section */}
          <div className="space-y-4">
            <br></br>
        <input
          type="file"
          multiple
          accept=".pdf,.txt,.docx"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        
        <button
          onClick={triggerFileInput}
          disabled={uploading}
          className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50"
        >
          <UploadIcon className="h-5 w-5" />
          Choose Documents to Upload
        </button>
        
        <p className="text-xs text-center text-muted-foreground">
          Supports PDF, TXT, or DOCX files (up to 100 MB each)
        </p>

        {/* Selected Files */}
        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Selected Files:</p>
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-secondary rounded-lg"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileIcon className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm truncate">{file.name}</span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-accent rounded transition-colors"
                  disabled={uploading}
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {uploading ? 'Uploading...' : `Upload ${files.length} file(s)`}
            </button>
          </div>
        )}
      </div>

      {/* Document List */}
      {documents.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-border">
          <h3 className="text-sm font-semibold text-foreground">
            Uploaded Documents ({documents.length})
          </h3>
          <div className="space-y-2">
            {documents.map((doc, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-secondary rounded-lg"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileIcon className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm truncate text-foreground">{doc.filename}</span>
                </div>
                <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                  {doc.chunks} chunks
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

          {/* Empty State */}
          {documents.length === 0 && !loadingDocs && (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No documents uploaded yet. Upload your first document to get started!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
