import { Request, Response } from 'express';
import fetch from 'node-fetch';

export async function searchMarketData(req: Request, res: Response) {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    if (!process.env.PERPLEXITY_API_KEY) {
      return res.status(500).json({ error: 'Perplexity API key is not configured' });
    }
    
    // Create a detailed prompt for market research
    const researchPrompt = `Act as a premium automotive market research analyst specializing in classic car restomods.
Provide a detailed analysis of the following restomod market query:
"${query}"

Include specific details like:
- Actual price ranges with real dollar figures (average build costs, premium build costs)
- Growth rates and appreciation percentages
- Model-specific investment outlook
- Builder premium percentages
- Recent notable auction results with actual prices
- Major value factors and their impact on pricing

Structure your answer in a professional, concise format with market data clearly presented.
Focus only on factual market information without using filler content.`;

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
            content: "You are a premium automotive market analysis expert with access to the most recent data on classic car and restomod valuations. Provide detailed, data-rich responses with specific dollar figures, percentages, and growth rates. Include actual pricing from recent auctions and builder premiums where applicable."
          },
          {
            role: "user",
            content: researchPrompt
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 1500,
        search_recency_filter: "day", 
        return_search_queries: true,
        search_domain_filter: ["automotive", "finance"]
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Perplexity API error:', errorData);
      return res.status(500).json({ error: 'Failed to fetch market research data' });
    }

    const data = await response.json() as {
      choices: [{
        message: {
          content: string;
        }
      }];
      citations?: string[];
      search_queries?: string[];
    };
    
    // Process and return the response
    const result = {
      content: data.choices[0].message.content,
      sources: data.citations || [],
      searchQueries: data.search_queries || [],
      // Extract structured market data if possible
      marketData: extractMarketData(data.choices[0].message.content)
    };
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in market research API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Helper function to extract structured data from the response
function extractMarketData(content: string): Record<string, string> | null {
  const marketData: Record<string, string> = {};
  
  // Try to extract price ranges
  const priceRangeRegex = /(\$[\d,]+\s*-\s*\$[\d,]+)/g;
  const priceRanges = content.match(priceRangeRegex);
  if (priceRanges && priceRanges.length > 0) {
    marketData['Price Range'] = priceRanges[0];
  }
  
  // Try to extract percentages
  const percentageRegex = /(\d+(?:\.\d+)?%)/g;
  const percentages = content.match(percentageRegex);
  if (percentages && percentages.length > 0) {
    marketData['Growth Rate'] = percentages[0];
  }
  
  // Try to extract years
  const yearRangeRegex = /(20\d\d\s*-\s*20\d\d)/g;
  const yearRanges = content.match(yearRangeRegex);
  if (yearRanges && yearRanges.length > 0) {
    marketData['Period'] = yearRanges[0];
  }
  
  // Try to extract dollar amounts
  const dollarRegex = /(\$[\d,]+)/g;
  const dollars = content.match(dollarRegex);
  if (dollars && dollars.length > 0) {
    marketData['Average Value'] = dollars[0];
    if (dollars.length > 1) {
      marketData['Premium Value'] = dollars[1];
    }
  }
  
  return Object.keys(marketData).length > 0 ? marketData : null;
}