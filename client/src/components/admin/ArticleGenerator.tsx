import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, BookIcon, RefreshCwIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export function ArticleGenerator() {
  const [isFetching, setIsFetching] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const generateArticleMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/research-articles/generate");
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to generate article");
      }
      return await res.json();
    },
    onMutate: () => {
      setIsFetching(true);
    },
    onSuccess: (data) => {
      toast({
        title: "Article Generated Successfully",
        description: `New article created: "${data.article.title}"`,
        variant: "default",
      });
      
      // Invalidate the research articles queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/research-articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/research-articles/featured"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Generate Article",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsFetching(false);
    },
  });
  
  const handleGenerateArticle = () => {
    generateArticleMutation.mutate();
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookIcon className="h-5 w-5" />
          AI Article Generator
        </CardTitle>
        <CardDescription>
          Automatically generate high-quality articles about classic cars and restomods using Perplexity AI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Click the button below to generate a new research article. The system will automatically select a relevant topic 
          and create comprehensive content. This process may take 15-30 seconds.
        </p>
        <div className="bg-muted/50 p-3 rounded-md text-xs text-foreground/80">
          <p className="font-semibold mb-2">Automated Article Generation Features:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Premium quality articles with historical context and technical details</li>
            <li>Automatic categorization with relevant tags</li>
            <li>Markdown formatting for rich content presentation</li>
            <li>Random selection from diverse automotive topics</li>
            <li>Scheduled daily article generation</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleGenerateArticle} 
          disabled={isFetching}
          className="w-full"
        >
          {isFetching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Article...
            </>
          ) : (
            <>
              <RefreshCwIcon className="mr-2 h-4 w-4" />
              Generate New Article
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}