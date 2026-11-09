/**
 * Application Logger & Visitor Tracking Utility
 * Handles error tracking, client exceptions, and visitor activity logging.
 */

const getSessionId = () => {
  try {
    let sid = sessionStorage.getItem("gps_visitor_session");
    if (!sid) {
      sid = "ses_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
      sessionStorage.setItem("gps_visitor_session", sid);
    }
    return sid;
  } catch (_) {
    return "session_unknown";
  }
};

const sendBeaconOrPost = (url, data) => {
  try {
    const payload = JSON.stringify(data);
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon(url, blob);
    } else {
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch (_) {
    // Failsafe: logging failure must never interrupt user experience
  }
};

export const logger = {
  info: (message, meta = null) => {
    const time = new Date().toLocaleTimeString();
    if (meta) {
      console.log(`%c[INFO ${time}]`, "color: #0284c7; font-weight: bold;", message, meta);
    } else {
      console.log(`%c[INFO ${time}]`, "color: #0284c7; font-weight: bold;", message);
    }
  },

  warn: (message, meta = null) => {
    const time = new Date().toLocaleTimeString();
    console.warn(`%c[WARN ${time}]`, "color: #d97706; font-weight: bold;", message, meta || "");
  },

  error: (err, context = {}) => {
    const time = new Date().toLocaleTimeString();
    const errorObj = err instanceof Error ? err : new Error(String(err));
    const message = errorObj.message || "Unknown client error";
    const stack = errorObj.stack || "";
    const route = window.location.pathname;

    console.error(
      `%c[ERROR ${time}]`,
      "color: #dc2626; font-weight: bold;",
      message,
      context,
      errorObj
    );

    sendBeaconOrPost("/api/logs/client-error", {
      message,
      stack,
      componentStack: context.componentStack || "",
      route,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });
  },

  trackView: (path = window.location.pathname, title = document.title) => {
    try {
      const screen = `${window.screen?.width || 0}x${window.screen?.height || 0}`;
      sendBeaconOrPost("/api/logs/visitor", {
        path,
        title,
        referrer: document.referrer || "",
        screen,
        sessionId: getSessionId(),
        timestamp: new Date().toISOString(),
      });
    } catch (_) {}
  },
};

export function initGlobalLogger() {
  if (typeof window === "undefined") return;

  // Track global unhandled errors
  window.addEventListener("error", (event) => {
    logger.error(event.error || event.message, {
      source: "window.onerror",
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  // Track unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    logger.error(event.reason || "Unhandled Promise Rejection", {
      source: "window.unhandledrejection",
    });
  });

  // Initial pageview tracking
  logger.trackView(window.location.pathname, document.title);
}

export default logger;
