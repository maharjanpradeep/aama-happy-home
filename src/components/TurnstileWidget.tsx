import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

// Cloudflare Turnstile (bot check) for the public contact form. The site key is
// public by design; the matching secret lives only in the backend's
// TURNSTILE_SECRET_KEY. Local dev uses Cloudflare's always-pass test key.
const TURNSTILE_SITE_KEY =import.meta.env.DEV
  ? "1x00000000000000000000AA"
  : "0x4AAAAAAFyjCoLSqI-_PtcX";

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface TurnstileApi {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        scriptPromise = null; // allow a retry on the next mount
        reject(new Error("Turnstile failed to load"));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

export interface TurnstileHandle {
  /** Tokens are single-use: call after every submit attempt to get a fresh one. */
  reset: () => void;
}

interface Props {
  onToken: (token: string) => void;
  onExpire: () => void;
  /** Script blocked (ad blocker, network) or the widget errored. */
  onError: () => void;
}

const TurnstileWidget = forwardRef<TurnstileHandle, Props>(({ onToken, onExpire, onError }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  // Keep the latest callbacks without re-rendering the widget.
  const callbacks = useRef({ onToken, onExpire, onError });
  callbacks.current = { onToken, onExpire, onError };

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetIdRef.current && window.turnstile) window.turnstile.reset(widgetIdRef.current);
    },
  }));

  useEffect(() => {
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          action: "inquiry",
          callback: (token: string) => callbacks.current.onToken(token),
          "expired-callback": () => callbacks.current.onExpire(),
          "error-callback": () => callbacks.current.onError(),
        });
      })
      .catch(() => {
        if (!cancelled) callbacks.current.onError();
      });
    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="min-h-[65px]" />;
});

TurnstileWidget.displayName = "TurnstileWidget";

export default TurnstileWidget;
