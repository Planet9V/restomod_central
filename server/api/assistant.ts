import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = 'gemini-1.5-flash';

// Initialize the Gemini AI client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

type MessageHistory = {
  role: 'user' | 'assistant';
  content: string;
}

// K.I.T.T.-inspired assistant handler
export async function assistantChat(req: Request, res: Response) {
  try {
    const { message, config, configContext, conversationHistory } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Create a conversational history for the model
    const history: MessageHistory[] = [];
    
    // Add system prompt to set the assistant's personality and knowledge base
    const systemPrompt = `You are K.I.T.T. (Knight Industries Tecnical Transformation), an advanced AI assistant specialized in classic car restomods. You have the following characteristics:

1. Personality: You speak in a confident, slightly formal manner reminiscent of K.I.T.T. from Knight Rider. You're knowledgeable, helpful, and occasionally witty.

2. Expertise: You are an expert in classic car restoration, mechanics, automotive history, and modern performance upgrades. You understand the balance between preserving a classic car's heritage and enhancing its performance.

3. Function: Your purpose is to assist users with their restomod car configuration choices, providing technical advice, historical context, and recommendations.

4. Tone: Professional but conversational. You address the human directly and personably.

5. Focus: Keep responses concise (under 150 words) and directly relevant to the user's query. Prioritize giving specific, actionable advice.

The user is currently configuring a restomod build and may ask about compatibility, historical accuracy, performance implications, or value considerations. 

${configContext || 'The user has not selected any configuration options yet.'}

Analyze their question and provide helpful, specific guidance. If asked for recommendations, suggest specific options that would complement their current selections.`;
    
    // Add the existing conversation history
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.forEach(msg => {
        history.push({
          role: msg.role,
          content: msg.content
        });
      });
    }
    
    // Add the new user message
    history.push({
      role: 'user',
      content: message
    });
    
    // Create a chat session
    const chat = model.startChat({
      history: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      })),
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 800,
      },
    });
    
    // Get response from the model
    const result = await chat.sendMessage(systemPrompt + "\n\nUser query: " + message);
    const responseText = result.response.text();
    
    // Parse the response to look for specific recommendations
    let recommendations = null;
    
    // Example recommendations extraction (simplified - would need more sophisticated parsing in production)
    if (responseText.includes('recommend') || responseText.includes('suggestion')) {
      // Extract structured recommendations if possible
      const engineRec = responseText.match(/recommend.*?engine.*?([\w\s\d\-\.]+)/i);
      const colorRec = responseText.match(/recommend.*?color.*?([\w\s\d\-\.]+)/i);
      const wheelRec = responseText.match(/recommend.*?wheels?.*?([\w\s\d\-\.]+)/i);
      
      if (engineRec || colorRec || wheelRec) {
        recommendations = {
          engine: engineRec ? engineRec[1].trim() : null,
          color: colorRec ? colorRec[1].trim() : null,
          wheels: wheelRec ? wheelRec[1].trim() : null,
        };
      }
    }
    
    // Return the response
    return res.json({
      message: responseText,
      recommendations: recommendations
    });
    
  } catch (error) {
    console.error('Error in assistant chat:', error);
    return res.status(500).json({ 
      error: 'Failed to process chat message',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Get historical context for a specific car model
export async function getHistoricalContext(req: Request, res: Response) {
  try {
    const { modelName, year, make, category } = req.query;
    
    if (!modelName && !year && !make) {
      return res.status(400).json({ error: 'At least one of modelName, year, or make is required' });
    }
    
    // Construct a prompt for historical context
    let prompt = 'Generate a detailed historical context for ';
    
    if (year && make && modelName) {
      prompt += `the ${year} ${make} ${modelName}`;
    } else if (make && modelName) {
      prompt += `the ${make} ${modelName}`;
    } else if (year && make) {
      prompt += `${make} vehicles from ${year}`;
    } else if (make) {
      prompt += `${make} as an automotive manufacturer`;
    } else if (year) {
      prompt += `automobiles from the year ${year}`;
    } else if (modelName) {
      prompt += `the ${modelName} model`;
    }
    
    prompt += '. Include information about:';
    prompt += `
1. Historical significance and cultural impact
2. Notable design features and innovations
3. Production details and variations
4. Performance specifications of the original
5. Value and collectibility factors
6. Popular restoration and modification approaches`;
    
    if (category) {
      prompt += `\n7. Specific considerations for ${category} vehicles`;
    }
    
    // Create a chat session
    const chat = model.startChat({
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1000,
      },
    });
    
    // Get response from the model
    const result = await chat.sendMessage(prompt);
    const responseText = result.response.text();
    
    // Process the response to structure it better
    const sections = processHistoricalContext(responseText);
    
    // Return the structured historical context
    return res.json({
      fullText: responseText,
      sections: sections
    });
    
  } catch (error) {
    console.error('Error generating historical context:', error);
    return res.status(500).json({ 
      error: 'Failed to generate historical context',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Process the historical context to extract structured sections
function processHistoricalContext(text: string) {
  const sectionTitles = [
    'Historical Significance',
    'Design Features',
    'Production Details',
    'Performance Specifications',
    'Value and Collectibility',
    'Restoration Approaches',
    'Additional Considerations'
  ];
  
  const sections: Record<string, string> = {};
  
  // Simple section extraction based on common headers
  // A more robust implementation would use regex or NLP
  const lines = text.split('\n');
  let currentSection = '';
  let currentContent = '';
  
  for (const line of lines) {
    // Check if this line could be a header
    const headerMatch = line.match(/^#+\s+(.+)$/) || line.match(/^([^:]+):$/);
    
    if (headerMatch) {
      // If we were building a section, save it
      if (currentSection) {
        sections[currentSection] = currentContent.trim();
      }
      
      // Start a new section
      currentSection = headerMatch[1].trim();
      currentContent = '';
    } else {
      // Add to current section content
      currentContent += line + '\n';
    }
  }
  
  // Save the last section
  if (currentSection) {
    sections[currentSection] = currentContent.trim();
  }
  
  // If no sections were found, fallback to predefined sections
  if (Object.keys(sections).length === 0) {
    // Try to roughly divide the text into predefined sections
    const textChunks = splitTextIntoChunks(text, sectionTitles.length);
    
    sectionTitles.forEach((title, index) => {
      if (index < textChunks.length) {
        sections[title] = textChunks[index];
      }
    });
  }
  
  return sections;
}

// Helper function to split text into roughly equal chunks
function splitTextIntoChunks(text: string, numChunks: number) {
  const words = text.split(' ');
  const wordsPerChunk = Math.ceil(words.length / numChunks);
  const chunks: string[] = [];
  
  for (let i = 0; i < numChunks; i++) {
    const startIndex = i * wordsPerChunk;
    const endIndex = Math.min(startIndex + wordsPerChunk, words.length);
    
    if (startIndex < words.length) {
      chunks.push(words.slice(startIndex, endIndex).join(' '));
    }
  }
  
  return chunks;
}

// Generate performance predictions based on selected components
export async function generatePerformancePrediction(req: Request, res: Response) {
  try {
    const { carModel, engine, transmission, modifications } = req.body;
    
    if (!carModel || !engine) {
      return res.status(400).json({ error: 'Car model and engine are required' });
    }
    
    // Construct a prompt for performance prediction
    let prompt = `Generate performance predictions for a ${carModel} with a ${engine}`;
    
    if (transmission) {
      prompt += ` and ${transmission} transmission`;
    }
    
    if (modifications && Array.isArray(modifications) && modifications.length > 0) {
      prompt += `, with the following modifications: ${modifications.join(', ')}`;
    }
    
    prompt += `. Include predictions for:
1. Estimated horsepower and torque
2. 0-60 mph acceleration time
3. Quarter mile time
4. Top speed potential
5. Fuel efficiency
6. Handling characteristics
7. Braking performance

Based on historical data and engineering principles, provide realistic estimates with appropriate ranges to account for variations in build quality and tuning.`;
    
    // Create a chat session
    const chat = model.startChat({
      generationConfig: {
        temperature: 0.3,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 800,
      },
    });
    
    // Get response from the model
    const result = await chat.sendMessage(prompt);
    const responseText = result.response.text();
    
    // Extract structured performance metrics
    const performanceMetrics = extractPerformanceMetrics(responseText);
    
    // Return the performance prediction
    return res.json({
      fullText: responseText,
      metrics: performanceMetrics
    });
    
  } catch (error) {
    console.error('Error generating performance prediction:', error);
    return res.status(500).json({ 
      error: 'Failed to generate performance prediction',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Extract performance metrics from the generated text
function extractPerformanceMetrics(text: string) {
  // Simple regex-based extraction
  const metrics: Record<string, string> = {};
  
  // Extract horsepower
  const hpMatch = text.match(/horsepower.*?(\d+[-–—]\d+|\d+\s*[-–—]\s*\d+|\d+)/i);
  if (hpMatch) {
    metrics.horsepower = hpMatch[1].trim();
  }
  
  // Extract torque
  const torqueMatch = text.match(/torque.*?(\d+[-–—]\d+|\d+\s*[-–—]\s*\d+|\d+)\s*(?:lb-ft|ft-lb|nm)/i);
  if (torqueMatch) {
    metrics.torque = torqueMatch[1].trim();
  }
  
  // Extract 0-60 time
  const zeroSixtyMatch = text.match(/0[-–—]60.*?(\d+\.\d+[-–—]\d+\.\d+|\d+\.\d+)\s*(?:seconds|s|sec)/i);
  if (zeroSixtyMatch) {
    metrics.zeroToSixty = zeroSixtyMatch[1].trim();
  }
  
  // Extract quarter mile time
  const quarterMileMatch = text.match(/quarter mile.*?(\d+\.\d+[-–—]\d+\.\d+|\d+\.\d+)\s*(?:seconds|s|sec)/i);
  if (quarterMileMatch) {
    metrics.quarterMile = quarterMileMatch[1].trim();
  }
  
  // Extract top speed
  const topSpeedMatch = text.match(/top speed.*?(\d+[-–—]\d+|\d+)\s*(?:mph|mi\/h)/i);
  if (topSpeedMatch) {
    metrics.topSpeed = topSpeedMatch[1].trim();
  }
  
  return metrics;
}