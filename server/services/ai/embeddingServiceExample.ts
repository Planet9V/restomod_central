/**
 * Example Usage of Embedding Service
 *
 * This file demonstrates how to use the embeddingService.ts
 * for generating embeddings for cars and events.
 *
 * NOTE: This is an example/reference file, not meant to be run directly.
 * It shows how to integrate the embedding service into your application.
 */

import {
  generateEmbedding,
  generateBatchEmbeddings,
  generateCarEmbedding,
  generateEventEmbedding,
  getCacheStats,
  cleanExpiredCache,
} from './embeddingService';
import type { CarForSale, CarShowEvent } from '../../../shared/schema';

// ============================================
// Example 1: Generate Single Embedding
// ============================================

async function exampleSingleEmbedding() {
  const text = "1967 Ford Mustang Fastback, 289 V8, 4-speed manual";

  try {
    const embedding = await generateEmbedding(text);
    console.log(`Generated embedding with ${embedding.length} dimensions`);
    // embedding is a number[] with 1536 elements
    return embedding;
  } catch (error) {
    console.error('Failed to generate embedding:', error);
    throw error;
  }
}

// ============================================
// Example 2: Generate Batch Embeddings
// ============================================

async function exampleBatchEmbeddings() {
  const texts = [
    "1969 Chevrolet Camaro SS",
    "1970 Plymouth Barracuda",
    "1968 Dodge Charger R/T",
    "1971 Ford Mustang Mach 1",
    "1967 Pontiac GTO"
  ];

  try {
    const embeddings = await generateBatchEmbeddings(texts);
    console.log(`Generated ${embeddings.length} embeddings`);
    // embeddings is a number[][] - array of 1536-dimensional vectors
    return embeddings;
  } catch (error) {
    console.error('Failed to generate batch embeddings:', error);
    throw error;
  }
}

// ============================================
// Example 3: Generate Car Embedding
// ============================================

async function exampleCarEmbedding() {
  // Example car object (you would get this from your database)
  const car: CarForSale = {
    id: 1,
    make: "Ford",
    model: "Mustang",
    year: 1967,
    price: "68500",
    sourceType: "gateway",
    sourceName: "Gateway Classic Cars",
    locationCity: "St. Louis",
    locationState: "Missouri",
    locationRegion: "midwest",
    category: "Muscle Cars",
    condition: "Excellent",
    mileage: 45000,
    exteriorColor: "Highland Green",
    interiorColor: "Black",
    engine: "289 V8",
    transmission: "4-Speed Manual",
    investmentGrade: "A",
    appreciationRate: "8.5%/year",
    marketTrend: "rising",
    valuationConfidence: "0.92",
    imageUrl: "/images/mustang.jpg",
    description: "Beautiful 1967 Ford Mustang Fastback in Highland Green. Original 289 V8 with 4-speed manual transmission. Recently restored with all original components.",
    features: JSON.stringify({
      airConditioning: false,
      powerSteering: true,
      powerBrakes: false,
      originalEngine: true,
      matchingNumbers: true
    }),
    stockNumber: "STL1234",
    vin: "7F02C123456",
    researchNotes: "Steve McQueen Bullitt-style Mustang. Highly sought after.",
    marketData: null,
    perplexityAnalysis: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Generate embedding text
  const embeddingText = generateCarEmbedding(car);
  console.log("Car embedding text:", embeddingText);

  // Generate the actual embedding
  const embedding = await generateEmbedding(embeddingText);
  console.log(`Generated car embedding with ${embedding.length} dimensions`);

  return { embeddingText, embedding };
}

// ============================================
// Example 4: Generate Event Embedding
// ============================================

async function exampleEventEmbedding() {
  // Example event object (you would get this from your database)
  const event: CarShowEvent = {
    id: 1,
    eventName: "Midwest Muscle Car Meet",
    eventSlug: "midwest-muscle-car-meet-2025",
    venue: "State Fairgrounds",
    venueName: "State Fairgrounds Arena",
    address: "1234 Fair Street",
    city: "Indianapolis",
    state: "Indiana",
    country: "USA",
    zipCode: "46202",
    startDate: new Date("2025-06-15"),
    endDate: new Date("2025-06-16"),
    eventType: "car_show",
    eventCategory: "muscle",
    description: "Annual gathering of the finest American muscle cars from the 1960s and 1970s. Features judging, swap meet, and live entertainment.",
    website: "https://midwestmuscle.com",
    organizerName: "Midwest Classic Car Club",
    organizerContact: "info@midwestmuscle.com",
    organizerEmail: "info@midwestmuscle.com",
    organizerPhone: "317-555-1234",
    entryFeeSpectator: "$15",
    entryFeeParticipant: "$40",
    registrationDeadline: new Date("2025-06-01"),
    capacity: 500,
    expectedAttendance: 3000,
    features: JSON.stringify(["judging", "swap_meet", "live_music", "food_vendors"]),
    amenities: JSON.stringify(["parking", "restrooms", "concessions"]),
    vehicleRequirements: "American muscle cars 1960-1979",
    judgingClasses: JSON.stringify(["Best Mopar", "Best Ford", "Best GM", "Best Resto-Mod"]),
    awards: JSON.stringify(["Best in Show", "People's Choice", "Best Engine Bay"]),
    parkingInfo: "Free parking available",
    foodVendors: true,
    swapMeet: true,
    liveMusic: true,
    kidsActivities: false,
    weatherContingency: "Event moves indoors if raining",
    specialNotes: "Special guest appearance by automotive historian",
    imageUrl: "/images/events/muscle-meet.jpg",
    featured: true,
    status: "active",
    sourceUrl: "https://midwestmuscle.com/events",
    dataSource: "manual",
    verificationStatus: "verified",
    lastVerified: new Date(),
    vehicleMakes: JSON.stringify(["Ford", "Chevrolet", "Dodge", "Plymouth", "Pontiac"]),
    vehicleModels: JSON.stringify(["Mustang", "Camaro", "Charger", "Barracuda", "GTO"]),
    primaryVehicleFocus: "category",
    expectedAttendanceMin: 2500,
    expectedAttendanceMax: 3500,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Generate embedding text
  const embeddingText = generateEventEmbedding(event);
  console.log("Event embedding text:", embeddingText);

  // Generate the actual embedding
  const embedding = await generateEmbedding(embeddingText);
  console.log(`Generated event embedding with ${embedding.length} dimensions`);

  return { embeddingText, embedding };
}

// ============================================
// Example 5: Batch Process All Cars
// ============================================

async function exampleBatchProcessCars(cars: CarForSale[]) {
  console.log(`Processing ${cars.length} cars...`);

  // Generate embedding texts for all cars
  const embeddingTexts = cars.map(car => generateCarEmbedding(car));

  // Generate embeddings in batches (automatically handles batching)
  const embeddings = await generateBatchEmbeddings(embeddingTexts);

  console.log(`Generated ${embeddings.length} embeddings`);

  // Now you can store these embeddings in your database
  // Example: UPDATE cars_for_sale SET embedding = ... WHERE id = ...

  return embeddings;
}

// ============================================
// Example 6: Batch Process All Events
// ============================================

async function exampleBatchProcessEvents(events: CarShowEvent[]) {
  console.log(`Processing ${events.length} events...`);

  // Generate embedding texts for all events
  const embeddingTexts = events.map(event => generateEventEmbedding(event));

  // Generate embeddings in batches
  const embeddings = await generateBatchEmbeddings(embeddingTexts);

  console.log(`Generated ${embeddings.length} embeddings`);

  return embeddings;
}

// ============================================
// Example 7: Monitor Cache Performance
// ============================================

function exampleCacheMonitoring() {
  const stats = getCacheStats();

  console.log('Cache Statistics:');
  console.log(`- Total entries: ${stats.totalEntries}`);
  console.log(`- Valid entries: ${stats.validEntries}`);
  console.log(`- Expired entries: ${stats.expiredEntries}`);
  console.log(`- Model: ${stats.model}`);
  console.log(`- Dimensions: ${stats.dimensions}`);
  console.log(`- TTL: ${stats.cacheTTL / 1000 / 60 / 60} hours`);

  return stats;
}

// ============================================
// Example 8: Manual Cache Cleanup
// ============================================

function exampleCacheCleanup() {
  console.log('Cleaning expired cache entries...');
  cleanExpiredCache();
  console.log('Cache cleanup complete');
}

// ============================================
// Complete Example: Process All Data
// ============================================

async function exampleCompleteWorkflow() {
  console.log('Starting complete embedding generation workflow...\n');

  // Step 1: Fetch cars from database (example)
  // const cars = await db.select().from(carsForSale).limit(100);
  const cars: CarForSale[] = []; // Replace with actual database query

  // Step 2: Fetch events from database (example)
  // const events = await db.select().from(carShowEvents).limit(50);
  const events: CarShowEvent[] = []; // Replace with actual database query

  console.log(`Found ${cars.length} cars and ${events.length} events\n`);

  // Step 3: Process cars
  if (cars.length > 0) {
    console.log('Processing cars...');
    const carEmbeddings = await exampleBatchProcessCars(cars);
    console.log(`✓ Generated ${carEmbeddings.length} car embeddings\n`);
  }

  // Step 4: Process events
  if (events.length > 0) {
    console.log('Processing events...');
    const eventEmbeddings = await exampleBatchProcessEvents(events);
    console.log(`✓ Generated ${eventEmbeddings.length} event embeddings\n`);
  }

  // Step 5: Check cache stats
  console.log('Cache Performance:');
  exampleCacheMonitoring();

  console.log('\n✓ Workflow complete!');
}

// ============================================
// Error Handling Example
// ============================================

async function exampleErrorHandling() {
  try {
    // Attempt to generate embedding
    const embedding = await generateEmbedding("Test text");
    console.log('Success!');
    return embedding;
  } catch (error) {
    // The service will automatically retry up to 3 times
    // If all retries fail, it will throw an error
    console.error('All embedding generation attempts failed:', error);

    // You can implement fallback logic here
    // For example: queue for later processing, use cached data, etc.
    throw error;
  }
}

// Export examples for reference
export {
  exampleSingleEmbedding,
  exampleBatchEmbeddings,
  exampleCarEmbedding,
  exampleEventEmbedding,
  exampleBatchProcessCars,
  exampleBatchProcessEvents,
  exampleCacheMonitoring,
  exampleCacheCleanup,
  exampleCompleteWorkflow,
  exampleErrorHandling,
};
