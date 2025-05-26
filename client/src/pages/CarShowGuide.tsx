import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  Calendar, 
  Search, 
  MapPin, 
  Star, 
  ExternalLink, 
  Filter,
  Globe,
  Users,
  Clock,
  DollarSign,
  Award,
  ChevronRight,
  Target,
  Zap,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import PageHeader from "@/components/ui/page-header";
import { Breadcrumb } from "@/components/ui/breadcrumb";

/**
 * Comprehensive Car Show Guide based on extensive research
 * Features detailed analysis of top platforms and essential criteria
 */
const CarShowGuide = () => {
  const [selectedPlatform, setSelectedPlatform] = useState("hemmings");

  // Breadcrumb navigation
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Resources", href: "/resources" },
    { label: "Car Show Guide", href: "/car-show-guide", isCurrentPage: true }
  ];

  // Essential criteria for evaluating car show websites
  const essentialCriteria = [
    {
      icon: <Users className="h-5 w-5 text-burgundy" />,
      title: "User-Centric Design",
      description: "Intuitive navigation with clean, uncluttered design that prioritizes user experience and mobile-friendliness."
    },
    {
      icon: <Calendar className="h-5 w-5 text-burgundy" />,
      title: "Comprehensive Event Listings",
      description: "Extensive geographical coverage with accurate dates, times, locations, and clear distinction of classic car shows."
    },
    {
      icon: <Zap className="h-5 w-5 text-burgundy" />,
      title: "Continuous Updates",
      description: "Demonstrable evidence of ongoing updates with fresh data and current event status including cancellations."
    },
    {
      icon: <Filter className="h-5 w-5 text-burgundy" />,
      title: "Robust Search & Filtering",
      description: "Advanced filters including location radius, date ranges, event types, and classic car era specifications."
    },
    {
      icon: <Target className="h-5 w-5 text-burgundy" />,
      title: "Rich Event Details",
      description: "Comprehensive profiles with organizer contacts, admission fees, vehicle themes, and on-site amenities."
    },
    {
      icon: <Globe className="h-5 w-5 text-burgundy" />,
      title: "Community Features",
      description: "Photo galleries, user reviews, forums, and supplementary content that enhances research capabilities."
    }
  ];

  // Top recommended platforms based on research
  const platforms = [
    {
      id: "hemmings",
      name: "Hemmings Motor News",
      url: "hemmings.com",
      rating: 5,
      description: "The pillar of the collector car hobby with institutional authority and comprehensive event listings.",
      strengths: [
        "Strong brand recognition within classic car community",
        "Exceptionally detailed event listings with organizer contacts",
        "Comprehensive filters for regions, categories, and states",
        "Active management with regular updates",
        "Rich supplementary content and community features"
      ],
      considerations: [
        "Extensive content may feel less focused than dedicated event sites",
        "Requires effective keyword strategies for niche interests"
      ],
      bestFor: "Serious classic car enthusiasts seeking detailed, reliable information",
      features: {
        searchFilters: "Excellent",
        updateFrequency: "Daily",
        eventDetails: "Comprehensive",
        mobileOptimized: "Yes"
      }
    },
    {
      id: "carshowsafari",
      name: "CarShowSafari.com",
      url: "carshowsafari.com",
      rating: 4,
      description: "Dedicated hub with extensive community features and nationwide listings.",
      strengths: [
        "Comprehensive nationwide car show listings",
        "Rich community features including virtual shows and forums",
        "Automotive history content and member showcases",
        "Straightforward event submission process",
        "Detailed event information with fees and contacts"
      ],
      considerations: [
        "Relies heavily on user submissions for content accuracy",
        "Requires JavaScript for full functionality"
      ],
      bestFor: "Enthusiasts seeking community engagement alongside event discovery",
      features: {
        searchFilters: "Good",
        updateFrequency: "Community-driven",
        eventDetails: "Detailed",
        mobileOptimized: "Yes"
      }
    },
    {
      id: "americancollectors",
      name: "American Collectors Insurance",
      url: "americancollectors.com",
      rating: 4,
      description: "Insurance company's community initiative with highly relevant classic car events.",
      strengths: [
        "Events highly relevant to classic and collector car enthusiasts",
        "Comprehensive filtering system including cost sliders",
        "Strong focus on community support",
        "Professional presentation and reliability"
      ],
      considerations: [
        "Limited to events relevant to their customer base",
        "Secondary focus compared to their insurance business"
      ],
      bestFor: "Collector car owners seeking premium, vetted events",
      features: {
        searchFilters: "Comprehensive",
        updateFrequency: "Regular",
        eventDetails: "Professional",
        mobileOptimized: "Yes"
      }
    }
  ];

  // Advanced search strategies for classic car enthusiasts
  const searchStrategies = [
    {
      category: "Location-Based Searches",
      tips: [
        "Use radius search (e.g., 'shows within 50 miles') for comprehensive coverage",
        "Search by city, state, and ZIP code for precise targeting",
        "Consider seasonal migration patterns of shows (indoor winter, outdoor summer)"
      ]
    },
    {
      category: "Era-Specific Filtering",
      tips: [
        "Filter by classic car eras: pre-war, 1950s, muscle cars, etc.",
        "Look for marque-specific shows (All Ford, Mopar only, etc.)",
        "Search theme-based events: hot rods, original/restored, concours"
      ]
    },
    {
      category: "Event Type Distinction",
      tips: [
        "Differentiate between car shows, cruise-ins, swap meets",
        "Identify concours d'elegance vs. casual gatherings",
        "Look for judged vs. non-judged events based on your interests"
      ]
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <PageHeader
        title="Ultimate Classic Car Show Guide"
        subtitle="Your comprehensive resource for finding and researching premium car shows and automotive events"
        imageSrc="https://images.unsplash.com/photo-1554744512-d6c603f27c54?q=80&w=1600&auto=format&fit=crop"
      />

      {/* Breadcrumb Navigation */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Introduction Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <motion.div variants={itemVariants}>
              <Badge className="mb-4 bg-burgundy hover:bg-burgundy text-white">
                Based on Extensive Research
              </Badge>
              <h2 className="text-4xl font-bold font-playfair mb-6">
                Navigating the Nostalgia
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                The allure of a classic car show is undeniable. It's a sensory journey through automotive history, 
                a vibrant tapestry woven with the gleam of polished chrome, the rich scent of aged leather mixed 
                with a hint of gasoline, and the passionate narratives of proud owners. These gatherings are more 
                than just displays of vintage machinery; they are celebrations of artistry, engineering, and a 
                shared love for an era when cars possessed distinct personalities.
              </p>
            </motion.div>
          </motion.div>

          {/* Essential Criteria Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div variants={itemVariants} className="mb-12">
              <h3 className="text-3xl font-bold font-playfair mb-4 text-center">
                Blueprint for the Perfect Portal
              </h3>
              <p className="text-muted-foreground text-center max-w-3xl mx-auto mb-8">
                Essential features that define a top-tier classic car show website, 
                based on comprehensive analysis of user needs and platform capabilities.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {essentialCriteria.map((criterion, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <div className="flex items-center mb-3">
                        <div className="bg-burgundy/10 p-2 rounded-lg mr-3">
                          {criterion.icon}
                        </div>
                        <CardTitle className="text-lg">{criterion.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{criterion.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Platform Reviews Section */}
      <section className="py-16 bg-offwhite">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold font-playfair mb-4">
                Top Recommended Platforms
              </h3>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                Comprehensive evaluation of the most promising car show event websites, 
                analyzed against our essential criteria for classic car enthusiasts.
              </p>
            </div>

            <Tabs value={selectedPlatform} onValueChange={setSelectedPlatform} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                {platforms.map((platform) => (
                  <TabsTrigger key={platform.id} value={platform.id} className="text-sm">
                    {platform.name.split(' ')[0]}
                  </TabsTrigger>
                ))}
              </TabsList>

              {platforms.map((platform) => (
                <TabsContent key={platform.id} value={platform.id}>
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-2xl mb-2">{platform.name}</CardTitle>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < platform.rating ? 'text-gold fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <Badge variant="outline">{platform.url}</Badge>
                          </div>
                          <p className="text-muted-foreground">{platform.description}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                          <h4 className="font-semibold text-green-700 mb-3 flex items-center">
                            <Shield className="h-4 w-4 mr-2" />
                            Key Strengths
                          </h4>
                          <ul className="space-y-2">
                            {platform.strengths.map((strength, index) => (
                              <li key={index} className="flex items-start">
                                <ChevronRight className="h-4 w-4 text-burgundy mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-amber-700 mb-3">Considerations</h4>
                          <ul className="space-y-2 mb-6">
                            {platform.considerations.map((consideration, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-amber-500 mr-2">•</span>
                                <span className="text-sm">{consideration}</span>
                              </li>
                            ))}
                          </ul>
                          
                          <div className="bg-burgundy/5 p-4 rounded-lg">
                            <h5 className="font-semibold text-burgundy mb-2">Best For:</h5>
                            <p className="text-sm">{platform.bestFor}</p>
                          </div>
                        </div>
                      </div>

                      <Separator className="my-6" />

                      {/* Platform Features */}
                      <div>
                        <h4 className="font-semibold mb-4">Platform Features</h4>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Search Filters</div>
                            <div className="font-semibold">{platform.features.searchFilters}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Updates</div>
                            <div className="font-semibold">{platform.features.updateFrequency}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Event Details</div>
                            <div className="font-semibold">{platform.features.eventDetails}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Mobile</div>
                            <div className="font-semibold">{platform.features.mobileOptimized}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </motion.div>
        </div>
      </section>

      {/* Advanced Search Strategies */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold font-playfair mb-4">
                Advanced Search Strategies
              </h3>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                Professional techniques to efficiently discover classic car events that match your specific interests and location preferences.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {searchStrategies.map((strategy, index) => (
                <Card key={index} className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">{strategy.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {strategy.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex items-start">
                          <ChevronRight className="h-4 w-4 text-burgundy mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-burgundy to-charcoal">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Explore Classic Car Shows?
            </h3>
            <p className="text-white/80 max-w-2xl mx-auto mb-8">
              Use this guide to discover amazing automotive events and connect with fellow enthusiasts who share your passion for classic cars.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-burgundy hover:bg-white/90">
                <Link href="/market-analysis">
                  View Market Analysis
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-burgundy">
                <Link href="/resources">
                  More Resources
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default CarShowGuide;