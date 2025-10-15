import mammoth from 'mammoth';
import PDFParser from 'pdf2json';

async function parsePDF(buffer: Buffer): Promise<{ text: string }> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    
    pdfParser.on('pdfParser_dataError', (errData: any) => {
      reject(new Error(errData.parserError));
    });
    
    pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
      try {
        // Helper function to safely decode URI components
        const safeDecode = (str: string): string => {
          try {
            return decodeURIComponent(str);
          } catch {
            // If decoding fails, return the original string
            return str;
          }
        };
        
        // Extract text from all pages
        const text = pdfData.Pages.map((page: any) => {
          return page.Texts.map((textItem: any) => {
            const rawText = textItem.R.map((r: any) => r.T).join('');
            return safeDecode(rawText);
          }).join(' ');
        }).join('\n');
        
        resolve({ text });
      } catch (error: any) {
        reject(error);
      }
    });
    
    pdfParser.parseBuffer(buffer);
  });
}

export async function processDocument(
  file: File
): Promise<{ text: string; metadata: any }> {
  const buffer = await file.arrayBuffer();
  const fileType = file.name.split('.').pop()?.toLowerCase();

  let text = '';
  
  if (fileType === 'pdf') {
    const data = await parsePDF(Buffer.from(buffer));
    text = data.text;
  } else if (fileType === 'docx') {
    const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
    text = result.value;
  } else if (fileType === 'txt') {
    text = new TextDecoder().decode(buffer);
  } else {
    throw new Error(`Unsupported file type: ${fileType}`);
  }

  return {
    text: text.trim(),
    metadata: {
      filename: file.name,
      fileType,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    },
  };
}

export function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  // Handle empty or very short text
  if (!text || text.length === 0) {
    return [];
  }
  
  if (text.length <= chunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  let start = 0;
  const maxChunks = 10000; // Safety limit to prevent memory issues
  let chunkCount = 0;

  while (start < text.length && chunkCount < maxChunks) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    chunkCount++;
    
    // Move forward, accounting for overlap
    start = end - overlap;
    
    // Prevent infinite loop if overlap >= chunkSize
    if (start <= chunks.length * chunkSize - (chunks.length * overlap)) {
      start = end;
    }
    
    if (start >= text.length) break;
  }

  return chunks;
}
