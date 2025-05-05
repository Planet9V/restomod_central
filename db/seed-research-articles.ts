import { db } from './index';
import { researchArticles } from '../shared/schema';
import article1 from '../client/src/data/articles/understanding-restomod-value';
import article2 from '../client/src/data/articles/mechanical-authenticity';
import article3 from '../client/src/data/articles/collectors-guide-documentation';
import article4 from '../client/src/data/articles/evolution-of-resto-modding';
import article5 from '../client/src/data/articles/materials-science-in-restoration';
import article6 from '../client/src/data/articles/concours-vs-restomod';

const convertArticleToDbFormat = (article: any) => {
  // Parse date strings carefully
  let publishDate;
  try {
    // Extract just the date portion for consistent parsing
    const dateStr = article.date.split(' ')[0] + ', ' + article.date.split(' ')[1] + ' ' + article.date.split(' ')[2];
    publishDate = new Date(dateStr);
    // Fallback if parsing fails
    if (isNaN(publishDate.getTime())) {
      publishDate = new Date();
    }
  } catch (e) {
    publishDate = new Date();
  }
  
  // Convert the article data to match the database schema
  return {
    title: article.title,
    slug: article.slug,
    author: article.author || 'Skinny\'s Rod and Custom',
    content: article.content,
    excerpt: article.description,
    category: article.category.toLowerCase().replace(/\s+/g, '-'),
    tags: [], // We don't have tags in the original articles, but the schema requires it
    featured_image: article.imageUrl,
    featured: false, // Default to not featured
    publish_date: publishDate,
    updated_at: new Date()
  };
};

const importResearchArticles = async () => {
  try {
    console.log('Starting to import research articles...');
    
    // Check if articles already exist to avoid duplicates
    const existingArticles = await db.select().from(researchArticles);
    if (existingArticles.length > 0) {
      console.log(`Found ${existingArticles.length} existing articles. Checking for new articles to import...`);
    }
    
    // Map of slugs to check for existing articles
    const existingSlugs = new Set(existingArticles.map(article => article.slug));
    
    // Convert all articles to DB format
    const articleData = [
      convertArticleToDbFormat(article1),
      convertArticleToDbFormat(article2),
      convertArticleToDbFormat(article3),
      convertArticleToDbFormat(article4),
      convertArticleToDbFormat(article5),
      convertArticleToDbFormat(article6)
    ];
    
    // Filter out articles that already exist
    const newArticles = articleData.filter(article => !existingSlugs.has(article.slug));
    
    if (newArticles.length === 0) {
      console.log('All articles already exist in the database. No import needed.');
      return;
    }
    
    // Import new articles
    for (const article of newArticles) {
      await db.insert(researchArticles).values(article);
      console.log(`Imported article: ${article.title}`);
    }
    
    console.log(`Successfully imported ${newArticles.length} new research articles.`);
  } catch (error) {
    console.error('Error importing research articles:', error);
  }
};

// Run the import function
importResearchArticles().then(() => {
  console.log('Research articles import process completed.');
  process.exit(0);
}).catch(err => {
  console.error('Failed to import research articles:', err);
  process.exit(1);
});
