// Scraping System Type Definitions

export interface ScraperConfig {
  // Playwright-specific selectors
  selectors?: {
    listing: string;
    title: string;
    price: string;
    make?: string;
    model?: string;
    year?: string;
    image?: string;
    description?: string;
    location?: string;
    [key: string]: string | undefined;
  };

  // Pagination configuration
  pagination?: {
    type: 'click' | 'url' | 'infinite_scroll';
    selector?: string;
    maxPages?: number;
    urlPattern?: string;
  };

  // Anti-bot strategies
  useStealth: boolean;
  useProxy: boolean;
  proxyType?: 'residential' | 'datacenter' | 'rotating';
  proxyUrl?: string;
  userAgent?: string;
  delayRange?: [number, number];
  delayBetweenRequests?: number;
  maxRequestsPerMinute?: number;
  scrollBehavior?: 'smooth' | 'instant';

  // Data transformations
  transformations?: {
    priceRegex?: string;
    dateFormat?: string;
    locationParser?: string;
  };

  // Error handling
  maxRetries?: number;
  retryDelay?: number;
  timeoutMs?: number;
}

export interface PlaywrightScraperConfig {
  url: string;
  selectors: ScraperConfig['selectors'];
  useProxy?: boolean;
  proxyUrl?: string;
  delayRange?: [number, number];
  scrollBehavior?: 'smooth' | 'instant';
  pagination?: ScraperConfig['pagination'];
}

export interface ScrapeResult<T = any> {
  success: boolean;
  data?: T[];
  error?: string;
  metadata?: {
    itemsFound: number;
    pagesCrawled: number;
    duration: number;
    timestamp: Date;
  };
}

export interface RawListing {
  title?: string;
  price?: string;
  make?: string;
  model?: string;
  year?: string | number;
  location?: string;
  image?: string;
  description?: string;
  url?: string;
  [key: string]: any;
}

export interface RawEvent {
  name?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  venue?: string;
  city?: string;
  state?: string;
  description?: string;
  url?: string;
  type?: string;
  [key: string]: any;
}

export interface NormalizedListing {
  // Vehicle details
  make?: string;
  model?: string;
  year?: number;
  title?: string;

  // Pricing
  price?: number;

  // Location
  locationCity?: string;
  locationState?: string;
  locationCountry?: string;

  // Media
  imageUrl?: string;
  images?: string[];

  // Content
  description?: string;

  // Source tracking
  sourceType: 'scraped';
  sourceName: string;
  sourceUrl?: string;

  // Timestamps
  scrapedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NormalizedEvent {
  // Event details
  name: string;
  eventType?: string;

  // Dates
  startDate: Date;
  endDate?: Date;

  // Location
  venueName?: string;
  city?: string;
  state?: string;
  country?: string;
  address?: string;

  // Content
  description?: string;
  imageUrl?: string;

  // Source tracking
  sourceType: 'scraped';
  sourceName: string;
  sourceUrl?: string;

  // Timestamps
  scrapedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScrapingSchedule {
  id: number;
  sourceName: string;
  sourceType: 'playwright' | 'api' | 'perplexity';
  sourceUrl: string;
  targetType: 'cars' | 'events';
  scheduleCron: string;
  enabled: boolean;
  config: ScraperConfig;
  lastRun?: Date;
  nextRun?: Date;
  consecutiveFailures?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScrapingLog {
  id: number;
  scheduleId: number;
  status: 'pending' | 'running' | 'success' | 'failed';
  itemsScraped?: number;
  itemsInserted?: number;
  itemsUpdated?: number;
  itemsFailed?: number;
  errors?: string[];
  errorSummary?: string;
  durationSeconds?: number;
  startedAt: Date;
  completedAt?: Date;
}

export interface ScrapingStats {
  activeSchedules: number;
  successRate: number;
  totalItemsScraped: number;
  totalItemsInserted: number;
  recentLogs: ScrapingLog[];
  failedSchedules: string[];
}

export interface RateLimiterConfig {
  maxPerMinute: number;
  maxPerHour?: number;
  concurrentRequests?: number;
  delayBetweenRequests?: number;
}

export interface ProxyConfig {
  provider: 'brightdata' | 'oxylabs' | 'smartproxy' | 'custom';
  zone?: string;
  username?: string;
  password?: string;
  host?: string;
  port?: number;
  protocol?: 'http' | 'https' | 'socks5';
}

export interface JobData {
  scheduleId: number;
  sourceName: string;
  sourceType: 'playwright' | 'api' | 'perplexity';
  targetType: 'cars' | 'events';
  config: ScraperConfig;
}

export interface JobResult {
  itemsScraped: number;
  itemsInserted: number;
  itemsUpdated: number;
  itemsFailed: number;
  duration: number;
  errors: string[];
}
