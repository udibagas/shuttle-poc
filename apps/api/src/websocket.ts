import type { WebSocketEvent } from "@shuttle/types";

export interface WebSocketData {
  userId?: string;
  role?: string;
}

// Generic WebSocket interface that works with both Bun and Elysia
interface WSConnection {
  data: WebSocketData;
  send(message: string): void;
}

const connections = new Set<WSConnection>();

export function addConnection(ws: WSConnection) {
  connections.add(ws);
  console.log(`WebSocket connected. Total connections: ${connections.size}`);
}

export function removeConnection(ws: WSConnection) {
  connections.delete(ws);
  console.log(`WebSocket disconnected. Total connections: ${connections.size}`);
}

export function broadcastEvent(event: string, data: any) {
  const message: WebSocketEvent = {
    event: event as any,
    data,
  };

  const payload = JSON.stringify(message);

  connections.forEach((ws) => {
    try {
      ws.send(payload);
    } catch (error) {
      console.error("Error sending WebSocket message:", error);
    }
  });

  console.log(`Broadcasted event: ${event} to ${connections.size} clients`);
}

export function sendToUser(userId: string, event: string, data: any) {
  const message: WebSocketEvent = {
    event: event as any,
    data,
  };

  const payload = JSON.stringify(message);

  connections.forEach((ws) => {
    if (ws.data.userId === userId) {
      try {
        ws.send(payload);
      } catch (error) {
        console.error("Error sending WebSocket message:", error);
      }
    }
  });
}
