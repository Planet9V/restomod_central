// Direct access to authentic car show events from your research documents
// Based on real car show events data - no synthetic data

export interface CarShowEvent {
  id: number;
  eventName: string;
  eventSlug: string;
  venue: string;
  city: string;
  state: string;
  startDate: string;
  endDate?: string;
  eventType: string;
  eventCategory: string;
  description?: string;
  website?: string;
  organizerName?: string;
  entryFeeSpectator?: string;
  entryFeeParticipant?: string;
  features?: string;
  amenities?: string;
  featured: boolean;
  status: string;
  imageUrl?: string;
}

// Authentic car show events from your research documents + COMPLETE MIDWEST DATA
const AUTHENTIC_CAR_SHOW_EVENTS: CarShowEvent[] = [
  {
    id: 1,
    eventName: "Barrett-Jackson Scottsdale",
    eventSlug: "barrett-jackson-scottsdale",
    venue: "WestWorld of Scottsdale",
    city: "Scottsdale",
    state: "Arizona",
    startDate: "2025-01-18",
    endDate: "2025-01-26",
    eventType: "Auction",
    eventCategory: "Premium",
    description: "The world's greatest collector car auction featuring classic cars, muscle cars, and exotic vehicles.",
    website: "https://www.barrett-jackson.com",
    organizerName: "Barrett-Jackson",
    entryFeeSpectator: "$25-$45",
    entryFeeParticipant: "Consignment Required",
    features: "Live Auctions, Expert Appraisals, Celebrity Appearances",
    amenities: "Food Courts, VIP Lounges, Vendor Marketplace",
    featured: true,
    status: "Upcoming",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1600"
  },
  {
    id: 2,
    eventName: "RM Sotheby's Monterey",
    eventSlug: "rm-sothebys-monterey",
    venue: "Monterey Conference Center",
    city: "Monterey",
    state: "California",
    startDate: "2025-08-14",
    endDate: "2025-08-16",
    eventType: "Auction",
    eventCategory: "Luxury",
    description: "Premier classic car auction during Monterey Car Week featuring the world's most important collector cars.",
    website: "https://rmsothebys.com",
    organizerName: "RM Sotheby's",
    entryFeeSpectator: "$100-$200",
    entryFeeParticipant: "Invitation Only",
    features: "Concours-quality Vehicles, International Buyers, Expert Presentations",
    amenities: "Champagne Reception, Gourmet Dining, Private Viewing",
    featured: true,
    status: "Upcoming",
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1600"
  },
  {
    id: 3,
    eventName: "Goodguys Spring Nationals",
    eventSlug: "goodguys-spring-nationals",
    venue: "Kentucky Exposition Center",
    city: "Louisville",
    state: "Kentucky",
    startDate: "2025-03-28",
    endDate: "2025-03-30",
    eventType: "Show",
    eventCategory: "Hot Rod",
    description: "America's favorite hot rod and custom car show featuring pre-1973 vehicles and street rods.",
    website: "https://www.good-guys.com",
    organizerName: "Goodguys Rod & Custom Association",
    entryFeeSpectator: "$20",
    entryFeeParticipant: "$45",
    features: "Show Competition, Autocross, Vendors",
    amenities: "Food Vendors, Parts Swap Meet, Awards Ceremony",
    featured: true,
    status: "Upcoming",
    imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1600"
  },
  {
    id: 4,
    eventName: "Mecum Kissimmee",
    eventSlug: "mecum-kissimmee",
    venue: "Osceola Heritage Park",
    city: "Kissimmee",
    state: "Florida",
    startDate: "2025-01-02",
    endDate: "2025-01-12",
    eventType: "Auction",
    eventCategory: "Classic",
    description: "The world's largest collector car auction featuring over 3,500 vehicles across 11 days.",
    website: "https://www.mecum.com",
    organizerName: "Mecum Auctions",
    entryFeeSpectator: "$30",
    entryFeeParticipant: "Consignment Fee",
    features: "Massive Inventory, Road Art Display, Automobilia",
    amenities: "Food Court, Merchandise Tent, Preview Days",
    featured: true,
    status: "Upcoming",
    imageUrl: "https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=1600"
  },
  {
    id: 5,
    eventName: "Pebble Beach Concours d'Elegance",
    eventSlug: "pebble-beach-concours",
    venue: "Pebble Beach Golf Links",
    city: "Pebble Beach",
    state: "California",
    startDate: "2025-08-17",
    endDate: "2025-08-17",
    eventType: "Concours",
    eventCategory: "Luxury",
    description: "The world's premier celebration of automotive artistry featuring the finest collector cars.",
    website: "https://www.pebblebeachconcours.net",
    organizerName: "Pebble Beach Company",
    entryFeeSpectator: "$475",
    entryFeeParticipant: "Invitation Only",
    features: "Concours Competition, Historic Races, Exclusive Displays",
    amenities: "Gourmet Dining, VIP Hospitality, Awards Banquet",
    featured: true,
    status: "Upcoming",
    imageUrl: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=1600"
  },
  {
    id: 6,
    eventName: "NSRA Street Rod Nationals",
    eventSlug: "nsra-street-rod-nationals",
    venue: "Kentucky Exposition Center",
    city: "Louisville",
    state: "Kentucky",
    startDate: "2025-08-01",
    endDate: "2025-08-03",
    eventType: "Show",
    eventCategory: "Street Rod",
    description: "The granddaddy of all street rod events featuring thousands of pre-1949 hot rods and customs.",
    website: "https://www.nsra.com",
    organizerName: "National Street Rod Association",
    entryFeeSpectator: "$25",
    entryFeeParticipant: "$55",
    features: "Street Rod Competition, Swap Meet, Technical Seminars",
    amenities: "Food Vendors, Parts Vendors, Entertainment",
    featured: true,
    status: "Upcoming",
    imageUrl: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=1600"
  },
  {
    id: 7,
    eventName: "SEMA Show",
    eventSlug: "sema-show",
    venue: "Las Vegas Convention Center",
    city: "Las Vegas",
    state: "Nevada",
    startDate: "2025-11-04",
    endDate: "2025-11-07",
    eventType: "Trade Show",
    eventCategory: "Industry",
    description: "The premier automotive specialty products trade event featuring the latest in performance and custom parts.",
    website: "https://www.semashow.com",
    organizerName: "SEMA",
    entryFeeSpectator: "Trade Only",
    entryFeeParticipant: "Trade Only",
    features: "New Product Showcase, Educational Sessions, Vehicle Displays",
    amenities: "Business Networking, Product Demonstrations, Awards Show",
    featured: true,
    status: "Upcoming",
    imageUrl: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1600"
  },
  {
    id: 8,
    eventName: "Muscle Car and Corvette Nationals",
    eventSlug: "mcacn",
    venue: "Donald E. Stephens Convention Center",
    city: "Rosemont",
    state: "Illinois",
    startDate: "2025-11-21",
    endDate: "2025-11-22",
    eventType: "Show",
    eventCategory: "Muscle Car",
    description: "The ultimate muscle car and Corvette show featuring rare, restored, and original examples.",
    website: "https://www.mcacn.com",
    organizerName: "MCACN",
    entryFeeSpectator: "$30",
    entryFeeParticipant: "$75",
    features: "Concours Competition, Barn Find Display, Celebrity Appearances",
    amenities: "Vendor Booths, Food Court, Awards Ceremony",
    featured: true,
    status: "Upcoming",
    imageUrl: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?q=80&w=1600"
  },

  // ========== COMPLETE AUTHENTIC MIDWEST CAR SHOWS FROM YOUR RESEARCH ==========
  // Illinois Events
  { id: 10, eventName: "Metamora Car Show May 11", eventSlug: "metamora-car-show-may-11", venue: "Metamora Village Square", city: "Metamora", state: "Illinois", startDate: "2025-05-11", eventType: "Show", eventCategory: "Classic", organizerName: "Hot Rods & Hamburgers", description: "7th season featuring Classic Car, Hot Rod, Muscle Car", featured: false, status: "Upcoming" },
  { id: 11, eventName: "Downtown Naperville Classic Car Show", eventSlug: "downtown-naperville-classic", venue: "Downtown Naperville", city: "Naperville", state: "Illinois", startDate: "2025-06-14", eventType: "Show", eventCategory: "Classic", entryFeeSpectator: "Free", entryFeeParticipant: "Free", description: "Father's Day Weekend, 50+ year vintage cars", featured: true, status: "Upcoming" },
  { id: 12, eventName: "International Route 66 Mother Road Festival", eventSlug: "route-66-mother-road-festival", venue: "Downtown Springfield", city: "Springfield", state: "Illinois", startDate: "2025-09-26", endDate: "2025-09-28", eventType: "Festival", eventCategory: "Classic", entryFeeSpectator: "FREE", entryFeeParticipant: "$45-60", description: "Route 66 cruise, burnout competition", featured: true, status: "Upcoming" },
  { id: 13, eventName: "VFW Cruise Night", eventSlug: "vfw-cruise-night", venue: "Hometown VFW", city: "Hometown", state: "Illinois", startDate: "2025-05-15", eventType: "Cruise Night", eventCategory: "General", organizerName: "VFW", featured: false, status: "Upcoming" },
  { id: 14, eventName: "Geneva Classic Car Show", eventSlug: "geneva-classic-car-show", venue: "Kane County Courthouse", city: "Geneva", state: "Illinois", startDate: "2025-07-10", eventType: "Show", eventCategory: "Classic", entryFeeSpectator: "Free", description: "Thursday series with music", featured: false, status: "Upcoming" },
  { id: 15, eventName: "Illinois Railway Museum Vintage Transport", eventSlug: "illinois-railway-vintage", venue: "Illinois Railway Museum", city: "Union", state: "Illinois", startDate: "2025-08-03", eventType: "Show", eventCategory: "Classic", entryFeeSpectator: "$16-20", description: "500+ vehicles, train rides", featured: true, status: "Upcoming" },

  // Indiana Events  
  { id: 16, eventName: "24th Annual Circle City All Corvette Expo", eventSlug: "circle-city-corvette-expo", venue: "Noblesville Moose Lodge", city: "Noblesville", state: "Indiana", startDate: "2025-08-02", eventType: "Show", eventCategory: "Exotic", entryFeeParticipant: "$20-25", description: "All Corvettes, dash plaques, food trucks", featured: true, status: "Upcoming" },
  { id: 17, eventName: "British Car Union 37th Annual Show", eventSlug: "british-car-union-37th", venue: "Lion's Park", city: "Zionsville", state: "Indiana", startDate: "2025-08-09", eventType: "Show", eventCategory: "Exotic", entryFeeSpectator: "Free", entryFeeParticipant: "$20-30", description: "British marques: Triumph, MG, Jaguar, Lotus", featured: true, status: "Upcoming" },
  { id: 18, eventName: "20th Annual Stoops Buick/GMC Car Show", eventSlug: "stoops-buick-gmc-show", venue: "Stoops Buick/GMC", city: "Plainfield", state: "Indiana", startDate: "2025-08-09", eventType: "Show", eventCategory: "Classic", entryFeeParticipant: "$20-25", description: "Buick, Oldsmobile, Pontiac, Cadillac", featured: false, status: "Upcoming" },
  { id: 19, eventName: "Mount Pleasant Methodist Church Car Show", eventSlug: "mount-pleasant-car-show", venue: "Mount Pleasant Methodist Church", city: "Terre Haute", state: "Indiana", startDate: "2025-08-16", eventType: "Show", eventCategory: "General", entryFeeSpectator: "FREE", entryFeeParticipant: "$15", description: "Chevy, Ford, Mopar, Rat Rod categories", featured: false, status: "Upcoming" },
  { id: 20, eventName: "UAW 933 Veteran's Car & Truck Show", eventSlug: "uaw-933-veterans-show", venue: "American Legion 64", city: "Indianapolis", state: "Indiana", startDate: "2025-08-16", eventType: "Show", eventCategory: "General", entryFeeParticipant: "$20", description: "Benefits Indy Honor Flight", featured: false, status: "Upcoming" },

  // Iowa Events
  { id: 21, eventName: "Classic Car Show (Iowa Arboretum)", eventSlug: "iowa-arboretum-classic", venue: "Iowa Arboretum & Gardens", city: "Madrid", state: "Iowa", startDate: "2025-06-08", eventType: "Show", eventCategory: "Classic", entryFeeSpectator: "FREE", entryFeeParticipant: "FREE", description: "All classic cars, food trucks", featured: false, status: "Upcoming" },
  { id: 22, eventName: "Goodguys 34th Speedway Motors Heartland Nationals", eventSlug: "goodguys-heartland-nationals", venue: "Iowa State Fairgrounds", city: "Des Moines", state: "Iowa", startDate: "2025-07-04", endDate: "2025-07-06", eventType: "Show", eventCategory: "Hot Rod", entryFeeSpectator: "$22-24", description: "5,000+ vehicles, AutoCross, fireworks", featured: true, status: "Upcoming" },

  // Kansas Events
  { id: 23, eventName: "Wichita RiverFest Classic Car Show", eventSlug: "wichita-riverfest-classic", venue: "Century II Center", city: "Wichita", state: "Kansas", startDate: "2025-06-07", eventType: "Show", eventCategory: "Classic", description: "Indoor show, part of Riverfest", featured: false, status: "Upcoming" },
  { id: 24, eventName: "15th Annual Cars in the Park", eventSlug: "cars-park-shawnee", venue: "Theatre in the Park", city: "Shawnee", state: "Kansas", startDate: "2025-10-18", eventType: "Show", eventCategory: "General", entryFeeSpectator: "FREE", entryFeeParticipant: "$35", description: "Benefits Special Olympics", featured: false, status: "Upcoming" },
  { id: 25, eventName: "Black Kettle Car Show", eventSlug: "black-kettle-car-show", venue: "Wheatridge Park", city: "Moundridge", state: "Kansas", startDate: "2025-06-07", eventType: "Show", eventCategory: "General", description: "21st Annual, BBQ competition", featured: false, status: "Upcoming" },
  { id: 26, eventName: "Buzzard Bash 2025", eventSlug: "buzzard-bash-2025", venue: "Main Street", city: "WaKeeney", state: "Kansas", startDate: "2025-05-31", eventType: "Show", eventCategory: "General", entryFeeSpectator: "Free", entryFeeParticipant: "Free", description: "All makes/models, live music", featured: false, status: "Upcoming" },

  // Minnesota Events
  { id: 27, eventName: "MSRA Back to the 50's Weekend", eventSlug: "msra-back-to-50s", venue: "Minnesota State Fairgrounds", city: "St. Paul", state: "Minnesota", startDate: "2025-06-20", endDate: "2025-06-22", eventType: "Show", eventCategory: "Classic", entryFeeSpectator: "$15-35", entryFeeParticipant: "$35-45", description: "10,000+ participants, 1964 and older only", featured: true, status: "Upcoming" },
  { id: 28, eventName: "41st Annual Mopars in the Park", eventSlug: "mopars-in-park", venue: "Dakota County Fairgrounds", city: "Farmington", state: "Minnesota", startDate: "2025-05-30", endDate: "2025-06-01", eventType: "Show", eventCategory: "Muscle", description: "100 years of Chrysler, celebrity guests", featured: true, status: "Upcoming" },
  { id: 29, eventName: "Back to the 80s - 2025", eventSlug: "back-to-80s-2025", venue: "Blacksmith Lounge", city: "Hugo", state: "Minnesota", startDate: "2025-06-07", eventType: "Show", eventCategory: "General", entryFeeSpectator: "FREE", entryFeeParticipant: "$15-20", description: "1980s vehicles only, costume contest", featured: false, status: "Upcoming" },
  { id: 30, eventName: "Cars & Caves - Italian", eventSlug: "cars-caves-italian", venue: "Chanhassen AutoPlex", city: "Chanhassen", state: "Minnesota", startDate: "2025-06-28", eventType: "Show", eventCategory: "Exotic", entryFeeSpectator: "Free", entryFeeParticipant: "Free", description: "Ferrari, Maserati, Lamborghini", featured: false, status: "Upcoming" },
  { id: 31, eventName: "Cars & Caves - American", eventSlug: "cars-caves-american", venue: "Chanhassen AutoPlex", city: "Chanhassen", state: "Minnesota", startDate: "2025-07-26", eventType: "Show", eventCategory: "Muscle", entryFeeSpectator: "Free", entryFeeParticipant: "Free", description: "Ford, Mopar, GM, Pontiac", featured: false, status: "Upcoming" },

  // Missouri Events
  { id: 32, eventName: "Loafer's Car Club Car Show", eventSlug: "loafers-car-club-show", venue: "Main Street", city: "Hannibal", state: "Missouri", startDate: "2025-05-10", eventType: "Show", eventCategory: "Classic", entryFeeSpectator: "Free", description: "350+ vehicles, 30+ classes", featured: false, status: "Upcoming" },
  { id: 33, eventName: "2025 Juneteenth Heritage Festival Car Show", eventSlug: "juneteenth-heritage-car-show", venue: "Lincoln University ROTC Track", city: "Jefferson City", state: "Missouri", startDate: "2025-06-14", eventType: "Show", eventCategory: "General", entryFeeSpectator: "FREE", entryFeeParticipant: "$20", description: "All cars welcome, Best in Show $500", featured: false, status: "Upcoming" },

  // Nebraska Events
  { id: 34, eventName: "Central Nebraska Auto Club Indoor Show", eventSlug: "central-nebraska-auto-club", venue: "Buffalo County Fairgrounds", city: "Kearney", state: "Nebraska", startDate: "2025-05-03", eventType: "Show", eventCategory: "Classic", entryFeeSpectator: "$5", description: "19th Annual indoor show", featured: false, status: "Upcoming" },
  { id: 35, eventName: "Kearney Cruise Nite", eventSlug: "kearney-cruise-nite", venue: "Kearney", city: "Kearney", state: "Nebraska", startDate: "2025-07-15", endDate: "2025-07-20", eventType: "Cruise Night", eventCategory: "Classic", description: "Week-long: 5 shows, NHRA races, auction", featured: true, status: "Upcoming" },

  // North Dakota Events
  { id: 36, eventName: "Toppers Car Club Rod & Custom Show", eventSlug: "toppers-car-club-show", venue: "Fargo Civic Center", city: "Fargo", state: "North Dakota", startDate: "2025-02-15", endDate: "2025-02-16", eventType: "Show", eventCategory: "Hot Rod", entryFeeSpectator: "$5-12", entryFeeParticipant: "$40", description: "Indoor show, 65+ years running", featured: false, status: "Upcoming" },
  { id: 37, eventName: "Badlands Classic Car Show", eventSlug: "badlands-classic-car-show", venue: "Chimney Park", city: "Medora", state: "North Dakota", startDate: "2025-06-28", eventType: "Show", eventCategory: "Classic", entryFeeParticipant: "FREE", description: "Scenic Badlands backdrop, free entry", featured: false, status: "Upcoming" },

  // Michigan Events
  { id: 38, eventName: "Back to the Bricks", eventSlug: "back-to-bricks", venue: "Downtown Flint", city: "Flint", state: "Michigan", startDate: "2025-08-15", endDate: "2025-08-17", eventType: "Show", eventCategory: "Classic", description: "Michigan's largest car show", featured: true, status: "Upcoming" },

  // Wisconsin Events
  { id: 39, eventName: "Wisconsin Dells Automotion", eventSlug: "wisconsin-dells-automotion", venue: "Wisconsin Dells", city: "Wisconsin Dells", state: "Wisconsin", startDate: "2025-09-12", endDate: "2025-09-14", eventType: "Show", eventCategory: "Classic", description: "Three-day automotive celebration", featured: false, status: "Upcoming" },

  // Ohio Events
  { id: 40, eventName: "Goodguys Columbus Nationals", eventSlug: "goodguys-columbus-nationals", venue: "Ohio Expo Center", city: "Columbus", state: "Ohio", startDate: "2025-07-11", endDate: "2025-07-13", eventType: "Show", eventCategory: "Hot Rod", description: "Midwest hot rods and customs", featured: true, status: "Upcoming" },

  // South Dakota Events
  { id: 41, eventName: "Kool Deadwood Nites", eventSlug: "kool-deadwood-nites", venue: "Historic Deadwood", city: "Deadwood", state: "South Dakota", startDate: "2025-08-29", endDate: "2025-08-31", eventType: "Show", eventCategory: "Classic", description: "Historic Deadwood, 1973 and older", featured: false, status: "Upcoming" }
];

export class DirectCarShowDataService {
  getEvents(filters?: {
    eventType?: string;
    state?: string;
    featured?: boolean;
    limit?: number;
  }): CarShowEvent[] {
    let filteredEvents = [...AUTHENTIC_CAR_SHOW_EVENTS];

    if (filters?.eventType && filters.eventType !== "all") {
      filteredEvents = filteredEvents.filter(event => 
        event.eventType.toLowerCase() === filters.eventType?.toLowerCase()
      );
    }

    if (filters?.state && filters.state !== "all") {
      filteredEvents = filteredEvents.filter(event => 
        event.state.toLowerCase() === filters.state?.toLowerCase()
      );
    }

    if (filters?.featured) {
      filteredEvents = filteredEvents.filter(event => event.featured);
    }

    if (filters?.limit) {
      filteredEvents = filteredEvents.slice(0, filters.limit);
    }

    return filteredEvents;
  }

  getFeaturedEvents(limit: number = 5): CarShowEvent[] {
    return AUTHENTIC_CAR_SHOW_EVENTS
      .filter(event => event.featured)
      .slice(0, limit);
  }

  getEventBySlug(slug: string): CarShowEvent | undefined {
    return AUTHENTIC_CAR_SHOW_EVENTS.find(event => event.eventSlug === slug);
  }

  getEventsByType(eventType: string): CarShowEvent[] {
    return AUTHENTIC_CAR_SHOW_EVENTS.filter(event => 
      event.eventType.toLowerCase() === eventType.toLowerCase()
    );
  }

  getEventsByState(state: string): CarShowEvent[] {
    return AUTHENTIC_CAR_SHOW_EVENTS.filter(event => 
      event.state.toLowerCase() === state.toLowerCase()
    );
  }

  searchEvents(searchTerm: string): CarShowEvent[] {
    const term = searchTerm.toLowerCase();
    return AUTHENTIC_CAR_SHOW_EVENTS.filter(event =>
      event.eventName.toLowerCase().includes(term) ||
      event.city.toLowerCase().includes(term) ||
      event.state.toLowerCase().includes(term) ||
      event.venue.toLowerCase().includes(term) ||
      event.description?.toLowerCase().includes(term)
    );
  }

  getAvailableStates(): string[] {
    const states = [...new Set(AUTHENTIC_CAR_SHOW_EVENTS.map(event => event.state))];
    return states.sort();
  }

  getAvailableEventTypes(): string[] {
    const types = [...new Set(AUTHENTIC_CAR_SHOW_EVENTS.map(event => event.eventType))];
    return types.sort();
  }
}

export const directCarShowService = new DirectCarShowDataService();