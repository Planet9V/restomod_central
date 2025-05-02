import type { Express } from "express";
import { createServer, type Server } from "http";
import * as storage from "./storage";
import { z } from "zod";
import { contactSubmissionsInsertSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefix
  const apiPrefix = "/api";

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

  // Featured project
  app.get(`${apiPrefix}/projects/featured`, async (req, res) => {
    try {
      const project = await storage.getFeaturedProject();
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

  // Testimonials
  app.get(`${apiPrefix}/testimonials`, async (req, res) => {
    try {
      const testimonials = await storage.getTestimonials();
      res.json({ testimonials });
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      res.status(500).json({ message: "Failed to fetch testimonials" });
    }
  });

  // About data
  app.get(`${apiPrefix}/about`, async (req, res) => {
    try {
      const aboutData = await storage.getAboutData();
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

  const httpServer = createServer(app);
  return httpServer;
}
