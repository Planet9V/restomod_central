import { ResearchArticle, researchArticles } from "@shared/schema";
import { db } from "@db";
import slugify from "slugify";
import { eq } from "drizzle-orm";

// Categories for research articles
export const ARTICLE_CATEGORIES = [
  "market-trends",
  "restoration-techniques",
  "classic-models",
  "modern-upgrades",
  "investment-analysis",
  "historical-context"
];

// Interesting topics for article generation
const ARTICLE_TOPICS = [
  // Market trends
  { 
    topic: "The Rising Value of 1960s Muscle Cars in Today's Market", 
    category: "market-trends",
    tags: ["investment", "muscle-cars", "1960s", "market-value"]
  },
  { 
    topic: "Collectible Car Auctions: How Restomods are Outperforming Original Classics", 
    category: "market-trends",
    tags: ["auctions", "collectibles", "restomods", "investment"]
  },
  { 
    topic: "The Premium Market for Celebrity-Owned Restomods", 
    category: "market-trends",
    tags: ["celebrity", "premium", "market-value", "collectors"]
  },
  
  // Restoration techniques
  { 
    topic: "Balancing Authenticity and Performance in Chassis Restoration", 
    category: "restoration-techniques",
    tags: ["chassis", "authenticity", "performance", "engineering"]
  },
  { 
    topic: "Paint Preservation Techniques for Show-Quality Restomods", 
    category: "restoration-techniques",
    tags: ["paint", "preservation", "detailing", "finish"]
  },
  { 
    topic: "3D Printing Applications in Classic Car Restoration", 
    category: "restoration-techniques",
    tags: ["3d-printing", "technology", "parts", "innovation"]
  },
  
  // Classic models
  { 
    topic: "The Enduring Appeal of the 1967 Ford Mustang Fastback", 
    category: "classic-models",
    tags: ["ford", "mustang", "1967", "fastback", "muscle-cars"]
  },
  { 
    topic: "Chevrolet Camaro Through the Decades: Evolution of an American Icon", 
    category: "classic-models",
    tags: ["chevrolet", "camaro", "history", "evolution", "muscle-cars"]
  },
  { 
    topic: "Forgotten Classics: The Underappreciated Cars of the 1950s", 
    category: "classic-models",
    tags: ["1950s", "rare", "undervalued", "collectibles"]
  },
  
  // Modern upgrades
  { 
    topic: "Modern Fuel Injection Systems for Classic V8 Engines", 
    category: "modern-upgrades",
    tags: ["fuel-injection", "v8", "performance", "engine"]
  },
  { 
    topic: "Integrating Smart Technology into Classic Car Interiors", 
    category: "modern-upgrades",
    tags: ["smart-tech", "interior", "connectivity", "modernization"]
  },
  { 
    topic: "Electric Conversion Options for Classic American Trucks", 
    category: "modern-upgrades",
    tags: ["electric", "conversion", "trucks", "sustainability"]
  },
  
  // Investment analysis
  { 
    topic: "Long-term Value Projection for 1960s vs. 1970s American Muscle", 
    category: "investment-analysis",
    tags: ["investment", "muscle-cars", "value", "projection"]
  },
  { 
    topic: "Risk Assessment: Investing in Rare European Classics vs. American Icons", 
    category: "investment-analysis",
    tags: ["risk", "european", "american", "investment"]
  },
  { 
    topic: "The Collector's Guide to Documenting Restomod Provenance", 
    category: "investment-analysis",
    tags: ["provenance", "documentation", "collector", "value"]
  },
  
  // Historical context
  { 
    topic: "The Cultural Impact of American Muscle Cars in 1960s Cinema", 
    category: "historical-context",
    tags: ["culture", "cinema", "1960s", "americana"]
  },
  { 
    topic: "From Factory to Legend: The Story of the Shelby GT500", 
    category: "historical-context",
    tags: ["shelby", "gt500", "history", "ford"]
  },
  { 
    topic: "The Oil Crisis and Its Lasting Effect on Classic American Car Design", 
    category: "historical-context",
    tags: ["oil-crisis", "design", "history", "economy"]
  }
];

// Stock images for restomod articles
const ARTICLE_IMAGES = [
  "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2070", // Ford Mustang
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2083", // Classic car at sunset
  "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=2070", // Vintage car
  "https://images.unsplash.com/photo-1567808291548-fc3ee04dbcf0?q=80&w=2071", // Car auction
  "https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?q=80&w=2072", // Blue muscle car
  "https://images.unsplash.com/photo-1581112877498-bbe916e42929?q=80&w=1974", // Red muscle car
  "https://images.unsplash.com/photo-1611566026373-c6c8da0ea861?q=80&w=1935", // Classic interior
  "https://images.unsplash.com/photo-1544455379-7d3f284b5e2c?q=80&w=1828", // Engine closeup
  "https://images.unsplash.com/photo-1533290602255-4da913cbe5ec?q=80&w=1974", // Classic car wheel
  "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=1600", // 1953 Ford F100
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
  const pastMonth = new Date();
  pastMonth.setMonth(now.getMonth() - 1);
  
  const randomTimestamp = pastMonth.getTime() + Math.random() * (now.getTime() - pastMonth.getTime());
  return new Date(randomTimestamp);
}

/**
 * Check if an article topic already exists
 */
async function topicExists(topic: string): Promise<boolean> {
  const articles = await db.select().from(researchArticles).where(eq(researchArticles.title, topic));
  return articles.length > 0;
}

/**
 * Generate article using Perplexity AI API
 */
async function generateArticleContent(topic: string, category: string): Promise<{ content: string, excerpt: string }> {
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
            content: `You are an expert automotive journalist specializing in classic cars, restomods, and collectible vehicles. 
            Write educational, accurate, and engaging content that provides valuable insights for enthusiasts and collectors.
            Use a professional tone that balances technical expertise with accessibility.
            Include specific details, historical references, and market insights where appropriate.
            Format the article with clear sections using markdown heading formatting.`
          },
          {
            role: "user",
            content: `Write a detailed, well-researched article on "${topic}" for the "${category}" category of our classic car and restomod website.
            The article should be approximately 800-1000 words, divided into clear sections with headings.
            Include factual information, historical context, and industry insights where relevant.
            End with a conclusion that summarizes key points and offers some forward-looking perspective.
            Also provide a brief 2-3 sentence excerpt that summarizes the article for display in article listings.`
          }
        ],
        temperature: 0.2,
        max_tokens: 3000,
        top_p: 0.9
      })
    });

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error("Invalid response from AI service");
    }

    const fullContent = data.choices[0].message.content;
    
    // Extract excerpt (assuming the excerpt is at the end)
    const excerptMatch = fullContent.match(/Excerpt:\s*([\s\S]+)$/i) || 
                         fullContent.match(/Summary:\s*([\s\S]+)$/i);
    
    let content = fullContent;
    let excerpt = "";
    
    if (excerptMatch) {
      // Remove the excerpt from the main content
      content = fullContent.replace(excerptMatch[0], "").trim();
      excerpt = excerptMatch[1].trim();
    }
    
    // If no explicit excerpt found, use the first paragraph
    if (!excerpt) {
      const firstParagraph = fullContent.split('\n\n')[0].trim();
      excerpt = firstParagraph.length > 200 
        ? firstParagraph.substring(0, 197) + '...' 
        : firstParagraph;
    }
    
    return { content, excerpt };
  } catch (error) {
    console.error("Error generating article content:", error);
    throw new Error("Failed to generate article content");
  }
}

/**
 * Create a new research article
 */
export async function generateNewArticle(): Promise<ResearchArticle | null> {
  try {
    // Get all existing article topics
    const existingArticles = await db.select({ title: researchArticles.title }).from(researchArticles);
    const existingTitles = new Set(existingArticles.map(a => a.title));
    
    // Filter to topics that don't already exist
    const availableTopics = ARTICLE_TOPICS.filter(topic => !existingTitles.has(topic.topic));
    
    // If no topics available, exit gracefully
    if (availableTopics.length === 0) {
      console.log("All predefined topics have been used. Please add more topics.");
      return null;
    }
    
    // Select a random topic from available ones
    const selectedTopic = getRandomItem(availableTopics);
    
    // Generate article content using Perplexity AI
    const { content, excerpt } = await generateArticleContent(
      selectedTopic.topic, 
      selectedTopic.category
    );
    
    // Create slug from topic
    const slug = slugify(selectedTopic.topic, { 
      lower: true,
      strict: true
    });
    
    // Select a random image
    const featuredImage = getRandomItem(ARTICLE_IMAGES);
    
    // Create and store new article
    const newArticle = {
      title: selectedTopic.topic,
      slug,
      author: "McKenney Engineering Team",
      publishDate: getRecentRandomDate(),
      featuredImage,
      content,
      excerpt,
      category: selectedTopic.category,
      tags: selectedTopic.tags,
      featured: Math.random() < 0.2, // 20% chance of being featured
      updatedAt: new Date()
    };
    
    const [insertedArticle] = await db.insert(researchArticles)
      .values(newArticle)
      .returning();
    
    console.log(`Created new research article: ${insertedArticle.title}`);
    return insertedArticle;
  } catch (error) {
    console.error("Error generating new article:", error);
    return null;
  }
}