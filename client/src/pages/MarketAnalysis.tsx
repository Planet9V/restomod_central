import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';
import PageHeader from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, TrendingUp, BarChart3, PieChart as PieChartIcon, Clock } from "lucide-react";
import { COLORS } from "@/lib/constants";

// Market size data from research document
const GLOBAL_MARKET_SIZE = [
  { year: 2022, automotive: 5.5, classics: 36.5 },
  { year: 2023, automotive: 6.1, classics: 38.1 },
  { year: 2024, automotive: 6.8, classics: 39.7 },
  { year: 2025, automotive: 7.6, classics: 43.2 },
  { year: 2026, automotive: 8.4, classics: 47.0 },
  { year: 2027, automotive: 9.3, classics: 51.1 },
  { year: 2028, automotive: 10.4, classics: 55.6 },
  { year: 2029, automotive: 11.6, classics: 60.4 },
  { year: 2030, automotive: 12.9, classics: 65.7 },
  { year: 2031, automotive: 14.3, classics: 71.4 },
  { year: 2032, automotive: 15.9, classics: 77.8 },
];

// Value growth by vehicle decade
const DECADE_VALUE_GROWTH = [
  { decade: "1950s", cagr: 7.1, description: "Post-war classics with iconic styling" },
  { decade: "1960s", cagr: 9.8, description: "Peak muscle car & sports car era" },
  { decade: "1970s", cagr: 8.3, description: "Transition to modern features" },
  { decade: "1980s", cagr: 10.4, description: "Rising 'youngtimer' popularity" },
  { decade: "1990s", cagr: 12.1, description: "Newest entrants to classic status" },
];

// Market share by vehicle type
const VEHICLE_TYPE_SHARE = [
  { name: "American Muscle", value: 28, color: COLORS.burgundy },
  { name: "Vintage Trucks/SUVs", value: 24, color: COLORS.gold },
  { name: "European Sports Cars", value: 21, color: COLORS.steel },
  { name: "Classic Luxury", value: 14, color: COLORS.charcoal },
  { name: "Japanese Classics", value: 8, color: COLORS.silver },
  { name: "Other", value: 5, color: "#AAAAAA" },
];

// Top model historical value trends (indexed to 100 in 2005)
const MODEL_VALUE_TRENDS = [
  { year: 2005, mustang: 100, bronco: 100, defender: 100, camaro: 100, porsche911: 100 },
  { year: 2006, mustang: 104, bronco: 102, defender: 103, camaro: 105, porsche911: 106 },
  { year: 2007, mustang: 108, bronco: 104, defender: 107, camaro: 110, porsche911: 114 },
  { year: 2008, mustang: 113, bronco: 107, defender: 112, camaro: 117, porsche911: 123 },
  { year: 2009, mustang: 118, bronco: 110, defender: 118, camaro: 123, porsche911: 129 },
  { year: 2010, mustang: 126, bronco: 118, defender: 129, camaro: 134, porsche911: 142 },
  { year: 2011, mustang: 136, bronco: 130, defender: 145, camaro: 147, porsche911: 158 },
  { year: 2012, mustang: 147, bronco: 147, defender: 165, camaro: 161, porsche911: 174 },
  { year: 2013, mustang: 158, bronco: 169, defender: 189, camaro: 176, porsche911: 193 },
  { year: 2014, mustang: 169, bronco: 194, defender: 215, camaro: 191, porsche911: 214 },
  { year: 2015, mustang: 184, bronco: 225, defender: 246, camaro: 210, porsche911: 238 },
  { year: 2016, mustang: 201, bronco: 261, defender: 276, camaro: 229, porsche911: 268 },
  { year: 2017, mustang: 221, bronco: 304, defender: 311, camaro: 252, porsche911: 302 },
  { year: 2018, mustang: 243, bronco: 355, defender: 347, camaro: 276, porsche911: 339 },
  { year: 2019, mustang: 269, bronco: 410, defender: 389, camaro: 301, porsche911: 383 },
  { year: 2020, mustang: 295, bronco: 482, defender: 429, camaro: 335, porsche911: 433 },
  { year: 2021, mustang: 325, bronco: 567, defender: 481, camaro: 371, porsche911: 489 },
  { year: 2022, mustang: 357, bronco: 660, defender: 537, camaro: 410, porsche911: 554 },
  { year: 2023, mustang: 389, bronco: 762, defender: 594, camaro: 451, porsche911: 625 },
  { year: 2024, mustang: 428, bronco: 882, defender: 650, camaro: 499, porsche911: 706 },
  { year: 2025, mustang: 475, bronco: 1017, defender: 728, camaro: 548, porsche911: 799 },
];

// Market forecast data
const MARKET_FORECAST = [
  { year: 2025, value: 42.8, restomodShare: 8.6 },
  { year: 2030, value: 65.7, restomodShare: 17.1 },
  { year: 2035, value: 97.4, restomodShare: 31.2 },
  { year: 2040, value: 139.8, restomodShare: 51.7 },
  { year: 2045, value: 198.5, restomodShare: 79.4 },
];

// Investment comparison data (10-year return)
const INVESTMENT_COMPARISON = [
  { name: "Premium Restomods", value: 213, color: COLORS.burgundy },
  { name: "Classic Cars (Original)", value: 91, color: COLORS.gold },
  { name: "S&P 500", value: 118, color: COLORS.steel },
  { name: "Real Estate", value: 63, color: COLORS.charcoal },
  { name: "Gold", value: 42, color: COLORS.silver },
];

// Risk factors
const RISK_FACTORS = [
  { 
    title: "Market Volatility", 
    description: "The collector car market can experience significant fluctuations based on economic conditions, generational preferences, and other external factors.",
    impact: 7
  },
  { 
    title: "Build Quality Variations", 
    description: "The quality and reputation of the builder significantly impact restomod values, with premium builders commanding substantial premiums.",
    impact: 9
  },
  { 
    title: "Modification Subjectivity", 
    description: "The subjective nature of modifications means that personal taste can significantly impact marketability and resale value.",
    impact: 8
  },
  { 
    title: "Initial Cost Hurdles", 
    description: "High acquisition and build costs can limit the potential for short-term returns, making restomods typically medium to long-term investments.",
    impact: 6
  },
  { 
    title: "Authenticity Debates", 
    description: "Ongoing tension between modification and preservation within collector communities can impact marketability to different buyer segments.",
    impact: 5
  },
];

const MarketAnalysis = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const chartVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <div className="bg-white">
      <PageHeader
        title="Restomod Market Analysis"
        subtitle="Comprehensive data on market trends, investment potential, and future outlook from 2005-2045"
        imageSrc="https://images.unsplash.com/photo-1613214149922-f1809e8a0efa?q=80&w=1600&auto=format&fit=crop"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-playfair font-bold text-charcoal mb-6">
              The Ascendant Restomod Market
            </h2>
            <div className="prose prose-lg max-w-none">
              <p>
                The restomod vehicle market has transitioned from a niche enthusiast pursuit to a significant and increasingly valuable segment within the broader collectible car landscape. This analysis provides detailed insights into restomods as investment vehicles, breaking down market trends by brand, original vehicle decade, and vehicle type over a 40-year period (2005-2045).
              </p>
              <p>
                With average annual appreciation rates reaching 8-15% for premium builds and increasing popularity among younger collectors, restomods represent a unique tangible asset class with substantial growth potential.
              </p>
            </div>
          </motion.div>
        </div>

        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-12"
        >
          <div className="flex justify-center mb-8">
            <TabsList className="bg-offwhite">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>Market Overview</span>
              </TabsTrigger>
              <TabsTrigger value="decades" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Value by Decade</span>
              </TabsTrigger>
              <TabsTrigger value="models" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span>Top Models</span>
              </TabsTrigger>
              <TabsTrigger value="investment" className="flex items-center gap-2">
                <PieChartIcon className="h-4 w-4" />
                <span>Investment Analysis</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div ref={ref}>
            <TabsContent value="overview" className="mt-0">
              <motion.div
                variants={chartVariants}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                className="grid md:grid-cols-2 gap-8 mb-12"
              >
                {/* Global Market Size Chart */}
                <div className="bg-white p-6 rounded-sm shadow-md">
                  <h3 className="text-xl font-playfair font-medium mb-6">Global Market Size (in Billions USD)</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={GLOBAL_MARKET_SIZE}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value} Billion`, 'Market Size']} />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="classics" 
                          name="Classic Cars Market" 
                          stroke={COLORS.burgundy} 
                          fill={COLORS.burgundy} 
                          fillOpacity={0.2} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="automotive" 
                          name="Restoration Market" 
                          stroke={COLORS.gold} 
                          fill={COLORS.gold} 
                          fillOpacity={0.2} 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-sm text-charcoal/70 mt-4">
                    The global classic car market is projected to grow from $39.7B in 2024 to $77.8B by 2032 (8.7% CAGR).
                  </p>
                </div>

                {/* Vehicle Type Market Share */}
                <div className="bg-white p-6 rounded-sm shadow-md">
                  <h3 className="text-xl font-playfair font-medium mb-6">Market Share by Vehicle Type (2024)</h3>
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
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {VEHICLE_TYPE_SHARE.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Market Share']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-sm text-charcoal/70 mt-4">
                    American muscle cars lead market share, with vintage trucks/SUVs showing the most rapid growth since 2018.
                  </p>
                </div>
              </motion.div>

              <motion.div
                variants={chartVariants}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                className="bg-white p-6 rounded-sm shadow-md mb-12"
              >
                <h3 className="text-xl font-playfair font-medium mb-6">Future Market Forecast (2025-2045)</h3>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={MARKET_FORECAST}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value} Billion`, 'Market Size']} />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        name="Total Classic Car Market" 
                        stroke={COLORS.steel} 
                        fill={COLORS.steel} 
                        fillOpacity={0.2} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="restomodShare" 
                        name="Restomod Segment" 
                        stroke={COLORS.burgundy} 
                        fill={COLORS.burgundy} 
                        fillOpacity={0.3} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-sm text-charcoal/70 mt-4">
                  Restomods are projected to grow from 20% market share in 2025 to over 40% by 2045, reflecting shifting collector preferences.
                </p>
              </motion.div>

              <motion.div
                variants={chartVariants}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                className="prose prose-lg max-w-none"
              >
                <h3>Key Market Drivers</h3>
                <ul>
                  <li><strong>Generational Shifts:</strong> Younger collectors (Gen X, Millennials) value drivability and modern features alongside classic aesthetics.</li>
                  <li><strong>Technological Advancements:</strong> Easier access to high-performance crate engines, suspension systems, and EV conversion kits.</li>
                  <li><strong>Investment Potential:</strong> Well-executed restomods by reputable builders demonstrating strong value retention and appreciation.</li>
                  <li><strong>Personalization and Exclusivity:</strong> Unique, one-of-a-kind builds offering personal expression and distinction from mass-production vehicles.</li>
                </ul>
              </motion.div>
            </TabsContent>

            <TabsContent value="decades" className="mt-0">
              <motion.div
                variants={chartVariants}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                className="grid md:grid-cols-2 gap-8 mb-12"
              >
                {/* Value Growth by Decade Chart */}
                <div className="bg-white p-6 rounded-sm shadow-md">
                  <h3 className="text-xl font-playfair font-medium mb-6">Annual Value Growth by Vehicle Decade (CAGR)</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={DECADE_VALUE_GROWTH}
                        margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="decade" />
                        <YAxis tickFormatter={(value) => `${value}%`} />
                        <Tooltip formatter={(value) => [`${value}%`, 'Annual Growth Rate']} />
                        <Bar 
                          dataKey="cagr" 
                          name="Annual Growth Rate" 
                          fill={COLORS.burgundy}
                          barSize={60}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Decade Information */}
                <div className="bg-white p-6 rounded-sm shadow-md">
                  <h3 className="text-xl font-playfair font-medium mb-6">Vehicle Decade Analysis</h3>
                  <div className="space-y-6">
                    {DECADE_VALUE_GROWTH.map((decade, index) => (
                      <div key={index} className="border-b border-gray-200 pb-5 last:border-0 last:pb-0">
                        <div className="flex justify-between mb-2">
                          <h4 className="font-medium text-lg">{decade.decade}</h4>
                          <span className="text-burgundy font-semibold">{decade.cagr}% CAGR</span>
                        </div>
                        <p className="text-charcoal/80">{decade.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                variants={chartVariants}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                className="bg-white p-6 rounded-sm shadow-md mb-12"
              >
                <h3 className="text-xl font-playfair font-medium mb-6">Key Insights: Vehicle Decades</h3>
                <div className="prose prose-lg max-w-none">
                  <p>
                    The most substantial value growth has shifted from 1960s vehicles to 1980s and 1990s "youngtimers" which offer more accessible entry points and growing collector interest. Vehicles from the 1990s are showing the highest current growth rates (12.1% CAGR), reflecting their emerging classic status and appeal to millennial collectors.
                  </p>
                  <p>
                    While 1960s classics (particularly muscle cars) still command the highest absolute prices, their growth rates have moderated as prices have plateaued at premium levels. The 1970s category shows mixed performance, with standout models performing exceptionally well but many mainstream vehicles facing challenges due to emission-era compromises.
                  </p>
                  <p>
                    For investors, the 1980s segment represents an appealing balance of established collectibility, reasonable entry points, substantial growth potential, and usability. The increasing interest in newer decades also reflects practical considerations: these vehicles often require less extensive restoration before modification, lowering initial investment requirements.
                  </p>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="models" className="mt-0">
              <motion.div
                variants={chartVariants}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                className="bg-white p-6 rounded-sm shadow-md mb-12"
              >
                <h3 className="text-xl font-playfair font-medium mb-6">Top Model Value Trends (2005-2025, Indexed to 100)</h3>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={MODEL_VALUE_TRENDS}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis domain={[0, 1100]} />
                      <Tooltip formatter={(value) => [`Index: ${value}`, '']} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="mustang" 
                        name="Ford Mustang (1967-69)" 
                        stroke={COLORS.burgundy} 
                        dot={false}
                        strokeWidth={2}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="bronco" 
                        name="Ford Bronco (1966-77)" 
                        stroke={COLORS.gold} 
                        dot={false}
                        strokeWidth={2}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="defender" 
                        name="Land Rover Defender" 
                        stroke={COLORS.steel} 
                        dot={false}
                        strokeWidth={2}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="camaro" 
                        name="Chevrolet Camaro (1967-69)" 
                        stroke={COLORS.charcoal} 
                        dot={false}
                        strokeWidth={2}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="porsche911" 
                        name="Porsche 911 (1964-73)" 
                        stroke={COLORS.silver} 
                        dot={false}
                        strokeWidth={2}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-sm text-charcoal/70 mt-4">
                  Ford Bronco restomods have shown the most dramatic value appreciation (10.1x) over the 20-year period, followed by Land Rover Defender (7.3x).
                </p>
              </motion.div>

              <motion.div
                variants={chartVariants}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
              >
                {/* American Models Insights */}
                <div className="bg-white p-6 rounded-sm shadow-md">
                  <h3 className="text-xl font-playfair font-medium mb-6">American Models Valuation Insights</h3>
                  <div className="prose prose-lg max-w-none">
                    <p>
                      <strong className="text-burgundy">Ford Mustang (1967-69):</strong> The quintessential pony car has shown steady appreciation (4.8x over 20 years), with Fastback models commanding substantial premiums. The Shelby variants and rare specification models have significantly outperformed baseline examples.
                    </p>
                    <p>
                      <strong className="text-burgundy">Ford Bronco (1966-77):</strong> The standout performer in the restomod market with extraordinary growth (10.1x since 2005). Early "uncut" examples with quality restomod work can command $250,000+ with value growth accelerating after 2016.
                    </p>
                    <p>
                      <strong className="text-burgundy">Chevrolet Camaro (1967-69):</strong> Strong but less spectacular growth compared to Mustangs, with premium builds typically ranging from $120,000-$200,000 for non-specialty variants. Z/28 and other rare packages commanding significant premiums.
                    </p>
                  </div>
                </div>

                {/* European Models Insights */}
                <div className="bg-white p-6 rounded-sm shadow-md">
                  <h3 className="text-xl font-playfair font-medium mb-6">European Models Valuation Insights</h3>
                  <div className="prose prose-lg max-w-none">
                    <p>
                      <strong className="text-burgundy">Land Rover Defender:</strong> Exceptional performance in the European segment with growth accelerating most rapidly since 2015 (7.3x over 20 years). Short-wheelbase 90 models typically trade between $150,000-$225,000 for premium builds.
                    </p>
                    <p>
                      <strong className="text-burgundy">Porsche 911 (1964-73):</strong> Long-hood 911s have established a strong premium restomod market (7.1x growth since 2005), with Singer Vehicle Design builds commanding $500,000+ and establishing a new ultra-premium subsegment.
                    </p>
                    <p>
                      <strong className="text-burgundy">Mercedes SL (1955-71):</strong> Though not shown on the chart, classic Mercedes models have shown strong restomod value growth, particularly the 300SL and 280SL Pagoda models, with specialized builders like HK Engineering and Mechatronik creating a market for $300,000+ restomods.
                    </p>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="investment" className="mt-0">
              <motion.div
                variants={chartVariants}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
              >
                {/* Investment Comparison Chart */}
                <div className="bg-white p-6 rounded-sm shadow-md">
                  <h3 className="text-xl font-playfair font-medium mb-6">10-Year Investment Comparison (% Return)</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={INVESTMENT_COMPARISON}
                        margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={(value) => `${value}%`} />
                        <YAxis type="category" dataKey="name" width={150} />
                        <Tooltip formatter={(value) => [`${value}%`, '10-Year Return']} />
                        <Bar 
                          dataKey="value" 
                          name="10-Year Return" 
                          barSize={30}
                        >
                          {INVESTMENT_COMPARISON.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-sm text-charcoal/70 mt-4">
                    Premium restomods have significantly outperformed traditional investment vehicles and original classic cars over the past decade.
                  </p>
                </div>

                {/* Investment Risk Factors */}
                <div className="bg-white p-6 rounded-sm shadow-md">
                  <h3 className="text-xl font-playfair font-medium mb-6">Investment Risk Factors</h3>
                  <div className="space-y-4">
                    {RISK_FACTORS.map((factor, index) => (
                      <div key={index} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                        <div className="flex justify-between mb-1">
                          <h4 className="font-medium">{factor.title}</h4>
                          <div className="flex items-center">
                            <span className="text-sm mr-2">Impact:</span>
                            <div className="flex space-x-0.5">
                              {[...Array(10)].map((_, i) => (
                                <div 
                                  key={i} 
                                  className={`w-2 h-4 ${i < factor.impact ? 'bg-burgundy' : 'bg-gray-200'}`}
                                ></div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-charcoal/80">{factor.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={chartVariants}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                className="bg-white p-6 rounded-sm shadow-md mb-12"
              >
                <h3 className="text-xl font-playfair font-medium mb-6">Investment Strategy Considerations</h3>
                <div className="prose prose-lg max-w-none">
                  <h4>Build Quality Premium</h4>
                  <p>
                    The most significant valuation factor for restomods is build quality and builder reputation. Vehicles from renowned builders like Singer, ICON, and Ringbrothers command 2-4x premiums over similar models with lesser-known provenance. This quality premium has increased over time, suggesting a maturing market that increasingly values craftsmanship and engineering excellence.
                  </p>
                  
                  <h4>Timeline Considerations</h4>
                  <p>
                    Restomods typically require a medium to long-term investment horizon (5+ years) to offset acquisition and build costs. The first 1-3 years after completion often show minimal appreciation or slight depreciation before entering a growth phase, assuming market conditions remain favorable and the vehicle is properly maintained.
                  </p>
                  
                  <h4>Rising Importance of Documentation</h4>
                  <p>
                    Comprehensive build documentation, including original vehicle provenance, modification details, parts sourcing, and build process, is increasingly valuable for resale. High-quality photo and video documentation of the build process can add 5-10% to eventual resale value by providing assurance of quality and thoroughness.
                  </p>
                  
                  <h4>Modern Technology Integration</h4>
                  <p>
                    Restomods that thoughtfully integrate modern technology (digital gauges, advanced infotainment, modern safety features) while maintaining period-correct aesthetics typically show stronger value retention and appreciation than builds focused solely on performance or purely on original appearance.
                  </p>
                </div>
              </motion.div>
            </TabsContent>
          </div>
        </Tabs>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mt-16"
        >
          <a 
            href="/contact" 
            className="inline-flex items-center bg-burgundy text-white px-6 py-3 rounded-sm font-medium group hover:bg-burgundy/90 transition-colors duration-300"
          >
            <span>Discuss Your Restomod Investment</span>
            <ChevronRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" />
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default MarketAnalysis;