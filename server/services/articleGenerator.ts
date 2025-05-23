import fetch from 'node-fetch';
import slugify from 'slugify';
import { createResearchArticle } from '../storage';
import { researchArticlesInsertSchema } from '@shared/schema';
import { generateCarShowImage, generateEventInfographic, extractEventsFromContent } from './imageGenerator';

// Define article categories
export const ARTICLE_CATEGORIES = [
  'events',
  'market-trends',
  'restoration',
  'technical',
  'history',
  'showcase'
];

// Schedule tracker - to prevent duplicate runs
let lastRunTime = new Date(0);

/**
 * Generate a new article on any topic using Perplexity API
 * Used by the manual article generation endpoint
 */
export async function generateNewArticle() {
  try {
    // Choose a random topic for the article
    const topics = [
      "The Evolution of Muscle Car Design from the 1960s to Today",
      "How Restomod Projects Affect Classic Car Values",
      "The Cultural Impact of American Muscle Cars in 1960s Cinema",
      "Comparing Modern Engine Swaps for Classic Ford Mustangs",
      "Investment Guide: Which Classic Cars Are Appreciating Fastest",
      "Metal Fabrication Techniques for Classic Car Bodywork",
      "The Art of Color Selection in Custom Automotive Paint",
      "Preserving Originality vs. Modern Upgrades in Restomods",
      "Classic Car Auctions: How to Identify Valuable Projects",
      "The Psychology Behind Classic Car Collecting"
    ];
    
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const prompt = `Create a comprehensive, well-researched article about: "${randomTopic}". Include historical context, market trends, technical details, and practical insights. Format the article with proper markdown structure, including headings, subheadings, and bulleted lists where appropriate.`;

    if (!process.env.PERPLEXITY_API_KEY) {
      console.error('Perplexity API key is not configured');
      return null;
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: "You are an expert automotive journalist specializing in classic cars, restomods, and automotive history. Create comprehensive, engaging, and factually accurate content. Include specific details, numbers, and practical insights where relevant. Use a professional but approachable tone."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        top_p: 0.9,
        max_tokens: 1500,
        search_recency_filter: "day" 
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Perplexity API error:', errorData);
      return null;
    }

    const data = await response.json() as {
      choices: [{
        message: {
          content: string;
        }
      }];
      citations?: string[];
    };
    
    // Extract title from the content (usually the first h1 markdown heading)
    const content = data.choices[0].message.content;
    const citations = data.citations || [];
    
    // Generate title and other metadata
    const titleMatch = content.match(/^#\s+(.*)/m);
    const title = titleMatch ? titleMatch[1] : randomTopic;
    
    // Determine appropriate category
    let category = 'technical';
    if (randomTopic.toLowerCase().includes('market') || randomTopic.toLowerCase().includes('value') || 
        randomTopic.toLowerCase().includes('investment') || randomTopic.toLowerCase().includes('auction')) {
      category = 'market-trends';
    } else if (randomTopic.toLowerCase().includes('history') || randomTopic.toLowerCase().includes('evolution') || 
               randomTopic.toLowerCase().includes('cultural')) {
      category = 'history';
    } else if (randomTopic.toLowerCase().includes('restoration') || randomTopic.toLowerCase().includes('bodywork') || 
               randomTopic.toLowerCase().includes('fabrication')) {
      category = 'restoration';
    } else if (randomTopic.toLowerCase().includes('showcase') || randomTopic.toLowerCase().includes('collecting')) {
      category = 'showcase';
    }
    
    // Generate excerpt
    const firstParagraph = content.split('\n\n')[1] || '';
    const excerpt = firstParagraph.substring(0, 150) + '...';
    
    // Generate a custom feature image based on the article topic
    console.log('Generating custom feature image for article...');
    const featuredImage = await generateCarShowImage(title, category === 'history' ? 'vintage car' : 'restomod');
    
    // Add timestamp for unique slug
    const timestamp = new Date().getTime();
    const uniqueSlug = `${slugify(title, { lower: true, strict: true })}-${timestamp}`;
    
    // Create article data with unique slug
    const articleData = {
      title,
      slug: uniqueSlug,
      content,
      category,
      excerpt,
      author: 'Restomod Research Team',
      featuredImage, // Use the generated custom image
      tags: generateTagsFromTitle(title),
      featured: true,
      metaDescription: excerpt
    };
    
    // Validate and create
    const validatedData = researchArticlesInsertSchema.parse(articleData);
    const newArticle = await createResearchArticle(validatedData);
    
    console.log(`Generated new article: "${title}" (ID: ${newArticle.id})`);
    return newArticle;
  } catch (error) {
    console.error('Error generating article:', error);
    return null;
  }
}

// Helper function to generate tags from title
function generateTagsFromTitle(title: string): string[] {
  const commonTags = ['classic cars', 'automotive', 'restoration'];
  const additionalTags: string[] = [];
  
  // Extract potential tags from title
  const keywords = ['muscle', 'mustang', 'camaro', 'ford', 'chevy', 'chevrolet', 
                   'restomod', 'engine', 'design', 'history', 'market', 'value',
                   'paint', 'bodywork', 'investment', 'auction', 'collecting'];
                   
  keywords.forEach(keyword => {
    if (title.toLowerCase().includes(keyword)) {
      additionalTags.push(keyword);
    }
  });
  
  return [...commonTags, ...additionalTags.slice(0, 4)]; // Limit to 7 tags total
}

/**
 * Generates a new article about upcoming classic car shows using the Perplexity API
 */
export async function generateCarShowArticle() {
  // Check if we've already run within the last hour (safety check)
  const now = new Date();
  const timeSinceLastRun = now.getTime() - lastRunTime.getTime();
  const oneHourInMs = 60 * 60 * 1000;
  
  if (timeSinceLastRun < oneHourInMs) {
    console.log(`Skipping scheduled article generation - last run was ${Math.floor(timeSinceLastRun / 60000)} minutes ago`);
    return null;
  }
  
  try {
    // Update the last run time
    lastRunTime = now;
    
    // Create the week range for the search
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const startDate = dateFormat.format(today);
    const endDate = dateFormat.format(nextWeek);
    
    // Generate the prompt for Perplexity
    const query = `Create a comprehensive guide to upcoming classic car shows and automotive events happening between ${startDate} and ${endDate}. Include event names, dates, locations, and what makes each show special. Focus on classic car shows, restomod events, and auctions where possible. Also include a special highlight section featuring the most noteworthy event of the week. Format the article in well-structured markdown with clear headings.`;

    if (!process.env.PERPLEXITY_API_KEY) {
      console.error('Perplexity API key is not configured');
      return null;
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: "You are a knowledgeable automotive journalist specializing in classic cars and restomod events. Create comprehensive, engaging content with accurate details about upcoming car shows and events. Include specific dates, locations, prices, and special features for each event. Format your response in clean markdown with proper headings, subheadings, and bullet points where appropriate."
          },
          {
            role: "user",
            content: query
          }
        ],
        temperature: 0.3,
        top_p: 0.9,
        max_tokens: 1500,
        search_recency_filter: "day"
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Perplexity API error:', errorData);
      return null;
    }

    const data = await response.json() as {
      choices: [{
        message: {
          content: string;
        }
      }];
      citations?: string[];
    };
    
    // Process the response and create the article
    const content = data.choices[0].message.content;
    const citations = data.citations || [];

    // Extract a title from the content - usually the first heading
    const titleMatch = content.match(/^#\s+(.*)/m);
    const title = titleMatch ? titleMatch[1] : `Upcoming Classic Car Shows: ${startDate} to ${endDate}`;
    
    // Create a teaser/excerpt
    const excerpt = `Discover the must-visit classic car shows and automotive events happening from ${startDate} to ${endDate}. Find event details, special features, and our highlighted event of the week.`;
    
    // Extract event information from content for infographic
    const events = extractEventsFromContent(content);
    
    console.log(`Found ${events.length} events in article content`);
    
    // Generate custom feature image and infographic
    console.log('Generating custom feature image...');
    const featuredImage = await generateCarShowImage(title, 'classic car');
    
    // Generate infographic if we have events
    let updatedContent = content;
    if (events.length > 0) {
      console.log('Generating event infographic...');
      const infographicUrl = await generateEventInfographic(events);
      
      if (infographicUrl) {
        // Add the infographic to the article content
        updatedContent += `\n\n## Event Calendar\n\n![Upcoming Event Calendar](${infographicUrl})\n\n`;
      }
    }
    
    // Add a timestamp to ensure unique slugs
    const timestamp = new Date().getTime();
    const uniqueSlug = `${slugify(title, { lower: true, strict: true })}-${timestamp}`;
    
    // Generate article data with unique slug
    const articleData = {
      title,
      slug: uniqueSlug,
      content: updatedContent,
      category: 'events',
      excerpt,
      author: 'Auto Events Team',
      featuredImage, // Use the generated image
      tags: ['car shows', 'events', 'classic cars', 'automotive', 'upcoming'],
      featured: true,
      metaDescription: `Comprehensive guide to upcoming classic car shows and events from ${startDate} to ${endDate}. Find locations, dates, and highlights.`
    };
    
    // Validate and create the article
    const validatedData = researchArticlesInsertSchema.parse(articleData);
    const newArticle = await createResearchArticle(validatedData);
    
    console.log(`Generated new article: "${title}" (ID: ${newArticle.id})`);
    return newArticle;
  } catch (error) {
    console.error('Error generating car show article:', error);
    return null;
  }
}

