import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { authRoutes } from "./routes/auth";
import { locationRoutes } from "./routes/locations";
import { bookingRoutes } from "./routes/bookings";
import { driverRoutes } from "./routes/driver";
import { adminRoutes } from "./routes/admin";
import { AppError, errorResponse } from "./utils/errors";
import {
  addConnection,
  removeConnection,
  type WebSocketData,
} from "./websocket";
import { jwtPlugin } from "./plugins/jwt";
import type { JWTPayload } from "./utils/auth";

const PORT = process.env.PORT || 3000;

const app = new Elysia()
  .use(jwtPlugin)
  .use(
    cors({
      origin: true,
      credentials: true,
    }),
  )
  .onError(({ error, set }) => {
    if (error instanceof AppError) {
      set.status = error.statusCode;
      return errorResponse(error.code, error.message);
    }

    console.error("Unhandled error:", error);

    set.status = 500;
    return errorResponse("INTERNAL_ERROR", "Internal server error");
  })
  .ws("/ws", {
    body: undefined,
    open(ws) {
      addConnection(ws as any);
    },
    message(ws, message: object) {
      try {
        console.log("Received WebSocket message:", message);
        const data = JSON.parse(message.toString());

        // Handle authentication
        if (data.type === "auth" && data.token) {
          // Verify JWT token
          const payload = (app.decorator.jwt as any).verify(data.token) as
            | JWTPayload
            | false;

          if (payload) {
            // Store verified user info in connection data
            (ws.data as WebSocketData).userId = payload.id;
            (ws.data as WebSocketData).role = payload.role;
            ws.send(JSON.stringify({ type: "auth", status: "authenticated" }));
          } else {
            ws.send(
              JSON.stringify({
                type: "auth",
                status: "failed",
                message: "Invalid token",
              }),
            );
          }
        }
      } catch (error) {
        console.error("Error handling WebSocket message:", error);
        ws.send(
          JSON.stringify({ type: "error", message: "Invalid message format" }),
        );
      }
    },
    close(ws) {
      removeConnection(ws as any);
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
