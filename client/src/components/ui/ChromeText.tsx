/**
 * ChromeText Component
 *
 * Metallic chrome text effect with Rolls-Royce luxury aesthetics
 * Features: chrome gradient, gold gradient, animated shine effect
 */

import { forwardRef, HTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { rollsRoyceTheme } from '@/styles/rolls-royce-theme';

// ============================================================================
// TYPES
// ============================================================================

type ChromeVariant = 'chrome' | 'gold' | 'purple' | 'chromeDark';
type TextSize = 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl' | '9xl';

interface ChromeTextProps extends Omit<HTMLMotionProps<'span'>, 'ref'> {
  /** Metallic variant */
  variant?: ChromeVariant;
  /** Text size */
  size?: TextSize;
  /** Animated shine effect */
  shine?: boolean;
  /** Font family */
  font?: 'heading' | 'display' | 'body';
  /** Font weight */
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
  /** Letter spacing for luxury feel */
  luxurySpacing?: boolean;
  /** Uppercase text */
  uppercase?: boolean;
  /** Children */
  children?: React.ReactNode;
  /** Custom className */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const ChromeText = forwardRef<HTMLSpanElement, ChromeTextProps>(
  (
    {
      variant = 'chrome',
      size = 'base',
      shine = false,
      font = 'heading',
      weight = 'bold',
      luxurySpacing = false,
      uppercase = false,
      children,
      className,
      ...props
    },
    ref
  ) => {
    // Gradient styles based on variant
    const gradientStyles = {
      chrome: rollsRoyceTheme.gradients.chrome,
      chromeDark: rollsRoyceTheme.gradients.chromeDark,
      gold: rollsRoyceTheme.gradients.gold,
      purple: rollsRoyceTheme.gradients.purple,
    };

    // Font family classes
    const fontClasses = {
      heading: 'font-heading',
      display: 'font-display',
      body: 'font-body',
    };

    // Font weight classes
    const weightClasses = {
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
      extrabold: 'font-extrabold',
      black: 'font-black',
    };

    // Size classes
    const sizeClasses = {
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
      '5xl': 'text-5xl',
      '6xl': 'text-6xl',
      '7xl': 'text-7xl',
      '8xl': 'text-8xl',
      '9xl': 'text-9xl',
    };

    return (
      <motion.span
        ref={ref}
        className={cn(
          // Base styles
          'relative inline-block',
          // Font
          fontClasses[font],
          // Weight
          weightClasses[weight],
          // Size
          sizeClasses[size],
          // Letter spacing
          luxurySpacing && 'tracking-[0.15em]',
          // Uppercase
          uppercase && 'uppercase',
          // Custom className
          className
        )}
        style={{
          background: gradientStyles[variant],
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          backgroundSize: '200% 100%',
        }}
        // Subtle entrance animation
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: rollsRoyceTheme.animations.easing.luxury }}
        {...props}
      >
        {/* Shine effect overlay */}
        {shine && (
          <motion.span
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            animate={{
              backgroundPosition: ['-200% 0', '200% 0'],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              repeatDelay: 3,
              ease: 'easeInOut',
            }}
          >
            {children}
          </motion.span>
        )}

        {/* Main text content */}
        <span className={shine ? 'opacity-0' : ''}>{children}</span>
      </motion.span>
    );
  }
);

ChromeText.displayName = 'ChromeText';

// ============================================================================
// CONVENIENCE COMPONENTS
// ============================================================================

export const ChromeTextChrome = forwardRef<HTMLSpanElement, Omit<ChromeTextProps, 'variant'>>(
  (props, ref) => <ChromeText ref={ref} variant="chrome" {...props} />
);

ChromeTextChrome.displayName = 'ChromeTextChrome';

export const ChromeTextGold = forwardRef<HTMLSpanElement, Omit<ChromeTextProps, 'variant'>>(
  (props, ref) => <ChromeText ref={ref} variant="gold" {...props} />
);

ChromeTextGold.displayName = 'ChromeTextGold';

export const ChromeTextPurple = forwardRef<HTMLSpanElement, Omit<ChromeTextProps, 'variant'>>(
  (props, ref) => <ChromeText ref={ref} variant="purple" {...props} />
);

ChromeTextPurple.displayName = 'ChromeTextPurple';

export const ChromeTextDark = forwardRef<HTMLSpanElement, Omit<ChromeTextProps, 'variant'>>(
  (props, ref) => <ChromeText ref={ref} variant="chromeDark" {...props} />
);

ChromeTextDark.displayName = 'ChromeTextDark';

// ============================================================================
// HEADING VARIANTS
// ============================================================================

interface ChromeHeadingProps extends Omit<ChromeTextProps, 'font'> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const ChromeHeading = forwardRef<HTMLHeadingElement, ChromeHeadingProps>(
  ({ as: Component = 'h2', children, className, ...props }, ref) => {
    const HeadingComponent = Component as any;

    return (
      <HeadingComponent ref={ref} className={className}>
        <ChromeText font="heading" {...props}>
          {children}
        </ChromeText>
      </HeadingComponent>
    );
  }
);

ChromeHeading.displayName = 'ChromeHeading';

// ============================================================================
// DISPLAY TEXT (Large hero text)
// ============================================================================

interface ChromeDisplayProps extends Omit<ChromeTextProps, 'font' | 'size'> {
  size?: '4xl' | '5xl' | '6xl' | '7xl' | '8xl' | '9xl';
}

export const ChromeDisplay = forwardRef<HTMLSpanElement, ChromeDisplayProps>(
  ({ size = '6xl', luxurySpacing = true, uppercase = true, ...props }, ref) => (
    <ChromeText
      ref={ref}
      font="display"
      size={size}
      luxurySpacing={luxurySpacing}
      uppercase={uppercase}
      {...props}
    />
  )
);

ChromeDisplay.displayName = 'ChromeDisplay';

// ============================================================================
// PRICE TEXT (Special formatting for luxury pricing)
// ============================================================================

interface ChromePriceProps extends Omit<ChromeTextProps, 'variant' | 'font'> {
  amount: number;
  currency?: string;
  compact?: boolean;
}

export const ChromePrice = forwardRef<HTMLSpanElement, ChromePriceProps>(
  ({ amount, currency = 'USD', compact = false, className, ...props }, ref) => {
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: compact ? 'compact' : 'standard',
      compactDisplay: 'short',
    }).format(amount);

    return (
      <ChromeText
        ref={ref}
        variant="gold"
        font="display"
        weight="bold"
        className={cn('tabular-nums', className)}
        {...props}
      >
        {formattedPrice}
      </ChromeText>
    );
  }
);

ChromePrice.displayName = 'ChromePrice';

// ============================================================================
// EXPORTS
// ============================================================================

export default ChromeText;
