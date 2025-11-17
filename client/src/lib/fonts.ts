/**
 * Font Loading Optimization
 *
 * Optimized font loading with:
 * - Preconnect to Google Fonts
 * - font-display: swap for better performance
 * - Subsetting (Latin only)
 * - Resource hints
 */

// Preconnect to Google Fonts (faster than loading inline)
const preconnectGoogleFonts = () => {
  // Preconnect to fonts.googleapis.com
  const preconnect1 = document.createElement('link');
  preconnect1.rel = 'preconnect';
  preconnect1.href = 'https://fonts.googleapis.com';
  document.head.appendChild(preconnect1);

  // Preconnect to fonts.gstatic.com with crossorigin
  const preconnect2 = document.createElement('link');
  preconnect2.rel = 'preconnect';
  preconnect2.href = 'https://fonts.gstatic.com';
  preconnect2.crossOrigin = 'anonymous';
  document.head.appendChild(preconnect2);
};

// Load fonts with optimized parameters
const loadOptimizedFonts = () => {
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  // Optimized URL with:
  // - display=swap (shows fallback text immediately)
  // - text parameter for subsetting (if needed)
  // - Only Latin characters
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap&subset=latin';

  // Use media attribute to prevent blocking
  fontLink.media = 'print';
  fontLink.onload = function() {
    (this as HTMLLinkElement).media = 'all';
  };

  document.head.appendChild(fontLink);
};

// Initialize font loading
if (typeof document !== 'undefined') {
  preconnectGoogleFonts();
  loadOptimizedFonts();
}

// Set page title
if (typeof document !== 'undefined') {
  document.title = "McKenney & Skinny's Bespoke Restomods";
}

// Add viewport meta tag if not already present
if (typeof document !== 'undefined' && !document.querySelector('meta[name="viewport"]')) {
  const metaViewport = document.createElement('meta');
  metaViewport.name = 'viewport';
  metaViewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5';
  document.head.appendChild(metaViewport);
}

export default loadOptimizedFonts;
