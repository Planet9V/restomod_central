import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { motion } from "framer-motion";

export function EventCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="pb-2">
          {/* Event Name Skeleton */}
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded animate-pulse bg-[length:200%_100%] bg-animation"></div>
          
          {/* Venue and Location Skeleton */}
          <div className="flex items-center gap-2 mt-2">
            <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded animate-pulse bg-[length:200%_100%] bg-animation w-3/4"></div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Date Skeleton */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded animate-pulse bg-[length:200%_100%] bg-animation w-1/2"></div>
          </div>

          {/* Event Type Badge Skeleton */}
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 dark:from-blue-800 dark:via-blue-700 dark:to-blue-800 rounded-full animate-pulse bg-[length:200%_100%] bg-animation"></div>
            <div className="h-6 w-16 bg-gradient-to-r from-green-200 via-green-300 to-green-200 dark:from-green-800 dark:via-green-700 dark:to-green-800 rounded-full animate-pulse bg-[length:200%_100%] bg-animation"></div>
          </div>

          {/* Description Skeleton */}
          <div className="space-y-2">
            <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded animate-pulse bg-[length:200%_100%] bg-animation w-full"></div>
            <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded animate-pulse bg-[length:200%_100%] bg-animation w-5/6"></div>
            <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded animate-pulse bg-[length:200%_100%] bg-animation w-2/3"></div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="flex gap-2 pt-2">
            <div className="h-8 w-24 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 dark:from-blue-800 dark:via-blue-700 dark:to-blue-800 rounded animate-pulse bg-[length:200%_100%] bg-animation"></div>
            <div className="h-8 w-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded animate-pulse bg-[length:200%_100%] bg-animation"></div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function EventCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.4, 
            delay: index * 0.1,
            ease: "easeOut"
          }}
        >
          <EventCardSkeleton />
        </motion.div>
      ))}
    </div>
  );
}