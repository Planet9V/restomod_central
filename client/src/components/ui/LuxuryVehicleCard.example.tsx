/**
 * Luxury Vehicle Card - Example Component
 *
 * This is a complete example showing how to use all the Rolls-Royce
 * luxury components together to create a premium vehicle card.
 *
 * Feel free to copy and adapt this for your needs.
 */

import { motion } from 'framer-motion';
import { Heart, Eye, ArrowRight, MapPin, Calendar, TrendingUp } from 'lucide-react';
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardContent,
  GlassCardFooter,
} from './GlassCard';
import { LuxuryButton, LuxuryIconButton } from './LuxuryButton';
import { ChromePrice, ChromeText } from './ChromeText';
import {
  FeaturedBadge,
  InvestmentGradeBadge,
  TrendingBadge,
  BadgeGroup,
} from './PremiumBadge';

// ============================================================================
// TYPES
// ============================================================================

interface VehicleCardProps {
  vehicle: {
    id: string;
    title: string;
    year: number;
    make: string;
    model: string;
    price: number;
    imageUrl: string;
    location: string;
    mileage: string;
    investmentGrade?: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C';
    isFeatured?: boolean;
    isTrending?: boolean;
    isNew?: boolean;
    expectedReturn?: string;
  };
  onFavorite?: (id: string) => void;
  onView?: (id: string) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function LuxuryVehicleCard({ vehicle, onFavorite, onView }: VehicleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="h-full"
    >
      <GlassCard
        variant="purple"
        blur="md"
        padding="none"
        glowOnHover
        hoverable
        className="h-full flex flex-col"
      >
        {/* Image Section */}
        <div className="relative aspect-[16/9] overflow-hidden">
          {/* Vehicle Image */}
          <img
            src={vehicle.imageUrl}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover filter grayscale-[10%] hover:grayscale-0 transition-all duration-500"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Badges - Top Right */}
          <div className="absolute top-4 right-4">
            <BadgeGroup className="flex-col items-end">
              {vehicle.isFeatured && <FeaturedBadge glow />}
              {vehicle.investmentGrade && (
                <InvestmentGradeBadge grade={vehicle.investmentGrade} />
              )}
              {vehicle.isTrending && <TrendingBadge pulse />}
            </BadgeGroup>
          </div>

          {/* Action Buttons - Top Left */}
          <div className="absolute top-4 left-4 flex gap-2">
            <LuxuryIconButton
              variant="ghost"
              size="sm"
              icon={<Heart className="w-4 h-4" />}
              aria-label="Add to favorites"
              onClick={() => onFavorite?.(vehicle.id)}
            />
            <LuxuryIconButton
              variant="ghost"
              size="sm"
              icon={<Eye className="w-4 h-4" />}
              aria-label="Quick view"
              onClick={() => onView?.(vehicle.id)}
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col p-6">
          <GlassCardHeader>
            {/* Title */}
            <GlassCardTitle className="font-heading text-2xl mb-2">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </GlassCardTitle>

            {/* Price */}
            <ChromePrice amount={vehicle.price} size="3xl" className="mb-2" />

            {/* Expected Return (if investment grade) */}
            {vehicle.expectedReturn && (
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">
                  {vehicle.expectedReturn} expected return
                </span>
              </div>
            )}
          </GlassCardHeader>

          <GlassCardContent className="flex-1">
            {/* Vehicle Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Mileage */}
              <div className="glass-light rounded-lg p-3">
                <span className="text-xs text-gray-400 block mb-1">Mileage</span>
                <ChromeText variant="chrome" size="base" weight="semibold">
                  {vehicle.mileage}
                </ChromeText>
              </div>

              {/* Location */}
              <div className="glass-light rounded-lg p-3">
                <span className="text-xs text-gray-400 block mb-1">Location</span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <span className="text-sm font-semibold text-white">
                    {vehicle.location}
                  </span>
                </div>
              </div>
            </div>

            {/* Features/Highlights (optional) */}
            <div className="text-sm text-gray-300">
              <p className="line-clamp-2">
                Meticulously restored with premium components. Complete documentation
                and investment-grade certification included.
              </p>
            </div>
          </GlassCardContent>

          {/* Footer Section */}
          <GlassCardFooter className="mt-auto">
            <LuxuryButton
              variant="gold"
              size="lg"
              fullWidth
              rightIcon={<ArrowRight className="w-5 h-5" />}
              shimmer
            >
              View Details
            </LuxuryButton>
          </GlassCardFooter>
        </div>

        {/* Subtle grain texture overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.015] rounded-luxury"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
          }}
        />
      </GlassCard>
    </motion.div>
  );
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/*

import { LuxuryVehicleCard } from '@/components/ui/LuxuryVehicleCard.example';

const sampleVehicle = {
  id: '1',
  title: '1967 Shelby GT500',
  year: 1967,
  make: 'Shelby',
  model: 'GT500',
  price: 385000,
  imageUrl: '/images/vehicles/shelby-gt500.jpg',
  location: 'Los Angeles, CA',
  mileage: '12,450 mi',
  investmentGrade: 'A+' as const,
  isFeatured: true,
  isTrending: true,
  expectedReturn: '+15-20% YoY',
};

export function VehiclesPage() {
  const handleFavorite = (id: string) => {
    console.log('Favorited:', id);
  };

  const handleView = (id: string) => {
    console.log('Viewing:', id);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-8">
      <LuxuryVehicleCard
        vehicle={sampleVehicle}
        onFavorite={handleFavorite}
        onView={handleView}
      />
    </div>
  );
}

*/

// ============================================================================
// VARIANT: Compact Card
// ============================================================================

export function LuxuryVehicleCardCompact({ vehicle, onFavorite }: VehicleCardProps) {
  return (
    <GlassCard variant="light" blur="sm" padding="none" hoverable className="flex gap-4">
      {/* Thumbnail */}
      <div className="relative w-32 h-32 flex-shrink-0">
        <img
          src={vehicle.imageUrl}
          alt={vehicle.title}
          className="w-full h-full object-cover rounded-l-luxury"
        />
        {vehicle.isFeatured && (
          <div className="absolute top-2 left-2">
            <FeaturedBadge size="sm" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 py-4 pr-4">
        <h4 className="font-heading text-lg font-semibold text-white mb-1">
          {vehicle.title}
        </h4>
        <ChromePrice amount={vehicle.price} size="lg" className="mb-2" />
        <p className="text-sm text-gray-400">{vehicle.location}</p>
      </div>

      {/* Favorite button */}
      <div className="p-4">
        <LuxuryIconButton
          variant="ghost"
          size="sm"
          icon={<Heart className="w-4 h-4" />}
          aria-label="Add to favorites"
          onClick={() => onFavorite?.(vehicle.id)}
        />
      </div>
    </GlassCard>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default LuxuryVehicleCard;
