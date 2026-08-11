import { Elysia, t } from "elysia";
import { prisma } from "../utils/db";
import { successResponse, AppError } from "../utils/errors";
import { requireAuth, requireRole } from "../middleware/auth";
import { UserRole } from "@shuttle/types";
import type {
  CreateLocationRequest,
  UpdateLocationRequest,
} from "@shuttle/types";

export const locationRoutes = (app: Elysia) =>
  app.group("/locations", (app) =>
    app
      .get("/", async () => {
        const locations = await prisma.location.findMany({
          where: { isActive: true },
          orderBy: { code: "asc" },
        });

        return successResponse(locations);
      })
      .get("/:id", async ({ params }) => {
        const location = await prisma.location.findUnique({
          where: { id: params.id },
        });

        if (!location) {
          throw new AppError("LOCATION_NOT_FOUND", "Location not found", 404);
        }

        return successResponse(location);
      })
      .post(
        "/",
        async ({ body, request, jwt }) => {
          const user = requireAuth({ request, jwt } as any);
          requireRole(user, [UserRole.ADMIN]);

          const data = body as CreateLocationRequest;

          const location = await prisma.location.create({
            data: {
              code: data.code,
              name: data.name,
              type: data.type,
              latitude: data.latitude,
              longitude: data.longitude,
              isActive: data.isActive ?? true,
            },
          });

          return successResponse(location);
        },
        {
          body: t.Object({
            code: t.String(),
            name: t.String(),
            type: t.String(),
            latitude: t.Number(),
            longitude: t.Number(),
            isActive: t.Optional(t.Boolean()),
          }),
        },
      )
      .put(
        "/:id",
        async ({ params, body, request, jwt }) => {
          const user = requireAuth({ request, jwt } as any);
          requireRole(user, [UserRole.ADMIN]);

          const data = body as UpdateLocationRequest;

          const location = await prisma.location.update({
            where: { id: params.id },
            data,
          });

          return successResponse(location);
        },
        {
          body: t.Object({
            code: t.Optional(t.String()),
            name: t.Optional(t.String()),
            type: t.Optional(t.String()),
            latitude: t.Optional(t.Number()),
            longitude: t.Optional(t.Number()),
            isActive: t.Optional(t.Boolean()),
          }),
        },
      )
      .delete("/:id", async ({ params, request, jwt }) => {
        const user = requireAuth({ request, jwt } as any);
        requireRole(user, [UserRole.ADMIN]);

        await prisma.location.delete({
          where: { id: params.id },
        });

        return successResponse({ message: "Location deleted successfully" });
      }),
  );
