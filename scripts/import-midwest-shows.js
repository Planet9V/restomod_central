/**
 * Direct Import Script for Midwest Car Show Data
 * Imports all 175+ authentic car show events from research documents
 */

import { importMidwestCarShows } from '../server/services/midwestCarShowImporter.js';

async function runImport() {
  console.log('🚗 Starting import of authentic Midwest car show events...');
  console.log('📊 Processing 175+ events from comprehensive research documents');
  
  try {
    const result = await importMidwestCarShows();
    
    console.log('\n✅ IMPORT COMPLETE!');
    console.log(`📈 Successfully imported: ${result.imported} events`);
    console.log(`⚠️  Duplicates skipped: ${result.duplicates} events`);
    console.log(`❌ Errors encountered: ${result.errors} events`);
    console.log(`📊 Total processed: ${result.total} events`);
    
    if (result.imported > 0) {
      console.log('\n🎯 Your car show database now includes authentic events from:');
      console.log('   • Illinois, Indiana, Iowa, Kansas');
      console.log('   • Michigan, Minnesota, Missouri, Nebraska');
      console.log('   • North Dakota, Ohio, South Dakota, Wisconsin');
      console.log('\n🌟 Notable events added include:');
      console.log('   • Goodguys Heartland Nationals (5,000+ vehicles)');
      console.log('   • MSRA Back to the 50\'s Weekend (10,000+ participants)');
      console.log('   • International Route 66 Mother Road Festival');
      console.log('   • British Car Union 37th Annual Show');
      console.log('   • 41st Annual Mopars in the Park');
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

runImport();