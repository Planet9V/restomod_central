import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowRight, 
  Book, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Search,
  Star,
  ExternalLink,
  Users,
  Award,
  ChevronRight,
  Compass,
  Globe,
  Filter
} from "lucide-react";
import PageHeader from "@/components/ui/page-header";
import { Breadcrumb } from "@/components/ui/breadcrumb";

const Resources = () => {
  const [activeTab, setActiveTab] = useState("guides");

  // Breadcrumb navigation
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Resources", href: "/resources", isCurrentPage: true }
  ];

  // Featured car show platforms from research
  const featuredPlatforms = [
    {
      name: "Hemmings Motor News",
      description: "The pillar of the collector car hobby with institutional authority and comprehensive event listings",
      url: "hemmings.com",
      rating: 5,
      features: ["Detailed event listings", "Organizer contacts", "Regional filters", "Daily updates"],
      specialization: "Classic & collector cars",
      imageUrl: "https://images.unsplash.com/photo-1554744512-d6c603f27c54?q=80&w=800&auto=format&fit=crop"
    },
    {
      name: "CarShowSafari.com",
      description: "Dedicated hub with extensive community features and nationwide car show listings",
      url: "carshowsafari.com", 
      rating: 4,
      features: ["Virtual car shows", "Community forums", "Automotive history", "Member showcases"],
      specialization: "Community-driven events",
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop"
    },
    {
      name: "American Collectors Insurance",
      description: "Insurance company's community initiative with highly relevant classic car events",
      url: "americancollectors.com",
      rating: 4,
      features: ["Comprehensive filters", "Cost sliders", "Premium events", "Professional presentation"],
      specialization: "Collector car focus",
      imageUrl: "https://images.unsplash.com/photo-1549399292-36400e85ad48?q=80&w=800&auto=format&fit=crop"
    }
  ];

  // Expert search strategies from research
  const searchStrategies = [
    {
      category: "Location-Based Research",
      description: "Techniques for finding events in your area",
      strategies: [
        "Use radius search (e.g., 'shows within 50 miles') for comprehensive coverage",
        "Search by city, state, and ZIP code for precise targeting", 
        "Consider seasonal migration patterns (indoor winter, outdoor summer events)",
        "Check regional car club calendars for exclusive or smaller events"
      ]
    },
    {
      category: "Era-Specific Filtering", 
      description: "Finding shows that match your vehicle's era",
      strategies: [
        "Filter by classic car eras: pre-war, 1950s, muscle cars, etc.",
        "Look for marque-specific shows (All Ford, Mopar only, etc.)",
        "Search theme-based events: hot rods, original/restored, concours",
        "Identify judged vs. non-judged events based on your interests"
      ]
    },
    {
      category: "Advanced Research Techniques",
      description: "Professional methods for thorough event discovery", 
      strategies: [
        "Cross-reference multiple platforms for comprehensive coverage",
        "Use keyword searches for specific vehicle types or themes",
        "Check event organizer websites directly for detailed information",
        "Follow classic car influencers and clubs on social media for announcements"
      ]
    }
  ];

  // Sample resource data enhanced with car show research
  const resources = [
    {
      id: 1,
      title: "Ultimate Guide to Classic Car Show Platforms",
      description: "Comprehensive analysis of the best websites for discovering classic car shows, based on extensive research of user needs and platform capabilities.",
      type: "guide",
      date: "May 26, 2025",
      readTime: "15 min read",
      category: "Car Shows",
      imageUrl: "https://images.unsplash.com/photo-1554744512-d6c603f27c54?q=80&w=800&auto=format&fit=crop",
      href: "/car-show-guide"
    },
    {
      id: 2,
      title: "Understanding Restomod Value: Investment vs. Passion",
      description: "Explore the financial aspects of restomod projects, including value retention, appreciation factors, and the balance between investment and passion.",
      type: "article",
      date: "April 15, 2023",
      readTime: "8 min read",
      category: "Investment",
      imageUrl: "https://images.unsplash.com/photo-1611921059442-4db68526d51b?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "Mechanical Authenticity: Balancing Modern Performance with Historical Accuracy",
      description: "A deep dive into the engineering considerations when upgrading classic vehicles with modern components while maintaining period-correct aesthetics.",
      type: "guide",
      date: "March 3, 2023",
      readTime: "12 min read",
      category: "Engineering",
      imageUrl: "https://images.unsplash.com/photo-1572525851171-14c45f925b98?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "Collector's Guide to Documentation and Provenance",
      description: "Learn how to properly document your classic car's history, restoration process, and maintain records that enhance its provenance and value.",
      type: "guide",
      date: "February 18, 2023",
      readTime: "10 min read",
      category: "Documentation",
      imageUrl: "https://images.unsplash.com/photo-1550565118-3a14e8d0386f?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 4,
      title: "The Evolution of Resto-Modding: From Fringe to Mainstream",
      description: "Trace the history of restomod culture from its roots as a niche subculture to its current status as a respected segment of the automotive world.",
      type: "article",
      date: "January 22, 2023",
      readTime: "15 min read",
      category: "History",
      imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 5,
      title: "Materials Science in Restoration: Modern Solutions for Vintage Problems",
      description: "Discover how advances in materials science are providing new solutions for restoration challenges, from corrosion prevention to sustainable alternatives.",
      type: "article",
      date: "December 10, 2022",
      readTime: "9 min read",
      category: "Materials",
      imageUrl: "https://images.unsplash.com/photo-1565965314181-7bd228c3e8db?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 6,
      title: "Concours vs. Restomod: Understanding Different Restoration Philosophies",
      description: "Compare the differing approaches to vehicle restoration, from strict historical accuracy to creative reinterpretation, and their respective communities.",
      type: "guide",
      date: "November 5, 2022",
      readTime: "11 min read",
      category: "Philosophy",
      imageUrl: "https://images.unsplash.com/photo-1567285894370-a8af78c9a6ca?q=80&w=800&auto=format&fit=crop"
    }
  ];

  // Resource categories for filtering
  const categories = [
    "All",
    "Engineering",
    "History",
    "Investment",
    "Documentation",
    "Materials",
    "Philosophy"
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "article":
        return <FileText className="h-4 w-4 mr-1" />;
      case "guide":
        return <Book className="h-4 w-4 mr-1" />;
      case "webinar":
        return <MessageSquare className="h-4 w-4 mr-1" />;
      default:
        return <FileText className="h-4 w-4 mr-1" />;
    }
  };

  return (
    <div className="pt-24 bg-offwhite">
      {/* Hero Section */}
      <div className="bg-charcoal text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4">
            Research & Resources
          </h1>
          <p className="text-xl text-white/80 max-w-3xl">
            Educational articles, guides, and resources for collectors and enthusiasts seeking to deepen their knowledge of restomod cars.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Tabs */}
        <div className="mb-10 overflow-x-auto whitespace-nowrap pb-2">
          <div className="inline-flex space-x-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === "All" ? "default" : "outline"}
                className="rounded-sm px-5 bg-charcoal text-white hover:bg-burgundy border-0"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resources.map((resource) => (
            <Card key={resource.id} className="overflow-hidden hover-lift">
              <div className="h-48 overflow-hidden">
                <img
                  src={resource.imageUrl}
                  alt={resource.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-center text-sm text-charcoal/60 mb-2">
                  <span className="flex items-center mr-4">
                    {getTypeIcon(resource.type)}
                    {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {resource.date}
                  </span>
                </div>
                <CardTitle className="font-playfair text-xl">{resource.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-charcoal/80">
                  {resource.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="inline-block bg-charcoal/10 text-charcoal/80 px-3 py-1 text-xs rounded-sm">
                    {resource.category}
                  </span>
                  <span className="ml-2 text-xs text-charcoal/60">{resource.readTime}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/resources/${resource.id === 1 ? 'understanding-restomod-value' : 
                                resource.id === 2 ? 'mechanical-authenticity' : 
                                resource.id === 3 ? 'collectors-guide-documentation' : 
                                resource.id === 4 ? 'evolution-of-resto-modding' : 
                                resource.id === 5 ? 'materials-science-in-restoration' : 
                                'concours-vs-restomod'}`}>
                  <Button variant="link" className="text-burgundy p-0 hover:text-burgundy/80">
                    Read More <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Subscription Section */}
        <div className="bg-burgundy/10 rounded-sm p-8 mt-16">
          <div className="text-center">
            <h2 className="font-playfair text-2xl font-bold mb-4">Stay Updated with Skinny's Rod and Custom</h2>
            <p className="text-charcoal/80 max-w-2xl mx-auto mb-6">
              Subscribe to our monthly newsletter to receive the latest articles, guides, and industry insights on hot rod techniques, market trends, and restoration projects from Skinny's Rod and Custom.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="rounded-sm px-4 py-2 border border-charcoal/20 flex-grow"
              />
              <Button className="bg-burgundy hover:bg-burgundy/90 text-white rounded-sm border-0">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resources;
