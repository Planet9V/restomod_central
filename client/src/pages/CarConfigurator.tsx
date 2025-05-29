import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import VideoHeader from "@/components/layout/VideoHeader";
import EnhancedStepByStep from "@/components/configurator/EnhancedStepByStep";

const CarConfigurator = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <VideoHeader
        videoSrc="https://static.replit.com/videos/automotive-hero-bg.mp4"
        title="Car Configurator"
        subtitle="Build Your Dream Restomod with Investment-Grade Components"
        className="h-[40vh]"
        overlay="dark"
      />

      {/* Enhanced Step-by-Step Configurator */}
      <div className="relative -mt-20 z-10">
        <EnhancedStepByStep />
      </div>

      {/* Back to Projects Link */}
      <div className="container mx-auto px-6 py-8">
        <Link href="/custom-builds">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Custom Builds
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CarConfigurator;