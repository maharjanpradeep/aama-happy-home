import { hydrateRoot, createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { captureAttribution } from './lib/attribution'

// Before any in-app navigation drops the landing page's ?utm_…/gclid query.
captureAttribution();

const rootElement = document.getElementById("root")!;

// react-snap prerenders the routes into static HTML at build time. When that
// markup is present we hydrate it instead of throwing it away with a fresh render.
if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, <App />);
} else {
  createRoot(rootElement).render(<App />);
}
