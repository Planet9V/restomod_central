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

  const httpServer = createServer(app);
  return httpServer;
}
