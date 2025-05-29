// Color constants based on design reference
export const COLORS = {
  charcoal: '#222222',
  offwhite: '#F8F8F8',
  burgundy: '#7D2027',
  gold: '#C9A770',
  steel: '#5D7A94',
  graphite: '#333333',
  silver: '#D0D0D0'
};

// OPTIMIZED NAVIGATION - PREMIUM RESTOMOD BUILDER FOCUS
export const NAV_LINKS = [
  { 
    name: 'Build With Us', 
    href: '/custom-builds',
    isExternal: false,
    description: 'Premium investment-grade restomod services',
    isDropdown: true,
    dropdownItems: [
      { name: 'Custom Build Services', href: '/custom-builds', description: 'Investment-grade restomod tiers' },
      { name: 'AI Configurator', href: '/car-configurator', description: 'Design your dream build' },
      { name: 'Our Process', href: '/#process', description: 'How we transform classics' }
    ]
  },
  { 
    name: 'Portfolio', 
    href: '/projects',
    isExternal: false,
    description: 'See our completed masterpieces',
    isDropdown: true,
    dropdownItems: [
      { name: 'Completed Builds', href: '/projects', description: 'Our project showcase' },
      { name: 'Luxury Showcases', href: '/showcases', description: 'Premium featured builds' }
    ]
  },
  { 
    name: 'Cars for Sale', 
    href: '/gateway-vehicles',
    isExternal: false,
    description: '160+ authenticated classic cars with investment analysis',
    isDropdown: false
  },
  { 
    name: 'Market Intelligence', 
    href: '/market-analysis',
    isExternal: false,
    description: 'Investment data and market insights',
    isDropdown: true,
    dropdownItems: [
      { name: 'Market Analysis', href: '/market-analysis', description: '$77.8B market trends' },
      { name: 'Model Values', href: '/model-values', description: 'ROI projections' },
      { name: 'Investment Vehicles', href: '/gateway-vehicles', description: '160+ classic cars database' }
    ]
  },
  { 
    name: 'Events & Community', 
    href: '/car-show-events',
    isExternal: false,
    description: 'Connect with the classic car world',
    isDropdown: true,
    dropdownItems: [
      { name: 'Car Show Calendar', href: '/car-show-events', description: '203+ nationwide events' },
      { name: 'Research Library', href: '/research-articles', description: '71+ market articles' }
    ]
  },
  { 
    name: 'About', 
    href: '/#about',
    isExternal: false,
    description: 'Our story and team'
  },
  { 
    name: 'Market Insights', 
    href: '/#insights',
    isExternal: false,
    description: 'Industry trends and investment data for the restomod market'
  },
  { 
    name: 'Restomod Valuations', 
    href: '/model-values',
    isExternal: false,
    description: 'Detailed pricing analytics for specific restomod models'
  },
  { 
    name: 'Market Analysis', 
    href: '/market-analysis',
    isExternal: false,
    description: 'Comprehensive data on restomod market growth and investment metrics'
  },
  { 
    name: 'Mustang Guide', 
    href: '/mustang-restomods',
    isExternal: false,
    description: 'Expert guide to Ford Mustang restomod builds and valuations'
  },
  { 
    name: 'Car Show Guide', 
    href: '/car-show-guide',
    isExternal: false,
    description: 'Ultimate guide to finding and researching classic car shows'
  }
];

// Project categories
export const PROJECT_CATEGORIES = [
  { id: 'all', name: 'All Projects' },
  { id: 'american-muscle', name: 'American Muscle' },
  { id: 'european-classics', name: 'European Classics' },
  { id: 'trucks-4x4s', name: 'Trucks & 4x4s' },
  { id: 'in-progress', name: 'In Progress' },
];

// Process steps
export const PROCESS_STEPS = [
  {
    id: 1,
    title: 'Initial Consultation & Vision',
    description: 'We begin with in-depth discussions about your dream vehicle. What inspires you? What level of performance do you desire? How will you use the vehicle? This crucial phase sets the foundation for our design approach.',
    image: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?q=80&w=1600&auto=format&fit=crop',
    alt: 'Initial consultation'
  },
  {
    id: 2,
    title: 'Design & Engineering',
    description: 'Our engineering team creates detailed specifications and 3D models to optimize performance, ergonomics, and aesthetics. We collaborate with you to refine the design until every detail meets our exacting standards.',
    image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=1600&auto=format&fit=crop',
    alt: 'Design and engineering'
  },
  {
    id: 3,
    title: 'Fabrication & Assembly',
    description: 'Our master craftsmen begin the meticulous process of building your vehicle. From chassis modifications to custom bodywork, every component is fabricated or modified with precision and care.',
    image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?q=80&w=1600&auto=format&fit=crop',
    alt: 'Fabrication and assembly'
  },
  {
    id: 4,
    title: 'Finishing & Delivery',
    description: 'After rigorous testing and quality assurance, your vehicle receives its final detailing. We provide comprehensive documentation, maintenance guidance, and a thorough handover to ensure you get the most from your bespoke creation.',
    image: 'https://images.unsplash.com/photo-1601055903647-ddf1ee9701b5?q=80&w=1600&auto=format&fit=crop',
    alt: 'Finishing and delivery'
  }
];

// Engineering features
export const ENGINEERING_FEATURES = [
  {
    id: 'master-craftsmanship',
    title: 'Master Craftsmanship',
    description: 'Decades of hands-on expertise in metal fabrication, bodywork, paint, and interior craftsmanship. Each panel is hand-shaped and fitted with precision that exceeds factory standards.',
    icon: 'Mic'
  },
  {
    id: 'engineering-excellence',
    title: 'Engineering Excellence',
    description: 'Our engineering team provides advanced chassis design, systems integration, and performance optimization using cutting-edge tools and methodologies.',
    icon: 'Settings'
  },
  {
    id: 'collaborative-process',
    title: 'Collaborative Process',
    description: 'Our transparent, client-centered approach combines your vision with our expertise. Regular updates and consultations ensure your dream vehicle evolves exactly as you imagine.',
    icon: 'Users'
  }
];

// Market insights data
export const MARKET_GROWTH_DATA = [
  { year: 2018, value: 100 },
  { year: 2019, value: 115 },
  { year: 2020, value: 132 },
  { year: 2021, value: 152 },
  { year: 2022, value: 175 },
  { year: 2023, value: 201 },
];

export const DEMOGRAPHIC_DATA = [
  { name: 'Baby Boomers', value: 45 },
  { name: 'Gen X', value: 35 },
  { name: 'Millennials', value: 18 },
  { name: 'Gen Z', value: 2 },
];

// Popular platforms
export const POPULAR_PLATFORMS = [
  "1960s-70s American Muscle (Mustang, Camaro, Challenger)",
  "Classic European Sports Cars (Porsche 911, Jaguar E-Type)",
  "Classic 4x4s (Bronco, Land Cruiser, Defender)",
  "1950s American Icons (Bel Air, Thunderbird)",
  "Classic Pickup Trucks (F-100, C10)"
];

// Popular modifications
export const POPULAR_MODIFICATIONS = [
  "Modern fuel-injected engines (LS/LT, Coyote)",
  "Advanced suspension systems (IRS, coilovers)",
  "Modern HVAC and comfort features",
  "Integrated infotainment and connectivity",
  "Upgraded braking systems (Wilwood, Brembo)"
];

// Contact information
export const CONTACT_INFO = {
  address: {
    line1: '1234 Industrial Blvd',
    line2: 'Kansas City, MO 64108',
  },
  phone: '+1 (816) 555-1234',
  email: 'info@skinnysrodandcustom.com',
  hours: [
    { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM' },
    { day: 'Saturday', hours: '10:00 AM - 4:00 PM' },
    { day: 'Sunday', hours: 'Closed' },
  ]
};

// Social media links
export const SOCIAL_LINKS = [
  { name: 'Instagram', url: 'https://instagram.com/' },
  { name: 'Facebook', url: 'https://facebook.com/' },
  { name: 'YouTube', url: 'https://youtube.com/' },
];

// Footer quick links
export const FOOTER_LINKS = [
  {
    title: 'Quick Links',
    links: [
      { name: 'Our Projects', href: '/projects' },
      { name: 'Process', href: '/#process' },
      { name: 'About Us', href: '/#about' },
      { name: 'Resources', href: '/resources' },
      { name: 'Vehicle Archive', href: '/vehicle-archive' },
      { name: 'Build Your Restomod', href: '/car-configurator' },
      { name: 'Insights', href: '/#insights' },
      { name: 'Contact', href: '/#contact' },
    ],
  },
  {
    title: 'Services',
    links: [
      { name: 'Complete Restomod Builds', href: '#' },
      { name: 'Chassis & Suspension Engineering', href: '#' },
      { name: 'Custom Fabrication', href: '#' },
      { name: 'Concourse-Level Restoration', href: '#' },
      { name: 'Maintenance & Service', href: '#' },
    ],
  },
];

// Legal links
export const LEGAL_LINKS = [
  { name: 'Privacy Policy', href: '#' },
  { name: 'Terms of Service', href: '#' },
  { name: 'Cookie Policy', href: '#' },
];
