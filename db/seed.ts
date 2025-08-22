import { db } from "./index";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
  try {
    console.log("Seeding database...");
    
    // Hero content
    console.log("Creating hero content...");
    const existingHero = await db.query.heroContent.findFirst();
    if (!existingHero) {
      await db.insert(schema.heroContent).values({
        title: "Engineering Meets Artistry",
        subtitle: "Meticulously crafted restomods that combine precision engineering with concourse-level aesthetics. The perfect fusion of classic soul and modern performance.",
        imageUrl: "https://images.unsplash.com/photo-1611566026373-c6c8da0945b8?q=80&w=2000&auto=format&fit=crop",
        createdAt: new Date(),
      });
    }

    // Projects
    console.log("Creating projects...");
    
    // Check for F100 project
    const f100Project = await db.query.projects.findFirst({
      where: eq(schema.projects.slug, "1953-ford-f100")
    });
    
    if (!f100Project) {
      console.log("Adding 1953 Ford F100 project...");
      await db.insert(schema.projects).values({
        title: "1953 Ford F100",
        subtitle: "Iconic American Pickup Reborn with Modern Performance & Luxury",
        slug: "1953-ford-f100",
        description: "Our 1953 Ford F100 restomod masterfully blends the iconic styling of this legendary American truck with state-of-the-art engineering and premium craftsmanship. Introduced during Ford's 50th anniversary celebrations, the F100 marked a pivotal shift in truck design with its wider cab, improved suspension, and robust frame. Our restoration honors this historical significance while integrating modern performance, luxury, and technology.",
        category: "trucks-4x4s",
        imageUrl: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=1600&auto=format&fit=crop",
        galleryImages: [
          "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=1600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1531086623190-a3bd615e55b5?q=80&w=1600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1596649299486-4cdea56fd59d?q=80&w=1600&auto=format&fit=crop"
        ],
        specs: {
          engine: "Ford 5.0L Coyote V8, 460 HP",
          transmission: "6-Speed Automatic with Overdrive",
          suspension: "Custom Fat Man Fabrications Mustang II Front, 4-Link Rear",
          buildTime: "3,600 Hours",
          brakes: "Wilwood 4-Wheel Power Disc Brakes",
          wheels: "20-inch Billet Specialties Custom Alloys",
          tires: "Michelin Pilot Sport",
          paint: "Custom Metallic Lunar Blue with Clear Coat",
          interior: "Tan Bridge of Weir Scottish Leather"
        },
        features: [
          "Custom Art Morrison chassis with modern coilover suspension",
          "Power rack-and-pinion steering with modern geometry",
          "Vintage Air climate control system with digital controls",
          "Premium leather interior with heated and cooled seats",
          "Custom bed with hand-finished teak wood planking",
          "Retro-look digital gauges with modern functionality",
          "Hidden modern audio system with smartphone integration",
          "LED lighting with period-correct appearance",
          "Sound deadening and thermal insulation throughout",
          "Power windows and central locking with remote",
          "Modern fuel injection with custom ECU mapping"
        ],
        clientQuote: "This F100 is everything I dreamed of - pure American classic styling with modern driving characteristics. The level of detail throughout is astonishing, and it drives like a modern vehicle while maintaining all the character of the original. It's a masterpiece that turns heads everywhere it goes.",
        clientName: "Thomas Richardson",
        clientLocation: "Austin, Texas",
        historicalInfo: {
          significance: "The 1953 Ford F100 marked the beginning of the F100 series and was part of Ford's 50th anniversary celebration. It replaced the post-war F1 model with a modernized pickup that combined durability with comfort and style.",
          originalSpecs: "Originally offered with a 239 cubic-inch flathead V8 or 239 cubic-inch inline-six engine, three-speed manual transmission, and drum brakes. The truck featured a wider cab, improved suspension, and increased payload capacity compared to its predecessors.",
          designElements: "The F100's bold front end, clamshell bonnet, and clean body lines have influenced truck design for decades. Its styling themes have been adopted by numerous automotive companies worldwide, including Nissan, Mitsubishi, GMC, and Toyota.",
          productionNumbers: "Over 1 million first-generation F100 trucks (1953-1956) were produced, making it one of the most successful truck launches in automotive history.",
          collectability: "Pristine original F100s can fetch $20,000 to $100,000 depending on condition and authenticity, while premium restomods like ours can exceed $200,000 due to their meticulous craftsmanship and modern upgrades."
        },
        featured: true,
        createdAt: new Date(),
      });
      
      // Update the other featured project to non-featured
      const mustangProject = await db.query.projects.findFirst({
        where: eq(schema.projects.slug, "1967-mustang-fastback")
      });
      
      if (mustangProject) {
        await db.update(schema.projects)
          .set({ featured: false })
          .where(eq(schema.projects.slug, "1967-mustang-fastback"));
      }
    }
    
    // Testimonials
    console.log("Creating testimonials...");
    const existingTestimonials = await db.query.testimonials.findMany();
    if (existingTestimonials.length === 0) {
      await db.insert(schema.testimonials).values([
        {
          quote: "The attention to detail and engineering excellence that McKenney & Skinny's put into my '67 Mustang exceeded all expectations. It's the perfect blend of classic style and modern performance.",
          authorName: "Robert Maxwell",
          authorLocation: "Portland, Oregon",
          authorImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
          createdAt: new Date(),
        },
        {
          quote: "After researching numerous builders, I chose McKenney & Skinny's for their transparent process and engineering-first approach. They transformed my Bronco into the perfect weekend adventure vehicle.",
          authorName: "Jennifer Harmon",
          authorLocation: "Austin, Texas",
          authorImage: "https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?q=80&w=200&auto=format&fit=crop",
          createdAt: new Date(),
        },
        {
          quote: "The level of communication and collaboration throughout the build was exceptional. They made my vision for a modern classic Porsche 911 a reality, with performance that rivals modern sports cars.",
          authorName: "David Kawecki",
          authorLocation: "Chicago, Illinois",
          authorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
          createdAt: new Date(),
        }
      ]);
    }

    // Team members
    console.log("Creating team members...");
    const existingTeamMembers = await db.query.teamMembers.findMany();
    if (existingTeamMembers.length === 0) {
      await db.insert(schema.teamMembers).values([
        {
          name: "James McKenney",
          position: "Founder & Engineering Director",
          image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=300&auto=format&fit=crop",
          bio: "Mechanical engineer with a passion for automotive design and over 20 years of experience in systems integration and performance optimization.",
          order: 1,
          createdAt: new Date(),
        },
        {
          name: "Dave \"Skinny\" Johnson",
          position: "Founder & Master Builder",
          image: "https://images.unsplash.com/photo-1566753323558-f4e0952af115?q=80&w=300&auto=format&fit=crop",
          bio: "With over 25 years in the hot rod and custom car industry, Skinny has built a reputation for exceptional craftsmanship and attention to detail.",
          order: 2,
          createdAt: new Date(),
        },
        {
          name: "Sarah Chen",
          position: "Systems Engineering Lead",
          image: "https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=300&auto=format&fit=crop",
          bio: "Automotive systems specialist with expertise in integrating modern technology with classic vehicles. Leads our electrical and electronic systems team.",
          order: 3,
          createdAt: new Date(),
        },
        {
          name: "Mike Reyes",
          position: "Master Fabricator",
          image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop",
          bio: "Metal fabrication artist with 15 years of experience creating custom panels, brackets, and components. Specializes in aluminum and stainless steel work.",
          order: 4,
          createdAt: new Date(),
        }
      ]);
    }

    // Companies
    console.log("Creating companies...");
    const existingCompanies = await db.query.companies.findMany();
    if (existingCompanies.length === 0) {
      await db.insert(schema.companies).values([
        {
          name: "McKenney Engineering & Design",
          description: [
            "Founded by James McKenney, a mechanical engineer with a passion for automotive design, McKenney Engineering brings rigorous engineering principles to classic vehicle design.",
            "Their expertise in systems integration, performance optimization, and advanced CAD/CAM techniques ensures every vehicle performs as good as it looks."
          ],
          image: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=1600&auto=format&fit=crop",
          order: 1,
          createdAt: new Date(),
        },
        {
          name: "Skinny's Rod and Custom",
          description: [
            "With over 25 years in the hot rod and custom car industry, Dave \"Skinny\" Johnson has built a reputation for exceptional craftsmanship and attention to detail.",
            "Skinny's team of artisans specializes in bodywork, fabrication, paint, and interior work that showcases the soul and character of classic vehicles while achieving concourse-level finishes."
          ],
          image: "https://images.unsplash.com/photo-1559760434-0981df057e83?q=80&w=1600&auto=format&fit=crop",
          order: 2,
          createdAt: new Date(),
        }
      ]);
    }

    // Engineering features
    console.log("Creating engineering features...");
    const existingFeatures = await db.query.engineeringFeatures.findMany();
    if (existingFeatures.length === 0) {
      await db.insert(schema.engineeringFeatures).values([
        {
          title: "Engineering Excellence",
          description: "Advanced chassis design, systems integration, and performance optimization using cutting-edge tools and methodologies. Every vehicle is virtually prototyped before fabrication begins.",
          icon: "Settings",
          order: 1,
          createdAt: new Date(),
        },
        {
          title: "Master Craftsmanship",
          description: "Decades of hands-on expertise in metal fabrication, bodywork, paint, and interior craftsmanship. Each panel is hand-shaped and fitted with precision that exceeds factory standards.",
          icon: "Mic",
          order: 2,
          createdAt: new Date(),
        },
        {
          title: "Collaborative Process",
          description: "Our transparent, client-centered approach combines your vision with our expertise. Regular updates and consultations ensure your dream vehicle evolves exactly as you imagine.",
          icon: "Users",
          order: 3,
          createdAt: new Date(),
        }
      ]);
    }

    // Process steps
    console.log("Creating process steps...");
    const existingSteps = await db.query.processSteps.findMany();
    if (existingSteps.length === 0) {
      await db.insert(schema.processSteps).values([
        {
          title: "Initial Consultation & Vision",
          description: "We begin with in-depth discussions about your dream vehicle. What inspires you? What level of performance do you desire? How will you use the vehicle? This crucial phase sets the foundation for our design approach.",
          image: "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?q=80&w=1600&auto=format&fit=crop",
          alt: "Initial consultation",
          order: 1,
          createdAt: new Date(),
        },
        {
          title: "Design & Engineering",
          description: "Our engineering team creates detailed specifications and 3D models to optimize performance, ergonomics, and aesthetics. We collaborate with you to refine the design until every detail meets our exacting standards.",
          image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=1600&auto=format&fit=crop",
          alt: "Design and engineering",
          order: 2,
          createdAt: new Date(),
        },
        {
          title: "Fabrication & Assembly",
          description: "Our master craftsmen begin the meticulous process of building your vehicle. From chassis modifications to custom bodywork, every component is fabricated or modified with precision and care.",
          image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?q=80&w=1600&auto=format&fit=crop",
          alt: "Fabrication and assembly",
          order: 3,
          createdAt: new Date(),
        },
        {
          title: "Finishing & Delivery",
          description: "After rigorous testing and quality assurance, your vehicle receives its final detailing. We provide comprehensive documentation, maintenance guidance, and a thorough handover to ensure you get the most from your bespoke creation.",
          image: "https://images.unsplash.com/photo-1601055903647-ddf1ee9701b5?q=80&w=1600&auto=format&fit=crop",
          alt: "Finishing and delivery",
          order: 4,
          createdAt: new Date(),
        }
      ]);
    }

    // Market data
    console.log("Creating market data...");
    const existingMarketData = await db.query.marketData.findFirst();
    if (!existingMarketData) {
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
        roi: "+42%",
        createdAt: new Date(),
      });
    }

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
