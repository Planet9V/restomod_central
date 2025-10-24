# Web Scraping Architecture - Multi-Tool Resilience

## ⚠️ DEVELOPMENT ENVIRONMENT - SECRETS INCLUDED
**This configuration includes hardcoded API keys for development convenience.**
**DO NOT use in production. Replace with environment variable management.**

---

## Overview

Robust web scraping system using multiple search engines and scraping tools to bypass restrictions and ensure data availability.

## Tool Stack

### 1. **Apify** (Primary - Commercial Web Scraping)
- **Use Case**: Complex website scraping with JavaScript rendering
- **Strengths**: Proxy rotation, CAPTCHA solving, robust infrastructure
- **Limitations**: Rate limits on free tier, costs per scrape
- **Fallback Trigger**: 429 errors, timeouts > 30s, repeated failures

### 2. **Brave Search API** (Fallback 1 - Fast Search)
- **Use Case**: Quick web search for vehicle listings, events, market data
- **Strengths**: Fast, no rate limiting (paid tier), privacy-focused
- **Limitations**: Search results only, no deep scraping
- **Fallback Trigger**: API errors, rate limits

### 3. **Tavily** (Fallback 2 - AI-Powered Search)
- **Use Case**: AI-enhanced search with structured results
- **Strengths**: Context-aware, good for research and articles
- **Limitations**: API rate limits, focused on recent data
- **Fallback Trigger**: Service unavailable, quota exceeded

### 4. **Perplexity** (Fallback 3 - Knowledge Search)
- **Use Case**: Complex queries requiring context and reasoning
- **Strengths**: Deep research capabilities, citation tracking
- **Limitations**: Slower responses, API costs
- **Fallback Trigger**: Already configured, use for specific queries

### 5. **Jina AI Search** (Fallback 4 - Neural Search)
- **Use Case**: Semantic search, embeddings-based retrieval
- **Strengths**: Understanding intent, multilingual support
- **Limitations**: Requires API key, specialized use cases
- **Fallback Trigger**: Last resort for failed searches

---

## Scraping Flow

```
START
  │
  ▼
┌─────────────────┐
│  Query Input    │
│  - Type (car,   │
│    event, etc)  │
│  - Parameters   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Rate Limiter Check             │
│  - Per-tool rate limits         │
│  - Global rate limit            │
│  - Exponential backoff queue    │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Tool 1: Apify                  │
│  Try primary scraping           │
└────────┬────────────────────────┘
         │
    Success? ──YES──┐
         │          │
        NO          │
         │          │
         ▼          │
┌─────────────────────────────────┐
│  Tool 2: Brave Search API       │
│  Try fast search                │
└────────┬────────────────────────┘
         │                         │
    Success? ──YES──┐              │
         │          │              │
        NO          │              │
         │          │              │
         ▼          │              │
┌─────────────────────────────────┐
│  Tool 3: Tavily                 │
│  Try AI-powered search          │
└────────┬────────────────────────┘
         │          │              │
    Success? ──YES──┤              │
         │          │              │
        NO          │              │
         │          │              │
         ▼          │              │
┌─────────────────────────────────┐
│  Tool 4: Perplexity             │
│  Try knowledge search           │
└────────┬────────────────────────┘
         │          │              │
    Success? ──YES──┤              │
         │          │              │
        NO          │              │
         │          │              │
         ▼          │              │
┌─────────────────────────────────┐
│  Tool 5: Jina                   │
│  Last resort neural search      │
└────────┬────────────────────────┘
         │          │              │
    Success? ──YES──┤              │
         │          │              │
        NO          │              │
         │          │              │
         ▼          │              │
    ┌────────┐     │              │
    │ FAILED │     │              │
    │  Log   │     │              │
    │ & Skip │     │              │
    └────────┘     │              │
                   │              │
                   ▼              │
         ┌──────────────────┐    │
         │  Result Received │◄───┘
         └────────┬─────────┘
                  │
                  ▼
         ┌──────────────────┐
         │   Validation     │
         │  - Schema check  │
         │  - Required flds │
         │  - Data quality  │
         └────────┬─────────┘
                  │
             Valid? ──NO──► Discard
                  │
                 YES
                  │
                  ▼
         ┌──────────────────┐
         │  Deduplication   │
         │  - Hash check    │
         │  - Similar check │
         └────────┬─────────┘
                  │
            Duplicate? ──YES──► Skip
                  │
                 NO
                  │
                  ▼
         ┌──────────────────┐
         │  Enrichment      │
         │  - Add metadata  │
         │  - Calculate     │
         │    investment    │
         │    grade         │
         └────────┬─────────┘
                  │
                  ▼
         ┌──────────────────┐
         │  Save to JSON    │
         │  /data/raw/      │
         │  YYYY-MM-DD/     │
         │  {type}.json     │
         └────────┬─────────┘
                  │
                  ▼
              SUCCESS
```

---

## Rate Limiting Strategy

### Per-Tool Limits

| Tool | Free Tier | Paid Tier | Our Limit (Dev) |
|------|-----------|-----------|-----------------|
| Apify | 5 req/min | 100 req/min | 10 req/min |
| Brave | N/A | 1000 req/day | 50 req/hour |
| Tavily | 10 req/min | 100 req/min | 20 req/min |
| Perplexity | 5 req/min | 50 req/min | 10 req/min |
| Jina | 10 req/min | 100 req/min | 20 req/min |

### Global Rate Limit
- **Max concurrent requests**: 5
- **Delay between requests**: 2-5 seconds (randomized)
- **Exponential backoff**: 2s → 4s → 8s → 16s → 32s

### Implementation
```typescript
class RateLimiter {
  private queues: Map<string, Queue> = new Map();

  async throttle(tool: string, fn: () => Promise<any>) {
    const queue = this.getQueue(tool);
    return queue.add(fn);
  }

  private getQueue(tool: string): Queue {
    if (!this.queues.has(tool)) {
      const limits = this.getLimits(tool);
      this.queues.set(tool, new Queue(limits));
    }
    return this.queues.get(tool)!;
  }
}
```

---

## Error Handling

### Retry Strategy

```typescript
interface RetryConfig {
  maxAttempts: number;      // 3 attempts per tool
  backoffMultiplier: number; // 2x each time
  initialDelay: number;      // 2 seconds
  maxDelay: number;          // 32 seconds
}

async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig
): Promise<T> {
  let lastError: Error;
  let delay = config.initialDelay;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < config.maxAttempts) {
        await sleep(delay);
        delay = Math.min(delay * config.backoffMultiplier, config.maxDelay);
      }
    }
  }

  throw lastError;
}
```

### Error Types

| Error Type | Action |
|------------|--------|
| Network Timeout | Retry with next tool |
| 429 Rate Limit | Wait & retry, then fallback |
| 403 Forbidden | Skip to next tool |
| 500 Server Error | Retry 2x, then next tool |
| Invalid Response | Skip to next tool |
| Parsing Error | Log & skip |

---

## Data Storage Structure

### JSON File Organization

```
/data/
├── raw/                          # Raw scraped data
│   ├── 2025-10-24/
│   │   ├── vehicles/
│   │   │   ├── apify_001.json
│   │   │   ├── brave_002.json
│   │   │   └── meta.json
│   │   ├── events/
│   │   │   ├── tavily_001.json
│   │   │   └── meta.json
│   │   └── articles/
│   │       ├── perplexity_001.json
│   │       └── meta.json
│   └── 2025-10-25/
│       └── ...
├── processed/                    # Validated & deduplicated
│   ├── 2025-10-24/
│   │   ├── vehicles.json
│   │   ├── events.json
│   │   └── articles.json
│   └── ...
└── failed/                       # Failed scrapes for review
    ├── 2025-10-24/
    │   ├── errors.json
    │   └── retry_queue.json
    └── ...
```

### JSON Schema

#### Vehicle Record
```json
{
  "id": "uuid-v4",
  "source": "apify",
  "sourceUrl": "https://...",
  "scrapedAt": "2025-10-24T14:30:00Z",
  "data": {
    "make": "Ford",
    "model": "Mustang",
    "year": 1967,
    "price": 89500,
    "description": "...",
    "imageUrl": "...",
    "location": {
      "city": "Los Angeles",
      "state": "CA",
      "region": "West"
    },
    "category": "Muscle Cars",
    "condition": "Excellent",
    "stockNumber": "GT-1967-001"
  },
  "metadata": {
    "toolUsed": "apify",
    "processingTime": 2341,
    "confidence": 0.95,
    "investmentGrade": "A+",
    "hash": "sha256..."
  }
}
```

#### Meta File
```json
{
  "date": "2025-10-24",
  "totalRecords": 125,
  "sources": {
    "apify": 80,
    "brave": 30,
    "tavily": 15
  },
  "stats": {
    "successRate": 0.92,
    "averageTime": 3200,
    "failures": 10
  },
  "tools": [
    {
      "name": "apify",
      "attempts": 100,
      "successes": 80,
      "failures": 20,
      "avgTime": 3500
    }
  ]
}
```

---

## Proxy & User Agent Rotation

### Proxy Strategy
```typescript
const proxyPool = [
  'http://proxy1.example.com:8080',
  'http://proxy2.example.com:8080',
  'http://proxy3.example.com:8080',
  // Residential proxies for tough sites
  'http://residential-proxy.luminati.io',
];

function getRandomProxy(): string {
  return proxyPool[Math.floor(Math.random() * proxyPool.length)];
}
```

### User Agent Rotation
```typescript
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36...',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36...',
];

function getRandomUserAgent(): string {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}
```

---

## Monitoring & Logging

### Metrics to Track
- **Success Rate**: % of successful scrapes per tool
- **Response Time**: Average time per tool
- **Error Rate**: Failures per tool
- **Data Quality**: Validation success rate
- **Coverage**: Unique records per day

### Logging Format
```json
{
  "timestamp": "2025-10-24T14:30:00Z",
  "level": "INFO",
  "service": "scraper",
  "tool": "apify",
  "action": "scrape_vehicle",
  "status": "success",
  "duration": 2341,
  "recordId": "uuid",
  "metadata": {
    "retryCount": 0,
    "proxyUsed": "proxy1",
    "userAgent": "Mozilla/5.0..."
  }
}
```

---

## API Key Configuration (DEVELOPMENT)

### ⚠️ HARDCODED FOR DEVELOPMENT - DO NOT USE IN PRODUCTION

```typescript
// server/config/scraping-keys.ts
export const SCRAPING_API_KEYS = {
  // ⚠️ DEVELOPMENT ONLY - REPLACE WITH ENV VARS IN PRODUCTION
  APIFY_API_KEY: 'apify_api_YOUR_KEY_HERE',
  BRAVE_API_KEY: 'BSA_YOUR_KEY_HERE',
  TAVILY_API_KEY: 'tvly-YOUR_KEY_HERE',
  PERPLEXITY_API_KEY: 'pplx-YOUR_PERPLEXITY_API_KEY_HERE_DEV',
  JINA_API_KEY: 'jina_YOUR_KEY_HERE',
};

// Mark as development
export const ENVIRONMENT = 'DEVELOPMENT';
export const USE_HARDCODED_KEYS = true;

if (process.env.NODE_ENV === 'production') {
  throw new Error('⚠️ CRITICAL: Hardcoded API keys detected in production! Use environment variables.');
}
```

---

## Implementation Checklist

### Week 1 Tasks
- [ ] Install tool SDKs (Apify, Brave, Tavily, Jina)
- [ ] Create scraping service architecture
- [ ] Implement rate limiter
- [ ] Build retry logic with exponential backoff
- [ ] Create JSON file storage structure
- [ ] Implement validation & deduplication
- [ ] Add proxy rotation
- [ ] Add user agent rotation
- [ ] Create monitoring dashboard
- [ ] Write comprehensive tests

### Dependencies to Install
```bash
npm install apify-client @mendable/firecrawl-js tavily jina-ai bottleneck p-retry
```

### Testing Strategy
1. Unit tests for each tool adapter
2. Integration tests for fallback chain
3. Load tests for rate limiting
4. End-to-end tests for complete pipeline

---

## Next Steps
1. Implement base scraper service (see IMPLEMENTATION_PLAN.md)
2. Migrate to PostgreSQL (see POSTGRES_MIGRATION.md)
3. Dockerize application (see DOCKER_SETUP.md)
