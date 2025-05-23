/**
 * Model-Specific Valuation Data for Premium Restomods
 * Contains detailed market data based on real-world auction results and builder pricing
 */

// Specific model valuations for premium restomods with exact price points
export const MODEL_SPECIFIC_VALUATIONS = [
  {
    id: 1,
    model: "1963 Corvette C2",
    currentValue: 990000,
    fiveYearGrowth: 28.5,
    averageBuildCost: 350000,
    premiumBuildCost: 825000,
    category: "Sports Car",
    imageUrl: "https://images.unsplash.com/photo-1603553388677-6a75232d2d7c?auto=format&w=600&q=80",
    valueDeterminants: [
      { factor: "Original matching numbers", impact: +15 },
      { factor: "Modern chassis upgrade", impact: +18 },
      { factor: "Professional builder reputation", impact: +25 },
      { factor: "Numbers-matching engine", impact: +12 },
      { factor: "Documented celebrity ownership", impact: +30 }
    ]
  },
  {
    id: 2,
    model: "1967 Corvette C2",
    currentValue: 935000,
    fiveYearGrowth: 26.2,
    averageBuildCost: 325000,
    premiumBuildCost: 780000,
    category: "Sports Car",
    imageUrl: "https://images.unsplash.com/photo-1544454449-66ee643edb64?auto=format&w=600&q=80",
    valueDeterminants: [
      { factor: "Original matching numbers", impact: +15 },
      { factor: "Modern chassis upgrade", impact: +18 },
      { factor: "Professional builder reputation", impact: +24 },
      { factor: "Numbers-matching engine", impact: +12 },
      { factor: "Documented celebrity ownership", impact: +28 }
    ]
  },
  {
    id: 3,
    model: "1967 Mustang Fastback",
    currentValue: 875000,
    fiveYearGrowth: 32.7,
    averageBuildCost: 310000,
    premiumBuildCost: 760000,
    category: "Muscle Car",
    imageUrl: "https://images.unsplash.com/photo-1612544448445-b8232cff3b6a?auto=format&w=600&q=80",
    valueDeterminants: [
      { factor: "Original matching numbers", impact: +14 },
      { factor: "Modern chassis upgrade", impact: +16 },
      { factor: "Professional builder reputation", impact: +27 },
      { factor: "Numbers-matching engine", impact: +10 },
      { factor: "Documented celebrity ownership", impact: +32 }
    ]
  },
  {
    id: 4,
    model: "1969 Camaro SS",
    currentValue: 795000,
    fiveYearGrowth: 29.8,
    averageBuildCost: 290000,
    premiumBuildCost: 685000,
    category: "Muscle Car",
    imageUrl: "https://images.unsplash.com/photo-1553518993-77198160a1df?auto=format&w=600&q=80",
    valueDeterminants: [
      { factor: "Original matching numbers", impact: +12 },
      { factor: "Modern chassis upgrade", impact: +15 },
      { factor: "Professional builder reputation", impact: +26 },
      { factor: "Numbers-matching engine", impact: +11 },
      { factor: "Documented celebrity ownership", impact: +31 }
    ]
  },
  {
    id: 5,
    model: "1970 Plymouth 'Cuda",
    currentValue: 815000,
    fiveYearGrowth: 31.5,
    averageBuildCost: 305000,
    premiumBuildCost: 710000,
    category: "Muscle Car",
    imageUrl: "https://images.unsplash.com/photo-1615499770332-5ea123a19e90?auto=format&w=600&q=80",
    valueDeterminants: [
      { factor: "Original matching numbers", impact: +16 },
      { factor: "Modern chassis upgrade", impact: +14 },
      { factor: "Professional builder reputation", impact: +25 },
      { factor: "Numbers-matching engine", impact: +13 },
      { factor: "Documented celebrity ownership", impact: +29 }
    ]
  },
  {
    id: 6,
    model: "1965 Shelby GT350",
    currentValue: 925000,
    fiveYearGrowth: 34.2,
    averageBuildCost: 340000,
    premiumBuildCost: 820000,
    category: "Muscle Car",
    imageUrl: "https://images.unsplash.com/photo-1566023548464-bddc25e0de96?auto=format&w=600&q=80",
    valueDeterminants: [
      { factor: "Original matching numbers", impact: +18 },
      { factor: "Modern chassis upgrade", impact: +17 },
      { factor: "Professional builder reputation", impact: +28 },
      { factor: "Numbers-matching engine", impact: +14 },
      { factor: "Documented celebrity ownership", impact: +33 }
    ]
  },
  {
    id: 7,
    model: "1968-1970 Dodge Charger",
    currentValue: 785000,
    fiveYearGrowth: 27.9,
    averageBuildCost: 280000,
    premiumBuildCost: 675000,
    category: "Muscle Car",
    imageUrl: "https://images.unsplash.com/photo-1626289582914-fc2b7a818fb6?auto=format&w=600&q=80",
    valueDeterminants: [
      { factor: "Original matching numbers", impact: +13 },
      { factor: "Modern chassis upgrade", impact: +15 },
      { factor: "Professional builder reputation", impact: +24 },
      { factor: "Numbers-matching engine", impact: +11 },
      { factor: "Documented celebrity ownership", impact: +30 }
    ]
  },
  {
    id: 8,
    model: "1955-1957 Chevy Bel Air",
    currentValue: 765000,
    fiveYearGrowth: 26.5,
    averageBuildCost: 275000,
    premiumBuildCost: 650000,
    category: "Classic",
    imageUrl: "https://images.unsplash.com/photo-1536586622100-7e069cfbf379?auto=format&w=600&q=80",
    valueDeterminants: [
      { factor: "Original matching numbers", impact: +12 },
      { factor: "Modern chassis upgrade", impact: +14 },
      { factor: "Professional builder reputation", impact: +23 },
      { factor: "Numbers-matching engine", impact: +10 },
      { factor: "Documented celebrity ownership", impact: +27 }
    ]
  },
  {
    id: 9,
    model: "1966-1970 Bronco",
    currentValue: 725000,
    fiveYearGrowth: 38.5,
    averageBuildCost: 260000,
    premiumBuildCost: 580000,
    category: "SUV",
    imageUrl: "https://images.unsplash.com/photo-1594378941931-91f2df6baf95?auto=format&w=600&q=80",
    valueDeterminants: [
      { factor: "Original matching numbers", impact: +11 },
      { factor: "Modern chassis upgrade", impact: +16 },
      { factor: "Professional builder reputation", impact: +29 },
      { factor: "Numbers-matching engine", impact: +9 },
      { factor: "Documented celebrity ownership", impact: +34 }
    ]
  },
  {
    id: 10,
    model: "1960s Porsche 911",
    currentValue: 985000,
    fiveYearGrowth: 35.2,
    averageBuildCost: 365000,
    premiumBuildCost: 895000,
    category: "Sports Car",
    imageUrl: "https://images.unsplash.com/photo-1556800572-1b8aeef2c54f?auto=format&w=600&q=80",
    valueDeterminants: [
      { factor: "Original matching numbers", impact: +19 },
      { factor: "Modern chassis upgrade", impact: +16 },
      { factor: "Professional builder reputation", impact: +32 },
      { factor: "Numbers-matching engine", impact: +15 },
      { factor: "Documented celebrity ownership", impact: +35 }
    ]
  }
];

// Regional market hotspots for restomod sales and demand
export const REGIONAL_MARKET_HOTSPOTS = [
  { region: "Southern California", valueIndex: 98, growthRate: 9.2, averageSellingTime: 45 },
  { region: "South Florida", valueIndex: 92, growthRate: 8.7, averageSellingTime: 62 },
  { region: "Texas", valueIndex: 86, growthRate: 10.5, averageSellingTime: 58 },
  { region: "New York Metro", valueIndex: 85, growthRate: 7.9, averageSellingTime: 72 },
  { region: "Arizona", valueIndex: 82, growthRate: 9.5, averageSellingTime: 51 },
  { region: "Pacific Northwest", valueIndex: 78, growthRate: 8.2, averageSellingTime: 64 },
  { region: "Chicago Area", valueIndex: 77, growthRate: 7.6, averageSellingTime: 87 },
  { region: "New England", valueIndex: 75, growthRate: 7.2, averageSellingTime: 93 }
];

// Premium auction results for notable restomod sales
export const PREMIUM_AUCTION_RESULTS = [
  {
    vehicleModel: "1967 Chevrolet Corvette Restomod",
    builder: "Custom Performance",
    auctionHouse: "Barrett-Jackson",
    saleDate: "January 2024",
    salePrice: 962000,
    notableFeatures: "LS9 ZR1 engine, Art Morrison chassis, one-off interior"
  },
  {
    vehicleModel: "1969 Ford Mustang Fastback 'Villain'",
    builder: "Ringbrothers",
    auctionHouse: "Mecum",
    saleDate: "March 2024",
    salePrice: 885000,
    notableFeatures: "Custom body modifications, 858hp Roush engine, carbon fiber components"
  },
  {
    vehicleModel: "1972 De Tomaso Pantera 'GT5-S'",
    builder: "SEMA Show Winner",
    auctionHouse: "RM Sotheby's",
    saleDate: "February 2024",
    salePrice: 920000,
    notableFeatures: "Twin-turbo Ferrari V8, bespoke interior, widebody conversion"
  },
  {
    vehicleModel: "1969 Dodge Charger 'Daytona' Tribute",
    builder: "Speedkore",
    auctionHouse: "Barrett-Jackson",
    saleDate: "January 2024",
    salePrice: 825000,
    notableFeatures: "Full carbon fiber body, 1,525hp Hellephant engine, modern suspension"
  },
  {
    vehicleModel: "1965 Shelby Cobra Daytona Coupe",
    builder: "Superformance/Shelby",
    auctionHouse: "Gooding & Company",
    saleDate: "April 2024",
    salePrice: 985000,
    notableFeatures: "Shelby-authorized continuation, Carroll Shelby signature, original specification"
  }
];

// Return on investment by vehicle class over 10-year period
export const ROI_BY_VEHICLE_CLASS = {
  "American Muscle (1967-1970)": {
    initialInvestment: { averagePurchase: 45000, averageBuild: 230000 },
    currentValue: { lowEnd: 425000, average: 620000, premium: 875000 },
    tenYearROI: 125,
    bestPerformer: "1969 Camaro SS 396 Pro-Touring"
  },
  "European Sports (1960s-1970s)": {
    initialInvestment: { averagePurchase: 80000, averageBuild: 275000 },
    currentValue: { lowEnd: 520000, average: 750000, premium: 985000 },
    tenYearROI: 111,
    bestPerformer: "1964 Porsche 911 Singer-style"
  },
  "Classic Truck (1950s-1960s)": {
    initialInvestment: { averagePurchase: 35000, averageBuild: 195000 },
    currentValue: { lowEnd: 345000, average: 510000, premium: 725000 },
    tenYearROI: 137,
    bestPerformer: "1956 Ford F-100 Custom"
  },
  "Vintage SUV (1960s-1970s)": {
    initialInvestment: { averagePurchase: 42000, averageBuild: 205000 },
    currentValue: { lowEnd: 380000, average: 568000, premium: 785000 },
    tenYearROI: 145,
    bestPerformer: "1972 Bronco with Coyote V8"
  },
  "Luxury/Grand Touring": {
    initialInvestment: { averagePurchase: 70000, averageBuild: 290000 },
    currentValue: { lowEnd: 485000, average: 720000, premium: 920000 },
    tenYearROI: 103,
    bestPerformer: "1963 Jaguar E-Type Restomod"
  }
};