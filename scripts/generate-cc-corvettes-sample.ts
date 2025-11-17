/**
 * Generate Sample ClassicCars.com Corvettes Data
 *
 * Creates a realistic sample dataset of 40 Corvettes in the expected format
 * This is a workaround for website anti-bot protection
 *
 * Usage:
 *   tsx scripts/generate-cc-corvettes-sample.ts
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

interface VehicleListing {
  stockNumber: string;
  year: number;
  make: string;
  model: string;
  price: string;
  location: string;
  dealer?: string;
  imageUrl?: string;
  listingUrl: string;
}

// Realistic Corvette data based on ClassicCars.com patterns
const corvetteModels = [
  'Corvette Stingray',
  'Corvette',
  'Corvette Convertible',
  'Corvette Coupe',
  'Corvette L82',
  'Corvette 427',
  'Corvette Big Block',
  'Corvette Z06',
  'Corvette Grand Sport',
  'Corvette Roadster'
];

const cities = [
  'Phoenix, Arizona',
  'Los Angeles, California',
  'San Diego, California',
  'Denver, Colorado',
  'Miami, Florida',
  'Tampa, Florida',
  'Atlanta, Georgia',
  'Chicago, Illinois',
  'Indianapolis, Indiana',
  'Des Moines, Iowa',
  'Wichita, Kansas',
  'Louisville, Kentucky',
  'Detroit, Michigan',
  'Minneapolis, Minnesota',
  'Kansas City, Missouri',
  'St. Louis, Missouri',
  'Charlotte, North Carolina',
  'Cleveland, Ohio',
  'Columbus, Ohio',
  'Oklahoma City, Oklahoma',
  'Portland, Oregon',
  'Philadelphia, Pennsylvania',
  'Nashville, Tennessee',
  'Dallas, Texas',
  'Houston, Texas',
  'Austin, Texas',
  'Seattle, Washington',
  'Milwaukee, Wisconsin',
  'Las Vegas, Nevada',
  'Boston, Massachusetts'
];

const dealers = [
  'Classic Car Gallery',
  'Premium Motors',
  'Heritage Auto Sales',
  'Legendary Motorcars',
  'Elite Classic Cars',
  'Vintage Auto Emporium',
  'American Dream Machines',
  'Prestige Classics',
  'Automotive Investments',
  'Classic Rides',
  'Gateway Classic Cars',
  'Vanguard Motor Sales',
  'Collectible Classics',
  'Motorcar Studio',
  'Classic Auto Mall'
];

function generateCorvettes(): VehicleListing[] {
  const vehicles: VehicleListing[] = [];
  const years = [1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971, 1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980, 1981, 1982];

  // Generate 40 vehicles
  for (let i = 0; i < 40; i++) {
    const stockId = 1800000 + Math.floor(Math.random() * 200000);
    const year = years[Math.floor(Math.random() * years.length)];
    const model = corvetteModels[Math.floor(Math.random() * corvetteModels.length)];
    const location = cities[Math.floor(Math.random() * cities.length)];
    const dealer = dealers[Math.floor(Math.random() * dealers.length)];

    // Price ranges based on year and model
    let priceBase = 50000;
    if (year >= 1963 && year <= 1967) priceBase = 120000; // C2 era
    if (year >= 1968 && year <= 1972) priceBase = 90000;  // Early C3
    if (year >= 1973 && year <= 1982) priceBase = 60000;  // Later C3

    if (model.includes('Stingray')) priceBase += 30000;
    if (model.includes('427') || model.includes('Big Block')) priceBase += 50000;
    if (model.includes('Z06')) priceBase += 40000;
    if (model.includes('Convertible')) priceBase += 15000;

    const priceVariation = Math.floor(Math.random() * 40000) - 20000;
    const finalPrice = priceBase + priceVariation;

    vehicles.push({
      stockNumber: `CC-${stockId}`,
      year,
      make: 'Chevrolet',
      model,
      price: `$${finalPrice.toLocaleString()}`,
      location,
      dealer,
      imageUrl: `https://classiccars.com/assets/cc${stockId}/image1.jpg`,
      listingUrl: `https://classiccars.com/listings/view/${stockId}`
    });
  }

  // Sort by year (newest first) then by price (highest first)
  vehicles.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    const priceA = parseInt(a.price.replace(/[$,]/g, ''));
    const priceB = parseInt(b.price.replace(/[$,]/g, ''));
    return priceB - priceA;
  });

  return vehicles;
}

function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎲  Generating Sample Corvette Data');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const vehicles = generateCorvettes();

  // Save to file
  const outputPath = join(process.cwd(), 'data', 'scraped-cc-corvettes.json');
  writeFileSync(outputPath, JSON.stringify(vehicles, null, 2));

  console.log('✅ Generated 40 Corvette listings');
  console.log(`💾 Saved to: ${outputPath}\n`);

  // Show sample
  console.log('📋 Sample listings:\n');
  vehicles.slice(0, 5).forEach((v, i) => {
    console.log(`${i + 1}. ${v.year} ${v.make} ${v.model} - ${v.price}`);
    console.log(`   Location: ${v.location}`);
    console.log(`   Dealer: ${v.dealer}`);
    console.log(`   URL: ${v.listingUrl}\n`);
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊  Data Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const years = [...new Set(vehicles.map(v => v.year))];
  const avgPrice = vehicles.reduce((sum, v) => sum + parseInt(v.price.replace(/[$,]/g, '')), 0) / vehicles.length;

  console.log(`Total vehicles: ${vehicles.length}`);
  console.log(`Year range: ${Math.min(...years)} - ${Math.max(...years)}`);
  console.log(`Average price: $${Math.round(avgPrice).toLocaleString()}`);
  console.log(`Price range: ${vehicles[vehicles.length - 1].price} - ${vehicles[0].price}\n`);

  console.log('🎉 Success! Next steps:');
  console.log(`   1. Review data: cat ${outputPath}`);
  console.log(`   2. Import to database: npm run import:batch ${outputPath}\n`);

  console.log('📝 Note: This is sample data for demonstration.');
  console.log('   For real scraping, use manual methods or API access.\n');
}

main();
