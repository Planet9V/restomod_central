import { Route, Switch, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from "react";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Pages
import Home from "@/pages/Home";
import ProjectDetail from "@/pages/ProjectDetail";
import ProjectsPage from "@/pages/ProjectsPage";
import Resources from "@/pages/Resources";
import ResearchArticles from "@/pages/ResearchArticles";
import ArticleDetail from "@/pages/ArticleDetail";
import VehicleArchive from "@/pages/VehicleArchive";
import CarConfigurator from "@/pages/CarConfigurator";
import AuthPage from "@/pages/AuthPage";
import AdminDashboard from "@/pages/AdminDashboard";
import LuxuryShowcasePage from "@/pages/LuxuryShowcasePage";
import LuxuryShowcasesPage from "@/pages/LuxuryShowcasesPage";
import MustangRestomods from "@/pages/MustangRestomods";
import MarketAnalysis from "@/pages/MarketAnalysis";
import ModelValues from "@/pages/ModelValues";
import CustomBuilds from "@/pages/CustomBuilds";
import CarShowGuide from "@/pages/CarShowGuide";
import CarShowEvents from "@/pages/CarShowEvents";
import EventDetailsPage from "@/pages/EventDetailsPage";
import GatewayVehicles from "@/pages/GatewayVehicles";
import CarsForSale from "@/pages/CarsForSale";
import VehicleDetailPage from "@/pages/VehicleDetailPage";
import MakeHubPage from "@/pages/MakeHubPage";
import NotFound from "@/pages/not-found";

// Layout components
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
  );
}

function App() {
  return (
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
  );
}

export default App;
