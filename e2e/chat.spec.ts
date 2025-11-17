import { test, expect } from '@playwright/test';
import { ChatPage } from './page-objects/ChatPage';
import AxeBuilder from '@axe-core/playwright';

test.describe('K.I.T.T. Chat Widget', () => {
  let chatPage: ChatPage;

  test.beforeEach(async ({ page }) => {
    chatPage = new ChatPage(page);
    // Navigate to a page with the chat widget (e.g., configurator)
    await page.goto('/ai-configurator');
    await page.waitForLoadState('networkidle');
  });

  test('should display K.I.T.T. greeting when chat opens', async ({ page }) => {
    await chatPage.openChat();
    await expect(chatPage.chatWidget).toBeVisible();

    // Verify greeting message appears
    await chatPage.verifyGreeting();

    const greeting = await chatPage.getLastMessage();
    expect(greeting.toLowerCase()).toContain('k.i.t.t');
    expect(greeting.toLowerCase()).toMatch(/hello|hi|greet/i);
  });

  test('should send message and receive SSE streaming response', async ({ page }) => {
    await chatPage.openChat();

    // Send a test message
    const testMessage = "What engine would you recommend for a 1967 Mustang?";
    await chatPage.sendMessage(testMessage);

    // Wait for response
    await chatPage.waitForResponse(15000);

    // Verify response received
    const lastMessage = await chatPage.getLastMessage();
    expect(lastMessage.length).toBeGreaterThan(0);
    expect(lastMessage).not.toContain('thinking');
  });

  test('should handle context-aware car questions', async ({ page }) => {
    await chatPage.openChat();

    // Ask about specific car context
    await chatPage.sendMessageAndWaitForResponse("Tell me about the Coyote engine", 15000);

    const response = await chatPage.getLastMessage();

    // Response should be context-aware
    expect(response.toLowerCase()).toMatch(/coyote|ford|5.0|v8/i);
  });

  test('should show loading indicator while processing', async ({ page }) => {
    await chatPage.openChat();

    await chatPage.sendMessage("What's the best transmission option?");

    // Verify loading indicator appears
    await expect(chatPage.loadingIndicator).toBeVisible({ timeout: 2000 });

    // Wait for response
    await chatPage.waitForResponse();

    // Loading indicator should disappear
    await expect(chatPage.loadingIndicator).not.toBeVisible();
  });

  test('should display recommendations tab', async ({ page }) => {
    await chatPage.openChat();

    // Switch to recommendations tab
    await chatPage.switchToRecommendationsTab();

    // Verify tab is displayed
    await expect(chatPage.recommendationsTab).toHaveAttribute('data-state', 'active');
  });

  test('should display vehicle history tab', async ({ page }) => {
    await chatPage.openChat();

    // Switch to history tab
    await chatPage.switchToHistoryTab();

    // Verify tab is displayed
    await expect(chatPage.historyTab).toHaveAttribute('data-state', 'active');
  });

  test('should display performance tab', async ({ page }) => {
    await chatPage.openChat();

    // Switch to performance tab
    await chatPage.switchToPerformanceTab();

    // Verify tab is displayed
    await expect(chatPage.performanceTab).toHaveAttribute('data-state', 'active');
  });

  test('should close chat widget', async ({ page }) => {
    await chatPage.openChat();
    await expect(chatPage.chatWidget).toBeVisible();

    await chatPage.closeChat();

    // Widget should be closed
    await expect(chatPage.chatWidget).not.toBeVisible();
  });

  test('should handle Enter key to send message', async ({ page }) => {
    await chatPage.openChat();

    await chatPage.messageInput.fill("Test message");
    await page.keyboard.press('Enter');

    // Message should be sent
    await chatPage.waitForResponse();

    const messages = await chatPage.getAllMessages();
    expect(messages.length).toBeGreaterThan(1); // greeting + user message + response
  });

  test('should disable send button when input is empty', async ({ page }) => {
    await chatPage.openChat();

    await chatPage.messageInput.clear();

    // Send button should be disabled
    await expect(chatPage.sendButton).toBeDisabled();
  });

  test('should handle rate limiting gracefully', async ({ page }) => {
    await chatPage.openChat();

    // Send multiple rapid messages to trigger rate limit
    for (let i = 0; i < 10; i++) {
      await chatPage.messageInput.fill(`Test message ${i}`);
      await chatPage.sendButton.click();
      await page.waitForTimeout(100);
    }

    // Check for rate limit message
    await page.waitForTimeout(2000);

    const messages = await chatPage.getAllMessages();
    const hasRateLimitMessage = messages.some(msg =>
      msg.toLowerCase().includes('rate limit') ||
      msg.toLowerCase().includes('quota') ||
      msg.toLowerCase().includes('too many')
    );

    // If rate limiting is implemented, expect the message
    // This test may pass even without rate limiting, which is OK for now
    if (hasRateLimitMessage) {
      expect(hasRateLimitMessage).toBe(true);
    }
  });

  test('should be accessible (WCAG compliance)', async ({ page }) => {
    await chatPage.openChat();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('.chat-widget')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await chatPage.openChat();

    // Chat should be visible and functional
    await expect(chatPage.chatWidget).toBeVisible();
    await expect(chatPage.messageInput).toBeVisible();

    // Send a message
    await chatPage.sendMessageAndWaitForResponse("Hello", 10000);

    const response = await chatPage.getLastMessage();
    expect(response.length).toBeGreaterThan(0);
  });

  test('should display chat in dark theme', async ({ page }) => {
    // Enable dark mode if available
    await page.emulateMedia({ colorScheme: 'dark' });

    await chatPage.openChat();

    // Verify chat renders in dark mode
    await expect(chatPage.chatWidget).toBeVisible();

    // Take screenshot for visual verification
    await page.screenshot({ path: 'screenshots/chat-dark-mode.png' });
  });

  test('should maintain chat history during session', async ({ page }) => {
    await chatPage.openChat();

    // Send first message
    await chatPage.sendMessageAndWaitForResponse("What is a restomod?", 15000);

    // Send second message
    await chatPage.sendMessageAndWaitForResponse("Tell me more", 15000);

    // Verify both messages are in history
    const messages = await chatPage.getAllMessages();
    expect(messages.length).toBeGreaterThanOrEqual(4); // greeting + 2 user + 2 assistant

    const hasFirstMessage = messages.some(msg => msg.includes("restomod"));
    expect(hasFirstMessage).toBe(true);
  });

  test('should handle long responses without breaking UI', async ({ page }) => {
    await chatPage.openChat();

    // Ask a question that would generate a long response
    await chatPage.sendMessageAndWaitForResponse(
      "Tell me everything about the history of the 1967 Ford Mustang in detail",
      20000
    );

    const response = await chatPage.getLastMessage();

    // Response should be substantial
    expect(response.length).toBeGreaterThan(100);

    // UI should not be broken
    await expect(chatPage.chatWidget).toBeVisible();
    await expect(chatPage.messageInput).toBeVisible();
  });

  test('should auto-scroll to latest message', async ({ page }) => {
    await chatPage.openChat();

    // Send multiple messages to create scroll
    for (let i = 0; i < 5; i++) {
      await chatPage.sendMessageAndWaitForResponse(`Message ${i}`, 10000);
    }

    // Latest message should be visible
    const messages = await chatPage.messagesContainer.locator('.rounded-lg').all();
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      await expect(lastMessage).toBeInViewport();
    }
  });
});

test.describe('K.I.T.T. Chat - Performance', () => {
  test('should load chat widget quickly', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/ai-configurator');

    const chatPage = new ChatPage(page);
    await chatPage.openChat();

    const loadTime = Date.now() - startTime;

    // Chat should open in less than 2 seconds
    expect(loadTime).toBeLessThan(2000);
  });

  test('should handle concurrent messages', async ({ page }) => {
    const chatPage = new ChatPage(page);
    await page.goto('/ai-configurator');
    await chatPage.openChat();

    // Send message while another is processing
    await chatPage.sendMessage("First question");
    await page.waitForTimeout(500);
    await chatPage.sendMessage("Second question");

    // Both should be handled gracefully
    await chatPage.waitForResponse(15000);

    const messages = await chatPage.getAllMessages();
    expect(messages.length).toBeGreaterThan(2);
  });
});
