/**
 * Rolls-Royce Luxury Design System
 *
 * Inspired by Rolls-Royce brand guidelines and Pentagram's 2025 design
 * Color palette, typography, spacing, shadows, and animations for ultra-luxury UI
 */

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const colors = {
  // Primary - Rolls-Royce Purple Spirit
  purple: {
    50: '#F5F0F8',
    100: '#EBE1F1',
    200: '#D7C3E3',
    300: '#C3A5D5',
    400: '#9B6FC2',
    500: '#6B2C91', // Primary Purple Spirit
    600: '#552378',
    700: '#3F1A5A',
    800: '#2A113C',
    900: '#15091E',
  },

  // Chrome/Silver - Metallic finishes
  chrome: {
    50: '#FEFEFE',
    100: '#F8F8F8',
    200: '#E8E8E8',
    300: '#D8D8D8',
    400: '#C0C0C0',
    500: '#A8A8A8', // Chrome Silver
    600: '#888888',
    700: '#606060',
    800: '#383838',
    900: '#1A1A1A',
  },

  // Hot Rod Red - Heritage accent
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#DC2626', // Hot Rod Red
    600: '#B91C1C',
    700: '#991B1B',
    800: '#7F1D1D',
    900: '#450A0A',
  },

  // Riviera Nights - Typography & luxury accents
  gold: {
    50: '#FEFCE8',
    100: '#FEF9C3',
    200: '#FEF08A',
    300: '#FDE047',
    400: '#FACC15',
    500: '#D4AF37', // Chrome Gold
    600: '#CA8A04',
    700: '#A16207',
    800: '#854D0E',
    900: '#713F12',
  },

  // Emerald Green - Spirit of Ecstasy accent
  emerald: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },

  // Fluoro Pink/Orange - Modern vibrant accents
  fluoro: {
    pink: '#FF006E',
    orange: '#FF6B35',
    yellow: '#FFBE0B',
  },

  // Neutrals - Dark luxury backgrounds
  neutral: {
    black: '#000000',
    charcoal: '#1A1A1A',
    graphite: '#222222',
    slate: '#333333',
    ash: '#444444',
    smoke: '#666666',
    fog: '#888888',
    silver: '#CCCCCC',
    platinum: '#E8E8E8',
    white: '#FEFEFE',
  },
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  // Font families (matching Google Fonts spec)
  fonts: {
    heading: "'Cormorant Garamond', serif", // Luxury elegance
    body: "'Inter', sans-serif", // Readability
    display: "'Oswald', sans-serif", // Bold statements
    mono: "'Roboto Mono', monospace", // Technical/code
  },

  // Font sizes (responsive scale)
  sizes: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
    '7xl': '4.5rem',   // 72px
    '8xl': '6rem',     // 96px
    '9xl': '8rem',     // 128px
  },

  // Font weights
  weights: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  // Line heights
  lineHeights: {
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
    luxury: '0.15em', // For luxury all-caps headings
  },
} as const;

// ============================================================================
// SPACING
// ============================================================================

export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
  40: '10rem',    // 160px
  48: '12rem',    // 192px
  56: '14rem',    // 224px
  64: '16rem',    // 256px
} as const;

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
  // Premium subtle shadows
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

  // Luxury glow effects
  glow: {
    purple: '0 0 20px rgba(107, 44, 145, 0.5)',
    gold: '0 0 20px rgba(212, 175, 55, 0.5)',
    red: '0 0 20px rgba(220, 38, 38, 0.5)',
    white: '0 0 20px rgba(255, 255, 255, 0.3)',
  },

  // Inner shadows for depth
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  innerLg: 'inset 0 4px 8px 0 rgba(0, 0, 0, 0.1)',
} as const;

// ============================================================================
// GLASSMORPHISM
// ============================================================================

export const glassmorphism = {
  // Background blur effects
  blur: {
    none: 'blur(0)',
    sm: 'blur(4px)',
    base: 'blur(8px)',
    md: 'blur(12px)',
    lg: 'blur(16px)',
    xl: 'blur(24px)',
    '2xl': 'blur(40px)',
  },

  // Glass card variants
  glass: {
    light: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: 'rgba(255, 255, 255, 0.1)',
      blur: 'blur(16px)',
    },
    medium: {
      background: 'rgba(255, 255, 255, 0.08)',
      border: 'rgba(255, 255, 255, 0.15)',
      blur: 'blur(20px)',
    },
    heavy: {
      background: 'rgba(255, 255, 255, 0.12)',
      border: 'rgba(255, 255, 255, 0.2)',
      blur: 'blur(24px)',
    },
    purple: {
      background: 'rgba(107, 44, 145, 0.15)',
      border: 'rgba(107, 44, 145, 0.3)',
      blur: 'blur(16px)',
    },
    gold: {
      background: 'rgba(212, 175, 55, 0.1)',
      border: 'rgba(212, 175, 55, 0.25)',
      blur: 'blur(16px)',
    },
  },
} as const;

// ============================================================================
// ANIMATIONS
// ============================================================================

export const animations = {
  // Timing functions
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    luxury: 'cubic-bezier(0.16, 1, 0.3, 1)', // Smooth luxury feel
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Duration
  duration: {
    fastest: '100ms',
    faster: '150ms',
    fast: '200ms',
    normal: '300ms',
    slow: '400ms',
    slower: '600ms',
    slowest: '800ms',
  },

  // Framer Motion variants
  variants: {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slideUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 },
    },
    slideDown: {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    },
    slideLeft: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 },
    },
    slideRight: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    },
    scaleUp: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.8 },
    },
  },

  // Keyframe animations (for CSS)
  keyframes: {
    shimmer: {
      '0%': { backgroundPosition: '-200% 0' },
      '100%': { backgroundPosition: '200% 0' },
    },
    pulse: {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.5 },
    },
    spin: {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' },
    },
    ping: {
      '0%': { transform: 'scale(1)', opacity: 1 },
      '75%, 100%': { transform: 'scale(2)', opacity: 0 },
    },
    float: {
      '0%, 100%': { transform: 'translateY(0px)' },
      '50%': { transform: 'translateY(-10px)' },
    },
    chromeShine: {
      '0%': { backgroundPosition: '-200% 0' },
      '100%': { backgroundPosition: '200% 0' },
    },
  },
} as const;

// ============================================================================
// GRADIENTS
// ============================================================================

export const gradients = {
  // Chrome/metallic gradients
  chrome: 'linear-gradient(135deg, #E8E8E8 0%, #A8A8A8 50%, #E8E8E8 100%)',
  chromeDark: 'linear-gradient(135deg, #888888 0%, #444444 50%, #888888 100%)',

  // Gold metallic
  gold: 'linear-gradient(135deg, #F4D477 0%, #D4AF37 50%, #CA8A04 100%)',
  goldShine: 'linear-gradient(135deg, #FEF9C3 0%, #D4AF37 50%, #A16207 100%)',

  // Purple luxury
  purple: 'linear-gradient(135deg, #9B6FC2 0%, #6B2C91 50%, #3F1A5A 100%)',
  purpleToGold: 'linear-gradient(135deg, #6B2C91 0%, #9B6FC2 50%, #D4AF37 100%)',

  // Background gradients
  darkLuxury: 'linear-gradient(180deg, #000000 0%, #1A1A1A 50%, #222222 100%)',
  purpleHaze: 'linear-gradient(180deg, #1A1A1A 0%, #2A113C 50%, #1A1A1A 100%)',

  // Overlay gradients
  overlayTop: 'linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 100%)',
  overlayBottom: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.8) 100%)',
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
  luxury: '0.625rem', // 10px - Rolls-Royce signature
} as const;

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  '3xl': '1920px',
} as const;

// ============================================================================
// Z-INDEX LAYERS
// ============================================================================

export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  notification: 1700,
  max: 9999,
} as const;

// ============================================================================
// THEME EXPORT
// ============================================================================

export const rollsRoyceTheme = {
  colors,
  typography,
  spacing,
  shadows,
  glassmorphism,
  animations,
  gradients,
  borderRadius,
  breakpoints,
  zIndex,
} as const;

export default rollsRoyceTheme;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type RollsRoyceTheme = typeof rollsRoyceTheme;
export type ColorPalette = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type Shadows = typeof shadows;
export type Glassmorphism = typeof glassmorphism;
export type Animations = typeof animations;
export type Gradients = typeof gradients;
