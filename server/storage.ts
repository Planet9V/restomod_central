import { db } from "@db";
import * as schema from "@shared/schema";
import { eq, like, desc, asc } from "drizzle-orm";
import { z } from "zod";
import { zod as drizzleZod } from "drizzle-zod";

// Projects
export const getProjects = async () => {
  return db.query.projects.findMany({
    orderBy: desc(schema.projects.createdAt)
  });
};

export const getProjectsByCategory = async (category: string) => {
  return db.query.projects.findMany({
    where: eq(schema.projects.category, category),
    orderBy: desc(schema.projects.createdAt)
  });
};

export const getFeaturedProject = async () => {
  return db.query.projects.findFirst({
    where: eq(schema.projects.featured, true)
  });
};

export const getProjectBySlug = async (slug: string) => {
  return db.query.projects.findFirst({
    where: eq(schema.projects.slug, slug)
  });
};

// Testimonials
export const getTestimonials = async () => {
  return db.query.testimonials.findMany({
    orderBy: desc(schema.testimonials.createdAt)
  });
};

// Team Members
export const getTeamMembers = async () => {
  return db.query.teamMembers.findMany({
    orderBy: asc(schema.teamMembers.order)
  });
};

// Companies
export const getCompanies = async () => {
  return db.query.companies.findMany({
    orderBy: asc(schema.companies.order)
  });
};

// Engineering Features
export const getEngineeringFeatures = async () => {
  return db.query.engineeringFeatures.findMany({
    orderBy: asc(schema.engineeringFeatures.order)
  });
};

// Process Steps
export const getProcessSteps = async () => {
  return db.query.processSteps.findMany({
    orderBy: asc(schema.processSteps.order)
  });
};

// Market Data
export const getMarketData = async () => {
  return db.query.marketData.findFirst();
};

// Hero Content
export const getHeroContent = async () => {
  return db.query.heroContent.findFirst();
};

// Newsletter Subscription
export const createNewsletterSubscription = async (email: string) => {
  try {
    const [subscription] = await db.insert(schema.newsletterSubscribers)
      .values({ email })
      .returning();
    return subscription;
  } catch (error) {
    if ((error as any)?.message?.includes('duplicate key')) {
      throw new Error('This email is already subscribed to our newsletter.');
    }
    throw error;
  }
};

// Contact Form Submission
export const createContactSubmission = async (data: z.infer<typeof schema.contactSubmissionsInsertSchema>) => {
  const [submission] = await db.insert(schema.contactSubmissions)
    .values(data)
    .returning();
  return submission;
};

// About Data
export const getAboutData = async () => {
  const companies = await getCompanies();
  const team = await getTeamMembers();
  
  return {
    companies,
    team
  };
};

// Engineering Data
export const getEngineeringData = async () => {
  const features = await getEngineeringFeatures();
  
  return {
    title: "Engineering Meets Artistry",
    description: "Our unique joint venture combines McKenney's precision engineering with Skinny's meticulous craftsmanship, creating vehicles that perform as brilliantly as they look.",
    imageUrl: "https://images.unsplash.com/photo-1583508805133-8fd01e208e57?q=80&w=1600&auto=format&fit=crop",
    features
  };
};

// Process Data
export const getProcessData = async () => {
  const steps = await getProcessSteps();
  
  return {
    steps,
    warranty: {
      title: "Our Commitment to Quality",
      description: [
        "Every McKenney & Skinny's restomod is covered by our comprehensive 2-year warranty on craftsmanship and integration, with additional component warranties from our premium partners.",
        "Our support doesn't end at delivery — we provide ongoing maintenance, service, and advice to ensure your investment continues to perform flawlessly for years to come."
      ]
    }
  };
};
