import { useEffect, useRef, useState } from "react";

export default function UpdatePrompt() {
  const [waitingWorker, setWaitingWorker] = useState(null);
  const [visible, setVisible] = useState(false);
  const refreshing = useRef(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let registration;
    let interval;

    const showUpdate = (worker) => {
      if (!worker) return;

      setWaitingWorker(worker);
      setVisible(true);

      console.log("GPS: Website update available!");
    };

    const checkWaitingWorker = () => {
      if (registration?.waiting && registration.active) {
        showUpdate(registration.waiting);
      }
    };

    const registerServiceWorker = async () => {
      try {
        registration = await navigator.serviceWorker.register("/sw.js");


        // Listen for new installations
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;

          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {

            if (newWorker.state === "installed") {
              checkWaitingWorker();
            }
          });
        });

        // Check for an update already waiting
        checkWaitingWorker();

        // Check for updates periodically (every 60 seconds)
        interval = setInterval(() => {
          registration.update();
          checkWaitingWorker();
        }, 60 * 1000);
      } catch (error) {
        console.error("GPS: Service Worker error:", error);
      }
    };

    registerServiceWorker();

    const handleFocus = () => {
      registration?.update();
      checkWaitingWorker();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        registration?.update();
        checkWaitingWorker();
      }
    };

    const handleControllerChange = () => {
      if (refreshing.current) {
        window.location.reload();
      }
    };

    window.addEventListener("focus", handleFocus);

    document.addEventListener("visibilitychange", handleVisibility);

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange,
    );

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);

      document.removeEventListener("visibilitychange", handleVisibility);

      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange,
      );
    };
  }, []);

  const updateWebsite = () => {
    if (!waitingWorker) return;

    refreshing.current = true;
    waitingWorker.postMessage("SKIP_WAITING");
  };

  useEffect(() => {
  }, [visible]);


if (!visible) return null;

return (
  <div
    style={{
      position: "fixed",
      bottom: "24px",
      left: "20px",
      right: "20px",
      zIndex: 2147483647,
      maxWidth: "420px",
      margin: "0 auto",
      fontFamily: "Arial, sans-serif",
    }}
  >
    <div
      style={{
        background: "#111827",
        color: "#ffffff",
        padding: "22px",
        borderRadius: "16px",
        border: "1px solid #374151",
        boxShadow: "0 15px 50px rgba(0,0,0,0.4)",
      }}
    >
      <div style={{ display: "flex", gap: "14px" }}>
        <div
          style={{
            fontSize: "28px",
            background: "#1e3a8a",
            padding: "10px",
            borderRadius: "12px",
          }}
        >
          ↑
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{ margin: "0 0 8px", fontSize: "17px" }}>
            Website Update Available
          </h3>

          <p
            style={{
              margin: 0,
              fontSize: "13px",
              lineHeight: 1.6,
              color: "#d1d5db",
            }}
          >
            A new version of The Glorious School website is available. Update
            now to enjoy the latest improvements.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
        <button
          onClick={updateWebsite}
          style={{
            flex: 1,
            padding: "12px",
            border: "none",
            borderRadius: "9px",
            background: "#2563eb",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Update Now
        </button>

        <button
          onClick={() => setVisible(false)}
          style={{
            padding: "12px 18px",
            border: "none",
            borderRadius: "9px",
            background: "#374151",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Later
        </button>
      </div>
    </div>
  </div>
);

  return (
    <div className="fixed bottom-5 left-4 right-4 z-[99999] mx-auto max-w-md">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl dark:bg-blue-900">
            🚀
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-gray-900 dark:text-white">
              Website Update Available!
            </h3>

            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              A new version of The Glorious School website is available. Update
              now to enjoy the latest improvements and announcements.
            </p>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            onClick={updateWebsite}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Update Now
          </button>

          <button
            onClick={() => setVisible(false)}
            className="rounded-lg bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-white"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
