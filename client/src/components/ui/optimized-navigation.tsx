/**
 * OPTIMIZED NAVIGATION COMPONENT
 * Priority 2: Simplified menu structure with persistent search
 */

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Menu, X, Car, Wrench, Calendar, TrendingUp, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function OptimizedNavigation() {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const primaryNavItems = [
    { name: "Cars for Sale", href: "/cars-for-sale", icon: Car, description: "517+ Investment-Grade Vehicles" },
    { name: "Custom Builds", href: "/custom-builds", icon: Wrench, description: "Restomods & Projects" },
    { name: "Car Shows", href: "/car-shows", icon: Calendar, description: "200+ Events Nationwide" },
    { name: "Market Insights", href: "/market-insights", icon: TrendingUp, description: "Investment Analysis" }
  ];

  const secondaryNavItems = [
    { name: "About", href: "/about" },
    { name: "Process", href: "/process" },
    { name: "Testimonials", href: "/testimonials" },
    { name: "Contact", href: "/contact" }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/cars-for-sale?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold text-gray-900 dark:text-white">Skinny's Rod & Custom</span>
              <p className="text-xs text-gray-500 dark:text-gray-400">Investment-Grade Restomods</p>
            </div>
          </Link>

          {/* Persistent Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="w-full relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search 517+ vehicles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg"
              />
            </form>
          </div>

          {/* Primary Navigation - Desktop */}
          <div className="hidden lg:flex items-center space-x-1">
            {primaryNavItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location === item.href
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors">
                  {item.description}
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="px-4 py-4 space-y-4">
            
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search 517+ vehicles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 w-full bg-gray-50 dark:bg-gray-800"
              />
            </form>

            {/* Mobile Primary Navigation */}
            <div className="space-y-2">
              {primaryNavItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-4 py-3 rounded-lg transition-colors ${
                    location === item.href
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5" />
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{item.description}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Mobile Secondary Navigation */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <div className="grid grid-cols-2 gap-2">
                {secondaryNavItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Access Categories Bar */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-6 py-2 overflow-x-auto">
            <Link
              href="/cars-for-sale?category=Muscle Cars"
              className="whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Muscle Cars <span className="text-xs text-gray-400">(101)</span>
            </Link>
            <Link
              href="/cars-for-sale?category=Sports Cars"
              className="whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Sports Cars <span className="text-xs text-gray-400">(111)</span>
            </Link>
            <Link
              href="/cars-for-sale?investmentGrade=A%2B"
              className="whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Investment A+ <span className="text-xs text-gray-400">(122)</span>
            </Link>
            <Link
              href="/cars-for-sale?region=west"
              className="whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              West Coast <span className="text-xs text-gray-400">(118)</span>
            </Link>
            <Link
              href="/cars-for-sale?priceMax=100000"
              className="whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Under $100k <span className="text-xs text-gray-400">(245)</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}