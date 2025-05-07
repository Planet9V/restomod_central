/**
 * Article Generator Service
 * 
 * Automatically generates research articles about restomods and classic cars
 * using the Perplexity AI API.
 */

import { db } from "@db";
import { researchArticles } from "@shared/schema";
import { eq, like } from "drizzle-orm";
import slugify from "slugify";
import fetch from "node-fetch";

// Categories for the research articles
export const ARTICLE_CATEGORIES = [
  "classic-cars",
  "restomod-tech",
  "market-trends",
  "automotive-history",
  "restoration-techniques",
  "car-collection"
];

// Topics to choose from for article generation
// These are used as a starting point for AI article generation
const ARTICLE_TOPICS = [
  // Classic Car History
  "The Evolution of the Ford Mustang from 1964 to Today",
  "How the 1969 Dodge Charger Became an American Icon",
  "The Cultural Impact of American Muscle Cars in 1960s Cinema",
  "Forgotten Classics: Overlooked American Cars of the 1950s",
  "European Sports Cars That Changed Automotive Design Forever",
  
  // Restomod Technology
  "Modern Engine Swaps: Bringing Classic Cars into the 21st Century",
  "Digital Dashboards vs. Classic Gauges: The Tech Behind Modern Restomods",
  "Advanced Suspension Systems for Classic Cars",
  "Battery Technology for Classic Car Electrification",
  "3D Printing in Classic Car Restoration: Creating Unavailable Parts",
  
  // Market Trends
  "Investment Guide: Which Classic Cars Are Appreciating in 2025?",
  "The Economics of Restomod Projects: Cost vs. Value",
  "How Barrett-Jackson Auctions Have Shaped the Classic Car Market",
  "Collecting Trends: Why 1990s Cars Are the New Vintage Hotspot",
  "The Impact of Automotive Heritage on Modern Car Values",
  
  // Restoration Techniques
  "Metal Fabrication Techniques for Classic Car Bodywork",
  "Paint Technology Evolution: From Lacquer to Modern Water-Based Systems",
  "Preserving Patina: The Art of Minimal Restoration",
  "Upholstery Materials That Balance Authenticity and Durability",
  "Engine Rebuilding Essentials for Classic V8s",
  
  // Car Collection
  "Building the Perfect Car Collection: Balance vs. Specialization",
  "Climate-Controlled Storage Solutions for Valuable Classics",
  "The Psychology Behind Car Collecting: Why We Love Classic Automobiles",
  "Insurance Considerations for High-Value Classic Car Collections",
  "Digital Documentation Systems for Classic Car Collections",
  
  // Automotive History
  "The Rise and Fall of American Automotive Manufacturing Giants",
  "How WWII Changed Automobile Design and Engineering",
  "The Oil Crisis and Its Lasting Impact on American Car Culture",
  "Influential Automotive Designers Who Shaped Car History",
  "Racing Innovations That Made Their Way to Production Cars"
];

// Tags for categorizing articles
const COMMON_TAGS = [
  "classic cars", "restomods", "automotive history", "muscle cars", 
  "American classics", "European classics", "restoration", "car collecting",
  "automotive design", "car value", "investment vehicles", "performance upgrades",
  "custom builds", "automotive technology", "vintage automobiles", "car auctions",
  "hot rods", "collector cars", "automobile preservation", "automotive engineering"
];

/**
 * Get a random item from an array
 */
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generate a random date within the last month
 */
function getRecentRandomDate(): Date {
  const now = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(now.getMonth() - 1);
  
  const randomTime = oneMonthAgo.getTime() + Math.random() * (now.getTime() - oneMonthAgo.getTime());
  return new Date(randomTime);
}

/**
 * Check if an article topic already exists
 */
async function topicExists(topic: string): Promise<boolean> {
  const existingArticles = await db
    .select({ id: researchArticles.id })
    .from(researchArticles)
    .where(like(researchArticles.title, `%${topic}%`))
    .limit(1);
  
  return existingArticles.length > 0;
}

/**
 * Generate article using Perplexity AI API
 */
async function generateArticleContent(topic: string, category: string): Promise<{ content: string, excerpt: string }> {
  if (!process.env.PERPLEXITY_API_KEY) {
    throw new Error("PERPLEXITY_API_KEY environment variable is not set");
  }
  
  console.log(`Generating article for topic: ${topic} (Category: ${category})`);
  
  const formattedCategory = category.replace(/-/g, ' ');
  
  const prompt = `
    Write a comprehensive, informative, and engaging article about "${topic}" for a premium restomod and classic car enthusiast website.
    
    The article should:
    - Be written in a sophisticated tone appropriate for affluent car collectors and enthusiasts
    - Include historical context, technical details, and market insights where relevant
    - Be approximately 1000-1500 words
    - Be structured with Markdown formatting using ## for section headings
    - Begin with a compelling introduction that doesn't explicitly state "Introduction"
    - Include 3-5 distinct sections with informative headings
    - End with a conclusion section
    - The content should be highly informative and educational, avoid generic statements
    - Specifically relate to ${formattedCategory} where appropriate
    
    Also provide a 2-3 sentence excerpt that would appear as a preview of the article.
    Format your response as follows:
    
    CONTENT: [full article content with Markdown formatting]
    EXCERPT: [brief excerpt for the article preview]
  `;

  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: "You are an expert automotive journalist specializing in classic cars, restomods, and collectible vehicles. Your articles are published in prestigious automotive magazines. Write with authority, detailed knowledge, and a sophisticated tone."
          },
          { 
            role: "user", 
            content: prompt 
          }
        ],
        max_tokens: 4000,
        temperature: 0.7
      })
    });

    const data = await response.json() as any;
    
    if (!response.ok) {
      console.error("Perplexity API Error:", data);
      throw new Error(`Perplexity API error: ${data.error?.message || "Unknown error"}`);
    }
    
    const text = data.choices[0].message.content;
    
    // Extract content and excerpt
    const contentMatch = text.match(/CONTENT:([\s\S]*?)(?:EXCERPT:|$)/i);
    const excerptMatch = text.match(/EXCERPT:([\s\S]*?)$/i);
    
    if (!contentMatch) {
      throw new Error("Failed to extract article content from AI response");
    }
    
    const content = contentMatch[1].trim();
    const excerpt = excerptMatch ? excerptMatch[1].trim() : content.substring(0, 150) + "...";
    
    return { content, excerpt };
  } catch (error) {
    console.error("Error generating article content:", error);
    throw new Error(`Failed to generate article: ${(error as Error).message}`);
  }
}

/**
 * Create a new research article
 */
export async function generateNewArticle(): Promise<typeof researchArticles.$inferSelect | null> {
  try {
    // Randomly select an article topic
    let attempts = 0;
    let selectedTopic = "";
    let topicAlreadyExists = true;
    
    // Try to find a topic that doesn't already exist
    while (topicAlreadyExists && attempts < ARTICLE_TOPICS.length) {
      selectedTopic = getRandomItem(ARTICLE_TOPICS);
      topicAlreadyExists = await topicExists(selectedTopic);
      attempts++;
    }
    
    // Exit if all topics have been used
    if (topicAlreadyExists) {
      console.log("All predefined topics have already been used");
      return null;
    }
    
    // Select a random category
    const selectedCategory = getRandomItem(ARTICLE_CATEGORIES);
    
    // Generate the article content
    const { content, excerpt } = await generateArticleContent(selectedTopic, selectedCategory);
    
    // Select random tags relevant to the article
    const numTags = Math.floor(Math.random() * 4) + 3; // 3-6 tags
    const shuffledTags = [...COMMON_TAGS].sort(() => 0.5 - Math.random());
    const selectedTags = shuffledTags.slice(0, numTags);
    
    // Create a slug from the title
    const slug = slugify(selectedTopic, { lower: true, strict: true });
    
    // Determine if this should be a featured article (20% chance)
    const isFeatured = Math.random() < 0.2;
    
    // Get a random publish date within the last month
    const publishDate = getRecentRandomDate();
    
    // Create the article
    const newArticles = await db.insert(researchArticles).values({
      title: selectedTopic,
      slug,
      excerpt,
      content,
      category: selectedCategory,
      tags: selectedTags,
      featured: isFeatured,
      publishDate,
      readTime: Math.floor(content.split(' ').length / 200), // Approx. read time in minutes
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    const newArticle = newArticles[0];
    
    console.log(`Created new research article: ${selectedTopic}`);
    
    return newArticle;
  } catch (error) {
    console.error("Error generating article:", error);
    return null;
  }
}