/**
 * PERPLEXITY AI INTEGRATION FOR CAR RESEARCH
 * Automated vehicle discovery and market analysis system
 */

interface PerplexityResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  citations: string[];
  choices: Array<{
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class PerplexityService {
  private apiKey: string;
  private baseUrl = 'https://api.perplexity.ai/chat/completions';
  
  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ PERPLEXITY_API_KEY not found in environment variables');
    }
  }

  async makeRequest(messages: Array<{ role: string; content: string }>, model = 'llama-3.1-sonar-small-128k-online'): Promise<PerplexityResponse> {
    if (!this.apiKey) {
      throw new Error('Perplexity API key is required for car research functionality');
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 1000,
        temperature: 0.2,
        top_p: 0.9,
        search_recency_filter: 'month',
        return_images: false,
        return_related_questions: false,
        stream: false,
        presence_penalty: 0,
        frequency_penalty: 1
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * REGIONAL VEHICLE DISCOVERY
   * Searches for new classic cars in specific regions
   */
  async discoverRegionalVehicles(region: string): Promise<any> {
    const regionQueries = {
      south: `Find classic cars for sale 1950-1979 currently available in Texas, Florida, Georgia, North Carolina, South Carolina, Alabama, Mississippi, Louisiana, Arkansas, Tennessee, Kentucky, West Virginia, Virginia on Hemmings Motor News, Bring a Trailer, Gateway Classic Cars, Barrett-Jackson, and Mecum Auctions. Include make, model, year, asking price, exact city/state location, condition, engine details, transmission type, and brief description for each vehicle. Focus on investment-grade muscle cars, sports cars, and classics. Exclude already sold vehicles.`,
      
      midwest: `Find classic cars for sale 1950-1979 currently available in Illinois, Indiana, Ohio, Michigan, Wisconsin, Minnesota, Iowa, Missouri, North Dakota, South Dakota, Nebraska, Kansas on Hemmings Motor News, Bring a Trailer, Gateway Classic Cars Chicago/Detroit showrooms, Volo Auto Museum, and RK Motors. Include detailed specifications and current asking prices. Focus on Corvettes, Mustangs, Camaros, and muscle cars.`,
      
      west: `Find classic cars for sale 1950-1979 currently available in California, Oregon, Washington, Nevada, Arizona, Utah, Colorado, New Mexico, Wyoming, Montana, Idaho on Hemmings Motor News, Bring a Trailer, West Coast Classic Cars, Barrett-Jackson Scottsdale, and Bonhams California. Focus on European sports cars, Porsches, Mercedes, BMWs, and rust-free California cars.`,
      
      northeast: `Find classic cars for sale 1950-1979 currently available in New York, Pennsylvania, New Jersey, Connecticut, Rhode Island, Massachusetts, Vermont, New Hampshire, Maine, Maryland, Delaware, DC on Hemmings Motor News, Bonhams, RM Sotheby's, and Bring a Trailer. Focus on luxury classics, Cadillacs, Lincolns, and high-end sports cars.`
    };

    const query = regionQueries[region as keyof typeof regionQueries] || regionQueries.midwest;

    const response = await this.makeRequest([
      {
        role: 'system',
        content: 'You are an expert classic car researcher. Provide accurate, current vehicle listings with verified pricing and specifications.'
      },
      {
        role: 'user',
        content: query
      }
    ]);

    return {
      region,
      content: response.choices[0]?.message?.content || '',
      citations: response.citations || [],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * INVESTMENT ANALYSIS
   * Analyzes investment potential for specific vehicles
   */
  async analyzeVehicleInvestment(make: string, model: string, year: number, currentPrice?: number): Promise<any> {
    const priceContext = currentPrice ? ` with current asking price of $${currentPrice.toLocaleString()}` : '';
    
    const query = `Analyze the investment potential for a ${year} ${make} ${model}${priceContext}. Provide:
    1. Current fair market value range
    2. 5-year historical appreciation trend percentage
    3. Recent comparable sales data from Bring a Trailer, Barrett-Jackson, Mecum
    4. Rarity factors and production numbers
    5. Investment grade recommendation (A+ to C scale)
    6. Market trend direction (rising/stable/declining)
    7. Key factors affecting value (matching numbers, documentation, condition)
    8. Price prediction for next 2-3 years`;

    const response = await this.makeRequest([
      {
        role: 'system',
        content: 'You are a classic car investment analyst with access to current auction data and market trends. Provide data-driven investment analysis.'
      },
      {
        role: 'user',
        content: query
      }
    ]);

    return {
      vehicle: `${year} ${make} ${model}`,
      analysis: response.choices[0]?.message?.content || '',
      citations: response.citations || [],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * MARKET TRENDS ANALYSIS
   * Analyzes overall classic car market trends
   */
  async analyzeMarketTrends(category?: string): Promise<any> {
    const categoryFilter = category ? ` focusing on ${category}` : '';
    
    const query = `Analyze current classic car market trends for 2024-2025${categoryFilter}. Include:
    1. Overall market performance and growth rates
    2. Top performing vehicle categories and models
    3. Regional market variations across US
    4. Price appreciation trends by decade (1950s, 1960s, 1970s)
    5. Emerging trends and undervalued segments
    6. Economic factors affecting the classic car market
    7. Auction house performance data (Barrett-Jackson, Mecum, RM Sotheby's, Bonhams)
    8. Investment recommendations for 2025`;

    const response = await this.makeRequest([
      {
        role: 'system',
        content: 'You are a classic car market analyst with access to current auction data, sales trends, and economic indicators.'
      },
      {
        role: 'user',
        content: query
      }
    ]);

    return {
      category: category || 'overall',
      trends: response.choices[0]?.message?.content || '',
      citations: response.citations || [],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * VEHICLE AUTHENTICATION
   * Verifies vehicle details and authenticity
   */
  async authenticateVehicle(make: string, model: string, year: number, vin?: string, features?: string[]): Promise<any> {
    const vinInfo = vin ? ` with VIN ${vin}` : '';
    const featuresInfo = features && features.length > 0 ? ` featuring: ${features.join(', ')}` : '';
    
    const query = `Verify the authenticity and specifications for a ${year} ${make} ${model}${vinInfo}${featuresInfo}. Provide:
    1. Factory production numbers and rarity
    2. Original engine and transmission options
    3. Available colors and interior combinations
    4. Optional equipment and packages
    5. VIN decoding information (if applicable)
    6. Common reproduction vs original parts to verify
    7. Documentation requirements for authenticity
    8. Red flags for potential fakes or clones`;

    const response = await this.makeRequest([
      {
        role: 'system',
        content: 'You are a classic car authentication expert with extensive knowledge of production records, VIN codes, and original specifications.'
      },
      {
        role: 'user',
        content: query
      }
    ]);

    return {
      vehicle: `${year} ${make} ${model}`,
      authentication: response.choices[0]?.message?.content || '',
      citations: response.citations || [],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * PRICE VALIDATION
   * Validates asking prices against current market
   */
  async validatePricing(make: string, model: string, year: number, askingPrice: number, condition: string): Promise<any> {
    const query = `Validate the asking price of $${askingPrice.toLocaleString()} for a ${year} ${make} ${model} in ${condition} condition. Provide:
    1. Current market value range for this condition
    2. Recent sold prices from major auctions and dealers
    3. Price comparison with similar vehicles
    4. Factors that could justify premium or discount
    5. Regional price variations
    6. Recommendation: fair/high/low pricing
    7. Negotiation insights and price range
    8. Investment potential at this price point`;

    const response = await this.makeRequest([
      {
        role: 'system',
        content: 'You are a classic car appraiser with access to current market data, auction results, and pricing guides.'
      },
      {
        role: 'user',
        content: query
      }
    ]);

    return {
      vehicle: `${year} ${make} ${model}`,
      askingPrice,
      condition,
      validation: response.choices[0]?.message?.content || '',
      citations: response.citations || [],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * RESTORATION GUIDANCE
   * Provides restoration advice and cost estimates
   */
  async getRestorationGuidance(make: string, model: string, year: number, currentCondition: string): Promise<any> {
    const query = `Provide restoration guidance for a ${year} ${make} ${model} currently in ${currentCondition} condition. Include:
    1. Typical restoration cost ranges by scope (driver, show, concours)
    2. Common problem areas and inspection points
    3. Parts availability and reproduction quality
    4. Recommended restoration approach and timeline
    5. Value after restoration vs investment required
    6. Specialist shops and resources
    7. DIY vs professional restoration considerations
    8. Restomod opportunities and market acceptance`;

    const response = await this.makeRequest([
      {
        role: 'system',
        content: 'You are a classic car restoration expert with knowledge of costs, techniques, parts availability, and market values.'
      },
      {
        role: 'user',
        content: query
      }
    ]);

    return {
      vehicle: `${year} ${make} ${model}`,
      currentCondition,
      guidance: response.choices[0]?.message?.content || '',
      citations: response.citations || [],
      timestamp: new Date().toISOString()
    };
  }
}

export const perplexityService = new PerplexityService();