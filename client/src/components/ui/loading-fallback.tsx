import { Loader2 } from "lucide-react";

export function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

export function PageLoadingFallback() {
  return (
    <div className="container mx-auto px-4 py-12 animate-pulse">
      {/* Header skeleton */}
      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-8"></div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
      <div className="p-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse flex items-center gap-4">
          <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        ></div>
      ))}
    </div>
  );
}
