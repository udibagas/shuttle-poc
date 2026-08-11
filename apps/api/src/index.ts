import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { jwt } from "@elysiajs/jwt";
import { authRoutes } from "./routes/auth";
import { locationRoutes } from "./routes/locations";
import { bookingRoutes } from "./routes/bookings";
import { driverRoutes } from "./routes/driver";
import { adminRoutes } from "./routes/admin";
import { AppError, errorResponse } from "./utils/errors";
import { addConnection, removeConnection } from "./websocket";
import type { ServerWebSocket } from "bun";

const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret-in-production";
const PORT = process.env.PORT || 3000;

interface WebSocketData {
  userId?: string;
  role?: string;
}

const app = new Elysia()
  .use(
    cors({
      origin: true,
      credentials: true,
    }),
  )
  .use(
    jwt({
      name: "jwt",
      secret: JWT_SECRET,
    }),
  )
  .onError(({ code, error, set }) => {
    if (error instanceof AppError) {
      set.status = error.statusCode;
      return errorResponse(error.code, error.message);
    }

    console.error("Unhandled error:", error);

    set.status = 500;
    return errorResponse("INTERNAL_ERROR", "Internal server error");
  })
  .ws("/ws", {
    open(ws: ServerWebSocket<WebSocketData>) {
      addConnection(ws);
    },
    message(ws: ServerWebSocket<WebSocketData>, message: string) {
      try {
        const data = JSON.parse(message);

        // Handle authentication
        if (data.type === "auth" && data.token) {
          // Store user info in connection data
          ws.data.userId = data.userId;
          ws.data.role = data.role;
        }
      } catch (error) {
        console.error("Error handling WebSocket message:", error);
      }
    },
    close(ws: ServerWebSocket<WebSocketData>) {
      removeConnection(ws);
    },
  })
  .get("/", () => ({
    message: "Shuttle POC API",
    version: "1.0.0",
    status: "running",
  }))
  .use(authRoutes)
  .use(locationRoutes)
  .use(bookingRoutes)
  .use(driverRoutes)
  .use(adminRoutes)
  .listen(PORT);

console.log("🚀 Shuttle POC API Server");
console.log(`📡 HTTP Server: http://localhost:${PORT}`);
console.log(`🔌 WebSocket Server: ws://localhost:${PORT}/ws`);
console.log("");
console.log("Available routes:");
console.log("  POST   /auth/login");
console.log("  GET    /auth/me");
console.log("  GET    /locations");
console.log("  POST   /bookings");
console.log("  GET    /bookings");
console.log("  GET    /driver/profile");
console.log("  POST   /driver/status");
console.log("  GET    /driver/bookings/available");
console.log("  POST   /driver/bookings/:id/accept");
console.log("  GET    /admin/dashboard");
console.log("");
console.log("✅ Server started successfully");

export type App = typeof app;
