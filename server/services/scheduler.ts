import { generateCarShowArticle } from './articleGenerator';

// Store active timers for cleanup
const activeTimers: NodeJS.Timeout[] = [];

/**
 * Initializes all scheduled tasks for the application
 * Currently includes:
 * - Article generation for upcoming car shows (every 2 hours)
 */
export function scheduleArticleGeneration() {
  console.log('Setting up scheduled article generation system...');
  
  // Function to run the generator
  const runScheduledGenerator = async () => {
    console.log('Running scheduled article generation for car shows...');
    await generateCarShowArticle();
  };
  
  // Schedule to run every 2 hours
  const twoHoursInMs = 2 * 60 * 60 * 1000;
  const intervalTimer = setInterval(runScheduledGenerator, twoHoursInMs);
  activeTimers.push(intervalTimer);
  
  // Also run immediately on startup (with a small delay)
  const startupTimer = setTimeout(runScheduledGenerator, 5000);
  activeTimers.push(startupTimer);
  
  console.log('Article generation scheduling system initialized - will run every 2 hours');
}

/**
 * Cleans up all scheduled tasks when shutting down the server
 * This prevents tasks from running in the background after server shutdown
 */
export function cleanupScheduledTasks() {
  // Clear all timers
  activeTimers.forEach(timer => {
    clearTimeout(timer);
    clearInterval(timer);
  });
  
  console.log(`Cleaned up ${activeTimers.length} scheduled tasks`);
}