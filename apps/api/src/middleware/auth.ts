import { Context } from "elysia";
import { UserRole } from "@shuttle/types";
import { JWTPayload } from "../utils/auth";
import { AppError } from "../utils/errors";

export interface AuthContext extends Context {
  user: JWTPayload;
}

export function requireAuth(context: Context & { jwt: any }): JWTPayload {
  const authHeader = context.request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("UNAUTHORIZED", "Authorization token required", 401);
  }

  const token = authHeader.substring(7);

  try {
    const payload = context.jwt.verify(token) as JWTPayload | false;

    if (!payload) {
      throw new AppError("INVALID_TOKEN", "Invalid or expired token", 401);
    }

    return payload;
  } catch (error) {
    throw new AppError("INVALID_TOKEN", "Invalid or expired token", 401);
  }
}

export function requireRole(user: JWTPayload, allowedRoles: UserRole[]): void {
  if (!allowedRoles.includes(user.role)) {
    throw new AppError("FORBIDDEN", "Insufficient permissions", 403);
  }
}
