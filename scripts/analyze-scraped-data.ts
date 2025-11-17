import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('/home/user/restomod_central/data/scraped-hem-ford.json', 'utf8'));

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 HEMMINGS FORD SCRAPING SUMMARY');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log(`✅ Total vehicles scraped: ${data.length}`);
console.log(`📅 Year range: 1960-1980`);
console.log(`🚗 Make: Ford`);
console.log(`💾 Saved to: /home/user/restomod_central/data/scraped-hem-ford.json\n`);

// Group by year
const byYear = data.reduce((acc: any, v: any) => {
  acc[v.year] = (acc[v.year] || 0) + 1;
  return acc;
}, {});

console.log('📅 Distribution by Year:');
Object.keys(byYear).sort().forEach(y => {
  const bar = '█'.repeat(Math.ceil(byYear[y] / 2));
  console.log(`   ${y}: ${bar} ${byYear[y]}`);
});

// Group by model
const byModel = data.reduce((acc: any, v: any) => {
  acc[v.model] = (acc[v.model] || 0) + 1;
  return acc;
}, {});

console.log('\n🚙 Top Models:');
Object.entries(byModel)
  .sort((a: any, b: any) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([m, c]: any) => {
    const bar = '█'.repeat(Math.ceil(c / 2));
    console.log(`   ${m}: ${bar} ${c}`);
  });

// Price statistics
const prices = data.map((v: any) => parseInt(v.price.replace(/[^0-9]/g, '')));
const minPrice = Math.min(...prices);
const maxPrice = Math.max(...prices);
const avgPrice = Math.round(prices.reduce((a: number, b: number) => a + b) / prices.length);

console.log('\n💰 Price Range:');
console.log(`   Minimum: $${minPrice.toLocaleString()}`);
console.log(`   Maximum: $${maxPrice.toLocaleString()}`);
console.log(`   Average: $${avgPrice.toLocaleString()}`);

// Location distribution
const byLocation = data.reduce((acc: any, v: any) => {
  if (v.location) {
    acc[v.location] = (acc[v.location] || 0) + 1;
  }
  return acc;
}, {});

console.log('\n📍 Top Locations:');
Object.entries(byLocation)
  .sort((a: any, b: any) => b[1] - a[1])
  .slice(0, 8)
  .forEach(([loc, c]: any) => {
    console.log(`   ${loc}: ${c}`);
  });

// Dealer distribution
const byDealer = data.reduce((acc: any, v: any) => {
  if (v.dealer) {
    acc[v.dealer] = (acc[v.dealer] || 0) + 1;
  }
  return acc;
}, {});

console.log('\n🏪 Top Dealers:');
Object.entries(byDealer)
  .sort((a: any, b: any) => b[1] - a[1])
  .slice(0, 8)
  .forEach(([dealer, c]: any) => {
    console.log(`   ${dealer}: ${c}`);
  });

console.log('\n📋 Sample Records:');
console.log(JSON.stringify(data.slice(0, 3), null, 2));

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
