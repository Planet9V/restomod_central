import { Request, Response } from 'express';
import { authenticDataProcessor } from '../services/authenticDataProcessor';

/**
 * API endpoint to process all authentic research documents
 * and populate the database with real automotive industry data
 */
export async function processResearchDataHandler(req: Request, res: Response) {
  try {
    console.log('🚀 Starting authentic research data processing...');
    
    const result = await authenticDataProcessor.processAllDocumentsAndPopulateDatabase();
    
    if (result.success) {
      console.log('✅ Research data processing completed successfully');
      res.json({
        success: true,
        message: result.message,
        stats: result.stats,
        totalRecords: Object.values(result.stats).reduce((a, b) => a + b, 0)
      });
    } else {
      console.error('❌ Research data processing failed');
      res.status(500).json({
        success: false,
        message: result.message,
        stats: result.stats
      });
    }
  } catch (error) {
    console.error('Error in research data processing endpoint:', error);
    res.status(500).json({
      success: false,
      message: `Failed to process research data: ${error.message}`,
      stats: {
        marketValuations: 0,
        builderProfiles: 0,
        technicalSpecs: 0,
        eventVenues: 0,
        vendorPartnerships: 0,
        buildGuides: 0,
        investmentAnalytics: 0
      }
    });
  }
}

/**
 * Get authentic data from memory when database is unavailable
 */
export function getAuthenticDataHandler(req: Request, res: Response) {
  try {
    const dataType = req.params.type;
    
    if (!global.authenticData) {
      return res.status(404).json({
        success: false,
        message: 'No authentic data available. Please process research documents first.'
      });
    }
    
    const data = global.authenticData[dataType] || [];
    
    res.json({
      success: true,
      data,
      count: data.length,
      source: 'authentic_research_documents'
    });
  } catch (error) {
    console.error('Error retrieving authentic data:', error);
    res.status(500).json({
      success: false,
      message: `Failed to retrieve authentic data: ${error.message}`
    });
  }
}

/**
 * Get processing status and statistics
 */
export function getProcessingStatusHandler(req: Request, res: Response) {
  try {
    const hasData = !!global.authenticData;
    const stats = hasData ? {
      marketValuations: global.authenticData.marketValuations?.length || 0,
      builderProfiles: global.authenticData.builderProfiles?.length || 0,
      technicalSpecs: global.authenticData.technicalSpecs?.length || 0,
      eventVenues: global.authenticData.eventVenues?.length || 0,
      vendorPartnerships: global.authenticData.vendorPartnerships?.length || 0,
      buildGuides: global.authenticData.buildGuides?.length || 0,
      investmentAnalytics: global.authenticData.investmentAnalytics?.length || 0
    } : null;
    
    res.json({
      hasProcessedData: hasData,
      stats,
      totalRecords: stats ? Object.values(stats).reduce((a, b) => a + b, 0) : 0,
      dataSource: 'authentic_research_documents'
    });
  } catch (error) {
    console.error('Error getting processing status:', error);
    res.status(500).json({
      success: false,
      message: `Failed to get processing status: ${error.message}`
    });
  }
}