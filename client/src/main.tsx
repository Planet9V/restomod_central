import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Load fonts
import "./lib/fonts";

createRoot(document.getElementById("root")!).render(<App />);
