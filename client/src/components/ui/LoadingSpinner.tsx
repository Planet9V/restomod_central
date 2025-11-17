/**
 * LoadingSpinner Component
 *
 * Rolls-Royce themed loading spinner with luxury animations
 * Features: multiple variants, sizes, with optional text
 */

import { forwardRef, HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { rollsRoyceTheme } from '@/styles/rolls-royce-theme';

// ============================================================================
// TYPES
// ============================================================================

type SpinnerVariant = 'purple' | 'gold' | 'chrome' | 'white';
type SpinnerSize = 'sm' | 'base' | 'lg' | 'xl' | '2xl';
type SpinnerType = 'circular' | 'dots' | 'pulse' | 'bars' | 'luxury';

interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  /** Spinner variant (color) */
  variant?: SpinnerVariant;
  /** Spinner size */
  size?: SpinnerSize;
  /** Spinner type/style */
  type?: SpinnerType;
  /** Loading text */
  text?: string;
  /** Center on screen */
  centered?: boolean;
  /** Full screen overlay */
  fullScreen?: boolean;
  /** Custom className */
  className?: string;
}

// ============================================================================
// SIZE CONFIGURATIONS
// ============================================================================

const sizeConfig = {
  sm: { spinner: 'h-4 w-4', dot: 'h-2 w-2', bar: 'h-6 w-1', text: 'text-sm' },
  base: { spinner: 'h-8 w-8', dot: 'h-3 w-3', bar: 'h-10 w-1.5', text: 'text-base' },
  lg: { spinner: 'h-12 w-12', dot: 'h-4 w-4', bar: 'h-14 w-2', text: 'text-lg' },
  xl: { spinner: 'h-16 w-16', dot: 'h-5 w-5', bar: 'h-18 w-2.5', text: 'text-xl' },
  '2xl': { spinner: 'h-24 w-24', dot: 'h-6 w-6', bar: 'h-24 w-3', text: 'text-2xl' },
};

// ============================================================================
// COLOR CONFIGURATIONS
// ============================================================================

const colorConfig = {
  purple: {
    border: 'border-[#6B2C91]',
    bg: 'bg-[#6B2C91]',
    gradient: rollsRoyceTheme.gradients.purple,
  },
  gold: {
    border: 'border-[#D4AF37]',
    bg: 'bg-[#D4AF37]',
    gradient: rollsRoyceTheme.gradients.gold,
  },
  chrome: {
    border: 'border-[#A8A8A8]',
    bg: 'bg-[#A8A8A8]',
    gradient: rollsRoyceTheme.gradients.chrome,
  },
  white: {
    border: 'border-white',
    bg: 'bg-white',
    gradient: 'linear-gradient(135deg, #FFFFFF 0%, #E8E8E8 100%)',
  },
};

// ============================================================================
// SPINNER COMPONENTS
// ============================================================================

const CircularSpinner = forwardRef<
  HTMLDivElement,
  { variant: SpinnerVariant; size: SpinnerSize; className?: string }
>(({ variant, size, className }, ref) => (
  <div
    ref={ref}
    className={cn(
      sizeConfig[size].spinner,
      'rounded-full border-4 border-t-transparent',
      colorConfig[variant].border,
      'animate-spin',
      className
    )}
  />
));
CircularSpinner.displayName = 'CircularSpinner';

const DotsSpinner = forwardRef<
  HTMLDivElement,
  { variant: SpinnerVariant; size: SpinnerSize; className?: string }
>(({ variant, size, className }, ref) => (
  <div ref={ref} className={cn('flex items-center gap-2', className)}>
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className={cn(sizeConfig[size].dot, 'rounded-full', colorConfig[variant].bg)}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [1, 0.5, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          delay: i * 0.2,
          ease: 'easeInOut',
        }}
      />
    ))}
  </div>
));
DotsSpinner.displayName = 'DotsSpinner';

const PulseSpinner = forwardRef<
  HTMLDivElement,
  { variant: SpinnerVariant; size: SpinnerSize; className?: string }
>(({ variant, size, className }, ref) => (
  <div ref={ref} className={cn('relative', sizeConfig[size].spinner, className)}>
    <motion.div
      className={cn('absolute inset-0 rounded-full', colorConfig[variant].bg, 'opacity-75')}
      animate={{
        scale: [1, 2, 2, 1, 1],
        opacity: [1, 0, 0, 1, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
    <motion.div
      className={cn('absolute inset-0 rounded-full', colorConfig[variant].bg, 'opacity-75')}
      animate={{
        scale: [1, 2, 2, 1, 1],
        opacity: [1, 0, 0, 1, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        delay: 1,
        ease: 'easeInOut',
      }}
    />
  </div>
));
PulseSpinner.displayName = 'PulseSpinner';

const BarsSpinner = forwardRef<
  HTMLDivElement,
  { variant: SpinnerVariant; size: SpinnerSize; className?: string }
>(({ variant, size, className }, ref) => (
  <div ref={ref} className={cn('flex items-center gap-1', className)}>
    {[0, 1, 2, 3].map((i) => (
      <motion.div
        key={i}
        className={cn(sizeConfig[size].bar, 'rounded-full', colorConfig[variant].bg)}
        animate={{
          scaleY: [1, 2, 1],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          delay: i * 0.1,
          ease: 'easeInOut',
        }}
      />
    ))}
  </div>
));
BarsSpinner.displayName = 'BarsSpinner';

const LuxurySpinner = forwardRef<
  HTMLDivElement,
  { variant: SpinnerVariant; size: SpinnerSize; className?: string }
>(({ variant, size, className }, ref) => (
  <div ref={ref} className={cn('relative', sizeConfig[size].spinner, className)}>
    {/* Outer ring */}
    <motion.div
      className={cn('absolute inset-0 rounded-full border-4 border-t-transparent', colorConfig[variant].border)}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      }}
    />

    {/* Inner ring */}
    <motion.div
      className={cn(
        'absolute inset-2 rounded-full border-4 border-b-transparent',
        colorConfig[variant].border,
        'opacity-50'
      )}
      animate={{ rotate: -360 }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'linear',
      }}
    />

    {/* Center dot */}
    <motion.div
      className={cn('absolute inset-0 m-auto h-2 w-2 rounded-full', colorConfig[variant].bg)}
      animate={{
        scale: [1, 1.5, 1],
        opacity: [1, 0.5, 1],
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  </div>
));
LuxurySpinner.displayName = 'LuxurySpinner';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const LoadingSpinner = forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  (
    {
      variant = 'purple',
      size = 'base',
      type = 'luxury',
      text,
      centered = false,
      fullScreen = false,
      className,
      ...props
    },
    ref
  ) => {
    const SpinnerComponent = {
      circular: CircularSpinner,
      dots: DotsSpinner,
      pulse: PulseSpinner,
      bars: BarsSpinner,
      luxury: LuxurySpinner,
    }[type];

    const spinnerContent = (
      <div
        className={cn(
          'flex flex-col items-center gap-4',
          centered && 'justify-center min-h-[200px]',
          className
        )}
        {...props}
      >
        <SpinnerComponent variant={variant} size={size} />
        {text && (
          <motion.p
            className={cn('font-medium text-gray-300', sizeConfig[size].text)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {text}
          </motion.p>
        )}
      </div>
    );

    if (fullScreen) {
      return (
        <motion.div
          ref={ref}
          className="fixed inset-0 z-max flex items-center justify-center bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {spinnerContent}
        </motion.div>
      );
    }

    return <div ref={ref}>{spinnerContent}</div>;
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

// ============================================================================
// CONVENIENCE COMPONENTS
// ============================================================================

export const LoadingSpinnerPurple = forwardRef<HTMLDivElement, Omit<LoadingSpinnerProps, 'variant'>>(
  (props, ref) => <LoadingSpinner ref={ref} variant="purple" {...props} />
);
LoadingSpinnerPurple.displayName = 'LoadingSpinnerPurple';

export const LoadingSpinnerGold = forwardRef<HTMLDivElement, Omit<LoadingSpinnerProps, 'variant'>>(
  (props, ref) => <LoadingSpinner ref={ref} variant="gold" {...props} />
);
LoadingSpinnerGold.displayName = 'LoadingSpinnerGold';

export const LoadingSpinnerChrome = forwardRef<HTMLDivElement, Omit<LoadingSpinnerProps, 'variant'>>(
  (props, ref) => <LoadingSpinner ref={ref} variant="chrome" {...props} />
);
LoadingSpinnerChrome.displayName = 'LoadingSpinnerChrome';

export const LoadingSpinnerWhite = forwardRef<HTMLDivElement, Omit<LoadingSpinnerProps, 'variant'>>(
  (props, ref) => <LoadingSpinner ref={ref} variant="white" {...props} />
);
LoadingSpinnerWhite.displayName = 'LoadingSpinnerWhite';

// ============================================================================
// FULL PAGE LOADING
// ============================================================================

interface FullPageLoadingProps {
  variant?: SpinnerVariant;
  size?: SpinnerSize;
  type?: SpinnerType;
  text?: string;
}

export const FullPageLoading = ({
  variant = 'purple',
  size = 'xl',
  type = 'luxury',
  text = 'Loading...',
}: FullPageLoadingProps) => (
  <LoadingSpinner
    variant={variant}
    size={size}
    type={type}
    text={text}
    fullScreen
  />
);

FullPageLoading.displayName = 'FullPageLoading';

// ============================================================================
// EXPORTS
// ============================================================================

export default LoadingSpinner;
