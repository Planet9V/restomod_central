import type { Express } from "express";
import { createServer, type Server } from "http";
import * as storage from "./storage";
import { z } from "zod";
import { contactSubmissionsInsertSchema } from "@shared/schema";
import * as aiApi from "./api/ai";
import * as researchApi from "./api/research";
import { generateCarImage } from "./api/gemini";
import * as perplexityApi from "./api/perplexity";
import * as configuratorApi from "./api/configurator";
import * as assistantApi from "./api/assistant";
import * as articlesApi from "./api/articles";
import * as marketResearchApi from "./api/market-research";
import { getMarketTrends } from "./api/marketTrends";
import { scheduleArticleGeneration } from "./services/scheduler";
import { databaseHealthMonitor } from "./services/databaseHealthCheck";
import { setupAuth, isAuthenticated, isAdmin } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefix
  const apiPrefix = "/api";
  
  // Setup authentication routes
  setupAuth(app);

  // Hero content
  app.get(`${apiPrefix}/hero`, async (req, res) => {
    try {
      const heroContent = await storage.getHeroContent();
      res.json(heroContent);
    } catch (error) {
      console.error("Error fetching hero content:", error);
      res.status(500).json({ message: "Failed to fetch hero content" });
    }
  });

  // Projects
  app.get(`${apiPrefix}/projects`, async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      
      let projects;
      if (category && category !== 'all') {
        projects = await storage.getProjectsByCategory(category);
      } else {
        projects = await storage.getProjects();
      }
      
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  // Featured project with authentic market research
  app.get(`${apiPrefix}/projects/featured`, async (req, res) => {
    try {
      const { dataService } = await import('./services/dataService.js');
      const project = await dataService.getFeaturedProject();
      res.json(project);
    } catch (error) {
      console.error("Error fetching featured project:", error);
      res.status(500).json({ message: "Failed to fetch featured project" });
    }
  });

  // Get project by slug
  app.get(`${apiPrefix}/projects/:slug`, async (req, res) => {
    try {
      const { slug } = req.params;
      const project = await storage.getProjectBySlug(slug);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  // Testimonials with authentic industry research
  app.get(`${apiPrefix}/testimonials`, async (req, res) => {
    try {
      const { dataService } = await import('./services/dataService.js');
      const testimonials = await dataService.getTestimonials();
      res.json(testimonials);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      res.status(500).json({ message: "Failed to fetch testimonials" });
    }
  });

  // About data with authentic industry research
  app.get(`${apiPrefix}/about`, async (req, res) => {
    try {
      const { dataService } = await import('./services/dataService.js');
      const aboutData = await dataService.getAboutData();
      res.json(aboutData);
    } catch (error) {
      console.error("Error fetching about data:", error);
      res.status(500).json({ message: "Failed to fetch about data" });
    }
  });

  // Engineering data
  app.get(`${apiPrefix}/engineering`, async (req, res) => {
    try {
      const engineeringData = await storage.getEngineeringData();
      res.json(engineeringData);
    } catch (error) {
      console.error("Error fetching engineering data:", error);
      res.status(500).json({ message: "Failed to fetch engineering data" });
    }
  });

  // Process data
  app.get(`${apiPrefix}/process`, async (req, res) => {
    try {
      const processData = await storage.getProcessData();
      res.json(processData);
    } catch (error) {
      console.error("Error fetching process data:", error);
      res.status(500).json({ message: "Failed to fetch process data" });
    }
  });

  // Market insights
  app.get(`${apiPrefix}/market-insights`, async (req, res) => {
    try {
      const marketData = await storage.getMarketData();
      res.json(marketData);
    } catch (error) {
      console.error("Error fetching market insights:", error);
      res.status(500).json({ message: "Failed to fetch market insights" });
    }
  });

  // Newsletter subscription
  app.post(`${apiPrefix}/newsletter/subscribe`, async (req, res) => {
    try {
      const { email } = req.body;
      
      // Validate email
      const emailSchema = z.string().email("Please provide a valid email address");
      emailSchema.parse(email);
      
      const subscription = await storage.createNewsletterSubscription(email);
      res.status(201).json(subscription);
    } catch (error) {
      console.error("Error creating newsletter subscription:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      
      if ((error as Error).message === 'This email is already subscribed to our newsletter.') {
        return res.status(409).json({ message: (error as Error).message });
      }
      
      res.status(500).json({ message: "Failed to subscribe to newsletter" });
    }
  });

  // Contact form submission
  app.post(`${apiPrefix}/contact`, async (req, res) => {
    try {
      // Validate form data
      const validatedData = contactSubmissionsInsertSchema.parse(req.body);
      
      const submission = await storage.createContactSubmission(validatedData);
      res.status(201).json(submission);
    } catch (error) {
      console.error("Error processing contact form:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
        });
      }
      
      res.status(500).json({ message: "Failed to submit contact form" });
    }
  });

  // AI configurator recommendation
  app.post(`${apiPrefix}/ai/configurator-recommendation`, aiApi.getConfiguratorRecommendation);

  // AI research endpoints
  app.get(`${apiPrefix}/research/vehicle`, researchApi.getVehicleResearch);
  app.get(`${apiPrefix}/research/part`, researchApi.getPartResearch);

  // Gemini image generation endpoint
  app.post(`${apiPrefix}/gemini/generate-image`, generateCarImage);

  // AI Assistant endpoints (K.I.T.T.)
  app.post(`${apiPrefix}/ai/assistant`, assistantApi.assistantChat);
  app.get(`${apiPrefix}/ai/historical-context`, assistantApi.getHistoricalContext);
  app.post(`${apiPrefix}/ai/performance-prediction`, assistantApi.generatePerformancePrediction);

  // Perplexity API endpoints
  app.get(`${apiPrefix}/perplexity/car-info`, perplexityApi.getCarInformation);
  app.get(`${apiPrefix}/perplexity/part-info`, perplexityApi.getPartInformation);
  app.post(`${apiPrefix}/perplexity/configuration`, perplexityApi.getConfigurationRecommendations);
  
  // Market Research API endpoint
  app.post(`${apiPrefix}/market-research/search`, marketResearchApi.searchMarketData);
  
  // Market Trends API endpoint
  app.get(`${apiPrefix}/market-trends`, getMarketTrends);
  
  // ========== RESEARCH DATA PROCESSING ROUTES ==========
  // Process authentic research documents and populate database
  const { processResearchDataHandler, getAuthenticDataHandler, getProcessingStatusHandler } = await import('./api/processResearchData');
  const { carShowEventProcessor } = await import('./services/carShowEventProcessor');
  
  app.post(`${apiPrefix}/admin/process-research-data`, isAuthenticated, isAdmin, processResearchDataHandler);
  app.get(`${apiPrefix}/authentic-data/:type`, getAuthenticDataHandler);
  app.get(`${apiPrefix}/processing-status`, getProcessingStatusHandler);

  // ========== CAR SHOW CALENDAR & EVENTS ==========
  // Calendar and event search functionality from your research documents
  
  // Get car show calendar events
  app.get(`${apiPrefix}/car-show-calendar`, async (req, res) => {
    try {
      const { year, month } = req.query;
      
      if (year && month) {
        const events = carShowEventProcessor.getEventsForMonth(
          parseInt(year as string), 
          parseInt(month as string) - 1
        );
        res.json({ events, year, month });
      } else {
        // Return all calendar events
        const carShowData = (global as any).carShowData;
        res.json({ 
          events: carShowData?.eventCalendar || [],
          message: carShowData ? "Calendar loaded from research documents" : "Process car show data first"
        });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch calendar events" });
    }
  });

  // Search car show events
  app.get(`${apiPrefix}/car-show-search`, async (req, res) => {
    try {
      const { location, eventType, startDate, endDate } = req.query;
      
      const criteria: any = {};
      if (location) criteria.location = location as string;
      if (eventType) criteria.eventType = eventType as string;
      if (startDate && endDate) {
        criteria.dateRange = {
          start: new Date(startDate as string),
          end: new Date(endDate as string)
        };
      }

      const events = carShowEventProcessor.searchEvents(criteria);
      res.json({ 
        events, 
        criteria,
        count: events.length,
        source: "authentic_research_documents"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to search events" });
    }
  });

  // Get event venues from research
  app.get(`${apiPrefix}/event-venues`, async (req, res) => {
    try {
      const carShowData = (global as any).carShowData;
      res.json({
        venues: carShowData?.eventVenues || [],
        websites: carShowData?.eventWebsites || [],
        searchFilters: carShowData?.searchFilters || [],
        source: "car_show_research_documents"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch event venues" });
    }
  });

  // ========== GEMINI AI EVENT PROCESSING ==========
  // Intelligent event processing and database storage
  
  // Process new event data with Gemini AI
  app.post(`${apiPrefix}/admin/process-events`, isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { geminiEventProcessor } = await import('./services/geminiEventProcessor');
      const { eventData, sourceUrl } = req.body;
      
      if (!eventData) {
        return res.status(400).json({ error: "Event data is required" });
      }

      const result = await geminiEventProcessor.processEventData(eventData, sourceUrl);
      res.json(result);
    } catch (error) {
      console.error("Error processing events with Gemini:", error);
      res.status(500).json({ error: "Failed to process events" });
    }
  });

  // Search for new events in research documents
  app.post(`${apiPrefix}/admin/search-new-events`, isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { geminiEventProcessor } = await import('./services/geminiEventProcessor');
      const result = await geminiEventProcessor.searchForNewEvents();
      res.json(result);
    } catch (error) {
      console.error("Error searching for new events:", error);
      res.status(500).json({ error: "Failed to search for new events" });
    }
  });

  // Get ALL car show events from PostgreSQL database (193+ authentic events with advanced filtering)
  app.get(`${apiPrefix}/car-show-events`, async (req, res) => {
    console.log('🎯 Car show events API called:', req.url);
    
    // Force JSON response and prevent HTML fallback
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    
    // Prevent any potential routing conflicts
    if (req.path !== '/api/car-show-events') {
      return res.status(404).json({ error: 'Invalid API endpoint' });
    }
    
    try {
      const { 
        eventType, 
        state, 
        region, 
        category, 
        month, 
        featured, 
        status, 
        search,
        limit 
      } = req.query;
      
      const filters: any = {};
      
      // Advanced filtering capabilities
      if (eventType && eventType !== 'all') filters.eventType = eventType as string;
      if (state && state !== 'all') filters.state = state as string;
      if (region && region !== 'all') filters.region = region as string;
      if (category && category !== 'all') filters.category = category as string;
      if (month && month !== 'all') filters.month = month as string;
      if (featured !== undefined) filters.featured = featured === 'true';
      if (status && status !== 'all') filters.status = status as string;
      if (search && typeof search === 'string' && search.trim()) filters.search = search;
      if (limit) filters.limit = parseInt(limit as string);

      console.log('🔍 Fetching car show events with filters:', filters);
      const events = await storage.getCarShowEvents(filters);
      console.log('✅ Successfully fetched events:', events?.length || 0);
      
      // Ensure we're returning valid JSON with proper structure
      const response = { 
        success: true, 
        events: events || [], 
        total: events?.length || 0,
        filters: {
          applied: Object.keys(filters).length > 0 ? filters : null,
          available: {
            regions: ['midwest', 'south', 'northeast', 'west', 'southeast', 'southwest'],
            categories: ['classic_cars', 'muscle_cars', 'hot_rods', 'street_rods', 'antique_cars', 'exotic_cars', 'trucks', 'motorcycles'],
            eventTypes: ['auction', 'car_show', 'concours', 'cruise_in', 'swap_meet']
          }
        },
        message: `Loaded ${events?.length || 0} authentic car show events from nationwide database`
      };
      
      console.log('📤 Sending JSON response with', response.events.length, 'events');
      return res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching car show events:", error);
      res.status(500).json({ error: "Failed to fetch car show events from database" });
    }
  });

  // Legacy database-events endpoint for backward compatibility
  app.get(`${apiPrefix}/database-events`, async (req, res) => {
    try {
      const { eventType, state, featured, status, limit } = req.query;
      
      const filters: any = {};
      if (eventType) filters.eventType = eventType as string;
      if (state) filters.state = state as string;
      if (featured !== undefined) filters.featured = featured === 'true';
      if (status) filters.status = status as string;
      if (limit) filters.limit = parseInt(limit as string);

      const events = await storage.getCarShowEvents(filters);
      res.json({ success: true, events });
    } catch (error) {
      console.error("Error fetching car show events:", error);
      res.status(500).json({ error: "Failed to fetch car show events from database" });
    }
  });

  // Categorize content with Gemini AI
  app.post(`${apiPrefix}/admin/categorize-content`, isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { geminiEventProcessor } = await import('./services/geminiEventProcessor');
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ error: "Content is required" });
      }

      const result = await geminiEventProcessor.categorizeEventContent(content);
      res.json(result);
    } catch (error) {
      console.error("Error categorizing content:", error);
      res.status(500).json({ error: "Failed to categorize content" });
    }
  });

  // Complete Car Show Events CRUD API Routes for PostgreSQL

  // Create new car show event
  app.post(`${apiPrefix}/admin/car-show-events`, isAuthenticated, isAdmin, async (req, res) => {
    try {
      const event = await storage.createCarShowEvent(req.body);
      res.status(201).json({ success: true, event });
    } catch (error) {
      console.error("Error creating car show event:", error);
      res.status(500).json({ error: "Failed to create car show event" });
    }
  });

  // Update car show event
  app.put(`${apiPrefix}/admin/car-show-events/:id`, isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.updateCarShowEvent(id, req.body);
      res.json({ success: true, event });
    } catch (error) {
      console.error("Error updating car show event:", error);
      res.status(500).json({ error: "Failed to update car show event" });
    }
  });

  // Delete car show event
  app.delete(`${apiPrefix}/admin/car-show-events/:id`, isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCarShowEvent(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting car show event:", error);
      res.status(500).json({ error: "Failed to delete car show event" });
    }
  });

  // Get single car show event by ID
  app.get(`${apiPrefix}/car-show-events/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getCarShowEventById(id);
      res.json({ success: true, event });
    } catch (error) {
      console.error("Error fetching car show event:", error);
      res.status(500).json({ error: "Failed to fetch car show event" });
    }
  });

  // Get car show event by slug
  app.get(`${apiPrefix}/car-show-events/slug/:slug`, async (req, res) => {
    try {
      const event = await storage.getCarShowEventBySlug(req.params.slug);
      res.json({ success: true, event });
    } catch (error) {
      console.error("Error fetching car show event by slug:", error);
      res.status(500).json({ error: "Failed to fetch car show event" });
    }
  });

  // Get featured car show events
  app.get(`${apiPrefix}/car-show-events/featured`, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const events = await storage.getFeaturedCarShowEvents(limit);
      res.json({ success: true, events });
    } catch (error) {
      console.error("Error fetching featured car show events:", error);
      res.status(500).json({ error: "Failed to fetch featured car show events" });
    }
  });

  // Get ALL Gateway Classic Cars inventory (90 authentic vehicles)
  app.get(`${apiPrefix}/gateway-vehicles`, async (req, res) => {
    try {
      const { make, category, priceMin, priceMax, year } = req.query;
      
      const filters: any = {};
      if (make && make !== 'all') filters.make = make as string;
      if (category && category !== 'all') filters.category = category as string;
      if (priceMin) filters.priceMin = parseFloat(priceMin as string);
      if (priceMax) filters.priceMax = parseFloat(priceMax as string);
      if (year) filters.year = parseInt(year as string);

      const vehicles = await storage.getGatewayVehicles(filters);
      res.json({ success: true, vehicles, total: vehicles.length });
    } catch (error) {
      console.error("Error fetching Gateway vehicles:", error);
      res.status(500).json({ error: "Failed to fetch Gateway Classic Cars inventory" });
    }
  });

  // IMMEDIATE DATA IMPORT - All authentic car shows and Gateway cars
  app.post(`${apiPrefix}/import-all-data-now`, async (req, res) => {
    try {
      console.log('🚗 IMPORTING ALL AUTHENTIC DATA INTO DATABASE...');
      
      // Import car show events from seeder
      const { seedCarShowEvents } = await import('../db/seed-car-show-events');
      const carShowResult = await seedCarShowEvents();
      console.log('✅ Car show events imported:', carShowResult);
      
      // Import Gateway Classic Cars
      const { seedGatewayClassics } = await import('../db/seed-gateway-classics');
      const gatewayResult = await seedGatewayClassics();
      console.log('✅ Gateway Classic Cars imported:', gatewayResult);
      
      res.json({
        success: true,
        message: 'ALL AUTHENTIC DATA IMPORTED SUCCESSFULLY',
        results: {
          carShows: carShowResult,
          gatewayCars: gatewayResult
        }
      });
    } catch (error) {
      console.error("Error importing all data:", error);
      res.status(500).json({ 
        success: false,
        error: "Failed to import data",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Direct import of Midwest car show data - unrestricted for immediate use
  app.post(`${apiPrefix}/import-midwest-shows-now`, async (req, res) => {
    try {
      const { importMidwestCarShows } = await import('./services/midwestCarShowImporter');
      console.log('🚗 Starting immediate import of authentic Midwest car show events...');
      const result = await importMidwestCarShows();
      
      res.json({
        success: true,
        message: `Successfully imported ${result.imported} authentic Midwest car show events`,
        stats: {
          imported: result.imported,
          duplicatesSkipped: result.duplicates,
          errors: result.errors,
          totalProcessed: result.total
        }
      });
    } catch (error) {
      console.error("Error importing Midwest car shows:", error);
      res.status(500).json({ 
        success: false,
        error: "Failed to import Midwest car show data",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Import Midwest car show data from research documents
  app.post(`${apiPrefix}/admin/import-midwest-car-shows`, isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { importMidwestCarShows } = await import('./services/midwestCarShowImporter');
      console.log('🚗 Starting import of authentic Midwest car show events...');
      const result = await importMidwestCarShows();
      
      res.json({
        success: true,
        message: `Successfully imported ${result.imported} authentic Midwest car show events`,
        stats: {
          imported: result.imported,
          duplicatesSkipped: result.duplicates,
          errors: result.errors,
          totalProcessed: result.total
        }
      });
    } catch (error) {
      console.error("Error importing Midwest car shows:", error);
      res.status(500).json({ 
        success: false,
        error: "Failed to import Midwest car show data",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Seed database with authentic car show events
  app.post(`${apiPrefix}/admin/seed-car-show-events`, isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { seedCarShowEvents } = await import('../db/seed-car-show-events');
      console.log('🌱 Starting car show events seeding with authentic data...');
      const result = await seedCarShowEvents();
      res.json(result);
    } catch (error) {
      console.error("Error seeding car show events:", error);
      res.status(500).json({ 
        error: "Failed to seed car show events",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ========== ADMIN API ROUTES ==========
  // These routes are protected and require admin authentication
  
  // Admin Projects CRUD
  app.post(`${apiPrefix}/admin/projects`, isAuthenticated, isAdmin, async (req, res) => {
    try {
      const project = await storage.createProject(req.body);
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
        });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });
  
  app.put(`${apiPrefix}/admin/projects/:id`, isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const projectId = parseInt(id);
      
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const project = await storage.updateProject(projectId, req.body);
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
        });
      }
      if ((error as Error).message === 'Project not found') {
        return res.status(404).json({ message: "Project not found" });
      }
      res.status(500).json({ message: "Failed to update project" });
    }
  });
  
  app.delete(`${apiPrefix}/admin/projects/:id`, isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const projectId = parseInt(id);
      
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      await storage.deleteProject(projectId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting project:", error);
      if ((error as Error).message === 'Project not found') {
        return res.status(404).json({ message: "Project not found" });
      }
      res.status(500).json({ message: "Failed to delete project" });
    }
  });
  
  // Admin Testimonials CRUD
  app.post(`${apiPrefix}/admin/testimonials`, isAuthenticated, isAdmin, async (req, res) => {
    try {
      const testimonial = await storage.createTestimonial(req.body);
      res.status(201).json(testimonial);
    } catch (error) {
      console.error("Error creating testimonial:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
        });
      }
      res.status(500).json({ message: "Failed to create testimonial" });
    }
  });
  
  app.put(`${apiPrefix}/admin/testimonials/:id`, isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const testimonialId = parseInt(id);
      
      if (isNaN(testimonialId)) {
        return res.status(400).json({ message: "Invalid testimonial ID" });
      }
      
      const testimonial = await storage.updateTestimonial(testimonialId, req.body);
      res.json(testimonial);
    } catch (error) {
      console.error("Error updating testimonial:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
        });
      }
      if ((error as Error).message === 'Testimonial not found') {
        return res.status(404).json({ message: "Testimonial not found" });
      }
      res.status(500).json({ message: "Failed to update testimonial" });
    }
  });
  
  app.delete(`${apiPrefix}/admin/testimonials/:id`, isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const testimonialId = parseInt(id);
      
      if (isNaN(testimonialId)) {
        return res.status(400).json({ message: "Invalid testimonial ID" });
      }
      
      await storage.deleteTestimonial(testimonialId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      if ((error as Error).message === 'Testimonial not found') {
        return res.status(404).json({ message: "Testimonial not found" });
      }
      res.status(500).json({ message: "Failed to delete testimonial" });
    }
  });
  
  // Admin Hero Content Update
  app.put(`${apiPrefix}/admin/hero/:id`, isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const heroId = parseInt(id);
      
      if (isNaN(heroId)) {
        return res.status(400).json({ message: "Invalid hero content ID" });
      }
      
      const heroContent = await storage.updateHeroContent(heroId, req.body);
      res.json(heroContent);
    } catch (error) {
      console.error("Error updating hero content:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
        });
      }
      if ((error as Error).message === 'Hero content not found') {
        return res.status(404).json({ message: "Hero content not found" });
      }
      res.status(500).json({ message: "Failed to update hero content" });
    }
  });
  
  // Admin Team Members CRUD
  app.post(`${apiPrefix}/admin/team`, isAuthenticated, isAdmin, async (req, res) => {
    try {
      const teamMember = await storage.createTeamMember(req.body);
      res.status(201).json(teamMember);
    } catch (error) {
      console.error("Error creating team member:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
        });
      }
      res.status(500).json({ message: "Failed to create team member" });
    }
  });
  
  app.put(`${apiPrefix}/admin/team/:id`, isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const teamMemberId = parseInt(id);
      
      if (isNaN(teamMemberId)) {
        return res.status(400).json({ message: "Invalid team member ID" });
      }
      
      const teamMember = await storage.updateTeamMember(teamMemberId, req.body);
      res.json(teamMember);
    } catch (error) {
      console.error("Error updating team member:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
        });
      }
      if ((error as Error).message === 'Team member not found') {
        return res.status(404).json({ message: "Team member not found" });
      }
      res.status(500).json({ message: "Failed to update team member" });
    }
  });
  
  app.delete(`${apiPrefix}/admin/team/:id`, isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const teamMemberId = parseInt(id);
      
      if (isNaN(teamMemberId)) {
        return res.status(400).json({ message: "Invalid team member ID" });
      }
      
      await storage.deleteTeamMember(teamMemberId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting team member:", error);
      if ((error as Error).message === 'Team member not found') {
        return res.status(404).json({ message: "Team member not found" });
      }
      res.status(500).json({ message: "Failed to delete team member" });
    }
  });
  
  // Admin Company Info Update
  app.put(`${apiPrefix}/admin/companies/:id`, isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const companyId = parseInt(id);
      
      if (isNaN(companyId)) {
        return res.status(400).json({ message: "Invalid company ID" });
      }
      
      const company = await storage.updateCompany(companyId, req.body);
      res.json(company);
    } catch (error) {
      console.error("Error updating company:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
        });
      }
      if ((error as Error).message === 'Company not found') {
        return res.status(404).json({ message: "Company not found" });
      }
      res.status(500).json({ message: "Failed to update company" });
    }
  });
  
  // ========== LUXURY SHOWCASES API ROUTES ==========
  
  // Get all luxury showcases
  app.get(`${apiPrefix}/luxury-showcases`, async (req, res) => {
    try {
      const showcases = await storage.getLuxuryShowcases();
      res.json(showcases);
    } catch (error) {
      console.error("Error fetching luxury showcases:", error);
      res.status(500).json({ message: "Failed to fetch luxury showcases" });
    }
  });
  
  // Get featured luxury showcases
  app.get(`${apiPrefix}/luxury-showcases/featured`, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
      const showcases = await storage.getFeaturedLuxuryShowcases(limit);
      res.json(showcases);
    } catch (error) {
      console.error("Error fetching featured luxury showcases:", error);
      res.status(500).json({ message: "Failed to fetch featured luxury showcases" });
    }
  });
  
  // Get a specific luxury showcase by slug
  app.get(`${apiPrefix}/luxury-showcases/:slug`, async (req, res) => {
    try {
      const { slug } = req.params;
      const showcase = await storage.getLuxuryShowcaseBySlug(slug);
      
      if (!showcase) {
        return res.status(404).json({ message: "Luxury showcase not found" });
      }
      
      res.json(showcase);
    } catch (error) {
      console.error("Error fetching luxury showcase:", error);
      res.status(500).json({ message: "Failed to fetch luxury showcase" });
    }
  });
  
  // Admin Luxury Showcases CRUD
  app.post(`${apiPrefix}/admin/luxury-showcases`, isAuthenticated, isAdmin, async (req, res) => {
    try {
      const showcase = await storage.createLuxuryShowcase(req.body);
      res.status(201).json(showcase);
    } catch (error) {
      console.error("Error creating luxury showcase:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
        });
      }
      res.status(500).json({ message: "Failed to create luxury showcase" });
    }
  });
  
  app.put(`${apiPrefix}/admin/luxury-showcases/:id`, isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const showcaseId = parseInt(id);
      
      if (isNaN(showcaseId)) {
        return res.status(400).json({ message: "Invalid luxury showcase ID" });
      }
      
      const showcase = await storage.updateLuxuryShowcase(showcaseId, req.body);
      res.json(showcase);
    } catch (error) {
      console.error("Error updating luxury showcase:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
        });
      }
      if ((error as Error).message === 'Luxury showcase not found') {
        return res.status(404).json({ message: "Luxury showcase not found" });
      }
      res.status(500).json({ message: "Failed to update luxury showcase" });
    }
  });
  
  app.delete(`${apiPrefix}/admin/luxury-showcases/:id`, isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const showcaseId = parseInt(id);
      
      if (isNaN(showcaseId)) {
        return res.status(400).json({ message: "Invalid luxury showcase ID" });
      }
      
      await storage.deleteLuxuryShowcase(showcaseId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting luxury showcase:", error);
      if ((error as Error).message === 'Luxury showcase not found') {
        return res.status(404).json({ message: "Luxury showcase not found" });
      }
      res.status(500).json({ message: "Failed to delete luxury showcase" });
    }
  });

  // ========== CAR CONFIGURATOR API ROUTES ==========
  
  // Car Models API routes
  app.get(`${apiPrefix}/configurator/car-models`, configuratorApi.getCarModels);
  app.get(`${apiPrefix}/configurator/car-models/:id`, configuratorApi.getCarModelById);
  app.post(`${apiPrefix}/configurator/car-models`, isAuthenticated, isAdmin, configuratorApi.createCarModel);
  app.put(`${apiPrefix}/configurator/car-models/:id`, isAuthenticated, isAdmin, configuratorApi.updateCarModel);
  app.delete(`${apiPrefix}/configurator/car-models/:id`, isAuthenticated, isAdmin, configuratorApi.deleteCarModel);
  
  // Engine Options API routes
  app.get(`${apiPrefix}/configurator/engines`, configuratorApi.getEngineOptions);
  app.get(`${apiPrefix}/configurator/engines/:id`, configuratorApi.getEngineOptionById);
  app.post(`${apiPrefix}/configurator/engines`, isAuthenticated, isAdmin, configuratorApi.createEngineOption);
  app.put(`${apiPrefix}/configurator/engines/:id`, isAuthenticated, isAdmin, configuratorApi.updateEngineOption);
  app.delete(`${apiPrefix}/configurator/engines/:id`, isAuthenticated, isAdmin, configuratorApi.deleteEngineOption);
  
  // Transmission Options API routes
  app.get(`${apiPrefix}/configurator/transmissions`, configuratorApi.getTransmissionOptions);
  app.get(`${apiPrefix}/configurator/transmissions/:id`, configuratorApi.getTransmissionOptionById);
  app.post(`${apiPrefix}/configurator/transmissions`, isAuthenticated, isAdmin, configuratorApi.createTransmissionOption);
  app.put(`${apiPrefix}/configurator/transmissions/:id`, isAuthenticated, isAdmin, configuratorApi.updateTransmissionOption);
  app.delete(`${apiPrefix}/configurator/transmissions/:id`, isAuthenticated, isAdmin, configuratorApi.deleteTransmissionOption);
  
  // Color Options API routes
  app.get(`${apiPrefix}/configurator/colors`, configuratorApi.getColorOptions);
  app.get(`${apiPrefix}/configurator/colors/:id`, configuratorApi.getColorOptionById);
  app.post(`${apiPrefix}/configurator/colors`, isAuthenticated, isAdmin, configuratorApi.createColorOption);
  app.put(`${apiPrefix}/configurator/colors/:id`, isAuthenticated, isAdmin, configuratorApi.updateColorOption);
  app.delete(`${apiPrefix}/configurator/colors/:id`, isAuthenticated, isAdmin, configuratorApi.deleteColorOption);
  
  // Wheel Options API routes
  app.get(`${apiPrefix}/configurator/wheels`, configuratorApi.getWheelOptions);
  app.get(`${apiPrefix}/configurator/wheels/:id`, configuratorApi.getWheelOptionById);
  app.post(`${apiPrefix}/configurator/wheels`, isAuthenticated, isAdmin, configuratorApi.createWheelOption);
  app.put(`${apiPrefix}/configurator/wheels/:id`, isAuthenticated, isAdmin, configuratorApi.updateWheelOption);
  app.delete(`${apiPrefix}/configurator/wheels/:id`, isAuthenticated, isAdmin, configuratorApi.deleteWheelOption);
  
  // Future API routes for interior options, AI options, additional options, and user configurations will be added later


  // ========== RESEARCH ARTICLES API ROUTES ==========
  
  // Get all research articles
  // New enhanced research articles endpoints with advanced filtering
  app.get(`${apiPrefix}/research-articles`, articlesApi.getResearchArticles);
  
  // Get featured research articles
  app.get(`${apiPrefix}/research-articles/featured`, articlesApi.getFeaturedArticles);
  
  // Get article categories
  app.get(`${apiPrefix}/research-articles/categories`, articlesApi.getArticleCategories);
  
  // Get popular tags
  app.get(`${apiPrefix}/research-articles/tags/popular`, articlesApi.getPopularTags);
  
  // Get articles by category
  app.get(`${apiPrefix}/research-articles/category/:category`, articlesApi.getArticlesByCategory);
  
  // Get articles by tag
  app.get(`${apiPrefix}/research-articles/tag/:tag`, articlesApi.getArticlesByTag);
  
  // Get research article by slug
  app.get(`${apiPrefix}/research-articles/:slug`, articlesApi.getResearchArticleBySlug);
  
  // Generate a new article (admin only)
  app.post(`${apiPrefix}/admin/research-articles/generate`, isAuthenticated, isAdmin, articlesApi.generateArticle);
  
  // Real-time market research endpoint using Perplexity API
  app.post(`${apiPrefix}/market-research/search`, marketResearchApi.searchMarketData);
  
  // Admin Research Articles CRUD
  app.post(`${apiPrefix}/admin/research-articles`, isAuthenticated, isAdmin, async (req, res) => {
    try {
      const article = await storage.createResearchArticle(req.body);
      res.status(201).json(article);
    } catch (error) {
      console.error("Error creating research article:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
        });
      }
      res.status(500).json({ message: "Failed to create research article" });
    }
  });
  
  app.put(`${apiPrefix}/admin/research-articles/:id`, isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const articleId = parseInt(id);
      
      if (isNaN(articleId)) {
        return res.status(400).json({ message: "Invalid research article ID" });
      }
      
      const article = await storage.updateResearchArticle(articleId, req.body);
      res.json(article);
    } catch (error) {
      console.error("Error updating research article:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
        });
      }
      if ((error as Error).message === 'Research article not found') {
        return res.status(404).json({ message: "Research article not found" });
      }
      res.status(500).json({ message: "Failed to update research article" });
    }
  });
  
  app.delete(`${apiPrefix}/admin/research-articles/:id`, isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const articleId = parseInt(id);
      
      if (isNaN(articleId)) {
        return res.status(400).json({ message: "Invalid research article ID" });
      }
      
      await storage.deleteResearchArticle(articleId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting research article:", error);
      if ((error as Error).message === 'Research article not found') {
        return res.status(404).json({ message: "Research article not found" });
      }
      res.status(500).json({ message: "Failed to delete research article" });
    }
  });

  // ========== DATABASE HEALTH MONITORING API ROUTES ==========
  
  // Get current database health status
  app.get(`${apiPrefix}/database/health`, async (req, res) => {
    try {
      const health = await databaseHealthMonitor.performHealthCheck();
      res.json(health);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to check database health", 
        error: (error as Error).message 
      });
    }
  });

  // Get database health report (detailed text format)
  app.get(`${apiPrefix}/database/health-report`, async (req, res) => {
    try {
      const report = databaseHealthMonitor.generateHealthReport();
      res.set('Content-Type', 'text/plain');
      res.send(report);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to generate health report", 
        error: (error as Error).message 
      });
    }
  });

  // Get database health history
  app.get(`${apiPrefix}/database/health-history`, async (req, res) => {
    try {
      const history = databaseHealthMonitor.getHealthHistory();
      res.json({ history });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to get health history", 
        error: (error as Error).message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
