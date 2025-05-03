import { Request, Response } from 'express';
import fetch from 'node-fetch';

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

interface PerplexityRequestMessages {
  role: "system" | "user" | "assistant";
  content: string;
}

interface PerplexityMessage {
  role: string;
  content: string;
}

interface PerplexityChoice {
  index: number;
  finish_reason: string;
  message: PerplexityMessage;
}

interface PerplexityResponse {
  id: string;
  model: string;
  created: number;
  choices: PerplexityChoice[];
  citations?: string[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface PerplexityRequest {
  model: string;
  messages: PerplexityRequestMessages[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
  frequency_penalty?: number;
  presence_penalty?: number;
  return_related_questions?: boolean;
  search_recency_filter?: string;
  top_k?: number;
}

/**
 * Get research information about a specific car model
 */
export async function getCarInformation(req: Request, res: Response) {
  try {
    const { model } = req.query;
    
    if (!model || typeof model !== 'string') {
      return res.status(400).json({ error: 'Car model is required' });
    }
    
    // Check if API key is available
    if (!PERPLEXITY_API_KEY) {
      return res.status(500).json({ 
        error: 'Perplexity API key is not configured',
        details: 'Please set the PERPLEXITY_API_KEY environment variable'
      });
    }
    
    const perplexityRequest: PerplexityRequest = {
      model: "llama-3.1-sonar-small-128k-online",
      messages: [
        {
          role: "system",
          content: "You are an expert in classic cars and restomod vehicles. Your responses should be comprehensive, detailed, and formatted in clear sections."
        },
        {
          role: "user",
          content: `I need detailed information about the ${model} classic car. Please include sections on:
          1. General overview and significance of this model
          2. Original specifications
          3. Historical context and production details
          4. Notable examples and special editions
          5. Current market value trends (including price ranges over the last 10 years if possible)
          6. Common upgrades and restomod options
          7. Recommended parts and modifications for a restomod build`
        }
      ],
      temperature: 0.2,
      top_p: 0.9,
      return_related_questions: false,
      search_recency_filter: "month",
      stream: false,
      frequency_penalty: 0.1,
      presence_penalty: 0
    };
    
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify(perplexityRequest)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error:', errorText);
      return res.status(response.status).json({ 
        error: 'Error fetching car information from Perplexity API',
        details: errorText
      });
    }
    
    const data = await response.json() as PerplexityResponse;
    
    if (data.choices && data.choices.length > 0 && 
        data.choices[0].message && 
        data.choices[0].message.content) {
      
      // Process the response into structured sections
      const content = data.choices[0].message.content;
      
      // Return the structured data
      return res.json({
        success: true,
        content,
        citations: data.citations || [],
        model: data.model
      });
    }
    
    return res.status(500).json({ 
      error: 'No valid content found in Perplexity response', 
      responseData: data 
    });
    
  } catch (error) {
    console.error('Error fetching car information:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch car information', 
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get research information about a specific car part
 */
export async function getPartInformation(req: Request, res: Response) {
  try {
    const { part, model } = req.query;
    
    if (!part) {
      return res.status(400).json({ error: 'Part name is required' });
    }
    
    let promptContent = `I need detailed information about ${part} for classic cars.`;
    
    if (model) {
      promptContent = `I need detailed information about ${part} specifically for the ${model} classic car.`;
    }
    
    promptContent += ` Please include sections on:
    1. General overview and purpose of this part
    2. Technical specifications
    3. Compatibility with different models
    4. Modern alternatives and upgrades
    5. Installation considerations
    6. Price ranges and quality differences
    7. Recommended brands and models`;
    
    const perplexityRequest: PerplexityRequest = {
      model: "llama-3.1-sonar-small-128k-online",
      messages: [
        {
          role: "system",
          content: "You are an expert in classic car restoration and restomod builds. Your responses should be comprehensive, detailed, and formatted in clear sections."
        },
        {
          role: "user",
          content: promptContent
        }
      ],
      temperature: 0.2,
      top_p: 0.9,
      return_related_questions: false,
      search_recency_filter: "month",
      stream: false,
      frequency_penalty: 0.1,
      presence_penalty: 0
    };
    
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify(perplexityRequest)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error:', errorText);
      return res.status(response.status).json({ 
        error: 'Error fetching part information from Perplexity API',
        details: errorText
      });
    }
    
    const data = await response.json();
    
    if (data.choices && data.choices.length > 0 && 
        data.choices[0].message && 
        data.choices[0].message.content) {
      
      // Process the response into structured sections
      const content = data.choices[0].message.content;
      
      // Return the structured data
      return res.json({
        success: true,
        content,
        citations: data.citations || [],
        model: data.model
      });
    }
    
    return res.status(500).json({ 
      error: 'No valid content found in Perplexity response', 
      responseData: data 
    });
    
  } catch (error) {
    console.error('Error fetching part information:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch part information', 
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get configuration recommendations for a car model
 */
export async function getConfigurationRecommendations(req: Request, res: Response) {
  try {
    const { model, budget, focus } = req.body;
    
    if (!model) {
      return res.status(400).json({ error: 'Car model is required' });
    }
    
    let promptContent = `I need detailed recommendations for a restomod build of a ${model}.`;
    
    if (budget) {
      promptContent += ` The total budget is approximately ${budget}.`;
    }
    
    if (focus) {
      promptContent += ` The build should focus primarily on ${focus}.`;
    }
    
    promptContent += ` Please include recommendations for:
    1. Engine upgrades
    2. Suspension and chassis modifications
    3. Brake system improvements
    4. Interior upgrades
    5. Exterior modifications
    6. Electronics and comfort features
    7. Budget allocation across different areas
    8. Must-have vs. nice-to-have items`;
    
    const perplexityRequest: PerplexityRequest = {
      model: "llama-3.1-sonar-small-128k-online",
      messages: [
        {
          role: "system",
          content: "You are an expert in restomod builds and classic car upgrades. Your responses should be comprehensive, detailed, and formatted in clear sections. Focus on realistic, practical advice rather than theoretical possibilities."
        },
        {
          role: "user",
          content: promptContent
        }
      ],
      temperature: 0.2,
      top_p: 0.9,
      return_related_questions: false,
      search_recency_filter: "month",
      stream: false,
      frequency_penalty: 0.1,
      presence_penalty: 0
    };
    
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify(perplexityRequest)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error:', errorText);
      return res.status(response.status).json({ 
        error: 'Error fetching configuration recommendations from Perplexity API',
        details: errorText
      });
    }
    
    const data = await response.json();
    
    if (data.choices && data.choices.length > 0 && 
        data.choices[0].message && 
        data.choices[0].message.content) {
      
      // Process the response into structured sections
      const content = data.choices[0].message.content;
      
      // Return the structured data
      return res.json({
        success: true,
        content,
        citations: data.citations || [],
        model: data.model
      });
    }
    
    return res.status(500).json({ 
      error: 'No valid content found in Perplexity response', 
      responseData: data 
    });
    
  } catch (error) {
    console.error('Error fetching configuration recommendations:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch configuration recommendations', 
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
