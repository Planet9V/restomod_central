import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, 
  ComposedChart, Scatter, ScatterChart, ZAxis, Brush, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, RadarChart,
  Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, RadialBarChart, RadialBar
} from 'recharts';
import { Tilt } from "react-tilt";
import * as d3 from 'd3';
import { Link } from "wouter";
import PageHeader from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChevronRight, TrendingUp, BarChart3, PieChart as PieChartIcon, 
  Clock, DollarSign, Car, Gauge, ArrowUpRight, CircleDollarSign,
  Percent, Network, Scale, TrendingDown, LineChart as LineChartIcon, 
  RadioTower, Trophy, Users, ArrowRight, BarChart2
} from "lucide-react";
import { COLORS } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ModelValueAnalysis } from "@/components/market/ModelValueAnalysis";
import { RealtimeResearch } from "@/components/market/RealtimeResearch";
import { MODEL_SPECIFIC_VALUATIONS } from "@/data/specific-model-data";

// Premium tilt options
const tiltOptions = {
  max: 5,
  scale: 1.02,
  speed: 1000,
  glare: true,
  "max-glare": 0.1,
};

// Market size data (billions USD) - From research document, Table 1
const GLOBAL_MARKET_SIZE = [
  { year: 2022, automotive: 5.5, classics: 36.5, restomod: 3.2, percentage: 8.8 },
  { year: 2023, automotive: 6.1, classics: 38.1, restomod: 4.1, percentage: 10.8 },
  { year: 2024, automotive: 6.8, classics: 39.7, restomod: 5.3, percentage: 13.4 },
  { year: 2025, automotive: 7.6, classics: 43.2, restomod: 6.9, percentage: 16.0 },
  { year: 2026, automotive: 8.4, classics: 47.0, restomod: 8.9, percentage: 18.9 },
  { year: 2027, automotive: 9.3, classics: 51.1, restomod: 11.4, percentage: 22.3 },
  { year: 2028, automotive: 10.4, classics: 55.6, restomod: 14.3, percentage: 25.7 },
  { year: 2029, automotive: 11.6, classics: 60.4, restomod: 17.8, percentage: 29.5 },
  { year: 2030, automotive: 12.9, classics: 65.7, restomod: 21.7, percentage: 33.0 },
  { year: 2031, automotive: 14.3, classics: 71.4, restomod: 26.0, percentage: 36.4 },
  { year: 2032, automotive: 15.9, classics: 77.8, restomod: 30.7, percentage: 39.5 },
];

// CAGR by decade (1950s-1990s) from research document section IV.B
const DECADE_VALUE_GROWTH = [
  { decade: "1950s", cagr: 7.1, description: "Post-war classics with iconic styling", examples: "Tri-Five Chevys, Early Thunderbirds", avgBuild: 195000, highEnd: 340000 },
  { decade: "1960s", cagr: 9.8, description: "Peak muscle car & sports car era", examples: "Mustangs, Camaros, Chargers", avgBuild: 180000, highEnd: 450000 },
  { decade: "1970s", cagr: 8.3, description: "Transition to modern features", examples: "Trans Ams, Challengers, Broncos", avgBuild: 165000, highEnd: 320000 },
  { decade: "1980s", cagr: 10.4, description: "Rising 'youngtimer' popularity", examples: "Fox Body Mustangs, E30 BMWs", avgBuild: 130000, highEnd: 280000 },
  { decade: "1990s", cagr: 12.1, description: "Newest entrants to classic status", examples: "FD RX-7s, Supras, NSXs", avgBuild: 120000, highEnd: 250000 },
];

// Vehicle Type Segmentation (Radar Data) - From research document, Section III & IV
const VEHICLE_TYPE_DATA = [
  { 
    type: "American Muscle Cars",
    marketShare: 28,
    growthRate: 9.8,
    avgValue: 185,
    priceGrowth: 247,
    investorAppeal: 9.1,
    futureOutlook: 8.5,
    color: COLORS.burgundy
  },
  { 
    type: "Vintage Trucks/SUVs",
    marketShare: 24,
    growthRate: 12.3,
    avgValue: 154,
    priceGrowth: 320,
    investorAppeal: 9.4,
    futureOutlook: 9.3,
    color: COLORS.gold
  },
  { 
    type: "European Sports Cars",
    marketShare: 21,
    growthRate: 8.9,
    avgValue: 245,
    priceGrowth: 208,
    investorAppeal: 8.5,
    futureOutlook: 8.2,
    color: COLORS.steel
  },
  { 
    type: "Classic Luxury",
    marketShare: 14,
    growthRate: 7.2,
    avgValue: 210,
    priceGrowth: 185,
    investorAppeal: 7.8,
    futureOutlook: 7.4,
    color: COLORS.charcoal
  },
  { 
    type: "Japanese Classics",
    marketShare: 8,
    growthRate: 14.5,
    avgValue: 125,
    priceGrowth: 275,
    investorAppeal: 8.3,
    futureOutlook: 9.1,
    color: COLORS.silver
  },
  { 
    type: "Other",
    marketShare: 5,
    growthRate: 5.8,
    avgValue: 95,
    priceGrowth: 142,
    investorAppeal: 6.2,
    futureOutlook: 6.5,
    color: "#AAAAAA"
  }
];

// Simplified vehicle type data for simple charts
const VEHICLE_TYPE_SHARE = VEHICLE_TYPE_DATA.map(item => ({
  name: item.type,
  value: item.marketShare,
  color: item.color
}));

// Vehicle Investment Heatmap - Section IV.C "Top Performing Models" data
const VEHICLE_INVESTMENT_MATRIX = [
  // Growth rate/ROI percentage mapped to a 10-point scale for heatmap intensity
  { decade: "1950s", muscle: 6.5, trucks: 5.8, euro: 7.2, luxury: 6.7, japanese: 4.1 },
  { decade: "1960s", muscle: 8.9, trucks: 8.3, euro: 7.5, luxury: 6.2, japanese: 5.3 },
  { decade: "1970s", muscle: 7.8, trucks: 9.2, euro: 6.6, luxury: 5.8, japanese: 7.1 },
  { decade: "1980s", muscle: 8.2, trucks: 9.6, euro: 7.3, luxury: 6.4, japanese: 8.9 },
  { decade: "1990s", muscle: 7.4, trucks: 8.5, euro: 8.1, luxury: 7.2, japanese: 9.3 },
];

// Detailed Iconic Model Data - From research document, Section IV.C
const MODEL_DATA = [
  { 
    id: "mustang",
    name: "Ford Mustang (1967-69)",
    category: "American Muscle",
    cagr: 8.8,
    description: "First-generation Mustangs, particularly Fastbacks, remain the quintessential American pony car investment. Value drivers include preserved original styling elements with modern mechanicals.",
    valueFactors: [
      { factor: "Fastback Body Style", impact: 9.1 },
      { factor: "Coyote V8 Swap", impact: 8.5 },
      { factor: "Modern Suspension", impact: 7.8 },
      { factor: "Original Paint Color", impact: 7.2 },
      { factor: "Premium Interior", impact: 8.0 }
    ],
    keyMetrics: {
      averageBuild: 185000,
      topTier: 320000,
      appreciationIndex: 475,
      liquidityScore: 8.7,
      buildTime: "8-12 months"
    },
    marketTrend: [
      { year: 2005, value: 100 },
      { year: 2010, value: 126 },
      { year: 2015, value: 184 },
      { year: 2020, value: 295 },
      { year: 2025, value: 475 }
    ],
    color: "#c43c30"
  },
  { 
    id: "bronco",
    name: "Ford Bronco (1966-77)",
    category: "Vintage Trucks/SUVs",
    cagr: 12.4,
    description: "Early Broncos represent the standout investment performer in the vintage 4x4 segment, with exceptional growth following broader market recognition of their iconic design.",
    valueFactors: [
      { factor: "Uncut Original Body", impact: 9.6 },
      { factor: "Modern V8 Power", impact: 8.1 },
      { factor: "Premium Suspension", impact: 8.8 },
      { factor: "Interior Modernization", impact: 7.9 },
      { factor: "Exterior Preservation", impact: 8.5 }
    ],
    keyMetrics: {
      averageBuild: 210000,
      topTier: 380000,
      appreciationIndex: 1017,
      liquidityScore: 9.2,
      buildTime: "10-14 months"
    },
    marketTrend: [
      { year: 2005, value: 100 },
      { year: 2010, value: 118 },
      { year: 2015, value: 225 },
      { year: 2020, value: 482 },
      { year: 2025, value: 1017 }
    ],
    color: "#3579b3"
  },
  { 
    id: "defender",
    name: "Land Rover Defender",
    category: "European 4x4",
    cagr: 10.7,
    description: "Land Rover Defenders have transitioned from utilitarian workhorses to premium lifestyle vehicles, with restomods commanding extraordinary premiums, particularly in North America.",
    valueFactors: [
      { factor: "Heritage Styling", impact: 8.7 },
      { factor: "LS/Coyote Swap", impact: 8.3 },
      { factor: "Luxury Interior", impact: 9.2 },
      { factor: "Premium Audio/Tech", impact: 8.0 },
      { factor: "Chassis Improvements", impact: 7.9 }
    ],
    keyMetrics: {
      averageBuild: 230000,
      topTier: 400000,
      appreciationIndex: 728,
      liquidityScore: 8.9,
      buildTime: "8-16 months"
    },
    marketTrend: [
      { year: 2005, value: 100 },
      { year: 2010, value: 129 },
      { year: 2015, value: 246 },
      { year: 2020, value: 429 },
      { year: 2025, value: 728 }
    ],
    color: "#166648"
  },
  { 
    id: "camaro",
    name: "Chevrolet Camaro (1967-69)",
    category: "American Muscle",
    cagr: 8.7,
    description: "First-generation Camaros remain blue-chip investments, with values steadily appreciating, though at a slower rate than some other categories in recent years.",
    valueFactors: [
      { factor: "Original Body Panels", impact: 8.4 },
      { factor: "LS Engine Swap", impact: 8.2 },
      { factor: "Detroit Speed Suspension", impact: 8.8 },
      { factor: "Interior Upgrades", impact: 7.5 },
      { factor: "4-Wheel Disc Brakes", impact: 7.8 }
    ],
    keyMetrics: {
      averageBuild: 175000,
      topTier: 310000,
      appreciationIndex: 548,
      liquidityScore: 8.5,
      buildTime: "9-13 months"
    },
    marketTrend: [
      { year: 2005, value: 100 },
      { year: 2010, value: 134 },
      { year: 2015, value: 210 },
      { year: 2020, value: 335 },
      { year: 2025, value: 548 }
    ],
    color: "#e8b423"
  },
  { 
    id: "porsche911",
    name: "Porsche 911 (1964-73)",
    category: "European Sports Car",
    cagr: 10.9,
    description: "Early 911s, particularly long-hood models, represent the premium investment in European sports cars, amplified by the impact of Singer Vehicle Design on market expectations.",
    valueFactors: [
      { factor: "Heritage Design", impact: 9.4 },
      { factor: "Modern Flat-Six", impact: 8.5 },
      { factor: "Suspension Upgrades", impact: 8.7 },
      { factor: "Premium Interior", impact: 9.1 },
      { factor: "Lightweight Components", impact: 8.3 }
    ],
    keyMetrics: {
      averageBuild: 325000,
      topTier: 750000,
      appreciationIndex: 799,
      liquidityScore: 9.3,
      buildTime: "12-18 months"
    },
    marketTrend: [
      { year: 2005, value: 100 },
      { year: 2010, value: 142 },
      { year: 2015, value: 238 },
      { year: 2020, value: 433 },
      { year: 2025, value: 799 }
    ],
    color: "#1b365d"
  }
];

// Create aggregated model value trends for line chart
const MODEL_VALUE_TRENDS = MODEL_DATA.reduce((accum, model, index) => {
  model.marketTrend.forEach(dataPoint => {
    const existingYearIndex = accum.findIndex(item => item.year === dataPoint.year);
    
    if (existingYearIndex === -1) {
      const newDataPoint: any = { year: dataPoint.year };
      newDataPoint[model.id] = dataPoint.value;
      accum.push(newDataPoint);
    } else {
      accum[existingYearIndex][model.id] = dataPoint.value;
    }
  });
  
  return accum;
}, [] as any[]);

// Most popular build components data - Section IV.A.2
const POPULAR_COMPONENTS = [
  {
    category: "Powertrain",
    components: [
      { name: "Ford Coyote 5.0L V8", popularity: 31, price: "9,800-14,500", yearIntroduced: 2011 },
      { name: "GM LS3 6.2L V8", popularity: 28, price: "8,500-12,500", yearIntroduced: 2008 },
      { name: "Ford Godzilla 7.3L V8", popularity: 9, price: "10,500-16,000", yearIntroduced: 2020 },
      { name: "GM LT4 6.2L Supercharged", popularity: 8, price: "15,000-20,000", yearIntroduced: 2015 },
      { name: "Mopar 6.4L HEMI", popularity: 7, price: "11,000-15,000", yearIntroduced: 2011 },
      { name: "Other/Custom", popularity: 17, price: "Varies", yearIntroduced: null }
    ]
  },
  {
    category: "Transmission",
    components: [
      { name: "Tremec T-56 Magnum 6-Speed", popularity: 28, price: "3,800-5,500", yearIntroduced: 2004 },
      { name: "GM 4L80E 4-Speed Auto", popularity: 17, price: "3,200-4,800", yearIntroduced: 1991 },
      { name: "GM 10L80 10-Speed Auto", popularity: 15, price: "5,000-7,500", yearIntroduced: 2017 },
      { name: "Ford 10R80 10-Speed Auto", popularity: 14, price: "5,200-7,800", yearIntroduced: 2017 },
      { name: "ZF 8HP 8-Speed Auto", popularity: 8, price: "6,500-9,000", yearIntroduced: 2009 },
      { name: "Other/Custom", popularity: 18, price: "Varies", yearIntroduced: null }
    ]
  },
  {
    category: "Suspension",
    components: [
      { name: "Detroit Speed Aluma-Frame", popularity: 22, price: "9,500-14,500", yearIntroduced: 2008 },
      { name: "RideTech HQ Series Coilovers", popularity: 21, price: "3,800-6,500", yearIntroduced: 2012 },
      { name: "Heidts Pro-G IFS/IRS", popularity: 14, price: "7,800-13,000", yearIntroduced: 2005 },
      { name: "QA1 Pro Coil System", popularity: 12, price: "2,800-5,200", yearIntroduced: 2010 },
      { name: "Art Morrison GT Sport Chassis", popularity: 11, price: "15,000-25,000", yearIntroduced: 2003 },
      { name: "Other/Custom", popularity: 20, price: "Varies", yearIntroduced: null }
    ]
  }
];

// Market forecast data (2025-2045)
const MARKET_FORECAST = [
  { year: 2025, value: 42.8, restomodShare: 8.6, originalShare: 25.7, modernShare: 8.5, cagr: 9.7 },
  { year: 2030, value: 65.7, restomodShare: 17.1, originalShare: 28.8, modernShare: 19.8, cagr: 8.9 },
  { year: 2035, value: 97.4, restomodShare: 31.2, originalShare: 31.5, modernShare: 34.7, cagr: 8.2 },
  { year: 2040, value: 139.8, restomodShare: 51.7, originalShare: 33.6, modernShare: 54.5, cagr: 7.5 },
  { year: 2045, value: 198.5, restomodShare: 79.4, originalShare: 35.7, modernShare: 83.4, cagr: 7.3 },
];

// Investment comparison data from Section V.B (20-year return)
const INVESTMENT_COMPARISON = [
  { name: "Premium Restomods", value: 213, color: COLORS.burgundy },
  { name: "Classic Cars (Original)", value: 91, color: COLORS.gold },
  { name: "S&P 500", value: 118, color: COLORS.steel },
  { name: "Real Estate", value: 63, color: COLORS.charcoal },
  { name: "Gold", value: 42, color: COLORS.silver },
  { name: "Fine Art", value: 86, color: "#8B4513" },
  { name: "Luxury Watches", value: 58, color: "#4682B4" },
];

// Builder premium data (impact on value) - derived from research Section IV.A.3
const BUILDER_PREMIUM_DATA = [
  { 
    builder: "Singer Vehicle Design", 
    basePremium: 250, 
    timeOnMarket: 1.4,
    reputation: 9.8,
    completionTime: 16,
    waitlist: 24,
    specialization: "Porsche 911 (1964-73)",
    startingPrice: 650000,
    color: "#1f283a"
  },
  { 
    builder: "Icon 4x4", 
    basePremium: 210, 
    timeOnMarket: 2.1,
    reputation: 9.6,
    completionTime: 14,
    waitlist: 18,
    specialization: "Ford Bronco, Toyota FJ",
    startingPrice: 350000,
    color: "#454442"
  },
  { 
    builder: "Ringbrothers", 
    basePremium: 180, 
    timeOnMarket: 2.6,
    reputation: 9.4,
    completionTime: 18,
    waitlist: 14,
    specialization: "American Muscle Cars",
    startingPrice: 250000,
    color: "#ae0001"
  },
  { 
    builder: "SpeedKore", 
    basePremium: 165, 
    timeOnMarket: 3.2,
    reputation: 9.1,
    completionTime: 16,
    waitlist: 14,
    specialization: "Carbon Fiber Muscle Cars",
    startingPrice: 300000,
    color: "#2c2c2c"
  },
  { 
    builder: "Legacy Overland", 
    basePremium: 155, 
    timeOnMarket: 2.8,
    reputation: 8.9,
    completionTime: 12,
    waitlist: 10,
    specialization: "Land Rovers, Toyota Land Cruisers",
    startingPrice: 215000,
    color: "#496b4a"
  },
  { 
    builder: "Emory Motorsports", 
    basePremium: 190, 
    timeOnMarket: 2.2,
    reputation: 9.3,
    completionTime: 15,
    waitlist: 16,
    specialization: "Porsche 356/911 Outlaws",
    startingPrice: 400000,
    color: "#a39a92"
  },
  { 
    builder: "Gateway Bronco", 
    basePremium: 145, 
    timeOnMarket: 3.5,
    reputation: 8.7,
    completionTime: 10,
    waitlist: 8,
    specialization: "Ford Broncos",
    startingPrice: 180000,
    color: "#173faa"
  },
  { 
    builder: "Classic Recreations", 
    basePremium: 125, 
    timeOnMarket: 4.1,
    reputation: 8.4,
    completionTime: 12,
    waitlist: 6,
    specialization: "Ford Mustangs, Shelby models",
    startingPrice: 210000,
    color: "#303c58"
  }
];

// Builder Premium Effect scatter plot data
const BUILDER_SCATTER_DATA = BUILDER_PREMIUM_DATA.map(builder => ({
  x: builder.reputation,
  y: builder.basePremium,
  z: builder.startingPrice / 10000,
  name: builder.builder,
  color: builder.color
}));

// Risk factors (detailed version) from Section V.C
const RISK_FACTORS = [
  { 
    title: "Market Volatility", 
    description: "The collector car market experiences significant cyclicality, with periods of rapid appreciation followed by plateaus or corrections. Economic downturns can impact liquidity and valuations.",
    impact: 7,
    mitigations: [
      "Focus on vehicles with broad demographic appeal",
      "Understand macro-market cycles and timing",
      "Maintain cash reserves for market dips"
    ]
  },
  { 
    title: "Build Quality Variations", 
    description: "The quality and reputation of the builder significantly impact restomod values, with premium builders commanding substantial premiums that continue to appreciate.",
    impact: 9,
    mitigations: [
      "Invest in documented builds from established names",
      "Prioritize engineering integrity over aesthetics alone",
      "Consider builder waitlists and completion timelines"
    ]
  },
  { 
    title: "Modification Subjectivity", 
    description: "The subjective nature of modifications means that personal taste can significantly impact marketability and resale value, creating friction in the marketplace.",
    impact: 8,
    mitigations: [
      "Focus on tasteful, reversible modifications",
      "Maintain period-correct aesthetics where possible",
      "Balance performance improvements with heritage"
    ]
  },
  { 
    title: "Initial Cost Hurdles", 
    description: "High acquisition and build costs can limit the potential for short-term returns, requiring patience and sufficient capital to weather initial value plateaus.",
    impact: 6,
    mitigations: [
      "Consider mid-market entry points with growth potential",
      "Evaluate total cost-to-value pathways before committing",
      "Establish 5+ year investment timelines for best outcomes"
    ]
  },
  { 
    title: "Authenticity Debates", 
    description: "Tension between modification and preservation within collector communities can impact marketability to different buyer segments and affect long-term valuation trends.",
    impact: 5,
    mitigations: [
      "Maintain comprehensive documentation of original condition",
      "Preserve original components when possible",
      "Target builds with reversible major modifications"
    ]
  },
  { 
    title: "Maintenance Complexity", 
    description: "Custom builds often feature unique engineering solutions that may require specialized knowledge and parts for maintenance, impacting long-term ownership costs.",
    impact: 6,
    mitigations: [
      "Prioritize builds using readily available components",
      "Document all custom systems thoroughly",
      "Build relationships with specialized maintenance providers"
    ]
  },
  { 
    title: "Regulation Changes", 
    description: "Evolving emissions laws, safety requirements, and urban access restrictions can impact the usability and therefore market appeal of various restomod configurations.",
    impact: 7,
    mitigations: [
      "Consider zero-emission drivetrain options where appropriate",
      "Monitor regulatory trends in key markets",
      "Focus on models with exemption pathways"
    ]
  }
];

// D3 Heatmap generator function for use in the component
function createHeatmap(ref: HTMLDivElement | null, data: any[]) {
  if (!ref) return;

  // Clear any existing SVG
  d3.select(ref).selectAll("svg").remove();

  const margin = { top: 50, right: 25, bottom: 60, left: 80 };
  const width = 600;
  const height = 300;

  const decades = data.map(d => d.decade);
  const categories = ["muscle", "trucks", "euro", "luxury", "japanese"];
  const categoryLabels = ["Muscle Cars", "Trucks/SUVs", "European Sports", "Luxury Cars", "Japanese Classics"];

  // Create SVG element
  const svg = d3.select(ref)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Create scales
  const x = d3.scaleBand()
    .domain(decades)
    .range([0, width])
    .padding(0.05);

  const y = d3.scaleBand()
    .domain(categories)
    .range([0, height])
    .padding(0.05);

  // Value scale for coloring
  const colorScale = d3.scaleLinear<string>()
    .domain([4, 6.5, 9.5])
    .range(["#f3f4f6", COLORS.gold, COLORS.burgundy]);

  // Add X axis labels
  svg.append("g")
    .style("font-size", 12)
    .style("font-family", "system-ui, sans-serif")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickSize(0))
    .call(g => g.select(".domain").remove())
    .selectAll("text")
    .style("text-anchor", "middle")
    .style("font-weight", "bold");

  // Add Y axis labels
  svg.append("g")
    .style("font-size", 12)
    .style("font-family", "system-ui, sans-serif")
    .call(d3.axisLeft(y).tickSize(0).tickFormat((d, i) => categoryLabels[i]))
    .call(g => g.select(".domain").remove())
    .selectAll("text")
    .style("font-weight", "bold");

  // Add title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .style("font-size", 16)
    .style("font-weight", "bold")
    .style("font-family", "system-ui, sans-serif")
    .text("Investment Performance by Decade & Vehicle Type");

  // Create the heatmap cells
  const cells = svg.selectAll()
    .data(data.flatMap(d => categories.map(cat => ({
      decade: d.decade,
      category: cat,
      value: d[cat as keyof typeof d]
    }))))
    .enter()
    .append("g");

  cells.append("rect")
    .attr("x", d => x(d.decade) || 0)
    .attr("y", d => y(d.category) || 0)
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .style("fill", d => colorScale(d.value as number))
    .style("stroke-width", 1)
    .style("stroke", "white")
    .style("opacity", 0.8);

  cells.append("text")
    .attr("x", d => (x(d.decade) || 0) + x.bandwidth() / 2)
    .attr("y", d => (y(d.category) || 0) + y.bandwidth() / 2)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .style("font-family", "system-ui, sans-serif")
    .style("font-size", 12)
    .style("font-weight", "bold")
    .style("fill", d => (d.value as number) > 7.5 ? "white" : "black")
    .text(d => d.value);

  // Create color legend
  const legendWidth = 200;
  const legendHeight = 15;
  
  const legend = svg.append("g")
    .attr("transform", `translate(${(width - legendWidth) / 2}, ${height + 35})`);
  
  // Gradient definition
  const defs = svg.append("defs");
  const gradient = defs.append("linearGradient")
    .attr("id", "colorGradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%");
  
  gradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#f3f4f6");
  
  gradient.append("stop")
    .attr("offset", "50%")
    .attr("stop-color", COLORS.gold);
  
  gradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", COLORS.burgundy);
  
  // Gradient rectangle
  legend.append("rect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#colorGradient)");
  
  // Scale for legend
  const legendScale = d3.scaleLinear()
    .domain([4, 10])
    .range([0, legendWidth]);
  
  const legendAxis = d3.axisBottom(legendScale)
    .tickValues([4, 6, 8, 10])
    .tickFormat(d => `${d}`);
  
  legend.append("g")
    .attr("transform", `translate(0, ${legendHeight})`)
    .call(legendAxis)
    .selectAll("text")
    .style("font-size", 10);
  
  // Legend title
  legend.append("text")
    .attr("x", legendWidth / 2)
    .attr("y", -5)
    .attr("text-anchor", "middle")
    .style("font-size", 10)
    .style("font-family", "system-ui, sans-serif")
    .text("Growth Rate/ROI (Scale 1-10)");
}

// Radar chart data preparation
const radarDataByType = VEHICLE_TYPE_DATA.map(type => {
  // Create format expected by the radar chart
  return {
    subject: type.type,
    "Market Share": type.marketShare / 5, // Normalize to fit radar chart scale
    "Growth Rate": type.growthRate / 2, 
    "Price Growth": type.priceGrowth / 50,
    "Investor Appeal": type.investorAppeal,
    "Future Outlook": type.futureOutlook,
    fullMark: 10,
    color: type.color
  };
});

// Component Function
const MarketAnalysis = () => {
  const [activeTab, setActiveTab] = useState("market");
  const [activeModel, setActiveModel] = useState<string>("bronco"); 
  const [selectedVehicleType, setSelectedVehicleType] = useState<string | null>(null);
  
  // For intersection observer and animation
  const { ref: overviewRef, inView: overviewInView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  
  const { ref: decadesRef, inView: decadesInView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  
  const { ref: modelsRef, inView: modelsInView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  
  const { ref: investmentRef, inView: investmentInView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  
  // D3 heatmap ref
  const heatmapRef = useRef<HTMLDivElement>(null);
  
  // Create D3 heatmap when heatmapRef or data changes
  useEffect(() => {
    if (heatmapRef.current) {
      createHeatmap(heatmapRef.current, VEHICLE_INVESTMENT_MATRIX);
    }
  }, [heatmapRef]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        duration: 0.5
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
    }
  };

  // Calculate growth percentage for dashboard metrics
  const currentYearData = GLOBAL_MARKET_SIZE[2]; // 2024
  const fiveYearForecast = GLOBAL_MARKET_SIZE[7]; // 2029
  const growthPercentage = ((fiveYearForecast.restomod - currentYearData.restomod) / currentYearData.restomod * 100).toFixed(1);
  
  // Filter model data
  const selectedModel = MODEL_DATA.find(model => model.id === activeModel) || MODEL_DATA[0];

  // Prepare data for the model value factors chart
  const valueFactorsData = selectedModel.valueFactors.map(factor => ({
    name: factor.factor,
    value: factor.impact,
    fill: selectedModel.color
  }));

  return (
    <div className="bg-white">
      <PageHeader
        title="Restomod Market Analysis"
        subtitle="Comprehensive Investment Data & Market Projections (2005-2045)"
        imageSrc="https://images.unsplash.com/photo-1532578498858-e8ccfe449ac7?q=80&w=1600&auto=format&fit=crop"
      />
      
      {/* Model Valuation Button */}
      <div className="bg-white py-4 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-4 sm:mb-0">
              <h3 className="text-xl font-medium">Looking for specific model values?</h3>
              <p className="text-muted-foreground">Check our detailed model-specific valuations with exact dollar figures</p>
            </div>
            <Button 
              className="bg-burgundy hover:bg-burgundy/90 text-white"
              size="lg"
              asChild
            >
              <Link href="/model-values">View Model Valuations</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Model-Specific Valuation Data */}
      <section className="py-12 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold font-playfair mb-2">Premium Model Valuations</h2>
              <p className="text-muted-foreground max-w-3xl">
                Detailed investment metrics with exact dollar figures for specific premium restomod platforms, based on recent auction data and completed builds
              </p>
            </div>
            
            <ModelValueAnalysis />
          </motion.div>
        </div>
      </section>
      
      {/* Market Dashboard */}
      <section className="py-8 bg-offwhite">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            <Card className="bg-white shadow-sm border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-charcoal/80 font-medium flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-burgundy" />
                  Current Market Size
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-charcoal">${currentYearData.restomod}B</span>
                  <span className="ml-2 text-sm text-green-600 font-medium">+{currentYearData.percentage}%</span>
                </div>
                <p className="text-xs text-charcoal/60 mt-1">
                  Restomod segment within ${currentYearData.classics}B global classic car market
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-charcoal/80 font-medium flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-burgundy" />
                  5-Year Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-charcoal">${fiveYearForecast.restomod}B</span>
                  <span className="ml-2 text-sm text-green-600 font-medium">+{growthPercentage}%</span>
                </div>
                <p className="text-xs text-charcoal/60 mt-1">
                  Projected restomod market value by 2029 (CAGR: 11.2%)
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-charcoal/80 font-medium flex items-center gap-2">
                  <Car className="h-5 w-5 text-burgundy" />
                  Top Performer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-charcoal">Ford Bronco</span>
                </div>
                <p className="text-xs text-charcoal/60 mt-1">
                  1017% value growth (2005-2025), 12.4% CAGR
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-charcoal/80 font-medium flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-burgundy" />
                  Premium Builder ROI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-charcoal">213%</span>
                </div>
                <p className="text-xs text-charcoal/60 mt-1">
                  Average 10-year return on premium builder restomods
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Main Navigation & Tab System */}
      <section className="py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h2 className="text-3xl md:text-4xl font-playfair font-bold text-charcoal mb-4">
                The Ascendant Restomod Marketplace
              </h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-charcoal/80">
                  The restomod vehicle market has transitioned from a niche enthusiast pursuit to a significant and increasingly valuable segment within the broader collectible car landscape. This comprehensive analysis provides in-depth market insights and investment projections from 2005 through 2045.
                </p>
              </div>
            </motion.div>
          </div>

          <Tabs
            defaultValue="market"
            value={activeTab}
            onValueChange={setActiveTab}
            className="mb-8"
          >
            <div className="flex justify-center mb-8">
              <TabsList className="bg-offwhite p-1">
                <TabsTrigger value="market" className="relative px-6 py-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>Market Overview</span>
                  </div>
                  {activeTab === "market" && (
                    <motion.div 
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-burgundy" 
                      layoutId="activeTabLine"
                    />
                  )}
                </TabsTrigger>
                <TabsTrigger value="demographics" className="relative px-6 py-2">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="h-4 w-4" />
                    <span>Vehicle Demographics</span>
                  </div>
                  {activeTab === "demographics" && (
                    <motion.div 
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-burgundy" 
                      layoutId="activeTabLine"
                    />
                  )}
                </TabsTrigger>
                <TabsTrigger value="models" className="relative px-6 py-2">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    <span>Model Analysis</span>
                  </div>
                  {activeTab === "models" && (
                    <motion.div 
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-burgundy" 
                      layoutId="activeTabLine"
                    />
                  )}
                </TabsTrigger>
                <TabsTrigger value="investment" className="relative px-6 py-2">
                  <div className="flex items-center gap-2">
                    <CircleDollarSign className="h-4 w-4" />
                    <span>Investment Insights</span>
                  </div>
                  {activeTab === "investment" && (
                    <motion.div 
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-burgundy" 
                      layoutId="activeTabLine"
                    />
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Market Overview Tab */}
            <TabsContent value="market" ref={overviewRef} className="mt-0">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate={overviewInView ? "visible" : "hidden"}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
              >
                {/* Market Growth Chart */}
                <motion.div variants={cardVariants}>
                  <Tilt options={tiltOptions}>
                    <Card className="overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow h-full">
                      <CardHeader className="pb-4 border-b border-gray-100">
                        <CardTitle className="flex items-center justify-between">
                          <span className="font-playfair text-xl">Restomod Market Growth</span>
                          <Badge variant="outline" className="bg-burgundy/10 text-burgundy">
                            2022-2032
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Growth trajectory of the restomod segment within the global classic car market
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart
                              data={GLOBAL_MARKET_SIZE}
                              margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                            >
                              <defs>
                                <linearGradient id="colorRestomod" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={COLORS.burgundy} stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor={COLORS.burgundy} stopOpacity={0.2}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                              <XAxis 
                                dataKey="year" 
                                tick={{ fill: COLORS.charcoal }} 
                                tickMargin={10} 
                              />
                              <YAxis 
                                yAxisId="left"
                                tick={{ fill: COLORS.charcoal }}
                                tickFormatter={(value) => `$${value}B`}
                                domain={[0, 90]}
                              />
                              <YAxis 
                                yAxisId="right"
                                orientation="right"
                                tickFormatter={(value) => `${value}%`}
                                domain={[0, 50]}
                              />
                              <Tooltip 
                                formatter={(value, name) => {
                                  return name === "Market Share" 
                                    ? [`${value}%`, name] 
                                    : [`$${value}B`, name]
                                }}
                                contentStyle={{
                                  backgroundColor: COLORS.offwhite,
                                  borderColor: COLORS.silver,
                                }}
                              />
                              <Legend 
                                align="center" 
                                verticalAlign="bottom" 
                              />
                              <Area
                                yAxisId="left"
                                type="monotone"
                                dataKey="classics"
                                name="Total Classic Car Market"
                                stroke={COLORS.steel}
                                fill={COLORS.steel}
                                fillOpacity={0.1}
                                activeDot={{ r: 8 }}
                                dot={false}
                              />
                              <Area
                                yAxisId="left"
                                type="monotone"
                                dataKey="restomod"
                                name="Restomod Segment"
                                stroke={COLORS.burgundy}
                                strokeWidth={2}
                                fill="url(#colorRestomod)"
                                activeDot={{ r: 8, fill: COLORS.burgundy }}
                                dot={false}
                              />
                              <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="percentage"
                                name="Market Share"
                                stroke={COLORS.gold}
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 6, fill: COLORS.gold }}
                              />
                            </ComposedChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t border-gray-100 pt-4 pb-2 text-xs text-charcoal/60">
                        <div className="grid grid-cols-2 w-full gap-4 text-center">
                          <div>
                            <p className="font-semibold mb-1">2024 Market Size</p>
                            <p className="text-xl font-bold text-burgundy">$5.3B</p>
                          </div>
                          <div>
                            <p className="font-semibold mb-1">2032 Projection</p>
                            <p className="text-xl font-bold text-burgundy">$30.7B</p>
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  </Tilt>
                </motion.div>

                {/* Growth Drivers */}
                <motion.div variants={cardVariants}>
                  <Tilt options={tiltOptions}>
                    <Card className="overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow h-full">
                      <CardHeader className="pb-4 border-b border-gray-100">
                        <CardTitle className="flex items-center justify-between">
                          <span className="font-playfair text-xl">Market Growth Drivers</span>
                          <Badge variant="outline" className="bg-burgundy/10 text-burgundy">
                            Key Factors
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Primary forces driving the exceptional growth in the restomod market
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="space-y-5">
                          <div className="flex gap-4 items-start">
                            <div className="w-12 h-12 rounded-full bg-burgundy/10 flex items-center justify-center flex-shrink-0">
                              <Users className="h-6 w-6 text-burgundy" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-lg mb-1">Generational Shift</h3>
                              <p className="text-charcoal/70 text-sm">
                                Younger enthusiasts (Gen X, Millennials) increasingly value modern drivability and technology alongside classic aesthetics, driving demand for modernized vehicles.
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex gap-4 items-start">
                            <div className="w-12 h-12 rounded-full bg-burgundy/10 flex items-center justify-center flex-shrink-0">
                              <Gauge className="h-6 w-6 text-burgundy" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-lg mb-1">Technical Accessibility</h3>
                              <p className="text-charcoal/70 text-sm">
                                Availability of modern crate engines, suspension systems, and plug-and-play electronic systems has democratized high-quality builds and expanded the market.
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex gap-4 items-start">
                            <div className="w-12 h-12 rounded-full bg-burgundy/10 flex items-center justify-center flex-shrink-0">
                              <TrendingUp className="h-6 w-6 text-burgundy" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-lg mb-1">Investment Performance</h3>
                              <p className="text-charcoal/70 text-sm">
                                Demonstrated appreciation (8-12% annual growth) for premium restomods has attracted investors seeking tangible assets with both enjoyment value and return potential.
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex gap-4 items-start">
                            <div className="w-12 h-12 rounded-full bg-burgundy/10 flex items-center justify-center flex-shrink-0">
                              <Trophy className="h-6 w-6 text-burgundy" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-lg mb-1">Builder Prestige</h3>
                              <p className="text-charcoal/70 text-sm">
                                The emergence of high-profile builders with wait lists and six-figure premiums has established a luxury tier in the market, elevating the entire segment.
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Tilt>
                </motion.div>
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate={overviewInView ? "visible" : "hidden"}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
              >
                {/* Future Market Projection */}
                <motion.div variants={cardVariants}>
                  <Tilt options={tiltOptions}>
                    <Card className="overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow h-full">
                      <CardHeader className="pb-4 border-b border-gray-100">
                        <CardTitle className="flex items-center justify-between">
                          <span className="font-playfair text-xl">Future Market Projection</span>
                          <Badge variant="outline" className="bg-burgundy/10 text-burgundy">
                            2025-2045
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Long-term forecast for classic vehicles by segment type
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={MARKET_FORECAST}
                              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                              <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={COLORS.steel} stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor={COLORS.steel} stopOpacity={0.01}/>
                                </linearGradient>
                                <linearGradient id="colorRestomod2" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={COLORS.burgundy} stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor={COLORS.burgundy} stopOpacity={0.2}/>
                                </linearGradient>
                                <linearGradient id="colorOriginal" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={COLORS.gold} stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor={COLORS.gold} stopOpacity={0.2}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                              <XAxis dataKey="year" />
                              <YAxis tickFormatter={(value) => `$${value}B`} />
                              <Tooltip 
                                formatter={(value, name) => {
                                  if (name === "CAGR") return [`${value}%`, name];
                                  return [`$${value}B`, name];
                                }}
                                contentStyle={{
                                  backgroundColor: COLORS.offwhite,
                                  borderColor: COLORS.silver,
                                }}
                              />
                              <Legend />
                              <Area
                                type="monotone"
                                dataKey="value"
                                name="Total Market Value"
                                stroke={COLORS.steel}
                                fill="url(#colorTotal)"
                                activeDot={false}
                              />
                              <Area
                                type="monotone"
                                dataKey="restomodShare"
                                name="Restomod Segment"
                                stroke={COLORS.burgundy}
                                fill="url(#colorRestomod2)"
                                activeDot={{ r: 6 }}
                              />
                              <Area
                                type="monotone"
                                dataKey="originalShare"
                                name="Original Classics"
                                stroke={COLORS.gold}
                                fill="url(#colorOriginal)"
                                activeDot={{ r: 6 }}
                              />
                              <Line
                                type="monotone"
                                dataKey="cagr"
                                name="CAGR"
                                stroke="#000000"
                                strokeDasharray="5 5"
                                strokeWidth={1}
                                dot={{ r: 3 }}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </Tilt>
                </motion.div>

                {/* Market Share by Vehicle Type */}
                <motion.div variants={cardVariants}>
                  <Tilt options={tiltOptions}>
                    <Card className="overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow h-full">
                      <CardHeader className="pb-4 border-b border-gray-100">
                        <CardTitle className="flex items-center justify-between">
                          <span className="font-playfair text-xl">Market Share by Vehicle Type</span>
                          <Badge variant="outline" className="bg-burgundy/10 text-burgundy">
                            2024
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Current restomod market segmentation by vehicle category
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={VEHICLE_TYPE_SHARE}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={110}
                                fill={COLORS.burgundy}
                                dataKey="value"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                animationDuration={1000}
                                animationBegin={200}
                              >
                                {VEHICLE_TYPE_SHARE.map((entry, index) => (
                                  <Cell 
                                    key={`cell-${index}`} 
                                    fill={entry.color} 
                                    stroke="white" 
                                    strokeWidth={2}
                                  />
                                ))}
                              </Pie>
                              <Tooltip 
                                formatter={(value) => [`${value}%`, 'Market Share']}
                                contentStyle={{
                                  backgroundColor: COLORS.offwhite,
                                  borderColor: COLORS.silver,
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t border-gray-100 pt-4 text-xs text-charcoal/60">
                        <p>
                          American muscle cars lead market share, but vintage trucks/SUVs and Japanese classics show the fastest growth rates.
                        </p>
                      </CardFooter>
                    </Card>
                  </Tilt>
                </motion.div>
              </motion.div>
            </TabsContent>

            {/* Vehicle Demographics Tab */}
            <TabsContent value="demographics" ref={decadesRef} className="mt-0">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate={decadesInView ? "visible" : "hidden"}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
              >
                {/* Decade Value Growth Chart */}
                <motion.div variants={cardVariants}>
                  <Tilt options={tiltOptions}>
                    <Card className="overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow h-full">
                      <CardHeader className="pb-4 border-b border-gray-100">
                        <CardTitle className="flex items-center justify-between">
                          <span className="font-playfair text-xl">Annual Growth Rate by Decade</span>
                          <Badge variant="outline" className="bg-burgundy/10 text-burgundy">
                            CAGR
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Compound annual growth rates for vehicles from different production decades
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={DECADE_VALUE_GROWTH}
                              margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                              <XAxis 
                                dataKey="decade" 
                                tick={{ fill: COLORS.charcoal }}
                                axisLine={{ stroke: COLORS.silver }}
                              />
                              <YAxis 
                                tickFormatter={(value) => `${value}%`}
                                domain={[0, 14]}
                                axisLine={{ stroke: COLORS.silver }}
                              />
                              <Tooltip 
                                formatter={(value) => [`${value}%`, 'CAGR']}
                                contentStyle={{
                                  backgroundColor: COLORS.offwhite,
                                  borderColor: COLORS.silver,
                                }}
                              />
                              <Bar 
                                dataKey="cagr" 
                                name="Annual Growth Rate" 
                                fill={COLORS.burgundy}
                                radius={[4, 4, 0, 0]}
                                barSize={60}
                                animationDuration={1500}
                                animationBegin={300}
                              >
                                {DECADE_VALUE_GROWTH.map((entry, index) => (
                                  <Cell 
                                    key={`cell-${index}`}
                                    fill={index === 4 ? COLORS.gold : COLORS.burgundy}
                                  />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t border-gray-100 pt-4 pb-2 text-xs text-charcoal/60">
                        <p>
                          1990s vehicles show the highest growth rate (12.1%) due to emerging classic status and strong millennial buyer interest.
                        </p>
                      </CardFooter>
                    </Card>
                  </Tilt>
                </motion.div>

                {/* Vehicle Type Matrix */}
                <motion.div variants={cardVariants}>
                  <Tilt options={tiltOptions}>
                    <Card className="overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow h-full">
                      <CardHeader className="pb-4 border-b border-gray-100">
                        <CardTitle className="flex items-center justify-between">
                          <span className="font-playfair text-xl">Vehicle Type Performance</span>
                          <Badge variant="outline" className="bg-burgundy/10 text-burgundy">
                            Comparison
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Multi-dimension analysis of different vehicle type segments
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart 
                              cx="50%" 
                              cy="50%" 
                              outerRadius="80%" 
                              data={radarDataByType}
                            >
                              <PolarGrid stroke={COLORS.silver} />
                              <PolarAngleAxis dataKey="subject" />
                              <PolarRadiusAxis angle={90} domain={[0, 10]} />
                              <Radar 
                                name="American Muscle Cars" 
                                dataKey="Investor Appeal" 
                                stroke={VEHICLE_TYPE_DATA[0].color} 
                                fill={VEHICLE_TYPE_DATA[0].color} 
                                fillOpacity={0.5} 
                                isAnimationActive={true}
                                animationDuration={1500}
                                animationBegin={300}
                              />
                              <Radar 
                                name="Vintage Trucks/SUVs" 
                                dataKey="Growth Rate" 
                                stroke={VEHICLE_TYPE_DATA[1].color} 
                                fill={VEHICLE_TYPE_DATA[1].color} 
                                fillOpacity={0.5} 
                                isAnimationActive={true}
                                animationDuration={1500}
                                animationBegin={500}
                              />
                              <Radar 
                                name="European Sports Cars" 
                                dataKey="Future Outlook" 
                                stroke={VEHICLE_TYPE_DATA[2].color} 
                                fill={VEHICLE_TYPE_DATA[2].color} 
                                fillOpacity={0.5} 
                                isAnimationActive={true}
                                animationDuration={1500}
                                animationBegin={700}
                              />
                              <Tooltip />
                              <Legend />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </Tilt>
                </motion.div>
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate={decadesInView ? "visible" : "hidden"}
              >
                <motion.div variants={cardVariants} className="mb-12">
                  <Tilt options={tiltOptions}>
                    <Card className="overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-4 border-b border-gray-100">
                        <CardTitle className="flex items-center justify-between">
                          <span className="font-playfair text-xl">Investment Performance by Vehicle Type & Decade</span>
                          <Badge variant="outline" className="bg-burgundy/10 text-burgundy">
                            Heatmap
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Comparative visualization of investment performance across vehicle categories and time periods
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-6 flex justify-center">
                        <div ref={heatmapRef} className="h-[400px] w-full max-w-3xl"></div>
                      </CardContent>
                      <CardFooter className="border-t border-gray-100 pt-4 text-xs text-charcoal/60">
                        <p>
                          Highest ROI: 1980s Trucks/SUVs (9.6) and 1990s Japanese Classics (9.3). Values represent growth rate/ROI on a 1-10 scale.
                        </p>
                      </CardFooter>
                    </Card>
                  </Tilt>
                </motion.div>

                <motion.div variants={cardVariants}>
                  <Tilt options={tiltOptions}>
                    <Card className="overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-4 border-b border-gray-100">
                        <CardTitle className="flex items-center justify-between">
                          <span className="font-playfair text-xl">Decade Analysis & Investment Insights</span>
                          <Badge variant="outline" className="bg-burgundy/10 text-burgundy">
                            Details
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                          {DECADE_VALUE_GROWTH.map((decade, index) => (
                            <div 
                              key={index} 
                              className="bg-offwhite rounded-sm p-5 hover:shadow-md transition-shadow"
                            >
                              <h3 className="text-xl font-playfair mb-2 flex justify-between">
                                <span>{decade.decade}</span>
                                <span className="text-burgundy">{decade.cagr}%</span>
                              </h3>
                              <p className="text-sm text-charcoal/80 mb-3">{decade.description}</p>
                              <p className="text-xs font-medium mb-1">Notable Examples:</p>
                              <p className="text-xs text-charcoal/70">{decade.examples}</p>
                              <div className="mt-4 pt-4 border-t border-gray-300">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs">Avg Build:</span>
                                  <span className="text-sm font-medium">${(decade.avgBuild/1000).toFixed(0)}k</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-xs">High-End:</span>
                                  <span className="text-sm font-medium">${(decade.highEnd/1000).toFixed(0)}k</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </Tilt>
                </motion.div>
              </motion.div>
            </TabsContent>

            {/* Model Analysis Tab */}
            <TabsContent value="models" ref={modelsRef} className="mt-0">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate={modelsInView ? "visible" : "hidden"}
                className="grid grid-cols-1 gap-8 mb-8"
              >
                <motion.div variants={cardVariants}>
                  <Card className="overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow h-full">
                    <CardHeader className="pb-4 border-b border-gray-100">
                      <CardTitle className="flex items-center justify-between">
                        <span className="font-playfair text-xl">Top Model Value Trends (2005-2025)</span>
                        <Badge variant="outline" className="bg-burgundy/10 text-burgundy">
                          Indexed to 100
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        20-year value appreciation for premium restomod models
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={MODEL_VALUE_TRENDS}
                            margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis 
                              dataKey="year" 
                              tick={{ fill: COLORS.charcoal }}
                              axisLine={{ stroke: COLORS.silver }}
                            />
                            <YAxis 
                              domain={[0, 1100]}
                              axisLine={{ stroke: COLORS.silver }}
                            />
                            <Tooltip 
                              formatter={(value) => [`Index: ${value}`, '']}
                              contentStyle={{
                                backgroundColor: COLORS.offwhite,
                                borderColor: COLORS.silver,
                              }}
                            />
                            <Legend 
                              verticalAlign="top" 
                              height={36}
                              iconType="circle"
                            />
                            <Line 
                              type="monotone" 
                              dataKey="mustang" 
                              name="Ford Mustang (1967-69)" 
                              stroke={MODEL_DATA[0].color} 
                              strokeWidth={2}
                              activeDot={{ r: 6, strokeWidth: 2 }}
                              dot={{ r: 0 }}
                              animationDuration={2000}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="bronco" 
                              name="Ford Bronco (1966-77)" 
                              stroke={MODEL_DATA[1].color} 
                              strokeWidth={2}
                              activeDot={{ r: 6, strokeWidth: 2 }}
                              dot={{ r: 0 }}
                              animationDuration={2000}
                              animationBegin={200}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="defender" 
                              name="Land Rover Defender" 
                              stroke={MODEL_DATA[2].color} 
                              strokeWidth={2}
                              activeDot={{ r: 6, strokeWidth: 2 }}
                              dot={{ r: 0 }}
                              animationDuration={2000}
                              animationBegin={400}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="camaro" 
                              name="Chevrolet Camaro (1967-69)" 
                              stroke={MODEL_DATA[3].color} 
                              strokeWidth={2}
                              activeDot={{ r: 6, strokeWidth: 2 }}
                              dot={{ r: 0 }}
                              animationDuration={2000}
                              animationBegin={600}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="porsche911" 
                              name="Porsche 911 (1964-73)" 
                              stroke={MODEL_DATA[4].color} 
                              strokeWidth={2}
                              activeDot={{ r: 6, strokeWidth: 2 }}
                              dot={{ r: 0 }}
                              animationDuration={2000}
                              animationBegin={800}
                            />
                            <Brush 
                              dataKey="year" 
                              height={30} 
                              stroke={COLORS.steel}
                              startIndex={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-6 grid grid-cols-5 gap-2">
                        {MODEL_DATA.map(model => (
                          <Button
                            key={model.id}
                            variant={activeModel === model.id ? "default" : "outline"}
                            className={`px-3 py-2 text-xs flex flex-col items-center justify-center h-auto ${
                              activeModel === model.id 
                                ? "bg-burgundy hover:bg-burgundy/90 text-white" 
                                : "border-gray-200 hover:bg-gray-50"
                            }`}
                            onClick={() => setActiveModel(model.id)}
                          >
                            <span className="font-medium">{model.name.split(' ')[0]}</span>
                            <span className="mt-1 text-[10px]">{model.appreciationIndex}% Growth</span>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate={modelsInView ? "visible" : "hidden"}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
              >
                {/* Selected Model Analysis */}
                <motion.div variants={cardVariants}>
                  <Tilt options={tiltOptions}>
                    <Card className="overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow h-full">
                      <CardHeader className="pb-4 border-b border-gray-100">
                        <CardTitle className="flex items-center justify-between">
                          <span className="font-playfair text-xl">{selectedModel.name}</span>
                          <Badge variant="outline" className="bg-burgundy/10 text-burgundy">
                            {selectedModel.category}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Detailed investment analysis and market positioning
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <p className="text-charcoal/80 mb-6">
                          {selectedModel.description}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-offwhite rounded-sm p-3">
                            <p className="text-xs text-charcoal/60 mb-1">Annual Growth Rate</p>
                            <p className="text-2xl font-bold" style={{ color: selectedModel.color }}>
                              {selectedModel.cagr}%
                            </p>
                          </div>
                          <div className="bg-offwhite rounded-sm p-3">
                            <p className="text-xs text-charcoal/60 mb-1">20-Year Growth</p>
                            <p className="text-2xl font-bold" style={{ color: selectedModel.color }}>
                              {selectedModel.keyMetrics.appreciationIndex}%
                            </p>
                          </div>
                          <div className="bg-offwhite rounded-sm p-3">
                            <p className="text-xs text-charcoal/60 mb-1">Average Build Cost</p>
                            <p className="text-2xl font-bold" style={{ color: selectedModel.color }}>
                              ${(selectedModel.keyMetrics.averageBuild/1000).toFixed(0)}k
                            </p>
                          </div>
                          <div className="bg-offwhite rounded-sm p-3">
                            <p className="text-xs text-charcoal/60 mb-1">Top Tier Build</p>
                            <p className="text-2xl font-bold" style={{ color: selectedModel.color }}>
                              ${(selectedModel.keyMetrics.topTier/1000).toFixed(0)}k
                            </p>
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <h3 className="text-base font-medium mb-3">Value Factor Impact</h3>
                          <div className="space-y-3">
                            {selectedModel.valueFactors.map((factor, index) => (
                              <div key={index} className="relative">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>{factor.factor}</span>
                                  <span className="font-medium">{factor.impact}/10</span>
                                </div>
                                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <motion.div
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: selectedModel.color }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${factor.impact * 10}%` }}
                                    transition={{ duration: 1, delay: index * 0.1 }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t border-gray-100 pt-4 pb-3 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-charcoal/60">Liquidity Score:</span>
                          <div className="flex space-x-0.5">
                            {[...Array(10)].map((_, i) => (
                              <div 
                                key={i} 
                                className={`w-2 h-3 ${i < selectedModel.keyMetrics.liquidityScore 
                                  ? 'bg-green-500' 
                                  : 'bg-gray-200'}`}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-medium">{selectedModel.keyMetrics.liquidityScore}/10</span>
                        </div>
                        <span className="text-xs">Build Time: {selectedModel.keyMetrics.buildTime}</span>
                      </CardFooter>
                    </Card>
                  </Tilt>
                </motion.div>

                {/* Value Factor Impact */}
                <motion.div variants={cardVariants}>
                  <Tilt options={tiltOptions}>
                    <Card className="overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow h-full">
                      <CardHeader className="pb-4 border-b border-gray-100">
                        <CardTitle className="flex items-center justify-between">
                          <span className="font-playfair text-xl">Component Market Analysis</span>
                          <Badge variant="outline" className="bg-burgundy/10 text-burgundy">
                            Build Data
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Most popular components and their market share
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <Tabs defaultValue="powertrain" className="w-full">
                          <TabsList className="w-full justify-between mb-6">
                            {POPULAR_COMPONENTS.map((category, index) => (
                              <TabsTrigger 
                                key={index} 
                                value={category.category.toLowerCase()}
                                className="text-xs"
                              >
                                {category.category}
                              </TabsTrigger>
                            ))}
                          </TabsList>
                          
                          {POPULAR_COMPONENTS.map((category, categoryIndex) => (
                            <TabsContent 
                              key={categoryIndex} 
                              value={category.category.toLowerCase()}
                              className="mt-0"
                            >
                              <div className="h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart
                                    data={category.components}
                                    layout="vertical"
                                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                    <XAxis 
                                      type="number" 
                                      domain={[0, 40]} 
                                      label={{ 
                                        value: 'Market Share (%)', 
                                        position: 'insideBottom',
                                        offset: -5
                                      }}
                                    />
                                    <YAxis 
                                      dataKey="name" 
                                      type="category" 
                                      width={160}
                                      tick={{ fontSize: 11 }}
                                    />
                                    <Tooltip
                                      formatter={(value, name, props) => {
                                        const component = props.payload;
                                        return [
                                          <>
                                            <div className="font-medium">{value}% Market Share</div>
                                            <div className="text-xs mt-1 text-charcoal/70">Price Range: {component.price}</div>
                                            {component.yearIntroduced && (
                                              <div className="text-xs text-charcoal/70">Introduced: {component.yearIntroduced}</div>
                                            )}
                                          </>,
                                          category.category
                                        ];
                                      }}
                                      contentStyle={{
                                        backgroundColor: COLORS.offwhite,
                                        borderColor: COLORS.silver,
                                        fontSize: 12
                                      }}
                                    />
                                    <Bar 
                                      dataKey="popularity" 
                                      fill={COLORS.burgundy}
                                      radius={[0, 4, 4, 0]}
                                      animationDuration={1200}
                                    >
                                      {category.components.map((entry, index) => (
                                        <Cell 
                                          key={`cell-${index}`} 
                                          fill={index === 0 ? COLORS.burgundy : (
                                            index === 1 ? COLORS.gold : (
                                              index === category.components.length - 1 ? COLORS.silver : COLORS.steel
                                            )
                                          )}
                                        />
                                      ))}
                                    </Bar>
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </TabsContent>
                          ))}
                        </Tabs>
                      </CardContent>
                      <CardFooter className="border-t border-gray-100 pt-4 pb-3 text-xs text-charcoal/60">
                        <p>
                          Modern crate engines (Ford Coyote, GM LS) dominate the powertrain market, while Tremec manual transmissions lead for gear selection.
                        </p>
                      </CardFooter>
                    </Card>
                  </Tilt>
                </motion.div>
              </motion.div>

              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate={modelsInView ? "visible" : "hidden"}
                className="mb-8"
              >
                <Tilt options={tiltOptions}>
                  <Card className="overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-4 border-b border-gray-100">
                      <CardTitle className="flex items-center justify-between">
                        <span className="font-playfair text-xl">Premium Builder Effect</span>
                        <Badge variant="outline" className="bg-burgundy/10 text-burgundy">
                          Value Analysis
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        The impact of builder reputation on restomod valuations
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart
                              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                              <XAxis 
                                type="number" 
                                dataKey="x" 
                                name="Reputation" 
                                domain={[8, 10]}
                                label={{ 
                                  value: 'Builder Reputation Score', 
                                  position: 'insideBottom',
                                  offset: -15
                                }}
                              />
                              <YAxis 
                                type="number" 
                                dataKey="y" 
                                name="Price Premium" 
                                domain={[100, 300]}
                                label={{ 
                                  value: 'Price Premium (%)', 
                                  angle: -90, 
                                  position: 'insideLeft',
                                  offset: -5
                                }}
                              />
                              <ZAxis 
                                type="number" 
                                dataKey="z" 
                                range={[60, 250]} 
                                name="Starting Price" 
                              />
                              <Tooltip 
                                cursor={{ strokeDasharray: '3 3' }}
                                formatter={(value, name, props) => {
                                  if (name === "Price Premium") return [`${value}%`, name];
                                  if (name === "Reputation") return [`${value}/10`, name];
                                  if (name === "Starting Price") return [`$${value * 10000}`, name];
                                  return [value, name];
                                }}
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                      <div className="bg-white border border-gray-200 shadow-md p-3 rounded-sm">
                                        <p className="font-medium">{data.name}</p>
                                        <p className="text-xs text-charcoal/70 mt-1">Reputation: {data.x}/10</p>
                                        <p className="text-xs text-charcoal/70">Price Premium: {data.y}%</p>
                                        <p className="text-xs text-charcoal/70">Starting Price: ${(data.z * 10000).toLocaleString()}</p>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <Scatter 
                                name="Premium Builders" 
                                data={BUILDER_SCATTER_DATA} 
                                fill={COLORS.burgundy}
                                animationDuration={1500}
                              >
                                {BUILDER_SCATTER_DATA.map((entry, index) => (
                                  <Cell 
                                    key={`cell-${index}`} 
                                    fill={entry.color} 
                                  />
                                ))}
                              </Scatter>
                            </ScatterChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="flex flex-col justify-between">
                          <div>
                            <h3 className="text-lg font-medium mb-3">Builder Premium Findings</h3>
                            <ul className="space-y-3 text-charcoal/80">
                              <li className="flex gap-2">
                                <ArrowUpRight className="h-5 w-5 text-burgundy flex-shrink-0" />
                                <span>
                                  <strong className="font-medium">Exponential Value Curve:</strong> Each 0.5-point increase in builder reputation correlates to approximately a 30-50% increase in valuation premium.
                                </span>
                              </li>
                              <li className="flex gap-2">
                                <ArrowUpRight className="h-5 w-5 text-burgundy flex-shrink-0" />
                                <span>
                                  <strong className="font-medium">Specialized Focus:</strong> Builders with narrow specialization (e.g., Singer with Porsche 911s) command substantially higher premiums than diversified builders.
                                </span>
                              </li>
                              <li className="flex gap-2">
                                <ArrowUpRight className="h-5 w-5 text-burgundy flex-shrink-0" />
                                <span>
                                  <strong className="font-medium">Waitlist Effect:</strong> Builders with longer waitlists typically show stronger value retention and premium increases over time.
                                </span>
                              </li>
                            </ul>
                          </div>

                          <div className="mt-6 bg-offwhite p-4 rounded-sm">
                            <h3 className="font-medium mb-2">Investment Implications</h3>
                            <p className="text-sm text-charcoal/80 mb-4">
                              Vehicles from top-tier builders consistently outperform broader market trends by 30-85% over a 5-year horizon, acting as both investment-grade assets and usable collector vehicles.
                            </p>
                            <div className="flex gap-4">
                              <Button 
                                variant="default" 
                                className="bg-burgundy hover:bg-burgundy/90"
                              >
                                Builder Directory
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                              <Button variant="outline">
                                Investment Guide
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Tilt>
              </motion.div>
            </TabsContent>

            {/* Investment Insights Tab */}
            <TabsContent value="investment" ref={investmentRef} className="mt-0">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate={investmentInView ? "visible" : "hidden"}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
              >
                {/* Investment Comparison Chart */}
                <motion.div variants={cardVariants}>
                  <Tilt options={tiltOptions}>
                    <Card className="overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow h-full">
                      <CardHeader className="pb-4 border-b border-gray-100">
                        <CardTitle className="flex items-center justify-between">
                          <span className="font-playfair text-xl">Investment Comparison</span>
                          <Badge variant="outline" className="bg-burgundy/10 text-burgundy">
                            10-Year Returns
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Performance of premium restomods vs. traditional investment vehicles
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={INVESTMENT_COMPARISON}
                              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                              layout="vertical"
                            >
                              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
                              <XAxis 
                                type="number" 
                                domain={[0, 230]}
                                tickFormatter={(value) => `${value}%`}
                              />
                              <YAxis 
                                dataKey="name" 
                                type="category" 
                                width={150}
                                tick={{ fontSize: 13 }}
                              />
                              <Tooltip 
                                formatter={(value) => [`${value}%`, 'Return']}
                                contentStyle={{
                                  backgroundColor: COLORS.offwhite,
                                  borderColor: COLORS.silver,
                                }}
                              />
                              <Bar 
                                dataKey="value" 
                                radius={[0, 4, 4, 0]}
                                animationDuration={1500}
                              >
                                {INVESTMENT_COMPARISON.map((entry, index) => (
                                  <Cell 
                                    key={`cell-${index}`} 
                                    fill={entry.color}
                                  />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t border-gray-100 pt-4 pb-3 text-xs text-charcoal/60">
                        <p>
                          Premium restomods significantly outperformed traditional investment vehicles over the past decade, with returns approximately 80% higher than the S&P 500.
                        </p>
                      </CardFooter>
                    </Card>
                  </Tilt>
                </motion.div>

                {/* Risk Assessment */}
                <motion.div variants={cardVariants}>
                  <Tilt options={tiltOptions}>
                    <Card className="overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow h-full">
                      <CardHeader className="pb-4 border-b border-gray-100">
                        <CardTitle className="flex items-center justify-between">
                          <span className="font-playfair text-xl">Investment Risk Factors</span>
                          <Badge variant="outline" className="bg-burgundy/10 text-burgundy">
                            Assessment
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Key risk considerations for restomod investments
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-6 max-h-[500px] overflow-y-auto pr-2">
                        <div className="space-y-5">
                          {RISK_FACTORS.map((factor, index) => (
                            <motion.div 
                              key={index}
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true, margin: "-50px" }}
                              transition={{ delay: index * 0.1, duration: 0.6 }}
                              className="border-b border-gray-200 pb-5 last:border-0"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <h3 className="font-medium">{factor.title}</h3>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">Impact:</span>
                                  <div className="flex space-x-0.5">
                                    {[...Array(10)].map((_, i) => (
                                      <div 
                                        key={i} 
                                        className={`w-2 h-4 ${i < factor.impact 
                                          ? 'bg-burgundy' 
                                          : 'bg-gray-200'}`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm font-medium ml-1">{factor.impact}/10</span>
                                </div>
                              </div>
                              <p className="text-sm text-charcoal/80 mb-3">{factor.description}</p>
                              <div className="space-y-2">
                                <h4 className="text-xs font-medium">Risk Mitigations:</h4>
                                <ul className="space-y-1">
                                  {factor.mitigations.map((mitigation, mIndex) => (
                                    <li key={mIndex} className="text-xs flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-burgundy flex-shrink-0" />
                                      <span className="text-charcoal/70">{mitigation}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </Tilt>
                </motion.div>
              </motion.div>

              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate={investmentInView ? "visible" : "hidden"}
                className="mb-12"
              >
                <Tilt options={tiltOptions}>
                  <Card className="overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-4 border-b border-gray-100">
                      <CardTitle className="flex items-center justify-between">
                        <span className="font-playfair text-xl">Investment Strategy Guide</span>
                        <Badge variant="outline" className="bg-burgundy/10 text-burgundy">
                          Recommendations
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Optimal approaches for restomod investment based on market research
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-4">
                          <div className="w-12 h-12 rounded-full bg-burgundy/10 flex items-center justify-center">
                            <Trophy className="h-6 w-6 text-burgundy" />
                          </div>
                          <h3 className="text-lg font-medium">Builder Selection</h3>
                          <p className="text-sm text-charcoal/80">
                            Vehicles from Singer, Icon, and Ringbrothers command 2-4x premiums over similar models with lesser-known provenance, with accelerating value growth over time.
                          </p>
                          <div className="pt-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-charcoal/70">Quality Premium:</span>
                              <span className="font-medium">+120-250%</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between">
                              <span className="text-charcoal/70">Liquidity Factor:</span>
                              <span className="font-medium">9.2/10</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="w-12 h-12 rounded-full bg-burgundy/10 flex items-center justify-center">
                            <Clock className="h-6 w-6 text-burgundy" />
                          </div>
                          <h3 className="text-lg font-medium">Timeline Planning</h3>
                          <p className="text-sm text-charcoal/80">
                            Restomods typically require a 5+ year investment horizon, with minimal appreciation in the first 1-3 years followed by accelerating value growth in years 4-10.
                          </p>
                          <div className="pt-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-charcoal/70">Optimal Hold Period:</span>
                              <span className="font-medium">7-12 years</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between">
                              <span className="text-charcoal/70">Market Timing:</span>
                              <span className="font-medium">Early Cycle</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="w-12 h-12 rounded-full bg-burgundy/10 flex items-center justify-center">
                            <Network className="h-6 w-6 text-burgundy" />
                          </div>
                          <h3 className="text-lg font-medium">Documentation Value</h3>
                          <p className="text-sm text-charcoal/80">
                            Comprehensive build documentation, including original vehicle provenance and modification details, can add 5-10% to eventual resale value.
                          </p>
                          <div className="pt-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-charcoal/70">Value Addition:</span>
                              <span className="font-medium">+5-10%</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between">
                              <span className="text-charcoal/70">Market Impact:</span>
                              <span className="font-medium">Growing</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="w-12 h-12 rounded-full bg-burgundy/10 flex items-center justify-center">
                            <Scale className="h-6 w-6 text-burgundy" />
                          </div>
                          <h3 className="text-lg font-medium">Risk Balance</h3>
                          <p className="text-sm text-charcoal/80">
                            Diversification across both vehicle types and decades helps balance investment risk, with the strongest current opportunities in 1980s-1990s vehicles.
                          </p>
                          <div className="pt-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-charcoal/70">Emerging Segment:</span>
                              <span className="font-medium">Japanese Classics</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between">
                              <span className="text-charcoal/70">Risk-Adjusted Returns:</span>
                              <span className="font-medium">Excellent</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t border-gray-100 pt-4 flex justify-center">
                      <Button className="bg-burgundy hover:bg-burgundy/90">
                        <span>Download Investment Whitepaper</span>
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </Tilt>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-gradient-to-r from-charcoal to-burgundy">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center text-white max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-4">
              Ready to Start Your Restomod Journey?
            </h2>
            <p className="text-white/80 mb-8 text-lg">
              Whether you're looking to build a premium investment vehicle or create your dream restomod, our team can guide you through every step of the process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-white text-burgundy hover:bg-gold hover:text-white px-6 py-6 h-auto">
                <CircleDollarSign className="mr-2 h-5 w-5" />
                <span>Schedule Investment Consultation</span>
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white/10 px-6 py-6 h-auto">
                <Car className="mr-2 h-5 w-5" />
                <span>Explore Our Build Process</span>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default MarketAnalysis;