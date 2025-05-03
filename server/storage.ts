import { db } from "@db";
import * as schema from "@shared/schema";
import { eq, like, desc, asc } from "drizzle-orm";
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
