# Chatbot Setup Complete! 🎉

Your AI chatbot with reasoning, web search, and model picker is now ready.

## What's Been Set Up

✅ AI SDK and AI Elements installed
✅ Chatbot UI with file attachments support
✅ API route handler for streaming responses
✅ Model picker (GPT-4o and Deepseek R1)
✅ Web search toggle with Perplexity integration
✅ Reasoning display for models that support it
✅ Source citations for web search results

## Next Steps

### 1. Add Your API Key

Edit `.env.local` and add your AI Gateway API key:

```bash
AI_GATEWAY_API_KEY=your_actual_api_key_here
```

Get your key from: https://vercel.com/[team]/~/ai/api-keys

### 2. Run the Development Server

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

## Features

- **Model Selection**: Switch between GPT-4o and Deepseek R1
- **Web Search**: Toggle web search to get real-time information with citations
- **File Attachments**: Drag and drop files or use the action menu
- **Reasoning Display**: See the model's reasoning process (for supported models)
- **Message Actions**: Copy responses or regenerate answers
- **Auto-scroll**: Automatically scrolls to new messages

## Customization

### Add More Models

Edit `src/app/page.tsx` and add to the `models` array:

```typescript
const models = [
  { name: 'GPT 4o', value: 'openai/gpt-4o' },
  { name: 'Deepseek R1', value: 'deepseek/deepseek-r1' },
  { name: 'Claude 3.5', value: 'anthropic/claude-3-5-sonnet' }, // Add your model
];
```

### Modify System Prompt

Edit `src/app/api/chat/route.ts` and change the `system` parameter:

```typescript
system: 'Your custom system prompt here'
```

## Troubleshooting

- If components are missing, run: `npx ai-elements@latest`
- Make sure your API key is set in `.env.local`
- Restart the dev server after changing environment variables

Enjoy building with AI Elements! 🚀
