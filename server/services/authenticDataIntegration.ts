import { directDataProcessor } from './directDataProcessor';

/**
 * Authentic Data Integration Service
 * Ensures your research data is always available through API endpoints
 */
export class AuthenticDataIntegration {
  
  /**
   * Initialize authentic data integration on server startup
   */
  static async initialize() {
    try {
      console.log('🚀 Initializing authentic automotive data integration...');
      
      // Process your research documents immediately
      const result = await directDataProcessor.processAllResearchData();
      
      if (result.success) {
        console.log('✅ Authentic automotive data ready for all API endpoints');
        console.log(`📊 Total authentic records: ${Object.values(result.stats).reduce((a, b) => a + b, 0)}`);
        
        // Make data globally available for all API routes
        this.setupGlobalDataAccess();
        
        return true;
      } else {
        console.error('❌ Failed to initialize authentic data');
        return false;
      }
    } catch (error) {
      console.error('Error initializing authentic data:', error);
      return false;
    }
  }

  /**
   * Setup global data access for API routes
   */
  private static setupGlobalDataAccess() {
    // Ensure authentic data is accessible throughout the application
    if (!(global as any).authenticData) {
      console.log('Setting up authentic data access...');
      // Data will be set by directDataProcessor
    }
  }

  /**
   * Get authentic data for any API endpoint
   */
  static getAuthenticData(type: string): any[] {
    const data = (global as any).authenticData;
    if (!data) {
      console.log('Authentic data not yet loaded');
      return [];
    }
    
    return data[type] || [];
  }

  /**
   * Get all authentic data statistics
   */
  static getDataStats() {
    const data = (global as any).authenticData;
    if (!data) return null;
    
    return {
      marketValuations: data.marketValuations?.length || 0,
      builderProfiles: data.builderProfiles?.length || 0,
      technicalSpecs: data.technicalSpecs?.length || 0,
      eventVenues: data.eventVenues?.length || 0,
      vendorPartnerships: data.vendorPartnerships?.length || 0,
      buildGuides: data.buildGuides?.length || 0,
      investmentAnalytics: data.investmentAnalytics?.length || 0
    };
  }
}

export const authenticDataIntegration = AuthenticDataIntegration;