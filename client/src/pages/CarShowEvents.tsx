import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, Users, DollarSign, Clock, Filter, Search, Star, ExternalLink, TrendingUp, Globe, Car, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { SocialShare } from "@/components/SocialShare";
import { directCarShowService } from "@/services/directCarShowData";

interface CarShowEvent {
  id: number;
  eventName: string;
  eventSlug: string;
  venue: string;
  city: string;
  state: string;
  startDate: string;
  endDate?: string;
  eventType: string;
  eventCategory: string;
  description?: string;
  website?: string;
  organizerName?: string;
  entryFeeSpectator?: string;
  entryFeeParticipant?: string;
  features?: string;
  amenities?: string;
  featured: boolean;
  status: string;
  imageUrl?: string;
}

export default function CarShowEvents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Get authentic car show events data directly
  const [eventsData, setEventsData] = useState<{ events: CarShowEvent[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Dynamic filter options from your authentic data
  const [filterOptions, setFilterOptions] = useState({
    eventTypes: [],
    states: [],
    categories: []
  });

  useEffect(() => {
    const fetchAuthenticEvents = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (eventTypeFilter !== "all") params.append('eventType', eventTypeFilter);
        if (stateFilter !== "all") params.append('state', stateFilter);
        if (regionFilter !== "all") params.append('region', regionFilter);
        if (categoryFilter !== "all") params.append('category', categoryFilter);
        if (monthFilter !== "all") params.append('month', monthFilter);
        if (featuredOnly) params.append('featured', 'true');
        if (searchTerm.trim()) params.append('search', searchTerm.trim());

        const response = await fetch(`/api/car-show-events?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📥 API Response:', { success: data?.success, eventsCount: data?.events?.length, hasEvents: !!data?.events });
        
        if (data?.success && data?.events) {
          setEventsData({ events: data.events });
          setError(null);
          console.log(`✅ Loaded ${data.events.length} authentic car shows from Neon database`);
          
          // Extract unique filter options from your authentic data
          const uniqueEventTypes = [...new Set(data.events.map(event => event.eventType).filter(Boolean))];
          const uniqueStates = [...new Set(data.events.map(event => event.state).filter(Boolean))];
          const uniqueCategories = [...new Set(data.events.map(event => event.eventCategory).filter(Boolean))];
          
          setFilterOptions({
            eventTypes: uniqueEventTypes.sort(),
            states: uniqueStates.sort(),
            categories: uniqueCategories.sort()
          });
        } else {
          console.log('❌ Response format issue:', data);
          throw new Error('Failed to fetch authentic car show events - invalid response format');
        }
      } catch (err) {
        setError(err as Error);
        setEventsData(null);
        console.error('❌ Failed to load car show events:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuthenticEvents();
  }, [eventTypeFilter, stateFilter, regionFilter, categoryFilter, monthFilter, featuredOnly, searchTerm]);

  const events = eventsData?.events || [];

  // Filter events by search term
  const filteredEvents = events.filter((event: CarShowEvent) =>
    event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.venue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'auction': return 'bg-red-500';
      case 'concours': return 'bg-purple-500';
      case 'car_show': return 'bg-blue-500';
      case 'cruise_in': return 'bg-green-500';
      case 'swap_meet': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'auction': return 'Auction';
      case 'concours': return 'Concours';
      case 'car_show': return 'Car Show';
      case 'cruise_in': return 'Cruise-In';
      case 'swap_meet': return 'Swap Meet';
      default: return type;
    }
  };

  const parseFeatures = (featuresString?: string) => {
    try {
      return featuresString ? JSON.parse(featuresString) : [];
    } catch {
      return [];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-zinc-900 to-zinc-800 border-b border-zinc-700">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-6">
              Classic Car Show Events
            </h1>
            <p className="text-xl text-zinc-300 max-w-3xl mx-auto mb-8">
              Discover premier automotive events across the nation. From prestigious concours to thrilling auctions, 
              find your next classic car adventure with authentic event listings and comprehensive details.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                <Calendar className="w-4 h-4 mr-2" />
                193+ Authentic Events
              </Badge>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                <MapPin className="w-4 h-4 mr-2" />
                Nationwide Coverage
              </Badge>
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                <Star className="w-4 h-4 mr-2" />
                Verified Information
              </Badge>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6 mb-8"
        >
          <div className="space-y-4">
            {/* Primary Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
              <Input
                placeholder="Search 193+ authentic car shows by name, city, venue, or state..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-12 bg-zinc-900/50 border-zinc-600 focus:border-orange-500 text-base"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400">Showing {filteredEvents.length} of {events.length} events</span>
                {(eventTypeFilter !== "all" || stateFilter !== "all" || regionFilter !== "all" || categoryFilter !== "all" || monthFilter !== "all" || featuredOnly) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEventTypeFilter("all");
                      setStateFilter("all");
                      setRegionFilter("all");
                      setCategoryFilter("all");
                      setMonthFilter("all");
                      setFeaturedOnly(false);
                    }}
                    className="h-7 text-xs text-orange-400 hover:text-orange-300"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
              <Button
                variant="ghost"
                onClick={() => setShowFilters(!showFilters)}
                className="text-zinc-400 hover:text-zinc-300"
              >
                <Filter className="w-4 h-4 mr-2" />
                Advanced Filters
                {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
              </Button>
            </div>

            {/* Advanced Filters (Collapsible) */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 border-t border-zinc-700"
              >
                <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                  <SelectTrigger className="bg-zinc-900/50 border-zinc-600 focus:border-orange-500">
                    <SelectValue placeholder="Event Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-600">
                    <SelectItem value="all">All Types</SelectItem>
                    {filterOptions.eventTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger className="bg-zinc-900/50 border-zinc-600 focus:border-orange-500">
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-600">
                    <SelectItem value="all">All Regions</SelectItem>
                    <SelectItem value="midwest">Midwest</SelectItem>
                    <SelectItem value="south">South</SelectItem>
                    <SelectItem value="northeast">Northeast</SelectItem>
                    <SelectItem value="west">West</SelectItem>
                    <SelectItem value="southeast">Southeast</SelectItem>
                    <SelectItem value="southwest">Southwest</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={stateFilter} onValueChange={setStateFilter}>
                  <SelectTrigger className="bg-zinc-900/50 border-zinc-600 focus:border-orange-500">
                    <SelectValue placeholder="State" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-600">
                    <SelectItem value="all">All States</SelectItem>
                    {filterOptions.states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="bg-zinc-900/50 border-zinc-600 focus:border-orange-500">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-600">
                    <SelectItem value="all">All Categories</SelectItem>
                    {filterOptions.categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={monthFilter} onValueChange={setMonthFilter}>
                  <SelectTrigger className="bg-zinc-900/50 border-zinc-600 focus:border-orange-500">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-600">
                    <SelectItem value="all">All Months</SelectItem>
                    <SelectItem value="1">January</SelectItem>
                    <SelectItem value="2">February</SelectItem>
                    <SelectItem value="3">March</SelectItem>
                    <SelectItem value="4">April</SelectItem>
                    <SelectItem value="5">May</SelectItem>
                    <SelectItem value="6">June</SelectItem>
                    <SelectItem value="7">July</SelectItem>
                    <SelectItem value="8">August</SelectItem>
                    <SelectItem value="9">September</SelectItem>
                    <SelectItem value="10">October</SelectItem>
                    <SelectItem value="11">November</SelectItem>
                    <SelectItem value="12">December</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant={featuredOnly ? "default" : "outline"}
                  onClick={() => setFeaturedOnly(!featuredOnly)}
                  className={featuredOnly 
                    ? "bg-orange-500 hover:bg-orange-600" 
                    : "border-zinc-600 hover:bg-zinc-700"
                  }
                >
                  <Star className="w-4 h-4 mr-2" />
                  Featured Only
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500/20 rounded-full mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
            <p className="text-zinc-400">Loading authentic car show events...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
              <ExternalLink className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-red-400 mb-4">Unable to load events from database</p>
            <p className="text-zinc-500 text-sm">Please check your database connection</p>
          </div>
        )}

        {/* Events Grid */}
        {!isLoading && !error && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {filteredEvents.length} Events Found
              </h2>
              <div className="text-zinc-400 text-sm">
                Authentic events from verified sources
              </div>
            </div>

            <AnimatePresence>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event: CarShowEvent, index: number) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    layout
                  >
                    <Card className="h-full bg-zinc-800/50 border-zinc-700 hover:border-orange-500/50 transition-all duration-300 group">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start mb-2">
                          <Badge className={`${getEventTypeColor(event.eventType)} text-white`}>
                            {getEventTypeLabel(event.eventType)}
                          </Badge>
                          {event.featured && (
                            <Star className="w-4 h-4 text-orange-400 fill-current" />
                          )}
                        </div>
                        
                        <CardTitle className="text-white group-hover:text-orange-400 transition-colors line-clamp-2">
                          {event.eventName}
                        </CardTitle>
                        
                        <CardDescription className="text-zinc-400">
                          {event.organizerName && (
                            <span className="block mb-1">by {event.organizerName}</span>
                          )}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Date */}
                        <div className="flex items-center text-zinc-300">
                          <Calendar className="w-4 h-4 mr-2 text-orange-400" />
                          <span className="text-sm">
                            {formatDate(event.startDate)}
                            {event.endDate && event.endDate !== event.startDate && (
                              <> - {formatDate(event.endDate)}</>
                            )}
                          </span>
                        </div>

                        {/* Location */}
                        <div className="flex items-center text-zinc-300">
                          <MapPin className="w-4 h-4 mr-2 text-orange-400" />
                          <span className="text-sm">
                            {event.venue && <span className="block">{event.venue}</span>}
                            {event.city}, {event.state}
                          </span>
                        </div>

                        {/* Entry Fees */}
                        {(event.entryFeeSpectator || event.entryFeeParticipant) && (
                          <div className="flex items-center text-zinc-300">
                            <DollarSign className="w-4 h-4 mr-2 text-orange-400" />
                            <span className="text-sm">
                              {event.entryFeeSpectator && `Spectator: ${event.entryFeeSpectator}`}
                              {event.entryFeeSpectator && event.entryFeeParticipant && " | "}
                              {event.entryFeeParticipant && `Entry: ${event.entryFeeParticipant}`}
                            </span>
                          </div>
                        )}

                        {/* Features */}
                        {parseFeatures(event.features).length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {parseFeatures(event.features).slice(0, 3).map((feature: string, idx: number) => (
                              <Badge 
                                key={idx} 
                                variant="outline" 
                                className="text-xs border-zinc-600 text-zinc-300"
                              >
                                {feature}
                              </Badge>
                            ))}
                            {parseFeatures(event.features).length > 3 && (
                              <Badge variant="outline" className="text-xs border-zinc-600 text-zinc-400">
                                +{parseFeatures(event.features).length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Description */}
                        {event.description && (
                          <p className="text-sm text-zinc-400 line-clamp-2">
                            {event.description}
                          </p>
                        )}

                        {/* Website Link */}
                        {event.website && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full border-zinc-600 hover:border-orange-500 hover:bg-orange-500/10"
                            onClick={() => window.open(event.website, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Visit Website
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>

            {filteredEvents.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-700 rounded-full mb-4">
                  <Search className="w-8 h-8 text-zinc-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
                <p className="text-zinc-400 mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setEventTypeFilter("all");
                    setStateFilter("all");
                    setFeaturedOnly(false);
                  }}
                  className="border-zinc-600 hover:bg-zinc-700"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}