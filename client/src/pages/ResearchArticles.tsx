import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  FileText, Calendar, TrendingUp, DollarSign, Car, Users, 
  Award, Search, Filter, ChevronRight, BarChart3, Clock,
  ExternalLink, BookOpen, Target, Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/ui/page-header";
import { Breadcrumb } from "@/components/ui/breadcrumb";

// Types for research articles
type ResearchArticle = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  featuredImage: string;
  publishDate: string;
  readTime: number;
  featured: boolean;
};

const ResearchArticles = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Research Articles", href: "/research-articles", isCurrentPage: true }
  ];

  // Query for all research articles
  const { data: articles, isLoading, error } = useQuery<ResearchArticle[]>({
    queryKey: ['/api/research-articles'],
    retry: 1,
  });

  // Filter articles based on search and category
  const filteredArticles = articles?.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  // Get unique categories
  const categories = articles?.reduce((acc, article) => {
    if (!acc.includes(article.category)) {
      acc.push(article.category);
    }
    return acc;
  }, [] as string[]) || [];

  // Featured articles
  const featuredArticles = articles?.filter(article => article.featured) || [];

  // Category stats
  const categoryStats = categories.map(category => ({
    name: category,
    count: articles?.filter(article => article.category === category).length || 0,
    icon: getCategoryIcon(category)
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-800">
      <PageHeader 
        title="Research Articles & Market Data"
        subtitle="Comprehensive automotive industry research, market analysis, and investment insights"
        imageSrc="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=1200&auto=format&fit=crop"
      />

      <div className="container mx-auto px-4 py-12">
        <Breadcrumb items={breadcrumbItems} />
        
        {/* Statistics Overview */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="text-center">
            <CardContent className="pt-6">
              <Database className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{articles?.length || 0}</div>
              <p className="text-sm text-muted-foreground">Total Articles</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Car className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold">203</div>
              <p className="text-sm text-muted-foreground">Car Show Events</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">90</div>
              <p className="text-sm text-muted-foreground">Vehicle Valuations</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">{categories.length}</div>
              <p className="text-sm text-muted-foreground">Research Categories</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search and Filter */}
        <motion.div 
          className="flex flex-col md:flex-row gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search research articles, market data, valuations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
            >
              All Categories
            </Button>
            {categories.slice(0, 3).map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category.replace('_', ' ')}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <motion.section 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Award className="mr-2 h-6 w-6 text-gold" />
              Featured Research
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArticles.slice(0, 3).map((article) => (
                <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-[200px] overflow-hidden">
                    <img 
                      src={article.featuredImage} 
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-gold text-black">
                        Featured
                      </Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {article.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <span className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        {new Date(article.publishDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        {article.readTime} min read
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {article.tags.slice(0, 3).map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/resources/${article.slug}`}>
                      <Button className="w-full">
                        Read Full Article
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </motion.section>
        )}

        {/* Category Navigation */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold mb-6">Research Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryStats.map((category) => (
              <Card 
                key={category.name} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedCategory(category.name)}
              >
                <CardContent className="flex items-center p-6">
                  <div className="mr-4">
                    {category.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold capitalize">{category.name.replace('_', ' ')}</h3>
                    <p className="text-sm text-muted-foreground">{category.count} articles</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* All Articles */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold mb-6">
            All Research Articles 
            <span className="text-lg font-normal text-muted-foreground ml-2">
              ({filteredArticles.length} {selectedCategory !== "all" && `in ${selectedCategory.replace('_', ' ')}`})
            </span>
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-[200px] w-full" />
                  <CardHeader>
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-[200px] overflow-hidden">
                    <img 
                      src={article.featuredImage} 
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="bg-blue-500 text-white capitalize">
                        {article.category.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {article.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <span className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        {new Date(article.publishDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        {article.readTime} min read
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {article.tags.slice(0, 3).map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/resources/${article.slug}`}>
                      <Button className="w-full">
                        Read Full Article
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No articles found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </motion.section>

        {/* Quick Links */}
        <motion.section 
          className="mt-16 pt-12 border-t"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-6">Related Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/market-analysis">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex items-center p-6">
                  <BarChart3 className="h-8 w-8 mr-4 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">Market Analysis</h3>
                    <p className="text-sm text-muted-foreground">Industry trends & data</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/gateway-vehicles">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex items-center p-6">
                  <DollarSign className="h-8 w-8 mr-4 text-green-600" />
                  <div>
                    <h3 className="font-semibold">Vehicle Valuations</h3>
                    <p className="text-sm text-muted-foreground">Real market pricing</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/car-show-events">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex items-center p-6">
                  <Calendar className="h-8 w-8 mr-4 text-orange-600" />
                  <div>
                    <h3 className="font-semibold">Car Show Events</h3>
                    <p className="text-sm text-muted-foreground">203 authentic events</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/model-values">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex items-center p-6">
                  <Target className="h-8 w-8 mr-4 text-purple-600" />
                  <div>
                    <h3 className="font-semibold">Model Values</h3>
                    <p className="text-sm text-muted-foreground">Specific pricing data</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

// Helper function to get category icons
function getCategoryIcon(category: string) {
  switch (category.toLowerCase()) {
    case 'market_analysis':
      return <BarChart3 className="h-6 w-6 text-blue-600" />;
    case 'events':
      return <Calendar className="h-6 w-6 text-orange-600" />;
    case 'valuations':
      return <DollarSign className="h-6 w-6 text-green-600" />;
    case 'industry':
      return <TrendingUp className="h-6 w-6 text-purple-600" />;
    case 'guides':
      return <BookOpen className="h-6 w-6 text-red-600" />;
    default:
      return <FileText className="h-6 w-6 text-gray-600" />;
  }
}

export default ResearchArticles;