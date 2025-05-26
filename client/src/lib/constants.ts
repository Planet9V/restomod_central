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

// Navigation links for header and footer
export const NAV_LINKS = [
  { 
    name: 'Our Projects', 
    href: '/projects',
    isExternal: false,
    description: 'Explore our completed custom builds and restomods'
  },
  { 
    name: 'Process', 
    href: '/#process',
    isExternal: false,
    description: 'Learn how we transform classics into modern masterpieces'
  },
  { 
    name: 'Car Show Events', 
    href: '/car-show-events',
    isExternal: false,
    description: 'Discover premier car shows, auctions, and automotive events nationwide'
  },
  { 
    name: 'About Us', 
    href: '/#about',
    isExternal: false,
    description: 'Meet our team and discover our passion for automotive excellence'
  },
  { 
    name: 'Resources', 
    href: '/resources',
    isExternal: false,
    description: 'Educational articles and guides for restomod enthusiasts'
  },
  { 
    name: 'Archive', 
    href: '/vehicle-archive',
    isExternal: false,
    description: 'Browse our historical collection of classic and custom builds'
  },
  { 
    name: 'Build Your Restomod', 
    href: '/car-configurator',
    isExternal: false,
    description: 'Use our AI-powered tool to create your dream custom build'
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
