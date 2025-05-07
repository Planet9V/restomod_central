import { Request, Response } from "express";
import { db } from "@db";
import { researchArticles } from "@shared/schema";
import { eq, desc, sql, and, like, or } from "drizzle-orm";
import { generateNewArticle, ARTICLE_CATEGORIES } from "../services/articleGenerator";
import slugify from "slugify";

// Get all research articles with optional filters
export async function getResearchArticles(req: Request, res: Response) {
  try {
    const { category, tag, search, page = 1, limit = 10 } = req.query;
    
    let query = db.select().from(researchArticles);
    
    // Apply category filter if provided
    if (category && typeof category === 'string') {
      query = query.where(eq(researchArticles.category, category));
    }
    
    // Apply tag filter if provided
    if (tag && typeof tag === 'string') {
      // We need to search for this tag in the tags JSONB array
      query = query.where(
        sql`${researchArticles.tags} @> ${JSON.stringify([tag])}`
      );
    }
    
    // Apply search filter if provided
    if (search && typeof search === 'string') {
      query = query.where(
        or(
          like(researchArticles.title, `%${search}%`),
          like(researchArticles.excerpt, `%${search}%`),
          like(researchArticles.content, `%${search}%`)
        )
      );
    }
    
    // Calculate pagination
    const offset = (Number(page) - 1) * Number(limit);
    
    // Get the total count for pagination
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(researchArticles)
      .execute();
    
    const total = countResult[0]?.count || 0;
    
    // Apply ordering and pagination
    const articles = await query
      .orderBy(desc(researchArticles.publishDate))
      .limit(Number(limit))
      .offset(offset);
    
    return res.status(200).json({
      articles,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching research articles:", error);
    return res.status(500).json({ error: "Failed to fetch research articles" });
  }
}

// Get a specific research article by slug
export async function getResearchArticleBySlug(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    
    const article = await db
      .select()
      .from(researchArticles)
      .where(eq(researchArticles.slug, slug))
      .limit(1);
    
    if (!article.length) {
      return res.status(404).json({ error: "Article not found" });
    }
    
    return res.status(200).json(article[0]);
  } catch (error) {
    console.error("Error fetching research article:", error);
    return res.status(500).json({ error: "Failed to fetch research article" });
  }
}

// Get featured articles
export async function getFeaturedArticles(req: Request, res: Response) {
  try {
    const { limit = 3 } = req.query;
    
    const articles = await db
      .select()
      .from(researchArticles)
      .where(eq(researchArticles.featured, true))
      .orderBy(desc(researchArticles.publishDate))
      .limit(Number(limit));
    
    return res.status(200).json(articles);
  } catch (error) {
    console.error("Error fetching featured articles:", error);
    return res.status(500).json({ error: "Failed to fetch featured articles" });
  }
}

// Get articles by category
export async function getArticlesByCategory(req: Request, res: Response) {
  try {
    const { category } = req.params;
    const { limit = 10 } = req.query;
    
    if (!ARTICLE_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }
    
    const articles = await db
      .select()
      .from(researchArticles)
      .where(eq(researchArticles.category, category))
      .orderBy(desc(researchArticles.publishDate))
      .limit(Number(limit));
    
    return res.status(200).json(articles);
  } catch (error) {
    console.error("Error fetching articles by category:", error);
    return res.status(500).json({ error: "Failed to fetch articles by category" });
  }
}

// Get articles by tag
export async function getArticlesByTag(req: Request, res: Response) {
  try {
    const { tag } = req.params;
    const { limit = 10 } = req.query;
    
    const articles = await db
      .select()
      .from(researchArticles)
      .where(sql`${researchArticles.tags} @> ${JSON.stringify([tag])}`)
      .orderBy(desc(researchArticles.publishDate))
      .limit(Number(limit));
    
    return res.status(200).json(articles);
  } catch (error) {
    console.error("Error fetching articles by tag:", error);
    return res.status(500).json({ error: "Failed to fetch articles by tag" });
  }
}

// Get article categories
export async function getArticleCategories(req: Request, res: Response) {
  try {
    // Count articles in each category
    const categoryCounts = await Promise.all(
      ARTICLE_CATEGORIES.map(async (category) => {
        const count = await db
          .select({ count: sql<number>`count(*)` })
          .from(researchArticles)
          .where(eq(researchArticles.category, category));
        
        return {
          category,
          count: count[0]?.count || 0
        };
      })
    );
    
    return res.status(200).json(categoryCounts);
  } catch (error) {
    console.error("Error fetching article categories:", error);
    return res.status(500).json({ error: "Failed to fetch article categories" });
  }
}

// Get popular article tags
export async function getPopularTags(req: Request, res: Response) {
  try {
    const { limit = 15 } = req.query;
    
    // Get all articles
    const allArticles = await db
      .select({ tags: researchArticles.tags })
      .from(researchArticles);
    
    // Count occurrences of each tag
    const tagCounts: Record<string, number> = {};
    
    allArticles.forEach(article => {
      (article.tags as string[]).forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    // Convert to array and sort by count
    const sortedTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, Number(limit));
    
    return res.status(200).json(sortedTags);
  } catch (error) {
    console.error("Error fetching popular tags:", error);
    return res.status(500).json({ error: "Failed to fetch popular tags" });
  }
}

// Generate a new article (admin only)
export async function generateArticle(req: Request, res: Response) {
  try {
    // This should be an admin-only endpoint in a real application
    // Verify admin status here...
    
    const article = await generateNewArticle();
    
    if (!article) {
      return res.status(400).json({ error: "Failed to generate a new article. All topics may have been used." });
    }
    
    return res.status(201).json({
      message: "Article generated successfully",
      article
    });
  } catch (error) {
    console.error("Error generating article:", error);
    return res.status(500).json({ error: "Failed to generate article" });
  }
}