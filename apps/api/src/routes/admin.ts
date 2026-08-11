import { Elysia } from "elysia";
import { prisma } from "../utils/db";
import { successResponse } from "../utils/errors";
import { requireAuth, requireRole } from "../middleware/auth";
import { UserRole, BookingStatus, DriverStatus } from "@shuttle/types";
import { jwtPlugin } from "../plugins/jwt";

export const adminRoutes = (app: Elysia) =>
  app.use(jwtPlugin).group("/admin", (app) =>
    app
      .get("/dashboard", async ({ request, jwt }) => {
        const user = await requireAuth({ request, jwt } as any);
        requireRole(user, [UserRole.ADMIN]);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
          activeDrivers,
          pendingRequests,
          activeTrips,
          completedToday,
          cancelledToday,
        ] = await Promise.all([
          prisma.driver.count({
            where: {
              status: {
                in: [DriverStatus.ONLINE, DriverStatus.BUSY],
              },
            },
          }),
          prisma.booking.count({
            where: {
              status: BookingStatus.PENDING,
            },
          }),
          prisma.booking.count({
            where: {
              status: {
                in: [
                  BookingStatus.ASSIGNED,
                  BookingStatus.DRIVER_ARRIVED,
                  BookingStatus.IN_PROGRESS,
                ],
              },
            },
          }),
          prisma.booking.count({
            where: {
              status: BookingStatus.COMPLETED,
              completedAt: {
                gte: today,
              },
            },
          }),
          prisma.booking.count({
            where: {
              status: BookingStatus.CANCELLED,
              cancelledAt: {
                gte: today,
              },
            },
          }),
        ]);

        return successResponse({
          activeDrivers,
          pendingRequests,
          activeTrips,
          completedToday,
          cancelledToday,
        });
      })
      .get("/bookings", async ({ request, jwt }) => {
        const user = await requireAuth({ request, jwt } as any);
        requireRole(user, [UserRole.ADMIN]);

        const bookings = await prisma.booking.findMany({
          include: {
            user: true,
            driver: {
              include: {
                user: true,
                vehicle: true,
              },
            },
            pickupLocation: true,
            destinationLocation: true,
          },
          orderBy: { requestedAt: "desc" },
          take: 100,
        });

        return successResponse(bookings);
      })
      .get("/drivers", async ({ request, jwt }) => {
        const user = await requireAuth({ request, jwt } as any);
        requireRole(user, [UserRole.ADMIN]);

        const drivers = await prisma.driver.findMany({
          include: {
            user: true,
            vehicle: true,
            bookings: {
              where: {
                status: {
                  in: [
                    BookingStatus.ASSIGNED,
                    BookingStatus.DRIVER_ARRIVED,
                    BookingStatus.IN_PROGRESS,
                  ],
                },
              },
              include: {
                pickupLocation: true,
                destinationLocation: true,
              },
            },
          },
          orderBy: {
            user: {
              name: "asc",
            },
          },
        });

        return successResponse(drivers);
      })
      .get("/users", async ({ request, jwt }) => {
        const user = await requireAuth({ request, jwt } as any);
        requireRole(user, [UserRole.ADMIN]);

        const users = await prisma.user.findMany({
          where: {
            role: UserRole.USER,
          },
          orderBy: {
            name: "asc",
          },
        });

        return successResponse(users);
      })
      .get("/vehicles", async ({ request, jwt }) => {
        const user = await requireAuth({ request, jwt } as any);
        requireRole(user, [UserRole.ADMIN]);

        const vehicles = await prisma.vehicle.findMany({
          include: {
            drivers: {
              include: {
                user: true,
              },
            },
          },
          orderBy: {
            plateNumber: "asc",
          },
        });

        return successResponse(vehicles);
      }),
  );
