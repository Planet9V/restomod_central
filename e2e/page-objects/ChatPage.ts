import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ChatPage extends BasePage {
  readonly chatButton: Locator;
  readonly chatWidget: Locator;
  readonly messageInput: Locator;
  readonly sendButton: Locator;
  readonly closeButton: Locator;
  readonly messagesContainer: Locator;
  readonly loadingIndicator: Locator;
  readonly greetingMessage: Locator;
  readonly recommendationsTab: Locator;
  readonly historyTab: Locator;
  readonly performanceTab: Locator;

  constructor(page: Page) {
    super(page);

    // Chat widget selectors
    this.chatButton = page.getByRole('button', { name: /K\.I\.T\.T|assistant|chat/i });
    this.chatWidget = page.locator('[class*="AIConfigAssistant"]').or(page.locator('.chat-widget'));
    this.messageInput = page.getByPlaceholder(/ask.*K\.I\.T\.T/i).or(page.getByRole('textbox'));
    this.sendButton = page.getByRole('button', { name: /send/i }).or(page.locator('button[type="submit"]'));
    this.closeButton = page.getByRole('button', { name: /close/i }).or(page.locator('button').filter({ hasText: 'X' }));
    this.messagesContainer = page.locator('.space-y-4').or(page.locator('[class*="messages"]'));
    this.loadingIndicator = page.locator('text=/K\.I\.T\.T.*thinking/i').or(page.locator('.animate-spin'));
    this.greetingMessage = page.locator('text=/Hello.*K\.I\.T\.T/i');

    // Tab selectors
    this.recommendationsTab = page.getByRole('tab', { name: /recommendations/i });
    this.historyTab = page.getByRole('tab', { name: /history/i });
    this.performanceTab = page.getByRole('tab', { name: /performance/i });
  }

  async openChat() {
    await this.chatButton.click();
    await this.waitForTimeout(500);
  }

  async closeChat() {
    await this.closeButton.click();
    await this.waitForTimeout(300);
  }

  async isChatOpen(): Promise<boolean> {
    return await this.chatWidget.isVisible();
  }

  async sendMessage(message: string) {
    await this.messageInput.fill(message);
    await this.sendButton.click();
  }

  async waitForResponse(timeout: number = 10000) {
    // Wait for loading indicator to appear
    await this.loadingIndicator.waitFor({ state: 'visible', timeout: 2000 }).catch(() => {});

    // Wait for loading indicator to disappear
    await this.loadingIndicator.waitFor({ state: 'hidden', timeout });
  }

  async getLastMessage(): Promise<string> {
    const messages = await this.messagesContainer.locator('.rounded-lg').all();
    if (messages.length === 0) return '';

    const lastMessage = messages[messages.length - 1];
    return await lastMessage.textContent() || '';
  }

  async getAllMessages(): Promise<string[]> {
    const messages = await this.messagesContainer.locator('.rounded-lg').all();
    const messageTexts: string[] = [];

    for (const message of messages) {
      const text = await message.textContent();
      if (text) messageTexts.push(text);
    }

    return messageTexts;
  }

  async switchToRecommendationsTab() {
    await this.recommendationsTab.click();
    await this.waitForTimeout(300);
  }

  async switchToHistoryTab() {
    await this.historyTab.click();
    await this.waitForTimeout(300);
  }

  async switchToPerformanceTab() {
    await this.performanceTab.click();
    await this.waitForTimeout(300);
  }

  async hasGreetingMessage(): Promise<boolean> {
    return await this.greetingMessage.isVisible();
  }

  async verifyGreeting() {
    await expect(this.greetingMessage).toBeVisible({ timeout: 5000 });
  }

  async sendMessageAndWaitForResponse(message: string, timeout: number = 10000) {
    await this.sendMessage(message);
    await this.waitForResponse(timeout);
  }

  async getRecommendationsCount(): Promise<number> {
    await this.switchToRecommendationsTab();
    const recommendations = await this.page.locator('[class*="Card"]').filter({ hasText: /recommendation/i }).count();
    return recommendations;
  }
}
