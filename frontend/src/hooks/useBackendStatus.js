import { useState, useEffect, useCallback } from "react";

export function useBackendStatus() {
  const [state, setState] = useState({
    serverOnline: false,
    connected: false,
    status: "checking", // 'checking' | 'connected' | 'disconnected' | 'error' | 'offline'
    host: null,
    database: null,
    message: "Checking database connection...",
    lastChecked: null,
    loading: true,
  });

  const checkStatus = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));

    // Try relative /api/health (routed via Vite proxy) or direct http://localhost:5000/api/health
    const endpoints = ["/api/health", "http://localhost:5000/api/health"];
    let data = null;

    for (const url of endpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          data = await res.json();
          break;
        }
      } catch (err) {
        // Continue to fallback
      }
    }

    if (data && data.database) {
      const db = data.database;
      setState({
        serverOnline: true,
        connected: !!db.connected,
        status: db.connected ? "connected" : db.status || "disconnected",
        host: db.host || null,
        database: db.database || null,
        message: db.message || (db.connected ? "MongoDB Atlas Connected" : "MongoDB Disconnected"),
        lastChecked: new Date(),
        loading: false,
      });
    } else {
      setState({
        serverOnline: false,
        connected: false,
        status: "offline",
        host: null,
        database: null,
        message: "Backend server offline. Running in Local Storage Mode.",
        lastChecked: new Date(),
        loading: false,
      });
    }
  }, []);

  useEffect(() => {
    checkStatus();
    // Periodically poll every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  return {
    ...state,
    refresh: checkStatus,
  };
}

export default useBackendStatus;
