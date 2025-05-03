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

  console.log(`Processing fallback research API request for ${type}: ${query}`);

  const promptInstructions = type === 'vehicle' 
    ? `You are a classic car expert helping with a restomod project. Provide detailed information about the following vehicle: ${query}.

Return a JSON object with the following structure:
{
  "overview": "A general overview of the vehicle",
  "specifications": {key factual details like years produced, engine, horsepower, etc},
  "history": "Historical context of this model",
  "marketTrends": "Current market value information",
  "commonUpgrades": ["Common upgrade 1", "Common upgrade 2"],
  "restomodOptions": ["Restomod option 1", "Restomod option 2"],
  "recommendedParts": ["Recommended part 1", "Recommended part 2"]
}`
    : `You are a classic car parts expert helping with a restomod project. Provide detailed information about the following part: ${query}.

Return a JSON object with the following structure:
{
  "overview": "A general overview of this part",
  "specifications": {key factual specifications about this part},
  "compatibility": "Information about compatibility with different models",
  "alternatives": ["Alternative 1", "Alternative 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}`;

  try {
    const messages: PerplexityRequestMessages[] = [
      {
        role: "system",
        content: "You are an expert in classic car restoration and restomod builds. Only respond with valid JSON in the requested format. Focus on factual information."
      },
      {
        role: "user",
        content: promptInstructions
      }
    ];

    const perplexityRequest: PerplexityRequest = {
      model: "llama-3.1-sonar-small-128k-online",
      messages,
      temperature: 0.2,
      max_tokens: 2000,
      top_p: 0.9,
      stream: false,
      frequency_penalty: 0.1,
      presence_penalty: 0
    };

    console.log('Sending request to fallback research API');
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
      console.error('Fallback research API error:', errorData);
      throw new Error(`Fallback research API request failed with status ${response.status}: ${errorData}`);
    }

    console.log('Successfully received response from fallback research API');
    const data = await response.json();
    
    // Parse the JSON from the content field
    try {
      const content = data.choices[0].message.content;
      // Remove any markdown code block formatting if present
      const cleanedContent = content.replace(/```json\n|```\n|```json|```/g, '');
      const parsedContent = JSON.parse(cleanedContent);
      return parsedContent;
    } catch (error) {
      console.error('Error parsing JSON response from fallback research API:', error);
      throw new Error('Failed to parse fallback research response');
    }
  } catch (error) {
    console.error('Error with fallback research API:', error);
    // Provide minimal fallback data for graceful degradation
    return type === 'vehicle' ? {
      overview: `Information about ${query} is currently unavailable.`,
      specifications: {},
      error: error instanceof Error ? error.message : 'Unknown error'
    } : {
      overview: `Information about ${query} is currently unavailable.`,
      specifications: {},
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function getVehicleResearch(req: Request, res: Response) {
  try {
    const { model } = req.query;
    
    if (!model || typeof model !== 'string') {
      return res.status(400).json({ error: 'Model name is required' });
    }
    
    console.log(`Handling vehicle research request for model: ${model}`);
    const researchData = await getPerplexityResearch(model, 'vehicle');
    
    // If we got an error back in the data, return a 500 status
    if (researchData.error) {
      console.warn('Vehicle research returned with error:', researchData.error);
      return res.status(500).json({
        error: 'Failed to perform vehicle research',
        message: researchData.error,
        // Still include the overview as a fallback message
        overview: researchData.overview || `Information about ${model} is currently unavailable.`
      });
    }
    
    console.log('Successfully returning vehicle research data');
    res.json(researchData);
  } catch (error) {
    console.error('Error in vehicle research API:', error);
    res.status(500).json({ 
      error: 'Failed to perform vehicle research',
      message: error instanceof Error ? error.message : 'Unknown error',
      overview: `Information about ${req.query.model} is currently unavailable. Please try again later.`
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
    
    console.log(`Handling part research request for: ${query}`);
    const researchData = await getPerplexityResearch(query, 'part');
    
    // If we got an error back in the data, return a 500 status
    if (researchData.error) {
      console.warn('Part research returned with error:', researchData.error);
      return res.status(500).json({
        error: 'Failed to perform part research',
        message: researchData.error,
        // Still include the overview as a fallback message
        overview: researchData.overview || `Information about ${query} is currently unavailable.`
      });
    }
    
    console.log('Successfully returning part research data');
    res.json(researchData);
  } catch (error) {
    console.error('Error in part research API:', error);
    res.status(500).json({ 
      error: 'Failed to perform part research',
      message: error instanceof Error ? error.message : 'Unknown error',
      overview: `Information about ${req.query.part}${req.query.model ? ` for ${req.query.model}` : ''} is currently unavailable. Please try again later.`
    });
  }
}
