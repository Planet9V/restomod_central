/**
 * PremiumBadge Component
 *
 * Luxury badges for Rolls-Royce themed UI
 * Features: Featured, Verified, Investment Grade, Limited Edition, etc.
 */

import { forwardRef, HTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import {
  Crown,
  Star,
  Award,
  BadgeCheck,
  Sparkles,
  TrendingUp,
  Flame,
  Shield,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { rollsRoyceTheme } from '@/styles/rolls-royce-theme';

// ============================================================================
// TYPES
// ============================================================================

type BadgeVariant =
  | 'featured'
  | 'verified'
  | 'investment'
  | 'limited'
  | 'trending'
  | 'hot'
  | 'exclusive'
  | 'premium'
  | 'new';

type BadgeSize = 'sm' | 'base' | 'lg';

interface PremiumBadgeProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  /** Badge variant */
  variant?: BadgeVariant;
  /** Badge size */
  size?: BadgeSize;
  /** Custom label (overrides default) */
  label?: string;
  /** Custom icon */
  icon?: LucideIcon;
  /** Show icon */
  showIcon?: boolean;
  /** Glow effect */
  glow?: boolean;
  /** Pulse animation */
  pulse?: boolean;
  /** Children */
  children?: React.ReactNode;
  /** Custom className */
  className?: string;
}

// ============================================================================
// BADGE CONFIGURATIONS
// ============================================================================

const badgeConfig: Record<
  BadgeVariant,
  {
    label: string;
    icon: LucideIcon;
    gradient: string;
    textColor: string;
    glowColor: string;
  }
> = {
  featured: {
    label: 'Featured',
    icon: Crown,
    gradient: rollsRoyceTheme.gradients.gold,
    textColor: 'text-black',
    glowColor: '0 0 20px rgba(212, 175, 55, 0.6)',
  },
  verified: {
    label: 'Verified',
    icon: BadgeCheck,
    gradient: rollsRoyceTheme.gradients.chrome,
    textColor: 'text-black',
    glowColor: '0 0 20px rgba(255, 255, 255, 0.4)',
  },
  investment: {
    label: 'Investment Grade',
    icon: TrendingUp,
    gradient: rollsRoyceTheme.gradients.purple,
    textColor: 'text-white',
    glowColor: '0 0 20px rgba(107, 44, 145, 0.6)',
  },
  limited: {
    label: 'Limited Edition',
    icon: Star,
    gradient: rollsRoyceTheme.gradients.purpleToGold,
    textColor: 'text-white',
    glowColor: '0 0 20px rgba(107, 44, 145, 0.5)',
  },
  trending: {
    label: 'Trending',
    icon: Zap,
    gradient: 'linear-gradient(135deg, #FF006E 0%, #FF6B35 100%)',
    textColor: 'text-white',
    glowColor: '0 0 20px rgba(255, 0, 110, 0.6)',
  },
  hot: {
    label: 'Hot Deal',
    icon: Flame,
    gradient: 'linear-gradient(135deg, #DC2626 0%, #F87171 100%)',
    textColor: 'text-white',
    glowColor: '0 0 20px rgba(220, 38, 38, 0.6)',
  },
  exclusive: {
    label: 'Exclusive',
    icon: Shield,
    gradient: rollsRoyceTheme.gradients.purple,
    textColor: 'text-white',
    glowColor: '0 0 20px rgba(107, 44, 145, 0.6)',
  },
  premium: {
    label: 'Premium',
    icon: Sparkles,
    gradient: rollsRoyceTheme.gradients.goldShine,
    textColor: 'text-black',
    glowColor: '0 0 20px rgba(212, 175, 55, 0.6)',
  },
  new: {
    label: 'New Arrival',
    icon: Star,
    gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
    textColor: 'text-white',
    glowColor: '0 0 20px rgba(16, 185, 129, 0.6)',
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export const PremiumBadge = forwardRef<HTMLDivElement, PremiumBadgeProps>(
  (
    {
      variant = 'featured',
      size = 'base',
      label,
      icon,
      showIcon = true,
      glow = true,
      pulse = false,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const config = badgeConfig[variant];
    const Icon = icon || config.icon;
    const badgeLabel = label || children || config.label;

    // Size classes
    const sizeClasses = {
      sm: 'px-2 py-1 text-xs',
      base: 'px-3 py-1.5 text-sm',
      lg: 'px-4 py-2 text-base',
    };

    const iconSizes = {
      sm: 'h-3 w-3',
      base: 'h-4 w-4',
      lg: 'h-5 w-5',
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center gap-1.5 rounded-full font-semibold',
          // Size
          sizeClasses[size],
          // Text color
          config.textColor,
          // Custom className
          className
        )}
        style={{
          background: config.gradient,
          boxShadow: glow ? config.glowColor : undefined,
        }}
        // Entrance animation
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: rollsRoyceTheme.animations.easing.luxury }}
        // Pulse animation
        whileHover={pulse ? { scale: 1.05 } : undefined}
        {...props}
      >
        {/* Icon */}
        {showIcon && Icon && (
          <motion.div
            animate={
              pulse
                ? {
                    scale: [1, 1.2, 1],
                  }
                : undefined
            }
            transition={
              pulse
                ? {
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }
                : undefined
            }
          >
            <Icon className={iconSizes[size]} />
          </motion.div>
        )}

        {/* Label */}
        <span className="font-medium">{badgeLabel}</span>

        {/* Subtle grain texture */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full opacity-[0.015]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
          }}
        />
      </motion.div>
    );
  }
);

PremiumBadge.displayName = 'PremiumBadge';

// ============================================================================
// CONVENIENCE COMPONENTS
// ============================================================================

export const FeaturedBadge = forwardRef<HTMLDivElement, Omit<PremiumBadgeProps, 'variant'>>(
  (props, ref) => <PremiumBadge ref={ref} variant="featured" {...props} />
);

FeaturedBadge.displayName = 'FeaturedBadge';

export const VerifiedBadge = forwardRef<HTMLDivElement, Omit<PremiumBadgeProps, 'variant'>>(
  (props, ref) => <PremiumBadge ref={ref} variant="verified" {...props} />
);

VerifiedBadge.displayName = 'VerifiedBadge';

export const InvestmentBadge = forwardRef<HTMLDivElement, Omit<PremiumBadgeProps, 'variant'>>(
  (props, ref) => <PremiumBadge ref={ref} variant="investment" {...props} />
);

InvestmentBadge.displayName = 'InvestmentBadge';

export const LimitedBadge = forwardRef<HTMLDivElement, Omit<PremiumBadgeProps, 'variant'>>(
  (props, ref) => <PremiumBadge ref={ref} variant="limited" {...props} />
);

LimitedBadge.displayName = 'LimitedBadge';

export const TrendingBadge = forwardRef<HTMLDivElement, Omit<PremiumBadgeProps, 'variant'>>(
  (props, ref) => <PremiumBadge ref={ref} variant="trending" pulse {...props} />
);

TrendingBadge.displayName = 'TrendingBadge';

export const HotDealBadge = forwardRef<HTMLDivElement, Omit<PremiumBadgeProps, 'variant'>>(
  (props, ref) => <PremiumBadge ref={ref} variant="hot" pulse {...props} />
);

HotDealBadge.displayName = 'HotDealBadge';

export const ExclusiveBadge = forwardRef<HTMLDivElement, Omit<PremiumBadgeProps, 'variant'>>(
  (props, ref) => <PremiumBadge ref={ref} variant="exclusive" {...props} />
);

ExclusiveBadge.displayName = 'ExclusiveBadge';

export const PremiumOnlyBadge = forwardRef<HTMLDivElement, Omit<PremiumBadgeProps, 'variant'>>(
  (props, ref) => <PremiumBadge ref={ref} variant="premium" {...props} />
);

PremiumOnlyBadge.displayName = 'PremiumOnlyBadge';

export const NewArrivalBadge = forwardRef<HTMLDivElement, Omit<PremiumBadgeProps, 'variant'>>(
  (props, ref) => <PremiumBadge ref={ref} variant="new" pulse {...props} />
);

NewArrivalBadge.displayName = 'NewArrivalBadge';

// ============================================================================
// INVESTMENT GRADE BADGE (Special variant with grade display)
// ============================================================================

interface InvestmentGradeBadgeProps extends Omit<PremiumBadgeProps, 'variant' | 'label'> {
  grade: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C';
}

export const InvestmentGradeBadge = forwardRef<HTMLDivElement, InvestmentGradeBadgeProps>(
  ({ grade, ...props }, ref) => (
    <PremiumBadge ref={ref} variant="investment" label={`Grade ${grade}`} {...props} />
  )
);

InvestmentGradeBadge.displayName = 'InvestmentGradeBadge';

// ============================================================================
// BADGE GROUP (Multiple badges in a row)
// ============================================================================

interface BadgeGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const BadgeGroup = forwardRef<HTMLDivElement, BadgeGroupProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-wrap items-center gap-2', className)}
      {...props}
    >
      {children}
    </div>
  )
);

BadgeGroup.displayName = 'BadgeGroup';

// ============================================================================
// EXPORTS
// ============================================================================

export default PremiumBadge;
