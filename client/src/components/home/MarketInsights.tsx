import { useQuery } from "@tanstack/react-query";
import SectionHeading from "@/components/ui/section-heading";
import ChartCard from "@/components/ui/chart-card";
import { 
  MARKET_GROWTH_DATA, 
  DEMOGRAPHIC_DATA, 
  POPULAR_PLATFORMS,
  POPULAR_MODIFICATIONS
} from "@/lib/constants";

const MarketInsights = () => {
  const { data: marketData } = useQuery({
    queryKey: ['/api/market-insights'],
    staleTime: Infinity,
  });

  // Use API data if available, otherwise use constants
  const marketGrowthData = marketData?.marketGrowthData || MARKET_GROWTH_DATA;
  const demographicData = marketData?.demographicData || DEMOGRAPHIC_DATA;
  const platforms = marketData?.platforms || POPULAR_PLATFORMS;
  const modifications = marketData?.modifications || POPULAR_MODIFICATIONS;
  const roi = marketData?.roi || "+42%";

  return (
    <section id="insights" className="py-24 bg-offwhite text-charcoal overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Market Insights"
          description="Understanding the evolving restomod market helps us continue to innovate and deliver vehicles that exceed expectations."
        />
        
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="reveal">
            <ChartCard
              title="Restomod Market Growth"
              description="The bespoke restomod market has seen substantial growth over the past decade, with valuations consistently outperforming both traditional restorations and many new luxury vehicles."
              data={marketGrowthData}
              type="area"
            />
          </div>
          
          <div className="reveal">
            <ChartCard
              title="Demographic Trends"
              description="While our core collectors remain Gen X and Boomers with strong nostalgia connections, Millennials now represent our fastest-growing client segment, seeking modern performance with classic aesthetics."
              data={demographicData}
              type="pie"
            />
          </div>
        </div>
        
        <div className="mt-16 grid md:grid-cols-3 gap-8 reveal">
          {/* Popular Platforms Card */}
          <div className="bg-white p-6 shadow-md rounded-sm">
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
            <ol className="list-decimal pl-5 text-charcoal/80">
              {platforms.map((platform, index) => (
                <li key={index} className={index < platforms.length - 1 ? "mb-2" : ""}>
                  {platform}
                </li>
              ))}
            </ol>
          </div>
          
          {/* Popular Modifications Card */}
          <div className="bg-white p-6 shadow-md rounded-sm">
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
            <ul className="space-y-3 text-charcoal/80">
              {modifications.map((modification, index) => (
                <li key={index} className="flex items-center">
                  <span className="inline-block w-2 h-2 bg-burgundy rounded-full mr-2"></span>
                  {modification}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Investment Value Card */}
          <div className="bg-white p-6 shadow-md rounded-sm">
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
                High-quality restomods from reputable builders have shown average
                appreciation of 8-12% annually over the past five years,
                outperforming many traditional investment vehicles.
              </p>
              <div className="flex items-center justify-between border-t border-charcoal/10 pt-4">
                <span className="font-medium">Average ROI (5yr):</span>
                <span className="text-burgundy font-medium">{roi}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketInsights;
