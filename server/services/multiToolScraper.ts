// ⚠️ DEVELOPMENT ENVIRONMENT - API KEYS FROM .ENV
// Multi-Tool Web Scraper with Fallback Chain
// Tools: Apify → Brave → Tavily → Perplexity → Jina

import { ApifyClient } from 'apify-client';
import Bottleneck from 'bottleneck';
import pRetry from 'p-retry';
import axios from 'axios';

export interface ScraperConfig {
  apifyApiKey?: string;
  braveApiKey?: string;
  tavilyApiKey?: string;
  perplexityApiKey?: string;
  jinaApiKey?: string;
  firecrawlApiKey?: string;
}

export interface ScrapeQuery {
  query: string;
  type: 'vehicle' | 'event' | 'article' | 'general';
  maxResults?: number;
  filters?: Record<string, any>;
}

export interface ScrapeResult {
  success: boolean;
  tool: string;
  data: any[];
  metadata: {
    query: string;
    timestamp: string;
    resultsCount: number;
    executionTime: number;
  };
  error?: string;
}

export class MultiToolScraper {
  private apify: ApifyClient | null = null;
  private rateLimiters: Map<string, Bottleneck>;
  private config: ScraperConfig;
  private toolOrder: string[] = ['firecrawl', 'brave', 'perplexity', 'apify', 'jina'];

  constructor(config: ScraperConfig) {
    this.config = config;

    // Initialize Apify client if key available
    if (config.apifyApiKey) {
      this.apify = new ApifyClient({ token: config.apifyApiKey });
    }

    // Set up rate limiters for each tool
    this.rateLimiters = new Map([
      // Apify: 10 requests/min = 6000ms between requests
      ['apify', new Bottleneck({
        minTime: 6000,
        maxConcurrent: 1,
        reservoir: 10,
        reservoirRefreshAmount: 10,
        reservoirRefreshInterval: 60 * 1000
      })],

      // Brave: 50 requests/hour = 72000ms between requests
      ['brave', new Bottleneck({
        minTime: 72000,
        maxConcurrent: 1,
        reservoir: 50,
        reservoirRefreshAmount: 50,
        reservoirRefreshInterval: 60 * 60 * 1000
      })],

      // Tavily: 20 requests/min = 3000ms between requests
      ['tavily', new Bottleneck({
        minTime: 3000,
        maxConcurrent: 1,
        reservoir: 20,
        reservoirRefreshAmount: 20,
        reservoirRefreshInterval: 60 * 1000
      })],

      // Perplexity: 10 requests/min = 6000ms between requests
      ['perplexity', new Bottleneck({
        minTime: 6000,
        maxConcurrent: 1,
        reservoir: 10,
        reservoirRefreshAmount: 10,
        reservoirRefreshInterval: 60 * 1000
      })],

      // Jina: 20 requests/min = 3000ms between requests
      ['jina', new Bottleneck({
        minTime: 3000,
        maxConcurrent: 1,
        reservoir: 20,
        reservoirRefreshAmount: 20,
        reservoirRefreshInterval: 60 * 1000
      })],

      // Firecrawl: 50 requests/min = 1200ms between requests
      ['firecrawl', new Bottleneck({
        minTime: 1200,
        maxConcurrent: 1,
        reservoir: 50,
        reservoirRefreshAmount: 50,
        reservoirRefreshInterval: 60 * 1000
      })],
    ]);
  }

  /**
   * Main scraping method with automatic fallback chain
   */
  async scrapeWithFallback(query: ScrapeQuery): Promise<ScrapeResult> {
    const startTime = Date.now();
    const errors: Array<{ tool: string; error: string }> = [];

    console.log(`🔍 Starting scrape: "${query.query}" (type: ${query.type})`);

    // Try each tool in order until one succeeds
    for (const tool of this.toolOrder) {
      // Skip if tool not configured
      if (!this.isToolConfigured(tool)) {
        console.log(`⏭️  Skipping ${tool} (not configured)`);
        continue;
      }

      try {
        console.log(`🔄 Attempting ${tool}...`);

        const result = await this.scrapeWithTool(tool, query);

        if (result.success && result.data.length > 0) {
          const executionTime = Date.now() - startTime;
          console.log(`✅ ${tool} succeeded! Found ${result.data.length} results in ${executionTime}ms`);

          return {
            ...result,
            metadata: {
              ...result.metadata,
              executionTime
            }
          };
        } else {
          errors.push({ tool, error: 'No results found' });
          console.log(`⚠️  ${tool} returned no results`);
        }
      } catch (error: any) {
        const errorMsg = error.message || String(error);
        errors.push({ tool, error: errorMsg });
        console.error(`❌ ${tool} failed:`, errorMsg);
      }
    }

    // All tools failed
    const executionTime = Date.now() - startTime;
    console.error(`💥 All tools failed for query: "${query.query}"`);

    return {
      success: false,
      tool: 'none',
      data: [],
      metadata: {
        query: query.query,
        timestamp: new Date().toISOString(),
        resultsCount: 0,
        executionTime
      },
      error: `All tools failed. Errors: ${JSON.stringify(errors)}`
    };
  }

  /**
   * Scrape using a specific tool
   */
  private async scrapeWithTool(tool: string, query: ScrapeQuery): Promise<ScrapeResult> {
    const limiter = this.rateLimiters.get(tool);
    if (!limiter) {
      throw new Error(`No rate limiter for tool: ${tool}`);
    }

    // Use rate limiter and retry logic
    return limiter.schedule(() =>
      pRetry(
        () => this.executeScrape(tool, query),
        {
          retries: 3,
          minTimeout: 2000,
          maxTimeout: 32000,
          factor: 2,
          onFailedAttempt: (error) => {
            console.log(`🔁 Retry ${error.attemptNumber}/${error.retriesLeft + error.attemptNumber} for ${tool}: ${error.message}`);
          }
        }
      )
    );
  }

  /**
   * Execute actual scraping logic for each tool
   */
  private async executeScrape(tool: string, query: ScrapeQuery): Promise<ScrapeResult> {
    switch (tool) {
      case 'firecrawl':
        return this.scrapeFirecrawl(query);
      case 'brave':
        return this.scrapeBrave(query);
      case 'perplexity':
        return this.scrapePerplexity(query);
      case 'apify':
        return this.scrapeApify(query);
      case 'jina':
        return this.scrapeJina(query);
      default:
        throw new Error(`Unknown tool: ${tool}`);
    }
  }

  /**
   * Firecrawl scraper (using MCP server via search)
   */
  private async scrapeFirecrawl(query: ScrapeQuery): Promise<ScrapeResult> {
    if (!this.config.firecrawlApiKey) {
      throw new Error('Firecrawl API key not configured');
    }

    try {
      const response = await axios.post(
        'https://api.firecrawl.dev/v1/search',
        {
          query: query.query,
          limit: query.maxResults || 10,
          scrapeOptions: {
            formats: ['markdown'],
            onlyMainContent: true
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.firecrawlApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const results = response.data.data || [];

      return {
        success: true,
        tool: 'firecrawl',
        data: results.map((item: any) => this.normalizeResult(item, 'firecrawl', query.type)),
        metadata: {
          query: query.query,
          timestamp: new Date().toISOString(),
          resultsCount: results.length
        }
      };
    } catch (error: any) {
      throw new Error(`Firecrawl error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Brave Search scraper
   */
  private async scrapeBrave(query: ScrapeQuery): Promise<ScrapeResult> {
    if (!this.config.braveApiKey) {
      throw new Error('Brave API key not configured');
    }

    try {
      const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
        params: {
          q: query.query,
          count: query.maxResults || 10
        },
        headers: {
          'X-Subscription-Token': this.config.braveApiKey,
          'Accept': 'application/json'
        },
        timeout: 30000
      });

      const results = response.data.web?.results || [];

      return {
        success: true,
        tool: 'brave',
        data: results.map((item: any) => this.normalizeResult(item, 'brave', query.type)),
        metadata: {
          query: query.query,
          timestamp: new Date().toISOString(),
          resultsCount: results.length
        }
      };
    } catch (error: any) {
      throw new Error(`Brave error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Perplexity scraper
   */
  private async scrapePerplexity(query: ScrapeQuery): Promise<ScrapeResult> {
    if (!this.config.perplexityApiKey) {
      throw new Error('Perplexity API key not configured');
    }

    try {
      const response = await axios.post(
        'https://api.perplexity.ai/chat/completions',
        {
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that searches the web and returns structured data about classic cars, car shows, and automotive articles. Return results in JSON format.'
            },
            {
              role: 'user',
              content: `Search for: ${query.query}. Return up to ${query.maxResults || 10} results as a JSON array with fields: title, url, description, source.`
            }
          ],
          return_citations: true
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.perplexityApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      );

      // Extract results from response
      const content = response.data.choices?.[0]?.message?.content || '[]';
      let results = [];

      try {
        // Try to parse JSON from response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          results = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        // Fallback: use citations if available
        results = response.data.citations || [];
      }

      return {
        success: true,
        tool: 'perplexity',
        data: results.map((item: any) => this.normalizeResult(item, 'perplexity', query.type)),
        metadata: {
          query: query.query,
          timestamp: new Date().toISOString(),
          resultsCount: results.length
        }
      };
    } catch (error: any) {
      throw new Error(`Perplexity error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Apify scraper
   */
  private async scrapeApify(query: ScrapeQuery): Promise<ScrapeResult> {
    if (!this.apify) {
      throw new Error('Apify not configured');
    }

    try {
      // Use Apify's Google Search scraper
      const run = await this.apify.actor('apify/google-search-scraper').call({
        queries: [query.query],
        maxPagesPerQuery: 1,
        resultsPerPage: query.maxResults || 10,
        languageCode: 'en',
        mobileResults: false
      });

      // Get results from dataset
      const { items } = await this.apify.dataset(run.defaultDatasetId).listItems();

      return {
        success: true,
        tool: 'apify',
        data: items.map((item: any) => this.normalizeResult(item, 'apify', query.type)),
        metadata: {
          query: query.query,
          timestamp: new Date().toISOString(),
          resultsCount: items.length
        }
      };
    } catch (error: any) {
      throw new Error(`Apify error: ${error.message}`);
    }
  }

  /**
   * Jina AI scraper
   */
  private async scrapeJina(query: ScrapeQuery): Promise<ScrapeResult> {
    if (!this.config.jinaApiKey) {
      throw new Error('Jina API key not configured');
    }

    try {
      // Use Jina's reader API to search and extract content
      const response = await axios.get(`https://r.jina.ai/${encodeURIComponent(query.query)}`, {
        headers: {
          'Authorization': `Bearer ${this.config.jinaApiKey}`,
          'X-Return-Format': 'json'
        },
        timeout: 30000
      });

      const results = Array.isArray(response.data) ? response.data : [response.data];

      return {
        success: true,
        tool: 'jina',
        data: results.map((item: any) => this.normalizeResult(item, 'jina', query.type)),
        metadata: {
          query: query.query,
          timestamp: new Date().toISOString(),
          resultsCount: results.length
        }
      };
    } catch (error: any) {
      throw new Error(`Jina error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Normalize results from different tools into a common format
   */
  private normalizeResult(item: any, tool: string, type: string): any {
    const normalized: any = {
      source: tool,
      type: type,
      scrapedAt: new Date().toISOString()
    };

    // Extract common fields based on tool format
    switch (tool) {
      case 'firecrawl':
        normalized.title = item.title || '';
        normalized.url = item.url || '';
        normalized.description = item.description || item.markdown?.substring(0, 500) || '';
        normalized.content = item.markdown || '';
        break;

      case 'brave':
        normalized.title = item.title || '';
        normalized.url = item.url || '';
        normalized.description = item.description || '';
        normalized.content = item.description || '';
        break;

      case 'perplexity':
        normalized.title = item.title || '';
        normalized.url = item.url || '';
        normalized.description = item.description || '';
        normalized.content = item.description || '';
        normalized.source_name = item.source || '';
        break;

      case 'apify':
        normalized.title = item.title || '';
        normalized.url = item.url || '';
        normalized.description = item.description || '';
        normalized.content = item.description || '';
        break;

      case 'jina':
        normalized.title = item.title || '';
        normalized.url = item.url || '';
        normalized.description = item.description || '';
        normalized.content = item.content || item.text || '';
        break;
    }

    return normalized;
  }

  /**
   * Check if a tool is configured
   */
  private isToolConfigured(tool: string): boolean {
    switch (tool) {
      case 'apify':
        return !!this.config.apifyApiKey && !!this.apify;
      case 'brave':
        return !!this.config.braveApiKey;
      case 'tavily':
        return !!this.config.tavilyApiKey;
      case 'perplexity':
        return !!this.config.perplexityApiKey;
      case 'jina':
        return !!this.config.jinaApiKey;
      case 'firecrawl':
        return !!this.config.firecrawlApiKey;
      default:
        return false;
    }
  }

  /**
   * Get scraper statistics
   */
  getStats(): Record<string, any> {
    const stats: Record<string, any> = {};

    for (const [tool, limiter] of this.rateLimiters) {
      stats[tool] = {
        configured: this.isToolConfigured(tool),
        running: limiter.counts().RUNNING,
        queued: limiter.counts().QUEUED,
        reservoir: limiter.counts().RESERVOIR
      };
    }

    return stats;
  }
}

// Export singleton instance
let scraperInstance: MultiToolScraper | null = null;

export function getMultiToolScraper(config?: ScraperConfig): MultiToolScraper {
  if (!scraperInstance) {
    const scraperConfig: ScraperConfig = config || {
      apifyApiKey: process.env.APIFY_API_KEY,
      braveApiKey: process.env.BRAVE_API_KEY,
      tavilyApiKey: process.env.TAVILY_API_KEY,
      perplexityApiKey: process.env.PERPLEXITY_API_KEY,
      jinaApiKey: process.env.JINA_API_KEY,
      firecrawlApiKey: process.env.FIRECRAWL_API_KEY
    };

    console.log('🔧 Initializing MultiToolScraper with configuration');
    console.log('  Configured tools:', Object.entries(scraperConfig)
      .filter(([_, value]) => !!value)
      .map(([key]) => key.replace('ApiKey', ''))
      .join(', '));

    scraperInstance = new MultiToolScraper(scraperConfig);
  }

  return scraperInstance;
}
