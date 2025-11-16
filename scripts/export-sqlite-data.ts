import Database from 'better-sqlite3';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// Database connection
const dbPath = join(process.cwd(), 'db', 'local.db');
const db = new Database(dbPath, { readonly: true });

// Output directory
const outputDir = join(process.cwd(), 'data', 'migration');
mkdirSync(outputDir, { recursive: true });

// Utility function to convert SQLite timestamp to ISO string
function convertTimestamp(value: any): string | null {
  if (!value) return null;
  // SQLite timestamps are Unix timestamps in seconds (integer)
  const timestamp = typeof value === 'number' ? value * 1000 : value;
  return new Date(timestamp).toISOString();
}

// Utility function to parse JSON fields
function parseJsonField(value: any): any {
  if (!value) return null;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }
  return value;
}

// Define all tables to export with their JSON field mappings
const tableConfigs = [
  {
    name: 'users',
    jsonFields: [],
    timestampFields: ['created_at']
  },
  {
    name: 'projects',
    jsonFields: ['gallery_images', 'specs', 'features', 'historical_info'],
    timestampFields: ['created_at']
  },
  {
    name: 'testimonials',
    jsonFields: [],
    timestampFields: ['created_at']
  },
  {
    name: 'team_members',
    jsonFields: [],
    timestampFields: ['created_at']
  },
  {
    name: 'companies',
    jsonFields: ['description'],
    timestampFields: ['created_at']
  },
  {
    name: 'newsletter_subscribers',
    jsonFields: [],
    timestampFields: ['created_at']
  },
  {
    name: 'contact_submissions',
    jsonFields: [],
    timestampFields: ['created_at']
  },
  {
    name: 'hero_content',
    jsonFields: [],
    timestampFields: ['created_at']
  },
  {
    name: 'engineering_features',
    jsonFields: [],
    timestampFields: ['created_at']
  },
  {
    name: 'market_data',
    jsonFields: ['market_growth_data', 'demographic_data', 'platforms', 'modifications'],
    timestampFields: ['created_at']
  },
  {
    name: 'process_steps',
    jsonFields: [],
    timestampFields: ['created_at']
  },
  {
    name: 'luxury_showcases',
    jsonFields: ['gallery_images', 'detail_sections', 'specifications'],
    timestampFields: ['created_at', 'published_at']
  },
  {
    name: 'research_articles',
    jsonFields: ['tags'],
    timestampFields: ['publish_date', 'created_at', 'updated_at']
  },
  {
    name: 'engine_options',
    jsonFields: ['compatible_models', 'mckenney_features'],
    timestampFields: ['created_at']
  },
  {
    name: 'transmission_options',
    jsonFields: ['compatible_engines', 'compatible_models'],
    timestampFields: ['created_at']
  },
  {
    name: 'color_options',
    jsonFields: ['available_for_models'],
    timestampFields: ['created_at']
  },
  {
    name: 'wheel_options',
    jsonFields: ['compatible_models'],
    timestampFields: ['created_at']
  },
  {
    name: 'interior_options',
    jsonFields: ['compatible_models', 'features'],
    timestampFields: ['created_at']
  },
  {
    name: 'ai_options',
    jsonFields: ['compatible_models'],
    timestampFields: ['created_at']
  },
  {
    name: 'additional_options',
    jsonFields: ['compatible_models'],
    timestampFields: ['created_at']
  },
  {
    name: 'user_configurations',
    jsonFields: ['selected_ai_options', 'selected_additional_options'],
    timestampFields: ['created_at', 'updated_at']
  },
  {
    name: 'user_preferences',
    jsonFields: ['home_location', 'preferred_categories'],
    timestampFields: ['created_at', 'updated_at']
  },
  {
    name: 'market_valuations',
    jsonFields: [],
    timestampFields: ['last_updated', 'created_at']
  },
  {
    name: 'builder_profiles',
    jsonFields: ['portfolio_images', 'certifications'],
    timestampFields: ['created_at', 'updated_at']
  },
  {
    name: 'technical_specifications',
    jsonFields: ['required_tools'],
    timestampFields: ['created_at', 'updated_at']
  },
  {
    name: 'event_venues',
    jsonFields: ['amenities', 'judging_classes'],
    timestampFields: ['created_at', 'updated_at']
  },
  {
    name: 'build_guides',
    jsonFields: ['required_skills', 'tools_needed', 'safety_warnings'],
    timestampFields: ['created_at', 'updated_at']
  },
  {
    name: 'investment_analytics',
    jsonFields: [],
    timestampFields: ['last_analyzed', 'created_at']
  },
  {
    name: 'vendor_partnerships',
    jsonFields: ['product_types'],
    timestampFields: ['created_at', 'updated_at']
  },
  {
    name: 'car_show_events',
    jsonFields: ['features', 'amenities', 'judging_classes', 'awards', 'vehicle_makes', 'vehicle_models'],
    timestampFields: ['start_date', 'end_date', 'registration_deadline', 'last_verified', 'created_at', 'updated_at']
  },
  {
    name: 'gateway_vehicles',
    jsonFields: ['features', 'gallery_images'],
    timestampFields: ['sold_date', 'last_updated', 'created_at', 'updated_at']
  },
  {
    name: 'enhanced_vehicle_platforms',
    jsonFields: ['body_types'],
    timestampFields: ['created_at']
  },
  {
    name: 'enhanced_engine_options',
    jsonFields: ['compatible_platforms'],
    timestampFields: ['created_at']
  },
  {
    name: 'enhanced_transmission_options',
    jsonFields: ['compatible_engines', 'features'],
    timestampFields: ['created_at']
  },
  {
    name: 'configurator_suspension_options',
    jsonFields: ['compatible_platforms', 'features'],
    timestampFields: ['created_at']
  },
  {
    name: 'configurator_rear_axle_options',
    jsonFields: ['gear_ratios', 'compatible_platforms'],
    timestampFields: ['created_at']
  },
  {
    name: 'configurator_fuel_system_options',
    jsonFields: ['features', 'compatible_engines'],
    timestampFields: ['created_at']
  },
  {
    name: 'enhanced_interior_options',
    jsonFields: ['materials', 'features', 'compatible_platforms'],
    timestampFields: ['created_at']
  },
  {
    name: 'configurator_bodywork_options',
    jsonFields: ['components', 'compatible_platforms'],
    timestampFields: ['created_at']
  },
  {
    name: 'configurator_glass_options',
    jsonFields: ['features', 'compatible_platforms'],
    timestampFields: ['created_at']
  },
  {
    name: 'configurator_customer_configurations',
    jsonFields: ['additional_options', 'ai_recommendations'],
    timestampFields: ['created_at', 'updated_at']
  },
  {
    name: 'configurator_car_models',
    jsonFields: [],
    timestampFields: ['created_at', 'updated_at']
  },
  {
    name: 'simple_transmission_options',
    jsonFields: ['compatibility'],
    timestampFields: ['created_at', 'updated_at']
  },
  {
    name: 'configurator_color_options',
    jsonFields: [],
    timestampFields: ['created_at', 'updated_at']
  },
  {
    name: 'configurator_wheel_options',
    jsonFields: ['compatibility'],
    timestampFields: ['created_at', 'updated_at']
  },
  {
    name: 'configurator_interior_options',
    jsonFields: ['materials', 'features', 'compatibility'],
    timestampFields: ['created_at', 'updated_at']
  },
  {
    name: 'cars_for_sale',
    jsonFields: ['features', 'market_data', 'perplexity_analysis'],
    timestampFields: ['created_at', 'updated_at']
  },
  {
    name: 'user_itineraries',
    jsonFields: [],
    timestampFields: ['created_at']
  },
  {
    name: 'event_comments',
    jsonFields: [],
    timestampFields: ['created_at']
  },
  {
    name: 'price_history',
    jsonFields: [],
    timestampFields: ['recorded_date', 'created_at']
  }
];

// Export report
const exportReport: Record<string, any> = {
  timestamp: new Date().toISOString(),
  database: dbPath,
  tables: {},
  totalRecords: 0,
  summary: []
};

console.log('\n🚀 SQLite Data Export Starting...\n');
console.log(`Database: ${dbPath}`);
console.log(`Output Directory: ${outputDir}\n`);

// Export each table
for (const config of tableConfigs) {
  const { name, jsonFields, timestampFields } = config;

  try {
    // Check if table exists
    const tableExists = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name=?"
    ).get(name);

    if (!tableExists) {
      console.log(`⏭️  Skipping ${name} (table does not exist)`);
      exportReport.tables[name] = { count: 0, status: 'skipped', reason: 'table not found' };
      continue;
    }

    // Get all records
    const rows = db.prepare(`SELECT * FROM ${name}`).all();

    // Transform data
    const transformedRows = rows.map((row: any) => {
      const transformed: any = {};

      for (const [key, value] of Object.entries(row)) {
        // Handle timestamp fields
        if (timestampFields.includes(key)) {
          transformed[key] = convertTimestamp(value);
        }
        // Handle JSON fields
        else if (jsonFields.includes(key)) {
          transformed[key] = parseJsonField(value);
        }
        // Handle NULL values and regular fields
        else {
          transformed[key] = value === null ? null : value;
        }
      }

      return transformed;
    });

    // Write to file
    const outputPath = join(outputDir, `${name}.json`);
    writeFileSync(outputPath, JSON.stringify(transformedRows, null, 2));

    // Update report
    exportReport.tables[name] = {
      count: transformedRows.length,
      status: 'success',
      file: outputPath
    };
    exportReport.totalRecords += transformedRows.length;

    console.log(`✅ ${name}: ${transformedRows.length} records exported`);

  } catch (error: any) {
    console.error(`❌ Error exporting ${name}:`, error.message);
    exportReport.tables[name] = {
      count: 0,
      status: 'error',
      error: error.message
    };
  }
}

// Generate summary
console.log('\n📊 Export Summary:\n');
console.log('━'.repeat(60));

const successTables = Object.entries(exportReport.tables)
  .filter(([_, data]: [string, any]) => data.status === 'success' && data.count > 0)
  .sort(([_, a]: [string, any], [__, b]: [string, any]) => b.count - a.count);

for (const [tableName, data] of successTables) {
  const count = (data as any).count;
  console.log(`  ${tableName.padEnd(40)} ${count.toLocaleString().padStart(8)} records`);
  exportReport.summary.push({ table: tableName, count });
}

console.log('━'.repeat(60));
console.log(`  ${'TOTAL'.padEnd(40)} ${exportReport.totalRecords.toLocaleString().padStart(8)} records`);
console.log('━'.repeat(60));

// Tables with no data
const emptyTables = Object.entries(exportReport.tables)
  .filter(([_, data]: [string, any]) => data.status === 'success' && data.count === 0);

if (emptyTables.length > 0) {
  console.log('\n📭 Empty Tables:');
  emptyTables.forEach(([name]) => console.log(`  - ${name}`));
}

// Skipped tables
const skippedTables = Object.entries(exportReport.tables)
  .filter(([_, data]: [string, any]) => data.status === 'skipped');

if (skippedTables.length > 0) {
  console.log('\n⏭️  Skipped Tables:');
  skippedTables.forEach(([name, data]) =>
    console.log(`  - ${name} (${(data as any).reason})`)
  );
}

// Error tables
const errorTables = Object.entries(exportReport.tables)
  .filter(([_, data]: [string, any]) => data.status === 'error');

if (errorTables.length > 0) {
  console.log('\n❌ Tables with Errors:');
  errorTables.forEach(([name, data]) =>
    console.log(`  - ${name}: ${(data as any).error}`)
  );
}

// Write export report
const reportPath = join(outputDir, '_export_report.json');
writeFileSync(reportPath, JSON.stringify(exportReport, null, 2));
console.log(`\n📄 Full export report saved to: ${reportPath}`);

// Key tables validation
console.log('\n🔍 Key Tables Verification:\n');
const keyTables = ['cars_for_sale', 'car_show_events', 'users', 'projects', 'testimonials', 'research_articles'];
for (const tableName of keyTables) {
  const tableData = exportReport.tables[tableName];
  if (tableData) {
    const icon = tableData.count > 0 ? '✅' : '⚠️';
    console.log(`  ${icon} ${tableName}: ${tableData.count} records`);
  } else {
    console.log(`  ❌ ${tableName}: not found`);
  }
}

console.log('\n✨ Export completed successfully!\n');

// Close database
db.close();

export { exportReport };
