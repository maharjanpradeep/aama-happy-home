export type CtaAction = 'call' | 'text' | 'directions' | 'email' | 'inquiry_submit' | 'facebook' | 'instagram';

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();
const IS_DEV = import.meta.env.DEV;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function logDev(message: string) {
  if (IS_DEV && MEASUREMENT_ID) {
    console.info(`[analytics] ${message}`);
  }
}

/** Fallback bootstrap if index.html tag was not injected (no measurement ID at build). */
export function initAnalytics() {
  if (!MEASUREMENT_ID || typeof window === 'undefined' || window.gtag) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID, { send_page_view: false });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);
  logDev('initialized (fallback)');
}

export function trackPageView(path: string) {
  if (!MEASUREMENT_ID || !window.gtag) return;

  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
  logDev(`page_view ${path}`);
}

export function trackCta(action: CtaAction, placement: string) {
  if (!MEASUREMENT_ID || !window.gtag) return;

  window.gtag('event', `cta_${action}`, { placement });
  logDev(`cta_${action} (${placement})`);
}
