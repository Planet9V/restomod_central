import { useQuery } from "@tanstack/react-query";
import SectionHeading from "@/components/ui/section-heading";
import ChartCard from "@/components/ui/chart-card";
import { motion } from "framer-motion";
import { 
  MARKET_GROWTH_DATA,
  DEMOGRAPHIC_DATA,
  POPULAR_PLATFORMS,
  POPULAR_MODIFICATIONS,
  VALUATION_TRENDS,
  PREMIUM_BUILDERS,
  INVESTMENT_COMPARISON,
  MARKET_SIZE_FORECAST,
  EMERGING_TECHNOLOGIES
} from "@/data/market-data";

// Simple MarketInsights component without motion wrapping for charts
const MarketInsights = () => {
  const { data: marketData } = useQuery({
    queryKey: ['/api/market-insights'],
    staleTime: Infinity,
  });

  // Define market data response type
  type MarketDataResponse = {
    marketGrowthData?: typeof MARKET_GROWTH_DATA;
    demographicData?: typeof DEMOGRAPHIC_DATA;
    platforms?: typeof POPULAR_PLATFORMS;
    modifications?: typeof POPULAR_MODIFICATIONS;
    valuationTrends?: typeof VALUATION_TRENDS;
    premiumBuilders?: typeof PREMIUM_BUILDERS;
    investmentComparison?: typeof INVESTMENT_COMPARISON;
    roi?: string;
  };

  // Add name field to market growth data for chart component compatibility
  const formattedMarketGrowthData = ((marketData as MarketDataResponse)?.marketGrowthData || MARKET_GROWTH_DATA).map(item => ({
    name: item.year.toString(), // Add name property for ChartData compatibility
    value: item.value,
    year: Number(item.year) // Ensure year is a number
  }));
  const demographicData = (marketData as MarketDataResponse)?.demographicData || DEMOGRAPHIC_DATA;
  const platforms = (marketData as MarketDataResponse)?.platforms || POPULAR_PLATFORMS;
  const modifications = (marketData as MarketDataResponse)?.modifications || POPULAR_MODIFICATIONS;
  const valuationTrends = (marketData as MarketDataResponse)?.valuationTrends || VALUATION_TRENDS;
  const premiumBuilders = (marketData as MarketDataResponse)?.premiumBuilders || PREMIUM_BUILDERS;
  const investmentComparison = (marketData as MarketDataResponse)?.investmentComparison || INVESTMENT_COMPARISON;
  const roi = (marketData as MarketDataResponse)?.roi || "+15.8%";

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <section id="insights" className="py-24 bg-offwhite text-charcoal overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <SectionHeading
            title="Market Insights"
            description="Understanding the evolving restomod market helps us continue to innovate and deliver vehicles that exceed expectations."
          />
        </motion.div>
        
        <motion.div 
          className="grid md:grid-cols-2 gap-16 items-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={itemVariants}>
            <ChartCard
              title="Restomod Market Growth"
              description="The bespoke restomod market has seen substantial growth over the past decade, with valuations consistently outperforming both traditional restorations and many new luxury vehicles."
              data={formattedMarketGrowthData}
              type="area"
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <ChartCard
              title="Demographic Trends"
              description="While our core collectors remain Gen X and Boomers with strong nostalgia connections, Millennials now represent our fastest-growing client segment, seeking modern performance with classic aesthetics."
              data={demographicData}
              type="pie"
            />
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="mt-16 grid md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Popular Platforms Card */}
          <motion.div 
            className="bg-white p-6 shadow-md rounded-sm hover:shadow-lg transition-shadow duration-300"
            variants={itemVariants}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-playfair text-xl font-medium">Most Popular Platforms</h3>
              <span className="text-burgundy">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </span>
            </div>
            <div className="space-y-4">
              {platforms.map((platform: { name: string, value: number, image: string }, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-12 h-12 shrink-0 overflow-hidden rounded-sm">
                    <img 
                      src={platform.image} 
                      alt={platform.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-charcoal">{platform.name}</p>
                    <div className="flex items-center mt-1">
                      <div className="h-1.5 bg-burgundy rounded-full" style={{ width: `${platform.value * 10}%` }}></div>
                      <span className="ml-2 text-sm text-charcoal/70">{platform.value}/10</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* Popular Modifications Card */}
          <motion.div 
            className="bg-white p-6 shadow-md rounded-sm hover:shadow-lg transition-shadow duration-300"
            variants={itemVariants}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-playfair text-xl font-medium">Popular Modifications</h3>
              <span className="text-burgundy">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </span>
            </div>
            <ul className="space-y-4 text-charcoal/80">
              {modifications.map((mod: { 
                  name: string; 
                  percentage: number; 
                  description: string; 
                  roi: string; 
                }, index: number) => (
                <li key={index} className="relative pl-6">
                  <span className="absolute left-0 top-1.5 w-2 h-2 bg-burgundy rounded-full"></span>
                  <p className="font-medium text-charcoal">{mod.name}</p>
                  <div className="flex items-center mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-burgundy h-1.5 rounded-full" 
                        style={{ width: `${mod.percentage}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm text-charcoal/70">{mod.percentage}%</span>
                  </div>
                  <p className="text-sm mt-1 text-charcoal/70">{mod.description}</p>
                </li>
              ))}
            </ul>
          </motion.div>
          
          {/* Investment Value Card */}
          <motion.div 
            className="bg-white p-6 shadow-md rounded-sm hover:shadow-lg transition-shadow duration-300"
            variants={itemVariants}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-playfair text-xl font-medium">Investment Value</h3>
              <span className="text-burgundy">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </span>
            </div>
            <div className="space-y-4 text-charcoal/80">
              <p>
                Premium restomods from reputable builders like Ringbrothers, ICON 4x4, and Velocity Restorations 
                have demonstrated remarkable appreciation, outperforming traditional investment vehicles.
              </p>
              <div>
                <h4 className="font-medium text-charcoal mb-2">5-Year Investment Returns</h4>
                <div className="space-y-2">
                  {investmentComparison.map((item: { category: string; value: number }, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{item.category}</span>
                      <div className="flex items-center">
                        <div className="w-24 h-1.5 bg-gray-200 rounded-full mr-2">
                          <div 
                            className={`h-1.5 rounded-full ${item.category === 'Premium Restomods' ? 'bg-burgundy' : 'bg-charcoal/40'}`}
                            style={{ width: `${(item.value / 20) * 100}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm ${item.category === 'Premium Restomods' ? 'text-burgundy font-medium' : ''}`}>
                          {item.value}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-charcoal/10 pt-4">
                <span className="font-medium">Average ROI (5yr):</span>
                <span className="text-burgundy font-medium text-lg">{roi}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Premium Builders Section */}
        <motion.div 
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="font-playfair text-2xl font-medium mb-6 text-center">Premium Restomod Builders</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {premiumBuilders.map((builder, index) => (
              <motion.div 
                key={index}
                className="bg-white shadow-md rounded-sm px-4 py-5 flex flex-col items-center text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <span className="text-burgundy font-playfair font-medium text-lg">
                  ${(builder.value / 1000).toFixed(0)}k
                </span>
                <span className="text-sm text-charcoal/70 mt-1">{builder.name}</span>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-sm text-charcoal/70 mt-4">
            Average sale prices for premium restomod builders in 2024
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default MarketInsights;
