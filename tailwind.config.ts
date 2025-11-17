import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // ========================================================================
      // ROLLS-ROYCE CUSTOM THEME
      // ========================================================================

      // Border Radius
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        luxury: "0.625rem", // 10px - Rolls-Royce signature
      },

      // Colors - Rolls-Royce Brand Palette
      colors: {
        // ShadCN Base Colors
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },

        // Rolls-Royce Purple Spirit
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

        // Chrome/Silver
        chrome: {
          50: '#FEFEFE',
          100: '#F8F8F8',
          200: '#E8E8E8',
          300: '#D8D8D8',
          400: '#C0C0C0',
          500: '#A8A8A8',
          600: '#888888',
          700: '#606060',
          800: '#383838',
          900: '#1A1A1A',
        },

        // Hot Rod Red
        red: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#DC2626',
          600: '#B91C1C',
          700: '#991B1B',
          800: '#7F1D1D',
          900: '#450A0A',
        },

        // Chrome Gold
        gold: {
          50: '#FEFCE8',
          100: '#FEF9C3',
          200: '#FEF08A',
          300: '#FDE047',
          400: '#FACC15',
          500: '#D4AF37',
          600: '#CA8A04',
          700: '#A16207',
          800: '#854D0E',
          900: '#713F12',
        },

        // Emerald Green (Spirit of Ecstasy)
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
      },

      // Typography - Luxury Font Stack
      fontFamily: {
        heading: ['Cormorant Garamond', 'serif'],
        body: ['Inter', 'sans-serif'],
        display: ['Oswald', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },

      // Letter Spacing
      letterSpacing: {
        luxury: '0.15em', // For all-caps luxury headings
      },

      // Box Shadows - Luxury Glows
      boxShadow: {
        'glow-purple': '0 0 20px rgba(107, 44, 145, 0.5)',
        'glow-gold': '0 0 20px rgba(212, 175, 55, 0.5)',
        'glow-red': '0 0 20px rgba(220, 38, 38, 0.5)',
        'glow-white': '0 0 20px rgba(255, 255, 255, 0.3)',
        'luxury-sm': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'luxury-md': '0 4px 16px rgba(0, 0, 0, 0.15)',
        'luxury-lg': '0 8px 32px rgba(0, 0, 0, 0.2)',
        'luxury-xl': '0 12px 48px rgba(0, 0, 0, 0.25)',
      },

      // Background Images - Chrome Gradients
      backgroundImage: {
        'chrome': 'linear-gradient(135deg, #E8E8E8 0%, #A8A8A8 50%, #E8E8E8 100%)',
        'chrome-dark': 'linear-gradient(135deg, #888888 0%, #444444 50%, #888888 100%)',
        'gold': 'linear-gradient(135deg, #F4D477 0%, #D4AF37 50%, #CA8A04 100%)',
        'gold-shine': 'linear-gradient(135deg, #FEF9C3 0%, #D4AF37 50%, #A16207 100%)',
        'purple': 'linear-gradient(135deg, #9B6FC2 0%, #6B2C91 50%, #3F1A5A 100%)',
        'purple-gold': 'linear-gradient(135deg, #6B2C91 0%, #9B6FC2 50%, #D4AF37 100%)',
        'dark-luxury': 'linear-gradient(180deg, #000000 0%, #1A1A1A 50%, #222222 100%)',
        'purple-haze': 'linear-gradient(180deg, #1A1A1A 0%, #2A113C 50%, #1A1A1A 100%)',
      },

      // Backdrop Blur - Glassmorphism
      backdropBlur: {
        xs: '2px',
        '3xl': '32px',
        '4xl': '48px',
      },

      // Keyframes - Luxury Animations
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'chrome-shine': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.05)' },
        },
      },

      // Animations
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s ease-in-out infinite",
        'chrome-shine': "chrome-shine 2.5s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        'pulse-glow': "pulse-glow 2s ease-in-out infinite",
      },

      // Z-Index
      zIndex: {
        max: '9999',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    // Custom plugin for glassmorphism utilities
    function({ addUtilities }: any) {
      const glassUtilities = {
        '.glass-light': {
          'background': 'rgba(255, 255, 255, 0.05)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
          'backdrop-filter': 'blur(16px)',
          '-webkit-backdrop-filter': 'blur(16px)',
        },
        '.glass-medium': {
          'background': 'rgba(255, 255, 255, 0.08)',
          'border': '1px solid rgba(255, 255, 255, 0.15)',
          'backdrop-filter': 'blur(20px)',
          '-webkit-backdrop-filter': 'blur(20px)',
        },
        '.glass-heavy': {
          'background': 'rgba(255, 255, 255, 0.12)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
          'backdrop-filter': 'blur(24px)',
          '-webkit-backdrop-filter': 'blur(24px)',
        },
        '.glass-purple': {
          'background': 'rgba(107, 44, 145, 0.15)',
          'border': '1px solid rgba(107, 44, 145, 0.3)',
          'backdrop-filter': 'blur(16px)',
          '-webkit-backdrop-filter': 'blur(16px)',
        },
        '.glass-gold': {
          'background': 'rgba(212, 175, 55, 0.1)',
          'border': '1px solid rgba(212, 175, 55, 0.25)',
          'backdrop-filter': 'blur(16px)',
          '-webkit-backdrop-filter': 'blur(16px)',
        },
      };

      addUtilities(glassUtilities);
    },
  ],
} satisfies Config;
