import { Request, Response } from 'express';

// Helper function to make research requests to Perplexity API
async function getPerplexityResearch(query: string, type: 'vehicle' | 'part'): Promise<any> {
  try {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      throw new Error('PERPLEXITY_API_KEY environment variable is not set');
    }

    // Set up a system prompt based on the query type
    let systemPrompt = "";
    
    if (type === 'vehicle') {
      systemPrompt = "You are an automotive research expert specializing in classic cars and restomods. Find high-quality, authentic images of the specific classic car model being requested. Return only publicly available, high-resolution images from legitimate sources (auction sites, car magazines, restoration shops). Include accurate information about the specific model, notable features, and what makes this particular classic car special. Format the response as a JSON object with 'images' array (at least 5 image URLs) and 'details' object (year, make, model, bodyStyle, keyFeatures, historyHighlights, valueRange).";
    } else {
      systemPrompt = "You are an automotive parts specialist for classic car restoration and restomodding. Find high-quality, authentic images of the specific car part being requested. Return only publicly available, high-resolution images from legitimate sources (parts vendors, restoration shops, car manufacturers). Include accurate specifications, compatibility information, and quality considerations. Format the response as a JSON object with 'images' array (at least 3 image URLs) and 'specs' object (dimensions, material, fitment, manufacturerInfo, priceRange, qualityNotes).";
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: query
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        search_domain_filter: ["perplexity.ai"],
        return_images: false,
        return_related_questions: false,
        search_recency_filter: "month",
        top_k: 0,
        stream: false,
        presence_penalty: 0,
        frequency_penalty: 1
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API request failed with status: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Extract the JSON from the response content
    try {
      // Handle if the API wraps JSON in code blocks or has additional text
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                        content.match(/```\s*([\s\S]*?)\s*```/) ||
                        content.match(/({[\s\S]*})/); // Find JSON-like structure
      
      const jsonContent = jsonMatch ? jsonMatch[1] : content;
      const parsedData = JSON.parse(jsonContent);
      
      return {
        status: 'success',
        data: parsedData,
        citations: data.citations || []
      };
    } catch (e) {
      console.error('Error parsing JSON from Perplexity response:', e);
      return {
        status: 'error',
        message: 'Failed to parse JSON from research data',
        rawContent: content
      };
    }
  } catch (error) {
    console.error('Error calling Perplexity API for research:', error);
    throw error;
  }
}

// Handler for vehicle research
export async function getVehicleResearch(req: Request, res: Response) {
  try {
    const { model } = req.query;
    
    if (!model) {
      return res.status(400).json({ error: 'Vehicle model is required' });
    }

    const query = `Research and provide detailed information and high-quality images for this classic car model: ${model}. Include at least 5 high-quality images showing different angles and a comprehensive overview of its history, key features, and value.`;
    
    const researchData = await getPerplexityResearch(query, 'vehicle');
    return res.json(researchData);
  } catch (error) {
    console.error('Error in getVehicleResearch:', error);
    return res.status(500).json({ 
      error: 'Failed to get vehicle research',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Handler for part research
export async function getPartResearch(req: Request, res: Response) {
  try {
    const { part, model } = req.query;
    
    if (!part) {
      return res.status(400).json({ error: 'Part name is required' });
    }

    const modelContext = model ? ` for a ${model}` : '';
    const query = `Research and provide detailed information and high-quality images for ${part}${modelContext} in the context of classic car restoration or restomodding. Include at least 3 high-quality images and comprehensive specifications.`;
    
    const researchData = await getPerplexityResearch(query, 'part');
    return res.json(researchData);
  } catch (error) {
    console.error('Error in getPartResearch:', error);
    return res.status(500).json({ 
      error: 'Failed to get part research',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
