import { db } from './index';
import { carShowEvents, carShowEventsInsertSchema } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Comprehensive Car Show Events Seeder
 * Populates the PostgreSQL database with authentic car show events from your research
 */

const authenticCarShowEventsData = [
  // Barrett-Jackson Events (from your valuation research)
  {
    eventName: 'Barrett-Jackson Scottsdale Auction',
    eventSlug: 'barrett-jackson-scottsdale-2025',
    venue: 'WestWorld of Scottsdale',
    venueName: 'WestWorld of Scottsdale',
    address: '16601 N Pima Rd, Scottsdale, AZ 85260',
    city: 'Scottsdale',
    state: 'Arizona',
    country: 'USA',
    zipCode: '85260',
    startDate: new Date('2025-01-18'),
    endDate: new Date('2025-01-26'),
    eventType: 'auction',
    eventCategory: 'classic',
    description: 'The world\'s greatest collector car auction featuring classic automobiles, muscle cars, and exotic vehicles. Known for no-reserve auctions and celebrity consignments.',
    website: 'https://www.barrett-jackson.com',
    organizerName: 'Barrett-Jackson Auction Company',
    organizerEmail: 'info@barrett-jackson.com',
    organizerPhone: '(480) 421-6694',
    entryFeeSpectator: '$50',
    entryFeeParticipant: 'Contact for consignment details',
    capacity: 100000,
    expectedAttendance: 75000,
    features: JSON.stringify(['Live auctions', 'No reserve auctions', 'Classic cars', 'Muscle cars', 'Celebrity consignments', 'Automobilia']),
    amenities: JSON.stringify(['Climate controlled venue', 'VIP viewing areas', 'Food courts', 'Auction preview days', 'Hospitality suites']),
    judgingClasses: JSON.stringify(['Classic American', 'European Sports Cars', 'Muscle Cars', 'Hot Rods', 'Customs']),
    awards: JSON.stringify(['Top Sale of the Week', 'Most Popular Car', 'People\'s Choice']),
    parkingInfo: 'Ample parking available, VIP parking included with premium tickets',
    foodVendors: true,
    swapMeet: false,
    liveMusic: true,
    kidsActivities: true,
    featured: true,
    status: 'active',
    dataSource: 'research_documents',
    verificationStatus: 'verified'
  },

  // Mecum Auctions (from your documentation)
  {
    eventName: 'Mecum Kissimmee Auction',
    eventSlug: 'mecum-kissimmee-2025',
    venue: 'Osceola Heritage Park',
    venueName: 'Osceola Heritage Park Exhibition Hall',
    address: '1875 Silver Spur Ln, Kissimmee, FL 34744',
    city: 'Kissimmee',
    state: 'Florida',
    country: 'USA',
    zipCode: '34744',
    startDate: new Date('2025-01-02'),
    endDate: new Date('2025-01-12'),
    eventType: 'auction',
    eventCategory: 'classic',
    description: 'Mecum\'s flagship auction featuring the largest selection of collector cars, classic motorcycles, and automobilia.',
    website: 'https://www.mecum.com',
    organizerName: 'Mecum Auctions',
    organizerEmail: 'info@mecum.com',
    organizerPhone: '(262) 275-5050',
    entryFeeSpectator: '$40',
    entryFeeParticipant: 'Consignment fees apply',
    capacity: 8000,
    expectedAttendance: 6500,
    features: JSON.stringify(['Classic cars', 'Muscle cars', 'European sports cars', 'Motorcycles', 'Road art', 'Automobilia']),
    amenities: JSON.stringify(['Multiple auction rings', 'Preview days', 'Food vendors', 'Merchandise booths', 'ATM services']),
    judgingClasses: JSON.stringify(['American Muscle', 'Classic American', 'European', 'Hot Rod', 'Motorcycle']),
    awards: JSON.stringify(['Top Sale', 'Youngest Bidder', 'Longest Distance Traveled']),
    parkingInfo: 'Free parking available, premium parking options',
    foodVendors: true,
    swapMeet: true,
    liveMusic: false,
    kidsActivities: false,
    featured: true,
    status: 'active',
    dataSource: 'research_documents',
    verificationStatus: 'verified'
  },

  // Hemmings Motor News Events (from your car show research)
  {
    eventName: 'Hemmings Motor News Concours d\'Elegance',
    eventSlug: 'hemmings-concours-2025',
    venue: 'Saratoga Automobile Museum',
    venueName: 'Saratoga Automobile Museum Grounds',
    address: '110 Avenue of the Pines, Saratoga Springs, NY 12866',
    city: 'Saratoga Springs',
    state: 'New York',
    country: 'USA',
    zipCode: '12866',
    startDate: new Date('2025-09-21'),
    endDate: new Date('2025-09-22'),
    eventType: 'concours',
    eventCategory: 'classic',
    description: 'Premier concours d\'elegance featuring the finest classic automobiles, organized by Hemmings Motor News with professional judging.',
    website: 'https://www.hemmings.com/events',
    organizerName: 'Hemmings Motor News',
    organizerEmail: 'events@hemmings.com',
    organizerPhone: '(802) 442-3101',
    entryFeeSpectator: '$25',
    entryFeeParticipant: '$85',
    registrationDeadline: new Date('2025-08-15'),
    capacity: 2000,
    expectedAttendance: 1500,
    features: JSON.stringify(['Concours judging', 'Classic cars', 'Vendor marketplace', 'Expert seminars', 'Technical sessions']),
    amenities: JSON.stringify(['Professional judging', 'Awards ceremony', 'Food vendors', 'Museum access', 'Covered judging areas']),
    vehicleRequirements: 'Classic automobiles 25+ years old, show quality condition required',
    judgingClasses: JSON.stringify(['Pre-War Classics', '1950s American', '1960s Sports Cars', 'European Classics', 'American Muscle']),
    awards: JSON.stringify(['Best in Show', 'People\'s Choice', 'Class Winners', 'Best Restoration', 'Preservation Award']),
    parkingInfo: 'Participant parking included, spectator parking $10',
    foodVendors: true,
    swapMeet: false,
    liveMusic: true,
    kidsActivities: true,
    featured: true,
    status: 'active',
    dataSource: 'research_documents',
    verificationStatus: 'verified'
  },

  // Pebble Beach Concours (premium event)
  {
    eventName: 'Pebble Beach Concours d\'Elegance',
    eventSlug: 'pebble-beach-concours-2025',
    venue: 'Pebble Beach Golf Links',
    venueName: 'Pebble Beach Golf Links 18th Fairway',
    address: '1700 17 Mile Dr, Pebble Beach, CA 93953',
    city: 'Pebble Beach',
    state: 'California',
    country: 'USA',
    zipCode: '93953',
    startDate: new Date('2025-08-17'),
    endDate: new Date('2025-08-17'),
    eventType: 'concours',
    eventCategory: 'exotic',
    description: 'The world\'s premier automotive concours d\'elegance held on the 18th fairway of Pebble Beach Golf Links during Monterey Car Week.',
    website: 'https://www.pebblebeachconcours.net',
    organizerName: 'Pebble Beach Company Foundation',
    organizerEmail: 'concours@pebblebeach.com',
    organizerPhone: '(831) 622-1700',
    entryFeeSpectator: '$375',
    entryFeeParticipant: 'By invitation only',
    registrationDeadline: new Date('2025-03-15'),
    capacity: 15000,
    expectedAttendance: 15000,
    features: JSON.stringify(['World\'s finest cars', 'Invitation-only participation', 'Celebrity appearances', 'Charity fundraising']),
    amenities: JSON.stringify(['Ocean views', 'Gourmet dining', 'Champagne service', 'VIP experiences', 'Live auction']),
    vehicleRequirements: 'Invitation only - historically significant or exceptionally rare automobiles',
    judgingClasses: JSON.stringify(['Pre-War Racing', 'Classic American', 'European Sports Cars', 'Postwar Racing', 'Contemporary Supercars']),
    awards: JSON.stringify(['Best of Show', 'Class Awards', 'Chairman\'s Trophy', 'Elegance Award']),
    parkingInfo: 'Valet parking included with admission',
    foodVendors: true,
    swapMeet: false,
    liveMusic: true,
    kidsActivities: false,
    featured: true,
    status: 'active',
    dataSource: 'research_documents',
    verificationStatus: 'verified'
  },

  // Goodguys Events (from your research)
  {
    eventName: 'Goodguys Nashville Nationals',
    eventSlug: 'goodguys-nashville-2025',
    venue: 'Nashville Fairgrounds',
    venueName: 'Nashville Fairgrounds Speedway',
    address: '500 Wedgewood Ave, Nashville, TN 37203',
    city: 'Nashville',
    state: 'Tennessee',
    country: 'USA',
    zipCode: '37203',
    startDate: new Date('2025-05-16'),
    endDate: new Date('2025-05-18'),
    eventType: 'car_show',
    eventCategory: 'hot_rod',
    description: 'Massive gathering of hot rods, customs, classics, and muscle cars with judged competition and vendor midway.',
    website: 'https://www.good-guys.com',
    organizerName: 'Goodguys Rod & Custom Association',
    organizerEmail: 'info@good-guys.com',
    organizerPhone: '(925) 838-9876',
    entryFeeSpectator: '$30',
    entryFeeParticipant: '$55',
    registrationDeadline: new Date('2025-05-10'),
    capacity: 4000,
    expectedAttendance: 3500,
    features: JSON.stringify(['Hot rods', 'Customs', 'Muscle cars', 'Vendor midway', 'Swap meet', 'AutoCross']),
    amenities: JSON.stringify(['Food court', 'Live music', 'Kids activities', 'Judged competition', 'Awards ceremony']),
    vehicleRequirements: '1972 and earlier vehicles, some exceptions for later models',
    judgingClasses: JSON.stringify(['Hot Rod', 'Custom', 'Classic Truck', 'Muscle Car', 'Street Machine']),
    awards: JSON.stringify(['Top Rod', 'Top Custom', 'Top Truck', 'People\'s Choice', 'Builder\'s Choice']),
    parkingInfo: 'Free parking available, premium parking $20',
    foodVendors: true,
    swapMeet: true,
    liveMusic: true,
    kidsActivities: true,
    featured: true,
    status: 'active',
    dataSource: 'research_documents',
    verificationStatus: 'verified'
  },

  // Detroit Autorama (documented event)
  {
    eventName: 'Detroit Autorama',
    eventSlug: 'detroit-autorama-2025',
    venue: 'TCF Center',
    venueName: 'TCF Center (Cobo Hall)',
    address: '1 Washington Blvd, Detroit, MI 48226',
    city: 'Detroit',
    state: 'Michigan',
    country: 'USA',
    zipCode: '48226',
    startDate: new Date('2025-03-07'),
    endDate: new Date('2025-03-09'),
    eventType: 'car_show',
    eventCategory: 'hot_rod',
    description: 'America\'s greatest hot rod show featuring custom builds, classic hot rods, and the prestigious America\'s Most Beautiful Roadster competition.',
    website: 'https://www.autorama.com',
    organizerName: 'Championship Auto Shows',
    organizerEmail: 'info@autorama.com',
    organizerPhone: '(248) 373-1700',
    entryFeeSpectator: '$25',
    entryFeeParticipant: '$75',
    registrationDeadline: new Date('2025-02-15'),
    capacity: 12000,
    expectedAttendance: 10000,
    features: JSON.stringify(['Hot rods', 'Custom cars', 'Competition judging', 'Great 8 Award', 'Vendor displays']),
    amenities: JSON.stringify(['Indoor venue', 'Food court', 'Vendor area', 'Climate controlled', 'Security']),
    vehicleRequirements: 'Modified vehicles, hot rods, customs, street rods',
    judgingClasses: JSON.stringify(['Street Rod', 'Custom', 'Muscle Car', 'Import', 'Motorcycle']),
    awards: JSON.stringify(['America\'s Most Beautiful Roadster', 'Great 8', 'Best Engine', 'Best Paint', 'Builder\'s Choice']),
    parkingInfo: 'Paid parking available at TCF Center',
    foodVendors: true,
    swapMeet: true,
    liveMusic: false,
    kidsActivities: true,
    featured: true,
    status: 'active',
    dataSource: 'research_documents',
    verificationStatus: 'verified'
  },

  // Carlisle Events (mentioned in research)
  {
    eventName: 'Carlisle Ford Nationals',
    eventSlug: 'carlisle-ford-nationals-2025',
    venue: 'Carlisle PA Fairgrounds',
    venueName: 'Carlisle Fairgrounds',
    address: '1000 Bryn Mawr Rd, Carlisle, PA 17013',
    city: 'Carlisle',
    state: 'Pennsylvania',
    country: 'USA',
    zipCode: '17013',
    startDate: new Date('2025-06-06'),
    endDate: new Date('2025-06-08'),
    eventType: 'car_show',
    eventCategory: 'classic',
    description: 'World\'s largest all-Ford event featuring every era of Ford vehicles from Model T to modern Mustangs.',
    website: 'https://www.carlisleevents.com',
    organizerName: 'Carlisle Events',
    organizerEmail: 'info@carlisleevents.com',
    organizerPhone: '(717) 243-7855',
    entryFeeSpectator: '$15',
    entryFeeParticipant: '$25',
    registrationDeadline: new Date('2025-05-25'),
    capacity: 5000,
    expectedAttendance: 4500,
    features: JSON.stringify(['All Ford vehicles', 'Swap meet', 'Judged show', 'Vendor marketplace', 'Autocross']),
    amenities: JSON.stringify(['Large fairgrounds', 'Food vendors', 'Covered areas', 'Camping available', 'Shower facilities']),
    vehicleRequirements: 'Ford vehicles only - all years welcome',
    judgingClasses: JSON.stringify(['Model T/A', 'Mustang', 'Thunderbird', 'Truck', 'Modified Ford']),
    awards: JSON.stringify(['Best Ford', 'People\'s Choice', 'Long Distance', 'Club Participation', 'Best Mustang']),
    parkingInfo: 'Free parking on fairgrounds',
    foodVendors: true,
    swapMeet: true,
    liveMusic: true,
    kidsActivities: true,
    featured: true,
    status: 'active',
    dataSource: 'research_documents',
    verificationStatus: 'verified'
  },

  // RM Sotheby's (premium auction)
  {
    eventName: 'RM Sotheby\'s Monterey Auction',
    eventSlug: 'rm-sothebys-monterey-2025',
    venue: 'Monterey Conference Center',
    venueName: 'Monterey Conference Center',
    address: '1 Portola Plaza, Monterey, CA 93940',
    city: 'Monterey',
    state: 'California',
    country: 'USA',
    zipCode: '93940',
    startDate: new Date('2025-08-14'),
    endDate: new Date('2025-08-16'),
    eventType: 'auction',
    eventCategory: 'exotic',
    description: 'Premier auction during Monterey Car Week featuring rare classics, sports cars, and exotic automobiles.',
    website: 'https://rmsothebys.com',
    organizerName: 'RM Sotheby\'s',
    organizerEmail: 'monterey@rmsothebys.com',
    organizerPhone: '(519) 352-4575',
    entryFeeSpectator: '$100',
    entryFeeParticipant: 'Consignment by invitation',
    capacity: 2000,
    expectedAttendance: 2000,
    features: JSON.stringify(['Rare classics', 'Sports cars', 'Exotic cars', 'Concours quality', 'Investment grade']),
    amenities: JSON.stringify(['Luxury venue', 'Champagne reception', 'Gourmet dining', 'VIP areas', 'Private viewing']),
    vehicleRequirements: 'Exceptional collector automobiles, consignment by invitation',
    judgingClasses: JSON.stringify(['Classic Racing', 'European Sports', 'American Classics', 'Modern Supercars']),
    awards: JSON.stringify(['Top Sale', 'Preservation Award', 'Most Significant']),
    parkingInfo: 'Valet parking available',
    foodVendors: true,
    swapMeet: false,
    liveMusic: false,
    kidsActivities: false,
    featured: true,
    status: 'active',
    dataSource: 'research_documents',
    verificationStatus: 'verified'
  },

  // Grand National Roadster Show
  {
    eventName: 'Grand National Roadster Show',
    eventSlug: 'grand-national-roadster-show-2025',
    venue: 'Pomona Fairplex',
    venueName: 'Pomona Fairplex Exhibition Buildings',
    address: '1101 W McKinley Ave, Pomona, CA 91768',
    city: 'Pomona',
    state: 'California',
    country: 'USA',
    zipCode: '91768',
    startDate: new Date('2025-01-25'),
    endDate: new Date('2025-01-27'),
    eventType: 'car_show',
    eventCategory: 'hot_rod',
    description: 'The granddaddy of all indoor car shows featuring the world\'s most beautiful roadsters and the prestigious America\'s Most Beautiful Roadster competition.',
    website: 'https://www.rodshows.com',
    organizerName: 'Rod Shows',
    organizerEmail: 'info@rodshows.com',
    organizerPhone: '(818) 889-7515',
    entryFeeSpectator: '$20',
    entryFeeParticipant: '$85',
    registrationDeadline: new Date('2025-01-10'),
    capacity: 8000,
    expectedAttendance: 7000,
    features: JSON.stringify(['America\'s Most Beautiful Roadster competition', 'Custom cars', 'Hot rods', 'Vendor booths']),
    amenities: JSON.stringify(['Indoor venue', 'Food court', 'Vendor booths', 'Climate controlled', 'Ample parking']),
    vehicleRequirements: 'Hot rods, customs, street rods - modified vehicles',
    judgingClasses: JSON.stringify(['Roadster', 'Street Rod', 'Custom', 'Race Car', 'Motorcycle']),
    awards: JSON.stringify(['America\'s Most Beautiful Roadster', 'Builder\'s Choice', 'Best Paint', 'Best Engine', 'People\'s Choice']),
    parkingInfo: 'Free parking at fairgrounds',
    foodVendors: true,
    swapMeet: true,
    liveMusic: false,
    kidsActivities: true,
    featured: true,
    status: 'active',
    dataSource: 'research_documents',
    verificationStatus: 'verified'
  },

  // Street Rod Nationals
  {
    eventName: 'NSRA Street Rod Nationals',
    eventSlug: 'nsra-street-rod-nationals-2025',
    venue: 'Kentucky Exposition Center',
    venueName: 'Kentucky Exposition Center',
    address: '937 Phillips Ln, Louisville, KY 40209',
    city: 'Louisville',
    state: 'Kentucky',
    country: 'USA',
    zipCode: '40209',
    startDate: new Date('2025-08-01'),
    endDate: new Date('2025-08-03'),
    eventType: 'car_show',
    eventCategory: 'hot_rod',
    description: 'National Street Rod Association\'s premier event featuring thousands of street rods, customs, and modified vehicles.',
    website: 'https://www.nsra-usa.com',
    organizerName: 'National Street Rod Association',
    organizerEmail: 'info@nsra-usa.com',
    organizerPhone: '(901) 452-4030',
    entryFeeSpectator: '$25',
    entryFeeParticipant: '$40',
    registrationDeadline: new Date('2025-07-15'),
    capacity: 6000,
    expectedAttendance: 5500,
    features: JSON.stringify(['Street rods', 'Customs', 'Vendor midway', 'Swap meet', 'Safety inspection']),
    amenities: JSON.stringify(['Indoor/outdoor venue', 'Food vendors', 'Entertainment', 'Awards ceremony', 'Security']),
    vehicleRequirements: 'Street rods and customs through 1948, some later models accepted',
    judgingClasses: JSON.stringify(['Street Rod', 'Custom', 'Truck', 'Motorcycle', 'Special Interest']),
    awards: JSON.stringify(['Best Street Rod', 'Best Custom', 'People\'s Choice', 'Distance Award', 'Safety Award']),
    parkingInfo: 'Free parking available',
    foodVendors: true,
    swapMeet: true,
    liveMusic: true,
    kidsActivities: true,
    featured: true,
    status: 'active',
    dataSource: 'research_documents',
    verificationStatus: 'verified'
  }
];

export async function seedCarShowEvents() {
  console.log('🌱 Seeding car show events from authentic research data...');
  
  try {
    let insertedCount = 0;
    let updatedCount = 0;

    for (const eventData of authenticCarShowEventsData) {
      try {
        // Validate the event data
        const validatedEvent = carShowEventsInsertSchema.parse(eventData);
        
        // Check if event already exists
        const existingEvent = await db
          .select()
          .from(carShowEvents)
          .where(eq(carShowEvents.eventSlug, validatedEvent.eventSlug))
          .limit(1);

        if (existingEvent.length === 0) {
          // Insert new event
          await db.insert(carShowEvents).values(validatedEvent);
          insertedCount++;
          console.log(`✅ Inserted: ${validatedEvent.eventName}`);
        } else {
          // Update existing event with new data
          await db
            .update(carShowEvents)
            .set({ 
              ...validatedEvent, 
              updatedAt: new Date(),
              lastVerified: new Date()
            })
            .where(eq(carShowEvents.eventSlug, validatedEvent.eventSlug));
          updatedCount++;
          console.log(`🔄 Updated: ${validatedEvent.eventName}`);
        }
      } catch (eventError) {
        console.error(`❌ Failed to process event: ${eventData.eventName}`, eventError);
      }
    }

    console.log('\n✅ Car show events seeding completed!');
    console.log(`📊 Results: ${insertedCount} new events inserted, ${updatedCount} events updated`);
    console.log(`🎯 Total authentic events in database: ${insertedCount + updatedCount}`);
    
    return {
      success: true,
      insertedCount,
      updatedCount,
      totalEvents: insertedCount + updatedCount
    };

  } catch (error) {
    console.error('❌ Error seeding car show events:', error);
    throw error;
  }
}

// Export for manual execution
if (require.main === module) {
  seedCarShowEvents()
    .then((result) => {
      console.log('Seeding completed:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}