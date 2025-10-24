/**
 * Phase 5 Data Population: Sample Vehicle Inventory
 * Creates realistic classic car listings to power Phase 5 UI
 */

import { db } from '../db';
import { carsForSale } from '../shared/schema';

interface VehicleTemplate {
  make: string;
  model: string;
  yearRange: number[];
  basePrice: number;
  priceVariance: number;
  category: string;
  investmentGrades: string[];
  engines: string[];
  transmissions: string[];
  colors: string[];
  descriptions: string[];
}

const VEHICLE_TEMPLATES: VehicleTemplate[] = [
  {
    make: 'Ford',
    model: 'Mustang',
    yearRange: [1965, 1966, 1967, 1968, 1969, 1970, 2005, 2010, 2015, 2020],
    basePrice: 45000,
    priceVariance: 30000,
    category: 'Muscle Cars',
    investmentGrades: ['A+', 'A', 'A-', 'B+'],
    engines: ['289 V8', '302 V8', '351 Windsor V8', '428 Cobra Jet', '5.0L V8', '5.2L Shelby GT500'],
    transmissions: ['4-Speed Manual', '5-Speed Manual', '6-Speed Manual', 'Automatic'],
    colors: ['Wimbledon White', 'Grabber Blue', 'Highland Green', 'Candy Apple Red', 'Black'],
    descriptions: [
      'Iconic American pony car in excellent condition. Frame-off restoration completed.',
      'Fastback beauty with original numbers-matching drivetrain. Stunning show quality.',
      'Documented Marti Report, featured in local car shows. Garage kept.',
      'Fully sorted mechanically, recent service records available. Daily driver quality.'
    ]
  },
  {
    make: 'Chevrolet',
    model: 'Corvette',
    yearRange: [1963, 1965, 1967, 1972, 1977, 1984, 1990, 2005, 2015, 2020],
    basePrice: 55000,
    priceVariance: 45000,
    category: 'Sports Cars',
    investmentGrades: ['A+', 'A', 'A-', 'B+'],
    engines: ['327 V8', '350 V8', '427 V8', '454 V8', 'LS1 V8', 'LS3 V8', 'LT1 V8'],
    transmissions: ['4-Speed Manual', '6-Speed Manual', '7-Speed Manual', '8-Speed Automatic'],
    colors: ['Rally Red', 'Nassau Blue', 'Silver', 'Black', 'Torch Red', 'Arctic White'],
    descriptions: [
      'America\'s sports car in pristine condition. Low miles, all original.',
      'Frame-off restoration to concours standards. Award-winning show car.',
      'Numbers matching, documented history. NCRS Top Flight certified.',
      'Clean Carfax, garage stored, never tracked. Enthusiast owned.'
    ]
  },
  {
    make: 'Chevrolet',
    model: 'Camaro',
    yearRange: [1967, 1968, 1969, 1970, 2010, 2015, 2020],
    basePrice: 42000,
    priceVariance: 28000,
    category: 'Muscle Cars',
    investmentGrades: ['A', 'A-', 'B+', 'B'],
    engines: ['327 V8', '350 V8', '396 V8', '427 V8', 'LS3 V8', 'LT1 V8'],
    transmissions: ['4-Speed Manual', '5-Speed Manual', '6-Speed Manual', 'Automatic'],
    colors: ['Rallye Green', 'Butternut Yellow', 'LeMans Blue', 'Black', 'Red Hot'],
    descriptions: [
      'RS/SS optioned first-gen Camaro. Documented build sheet.',
      'Muscle car icon in exceptional condition. New paint and interior.',
      'Numbers matching drivetrain, PHS documentation. Show quality.',
      'Modern muscle with classic styling. Low miles, adult owned.'
    ]
  },
  {
    make: 'Dodge',
    model: 'Charger',
    yearRange: [1968, 1969, 1970, 2008, 2015, 2020],
    basePrice: 48000,
    priceVariance: 35000,
    category: 'Muscle Cars',
    investmentGrades: ['A+', 'A', 'B+', 'B'],
    engines: ['318 V8', '383 V8', '440 V8', '426 Hemi', '5.7L Hemi', '6.2L Hellcat'],
    transmissions: ['4-Speed Manual', 'TorqueFlite Automatic', '6-Speed Manual', '8-Speed Automatic'],
    colors: ['B5 Blue', 'Plum Crazy', 'Go Mango', 'TorRed', 'Pitch Black'],
    descriptions: [
      'Mopar legend in stunning condition. Numbers matching 440.',
      'R/T package with all documentation. Rotisserie restoration.',
      'Rare color combination, original broadcast sheet. Investment grade.',
      'Modern Mopar muscle with supercharged performance. Collector quality.'
    ]
  },
  {
    make: 'Dodge',
    model: 'Challenger',
    yearRange: [1970, 1971, 2008, 2015, 2020],
    basePrice: 52000,
    priceVariance: 40000,
    category: 'Muscle Cars',
    investmentGrades: ['A+', 'A', 'A-', 'B+'],
    engines: ['340 V8', '383 V8', '440 Six Pack', '426 Hemi', '6.2L Hellcat', '6.2L Demon'],
    transmissions: ['4-Speed Manual', '6-Speed Manual', '8-Speed Automatic'],
    colors: ['Plum Crazy', 'Go Mango', 'Sub Lime', 'TorRed', 'Destroyer Grey'],
    descriptions: [
      'Iconic E-body Mopar. Rare T/A package, fully documented.',
      'Rotisserie restoration to original specifications. Concours winner.',
      'Matching numbers, fender tag and VIN decoded. Museum quality.',
      'Hellcat powered beast with modern amenities. Collector owned.'
    ]
  },
  {
    make: 'Pontiac',
    model: 'GTO',
    yearRange: [1964, 1965, 1966, 1967, 1968, 1969],
    basePrice: 55000,
    priceVariance: 35000,
    category: 'Muscle Cars',
    investmentGrades: ['A+', 'A', 'A-'],
    engines: ['389 Tri-Power', '400 V8', '400 Ram Air'],
    transmissions: ['4-Speed Manual', 'Automatic'],
    colors: ['Montero Red', 'Verdoro Green', 'Barrier Blue', 'Black'],
    descriptions: [
      'The original muscle car. Tri-Power setup, PHS documented.',
      'Goat in exceptional condition. Frame-off restoration completed.',
      'Numbers matching, rare options. POCI Top Flight certified.',
      'Investment grade classic. Extensively documented provenance.'
    ]
  },
  {
    make: 'Chevrolet',
    model: 'Chevelle',
    yearRange: [1966, 1967, 1968, 1969, 1970, 1971],
    basePrice: 48000,
    priceVariance: 32000,
    category: 'Muscle Cars',
    investmentGrades: ['A', 'A-', 'B+'],
    engines: ['327 V8', '396 V8', '454 LS6'],
    transmissions: ['4-Speed Manual', 'Automatic'],
    colors: ['Tuxedo Black', 'Cranberry Red', 'Forest Green', 'Desert Sand'],
    descriptions: [
      'SS396 with numbers matching drivetrain. Documented build sheet.',
      'Malibu trim in stunning condition. Recent full restoration.',
      'LS6 powered beast. Rare options, investment quality.',
      'Clean title, documented history. Show and go condition.'
    ]
  },
  {
    make: 'Ford',
    model: 'Bronco',
    yearRange: [1966, 1970, 1975, 2021],
    basePrice: 52000,
    priceVariance: 38000,
    category: 'Classic Trucks',
    investmentGrades: ['A', 'A-', 'B+'],
    engines: ['289 V8', '302 V8', '2.3L EcoBoost', '2.7L EcoBoost'],
    transmissions: ['3-Speed Manual', '4-Speed Manual', '10-Speed Automatic'],
    colors: ['Wimbledon White', 'Rangoon Red', 'Velocity Blue', 'Cactus Grey'],
    descriptions: [
      'First-gen Bronco in amazing condition. Frame-off restoration.',
      'Early Bronco with modern upgrades. Daily driver quality.',
      'Documented history, clean title. Collector grade.',
      'New Bronco Heritage Edition. Low miles, garage kept.'
    ]
  }
];

const US_LOCATIONS = [
  { city: 'Phoenix', state: 'Arizona', region: 'southwest' },
  { city: 'Los Angeles', state: 'California', region: 'west' },
  { city: 'San Francisco', state: 'California', region: 'west' },
  { city: 'San Diego', state: 'California', region: 'west' },
  { city: 'Denver', state: 'Colorado', region: 'west' },
  { city: 'Miami', state: 'Florida', region: 'south' },
  { city: 'Tampa', state: 'Florida', region: 'south' },
  { city: 'Atlanta', state: 'Georgia', region: 'south' },
  { city: 'Chicago', state: 'Illinois', region: 'midwest' },
  { city: 'Indianapolis', state: 'Indiana', region: 'midwest' },
  { city: 'Detroit', state: 'Michigan', region: 'midwest' },
  { city: 'St. Louis', state: 'Missouri', region: 'midwest' },
  { city: 'Kansas City', state: 'Missouri', region: 'midwest' },
  { city: 'Las Vegas', state: 'Nevada', region: 'west' },
  { city: 'Charlotte', state: 'North Carolina', region: 'south' },
  { city: 'Columbus', state: 'Ohio', region: 'midwest' },
  { city: 'Portland', state: 'Oregon', region: 'west' },
  { city: 'Philadelphia', state: 'Pennsylvania', region: 'northeast' },
  { city: 'Nashville', state: 'Tennessee', region: 'south' },
  { city: 'Dallas', state: 'Texas', region: 'south' },
  { city: 'Houston', state: 'Texas', region: 'south' },
  { city: 'Austin', state: 'Texas', region: 'south' },
  { city: 'Seattle', state: 'Washington', region: 'west' }
];

const CONDITIONS = ['Excellent', 'Very Good', 'Good', 'Driver Quality', 'Show Quality', 'Concours'];

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generatePrice(basePrice: number, variance: number): string {
  const price = basePrice + (Math.random() * variance * 2 - variance);
  return Math.round(price / 1000) * 1000; // Round to nearest thousand
}

function calculateAppreciationRate(year: number, investmentGrade: string): string {
  // Classic cars (pre-1980) generally appreciate more
  const isClassic = year < 1980;
  const baseRate = isClassic ? 8 : 3;

  const gradeMultiplier = {
    'A+': 1.5,
    'A': 1.3,
    'A-': 1.1,
    'B+': 0.9,
    'B': 0.7,
    'B-': 0.5,
    'C+': 0.3,
    'C': 0.1
  };

  const rate = baseRate * (gradeMultiplier[investmentGrade as keyof typeof gradeMultiplier] || 1.0);
  return `${rate.toFixed(1)}%`;
}

function determineMarketTrend(year: number, investmentGrade: string): string {
  const isClassic = year < 1980;
  const gradeTier = investmentGrade.charAt(0);

  if (isClassic && (gradeTier === 'A')) return 'rising';
  if (isClassic && gradeTier === 'B') return 'stable';
  if (!isClassic && gradeTier === 'A') return 'stable';
  return 'stable';
}

async function populateSampleVehicles() {
  console.log('🚗 Phase 5: Populating Sample Vehicle Inventory\n');

  const vehiclesToCreate = [];
  const targetCount = 75; // Create 75 diverse vehicles

  // Calculate how many of each template to create
  const perTemplate = Math.floor(targetCount / VEHICLE_TEMPLATES.length);

  for (const template of VEHICLE_TEMPLATES) {
    for (let i = 0; i < perTemplate; i++) {
      const year = randomElement(template.yearRange);
      const location = randomElement(US_LOCATIONS);
      const investmentGrade = randomElement(template.investmentGrades);
      const price = generatePrice(template.basePrice, template.priceVariance);

      const vehicle = {
        make: template.make,
        model: template.model,
        year,
        price: price.toString(),
        sourceType: 'research',
        sourceName: 'Sample Data - Phase 5',
        locationCity: location.city,
        locationState: location.state,
        locationRegion: location.region,
        category: template.category,
        condition: randomElement(CONDITIONS),
        mileage: Math.floor(Math.random() * 80000) + 5000,
        exteriorColor: randomElement(template.colors),
        interiorColor: Math.random() > 0.5 ? 'Black' : 'Tan',
        engine: randomElement(template.engines),
        transmission: randomElement(template.transmissions),
        investmentGrade,
        appreciationRate: calculateAppreciationRate(year, investmentGrade),
        marketTrend: determineMarketTrend(year, investmentGrade),
        valuationConfidence: (0.75 + Math.random() * 0.2).toFixed(2), // 75-95% confidence
        imageUrl: `https://images.unsplash.com/photo-${Math.random() > 0.5 ? '1552519507-da3b142c6e3d' : '1580274455191-1c62238fa333'}?w=800&q=80`,
        description: randomElement(template.descriptions),
        features: JSON.stringify([
          'Power Steering',
          'Power Brakes',
          'Air Conditioning',
          'Chrome Bumpers',
          'Original Interior',
          'Upgraded Stereo'
        ]),
        stockNumber: `RC-${year}-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      vehiclesToCreate.push(vehicle);
    }
  }

  console.log(`📦 Preparing to insert ${vehiclesToCreate.length} vehicles...\n`);

  // Insert all vehicles
  await db.insert(carsForSale).values(vehiclesToCreate);

  console.log(`✨ Successfully created ${vehiclesToCreate.length} vehicle listings!\n`);

  // Show summary statistics
  const makeBreakdown = vehiclesToCreate.reduce((acc, v) => {
    acc[v.make] = (acc[v.make] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const gradeBreakdown = vehiclesToCreate.reduce((acc, v) => {
    acc[v.investmentGrade] = (acc[v.investmentGrade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const regionBreakdown = vehiclesToCreate.reduce((acc, v) => {
    acc[v.locationRegion] = (acc[v.locationRegion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('📊 Summary Statistics:\n');

  console.log('By Make:');
  Object.entries(makeBreakdown)
    .sort((a, b) => b[1] - a[1])
    .forEach(([make, count]) => {
      console.log(`   ${make}: ${count}`);
    });

  console.log('\nBy Investment Grade:');
  Object.entries(gradeBreakdown)
    .sort((a, b) => b[1] - a[1])
    .forEach(([grade, count]) => {
      console.log(`   ${grade}: ${count}`);
    });

  console.log('\nBy Region:');
  Object.entries(regionBreakdown)
    .sort((a, b) => b[1] - a[1])
    .forEach(([region, count]) => {
      console.log(`   ${region}: ${count}`);
    });

  const avgPrice = vehiclesToCreate.reduce((sum, v) => sum + parseInt(v.price), 0) / vehiclesToCreate.length;
  console.log(`\nAverage Price: $${Math.round(avgPrice).toLocaleString()}`);
}

// Run the population script
populateSampleVehicles()
  .catch(console.error)
  .finally(() => process.exit(0));
