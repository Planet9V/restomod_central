/**
 * Playwright-based web scraper with bot detection evasion
 * Uses stealth techniques to scrape car listings from major sites
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';

export interface ScraperConfig {
  headless?: boolean;
  timeout?: number;
  userAgent?: string;
  viewport?: { width: number; height: number };
  locale?: string;
  timezone?: string;
}

export interface CarListing {
  title: string;
  year: number | null;
  make: string | null;
  model: string | null;
  price: number | null;
  priceText: string;
  location: string | null;
  mileage: number | null;
  description: string;
  images: string[];
  url: string;
  source: string;
  vin: string | null;
  engine: string | null;
  transmission: string | null;
  exteriorColor: string | null;
  interiorColor: string | null;
  condition: string | null;
  sellerName: string | null;
  sellerContact: string | null;
  features: string[];
  postedDate: string | null;
}

/**
 * Bot evasion techniques for Playwright
 */
export class BotEvasionBrowser {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private config: ScraperConfig;

  constructor(config: ScraperConfig = {}) {
    this.config = {
      headless: true,
      timeout: 30000,
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US',
      timezone: 'America/New_York',
      ...config
    };
  }

  async initialize(): Promise<void> {
    this.browser = await chromium.launch({
      headless: this.config.headless,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-web-security',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080',
        '--user-agent=' + this.config.userAgent
      ]
    });

    this.context = await this.browser.newContext({
      viewport: this.config.viewport,
      userAgent: this.config.userAgent,
      locale: this.config.locale,
      timezoneId: this.config.timezone,
      permissions: [],
      geolocation: { latitude: 40.7128, longitude: -74.0060 }, // NYC
      extraHTTPHeaders: {
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    // Apply stealth scripts to avoid detection
    await this.context.addInitScript(() => {
      // Override the navigator.webdriver property
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });

      // Mock plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });

      // Mock languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });

      // Chrome runtime
      (window as any).chrome = {
        runtime: {},
      };

      // Permissions
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters: any) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission } as PermissionStatus) :
          originalQuery(parameters)
      );
    });
  }

  async createPage(): Promise<Page> {
    if (!this.context) {
      await this.initialize();
    }

    const page = await this.context!.newPage();

    // Random delays to mimic human behavior
    await page.setDefaultTimeout(this.config.timeout!);
    await page.setDefaultNavigationTimeout(this.config.timeout!);

    return page;
  }

  async navigateWithRetry(page: Page, url: string, maxRetries = 3): Promise<void> {
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        // Random delay before navigation (300ms - 2s)
        await this.randomDelay(300, 2000);

        await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: this.config.timeout
        });

        // Wait for page to stabilize
        await this.randomDelay(1000, 3000);

        // Check if we got blocked
        const bodyText = await page.textContent('body');
        if (bodyText && this.isBlockedPage(bodyText)) {
          throw new Error('Bot detection triggered');
        }

        return; // Success
      } catch (error: any) {
        lastError = error;
        console.warn(`Navigation attempt ${i + 1} failed:`, error.message);

        if (i < maxRetries - 1) {
          // Exponential backoff
          await this.randomDelay(2000 * (i + 1), 5000 * (i + 1));
        }
      }
    }

    throw lastError || new Error('Navigation failed after retries');
  }

  async scrollPage(page: Page): Promise<void> {
    // Mimic human scrolling behavior
    await page.evaluate(async () => {
      const distance = 100;
      const delay = 100;
      const maxScroll = document.body.scrollHeight;

      for (let i = 0; i < maxScroll; i += distance) {
        window.scrollTo(0, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    });

    await this.randomDelay(500, 1500);
  }

  async randomMouseMovement(page: Page): Promise<void> {
    const viewport = page.viewportSize();
    if (!viewport) return;

    const x = Math.random() * viewport.width;
    const y = Math.random() * viewport.height;

    await page.mouse.move(x, y);
    await this.randomDelay(100, 300);
  }

  async randomDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private isBlockedPage(bodyText: string): boolean {
    const blockPatterns = [
      'captcha',
      'access denied',
      'blocked',
      'security check',
      'unusual traffic',
      'robot',
      'automation'
    ];

    const lowerText = bodyText.toLowerCase();
    return blockPatterns.some(pattern => lowerText.includes(pattern));
  }

  async close(): Promise<void> {
    if (this.context) {
      await this.context.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }
}

/**
 * Parse price string to number
 */
export function parsePrice(priceStr: string): number | null {
  if (!priceStr) return null;

  // Remove currency symbols and commas
  const cleaned = priceStr.replace(/[$,]/g, '').trim();

  // Extract first number
  const match = cleaned.match(/[\d.]+/);
  if (!match) return null;

  return parseInt(match[0], 10);
}

/**
 * Parse year from string
 */
export function parseYear(str: string): number | null {
  const match = str.match(/\b(19\d{2}|20\d{2})\b/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Clean and normalize text
 */
export function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, ' ')
    .trim();
}
