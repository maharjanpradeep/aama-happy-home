// Where a visitor came from (ad click, Google Maps, Facebook…), captured once on the
// first page they land on and sent with the contact-form inquiry. It has to be read
// on landing: the ?utm_…&gclid=… query is gone after the first in-app navigation.
// Kept in sessionStorage (this tab's visit only); storage can be unavailable, so
// every access is guarded and the in-memory copy is the fallback.

export interface Attribution {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  gclid?: string;
  referrer?: string;
}

const KEY = "aama_attribution";
let memory: Attribution | null = null;

export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    if (sessionStorage.getItem(KEY)) return; // first landing page of the visit wins
  } catch {
    if (memory) return;
  }

  const params = new URLSearchParams(window.location.search);
  const get = (name: string) => params.get(name)?.slice(0, 200) || undefined;
  const referrer = document.referrer && !document.referrer.startsWith(window.location.origin)
    ? document.referrer.slice(0, 500)
    : undefined;

  memory = {
    utmSource: get("utm_source"),
    utmMedium: get("utm_medium"),
    utmCampaign: get("utm_campaign"),
    utmTerm: get("utm_term"),
    gclid: get("gclid"),
    referrer,
  };
  try {
    sessionStorage.setItem(KEY, JSON.stringify(memory));
  } catch {
    // Private mode / blocked storage: the in-memory copy still covers this page load.
  }
}

export function getAttribution(): Attribution {
  try {
    const stored = sessionStorage.getItem(KEY);
    if (stored) return JSON.parse(stored) as Attribution;
  } catch {
    // fall through
  }
  return memory ?? {};
}
