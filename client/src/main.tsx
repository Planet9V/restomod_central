import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Load fonts
import "./lib/fonts";

// Initialize PostHog Analytics
import { initPostHog } from "@/../lib/posthog";
initPostHog();

// Initialize Web Vitals Monitoring
import { initWebVitals } from "./lib/performance/webVitals";
initWebVitals();

// Setup critical resource hints
import { setupCriticalResourceHints } from "./lib/performance/resourceHints";
setupCriticalResourceHints();

// Initialize Sentry (if configured)
if (import.meta.env.VITE_SENTRY_DSN) {
  import("@/../lib/sentry").then(({ initSentry }) => {
    initSentry();
  });
}

createRoot(document.getElementById("root")!).render(<App />);
