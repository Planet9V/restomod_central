import { authenticDataProcessor } from '../services/authenticDataProcessor';

/**
 * Script to process all authentic research documents and populate database
 * Run this to extract real automotive data from research files
 */
async function main() {
  try {
    console.log('🚀 Starting authentic data processing from research documents...');
    
    const result = await authenticDataProcessor.processAllDocumentsAndPopulateDatabase();
    
    if (result.success) {
      console.log('✅ Successfully processed authentic research data!');
      console.log(`📊 Total records processed: ${Object.values(result.stats).reduce((a, b) => a + b, 0)}`);
      console.log('📋 Breakdown:');
      console.log(`   • Market Valuations: ${result.stats.marketValuations}`);
      console.log(`   • Builder Profiles: ${result.stats.builderProfiles}`);
      console.log(`   • Technical Specs: ${result.stats.technicalSpecs}`);
      console.log(`   • Event Venues: ${result.stats.eventVenues}`);
      console.log(`   • Vendor Partnerships: ${result.stats.vendorPartnerships}`);
      console.log(`   • Build Guides: ${result.stats.buildGuides}`);
      console.log(`   • Investment Analytics: ${result.stats.investmentAnalytics}`);
      console.log(`\n💡 ${result.message}`);
    } else {
      console.error('❌ Failed to process research data:', result.message);
    }
  } catch (error) {
    console.error('💥 Error processing authentic data:', error);
  }
}

main().then(() => {
  console.log('🎯 Authentic data processing completed');
  process.exit(0);
}).catch(err => {
  console.error('💥 Processing failed:', err);
  process.exit(1);
});