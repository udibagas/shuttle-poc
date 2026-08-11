import { Elysia, t } from "elysia";
import { prisma } from "../utils/db";
import { verifyPassword } from "../utils/auth";
import { AppError, successResponse } from "../utils/errors";
import { requireAuth } from "../middleware/auth";
import type { LoginRequest } from "@shuttle/types";
import { jwtPlugin } from "../plugins/jwt";

export const authRoutes = (app: Elysia) =>
  app.use(jwtPlugin).group("/auth", (app) =>
    app
      .post(
        "/login",
        async ({ body, jwt }) => {
          const { username, password } = body as LoginRequest;

          const user = await prisma.user.findUnique({
            where: { username },
          });

          if (!user) {
            throw new AppError(
              "INVALID_CREDENTIALS",
              "Invalid username or password",
              401,
            );
          }

          const isValidPassword = await verifyPassword(
            password,
            user.passwordHash,
          );

          if (!isValidPassword) {
            throw new AppError(
              "INVALID_CREDENTIALS",
              "Invalid username or password",
              401,
            );
          }

          const token = await jwt.sign({
            id: user.id,
            username: user.username,
            role: user.role,
          });

          return successResponse({
            token,
            user: {
              id: user.id,
              name: user.name,
              username: user.username,
              role: user.role,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
            },
          });
        },
        {
          body: t.Object({
            username: t.String(),
            password: t.String(),
          }),
        },
      )
      .get("/me", async ({ request, jwt }) => {
        const user = await requireAuth({ request, jwt } as any);

        return successResponse(user);
      }),
  );
