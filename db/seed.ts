import { db } from "./index";
import * as schema from "@shared/schema";

async function seed() {
  try {
    console.log("Seeding database...");
    
    // Hero content
    console.log("Creating hero content...");
    await db.insert(schema.heroContent).values({
      title: "Engineering Meets Artistry",
      subtitle: "Meticulously crafted restomods that combine precision engineering with concourse-level aesthetics. The perfect fusion of classic soul and modern performance.",
      imageUrl: "https://images.unsplash.com/photo-1611566026373-c6c8da0945b8?q=80&w=2000&auto=format&fit=crop"
    });

    // Projects
    console.log("Creating projects...");
    await db.insert(schema.projects).values([
      {
        title: "1967 Mustang Fastback",
        subtitle: "The perfect blend of iconic styling with contemporary performance and comfort.",
        slug: "1967-mustang-fastback",
        description: "This 1967 Mustang Fastback represents the pinnacle of our engineering-meets-artistry approach. Every aspect of this vehicle has been meticulously reimagined while preserving the soul and character of the original design.",
        category: "american-muscle",
        imageUrl: "https://images.unsplash.com/photo-1588127333419-b9d7de223dcf?q=80&w=1600&auto=format&fit=crop",
        galleryImages: [
          "https://images.unsplash.com/photo-1588127333419-b9d7de223dcf?q=80&w=1600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1583267746897-2cf66319ef97?q=80&w=1600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1611566026373-c6c8da0945b8?q=80&w=1600&auto=format&fit=crop"
        ],
        specs: {
          performance: "435 HP Coyote V8",
          transmission: "6-Speed Manual",
          suspension: "Custom Engineered IRS",
          buildTime: "2,400 Hours",
          brakes: "Wilwood 6-piston front, 4-piston rear",
          wheels: "18-inch custom forged aluminum"
        },
        features: [
          "Modern fuel injection system with custom ECU tuning",
          "Climate control system with vintage-look controls",
          "Custom leather interior with period-correct styling",
          "Modern audio system with smartphone connectivity",
          "Power steering and brakes",
          "LED lighting with original appearance"
        ],
        clientQuote: "The attention to detail and engineering excellence exceeded all expectations. It's the perfect blend of classic style and modern performance.",
        clientName: "Robert Maxwell",
        clientLocation: "Portland, Oregon",
        featured: true
      },
      {
        title: "1969 Chevrolet Camaro",
        subtitle: "Pro-Touring | 650HP LS7",
        slug: "1969-chevrolet-camaro",
        description: "Our 1969 Camaro restomod combines aggressive styling with modern LS7 power for an unmatched driving experience. This pro-touring build features a completely redesigned chassis and suspension system for exceptional handling.",
        category: "american-muscle",
        imageUrl: "https://images.unsplash.com/photo-1583267746897-2cf66319ef97?q=80&w=1600&auto=format&fit=crop",
        galleryImages: [
          "https://images.unsplash.com/photo-1583267746897-2cf66319ef97?q=80&w=1600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1583267746897-2cf66319ef97?q=80&w=1600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1583267746897-2cf66319ef97?q=80&w=1600&auto=format&fit=crop"
        ],
        specs: {
          performance: "650 HP LS7 V8",
          transmission: "T56 Magnum 6-Speed",
          suspension: "Detroit Speed Full Chassis",
          buildTime: "3,100 Hours",
          brakes: "Baer 6-piston all around",
          wheels: "19-inch Forgeline DE3C"
        },
        features: [
          "Custom fabricated wide-body panels",
          "Performance-tuned LS7 with custom headers",
          "Fully integrated rollcage",
          "Track-ready suspension with adjustable coilovers",
          "Custom interior with Recaro seats",
          "Modern electronics with digital gauge display"
        ],
        clientQuote: "It drives like a modern sports car but has all the character and presence of a classic Camaro. Absolutely stunning work.",
        clientName: "Michael Chen",
        clientLocation: "San Francisco, California",
        featured: false
      },
      {
        title: "1965 Porsche 911",
        subtitle: "Singer-Inspired | 3.8L Flat-Six",
        slug: "1965-porsche-911",
        description: "This 1965 Porsche 911 restomod pays homage to the iconic design while incorporating modern performance and reliability upgrades. Inspired by Singer's meticulous attention to detail, every component has been thoughtfully enhanced.",
        category: "european-classics",
        imageUrl: "https://images.unsplash.com/photo-1591293836027-e05b48473b67?q=80&w=1600&auto=format&fit=crop",
        galleryImages: [
          "https://images.unsplash.com/photo-1591293836027-e05b48473b67?q=80&w=1600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1591293836027-e05b48473b67?q=80&w=1600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1591293836027-e05b48473b67?q=80&w=1600&auto=format&fit=crop"
        ],
        specs: {
          performance: "3.8L Flat-Six, 350HP",
          transmission: "915 5-Speed Manual",
          suspension: "KW Variant 3 Coilovers",
          buildTime: "2,800 Hours",
          brakes: "Brembo GT System",
          wheels: "Fuchs-style 17-inch forged"
        },
        features: [
          "Hand-stitched leather interior with Recaro seats",
          "Modern fuel injection with custom engine mapping",
          "Lightweight carbon fiber body panels",
          "Air conditioning integrated into original vents",
          "Bluetooth-enabled audio with hidden speakers",
          "LED lighting throughout"
        ],
        clientQuote: "The team delivered a 911 that maintains the soul of the original while offering modern reliability and performance. It's simply perfect.",
        clientName: "Thomas Weber",
        clientLocation: "Seattle, Washington",
        featured: false
      },
      {
        title: "1970 Ford Bronco",
        subtitle: "Luxury 4x4 | 5.0 Coyote V8",
        slug: "1970-ford-bronco",
        description: "Our 1970 Ford Bronco build combines rugged off-road capability with refined luxury. Powered by a modern 5.0 Coyote V8, this Bronco delivers exceptional performance both on and off the road.",
        category: "trucks-4x4s",
        imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1600&auto=format&fit=crop",
        galleryImages: [
          "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1600&auto=format&fit=crop"
        ],
        specs: {
          performance: "5.0L Coyote V8, 435HP",
          transmission: "6R80 6-Speed Auto",
          suspension: "Custom 4-link with Fox coilovers",
          buildTime: "2,100 Hours",
          brakes: "Wilwood 4-piston disc brakes",
          wheels: "17-inch Method beadlock-capable"
        },
        features: [
          "Marine-grade leather interior with heated seats",
          "Full roll cage integrated into the design",
          "Modern HVAC system for all-weather comfort",
          "Premium sound system with waterproof components",
          "LED lighting package with off-road light bar",
          "Electric-actuated steps and roof"
        ],
        clientQuote: "I can drive this Bronco to a black-tie event or take it deep into the mountains. It's the perfect combination of luxury and capability.",
        clientName: "Jennifer Harmon",
        clientLocation: "Austin, Texas",
        featured: false
      },
      {
        title: "1957 Chevrolet Bel Air",
        subtitle: "Classic Cruiser | Supercharged LT4",
        slug: "1957-chevrolet-bel-air",
        description: "This 1957 Chevrolet Bel Air combines iconic 50s styling with modern supercharged performance. Every detail has been meticulously crafted to create a show-quality build that's also a joy to drive.",
        category: "american-muscle",
        imageUrl: "https://images.unsplash.com/photo-1603386329225-868361163bbe?q=80&w=1600&auto=format&fit=crop",
        galleryImages: [
          "https://images.unsplash.com/photo-1603386329225-868361163bbe?q=80&w=1600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1603386329225-868361163bbe?q=80&w=1600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1603386329225-868361163bbe?q=80&w=1600&auto=format&fit=crop"
        ],
        specs: {
          performance: "Supercharged LT4, 650HP",
          transmission: "4L80E 4-Speed Auto",
          suspension: "Art Morrison GT Sport chassis",
          buildTime: "3,400 Hours",
          brakes: "Wilwood 6-piston front, 4-piston rear",
          wheels: "18-inch custom billet aluminum"
        },
        features: [
          "Custom interior with period-correct styling",
          "Modern air conditioning and heating",
          "Power windows, doors, and trunk",
          "Hidden touchscreen entertainment system",
          "LED lighting with original appearance",
          "Custom-fabricated dashboard and console"
        ],
        clientQuote: "The team managed to preserve the soul of this American icon while making it drive like a modern car. The craftsmanship is second to none.",
        clientName: "Richard Thompson",
        clientLocation: "Dallas, Texas",
        featured: false
      },
      {
        title: "1965 Shelby Cobra",
        subtitle: "Modern Replica | 427 Windsor",
        slug: "1965-shelby-cobra",
        description: "Our Shelby Cobra build features a hand-crafted aluminum body and a powerful 427 Windsor engine. This lightweight performance machine delivers an authentic Cobra experience with modern reliability.",
        category: "american-muscle",
        imageUrl: "https://images.unsplash.com/photo-1611566026373-c6c8da0945b8?q=80&w=1600&auto=format&fit=crop",
        galleryImages: [
          "https://images.unsplash.com/photo-1611566026373-c6c8da0945b8?q=80&w=1600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1611566026373-c6c8da0945b8?q=80&w=1600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1611566026373-c6c8da0945b8?q=80&w=1600&auto=format&fit=crop"
        ],
        specs: {
          performance: "427 Windsor V8, 550HP",
          transmission: "Tremec TKO600 5-Speed",
          suspension: "Independent front/rear",
          buildTime: "2,600 Hours",
          brakes: "Wilwood 4-piston disc brakes",
          wheels: "17-inch Halibrand-style"
        },
        features: [
          "Hand-formed aluminum body",
          "Custom leather interior",
          "Period-correct gauges with modern internals",
          "Fuel injection disguised as carburetors",
          "Integrated roll bar",
          "Modern chassis with classic handling"
        ],
        clientQuote: "The raw power and authentic feel of this Cobra is incredible. It's everything I dreamed of and more.",
        clientName: "David Kawecki",
        clientLocation: "Chicago, Illinois",
        featured: false
      },
      {
        title: "1972 Datsun 240Z",
        subtitle: "JDM Legend | RB26 Turbo",
        slug: "1972-datsun-240z",
        description: "This 1972 Datsun 240Z has been reimagined with a modern RB26 turbocharged engine while maintaining its iconic styling. The result is a perfect blend of classic JDM aesthetics and contemporary performance.",
        category: "european-classics",
        imageUrl: "https://images.unsplash.com/photo-1547245324-d529cde1c833?q=80&w=1600&auto=format&fit=crop",
        galleryImages: [
          "https://images.unsplash.com/photo-1547245324-d529cde1c833?q=80&w=1600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1547245324-d529cde1c833?q=80&w=1600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1547245324-d529cde1c833?q=80&w=1600&auto=format&fit=crop"
        ],
        specs: {
          performance: "RB26DETT Turbo, 500HP",
          transmission: "6-Speed Manual",
          suspension: "Adjustable coilovers",
          buildTime: "2,300 Hours",
          brakes: "Wilwood 4-piston front/rear",
          wheels: "18-inch Watanabe-style forged"
        },
        features: [
          "Custom flared fenders",
          "Carbon fiber hood and deck lid",
          "Modern interior with vintage styling",
          "Digital gauges in classic housing",
          "Custom fabricated exhaust system",
          "Modern chassis bracing and reinforcement"
        ],
        clientQuote: "They've perfectly captured the essence of the Z while making it perform beyond my expectations. A true driver's car.",
        clientName: "Alex Tanaka",
        clientLocation: "Los Angeles, California",
        featured: false
      },
      {
        title: "1969 Ford Mustang Mach 1",
        subtitle: "In Progress | 5.0 Coyote Swap",
        slug: "1969-ford-mustang-mach-1",
        description: "This 1969 Ford Mustang Mach 1 is currently being transformed with a modern 5.0 Coyote engine and completely redesigned suspension system. Follow along as we document the build process.",
        category: "in-progress",
        imageUrl: "https://images.unsplash.com/photo-1603386329225-868361163bbe?q=80&w=1600&auto=format&fit=crop",
        galleryImages: [
          "https://images.unsplash.com/photo-1603386329225-868361163bbe?q=80&w=1600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1603386329225-868361163bbe?q=80&w=1600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1603386329225-868361163bbe?q=80&w=1600&auto=format&fit=crop"
        ],
        specs: {
          performance: "5.0L Coyote V8, 460HP (est.)",
          transmission: "Tremec T56 Magnum",
          suspension: "Detroit Speed AlumaSport",
          buildTime: "1,200 Hours (in progress)",
          brakes: "Baer 6S 14-inch front, 13-inch rear",
          wheels: "18-inch American Racing VN511"
        },
        features: [
          "Complete chassis reinforcement",
          "Custom interior in progress",
          "Modern wiring harness installation",
          "Vintage Air climate control",
          "Dakota Digital gauges",
          "Wilwood pedal assembly"
        ],
        clientQuote: "Watching this car come together has been incredible. The team's attention to detail is impressive.",
        clientName: "Brian Miller",
        clientLocation: "Denver, Colorado",
        featured: false
      }
    ]);

    // Testimonials
    console.log("Creating testimonials...");
    await db.insert(schema.testimonials).values([
      {
        quote: "The attention to detail and engineering excellence that McKenney & Skinny's put into my '67 Mustang exceeded all expectations. It's the perfect blend of classic style and modern performance.",
        authorName: "Robert Maxwell",
        authorLocation: "Portland, Oregon",
        authorImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop"
      },
      {
        quote: "After researching numerous builders, I chose McKenney & Skinny's for their transparent process and engineering-first approach. They transformed my Bronco into the perfect weekend adventure vehicle.",
        authorName: "Jennifer Harmon",
        authorLocation: "Austin, Texas",
        authorImage: "https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?q=80&w=200&auto=format&fit=crop"
      },
      {
        quote: "The level of communication and collaboration throughout the build was exceptional. They made my vision for a modern classic Porsche 911 a reality, with performance that rivals modern sports cars.",
        authorName: "David Kawecki",
        authorLocation: "Chicago, Illinois",
        authorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"
      }
    ]);

    // Team members
    console.log("Creating team members...");
    await db.insert(schema.teamMembers).values([
      {
        name: "James McKenney",
        position: "Founder & Engineering Director",
        image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=300&auto=format&fit=crop",
        bio: "Mechanical engineer with a passion for automotive design and over 20 years of experience in systems integration and performance optimization.",
        order: 1
      },
      {
        name: "Dave \"Skinny\" Johnson",
        position: "Founder & Master Builder",
        image: "https://images.unsplash.com/photo-1566753323558-f4e0952af115?q=80&w=300&auto=format&fit=crop",
        bio: "With over 25 years in the hot rod and custom car industry, Skinny has built a reputation for exceptional craftsmanship and attention to detail.",
        order: 2
      },
      {
        name: "Sarah Chen",
        position: "Systems Engineering Lead",
        image: "https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=300&auto=format&fit=crop",
        bio: "Automotive systems specialist with expertise in integrating modern technology with classic vehicles. Leads our electrical and electronic systems team.",
        order: 3
      },
      {
        name: "Mike Reyes",
        position: "Master Fabricator",
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop",
        bio: "Metal fabrication artist with 15 years of experience creating custom panels, brackets, and components. Specializes in aluminum and stainless steel work.",
        order: 4
      }
    ]);

    // Companies
    console.log("Creating companies...");
    await db.insert(schema.companies).values([
      {
        name: "McKenney Engineering & Design",
        description: [
          "Founded by James McKenney, a mechanical engineer with a passion for automotive design, McKenney Engineering brings rigorous engineering principles to classic vehicle design.",
          "Their expertise in systems integration, performance optimization, and advanced CAD/CAM techniques ensures every vehicle performs as good as it looks."
        ],
        image: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=1600&auto=format&fit=crop",
        order: 1
      },
      {
        name: "Skinny's Rod and Custom",
        description: [
          "With over 25 years in the hot rod and custom car industry, Dave \"Skinny\" Johnson has built a reputation for exceptional craftsmanship and attention to detail.",
          "Skinny's team of artisans specializes in bodywork, fabrication, paint, and interior work that showcases the soul and character of classic vehicles while achieving concourse-level finishes."
        ],
        image: "https://images.unsplash.com/photo-1559760434-0981df057e83?q=80&w=1600&auto=format&fit=crop",
        order: 2
      }
    ]);

    // Engineering features
    console.log("Creating engineering features...");
    await db.insert(schema.engineeringFeatures).values([
      {
        title: "Engineering Excellence",
        description: "Advanced chassis design, systems integration, and performance optimization using cutting-edge tools and methodologies. Every vehicle is virtually prototyped before fabrication begins.",
        icon: "Settings",
        order: 1
      },
      {
        title: "Master Craftsmanship",
        description: "Decades of hands-on expertise in metal fabrication, bodywork, paint, and interior craftsmanship. Each panel is hand-shaped and fitted with precision that exceeds factory standards.",
        icon: "Mic",
        order: 2
      },
      {
        title: "Collaborative Process",
        description: "Our transparent, client-centered approach combines your vision with our expertise. Regular updates and consultations ensure your dream vehicle evolves exactly as you imagine.",
        icon: "Users",
        order: 3
      }
    ]);

    // Process steps
    console.log("Creating process steps...");
    await db.insert(schema.processSteps).values([
      {
        title: "Initial Consultation & Vision",
        description: "We begin with in-depth discussions about your dream vehicle. What inspires you? What level of performance do you desire? How will you use the vehicle? This crucial phase sets the foundation for our design approach.",
        image: "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?q=80&w=1600&auto=format&fit=crop",
        alt: "Initial consultation",
        order: 1
      },
      {
        title: "Design & Engineering",
        description: "Our engineering team creates detailed specifications and 3D models to optimize performance, ergonomics, and aesthetics. We collaborate with you to refine the design until every detail meets our exacting standards.",
        image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=1600&auto=format&fit=crop",
        alt: "Design and engineering",
        order: 2
      },
      {
        title: "Fabrication & Assembly",
        description: "Our master craftsmen begin the meticulous process of building your vehicle. From chassis modifications to custom bodywork, every component is fabricated or modified with precision and care.",
        image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?q=80&w=1600&auto=format&fit=crop",
        alt: "Fabrication and assembly",
        order: 3
      },
      {
        title: "Finishing & Delivery",
        description: "After rigorous testing and quality assurance, your vehicle receives its final detailing. We provide comprehensive documentation, maintenance guidance, and a thorough handover to ensure you get the most from your bespoke creation.",
        image: "https://images.unsplash.com/photo-1601055903647-ddf1ee9701b5?q=80&w=1600&auto=format&fit=crop",
        alt: "Finishing and delivery",
        order: 4
      }
    ]);

    // Market data
    console.log("Creating market data...");
    await db.insert(schema.marketData).values({
      marketGrowthData: [
        { year: 2018, value: 100 },
        { year: 2019, value: 115 },
        { year: 2020, value: 132 },
        { year: 2021, value: 152 },
        { year: 2022, value: 175 },
        { year: 2023, value: 201 }
      ],
      demographicData: [
        { name: "Baby Boomers", value: 45 },
        { name: "Gen X", value: 35 },
        { name: "Millennials", value: 18 },
        { name: "Gen Z", value: 2 }
      ],
      platforms: [
        "1960s-70s American Muscle (Mustang, Camaro, Challenger)",
        "Classic European Sports Cars (Porsche 911, Jaguar E-Type)",
        "Classic 4x4s (Bronco, Land Cruiser, Defender)",
        "1950s American Icons (Bel Air, Thunderbird)",
        "Classic Pickup Trucks (F-100, C10)"
      ],
      modifications: [
        "Modern fuel-injected engines (LS/LT, Coyote)",
        "Advanced suspension systems (IRS, coilovers)",
        "Modern HVAC and comfort features",
        "Integrated infotainment and connectivity",
        "Upgraded braking systems (Wilwood, Brembo)"
      ],
      roi: "+42%"
    });

    console.log("Database seeding completed successfully!");
  }
  catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
