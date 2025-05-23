/**
 * Premium Restomod Market Analysis - Specific Model Data
 * Source: The Ascendant Restomod: Market Analysis and Investment Outlook (2005-2045)
 * Copyright © Skinny's Rod and Custom - All Rights Reserved
 */

// Detailed model-specific restomod valuation data for premium builds
export const MODEL_SPECIFIC_VALUATIONS = [
  {
    id: "mustang-65-68",
    name: "1965-1968 Ford Mustang",
    category: "muscle-cars",
    cagr: 11.8,
    description: "First-generation Ford Mustangs remain the gold standard for American pony car restomods, with fastbacks commanding the highest prices. Modern Coyote V8 swaps with 460+ hp are standard, complemented by Total Control Products suspension systems and Wilwood brakes.",
    valueFactors: [
      { factor: "Fastback Body Style", impact: 9.7 },
      { factor: "Original K-Code", impact: 9.2 },
      { factor: "Build Documentation", impact: 8.9 },
      { factor: "Factory Color Schemes", impact: 8.4 },
      { factor: "Eleanor-Style Modifications", impact: 7.9 }
    ],
    keyMetrics: {
      averageBuild: 165000,
      topTier: 375000,
      appreciationIndex: 9.2,
      liquidityScore: 9.8,
      buildTime: "12-16 months"
    },
    marketTrend: [
      { year: 2014, value: 100 },
      { year: 2016, value: 118 },
      { year: 2018, value: 142 },
      { year: 2020, value: 172 },
      { year: 2022, value: 214 },
      { year: 2024, value: 245 }
    ],
    color: "#e63946"
  },
  {
    id: "camaro-67-69",
    name: "1967-1969 Chevrolet Camaro",
    category: "muscle-cars",
    cagr: 12.2,
    description: "First-generation Camaros have experienced exceptional growth in the restomod market, with Z/28 and SS models leading the segment. Ringbrothers and SpeedKore builds regularly command $500,000+, with LS3/LS7 powerplants typically producing 600+ hp in premium builds.",
    valueFactors: [
      { factor: "RS/SS Badge Heritage", impact: 9.6 },
      { factor: "Pro-Touring Modifications", impact: 9.4 },
      { factor: "Premium Builder Provenance", impact: 9.7 },
      { factor: "Big Block Conversions", impact: 8.2 },
      { factor: "Factory Color Authenticity", impact: 7.9 }
    ],
    keyMetrics: {
      averageBuild: 185000,
      topTier: 495000,
      appreciationIndex: 9.4,
      liquidityScore: 9.5,
      buildTime: "12-18 months"
    },
    marketTrend: [
      { year: 2014, value: 100 },
      { year: 2016, value: 124 },
      { year: 2018, value: 156 },
      { year: 2020, value: 187 },
      { year: 2022, value: 236 },
      { year: 2024, value: 271 }
    ],
    color: "#3d5a80"
  },
  {
    id: "corvette-63-67",
    name: "1963-1967 Corvette C2",
    category: "sports-cars",
    cagr: 13.4,
    description: "Second-generation Corvettes command the highest values in the American sports car restomod market, with split-window 1963 models from premium builders exceeding $990,000. Jeff Hayes Customs specializes in this platform, typically utilizing LT4 or LS9 supercharged engines producing 650-750 hp.",
    valueFactors: [
      { factor: "Split Window (1963)", impact: 9.9 },
      { factor: "Fuel Injection Heritage", impact: 9.2 },
      { factor: "Big Block Models", impact: 9.0 },
      { factor: "Matched Numbers History", impact: 8.7 },
      { factor: "Rarity of Donor", impact: 9.8 }
    ],
    keyMetrics: {
      averageBuild: 225000,
      topTier: 990000,
      appreciationIndex: 9.7,
      liquidityScore: 8.9,
      buildTime: "14-20 months"
    },
    marketTrend: [
      { year: 2014, value: 100 },
      { year: 2016, value: 135 },
      { year: 2018, value: 168 },
      { year: 2020, value: 214 },
      { year: 2022, value: 272 },
      { year: 2024, value: 315 }
    ],
    color: "#457b9d"
  },
  {
    id: "charger-68-70",
    name: "1968-1970 Dodge Charger",
    category: "muscle-cars",
    cagr: 14.2,
    description: "The Dodge Charger represents one of the fastest appreciating restomod platforms, fueled by celebrity builds and media prominence. SpeedKore's carbon fiber-bodied examples have reached $650,000, typically featuring Hellcat or Hellephant crate engines producing 717-1,000 hp.",
    valueFactors: [
      { factor: "R/T Heritage", impact: 9.5 },
      { factor: "Carbon Fiber Components", impact: 9.2 },
      { factor: "Hellcat/Hellephant Power", impact: 9.4 },
      { factor: "Celebrity Ownership", impact: 8.9 },
      { factor: "Bullitt/F&F Media Connection", impact: 9.1 }
    ],
    keyMetrics: {
      averageBuild: 210000,
      topTier: 650000,
      appreciationIndex: 9.6,
      liquidityScore: 9.0,
      buildTime: "14-18 months"
    },
    marketTrend: [
      { year: 2014, value: 100 },
      { year: 2016, value: 142 },
      { year: 2018, value: 183 },
      { year: 2020, value: 224 },
      { year: 2022, value: 287 },
      { year: 2024, value: 335 }
    ],
    color: "#1d3557"
  },
  {
    id: "bronco-66-77",
    name: "1966-1977 Ford Bronco",
    category: "trucks-suvs",
    cagr: 17.8,
    description: "The classic Ford Bronco has experienced the most dramatic value appreciation of any restomod platform over the past decade. Gateway Bronco and ICON 4x4 builds regularly command $250,000-$350,000. Modern Coyote V8 engines with 400+ hp are standard, with premium builds featuring Fox suspension systems and luxury interior appointments.",
    valueFactors: [
      { factor: "Early Model (66-71)", impact: 9.7 },
      { factor: "Uncut Original Body", impact: 9.5 },
      { factor: "Limited Edition Builder", impact: 9.8 },
      { factor: "Modern 4x4 Systems", impact: 8.7 },
      { factor: "Interior Luxury Upgrades", impact: 9.2 }
    ],
    keyMetrics: {
      averageBuild: 190000,
      topTier: 350000,
      appreciationIndex: 9.8,
      liquidityScore: 9.7,
      buildTime: "10-16 months"
    },
    marketTrend: [
      { year: 2014, value: 100 },
      { year: 2016, value: 156 },
      { year: 2018, value: 223 },
      { year: 2020, value: 298 },
      { year: 2022, value: 384 },
      { year: 2024, value: 427 }
    ],
    color: "#e76f51"
  },
  {
    id: "porsche-911-classic",
    name: "1964-1989 Porsche 911",
    category: "european-sports",
    cagr: 18.4,
    description: "Singer Vehicle Design has revolutionized the premium restomod market with their meticulously engineered Porsche 911 builds, commanding prices from $650,000 to over $1.8 million. These represent the pinnacle of the market both in terms of engineering sophistication and investment appreciation, with naturally-aspirated flat-six engines producing 300-500 hp.",
    valueFactors: [
      { factor: "Singer/Renowned Builder", impact: 9.9 },
      { factor: "Early 911 Base (64-73)", impact: 9.7 },
      { factor: "Lightweight Engineering", impact: 9.4 },
      { factor: "Cosworth Engine Partnership", impact: 9.6 },
      { factor: "Interior Materials Quality", impact: 9.8 }
    ],
    keyMetrics: {
      averageBuild: 675000,
      topTier: 1800000,
      appreciationIndex: 9.9,
      liquidityScore: 9.2,
      buildTime: "18-24 months"
    },
    marketTrend: [
      { year: 2014, value: 100 },
      { year: 2016, value: 168 },
      { year: 2018, value: 242 },
      { year: 2020, value: 335 },
      { year: 2022, value: 412 },
      { year: 2024, value: 478 }
    ],
    color: "#2a9d8f"
  },
  {
    id: "defender-classic",
    name: "1983-2016 Land Rover Defender",
    category: "trucks-suvs",
    cagr: 16.2,
    description: "Land Rover Defenders have emerged as premium luxury restomod platforms, with Arkonik and Himalaya builds regularly exceeding $215,000. Most utilize GM LS3 V8 engines (430 hp) or diesel powerplants, with premium builds featuring heated leather interiors, modern infotainment, and upgraded suspension systems.",
    valueFactors: [
      { factor: "North American Specification", impact: 9.7 },
      { factor: "90 vs 110 Wheelbase", impact: 8.5 },
      { factor: "Original Patina Preservation", impact: 8.9 },
      { factor: "Expedition Upgrades", impact: 8.7 },
      { factor: "Interior Modernization", impact: 9.3 }
    ],
    keyMetrics: {
      averageBuild: 170000,
      topTier: 310000,
      appreciationIndex: 9.5,
      liquidityScore: 9.4,
      buildTime: "12-18 months"
    },
    marketTrend: [
      { year: 2014, value: 100 },
      { year: 2016, value: 142 },
      { year: 2018, value: 196 },
      { year: 2020, value: 257 },
      { year: 2022, value: 325 },
      { year: 2024, value: 368 }
    ],
    color: "#264653"
  },
  {
    id: "c10-pickup-67-72",
    name: "1967-1972 Chevy C10 Pickup",
    category: "trucks-suvs",
    cagr: 15.6,
    description: "Classic C10 pickups have transformed from utilitarian workhorses to premium restomod platforms. Builds from Ringbrothers and The FJ Company typically range from $150,000 to $250,000, featuring lowered suspensions, LS/LT powertrains producing 450-650 hp, and custom interiors blending vintage design with modern comfort.",
    valueFactors: [
      { factor: "Short Bed Configuration", impact: 9.6 },
      { factor: "Lowered Stance", impact: 9.2 },
      { factor: "Original Paint Codes", impact: 8.6 },
      { factor: "Custom Bed Solutions", impact: 9.0 },
      { factor: "Factory Options Heritage", impact: 8.4 }
    ],
    keyMetrics: {
      averageBuild: 145000,
      topTier: 250000,
      appreciationIndex: 9.4,
      liquidityScore: 9.6,
      buildTime: "10-14 months"
    },
    marketTrend: [
      { year: 2014, value: 100 },
      { year: 2016, value: 132 },
      { year: 2018, value: 178 },
      { year: 2020, value: 238 },
      { year: 2022, value: 287 },
      { year: 2024, value: 342 }
    ],
    color: "#f4a261"
  }
];

// Regional market hotspots - where demand exceeds supply
export const REGIONAL_MARKET_HOTSPOTS = [
  { region: "Southern California", demandScore: 94, priceIndex: 115 },
  { region: "Texas", demandScore: 89, priceIndex: 107 },
  { region: "Florida", demandScore: 87, priceIndex: 105 },
  { region: "Arizona", demandScore: 85, priceIndex: 104 },
  { region: "Pacific Northwest", demandScore: 83, priceIndex: 103 },
  { region: "Mid-Atlantic", demandScore: 79, priceIndex: 99 },
  { region: "New England", demandScore: 76, priceIndex: 97 },
  { region: "Midwest", demandScore: 73, priceIndex: 94 }
];

// Detailed auction result data for notable restomod sales
export const PREMIUM_AUCTION_RESULTS = [
  {
    model: "1963 Corvette Split Window",
    builder: "Jeff Hayes Customs",
    auctionHouse: "Barrett-Jackson",
    year: 2023,
    salePrice: 990000,
    estimatedValue: 850000,
    keyFeatures: "LS9 supercharged engine (650hp), Art Morrison chassis, carbon fiber components"
  },
  {
    model: "1969 Dodge Charger 'Hellacious'",
    builder: "SpeedKore",
    auctionHouse: "Mecum",
    year: 2022,
    salePrice: 725000,
    estimatedValue: 650000,
    keyFeatures: "Mid-engine Hellcat, carbon fiber body, Fast & Furious connection"
  },
  {
    model: "1967 Ford Mustang 'Vicious'",
    builder: "Timeless Kustoms",
    auctionHouse: "Barrett-Jackson",
    year: 2023,
    salePrice: 525000,
    estimatedValue: 450000,
    keyFeatures: "Twin-turbo Coyote V8 (1,000hp), carbon body components, track-capable"
  },
  {
    model: "1970 Ford F-100",
    builder: "Velocity Restorations",
    auctionHouse: "Mecum",
    year: 2022,
    salePrice: 192500,
    estimatedValue: 165000,
    keyFeatures: "5.0L Coyote V8, custom airbag suspension, premium leather interior"
  },
  {
    model: "1972 Chevrolet K5 Blazer",
    builder: "Icon 4x4",
    auctionHouse: "RM Sotheby's",
    year: 2023,
    salePrice: 347500,
    estimatedValue: 315000,
    keyFeatures: "LS3 V8 (430hp), Brembo brakes, Fox Racing suspension"
  }
];

// Return on investment data by vehicle class (annual appreciation %)
export const ROI_BY_VEHICLE_CLASS = {
  "American Muscle (1964-1972)": {
    averageAnnualReturn: 12.6,
    topPerformer: "1967 Shelby GT500 - 15.8%",
    investmentHorizon: "6-8 years",
    entryBarrier: "High ($150,000+)",
    riskFactor: "Medium",
    liquidityRating: "Excellent"
  },
  "European Sports Cars (1960s-70s)": {
    averageAnnualReturn: 18.2,
    topPerformer: "Porsche 911 (Singer) - 22.4%",
    investmentHorizon: "5-7 years",
    entryBarrier: "Very High ($300,000+)",
    riskFactor: "Low-Medium",
    liquidityRating: "Very Good"
  },
  "Classic Trucks & SUVs (1960s-70s)": {
    averageAnnualReturn: 17.4,
    topPerformer: "1976 Ford Bronco - 19.2%",
    investmentHorizon: "5-7 years",
    entryBarrier: "Medium-High ($120,000+)",
    riskFactor: "Low",
    liquidityRating: "Excellent"
  },
  "1980s Performance Cars": {
    averageAnnualReturn: 14.8,
    topPerformer: "1987 Buick Grand National - 16.5%",
    investmentHorizon: "7-10 years",
    entryBarrier: "Medium ($90,000+)",
    riskFactor: "Medium",
    liquidityRating: "Good"
  },
  "1990s Modern Classics": {
    averageAnnualReturn: 13.2,
    topPerformer: "1993 Toyota Supra - 17.8%",
    investmentHorizon: "8-12 years",
    entryBarrier: "Medium ($75,000+)",
    riskFactor: "Medium-High",
    liquidityRating: "Moderate"
  }
};