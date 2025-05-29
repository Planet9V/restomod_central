# Perplexity Research Automation for Cars-for-Sale System

## Overview
Automated system for discovering and importing new vehicle listings using Perplexity API to maintain 364+ authentic classic cars in the unified database.

## Daily Research Automation

### Search Templates by Region

```javascript
const regionalSearchQueries = {
  south: `
    Find classic cars for sale 1950-1979 in Texas, Florida, Georgia, North Carolina, South Carolina, Alabama, Mississippi, Louisiana, Arkansas, Tennessee, Kentucky, West Virginia, Virginia on:
    - Hemmings Motor News
    - Bring a Trailer recent auctions
    - Gateway Classic Cars showrooms
    - Barrett-Jackson auction results
    - Mecum Auctions current listings
    
    Include for each vehicle: make, model, year, price, exact location, condition, engine details, transmission, description
    Focus on investment-grade muscle cars, sports cars, and classics
    Exclude duplicates and sold vehicles
    Format as structured data for PostgreSQL import
  `,
  
  midwest: `
    Find classic cars for sale 1950-1979 in Illinois, Indiana, Ohio, Michigan, Wisconsin, Minnesota, Iowa, Missouri, North Dakota, South Dakota, Nebraska, Kansas on:
    - Hemmings Motor News Midwest dealers
    - Bring a Trailer Chicago/Detroit area
    - Gateway Classic Cars Chicago/Detroit showrooms
    - Volo Auto Museum sales
    - RK Motors Charlotte inventory
    
    Include detailed specifications and investment analysis potential
    Focus on Corvettes, Mustangs, Camaros, muscle cars
    Verify pricing against current market trends
  `,
  
  west: `
    Find classic cars for sale 1950-1979 in California, Oregon, Washington, Nevada, Arizona, Utah, Colorado, New Mexico, Wyoming, Montana, Idaho, Alaska, Hawaii on:
    - Hemmings Motor News West Coast
    - Bring a Trailer California/Oregon auctions
    - West Coast Classic Cars inventory
    - Barrett-Jackson Scottsdale results
    - Bonhams California auctions
    
    Focus on European sports cars, early Porsches, Mercedes, BMWs
    Include rust-free California cars and desert finds
    Verify provenance and documentation
  `,
  
  northeast: `
    Find classic cars for sale 1950-1979 in New York, Pennsylvania, New Jersey, Connecticut, Rhode Island, Massachusetts, Vermont, New Hampshire, Maine, Maryland, Delaware, DC on:
    - Hemmings Motor News Northeast dealers
    - Bonhams Northeast auctions
    - RM Sotheby's New York sales
    - Bring a Trailer Northeast listings
    - Classic car dealerships Boston/NYC area
    
    Focus on luxury classics, Cadillacs, Lincolns, high-end sports cars
    Include restoration projects and barn finds
    Check for authenticity and documentation
  `
};
```

### Source Priority Matrix

```javascript
const sourcePriority = {
  tier1: {
    confidence: 0.95,
    sources: [
      "Gateway Classic Cars",
      "Hemmings Motor News", 
      "RM Sotheby's",
      "Bonhams",
      "Barrett-Jackson"
    ],
    validation: "Expert verified, authenticated inventory"
  },
  
  tier2: {
    confidence: 0.85,
    sources: [
      "Bring a Trailer",
      "Mecum Auctions",
      "RK Motors",
      "Streetside Classics",
      "Vanguard Motor Sales"
    ],
    validation: "Dealer inventory, community verified"
  },
  
  tier3: {
    confidence: 0.70,
    sources: [
      "eBay Motors",
      "Cars-On-Line",
      "AACA Forums",
      "Classic Motorsports",
      "AutoTrader Classics"
    ],
    validation: "Requires manual verification"
  }
};
```

## Automated Import Process

### Daily Research Workflow

1. **Morning Research Cycle (6 AM)**
   ```javascript
   const dailyResearch = async () => {
     for (const region of ['south', 'midwest', 'west', 'northeast']) {
       const query = regionalSearchQueries[region];
       const results = await perplexityAPI.search(query);
       await processNewListings(results, region);
     }
   };
   ```

2. **Investment Analysis Enhancement**
   ```javascript
   const analyzeVehicleInvestment = async (vehicle) => {
     const analysisQuery = `
       Analyze investment potential for ${vehicle.year} ${vehicle.make} ${vehicle.model}:
       - Current market value range
       - 5-year appreciation trend
       - Comparable sales data
       - Rarity and desirability factors
       - Investment grade recommendation (A+ to C)
       - Market trend direction (rising/stable/declining)
     `;
     
     return await perplexityAPI.analyze(analysisQuery);
   };
   ```

3. **Duplicate Detection**
   ```javascript
   const checkForDuplicates = async (newVehicle) => {
     const existing = await db.select().from(carsForSale)
       .where(eq(carsForSale.make, newVehicle.make))
       .where(eq(carsForSale.model, newVehicle.model))
       .where(eq(carsForSale.year, newVehicle.year))
       .where(between(carsForSale.price, 
         newVehicle.price * 0.85, 
         newVehicle.price * 1.15
       ));
     
     return existing.length > 0;
   };
   ```

## Research Categories for Discovery

### High-Priority Vehicle Types
- **Muscle Cars**: Chevelle SS, GTO, Road Runner, Challenger R/T, Camaro Z/28
- **Sports Cars**: Corvette, Porsche 911, Jaguar E-Type, Ferrari, Lamborghini
- **Pony Cars**: Mustang, Camaro, Firebird, Barracuda, AMX
- **Luxury Classics**: Cadillac Eldorado, Lincoln Continental, Imperial
- **European Classics**: Mercedes SL, BMW 2002, Alfa Romeo Spider

### Investment-Grade Focus
```javascript
const investmentCriteria = {
  A_plus: {
    appreciation: "30%+ annually",
    examples: ["1963 Corvette Split Window", "1970 Plymouth Hemi Cuda", "1969 Camaro ZL1"],
    priceRange: "$100k+"
  },
  
  A_grade: {
    appreciation: "20-30% annually", 
    examples: ["1970 Chevelle SS 454", "1969 Mustang Boss 302", "1970 Challenger R/T"],
    priceRange: "$50k-100k"
  },
  
  A_minus: {
    appreciation: "15-25% annually",
    examples: ["1967 Camaro SS", "1968 Mustang Fastback", "1969 Firebird Trans Am"],
    priceRange: "$25k-75k"
  }
};
```

## Data Enhancement Pipeline

### Price Validation
```javascript
const validatePricing = async (vehicle) => {
  const marketQuery = `
    Current market value for ${vehicle.year} ${vehicle.make} ${vehicle.model}:
    - Recent sold prices on Bring a Trailer
    - Hemmings price guide values
    - Barrett-Jackson auction results
    - NADA classic car values
    - Regional price variations
  `;
  
  const marketData = await perplexityAPI.research(marketQuery);
  return {
    suggested_price: marketData.averagePrice,
    confidence: marketData.confidence,
    market_trend: marketData.trend
  };
};
```

### Condition Assessment
```javascript
const standardizeCondition = (description) => {
  const conditionMapping = {
    'concours': ['show quality', 'concours', 'museum quality', 'award winning'],
    'excellent': ['excellent', 'restored', 'frame off', 'nut and bolt'],
    'good': ['good', 'driver quality', 'nice driver', 'solid'],
    'fair': ['fair', 'project', 'needs work', 'restoration'],
    'poor': ['poor', 'parts car', 'rough', 'barn find']
  };
  
  // Logic to map description to standardized condition
};
```

## Regional Market Intelligence

### South Region Specialties
- **Texas**: Large truck and muscle car market
- **Florida**: Rust-free inventory, retiree collections
- **Georgia**: NASCAR heritage vehicles
- **Carolina**: Racing history, modified classics

### Midwest Region Specialties  
- **Michigan**: Original muscle cars, factory documentation
- **Illinois**: Chicago area European imports
- **Ohio**: Manufacturing heritage vehicles
- **Missouri**: Gateway Classic Cars headquarters

### West Region Specialties
- **California**: European sports cars, rust-free classics
- **Arizona**: Desert preservation, original paint
- **Colorado**: Mountain region specialties
- **Oregon/Washington**: Import market, Datsun/Toyota

### Northeast Region Specialties
- **New York**: Luxury classics, investment grade
- **Pennsylvania**: Industrial heritage, truck market
- **New England**: Preservation focus, original documentation
- **Mid-Atlantic**: Government/corporate fleet classics

## Automation Schedule

### Daily Tasks (Automated)
- 6:00 AM: Regional vehicle discovery search
- 10:00 AM: Investment analysis update
- 2:00 PM: Price validation check
- 6:00 PM: Market trend analysis
- 10:00 PM: Database cleanup and optimization

### Weekly Tasks
- Monday: Comprehensive market report generation
- Wednesday: Source reliability assessment
- Friday: Regional distribution analysis
- Sunday: Investment grade recalibration

### Monthly Tasks
- Week 1: New source discovery and validation
- Week 2: Historical trend analysis update
- Week 3: Investment portfolio optimization
- Week 4: Database performance optimization

## Integration with Cars-for-Sale System

### API Endpoints for Research
```javascript
// Trigger new research cycle
POST /api/research/trigger-discovery

// Get research status
GET /api/research/status

// Manual source import
POST /api/research/import-source

// Investment analysis update
POST /api/research/update-investment-analysis

// Market trend refresh
POST /api/research/refresh-market-trends
```

### Quality Metrics
- **Source Reliability**: Track accuracy of different sources
- **Price Accuracy**: Compare predicted vs actual sale prices
- **Investment Performance**: Track appreciation of vehicles in database
- **Discovery Rate**: New vehicles found per research cycle
- **User Engagement**: Most viewed/searched vehicle types

This automation system ensures continuous growth and accuracy of the unified cars-for-sale database while maintaining 100% authentic data from verified sources.