import type { Express, Request, Response } from "express";
import { db } from "@db";
// Mock types for immediate functionality
type ConfiguratorCarModel = {
  id: number;
  make: string;
  model: string;
  yearStart: number;
  yearEnd: number;
  category: string;
  basePrice: string;
  popularity: number;
  imageUrl: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type ConfiguratorEngineOption = {
  id: number;
  manufacturer: string;
  engineName: string;
  displacement: string;
  horsepower: number;
  torque: number;
  price: string;
  compatibility: string[];
  fuelType: string;
  aspirationType: string;
  imageUrl: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type ConfiguratorTransmissionOption = {
  id: number;
  manufacturer: string;
  transmissionName: string;
  type: string;
  gears: number;
  torqueRating: number;
  price: string;
  compatibility: string[];
  imageUrl: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type ConfiguratorColorOption = {
  id: number;
  colorName: string;
  colorCode: string;
  finish: string;
  price: string;
  category: string;
  manufacturer: string;
  popularity: number;
  imageUrl: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type ConfiguratorWheelOption = {
  id: number;
  brand: string;
  wheelName: string;
  diameter: number;
  width: string;
  offset: number;
  price: string;
  style: string;
  material: string;
  compatibility: string[];
  imageUrl: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type ConfiguratorInteriorOption = {
  id: number;
  packageName: string;
  description: string;
  materials: string[];
  features: string[];
  price: string;
  compatibility: string[];
  manufacturer: string;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type ConfiguratorUserConfiguration = {
  id: number;
  userId: string | null;
  carModelId: number;
  engineId: number | null;
  transmissionId: number | null;
  colorId: number | null;
  wheelId: number | null;
  interiorId: number | null;
  additionalOptions: string[] | null;
  totalPrice: string;
  configurationName: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};
import { desc, eq } from "drizzle-orm";

// Mock data for immediate functionality
const mockCarModels: ConfiguratorCarModel[] = [
  {
    id: 1,
    make: "Ford",
    model: "Mustang",
    yearStart: 1965,
    yearEnd: 1973,
    category: "Muscle Car",
    basePrice: "45000.00",
    popularity: 95,
    imageUrl: "/images/mustang-classic.jpg",
    description: "Classic American muscle car perfect for restomod builds",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    make: "Chevrolet",
    model: "Camaro",
    yearStart: 1967,
    yearEnd: 1969,
    category: "Muscle Car",
    basePrice: "48000.00",
    popularity: 92,
    imageUrl: "/images/camaro-classic.jpg",
    description: "Iconic Z28 platform ready for modern upgrades",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 3,
    make: "Dodge",
    model: "Challenger",
    yearStart: 1970,
    yearEnd: 1974,
    category: "Muscle Car",
    basePrice: "52000.00",
    popularity: 88,
    imageUrl: "/images/challenger-classic.jpg",
    description: "Bold styling meets modern performance potential",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const mockEngineOptions: ConfiguratorEngineOption[] = [
  {
    id: 1,
    manufacturer: "Ford",
    engineName: "Coyote 5.0L V8",
    displacement: "5.0L",
    horsepower: 460,
    torque: 420,
    price: "12500.00",
    compatibility: ["Ford Mustang", "Ford F-150"],
    fuelType: "Gasoline",
    aspirationType: "Naturally Aspirated",
    imageUrl: "/images/coyote-engine.jpg",
    description: "Modern Ford powerhouse with proven reliability",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    manufacturer: "Chevrolet",
    engineName: "LS3 6.2L V8",
    displacement: "6.2L",
    horsepower: 430,
    torque: 424,
    price: "11800.00",
    compatibility: ["Chevrolet Camaro", "Chevrolet Corvette"],
    fuelType: "Gasoline",
    aspirationType: "Naturally Aspirated",
    imageUrl: "/images/ls3-engine.jpg",
    description: "Legendary LS platform with massive aftermarket support",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 3,
    manufacturer: "Dodge",
    engineName: "HEMI 6.4L V8",
    displacement: "6.4L",
    horsepower: 485,
    torque: 475,
    price: "14200.00",
    compatibility: ["Dodge Challenger", "Dodge Charger"],
    fuelType: "Gasoline",
    aspirationType: "Naturally Aspirated",
    imageUrl: "/images/hemi-engine.jpg",
    description: "Modern HEMI with classic muscle car soul",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const mockTransmissionOptions: ConfiguratorTransmissionOption[] = [
  {
    id: 1,
    manufacturer: "Tremec",
    transmissionName: "TKX 5-Speed",
    type: "Manual",
    gears: 5,
    torqueRating: 600,
    price: "3200.00",
    compatibility: ["Ford Mustang", "Chevrolet Camaro"],
    imageUrl: "/images/tkx-transmission.jpg",
    description: "Modern 5-speed manual with overdrive",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    manufacturer: "4L80E",
    transmissionName: "4L80E Automatic",
    type: "Automatic",
    gears: 4,
    torqueRating: 750,
    price: "2800.00",
    compatibility: ["Chevrolet Camaro", "Dodge Challenger"],
    imageUrl: "/images/4l80e-transmission.jpg",
    description: "Heavy-duty automatic transmission",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const mockColorOptions: ConfiguratorColorOption[] = [
  {
    id: 1,
    colorName: "Grabber Blue",
    colorCode: "#1B5FA6",
    finish: "Metallic",
    price: "2500.00",
    category: "Classic",
    manufacturer: "Ford",
    popularity: 85,
    imageUrl: "/images/grabber-blue.jpg",
    description: "Iconic Ford performance color",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    colorName: "Rally Red",
    colorCode: "#C41E3A",
    finish: "Gloss",
    price: "2200.00",
    category: "Classic",
    manufacturer: "Chevrolet",
    popularity: 78,
    imageUrl: "/images/rally-red.jpg",
    description: "Bold Chevrolet racing heritage",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const mockWheelOptions: ConfiguratorWheelOption[] = [
  {
    id: 1,
    brand: "American Racing",
    wheelName: "Torq Thrust II",
    diameter: 17,
    width: "8.0",
    offset: 0,
    price: "1200.00",
    style: "Classic",
    material: "Aluminum",
    compatibility: ["Ford Mustang", "Chevrolet Camaro"],
    imageUrl: "/images/torq-thrust.jpg",
    description: "Classic American muscle car wheel",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const mockInteriorOptions: ConfiguratorInteriorOption[] = [
  {
    id: 1,
    packageName: "Sport Interior Package",
    description: "Premium sport seats with modern amenities",
    materials: ["Leather", "Alcantara"],
    features: ["Heated Seats", "Racing Harnesses", "Custom Dashboard"],
    price: "4500.00",
    compatibility: ["Ford Mustang", "Chevrolet Camaro"],
    manufacturer: "TMI Products",
    imageUrl: "/images/sport-interior.jpg",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export function setupConfiguratorAPI(app: Express) {
  const apiPrefix = "/api/configurator";

  // Car Models endpoints
  app.get(`${apiPrefix}/car-models`, async (req: Request, res: Response) => {
    try {
      // Return mock data for immediate functionality
      res.json({ success: true, models: mockCarModels });
    } catch (error) {
      console.error("Error fetching car models:", error);
      res.status(500).json({ error: "Failed to fetch car models" });
    }
  });

  app.get(`${apiPrefix}/car-models/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const model = mockCarModels.find(m => m.id === id);
      
      if (!model) {
        return res.status(404).json({ error: "Car model not found" });
      }
      
      res.json({ success: true, model });
    } catch (error) {
      console.error("Error fetching car model:", error);
      res.status(500).json({ error: "Failed to fetch car model" });
    }
  });

  // Engine Options endpoints
  app.get(`${apiPrefix}/engines`, async (req: Request, res: Response) => {
    try {
      const { compatibility } = req.query;
      let engines = mockEngineOptions;
      
      if (compatibility) {
        engines = mockEngineOptions.filter(engine => 
          engine.compatibility.some(comp => 
            comp.toLowerCase().includes(compatibility.toString().toLowerCase())
          )
        );
      }
      
      res.json({ success: true, engines });
    } catch (error) {
      console.error("Error fetching engines:", error);
      res.status(500).json({ error: "Failed to fetch engines" });
    }
  });

  // Transmission Options endpoints
  app.get(`${apiPrefix}/transmissions`, async (req: Request, res: Response) => {
    try {
      const { compatibility } = req.query;
      let transmissions = mockTransmissionOptions;
      
      if (compatibility) {
        transmissions = mockTransmissionOptions.filter(trans => 
          trans.compatibility.some(comp => 
            comp.toLowerCase().includes(compatibility.toString().toLowerCase())
          )
        );
      }
      
      res.json({ success: true, transmissions });
    } catch (error) {
      console.error("Error fetching transmissions:", error);
      res.status(500).json({ error: "Failed to fetch transmissions" });
    }
  });

  // Color Options endpoints
  app.get(`${apiPrefix}/colors`, async (req: Request, res: Response) => {
    try {
      res.json({ success: true, colors: mockColorOptions });
    } catch (error) {
      console.error("Error fetching colors:", error);
      res.status(500).json({ error: "Failed to fetch colors" });
    }
  });

  // Wheel Options endpoints
  app.get(`${apiPrefix}/wheels`, async (req: Request, res: Response) => {
    try {
      const { compatibility } = req.query;
      let wheels = mockWheelOptions;
      
      if (compatibility) {
        wheels = mockWheelOptions.filter(wheel => 
          wheel.compatibility.some(comp => 
            comp.toLowerCase().includes(compatibility.toString().toLowerCase())
          )
        );
      }
      
      res.json({ success: true, wheels });
    } catch (error) {
      console.error("Error fetching wheels:", error);
      res.status(500).json({ error: "Failed to fetch wheels" });
    }
  });

  // Interior Options endpoints
  app.get(`${apiPrefix}/interiors`, async (req: Request, res: Response) => {
    try {
      const { compatibility } = req.query;
      let interiors = mockInteriorOptions;
      
      if (compatibility) {
        interiors = mockInteriorOptions.filter(interior => 
          interior.compatibility.some(comp => 
            comp.toLowerCase().includes(compatibility.toString().toLowerCase())
          )
        );
      }
      
      res.json({ success: true, interiors });
    } catch (error) {
      console.error("Error fetching interiors:", error);
      res.status(500).json({ error: "Failed to fetch interiors" });
    }
  });

  // Save Configuration endpoint
  app.post(`${apiPrefix}/save-configuration`, async (req: Request, res: Response) => {
    try {
      const configuration = req.body;
      
      // Calculate total price
      let totalPrice = 0;
      
      // Add base car price
      const selectedCar = mockCarModels.find(car => car.id === configuration.carModelId);
      if (selectedCar) {
        totalPrice += parseFloat(selectedCar.basePrice);
      }
      
      // Add component prices
      const selectedEngine = mockEngineOptions.find(engine => engine.id === configuration.engineId);
      if (selectedEngine) {
        totalPrice += parseFloat(selectedEngine.price);
      }
      
      const selectedTransmission = mockTransmissionOptions.find(trans => trans.id === configuration.transmissionId);
      if (selectedTransmission) {
        totalPrice += parseFloat(selectedTransmission.price);
      }
      
      const selectedColor = mockColorOptions.find(color => color.id === configuration.colorId);
      if (selectedColor) {
        totalPrice += parseFloat(selectedColor.price);
      }
      
      const selectedWheels = mockWheelOptions.find(wheel => wheel.id === configuration.wheelId);
      if (selectedWheels) {
        totalPrice += parseFloat(selectedWheels.price);
      }
      
      const selectedInterior = mockInteriorOptions.find(interior => interior.id === configuration.interiorId);
      if (selectedInterior) {
        totalPrice += parseFloat(selectedInterior.price);
      }
      
      const savedConfig = {
        id: Date.now(), // Simple ID generation
        ...configuration,
        totalPrice: totalPrice.toFixed(2),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      res.json({ 
        success: true, 
        configuration: savedConfig,
        message: "Configuration saved successfully!",
        totalPrice: totalPrice.toFixed(2)
      });
    } catch (error) {
      console.error("Error saving configuration:", error);
      res.status(500).json({ error: "Failed to save configuration" });
    }
  });

  console.log("🔧 Car Configurator API endpoints registered successfully");
}