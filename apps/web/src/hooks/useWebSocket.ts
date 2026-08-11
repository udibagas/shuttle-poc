import { useEffect, useRef, useState, useCallback } from "react";
import type { WebSocketEvent } from "@shuttle/types";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3000";

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<WebSocketEvent | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const listeners = useRef<Map<string, Set<(data: any) => void>>>(new Map());

  useEffect(() => {
    const connect = () => {
      const socket = new WebSocket(`${WS_URL}/ws`);

      socket.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);

        const token = localStorage.getItem("token");
        if (token) {
          socket.send(JSON.stringify({ type: "auth", token }));
        }
      };

      socket.onmessage = (event) => {
        try {
          const data: WebSocketEvent = JSON.parse(event.data);
          setLastEvent(data);

          const eventListeners = listeners.current.get(data.event);
          if (eventListeners) {
            eventListeners.forEach((callback) => callback(data.data));
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      socket.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);

        setTimeout(() => {
          connect();
        }, 3000);
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.current = socket;
    };

    connect();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    if (!listeners.current.has(event)) {
      listeners.current.set(event, new Set());
    }
    listeners.current.get(event)!.add(callback);

    return () => {
      const eventListeners = listeners.current.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
      }
    };
  }, []);

  const off = useCallback((event: string, callback: (data: any) => void) => {
    const eventListeners = listeners.current.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }, []);

  return {
    isConnected,
    lastEvent,
    on,
    off,
  };
}
