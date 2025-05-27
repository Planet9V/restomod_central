import { db } from "@db";
import * as schema from "@shared/schema";
import { eq, like, desc, asc, gte, lte, and, or, ilike, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";

// Type for update operations
type UpdateData<T> = Partial<T>;

// ========== ADMIN CRUD OPERATIONS ==========

// Projects CRUD
export const createProject = async (data: z.infer<typeof schema.projectsInsertSchema>) => {
  const [project] = await db.insert(schema.projects)
    .values(data)
    .returning();
  return project;
};

export const updateProject = async (id: number, data: UpdateData<z.infer<typeof schema.projectsInsertSchema>>) => {
  const existing = await db.query.projects.findFirst({
    where: eq(schema.projects.id, id)
  });
  
  if (!existing) {
    throw new Error('Project not found');
  }
  
  const [updated] = await db.update(schema.projects)
    .set(data)
    .where(eq(schema.projects.id, id))
    .returning();
  
  return updated;
};

export const deleteProject = async (id: number) => {
  const existing = await db.query.projects.findFirst({
    where: eq(schema.projects.id, id)
  });
  
  if (!existing) {
    throw new Error('Project not found');
  }
  
  await db.delete(schema.projects)
    .where(eq(schema.projects.id, id));
  
  return true;
};

// Testimonials CRUD
export const createTestimonial = async (data: z.infer<typeof schema.testimonialsInsertSchema>) => {
  const [testimonial] = await db.insert(schema.testimonials)
    .values(data)
    .returning();
  return testimonial;
};

export const updateTestimonial = async (id: number, data: UpdateData<z.infer<typeof schema.testimonialsInsertSchema>>) => {
  const existing = await db.query.testimonials.findFirst({
    where: eq(schema.testimonials.id, id)
  });
  
  if (!existing) {
    throw new Error('Testimonial not found');
  }
  
  const [updated] = await db.update(schema.testimonials)
    .set(data)
    .where(eq(schema.testimonials.id, id))
    .returning();
  
  return updated;
};

export const deleteTestimonial = async (id: number) => {
  const existing = await db.query.testimonials.findFirst({
    where: eq(schema.testimonials.id, id)
  });
  
  if (!existing) {
    throw new Error('Testimonial not found');
  }
  
  await db.delete(schema.testimonials)
    .where(eq(schema.testimonials.id, id));
  
  return true;
};

// Team Members CRUD
export const createTeamMember = async (data: z.infer<typeof schema.teamMembersInsertSchema>) => {
  const [teamMember] = await db.insert(schema.teamMembers)
    .values(data)
    .returning();
  return teamMember;
};

export const updateTeamMember = async (id: number, data: UpdateData<z.infer<typeof schema.teamMembersInsertSchema>>) => {
  const existing = await db.query.teamMembers.findFirst({
    where: eq(schema.teamMembers.id, id)
  });
  
  if (!existing) {
    throw new Error('Team member not found');
  }
  
  const [updated] = await db.update(schema.teamMembers)
    .set(data)
    .where(eq(schema.teamMembers.id, id))
    .returning();
  
  return updated;
};

export const deleteTeamMember = async (id: number) => {
  const existing = await db.query.teamMembers.findFirst({
    where: eq(schema.teamMembers.id, id)
  });
  
  if (!existing) {
    throw new Error('Team member not found');
  }
  
  await db.delete(schema.teamMembers)
    .where(eq(schema.teamMembers.id, id));
  
  return true;
};

// Company Info
export const updateCompany = async (id: number, data: UpdateData<z.infer<typeof schema.companiesInsertSchema>>) => {
  const existing = await db.query.companies.findFirst({
    where: eq(schema.companies.id, id)
  });
  
  if (!existing) {
    throw new Error('Company not found');
  }
  
  const [updated] = await db.update(schema.companies)
    .set(data)
    .where(eq(schema.companies.id, id))
    .returning();
  
  return updated;
};

// Hero Content
export const updateHeroContent = async (id: number, data: UpdateData<z.infer<typeof schema.heroContentInsertSchema>>) => {
  const existing = await db.query.heroContent.findFirst({
    where: eq(schema.heroContent.id, id)
  });
  
  if (!existing) {
    throw new Error('Hero content not found');
  }
  
  const [updated] = await db.update(schema.heroContent)
    .set(data)
    .where(eq(schema.heroContent.id, id))
    .returning();
  
  return updated;
};

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
    description: "At Skinny's Rod and Custom, we blend precision engineering with meticulous craftsmanship, backed by our McKenney Engineering division, creating vehicles that perform as brilliantly as they look.",
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
        "Every Skinny's Rod and Custom vehicle is covered by our comprehensive 2-year warranty on craftsmanship and integration, with additional component warranties from our premium partners.",
        "Our support doesn't end at delivery — we provide ongoing maintenance, service, and advice to ensure your investment continues to perform flawlessly for years to come."
      ]
    }
  };
};

// ========== LUXURY SHOWCASES OPERATIONS ==========

// Luxury Showcases CRUD
export const createLuxuryShowcase = async (data: z.infer<typeof schema.luxuryShowcaseInsertSchema>) => {
  const [showcase] = await db.insert(schema.luxuryShowcases)
    .values(data)
    .returning();
  return showcase;
};

export const updateLuxuryShowcase = async (id: number, data: UpdateData<z.infer<typeof schema.luxuryShowcaseInsertSchema>>) => {
  const existing = await db.query.luxuryShowcases.findFirst({
    where: eq(schema.luxuryShowcases.id, id)
  });
  
  if (!existing) {
    throw new Error('Luxury showcase not found');
  }
  
  const [updated] = await db.update(schema.luxuryShowcases)
    .set(data)
    .where(eq(schema.luxuryShowcases.id, id))
    .returning();
  
  return updated;
};

export const deleteLuxuryShowcase = async (id: number) => {
  const existing = await db.query.luxuryShowcases.findFirst({
    where: eq(schema.luxuryShowcases.id, id)
  });
  
  if (!existing) {
    throw new Error('Luxury showcase not found');
  }
  
  await db.delete(schema.luxuryShowcases)
    .where(eq(schema.luxuryShowcases.id, id));
  
  return true;
};

// Get all luxury showcases
export const getLuxuryShowcases = async () => {
  return db.query.luxuryShowcases.findMany({
    orderBy: desc(schema.luxuryShowcases.createdAt),
    with: {
      project: true
    }
  });
};

// Get a specific luxury showcase by ID
export const getLuxuryShowcaseById = async (id: number) => {
  return db.query.luxuryShowcases.findFirst({
    where: eq(schema.luxuryShowcases.id, id),
    with: {
      project: true
    }
  });
};

// Get a specific luxury showcase by slug
export const getLuxuryShowcaseBySlug = async (slug: string) => {
  return db.query.luxuryShowcases.findFirst({
    where: eq(schema.luxuryShowcases.slug, slug),
    with: {
      project: true
    }
  });
};

// Get featured luxury showcases
export const getFeaturedLuxuryShowcases = async (limit: number = 3) => {
  return db.query.luxuryShowcases.findMany({
    where: eq(schema.luxuryShowcases.featured, true),
    orderBy: desc(schema.luxuryShowcases.createdAt),
    limit,
    with: {
      project: true
    }
  });
};

// Research Articles CRUD operations
export const createResearchArticle = async (data: z.infer<typeof schema.researchArticlesInsertSchema>) => {
  const [result] = await db.insert(schema.researchArticles).values({
    ...data,
    tags: Array.isArray(data.tags) ? data.tags : [],
  }).returning();
  return result;
};

export const updateResearchArticle = async (id: number, data: UpdateData<z.infer<typeof schema.researchArticlesInsertSchema>>) => {
  if (data.tags && !Array.isArray(data.tags)) {
    data.tags = [];
  }
  
  const [result] = await db
    .update(schema.researchArticles)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(schema.researchArticles.id, id))
    .returning();
  return result;
};

export const deleteResearchArticle = async (id: number) => {
  const [result] = await db
    .delete(schema.researchArticles)
    .where(eq(schema.researchArticles.id, id))
    .returning();
  return result;
};

export const getResearchArticles = async () => {
  return await db.query.researchArticles.findMany({
    orderBy: desc(schema.researchArticles.publishDate),
  });
};

export const getResearchArticleById = async (id: number) => {
  return await db.query.researchArticles.findFirst({
    where: eq(schema.researchArticles.id, id),
  });
};

export const getResearchArticleBySlug = async (slug: string) => {
  return await db.query.researchArticles.findFirst({
    where: eq(schema.researchArticles.slug, slug),
  });
};

export const getFeaturedResearchArticles = async (limit: number = 3) => {
  return await db.query.researchArticles.findMany({
    where: eq(schema.researchArticles.featured, true),
    limit,
    orderBy: desc(schema.researchArticles.publishDate),
  });
};

export const getResearchArticlesByCategory = async (category: string) => {
  return await db.query.researchArticles.findMany({
    where: eq(schema.researchArticles.category, category),
    orderBy: desc(schema.researchArticles.publishDate),
  });
};

// ========== CAR SHOW EVENTS STORAGE ==========

export const createCarShowEvent = async (data: z.infer<typeof schema.carShowEventsInsertSchema>) => {
  const [event] = await db.insert(schema.carShowEvents).values(data).returning();
  return event;
};

export const updateCarShowEvent = async (id: number, data: UpdateData<z.infer<typeof schema.carShowEventsInsertSchema>>) => {
  const [event] = await db.update(schema.carShowEvents).set(data).where(eq(schema.carShowEvents.id, id)).returning();
  return event;
};

export const deleteCarShowEvent = async (id: number) => {
  await db.delete(schema.carShowEvents).where(eq(schema.carShowEvents.id, id));
};

export const getCarShowEvents = async (filters?: {
  eventType?: string;
  state?: string;
  region?: string;
  category?: string;
  month?: string;
  featured?: boolean;
  status?: string;
  search?: string;
  limit?: number;
}) => {
  try {
    let query = db.select().from(schema.carShowEvents);
    const conditions: any[] = [];
    
    if (filters?.eventType && filters.eventType !== 'all' && filters.eventType !== 'all_types') {
      conditions.push(eq(schema.carShowEvents.eventType, filters.eventType));
    }
    
    if (filters?.state && filters.state !== 'all' && filters.state !== 'all_states') {
      conditions.push(eq(schema.carShowEvents.state, filters.state));
    }
    
    if (filters?.category && filters.category !== 'all' && filters.category !== 'all_categories') {
      conditions.push(eq(schema.carShowEvents.eventCategory, filters.category));
    }
    
    if (filters?.featured !== undefined) {
      conditions.push(eq(schema.carShowEvents.featured, filters.featured));
    }
    
    if (filters?.status && filters.status !== 'all') {
      conditions.push(eq(schema.carShowEvents.status, filters.status));
    }
    
    if (filters?.search && filters.search.trim()) {
      const searchTerm = `%${filters.search.toLowerCase()}%`;
      conditions.push(
        or(
          like(schema.carShowEvents.eventName, searchTerm),
          like(schema.carShowEvents.city, searchTerm),
          like(schema.carShowEvents.state, searchTerm),
          like(schema.carShowEvents.venue, searchTerm)
        )
      );
    }
    
    // Apply all conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    // Order by start date descending
    query = query.orderBy(desc(schema.carShowEvents.startDate));
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const events = await query;
    return events;
  } catch (error) {
    console.error('Error fetching car show events:', error);
    throw error;
  }
};

export const getCarShowEventById = async (id: number) => {
  const [event] = await db.select().from(schema.carShowEvents).where(eq(schema.carShowEvents.id, id)).limit(1);
  return event;
};

export const getCarShowEventBySlug = async (slug: string) => {
  const [event] = await db.select().from(schema.carShowEvents).where(eq(schema.carShowEvents.eventSlug, slug)).limit(1);
  return event;
};

export const getFeaturedCarShowEvents = async (limit: number = 5) => {
  const events = await db.select().from(schema.carShowEvents)
    .where(eq(schema.carShowEvents.featured, true))
    .orderBy(schema.carShowEvents.startDate)
    .limit(limit);
  return events;
};

export const getCarShowEventsByType = async (eventType: string) => {
  const events = await db.select().from(schema.carShowEvents)
    .where(eq(schema.carShowEvents.eventType, eventType))
    .orderBy(schema.carShowEvents.startDate);
  return events;
};

export const getCarShowEventsByState = async (state: string) => {
  const events = await db.select().from(schema.carShowEvents)
    .where(eq(schema.carShowEvents.state, state))
    .orderBy(schema.carShowEvents.startDate);
  return events;
};

// Gateway Classic Cars Inventory Functions
export const getGatewayVehicles = async (filters?: {
  make?: string;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  year?: number;
}) => {
  let query = db.select().from(schema.gatewayVehicles);
  
  if (filters?.make && filters.make !== 'all') {
    query = query.where(eq(schema.gatewayVehicles.make, filters.make));
  }
  if (filters?.category && filters.category !== 'all') {
    query = query.where(eq(schema.gatewayVehicles.category, filters.category));
  }
  if (filters?.priceMin) {
    query = query.where(gte(schema.gatewayVehicles.price, filters.priceMin.toString()));
  }
  if (filters?.priceMax) {
    query = query.where(lte(schema.gatewayVehicles.price, filters.priceMax.toString()));
  }
  if (filters?.year) {
    query = query.where(eq(schema.gatewayVehicles.year, filters.year));
  }
  
  const vehicles = await query.orderBy(schema.gatewayVehicles.year, schema.gatewayVehicles.make);
  return vehicles;
};

export const getGatewayVehicleById = async (id: number) => {
  const [vehicle] = await db.select().from(schema.gatewayVehicles).where(eq(schema.gatewayVehicles.id, id)).limit(1);
  return vehicle;
};

export const getFeaturedGatewayVehicles = async (limit: number = 6) => {
  const vehicles = await db.select().from(schema.gatewayVehicles)
    .where(eq(schema.gatewayVehicles.featured, true))
    .orderBy(schema.gatewayVehicles.year)
    .limit(limit);
  return vehicles;
};
