import { Request, Response } from "express";
import fetch from "node-fetch";

/**
 * Performs a real-time market research search using the Perplexity API
 */
export async function searchMarketData(req: Request, res: Response) {
  try {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Valid search query is required' });
    }

    if (!process.env.PERPLEXITY_API_KEY) {
      return res.status(500).json({ error: 'Perplexity API key is not configured' });
    }

    // Enhance the query with specific focus on restomod market data
    const enhancedQuery = `${query}. Focus specifically on restomod market data, trends, collector car values, and investment insights. Provide detailed information with numbers and statistics where available.`;

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
            content: "You are a specialized market research assistant focused on classic car restomod market data. Provide detailed, fact-based information with current market values, trends, and statistical data where available. Format your response in a clear, professional style suitable for investors and collectors."
          },
          {
            role: "user",
            content: enhancedQuery
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 1000,
        search_recency_filter: "week"
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Perplexity API error:', errorData);
      return res.status(response.status).json({ 
        error: `Perplexity API request failed: ${response.statusText}` 
      });
    }

    const data = await response.json();
    
    // Process the response
    const content = data.choices[0].message.content;
    const citations = data.citations || [];

    return res.status(200).json({
      content,
      citations
    });
  } catch (error) {
    console.error('Error in searchMarketData:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    });
  }
}