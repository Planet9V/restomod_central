import { Request, Response } from 'express';

// Helper function to make requests to Perplexity API
async function getPerplexityResponse(prompt: string): Promise<string> {
  try {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      throw new Error('PERPLEXITY_API_KEY environment variable is not set');
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
            content: "You are an automotive expert specializing in classic car restomods. Provide detailed, technical, but concise advice that enhances a customer's custom build. Focus on performance optimization, compatibility, and value. Keep recommendations short, specific, and tailored to the exact configuration specified. Include 2-3 suggestions maximum and explain briefly why they would enhance the build."
          },
          {
            role: "user",
            content: prompt
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
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Perplexity API:', error);
    throw error;
  }
}

// Handler for AI configurator recommendations
export async function getConfiguratorRecommendation(req: Request, res: Response) {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const recommendation = await getPerplexityResponse(prompt);
    return res.json({ recommendation });
  } catch (error) {
    console.error('Error in getConfiguratorRecommendation:', error);
    return res.status(500).json({ 
      error: 'Failed to get AI recommendation',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
