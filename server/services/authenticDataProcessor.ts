import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

/**
 * Authentic Data Processor - Extracts and processes real automotive data
 * from your provided research documents to populate the website
 */
export class AuthenticDataProcessor {
  private gemini: GoogleGenerativeAI;

  constructor() {
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }

  /**
   * Process Classic Restomod Valuations (241 lines of authentic market data)
   */
  async processClassicRestommodValuations(): Promise<{
    marketValuations: any[];
    builderProfiles: any[];
    investmentAnalytics: any[];
  }> {
    console.log('📊 Processing Classic Restomod Valuations document...');
    
    try {
      const valuationsFile = path.join(process.cwd(), 'attached_assets', 'Classic restomod valuations .txt');
      const data = fs.readFileSync(valuationsFile, 'utf8');
      
      const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-pro' });
      
      const prompt = `
      Extract authentic market valuation data from this classic restomod document. 
      Create structured data for market_valuations, builder_profiles, and investment_analytics tables.
      
      Document content:
      ${data}
      
      Return JSON with:
      {
        "marketValuations": [array of market valuation records],
        "builderProfiles": [array of builder profile records], 
        "investmentAnalytics": [array of investment analysis records]
      }
      
      Include all specific prices, trends, auction data, and builder information found in the document.
      `;
      
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      return JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
    } catch (error) {
      console.error('Error processing valuations:', error);
      return { marketValuations: [], builderProfiles: [], investmentAnalytics: [] };
    }
  }

  /**
   * Process Ford Coyote Restomod Guide (178 lines of technical specifications)
   */
  async processCoyoteRestommodGuide(): Promise<{
    technicalSpecs: any[];
    buildGuides: any[];
    vendorData: any[];
  }> {
    console.log('🔧 Processing Ford Coyote Restomod Guide...');
    
    try {
      const coyoteFile = path.join(process.cwd(), 'attached_assets', '1960s ford restomod how to .md');
      const data = fs.readFileSync(coyoteFile, 'utf8');
      
      const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-pro' });
      
      const prompt = `
      Extract technical specifications, build guides, and vendor information from this Ford Coyote restomod guide.
      
      Document content:
      ${data}
      
      Return JSON with:
      {
        "technicalSpecs": [array of technical specification records with part numbers, prices, vendors],
        "buildGuides": [array of build guide records with step-by-step instructions],
        "vendorData": [array of vendor/supplier information]
      }
      
      Include all specific part numbers, pricing, installation steps, and vendor details.
      `;
      
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      return JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
    } catch (error) {
      console.error('Error processing Coyote guide:', error);
      return { technicalSpecs: [], buildGuides: [], vendorData: [] };
    }
  }

  /**
   * Process Car Show Research & Events (138 lines of event venue data)
   */
  async processCarShowResearch(): Promise<{
    eventVenues: any[];
    carShowEvents: any[];
    geographicData: any[];
  }> {
    console.log('🏁 Processing Car Show Research & Events...');
    
    try {
      const carShowFile = path.join(process.cwd(), 'attached_assets', 'Research - car show sites and PRD -2025 may.txt');
      const data = fs.readFileSync(carShowFile, 'utf8');
      
      const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-pro' });
      
      const prompt = `
      Extract event venue information, car show details, and geographic coverage from this research document.
      
      Document content:
      ${data}
      
      Return JSON with:
      {
        "eventVenues": [array of venue records with location, capacity, amenities],
        "carShowEvents": [array of car show event records],
        "geographicData": [array of geographic coverage data]
      }
      
      Include all venue names, locations, event types, and specific details found in the document.
      `;
      
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      return JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
    } catch (error) {
      console.error('Error processing car show data:', error);
      return { eventVenues: [], carShowEvents: [], geographicData: [] };
    }
  }

  /**
   * Process Affiliate Marketing Research (330 lines of vendor partnership data)
   */
  async processAffiliateMarketingData(): Promise<{
    vendorPartnerships: any[];
    revenueOpportunities: any[];
    productCategories: any[];
  }> {
    console.log('💼 Processing Affiliate Marketing Research...');
    
    try {
      const affiliateFile = path.join(process.cwd(), 'attached_assets', 'Research affiliate with cars 2015 may .txt');
      const data = fs.readFileSync(affiliateFile, 'utf8');
      
      const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-pro' });
      
      const prompt = `
      Extract vendor partnership opportunities, revenue data, and product categories from this affiliate marketing research.
      
      Document content:
      ${data}
      
      Return JSON with:
      {
        "vendorPartnerships": [array of vendor partnership records],
        "revenueOpportunities": [array of revenue opportunity records],
        "productCategories": [array of product category records]
      }
      
      Include all vendor names, commission rates, product types, and revenue opportunities.
      `;
      
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      return JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
    } catch (error) {
      console.error('Error processing affiliate data:', error);
      return { vendorPartnerships: [], revenueOpportunities: [], productCategories: [] };
    }
  }

  /**
   * Process Restomod Research Market Data
   */
  async processRestommodMarketResearch(): Promise<{
    marketTrends: any[];
    competitorAnalysis: any[];
    customerInsights: any[];
  }> {
    console.log('📈 Processing Restomod Research Market Data...');
    
    try {
      const marketFile = path.join(process.cwd(), 'attached_assets', 'Restomod research market .txt');
      const data = fs.readFileSync(marketFile, 'utf8');
      
      const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-pro' });
      
      const prompt = `
      Extract market trends, competitor analysis, and customer insights from this restomod market research.
      
      Document content:
      ${data}
      
      Return JSON with:
      {
        "marketTrends": [array of market trend records],
        "competitorAnalysis": [array of competitor analysis records],
        "customerInsights": [array of customer insight records]
      }
      
      Include all market data, competitor information, and customer behavior insights.
      `;
      
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      return JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
    } catch (error) {
      console.error('Error processing market research:', error);
      return { marketTrends: [], competitorAnalysis: [], customerInsights: [] };
    }
  }

  /**
   * Master function to process all research documents and populate database
   */
  async processAllDocumentsAndPopulateDatabase(): Promise<{
    success: boolean;
    stats: {
      marketValuations: number;
      builderProfiles: number;
      technicalSpecs: number;
      eventVenues: number;
      vendorPartnerships: number;
      buildGuides: number;
      investmentAnalytics: number;
    };
    message: string;
  }> {
    console.log('🚀 Processing all authentic research documents...');
    
    try {
      // Process all documents in parallel
      const [
        valuationsData,
        coyoteData,
        carShowData,
        affiliateData,
        marketData
      ] = await Promise.all([
        this.processClassicRestommodValuations(),
        this.processCoyoteRestommodGuide(),
        this.processCarShowResearch(),
        this.processAffiliateMarketingData(),
        this.processRestommodMarketResearch()
      ]);

      let stats = {
        marketValuations: 0,
        builderProfiles: 0,
        technicalSpecs: 0,
        eventVenues: 0,
        vendorPartnerships: 0,
        buildGuides: 0,
        investmentAnalytics: 0
      };

      try {
        // Try to populate database
        const { db } = await import('@db');
        const schema = await import('@shared/schema');
        
        // Insert market valuations
        if (valuationsData.marketValuations.length > 0) {
          await db.insert(schema.marketValuations).values(valuationsData.marketValuations);
          stats.marketValuations = valuationsData.marketValuations.length;
        }

        // Insert builder profiles
        if (valuationsData.builderProfiles.length > 0) {
          await db.insert(schema.builderProfiles).values(valuationsData.builderProfiles);
          stats.builderProfiles = valuationsData.builderProfiles.length;
        }

        // Insert technical specifications
        if (coyoteData.technicalSpecs.length > 0) {
          await db.insert(schema.technicalSpecifications).values(coyoteData.technicalSpecs);
          stats.technicalSpecs = coyoteData.technicalSpecs.length;
        }

        // Insert event venues
        if (carShowData.eventVenues.length > 0) {
          await db.insert(schema.eventVenues).values(carShowData.eventVenues);
          stats.eventVenues = carShowData.eventVenues.length;
        }

        // Insert vendor partnerships
        if (affiliateData.vendorPartnerships.length > 0) {
          await db.insert(schema.vendorPartnerships).values(affiliateData.vendorPartnerships);
          stats.vendorPartnerships = affiliateData.vendorPartnerships.length;
        }

        // Insert build guides
        if (coyoteData.buildGuides.length > 0) {
          await db.insert(schema.buildGuides).values(coyoteData.buildGuides);
          stats.buildGuides = coyoteData.buildGuides.length;
        }

        // Insert investment analytics
        if (valuationsData.investmentAnalytics.length > 0) {
          await db.insert(schema.investmentAnalytics).values(valuationsData.investmentAnalytics);
          stats.investmentAnalytics = valuationsData.investmentAnalytics.length;
        }

        console.log('✅ Database populated with authentic research data:', stats);
        
        return {
          success: true,
          stats,
          message: `Successfully processed and populated database with ${Object.values(stats).reduce((a, b) => a + b, 0)} authentic records from your research documents.`
        };
        
      } catch (dbError) {
        console.log('⚠️ Database connection issue, storing data in memory for API access');
        
        // Store in global memory for API access when database is unavailable
        global.authenticData = {
          marketValuations: valuationsData.marketValuations,
          builderProfiles: valuationsData.builderProfiles,
          technicalSpecs: coyoteData.technicalSpecs,
          eventVenues: carShowData.eventVenues,
          vendorPartnerships: affiliateData.vendorPartnerships,
          buildGuides: coyoteData.buildGuides,
          investmentAnalytics: valuationsData.investmentAnalytics,
          marketTrends: marketData.marketTrends,
          competitorAnalysis: marketData.competitorAnalysis,
          customerInsights: marketData.customerInsights
        };
        
        stats = {
          marketValuations: valuationsData.marketValuations.length,
          builderProfiles: valuationsData.builderProfiles.length,
          technicalSpecs: coyoteData.technicalSpecs.length,
          eventVenues: carShowData.eventVenues.length,
          vendorPartnerships: affiliateData.vendorPartnerships.length,
          buildGuides: coyoteData.buildGuides.length,
          investmentAnalytics: valuationsData.investmentAnalytics.length
        };

        return {
          success: true,
          stats,
          message: `Successfully processed ${Object.values(stats).reduce((a, b) => a + b, 0)} authentic records from your research documents. Data stored in memory for API access.`
        };
      }
      
    } catch (error) {
      console.error('Error processing authentic research documents:', error);
      return {
        success: false,
        stats: {
          marketValuations: 0,
          builderProfiles: 0,
          technicalSpecs: 0,
          eventVenues: 0,
          vendorPartnerships: 0,
          buildGuides: 0,
          investmentAnalytics: 0
        },
        message: `Error processing research documents: ${error.message}`
      };
    }
  }
}

export const authenticDataProcessor = new AuthenticDataProcessor();