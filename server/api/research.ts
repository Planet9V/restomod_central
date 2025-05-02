import { Request, Response } from "express";
import dotenv from 'dotenv';

dotenv.config();

interface PerplexityRequestMessages {
  role: "system" | "user" | "assistant";
  content: string;
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
}

async function getPerplexityResearch(query: string, type: 'vehicle' | 'part'): Promise<any> {
  const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
  
  if (!PERPLEXITY_API_KEY) {
    throw new Error('PERPLEXITY_API_KEY is not defined in the environment variables');
  }

  const promptInstructions = type === 'vehicle' 
    ? `You are a classic car expert helping with a restomod project. Provide detailed information about the following vehicle: ${query}.

Return a JSON object with the following structure:
{
  "details": {key factual details about the vehicle, including years produced, original engine, horsepower, etc},
  "images": [array of URLs to high-quality, authentic images of the vehicle - include at least 6 image URLs, ensure they're high-resolution, no mockups or AI-generated images]
}`
    : `You are a classic car parts expert helping with a restomod project. Provide detailed information about the following part: ${query}.

Return a JSON object with the following structure:
{
  "specs": {key factual specifications about this part},
  "images": [array of URLs to high-quality, authentic images of the part - include at least 6 image URLs, ensure they're high-resolution real photographs, no mockups or AI-generated images]
}`;

  try {
    const messages: PerplexityRequestMessages[] = [
      {
        role: "system",
        content: "You are an expert in classic car restoration and engine swaps. Only respond with valid JSON. Include many high-quality authentic image URLs from the web. Never fabricate or generate images."
      },
      {
        role: "user",
        content: promptInstructions
      }
    ];

    const perplexityRequest: PerplexityRequest = {
      model: "llama-3.1-sonar-small-128k-online",
      messages,
      temperature: 0.1, // Low temperature for factual responses
      max_tokens: 2000,
      top_p: 0.9,
      stream: false,
      frequency_penalty: 0,
      presence_penalty: 0
    };

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify(perplexityRequest)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Perplexity API error:', errorData);
      throw new Error(`Perplexity API request failed with status ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    
    // Parse the JSON from the content field
    try {
      const content = data.choices[0].message.content;
      const parsedContent = JSON.parse(content);
      return {
        data: parsedContent,
        citations: data.citations || []
      };
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      throw new Error('Failed to parse AI response');
    }
  } catch (error) {
    console.error('Error calling Perplexity API:', error);
    throw error;
  }
}

export async function getVehicleResearch(req: Request, res: Response) {
  try {
    const { model } = req.query;
    
    if (!model || typeof model !== 'string') {
      return res.status(400).json({ error: 'Model name is required' });
    }
    
    const researchData = await getPerplexityResearch(model, 'vehicle');
    res.json(researchData);
  } catch (error) {
    console.error('Error in vehicle research API:', error);
    res.status(500).json({ 
      error: 'Failed to perform vehicle research',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function getPartResearch(req: Request, res: Response) {
  try {
    const { part, model } = req.query;
    
    if (!part || typeof part !== 'string') {
      return res.status(400).json({ error: 'Part name is required' });
    }
    
    // Include model name in the query if provided
    const query = model && typeof model === 'string' 
      ? `${part} for ${model}` 
      : part;
    
    const researchData = await getPerplexityResearch(query, 'part');
    res.json(researchData);
  } catch (error) {
    console.error('Error in part research API:', error);
    res.status(500).json({ 
      error: 'Failed to perform part research',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
