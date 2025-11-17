/**
 * LuxuryButton Component
 *
 * Premium button with Rolls-Royce inspired animations and effects
 * Features: shimmer effect, glow on hover, smooth transitions
 */

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { rollsRoyceTheme } from '@/styles/rolls-royce-theme';

// ============================================================================
// TYPES
// ============================================================================

type ButtonVariant = 'purple' | 'gold' | 'chrome' | 'red' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'base' | 'lg' | 'xl';

interface LuxuryButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  /** Button style variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Show shimmer effect */
  shimmer?: boolean;
  /** Icon on the left */
  leftIcon?: React.ReactNode;
  /** Icon on the right */
  rightIcon?: React.ReactNode;
  /** Children */
  children?: React.ReactNode;
  /** Custom className */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const LuxuryButton = forwardRef<HTMLButtonElement, LuxuryButtonProps>(
  (
    {
      variant = 'purple',
      size = 'base',
      loading = false,
      disabled = false,
      fullWidth = false,
      shimmer = false,
      leftIcon,
      rightIcon,
      children,
      className,
      ...props
    },
    ref
  ) => {
    // Variant styles
    const variantClasses = {
      purple: 'bg-gradient-to-r from-[#6B2C91] to-[#9B6FC2] text-white hover:from-[#552378] hover:to-[#6B2C91] shadow-lg hover:shadow-[0_0_20px_rgba(107,44,145,0.5)]',
      gold: 'bg-gradient-to-r from-[#D4AF37] to-[#F4D477] text-black hover:from-[#CA8A04] hover:to-[#D4AF37] shadow-lg hover:shadow-[0_0_20px_rgba(212,175,55,0.5)]',
      chrome: 'bg-gradient-to-r from-[#E8E8E8] to-[#A8A8A8] text-black hover:from-[#FEFEFE] hover:to-[#C0C0C0] shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]',
      red: 'bg-gradient-to-r from-[#DC2626] to-[#F87171] text-white hover:from-[#B91C1C] hover:to-[#DC2626] shadow-lg hover:shadow-[0_0_20px_rgba(220,38,38,0.5)]',
      ghost: 'bg-transparent text-white hover:bg-white/10 border border-white/20',
      outline: 'bg-transparent text-white border-2 border-white hover:bg-white hover:text-black',
    };

    // Size styles
    const sizeClasses = {
      sm: 'px-4 py-2 text-sm',
      base: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
      xl: 'px-12 py-6 text-xl',
    };

    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        className={cn(
          // Base styles
          'relative overflow-hidden rounded-luxury font-medium',
          'transition-all duration-300 ease-out',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black',
          variant === 'purple' && 'focus:ring-[#6B2C91]',
          variant === 'gold' && 'focus:ring-[#D4AF37]',
          variant === 'chrome' && 'focus:ring-[#A8A8A8]',
          variant === 'red' && 'focus:ring-[#DC2626]',
          variant === 'ghost' && 'focus:ring-white/50',
          variant === 'outline' && 'focus:ring-white',
          // Variant
          variantClasses[variant],
          // Size
          sizeClasses[size],
          // Full width
          fullWidth && 'w-full',
          // Disabled
          isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          // Custom className
          className
        )}
        // Hover scale
        whileHover={!isDisabled ? { scale: 1.02 } : undefined}
        whileTap={!isDisabled ? { scale: 0.98 } : undefined}
        transition={{ duration: 0.2, ease: rollsRoyceTheme.animations.easing.luxury }}
        disabled={isDisabled}
        {...props}
      >
        {/* Shimmer effect */}
        {shimmer && !isDisabled && (
          <motion.div
            className="absolute inset-0 -translate-x-full"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
            }}
            animate={{
              x: ['0%', '200%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: 'easeInOut',
            }}
          />
        )}

        {/* Button content */}
        <span className="relative flex items-center justify-center gap-2">
          {/* Left icon or loading spinner */}
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            leftIcon && <span className="inline-flex">{leftIcon}</span>
          )}

          {/* Children */}
          {children}

          {/* Right icon */}
          {rightIcon && !loading && <span className="inline-flex">{rightIcon}</span>}
        </span>

        {/* Subtle grain texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
          }}
        />
      </motion.button>
    );
  }
);

LuxuryButton.displayName = 'LuxuryButton';

// ============================================================================
// CONVENIENCE COMPONENTS
// ============================================================================

export const LuxuryButtonPurple = forwardRef<
  HTMLButtonElement,
  Omit<LuxuryButtonProps, 'variant'>
>((props, ref) => <LuxuryButton ref={ref} variant="purple" {...props} />);

LuxuryButtonPurple.displayName = 'LuxuryButtonPurple';

export const LuxuryButtonGold = forwardRef<HTMLButtonElement, Omit<LuxuryButtonProps, 'variant'>>(
  (props, ref) => <LuxuryButton ref={ref} variant="gold" {...props} />
);

LuxuryButtonGold.displayName = 'LuxuryButtonGold';

export const LuxuryButtonChrome = forwardRef<
  HTMLButtonElement,
  Omit<LuxuryButtonProps, 'variant'>
>((props, ref) => <LuxuryButton ref={ref} variant="chrome" {...props} />);

LuxuryButtonChrome.displayName = 'LuxuryButtonChrome';

export const LuxuryButtonRed = forwardRef<HTMLButtonElement, Omit<LuxuryButtonProps, 'variant'>>(
  (props, ref) => <LuxuryButton ref={ref} variant="red" {...props} />
);

LuxuryButtonRed.displayName = 'LuxuryButtonRed';

export const LuxuryButtonGhost = forwardRef<HTMLButtonElement, Omit<LuxuryButtonProps, 'variant'>>(
  (props, ref) => <LuxuryButton ref={ref} variant="ghost" {...props} />
);

LuxuryButtonGhost.displayName = 'LuxuryButtonGhost';

export const LuxuryButtonOutline = forwardRef<
  HTMLButtonElement,
  Omit<LuxuryButtonProps, 'variant'>
>((props, ref) => <LuxuryButton ref={ref} variant="outline" {...props} />);

LuxuryButtonOutline.displayName = 'LuxuryButtonOutline';

// ============================================================================
// ICON BUTTON VARIANT
// ============================================================================

interface LuxuryIconButtonProps extends Omit<LuxuryButtonProps, 'leftIcon' | 'rightIcon'> {
  icon: React.ReactNode;
  'aria-label': string;
}

export const LuxuryIconButton = forwardRef<HTMLButtonElement, LuxuryIconButtonProps>(
  ({ icon, children, ...props }, ref) => (
    <LuxuryButton ref={ref} className="aspect-square p-3" {...props}>
      {icon}
      {children && <span className="sr-only">{children}</span>}
    </LuxuryButton>
  )
);

LuxuryIconButton.displayName = 'LuxuryIconButton';

// ============================================================================
// EXPORTS
// ============================================================================

export default LuxuryButton;
