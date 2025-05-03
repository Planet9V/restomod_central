import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar, FileText, Book, MessageSquare, Clock, Share2, BookmarkPlus } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export interface ArticleData {
  id: number;
  slug: string;
  title: string;
  description: string;
  content: string;
  type: string;
  date: string;
  readTime: string;
  category: string;
  author: string;
  authorTitle: string;
  authorImage: string;
  imageUrl: string;
  relatedArticles?: ArticleData[];
}

const ArticleDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch article data based on slug
  useEffect(() => {
    // In a real implementation, this would be an API call
    // Here we're importing directly for simplicity
    import(`@/data/articles/${slug}.ts`)
      .then((module) => {
        setArticle(module.default);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading article:", error);
        setLoading(false);
      });
  }, [slug]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "article":
        return <FileText className="h-4 w-4 mr-1" />;
      case "guide":
        return <Book className="h-4 w-4 mr-1" />;
      case "webinar":
        return <MessageSquare className="h-4 w-4 mr-1" />;
      default:
        return <FileText className="h-4 w-4 mr-1" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 flex justify-center">
        <div className="w-8 h-8 border-t-2 border-burgundy rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-playfair">Article not found</h2>
        <p className="mt-2 mb-6 text-charcoal/70">The article you are looking for might have been removed or is temporarily unavailable.</p>
        <Link href="/resources">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Resources
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-20 bg-offwhite min-h-screen">
      {/* Hero Section */}
      <div className="relative h-96 bg-charcoal text-white">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/70 to-transparent"></div>
        </div>
        <div className="container mx-auto px-4 relative h-full flex flex-col justify-end pb-12">
          <Link href="/resources">
            <Button variant="outline" className="bg-transparent text-white border-white/30 hover:bg-white/10 mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Resources
            </Button>
          </Link>
          <div className="flex items-center text-white/70 text-sm mb-3">
            <span className="flex items-center mr-4">
              {getTypeIcon(article.type)}
              {article.type.charAt(0).toUpperCase() + article.type.slice(1)}
            </span>
            <span className="flex items-center mr-4">
              <Calendar className="h-4 w-4 mr-1" />
              {article.date}
            </span>
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {article.readTime}
            </span>
          </div>
          <h1 className="font-playfair text-4xl md:text-5xl font-bold max-w-4xl">{article.title}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-sm shadow-sm">
              <div className="prose prose-burgundy max-w-none">
                <p className="lead text-xl font-medium text-charcoal/90 mb-8">{article.description}</p>
                
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              </div>
              
              {/* Article Actions */}
              <div className="mt-12 border-t border-charcoal/10 pt-6 flex justify-between items-center">
                <div>
                  <span className="inline-block bg-charcoal/10 text-charcoal/80 px-3 py-1 text-sm rounded-full">
                    {article.category}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="rounded-full">
                    <Share2 className="h-4 w-4 mr-1" /> Share
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full">
                    <BookmarkPlus className="h-4 w-4 mr-1" /> Save
                  </Button>
                </div>
              </div>
            </div>

            {/* Author Bio */}
            <div className="bg-white p-8 rounded-sm shadow-sm mt-8">
              <div className="flex items-center">
                <img 
                  src={article.authorImage} 
                  alt={article.author} 
                  className="h-16 w-16 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="font-bold text-lg">{article.author}</h3>
                  <p className="text-charcoal/70">{article.authorTitle}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-sm shadow-sm">
              <h3 className="font-playfair text-xl font-bold mb-4">Related Articles</h3>
              <div className="space-y-6">
                {article.relatedArticles ? (
                  article.relatedArticles.map((related) => (
                    <div key={related.id} className="group">
                      <Link href={`/resources/${related.slug}`}>
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-20 h-20 overflow-hidden rounded-sm">
                            <img 
                              src={related.imageUrl} 
                              alt={related.title} 
                              className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                            />
                          </div>
                          <div>
                            <h4 className="font-medium text-charcoal group-hover:text-burgundy transition-colors">
                              {related.title}
                            </h4>
                            <p className="text-xs text-charcoal/60 mt-1">{related.date} • {related.readTime}</p>
                          </div>
                        </div>
                      </Link>
                      <Separator className="mt-4" />
                    </div>
                  ))
                ) : (
                  <p className="text-charcoal/70">No related articles available.</p>
                )}
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white p-6 rounded-sm shadow-sm mt-6">
              <h3 className="font-playfair text-xl font-bold mb-4">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {["Engineering", "History", "Investment", "Documentation", "Materials", "Philosophy"].map((category) => (
                  <Link key={category} href={`/resources?category=${category}`}>
                    <div className="cursor-pointer bg-charcoal/5 hover:bg-burgundy/10 text-charcoal/80 hover:text-burgundy px-3 py-1 rounded-full text-sm transition-colors">
                      {category}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;