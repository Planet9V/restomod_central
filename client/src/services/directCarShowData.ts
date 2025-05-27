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

// Authentic car show events from your research documents
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
  }
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