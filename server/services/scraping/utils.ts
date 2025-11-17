// Scraping Utility Functions

import type { RateLimiterConfig } from '../../types/scraping';

/**
 * Get a random user agent string from a pool of realistic user agents
 */
export function getRandomUserAgent(): string {
  const userAgents = [
    // Chrome on Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',

    // Chrome on macOS
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',

    // Firefox on Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',

    // Firefox on macOS
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',

    // Safari on macOS
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  ];

  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

/**
 * Get randomized headers for requests
 */
export function getRandomHeaders() {
  const acceptLanguages = ['en-US,en;q=0.9', 'en-GB,en;q=0.9', 'en-CA,en;q=0.9'];
  const acceptEncodings = ['gzip, deflate, br', 'gzip, deflate'];

  return {
    'User-Agent': getRandomUserAgent(),
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': acceptLanguages[Math.floor(Math.random() * acceptLanguages.length)],
    'Accept-Encoding': acceptEncodings[Math.floor(Math.random() * acceptEncodings.length)],
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0',
  };
}

/**
 * Create a delay with random jitter
 */
export function delay(ms: number, jitter: number = 0.2): Promise<void> {
  const jitterAmount = ms * jitter;
  const actualDelay = ms + (Math.random() * jitterAmount * 2 - jitterAmount);
  return new Promise(resolve => setTimeout(resolve, actualDelay));
}

/**
 * Get a random delay within a range
 */
export function randomDelay(min: number, max: number): Promise<void> {
  const ms = Math.random() * (max - min) + min;
  return delay(ms);
}

/**
 * Parse price from string to number
 * Examples: "$50,000" → 50000, "€ 45.000" → 45000, "Call for price" → null
 */
export function parsePrice(priceStr?: string): number | null {
  if (!priceStr) return null;

  // Check for "call for price", "POA", etc.
  const callPatterns = /call|contact|poa|price on application|make offer/i;
  if (callPatterns.test(priceStr)) {
    return null;
  }

  // Remove currency symbols, commas, and spaces
  const cleaned = priceStr.replace(/[$€£¥,\s]/g, '');

  // Try to parse as number
  const price = parseFloat(cleaned);

  // Validate range (classic cars typically $1,000 - $10,000,000)
  if (isNaN(price) || price < 100 || price > 10000000) {
    return null;
  }

  return price;
}

/**
 * Parse year from string to number
 */
export function parseYear(yearStr?: string | number): number | null {
  if (!yearStr) return null;

  const year = typeof yearStr === 'string' ? parseInt(yearStr, 10) : yearStr;

  // Validate year range (1900 - next year)
  const currentYear = new Date().getFullYear();
  if (isNaN(year) || year < 1900 || year > currentYear + 1) {
    return null;
  }

  return year;
}

/**
 * Parse location string into city and state
 * Examples: "Los Angeles, CA" → {city: "Los Angeles", state: "CA"}
 */
export function parseLocation(locationStr?: string): { city?: string; state?: string; country?: string } {
  if (!locationStr) return {};

  const parts = locationStr.split(',').map(s => s.trim());

  if (parts.length === 2) {
    return {
      city: parts[0],
      state: normalizeState(parts[1]),
    };
  }

  if (parts.length === 3) {
    return {
      city: parts[0],
      state: normalizeState(parts[1]),
      country: parts[2],
    };
  }

  return { city: locationStr };
}

/**
 * Normalize state abbreviations
 */
export function normalizeState(state: string): string {
  const stateMap: Record<string, string> = {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
    'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
    'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
    'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
    'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
    'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
    'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
    'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
    'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
    'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
    'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
    'Wisconsin': 'WI', 'Wyoming': 'WY',
  };

  // If already abbreviated, return as-is
  if (state.length === 2) {
    return state.toUpperCase();
  }

  // Look up full name
  return stateMap[state] || state;
}

/**
 * Extract year, make, and model from title
 * Example: "1967 Ford Mustang Fastback" → {year: 1967, make: "Ford", model: "Mustang"}
 */
export function parseTitleForDetails(title?: string): { year?: number; make?: string; model?: string } {
  if (!title) return {};

  const result: { year?: number; make?: string; model?: string } = {};

  // Extract year (19XX or 20XX)
  const yearMatch = title.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) {
    result.year = parseInt(yearMatch[0], 10);
  }

  // Common classic car makes
  const makes = [
    'Ford', 'Chevrolet', 'Dodge', 'Plymouth', 'Pontiac', 'Buick', 'Oldsmobile',
    'Cadillac', 'Mercury', 'Chrysler', 'AMC', 'Studebaker', 'Packard',
    'Porsche', 'Ferrari', 'Lamborghini', 'Mercedes-Benz', 'BMW', 'Jaguar',
    'Aston Martin', 'Bentley', 'Rolls-Royce', 'Alfa Romeo', 'Maserati',
    'Corvette', 'Mustang', 'Camaro', 'Charger', 'GTO',
  ];

  for (const make of makes) {
    if (title.includes(make)) {
      result.make = make;
      break;
    }
  }

  return result;
}

/**
 * Clean and normalize description text
 */
export function cleanDescription(description?: string): string | undefined {
  if (!description) return undefined;

  return description
    .trim()
    .replace(/\s+/g, ' ')  // Collapse multiple spaces
    .replace(/\n\s*\n/g, '\n')  // Remove empty lines
    .substring(0, 5000);  // Limit length
}

/**
 * Normalize image URL (ensure absolute URL)
 */
export function normalizeImageUrl(imageUrl?: string, baseUrl?: string): string | undefined {
  if (!imageUrl) return undefined;

  // Already absolute URL
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Relative URL - need base URL
  if (baseUrl) {
    try {
      const base = new URL(baseUrl);
      return new URL(imageUrl, base.origin).toString();
    } catch {
      return undefined;
    }
  }

  return undefined;
}

/**
 * Rate limiter class using token bucket algorithm
 */
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private queue: number[] = [];

  constructor(private config: RateLimiterConfig) {
    this.tokens = config.maxPerMinute;
    this.lastRefill = Date.now();
  }

  /**
   * Acquire a token (wait if necessary)
   */
  async acquire(): Promise<void> {
    this.refill();

    // Check per-minute limit
    const now = Date.now();
    this.queue = this.queue.filter(t => now - t < 60000);

    if (this.queue.length >= this.config.maxPerMinute) {
      const waitTime = 60000 - (now - this.queue[0]);
      await delay(waitTime);
      this.queue.shift();
    }

    // Check per-hour limit if configured
    if (this.config.maxPerHour) {
      const hourQueue = this.queue.filter(t => now - t < 3600000);
      if (hourQueue.length >= this.config.maxPerHour) {
        const waitTime = 3600000 - (now - hourQueue[0]);
        await delay(waitTime);
      }
    }

    this.queue.push(Date.now());

    // Apply minimum delay between requests
    if (this.config.delayBetweenRequests) {
      await delay(this.config.delayBetweenRequests);
    }
  }

  private refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    const refillRate = this.config.maxPerMinute / 60; // tokens per second

    this.tokens = Math.min(
      this.config.maxPerMinute,
      this.tokens + elapsed * refillRate
    );

    this.lastRefill = now;
  }
}

/**
 * Check if URL is allowed by robots.txt
 */
export async function checkRobotsPermission(url: string, userAgent: string = 'RestomodBot'): Promise<boolean> {
  try {
    const urlObj = new URL(url);
    const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`;

    const response = await fetch(robotsUrl);
    if (!response.ok) {
      // If robots.txt doesn't exist, assume allowed
      return true;
    }

    const robotsTxt = await response.text();

    // Simple robots.txt parser (for production, use a library)
    const lines = robotsTxt.split('\n');
    let currentUserAgent = '';
    let disallowedPaths: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith('User-agent:')) {
        currentUserAgent = trimmed.substring('User-agent:'.length).trim();
        disallowedPaths = [];
      } else if (trimmed.startsWith('Disallow:') && (currentUserAgent === '*' || currentUserAgent === userAgent)) {
        const path = trimmed.substring('Disallow:'.length).trim();
        if (path) {
          disallowedPaths.push(path);
        }
      }
    }

    // Check if URL matches any disallowed paths
    for (const path of disallowedPaths) {
      if (urlObj.pathname.startsWith(path)) {
        return false;
      }
    }

    return true;

  } catch (error) {
    console.warn('Failed to fetch robots.txt, proceeding cautiously:', error);
    return true; // Proceed if robots.txt unavailable
  }
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return '';
  }
}

/**
 * Generate a unique hash for deduplication
 */
export function generateHash(make: string, model: string, year: number, price?: number): string {
  const data = `${make}-${model}-${year}-${price || 'unknown'}`;
  return Buffer.from(data).toString('base64');
}

/**
 * Validate VIN checksum (basic validation)
 */
export function isValidVIN(vin: string): boolean {
  // VIN must be exactly 17 characters
  if (vin.length !== 17) {
    return false;
  }

  // VIN cannot contain I, O, or Q
  if (/[IOQ]/i.test(vin)) {
    return false;
  }

  // Must be alphanumeric
  if (!/^[A-HJ-NPR-Z0-9]+$/i.test(vin)) {
    return false;
  }

  return true;
}

/**
 * Calculate Levenshtein distance for fuzzy matching
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Fuzzy string match (useful for duplicate detection)
 */
export function fuzzyMatch(str1: string, str2: string, threshold: number = 0.8): boolean {
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  const maxLength = Math.max(str1.length, str2.length);
  const similarity = 1 - distance / maxLength;

  return similarity >= threshold;
}
