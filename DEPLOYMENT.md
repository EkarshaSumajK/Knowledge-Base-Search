# Deployment Guide 🚀

Deploy your Knowledge Base Search Engine to production.

## Prerequisites

- OpenAI API key
- ChromaDB instance (hosted or self-hosted)
- Vercel account (recommended) or any Node.js hosting

## Option 1: Deploy to Vercel (Recommended)

### 1. Prepare ChromaDB

You need a hosted ChromaDB instance. Options:

**A. Self-hosted on a VPS:**
```bash
# On your server
docker run -d -p 8000:8000 \
  -v chroma-data:/chroma/chroma \
  --name chromadb \
  chromadb/chroma
```

**B. Use a managed service:**
- Check ChromaDB Cloud (when available)
- Or deploy on Railway, Render, etc.

### 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### 3. Set Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```
OPENAI_API_KEY=sk-...
CHROMA_HOST=https://your-chroma-instance.com
```

### 4. Update ChromaDB Client

Edit `src/lib/vector-store.ts`:

```typescript
const client = new ChromaClient({
  path: process.env.CHROMA_HOST || "http://localhost:8000"
});
```

## Option 2: Deploy to Railway

### 1. Create railway.json

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### 2. Deploy

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### 3. Add ChromaDB Service

In Railway dashboard:
- Add new service → Docker
- Image: `chromadb/chroma`
- Expose port 8000
- Note the internal URL

### 4. Set Environment Variables

```
OPENAI_API_KEY=sk-...
CHROMA_HOST=http://chromadb.railway.internal:8000
```

## Option 3: Docker Compose

### 1. Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - CHROMA_HOST=http://chromadb:8000
    depends_on:
      - chromadb

  chromadb:
    image: chromadb/chroma
    ports:
      - "8000:8000"
    volumes:
      - chroma-data:/chroma/chroma

volumes:
  chroma-data:
```

### 2. Create Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### 3. Deploy

```bash
docker-compose up -d
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for embeddings and chat |
| `CHROMA_HOST` | No | ChromaDB host URL (default: localhost:8000) |
| `ANTHROPIC_API_KEY` | No | For Claude models |
| `NODE_ENV` | No | Set to 'production' |

## Post-Deployment Checklist

- [ ] Test document upload
- [ ] Verify ChromaDB connection
- [ ] Test RAG queries
- [ ] Check theme switching
- [ ] Monitor API usage
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure rate limiting
- [ ] Set up backups for ChromaDB data

## Performance Optimization

### 1. Enable Caching

Add Redis for query caching:

```typescript
// src/lib/cache.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

export async function getCachedEmbedding(text: string) {
  return await redis.get(`embedding:${text}`);
}
```

### 2. Optimize Embeddings

Batch embed documents:

```typescript
// Process multiple documents at once
const { embeddings } = await embedMany({
  model: openai.embedding('text-embedding-3-small'),
  values: texts,
});
```

### 3. Add Rate Limiting

```bash
npm install @upstash/ratelimit
```

```typescript
// src/middleware.ts
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});
```

## Monitoring

### 1. Add Analytics

```typescript
// Track queries
analytics.track('query', {
  model,
  useRAG,
  responseTime,
});
```

### 2. Error Tracking

```bash
npm install @sentry/nextjs
```

### 3. Logging

```typescript
// Use structured logging
console.log(JSON.stringify({
  level: 'info',
  message: 'Document uploaded',
  metadata: { filename, chunks },
}));
```

## Security Considerations

1. **API Key Protection**
   - Never expose API keys in client code
   - Use environment variables
   - Rotate keys regularly

2. **File Upload Validation**
   - Limit file sizes
   - Validate file types
   - Scan for malware

3. **Rate Limiting**
   - Prevent abuse
   - Protect API costs

4. **Authentication**
   - Add user authentication
   - Implement access controls

## Scaling

### Horizontal Scaling

- Deploy multiple app instances
- Use load balancer
- Share ChromaDB instance

### Vertical Scaling

- Increase ChromaDB resources
- Use larger embedding models
- Optimize chunk sizes

## Backup Strategy

### ChromaDB Data

```bash
# Backup
docker exec chromadb tar czf /backup/chroma-$(date +%Y%m%d).tar.gz /chroma/chroma

# Restore
docker exec chromadb tar xzf /backup/chroma-20240101.tar.gz -C /
```

### Database Exports

```typescript
// Export collection
const collection = await client.getCollection('knowledge_base');
const data = await collection.get();
// Save to S3 or backup storage
```

## Troubleshooting

### High Latency
- Check ChromaDB response times
- Optimize chunk sizes
- Use faster embedding models
- Add caching layer

### Out of Memory
- Reduce batch sizes
- Increase server resources
- Implement pagination

### API Rate Limits
- Implement exponential backoff
- Add request queuing
- Use multiple API keys

## Support

For deployment issues:
1. Check logs: `vercel logs` or `railway logs`
2. Verify environment variables
3. Test ChromaDB connection
4. Review API quotas

---

Need help? Open an issue on GitHub!
