/**
 * GlassCard Component
 *
 * Premium glassmorphism card component with Rolls-Royce luxury aesthetics
 * Features: blur effects, gradient borders, hover animations
 */

import { forwardRef, HTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { rollsRoyceTheme } from '@/styles/rolls-royce-theme';

// ============================================================================
// TYPES
// ============================================================================

type BlurLevel = 'none' | 'sm' | 'base' | 'md' | 'lg' | 'xl' | '2xl';
type GlassVariant = 'light' | 'medium' | 'heavy' | 'purple' | 'gold';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  /** Glassmorphism variant */
  variant?: GlassVariant;
  /** Blur intensity */
  blur?: BlurLevel;
  /** Custom background opacity (0-1) */
  opacity?: number;
  /** Show border */
  bordered?: boolean;
  /** Hover effect */
  hoverable?: boolean;
  /** Glow effect on hover */
  glowOnHover?: boolean;
  /** Padding size */
  padding?: 'none' | 'sm' | 'base' | 'md' | 'lg' | 'xl';
  /** Children */
  children?: React.ReactNode;
  /** Custom className */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      variant = 'light',
      blur = 'md',
      opacity,
      bordered = true,
      hoverable = true,
      glowOnHover = false,
      padding = 'base',
      children,
      className,
      ...props
    },
    ref
  ) => {
    // Get glass variant styles
    const glassVariant = rollsRoyceTheme.glassmorphism.glass[variant];

    // Padding classes
    const paddingClasses = {
      none: '',
      sm: 'p-3',
      base: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-12',
    };

    // Background color with custom opacity override
    const backgroundColor = opacity !== undefined
      ? variant === 'purple'
        ? `rgba(107, 44, 145, ${opacity})`
        : variant === 'gold'
        ? `rgba(212, 175, 55, ${opacity})`
        : `rgba(255, 255, 255, ${opacity})`
      : glassVariant.background;

    return (
      <motion.div
        ref={ref}
        className={cn(
          // Base styles
          'relative overflow-hidden rounded-luxury',
          // Padding
          paddingClasses[padding],
          // Border
          bordered && 'border',
          // Custom className
          className
        )}
        style={{
          backgroundColor,
          borderColor: bordered ? glassVariant.border : 'transparent',
          backdropFilter: glassVariant.blur,
          WebkitBackdropFilter: glassVariant.blur, // Safari support
        }}
        // Hover animations
        whileHover={
          hoverable
            ? {
                y: -4,
                transition: { duration: 0.3, ease: rollsRoyceTheme.animations.easing.luxury },
              }
            : undefined
        }
        // Initial animation
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: rollsRoyceTheme.animations.easing.luxury }}
        {...props}
      >
        {/* Glow effect on hover */}
        {glowOnHover && (
          <motion.div
            className="absolute inset-0 -z-10 opacity-0"
            style={{
              background:
                variant === 'purple'
                  ? rollsRoyceTheme.gradients.purple
                  : variant === 'gold'
                  ? rollsRoyceTheme.gradients.gold
                  : rollsRoyceTheme.gradients.chrome,
              filter: 'blur(20px)',
            }}
            whileHover={{ opacity: 0.3 }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* Content */}
        {children}

        {/* Subtle grain texture for premium feel */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
          }}
        />
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

// ============================================================================
// GLASS CARD VARIANTS (Convenience Components)
// ============================================================================

export const GlassCardLight = forwardRef<HTMLDivElement, Omit<GlassCardProps, 'variant'>>(
  (props, ref) => <GlassCard ref={ref} variant="light" {...props} />
);

GlassCardLight.displayName = 'GlassCardLight';

export const GlassCardMedium = forwardRef<HTMLDivElement, Omit<GlassCardProps, 'variant'>>(
  (props, ref) => <GlassCard ref={ref} variant="medium" {...props} />
);

GlassCardMedium.displayName = 'GlassCardMedium';

export const GlassCardHeavy = forwardRef<HTMLDivElement, Omit<GlassCardProps, 'variant'>>(
  (props, ref) => <GlassCard ref={ref} variant="heavy" {...props} />
);

GlassCardHeavy.displayName = 'GlassCardHeavy';

export const GlassCardPurple = forwardRef<HTMLDivElement, Omit<GlassCardProps, 'variant'>>(
  (props, ref) => <GlassCard ref={ref} variant="purple" {...props} />
);

GlassCardPurple.displayName = 'GlassCardPurple';

export const GlassCardGold = forwardRef<HTMLDivElement, Omit<GlassCardProps, 'variant'>>(
  (props, ref) => <GlassCard ref={ref} variant="gold" {...props} />
);

GlassCardGold.displayName = 'GlassCardGold';

// ============================================================================
// COMPOSED COMPONENTS
// ============================================================================

interface GlassCardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

export const GlassCardHeader = forwardRef<HTMLDivElement, GlassCardHeaderProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mb-4', className)}
      {...props}
    >
      {children}
    </div>
  )
);

GlassCardHeader.displayName = 'GlassCardHeader';

interface GlassCardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode;
  className?: string;
}

export const GlassCardTitle = forwardRef<HTMLHeadingElement, GlassCardTitleProps>(
  ({ children, className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        'font-heading text-2xl font-semibold tracking-tight text-white',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
);

GlassCardTitle.displayName = 'GlassCardTitle';

interface GlassCardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode;
  className?: string;
}

export const GlassCardDescription = forwardRef<HTMLParagraphElement, GlassCardDescriptionProps>(
  ({ children, className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-gray-300', className)}
      {...props}
    >
      {children}
    </p>
  )
);

GlassCardDescription.displayName = 'GlassCardDescription';

interface GlassCardContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

export const GlassCardContent = forwardRef<HTMLDivElement, GlassCardContentProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('space-y-4', className)}
      {...props}
    >
      {children}
    </div>
  )
);

GlassCardContent.displayName = 'GlassCardContent';

interface GlassCardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

export const GlassCardFooter = forwardRef<HTMLDivElement, GlassCardFooterProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mt-6 flex items-center gap-4', className)}
      {...props}
    >
      {children}
    </div>
  )
);

GlassCardFooter.displayName = 'GlassCardFooter';

// ============================================================================
// EXPORTS
// ============================================================================

export default GlassCard;
