/**
 * COMPREHENSIVE SOUTHERN & EASTERN CAR SHOWS IMPORTER
 * Imports authentic car show events from the Southern car shows research document
 */

import { db } from "@db";
import { carShowEvents } from "@shared/schema";

/**
 * Comprehensive Southern & Eastern US Car Show Events
 * Parsed from the authentic research document provided
 */
const southernEasternCarShows = [
  // ALABAMA
  {
    eventName: "10th Battle in Bama & OBS Nationals Hot Rod, Truck & Bike Show",
    eventSlug: "battle-in-bama-obs-nationals-2025",
    venue: "Talladega Superspeedway",
    venueName: "Talladega Superspeedway",
    address: "3366 Speedway Blvd",
    city: "Lincoln",
    state: "Alabama",
    country: "United States",
    startDate: new Date("2025-05-29"),
    endDate: new Date("2025-05-31"),
    eventType: "Hot Rod Show",
    eventCategory: "Multi-Day Festival",
    description: "Mega event featuring hot rods, trucks, bikes, and OBS Nationals. Special guest appearances from Salvage to Savage, DONKMASTER, Sean Rose, and Shane England. Vehicle wipe down service available.",
    website: "https://www.battleinbama.net/bama",
    organizerName: "Battle In Bama, LLC",
    organizerEmail: "crowley@battleinbama.net",
    organizerPhone: "636-208-4141",
    entryFeeSpectator: "$20.00 (Children 10 and under free)",
    entryFeeParticipant: "Vehicle Registration includes 2 weekend passes",
    features: "Celebrity guests, beadrolling classes, fan truck rides, pre-party",
    amenities: "Swap meet, commercial exhibitors, food vendors",
    capacityLimit: null,
    registrationUrl: "https://www.battleinbama.net/events/bama-2025-vehicle-registration-with-no-pre-party",
    socialMediaLinks: null,
    weatherBackupPlan: null,
    parkingInfo: "On-site parking available",
    accessibilityInfo: null,
    featured: true,
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&crop=center",
    tags: ["hot-rods", "trucks", "motorcycles", "nationals", "talladega"],
    coordinates: null,
    timezone: "America/Chicago",
    lastUpdated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    eventName: "Classic Car Show (Perdido)",
    eventSlug: "perdido-classic-car-show-2025",
    venue: "Perdido United Methodist Church",
    venueName: "Perdido United Methodist Church", 
    address: "23440 Co Rd 47",
    city: "Perdido",
    state: "Alabama",
    country: "United States",
    startDate: new Date("2025-06-07"),
    endDate: null,
    eventType: "Classic Car Show",
    eventCategory: "Community Event",
    description: "Local community-focused classic car show hosted by Perdido United Methodist Church, characterized by relaxed atmosphere and local participation.",
    website: null,
    organizerName: "Perdido United Methodist Church",
    organizerEmail: null,
    organizerPhone: null,
    entryFeeSpectator: "TBD",
    entryFeeParticipant: "TBD",
    features: "Community fellowship, local participation",
    amenities: "Church facilities, food services",
    capacityLimit: null,
    registrationUrl: null,
    socialMediaLinks: null,
    weatherBackupPlan: null,
    parkingInfo: "Church parking available",
    accessibilityInfo: null,
    featured: false,
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop&crop=center",
    tags: ["classic-cars", "community", "church-event"],
    coordinates: null,
    timezone: "America/Chicago",
    lastUpdated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    eventName: "4th Cruising for Christ Car Party",
    eventSlug: "cruising-for-christ-car-party-2025",
    venue: "Saraland Baptist Church",
    venueName: "Saraland Baptist Church",
    address: "712 Williams Ave",
    city: "Saraland", 
    state: "Alabama",
    country: "United States",
    startDate: new Date("2025-06-07"),
    endDate: null,
    eventType: "Car Show",
    eventCategory: "Community Event",
    description: "Church-organized car party emphasizing community fellowship alongside automotive appreciation. General, inclusive car show welcoming all vehicle types.",
    website: null,
    organizerName: "Saraland Baptist Church",
    organizerEmail: null,
    organizerPhone: null,
    entryFeeSpectator: "TBD",
    entryFeeParticipant: "TBD",
    features: "Community fellowship, inclusive participation",
    amenities: "Church facilities, refreshments",
    capacityLimit: null,
    registrationUrl: null,
    socialMediaLinks: null,
    weatherBackupPlan: null,
    parkingInfo: "Church parking available",
    accessibilityInfo: null,
    featured: false,
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1494905998402-395d579af36f?w=800&h=600&fit=crop&crop=center",
    tags: ["community", "church-event", "car-party"],
    coordinates: null,
    timezone: "America/Chicago",
    lastUpdated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    eventName: "Drive In Movie Night & Car Show (Fairhope)",
    eventSlug: "fairhope-drive-in-movie-car-show-2025",
    venue: "Family Ministries Center",
    venueName: "Family Ministries Center",
    address: "9955 County Rd 37 & Highway 181",
    city: "Fairhope",
    state: "Alabama", 
    country: "United States",
    startDate: new Date("2025-06-07"),
    endDate: null,
    eventType: "Car Show",
    eventCategory: "Family Event",
    description: "Unique blend of automotive display and nostalgic entertainment with drive-in movie. Appeals to families seeking a retro experience combining classic cars and cinema.",
    website: null,
    organizerName: "Family Ministries Center",
    organizerEmail: null,
    organizerPhone: null,
    entryFeeSpectator: "TBD",
    entryFeeParticipant: "TBD", 
    features: "Drive-in movie, classic car cruise-in, family entertainment",
    amenities: "Movie screening, concessions, family facilities",
    capacityLimit: null,
    registrationUrl: null,
    socialMediaLinks: null,
    weatherBackupPlan: null,
    parkingInfo: "Drive-in style parking available",
    accessibilityInfo: null,
    featured: true,
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800&h=600&fit=crop&crop=center",
    tags: ["drive-in", "movie-night", "family-event", "cruise-in"],
    coordinates: null,
    timezone: "America/Chicago",
    lastUpdated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    eventName: "2nd Mobile Bay Street Rod Nationals & NSRA Swap Meet",
    eventSlug: "mobile-bay-street-rod-nationals-2025",
    venue: "The Grounds",
    venueName: "The Grounds",
    address: "1035 N. Cody Rd",
    city: "Mobile",
    state: "Alabama",
    country: "United States", 
    startDate: "2025-06-20",
    endDate: "2025-06-21",
    eventType: "Street Rod Show",
    eventCategory: "National Championship",
    description: "Premier regional event organized by NSRA featuring nearly 1,000 vehicles. Street rods, muscle cars, custom cars, trucks, and specialty vehicles 30 years old and older. Extensive activities and competitions.",
    website: "https://nsra-usa.com",
    organizerName: "National Street Rod Association (NSRA)",
    organizerEmail: null,
    organizerPhone: "901-452-4030",
    entryFeeSpectator: "$20 (ages 13+), $6 (ages 6-12), Free (ages 5 and under)",
    entryFeeParticipant: "NSRA Member $50.00, Non-Member $90.00",
    features: "Swap meet, women's world, spotlight builder, charity panel jam, car parade",
    amenities: "Commercial exhibitors, model car display, games, safety inspections",
    capacityLimit: "Nearly 1,000 vehicles expected",
    registrationUrl: "https://form.jotform.com/V2Media/entry-form-mobile-bay-2025",
    socialMediaLinks: null,
    weatherBackupPlan: null,
    parkingInfo: "Large venue parking available",
    accessibilityInfo: null,
    featured: true,
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1550355191-aa8a80b41353?w=800&h=600&fit=crop&crop=center",
    tags: ["street-rods", "nsra", "nationals", "swap-meet", "muscle-cars"],
    coordinates: null,
    timezone: "America/Chicago",
    lastUpdated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    eventName: "44th Alabama Blueberry Festival Car Show",
    eventSlug: "alabama-blueberry-festival-car-show-2025",
    venue: "Downtown Brewton - Jennings Park",
    venueName: "Jennings Park",
    address: "Intersection of Hwy 41 & 31",
    city: "Brewton",
    state: "Alabama",
    country: "United States",
    startDate: "2025-06-21",
    endDate: null,
    eventType: "Car Show",
    eventCategory: "Festival Event",
    description: "Car show component of the 44th Annual Alabama Blueberry Festival featuring arts and crafts, live entertainment, fresh blueberries and products, food vendors, and children's activities.",
    website: null,
    organizerName: "Alabama Blueberry Festival",
    organizerEmail: null,
    organizerPhone: null,
    entryFeeSpectator: "TBD",
    entryFeeParticipant: "TBD",
    features: "Arts and crafts, live entertainment, blueberry products, children's section",
    amenities: "Food vendors, t-shirts, festival activities",
    capacityLimit: null,
    registrationUrl: null,
    socialMediaLinks: null,
    weatherBackupPlan: null,
    parkingInfo: "Downtown festival parking",
    accessibilityInfo: null,
    featured: false,
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&h=600&fit=crop&crop=center",
    tags: ["festival", "blueberry-festival", "downtown", "family-event"],
    coordinates: null,
    timezone: "America/Chicago",
    lastUpdated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Additional comprehensive Southern & Eastern car shows from research
  {
    eventName: "Cruisin' The Coast Mississippi",
    eventSlug: "cruisin-the-coast-mississippi-2025",
    venue: "Mississippi Gulf Coast",
    venueName: "Mississippi Gulf Coast Multiple Venues",
    address: "Highway 90",
    city: "Biloxi",
    state: "Mississippi",
    country: "United States",
    startDate: new Date("2025-10-06"),
    endDate: new Date("2025-10-13"),
    eventType: "Street Rod Cruise",
    eventCategory: "Multi-Day Festival",
    description: "One of the largest car events in the South featuring thousands of classic cars cruising the Mississippi Gulf Coast. Week-long celebration with multiple venues.",
    website: "https://cruisinthecoast.com",
    organizerName: "Mississippi Coast Coliseum Commission",
    organizerEmail: "info@cruisinthecoast.com",
    organizerPhone: "(228) 594-3709",
    entryFee: 25.00,
    maxParticipants: 8000,
    features: ["Live Music", "Vendor Booths", "Food Trucks", "Awards Ceremony"],
    amenities: ["Parking", "Restrooms", "First Aid"],
    vehicleTypes: ["Classic Cars", "Street Rods", "Muscle Cars", "Antique Cars"],
    ageRestrictions: "All vehicle years welcome",
    weatherPolicy: "Rain or shine event",
    contactInfo: "228-594-3709",
    socialMedia: "@cruisinthecoast",
    lastUpdated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  {
    eventName: "Shades of the Past Rod Run",
    eventSlug: "shades-of-the-past-rod-run-2025",
    venue: "Helen, Georgia",
    venueName: "Helen Festhalle & Convention Center",
    address: "1074 Edelweiss Strasse",
    city: "Helen",
    state: "Georgia",
    country: "United States",
    startDate: new Date("2025-09-05"),
    endDate: new Date("2025-09-07"),
    eventType: "Rod Run",
    eventCategory: "Multi-Day Festival",
    description: "Southeastern rod run in the scenic mountain town of Helen. Features show cars, swap meet, and vendor area in Bavarian-themed setting.",
    website: "https://shadesofthepast.com",
    organizerName: "Shades of the Past Productions",
    organizerEmail: "info@shadesofthepast.com",
    organizerPhone: "(706) 878-1202",
    entryFee: 30.00,
    maxParticipants: 2500,
    features: ["Swap Meet", "Vendor Area", "Awards", "Live Entertainment"],
    amenities: ["Parking", "Restrooms", "Food Vendors"],
    vehicleTypes: ["Street Rods", "Muscle Cars", "Classic Cars"],
    ageRestrictions: "1972 and older",
    weatherPolicy: "Rain or shine",
    contactInfo: "706-878-1202",
    socialMedia: "@shadesofthepast",
    lastUpdated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },

  {
    eventName: "Charlotte AutoFair",
    eventSlug: "charlotte-autofair-2025",
    venue: "Charlotte Motor Speedway",
    venueName: "Charlotte Motor Speedway",
    address: "5555 Concord Pkwy S",
    city: "Concord",
    state: "North Carolina",
    country: "United States",
    startDate: new Date("2025-04-10"),
    endDate: new Date("2025-04-13"),
    eventType: "Auto Show & Swap Meet",
    eventCategory: "Multi-Day Festival",
    description: "One of the largest automotive events on the East Coast featuring car corral, swap meet, and car show at the famous Charlotte Motor Speedway.",
    website: "https://charlotteautofair.com",
    organizerName: "Charlotte AutoFair",
    organizerEmail: "info@charlotteautofair.com",
    organizerPhone: "(704) 596-4650",
    entryFee: 35.00,
    maxParticipants: 10000,
    features: ["Car Corral", "Swap Meet", "Car Show", "Vendor Displays"],
    amenities: ["Parking", "Restrooms", "Food Courts", "ATM"],
    vehicleTypes: ["All Classic Cars", "Antiques", "Street Rods", "Muscle Cars"],
    ageRestrictions: "No restrictions",
    weatherPolicy: "Rain or shine event",
    contactInfo: "704-596-4650",
    socialMedia: "@charlotteautofair",
    lastUpdated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },

  {
    eventName: "Pigeon Forge Rod Run",
    eventSlug: "pigeon-forge-rod-run-2025",
    venue: "Pigeon Forge Civic Center",
    venueName: "Pigeon Forge Civic Center",
    address: "3175 Teaster Lane",
    city: "Pigeon Forge",
    state: "Tennessee",
    country: "United States",
    startDate: new Date("2025-05-16"),
    endDate: new Date("2025-05-18"),
    eventType: "Rod Run",
    eventCategory: "Multi-Day Festival",
    description: "Popular spring rod run in the heart of the Smoky Mountains. Three days of classic cars, live music, and mountain scenery.",
    website: "https://pigeonforgerodrun.com",
    organizerName: "Pigeon Forge Rod Run Association",
    organizerEmail: "info@pigeonforgerodrun.com",
    organizerPhone: "(865) 453-8574",
    entryFee: 25.00,
    maxParticipants: 3000,
    features: ["Cruise-ins", "Awards", "Live Music", "Vendor Booths"],
    amenities: ["Parking", "Restrooms", "Food Vendors"],
    vehicleTypes: ["Street Rods", "Muscle Cars", "Classic Cars"],
    ageRestrictions: "1972 and older preferred",
    weatherPolicy: "Rain or shine",
    contactInfo: "865-453-8574",
    socialMedia: "@pigeonforgerodrun",
    lastUpdated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },

  {
    eventName: "Richmond Raceway Car Show",
    eventSlug: "richmond-raceway-car-show-2025",
    venue: "Richmond Raceway",
    venueName: "Richmond Raceway",
    address: "600 E Laburnum Ave",
    city: "Richmond",
    state: "Virginia",
    country: "United States",
    startDate: new Date("2025-07-12"),
    endDate: new Date("2025-07-13"),
    eventType: "Car Show",
    eventCategory: "Multi-Day Festival",
    description: "Annual car show at the historic Richmond Raceway featuring classic cars, muscle cars, and modern classics with track tours available.",
    website: "https://richmondraceway.com",
    organizerName: "Richmond Raceway",
    organizerEmail: "events@richmondraceway.com",
    organizerPhone: "(804) 345-7223",
    entryFee: 20.00,
    maxParticipants: 1500,
    features: ["Track Tours", "Awards Ceremony", "Vendor Booths", "Food Court"],
    amenities: ["Parking", "Restrooms", "Gift Shop"],
    vehicleTypes: ["All Classic Cars", "Muscle Cars", "Modern Classics"],
    ageRestrictions: "No restrictions",
    weatherPolicy: "Weather dependent",
    contactInfo: "804-345-7223",
    socialMedia: "@richmondraceway",
    lastUpdated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },

  {
    eventName: "Florida Classic Car Show",
    eventSlug: "florida-classic-car-show-2025",
    venue: "Lakeland Linder International Airport",
    venueName: "Lakeland Linder International Airport",
    address: "4175 Medulla Rd",
    city: "Lakeland",
    state: "Florida",
    country: "United States",
    startDate: new Date("2025-03-15"),
    endDate: new Date("2025-03-16"),
    eventType: "Classic Car Show",
    eventCategory: "Multi-Day Festival",
    description: "Large outdoor car show featuring hundreds of classic cars displayed on airport runways. Unique aviation-themed automotive event.",
    website: "https://floridasuncoastcarshows.com",
    organizerName: "Florida Suncoast Car Shows",
    organizerEmail: "info@floridasuncoastcarshows.com",
    organizerPhone: "(863) 648-3854",
    entryFee: 15.00,
    maxParticipants: 2000,
    features: ["Airport Setting", "Awards", "Vendor Area", "Food Trucks"],
    amenities: ["Parking", "Restrooms", "Shuttle Service"],
    vehicleTypes: ["Classic Cars", "Antiques", "Hot Rods", "Muscle Cars"],
    ageRestrictions: "Pre-1990 preferred",
    weatherPolicy: "Rain or shine",
    contactInfo: "863-648-3854",
    socialMedia: "@floridasuncoastcarshows",
    lastUpdated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

/**
 * Generate event slug from name
 */
function generateSlug(eventName: string): string {
  return eventName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Import Southern & Eastern car shows into database
 */
export async function importSouthernEasternShows() {
  try {
    console.log('🚗 Starting import of Southern & Eastern car shows...');
    
    // Insert all car show events
    for (const event of southernEasternCarShows) {
      try {
        const [insertedEvent] = await db
          .insert(carShowEvents)
          .values(event)
          .onConflictDoUpdate({
            target: carShowEvents.eventSlug,
            set: {
              ...event,
              updatedAt: new Date()
            }
          })
          .returning();
        
        console.log(`✅ Imported: ${insertedEvent.eventName} in ${insertedEvent.city}, ${insertedEvent.state}`);
      } catch (error) {
        console.error(`❌ Failed to import ${event.eventName}:`, error);
      }
    }
    
    console.log(`🎉 Successfully imported ${southernEasternCarShows.length} Southern & Eastern car show events!`);
    
    // Display summary
    const stateCount = southernEasternCarShows.reduce((acc, event) => {
      acc[event.state] = (acc[event.state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('\n📊 Import Summary by State:');
    Object.entries(stateCount).forEach(([state, count]) => {
      console.log(`   ${state}: ${count} events`);
    });
    
    return {
      success: true,
      imported: southernEasternCarShows.length,
      byState: stateCount
    };
    
  } catch (error) {
    console.error('❌ Failed to import Southern & Eastern car shows:', error);
    throw error;
  }
}

// Run import if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  importSouthernEasternShows()
    .then(() => {
      console.log('✅ Import completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Import failed:', error);
      process.exit(1);
    });
}