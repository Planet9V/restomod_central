/**
 * Scheduler for automated tasks like article generation
 * This module provides functionality for scheduling and managing recurring tasks
 */

import { generateNewArticle } from "./articleGenerator";
import { log } from "../vite";

// Store all scheduled tasks for clean shutdown
const scheduledTasks: NodeJS.Timeout[] = [];

/**
 * Schedule an article generation task to run once per day
 */
export function scheduleArticleGeneration() {
  // Log the start of scheduling
  log("Starting scheduled article generation task", "scheduler");
  
  // Set interval for daily article generation (24 hours in milliseconds)
  const INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
  
  // Optional: Generate an article immediately on startup
  generateArticleTask();
  
  // Schedule the recurring task
  const taskId = setInterval(generateArticleTask, INTERVAL_MS);
  
  // Store the task ID for cleanup
  scheduledTasks.push(taskId);
  
  // Log completion
  log("Scheduled daily article generation task", "scheduler");
}

/**
 * Execute the article generation task
 */
async function generateArticleTask() {
  log("Running scheduled article generation task", "scheduler");
  
  try {
    const article = await generateNewArticle();
    
    if (article) {
      log(`Successfully generated new article: "${article.title}"`, "scheduler");
    } else {
      log("No new article was generated - possible topic exhaustion", "scheduler");
    }
  } catch (error) {
    log(`Error in scheduled article generation: ${(error as Error).message}`, "scheduler");
  }
}

/**
 * Clean up all scheduled tasks
 */
export function cleanupScheduledTasks() {
  // Clear all intervals
  scheduledTasks.forEach(taskId => clearInterval(taskId));
  
  // Empty the array
  scheduledTasks.length = 0;
  
  log("Cleaned up all scheduled tasks", "scheduler");
}