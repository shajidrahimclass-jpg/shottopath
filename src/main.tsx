import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "next-themes";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Add global error handler for Vite ChunkLoadError (fixes white screen on redeploy)
window.addEventListener('vite:preloadError', () => {
  window.location.reload();
});

window.addEventListener('error', (e) => {
  if (e.message && e.message.includes('Failed to fetch dynamically imported module')) {
    window.location.reload();
  }
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <AppWrapper>
          <App />
          <Analytics />
          <SpeedInsights />
        </AppWrapper>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>
);
