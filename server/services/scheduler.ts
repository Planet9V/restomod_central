import { generateNewArticle } from './articleGenerator';

// Time intervals (in milliseconds)
const ONE_DAY = 24 * 60 * 60 * 1000;

// Track timers to allow cleanup
const activeTimers: NodeJS.Timeout[] = [];

/**
 * Schedule an article generation task to run once per day
 */
export function scheduleArticleGeneration() {
  console.log("Scheduling daily article generation...");
  
  // Generate one article immediately on server start
  generateNewArticle().catch(err => 
    console.error("Failed to generate initial article:", err)
  );
  
  // Schedule daily article generation
  const timer = setInterval(async () => {
    try {
      console.log("Running scheduled article generation...");
      await generateNewArticle();
    } catch (error) {
      console.error("Error in scheduled article generation:", error);
    }
  }, ONE_DAY);
  
  // Keep track of the timer
  activeTimers.push(timer);
  
  return () => {
    // Cleanup function to clear interval
    clearInterval(timer);
    const index = activeTimers.indexOf(timer);
    if (index !== -1) {
      activeTimers.splice(index, 1);
    }
  };
}

/**
 * Clean up all scheduled tasks
 */
export function cleanupScheduledTasks() {
  activeTimers.forEach(timer => clearInterval(timer));
  activeTimers.length = 0;
}