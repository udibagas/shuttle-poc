import type { ServerWebSocket } from "bun";
import type { WebSocketEvent } from "@shuttle/types";

interface WebSocketData {
  userId?: string;
  role?: string;
}

const connections = new Set<ServerWebSocket<WebSocketData>>();

export function addConnection(ws: ServerWebSocket<WebSocketData>) {
  connections.add(ws);
  console.log(`WebSocket connected. Total connections: ${connections.size}`);
}

export function removeConnection(ws: ServerWebSocket<WebSocketData>) {
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
