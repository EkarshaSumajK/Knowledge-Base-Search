'use client';

import { useState, useEffect } from 'react';
import { UploadIcon, FileIcon, XIcon, RefreshCwIcon, CheckCircleIcon, ChevronDownIcon, ChevronUpIcon, Trash2Icon } from 'lucide-react';

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
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [inputMode, setInputMode] = useState<'file' | 'text'>('file');
  const [textInput, setTextInput] = useState('');
  const [textTitle, setTextTitle] = useState('');

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

  // Auto-expand if documents exist
  useEffect(() => {
    if (documents.length > 0 && !isExpanded) {
      setIsExpanded(true);
    }
  }, [documents.length]);

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
      
      // Expand the section to show uploaded documents
      setIsExpanded(true);
      
      // Refresh document list immediately (now that we reload from disk)
      await fetchDocuments();
      
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

  const handleTextUpload = async () => {
    if (!textInput.trim()) return;

    setUploading(true);
    setError(null);
    setUploadSuccess(false);

    try {
      const filename = textTitle.trim() || `text-${Date.now()}.txt`;
      const blob = new Blob([textInput], { type: 'text/plain' });
      const file = new File([blob], filename, { type: 'text/plain' });

      const formData = new FormData();
      formData.append('files', file);

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      setTextInput('');
      setTextTitle('');
      setUploadSuccess(true);
      setIsExpanded(true);
      
      await fetchDocuments();
      
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

  const handleDeleteAll = async () => {
    setDeleting(true);
    setError(null);

    try {
      const response = await fetch('/api/vector-store', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete documents');
      }

      setDocuments([]);
      setShowDeleteConfirm(false);
      
      setTimeout(() => {
        fetchDocuments();
      }, 500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteDocument = async (filename: string) => {
    setError(null);

    try {
      const response = await fetch(`/api/vector-store?filename=${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete document');
      }

      // Refresh document list
      await fetchDocuments();
    } catch (err: any) {
      setError(err.message);
    }
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
            {/* Tab Selector */}
            <div className="flex gap-2 border-b border-border">
              <button
                onClick={() => setInputMode('file')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  inputMode === 'file'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Upload Files
              </button>
              <button
                onClick={() => setInputMode('text')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  inputMode === 'text'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Paste Text
              </button>
            </div>

            {/* File Upload Mode */}
            {inputMode === 'file' && (
              <>
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
              </>
            )}

            {/* Text Input Mode */}
            {inputMode === 'text' && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Document Title (optional)
                  </label>
                  <input
                    type="text"
                    value={textTitle}
                    onChange={(e) => setTextTitle(e.target.value)}
                    placeholder="e.g., Product Documentation"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    disabled={uploading}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Paste Your Text
                  </label>
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Paste your document content here..."
                    rows={10}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-y"
                    disabled={uploading}
                  />
                </div>
                <button
                  onClick={handleTextUpload}
                  disabled={uploading || !textInput.trim()}
                  className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {uploading ? 'Adding...' : 'Add to Knowledge Base'}
                </button>
              </div>
            )}
          </div>

      {/* Document List */}
      {documents.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Uploaded Documents ({documents.length})
            </h3>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs text-destructive hover:text-destructive/80 flex items-center gap-1 transition-colors"
              >
                <Trash2Icon className="h-3 w-3" />
                Remove All
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Are you sure?</span>
                <button
                  onClick={handleDeleteAll}
                  disabled={deleting}
                  className="text-xs px-2 py-1 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Yes, Delete All'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="text-xs px-2 py-1 bg-secondary text-foreground rounded hover:bg-secondary/80"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          <div className="space-y-2">
            {documents.map((doc, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-secondary rounded-lg group"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileIcon className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm truncate text-foreground">{doc.filename}</span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    ({doc.chunks} chunks)
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteDocument(doc.filename)}
                  className="p-1.5 hover:bg-destructive/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete this document"
                >
                  <Trash2Icon className="h-4 w-4 text-destructive" />
                </button>
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
