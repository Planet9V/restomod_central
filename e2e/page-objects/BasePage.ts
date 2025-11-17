import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string = '/') {
    await this.page.goto(path);
  }

  async waitForLoadState(state: 'load' | 'domcontentloaded' | 'networkidle' = 'networkidle') {
    await this.page.waitForLoadState(state);
  }

  async screenshot(name: string) {
    return await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }

  async waitForTimeout(timeout: number) {
    await this.page.waitForTimeout(timeout);
  }

  getLocator(selector: string): Locator {
    return this.page.locator(selector);
  }

  async clickAndWait(selector: string, waitForNavigation: boolean = true) {
    const locator = this.getLocator(selector);
    await locator.click();
    if (waitForNavigation) {
      await this.waitForLoadState();
    }
  }

  async fillAndWait(selector: string, value: string) {
    const locator = this.getLocator(selector);
    await locator.fill(value);
    await this.page.waitForTimeout(300); // Small delay for debouncing
  }

  async selectOption(selector: string, value: string) {
    const locator = this.getLocator(selector);
    await locator.selectOption(value);
  }

  async isVisible(selector: string): Promise<boolean> {
    return await this.getLocator(selector).isVisible();
  }

  async getText(selector: string): Promise<string> {
    return await this.getLocator(selector).textContent() || '';
  }

  async getAttribute(selector: string, attribute: string): Promise<string | null> {
    return await this.getLocator(selector).getAttribute(attribute);
  }
}
