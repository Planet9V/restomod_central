import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';

/**
 * Generate a themed image for car show articles using Gemini API
 * @param title The title of the article
 * @param description Brief description of the article content
 * @returns URL path to the generated image
 */
export async function generateCarShowImage(title: string, eventType: string): Promise<string> {
  try {
    // Check if we have the Gemini API key
    if (!process.env.GEMINI_API_KEY) {
      console.warn('Gemini API key not available. Using default image.');
      return 'https://images.unsplash.com/photo-1541497613813-0780960684a4?w=1200&auto=format&fit=crop';
    }
    
    // Create a specific prompt for car show imagery
    const carTypes = ['classic muscle cars', 'vintage hot rods', 'restored classic cars', 'custom restomods', 'classic European sports cars'];
    const randomCarType = carTypes[Math.floor(Math.random() * carTypes.length)];
    
    const prompts = [
      `Create a professional marketing poster for a classic car show titled "${title}". The image should feature multiple ${randomCarType} parked together at a show, with elegant lighting, reflective surfaces, and a premium atmosphere. Use warm lighting and a cinematic look to highlight the cars' details. Include subtle event information text in an elegant font. Style: high-end automotive photography.`,
      `Design a high-quality banner image for "${title}" car event. Show a line of pristine ${randomCarType} from a dramatic low angle with golden hour lighting. Use shallow depth of field to create a premium look. Include sophisticated branding elements and create a luxury automotive atmosphere. Style: professional magazine cover quality.`,
      `Create a promotional image for a ${eventType} car show called "${title}". Show multiple beautifully restored ${randomCarType} at an outdoor exhibition with dramatic lighting. Use a wide cinematic composition with attention to reflections and details. Style should evoke high-end automotive brands like Porsche and Rolls-Royce marketing.`
    ];
    
    // Select a random prompt variation for variety
    const imagePrompt = prompts[Math.floor(Math.random() * prompts.length)];
    
    // Generate image using the updated Gemini API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: imagePrompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      console.error('Error generating image with Gemini:', await response.text());
      return 'https://images.unsplash.com/photo-1541497613813-0780960684a4?w=1200&auto=format&fit=crop';
    }
    
    const data = await response.json() as any;
    
    // If we have a text generation response but no image, use a default image
    if (!data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType) {
      console.warn('Gemini API did not return an image. Using default image.');
      return 'https://images.unsplash.com/photo-1541497613813-0780960684a4?w=1200&auto=format&fit=crop';
    }
    
    // Save the generated image to the public directory
    const base64Data = data.candidates[0].content.parts[0].inlineData.data;
    const imageFileName = `car_show_${uuidv4()}.jpg`;
    const publicPath = path.join(process.cwd(), 'public', 'generated');
    
    // Ensure the directory exists
    await fs.mkdir(publicPath, { recursive: true });
    
    // Write the file
    await fs.writeFile(path.join(publicPath, imageFileName), base64Data, 'base64');
    
    // Return the URL path that can be used in the application
    return `/generated/${imageFileName}`;
  } catch (error) {
    console.error('Error in generateCarShowImage:', error);
    return 'https://images.unsplash.com/photo-1541497613813-0780960684a4?w=1200&auto=format&fit=crop';
  }
}

/**
 * Generate an infographic for car show articles
 * This creates an SVG infographic with event details
 * @param events List of events with details
 * @returns URL path to the generated infographic
 */
export async function generateEventInfographic(events: Array<{name: string, date: string, location: string, highlight?: boolean}>): Promise<string> {
  try {
    // Create a unique filename for this infographic
    const infographicFileName = `events_infographic_${uuidv4()}.svg`;
    const publicPath = path.join(process.cwd(), 'public', 'generated');
    
    // Ensure the directory exists
    await fs.mkdir(publicPath, { recursive: true });
    
    // Generate SVG content for the infographic
    let svgContent = `
    <svg width="800" height="${Math.max(400, 100 + events.length * 80)}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .title { font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; fill: #333; }
        .event { font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; fill: #333; }
        .date { font-family: Arial, sans-serif; font-size: 14px; fill: #666; }
        .location { font-family: Arial, sans-serif; font-size: 14px; fill: #666; }
        .highlight { filter: drop-shadow(0px 0px 5px rgba(217, 37, 42, 0.5)); }
        .event-box { fill: #fff; stroke: #ddd; stroke-width: 1; rx: 5; ry: 5; }
        .event-highlight { fill: #fff; stroke: #D9252A; stroke-width: 2; rx: 5; ry: 5; }
        .header { fill: #222; }
      </style>
      
      <!-- Header background -->
      <rect x="0" y="0" width="800" height="60" class="header" />
      
      <!-- Title -->
      <text x="400" y="40" text-anchor="middle" class="title" fill="#fff">Upcoming Classic Car Events</text>
      
      <!-- Events -->
    `;
    
    // Add each event to the SVG
    events.forEach((event, index) => {
      const yPos = 100 + index * 80;
      const boxClass = event.highlight ? 'event-highlight' : 'event-box';
      const groupClass = event.highlight ? 'highlight' : '';
      
      svgContent += `
      <g class="${groupClass}">
        <rect x="50" y="${yPos-30}" width="700" height="70" class="${boxClass}" />
        <text x="70" y="${yPos}" class="event">${event.name}</text>
        <text x="70" y="${yPos+20}" class="date">📅 ${event.date}</text>
        <text x="300" y="${yPos+20}" class="location">📍 ${event.location}</text>
        ${event.highlight ? `<text x="700" y="${yPos+10}" text-anchor="end" fill="#D9252A" font-weight="bold">★ FEATURED</text>` : ''}
      </g>
      `;
    });
    
    // Close the SVG
    svgContent += `</svg>`;
    
    // Write the SVG file
    await fs.writeFile(path.join(publicPath, infographicFileName), svgContent);
    
    // Return the URL path
    return `/generated/${infographicFileName}`;
  } catch (error) {
    console.error('Error generating event infographic:', error);
    return '';
  }
}

/**
 * Extract event information from article content
 * @param content Markdown content of the article
 * @returns Array of event objects with name, date, location
 */
export function extractEventsFromContent(content: string): Array<{name: string, date: string, location: string, highlight?: boolean}> {
  const events: Array<{name: string, date: string, location: string, highlight?: boolean}> = [];
  
  // Look for event patterns in markdown content
  // Typical patterns include:
  // ## Event Name
  // - Date: May 25, 2025
  // - Location: Los Angeles, CA
  
  // Split by headings to find event sections
  const sections = content.split(/##\s+/);
  
  for (const section of sections) {
    if (!section.trim()) continue;
    
    const lines = section.split('\n');
    if (lines.length < 3) continue;
    
    const eventName = lines[0].trim();
    
    // Look for date and location information in bulleted lists
    let date = '';
    let location = '';
    let isHighlight = false;
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.match(/date|when/i) && line.includes(':')) {
        date = line.split(':')[1].trim();
      } else if (line.match(/location|place|venue|where/i) && line.includes(':')) {
        location = line.split(':')[1].trim();
      } else if (line.match(/highlight|featured|special/i)) {
        isHighlight = true;
      }
    }
    
    // Only add if we have at least a name and either date or location
    if (eventName && (date || location)) {
      events.push({
        name: eventName,
        date: date || 'TBA',
        location: location || 'TBA',
        highlight: isHighlight
      });
    }
  }
  
  // If no events were detected but we have content, create a default entry
  if (events.length === 0 && content.length > 0) {
    const title = content.match(/# (.*)/)?.[1] || 'Upcoming Car Show';
    
    events.push({
      name: title,
      date: 'Coming Soon',
      location: 'Various Locations',
      highlight: true
    });
  }
  
  return events;
}