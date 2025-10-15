import { streamText, type UIMessage, convertToModelMessages } from 'ai';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { searchDocuments } from '@/lib/vector-store';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
    model,
    useRAG,
  }: { messages: UIMessage[]; model: string; useRAG: boolean } =
    await req.json();

  // Get the last user message for RAG retrieval
  const lastUserMessage = messages
    .filter((m) => m.role === 'user')
    .pop();
  
  let context = '';
  let sources: { url: string; title: string }[] = [];

  // Perform RAG retrieval if enabled
  if (useRAG && lastUserMessage) {
    let query = '';
    
    if (typeof lastUserMessage.content === 'string') {
      query = lastUserMessage.content;
    } else if (Array.isArray(lastUserMessage.content)) {
      query = lastUserMessage.content
        .filter((part: any) => part.type === 'text')
        .map((part: any) => part.text)
        .join(' ');
    }

    console.log('🔍 RAG Query:', query);
    const relevantDocs = await searchDocuments(query, 5);
    console.log('📄 Found documents:', relevantDocs.length);
    
    if (relevantDocs.length > 0) {
      console.log('📊 Top similarity:', relevantDocs[0].distance);
      
      // Get unique filenames from the retrieved documents
      const uniqueFiles = [...new Set(relevantDocs.map(doc => doc.metadata?.filename).filter(Boolean))];
      
      // Format context without document numbers - just clean content
      context = relevantDocs
        .map((doc) => doc.text.trim())
        .join('\n\n---\n\n');
      
      // Create sources list with unique filenames
      const uniqueSources = new Map<string, { url: string; title: string }>();
      relevantDocs.forEach((doc, idx) => {
        const filename = doc.metadata?.filename || `Source ${idx + 1}`;
        if (!uniqueSources.has(filename)) {
          uniqueSources.set(filename, {
            url: `#doc-${idx}`,
            title: filename,
          });
        }
      });
      sources = Array.from(uniqueSources.values());
    } else {
      console.log('⚠️ No documents found in vector store');
    }
  }

  const systemPrompt = useRAG && context
    ? `You are an expert AI assistant with access to a comprehensive knowledge base. Your goal is to provide clear, accurate, and naturally flowing responses that synthesize information from the available sources.

KNOWLEDGE BASE CONTEXT:
${context}

RESPONSE GUIDELINES:

1. **Natural Conversation Style**
   - Write in a conversational yet professional tone, similar to ChatGPT or Perplexity
   - Avoid mentioning "documents", "chunks", or "sources" in the main response body
   - Integrate information seamlessly as if it's your own knowledge
   - Use "I" statements naturally (e.g., "Based on the information available..." or "From what I understand...")

2. **Structure Your Response**
   - Start with a clear, direct answer to the question
   - Provide comprehensive explanations with relevant details
   - Use 2-4 well-organized paragraphs for complex topics
   - Break down information logically and progressively

3. **Formatting for Clarity**
   - Use bullet points or numbered lists when presenting multiple items, steps, or key points
   - Apply **bold** for emphasis on important terms or concepts
   - Use proper markdown formatting for readability
   - Keep paragraphs focused and digestible (3-5 sentences each)

4. **Content Quality**
   - Be thorough and informative - provide depth, not just surface-level answers
   - Include specific details, examples, and explanations from the knowledge base
   - If the question has multiple aspects, address each one systematically
   - Connect related concepts to provide comprehensive understanding
   - If information is incomplete or unavailable, acknowledge it honestly

5. **Accuracy & Transparency**
   - Only use information from the provided knowledge base context
   - If the context doesn't contain relevant information, clearly state: "I don't have specific information about that in my current knowledge base"
   - Don't make up or infer information beyond what's provided
   - Maintain factual accuracy above all else

Remember: Your response should feel natural and authoritative, as if you're an expert explaining the topic, not a system retrieving documents. The user should feel they're having a conversation with a knowledgeable assistant, not a search engine.`
    : 'You are a helpful AI assistant. Provide clear, detailed, and well-structured responses. Use a conversational yet professional tone. Format your answers with proper paragraphs, bullet points where appropriate, and markdown for readability. Be thorough and informative while remaining concise and focused on the user\'s question.';

  // Use Gemini if model starts with 'gemini', otherwise use OpenAI
  const selectedModel = model.startsWith('gemini') 
    ? google(model)
    : openai(model);

  const result = streamText({
    model: selectedModel,
    messages: convertToModelMessages(messages),
    system: systemPrompt,
    maxTokens: 65525,
    temperature: 0,
  });

  // Send sources back to the client if RAG was used
  return result.toUIMessageStreamResponse({
    sendSources: useRAG && sources.length > 0,
    sendReasoning: true,
  });
}
