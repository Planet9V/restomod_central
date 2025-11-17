import { Route, Switch, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState, lazy, Suspense } from "react";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingFallback } from "@/components/ui/loading-fallback";

// Eagerly load critical pages (for first visit performance)
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";

// Lazy load all other pages for better performance
const ProjectDetail = lazy(() => import("@/pages/ProjectDetail"));
const ProjectsPage = lazy(() => import("@/pages/ProjectsPage"));
const Resources = lazy(() => import("@/pages/Resources"));
const ResearchArticles = lazy(() => import("@/pages/ResearchArticles"));
const ArticleDetail = lazy(() => import("@/pages/ArticleDetail"));
const VehicleArchive = lazy(() => import("@/pages/VehicleArchive"));
const CarConfigurator = lazy(() => import("@/pages/CarConfigurator"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const LuxuryShowcasePage = lazy(() => import("@/pages/LuxuryShowcasePage"));
const LuxuryShowcasesPage = lazy(() => import("@/pages/LuxuryShowcasesPage"));
const MustangRestomods = lazy(() => import("@/pages/MustangRestomods"));
const MarketAnalysis = lazy(() => import("@/pages/MarketAnalysis"));
const ModelValues = lazy(() => import("@/pages/ModelValues"));
const CustomBuilds = lazy(() => import("@/pages/CustomBuilds"));
const CarShowGuide = lazy(() => import("@/pages/CarShowGuide"));
const CarShowEvents = lazy(() => import("@/pages/CarShowEvents"));
const EventDetailsPage = lazy(() => import("@/pages/EventDetailsPage"));
const GatewayVehicles = lazy(() => import("@/pages/GatewayVehicles"));
const CarsForSale = lazy(() => import("@/pages/CarsForSale"));
const VehicleDetailPage = lazy(() => import("@/pages/VehicleDetailPage"));
const MakeHubPage = lazy(() => import("@/pages/MakeHubPage"));

// Layout components (eagerly loaded)
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/ui/page-transition";
import { OptimizedNavigation } from "@/components/ui/optimized-navigation";

function Router() {
  // Get current location for route-based transitions
  const [location] = useLocation();
  const [prevLocation, setPrevLocation] = useState("");
  const [transitionKey, setTransitionKey] = useState(0);

  // Track route changes to trigger transitions
  useEffect(() => {
    if (location !== prevLocation) {
      setPrevLocation(location);
      setTransitionKey(prev => prev + 1);

      // Scroll to top on page change for better UX
      window.scrollTo(0, 0);
    }
  }, [location, prevLocation]);

  return (
    <Suspense fallback={<LoadingFallback />}>
      <PageTransition key={transitionKey}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/projects" component={ProjectsPage} />
          <Route path="/projects/:id" component={ProjectDetail} />
          <Route path="/resources" component={Resources} />
          <Route path="/research-articles" component={ResearchArticles} />
          <Route path="/resources/:slug" component={ArticleDetail} />
          <Route path="/vehicle-archive" component={VehicleArchive} />
          <Route path="/car-configurator" component={CarConfigurator} />
          <Route path="/showcases" component={LuxuryShowcasesPage} />
          <Route path="/showcases/:slug" component={LuxuryShowcasePage} />
          <Route path="/guides/mustang-restomods" component={MustangRestomods} />
          <Route path="/mustang-restomods" component={MustangRestomods} />
          <Route path="/market-analysis" component={MarketAnalysis} />
          <Route path="/model-values" component={ModelValues} />
          <Route path="/custom-builds" component={CustomBuilds} />
          <Route path="/car-show-guide" component={CarShowGuide} />
          <Route path="/car-show-events" component={CarShowEvents} />
          <Route path="/car-show-events/:slug" component={EventDetailsPage} />
          <Route path="/events" component={CarShowEvents} />
          <Route path="/events/:slug" component={EventDetailsPage} />
          <Route path="/cars-for-sale" component={CarsForSale} />
          <Route path="/vehicles/:id" component={VehicleDetailPage} />
          <Route path="/gateway-vehicles" component={GatewayVehicles} />

          {/* Phase 5: Make/Model Hub Pages */}
          <Route path="/mustang" component={MakeHubPage} />
          <Route path="/corvette" component={MakeHubPage} />
          <Route path="/camaro" component={MakeHubPage} />
          <Route path="/ford" component={MakeHubPage} />
          <Route path="/chevrolet" component={MakeHubPage} />

          <Route path="/auth" component={AuthPage} />
          <Route path="/admin" component={() => <ProtectedRoute component={AdminDashboard} adminOnly />} />
          <Route component={NotFound} />
        </Switch>
      </PageTransition>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <div className="relative">
            <div className="grain-overlay"></div>
            <Header />
            <main>
              <Router />
            </main>
            <Footer />
          </div>
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
