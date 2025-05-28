import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Car, FileText, Calendar, DollarSign, Users, Settings, TrendingUp } from "lucide-react";

// Enhanced skeleton with shimmer effect
export const ShimmerSkeleton = ({ className = "", ...props }: { className?: string; [key: string]: any }) => (
  <div className={`relative overflow-hidden bg-gray-200 dark:bg-gray-800 rounded ${className}`} {...props}>
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
      animate={{ x: [-200, 200] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

// Project card loading state
export const ProjectCardSkeleton = () => (
  <Card className="overflow-hidden">
    <div className="relative">
      <ShimmerSkeleton className="h-[250px] w-full" />
      <div className="absolute top-4 right-4">
        <ShimmerSkeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
    <CardHeader>
      <ShimmerSkeleton className="h-6 w-3/4 mb-2" />
      <ShimmerSkeleton className="h-4 w-full mb-1" />
      <ShimmerSkeleton className="h-4 w-2/3" />
    </CardHeader>
    <CardContent>
      <div className="flex gap-2 mb-4">
        <ShimmerSkeleton className="h-5 w-16 rounded-full" />
        <ShimmerSkeleton className="h-5 w-20 rounded-full" />
      </div>
      <ShimmerSkeleton className="h-10 w-full rounded" />
    </CardContent>
  </Card>
);

// Car show event card loading state
export const EventCardSkeleton = () => (
  <Card className="overflow-hidden">
    <div className="relative">
      <ShimmerSkeleton className="h-[200px] w-full" />
      <div className="absolute top-4 left-4">
        <ShimmerSkeleton className="h-8 w-12 rounded" />
      </div>
    </div>
    <CardHeader>
      <ShimmerSkeleton className="h-5 w-2/3 mb-2" />
      <ShimmerSkeleton className="h-6 w-full mb-2" />
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-gray-400" />
        <ShimmerSkeleton className="h-4 w-24" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex items-center gap-2 mb-3">
        <Car className="h-4 w-4 text-gray-400" />
        <ShimmerSkeleton className="h-4 w-20" />
      </div>
      <ShimmerSkeleton className="h-4 w-full mb-2" />
      <ShimmerSkeleton className="h-4 w-3/4" />
    </CardContent>
  </Card>
);

// Research article card loading state
export const ArticleCardSkeleton = () => (
  <Card className="overflow-hidden">
    <ShimmerSkeleton className="h-[200px] w-full" />
    <CardHeader>
      <div className="flex items-center justify-between mb-2">
        <ShimmerSkeleton className="h-5 w-20 rounded-full" />
        <ShimmerSkeleton className="h-4 w-16" />
      </div>
      <ShimmerSkeleton className="h-6 w-full mb-2" />
      <ShimmerSkeleton className="h-4 w-full mb-1" />
      <ShimmerSkeleton className="h-4 w-2/3" />
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between mb-4">
        <ShimmerSkeleton className="h-4 w-20" />
        <ShimmerSkeleton className="h-4 w-24" />
      </div>
      <div className="flex gap-2 mb-4">
        <ShimmerSkeleton className="h-5 w-12 rounded-full" />
        <ShimmerSkeleton className="h-5 w-16 rounded-full" />
        <ShimmerSkeleton className="h-5 w-14 rounded-full" />
      </div>
      <ShimmerSkeleton className="h-10 w-full rounded" />
    </CardContent>
  </Card>
);

// Gateway vehicle card loading state
export const VehicleCardSkeleton = () => (
  <Card className="overflow-hidden">
    <ShimmerSkeleton className="h-[200px] w-full" />
    <CardHeader>
      <ShimmerSkeleton className="h-6 w-full mb-2" />
      <div className="flex items-center justify-between">
        <ShimmerSkeleton className="h-5 w-16" />
        <ShimmerSkeleton className="h-5 w-20" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-gray-400" />
          <ShimmerSkeleton className="h-6 w-20" />
        </div>
        <ShimmerSkeleton className="h-5 w-16 rounded-full" />
      </div>
      <ShimmerSkeleton className="h-10 w-full rounded" />
    </CardContent>
  </Card>
);

// Statistics card loading state
export const StatsCardSkeleton = ({ icon: Icon = TrendingUp }) => (
  <Card className="text-center">
    <CardContent className="pt-6">
      <Icon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
      <ShimmerSkeleton className="h-8 w-16 mx-auto mb-2" />
      <ShimmerSkeleton className="h-4 w-24 mx-auto" />
    </CardContent>
  </Card>
);

// Section loading state with animated dots
export const SectionLoadingState = ({ title, description, itemCount = 3 }: { title: string, description: string, itemCount?: number }) => (
  <motion.div
    className="text-center py-12"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <motion.div
      className="inline-flex items-center gap-2 mb-4"
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <Settings className="h-6 w-6 text-blue-600 animate-spin" />
      <h3 className="text-lg font-semibold">{title}</h3>
    </motion.div>
    
    <p className="text-muted-foreground mb-6">{description}</p>
    
    <div className="flex justify-center items-center gap-1">
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-blue-600 rounded-full"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  </motion.div>
);

// Grid loading state
export const GridLoadingState = ({ 
  CardComponent = ProjectCardSkeleton, 
  columns = 3, 
  rows = 2 
}) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-6`}>
    {Array.from({ length: columns * rows }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: i * 0.1 }}
      >
        <CardComponent />
      </motion.div>
    ))}
  </div>
);

// Loading overlay for full page
export const PageLoadingOverlay = ({ message = "Loading amazing content..." }) => (
  <motion.div
    className="fixed inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <div className="text-center">
      <motion.div
        className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.p
        className="text-lg font-medium text-gray-700 dark:text-gray-300"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {message}
      </motion.p>
    </div>
  </motion.div>
);

// Pulse loading for inline elements
export const InlineLoading = ({ width = "w-20", height = "h-4" }) => (
  <motion.div
    className={`${width} ${height} bg-gray-200 dark:bg-gray-700 rounded`}
    animate={{ opacity: [0.5, 1, 0.5] }}
    transition={{ duration: 1.5, repeat: Infinity }}
  />
);

// Content loading placeholder
export const ContentPlaceholder = ({ lines = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: lines }).map((_, i) => (
      <ShimmerSkeleton
        key={i}
        className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
      />
    ))}
  </div>
);