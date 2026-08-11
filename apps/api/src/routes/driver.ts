import { Elysia, t } from "elysia";
import { prisma } from "../utils/db";
import { successResponse, AppError } from "../utils/errors";
import { requireAuth, requireRole } from "../middleware/auth";
import {
  UserRole,
  BookingStatus,
  DriverStatus,
  BookingDriverAttemptStatus,
} from "@shuttle/types";
import { broadcastEvent } from "../websocket";
import { jwtPlugin } from "../plugins/jwt";

export const driverRoutes = (app: Elysia) =>
  app.use(jwtPlugin).group("/driver", (app) =>
    app
      .get("/profile", async ({ request, jwt }) => {
        const user = await requireAuth({ request, jwt } as any);
        requireRole(user, [UserRole.DRIVER]);

        const driver = await prisma.driver.findUnique({
          where: { userId: user.id },
          include: {
            user: true,
            vehicle: true,
          },
        });

        if (!driver) {
          throw new AppError(
            "DRIVER_NOT_FOUND",
            "Driver profile not found",
            404,
          );
        }

        return successResponse(driver);
      })
      .post(
        "/status",
        async ({ body, request, jwt }) => {
          const user = await requireAuth({ request, jwt } as any);
          requireRole(user, [UserRole.DRIVER]);

          const { status } = body as { status: DriverStatus };

          const driver = await prisma.driver.update({
            where: { userId: user.id },
            data: { status },
          });

          broadcastEvent("driver.status_changed", {
            driverId: driver.id,
            status: driver.status,
          });

          return successResponse(driver);
        },
        {
          body: t.Object({
            status: t.String(),
          }),
        },
      )
      .get("/bookings/available", async ({ request, jwt }) => {
        const user = await requireAuth({ request, jwt } as any);
        requireRole(user, [UserRole.DRIVER]);

        // Get pending bookings
        const bookings = await prisma.booking.findMany({
          where: {
            status: BookingStatus.PENDING,
          },
          include: {
            user: true,
            pickupLocation: true,
            destinationLocation: true,
          },
          orderBy: { requestedAt: "asc" },
        });

        return successResponse(bookings);
      })
      .post("/bookings/:id/accept", async ({ params, request, jwt }) => {
        const user = await requireAuth({ request, jwt } as any);
        requireRole(user, [UserRole.DRIVER]);

        const driver = await prisma.driver.findUnique({
          where: { userId: user.id },
        });

        if (!driver) {
          throw new AppError(
            "DRIVER_NOT_FOUND",
            "Driver profile not found",
            404,
          );
        }

        // Check driver is online
        if (driver.status !== DriverStatus.ONLINE) {
          throw new AppError(
            "DRIVER_UNAVAILABLE",
            "Driver must be online to accept bookings",
          );
        }

        // Use transaction to prevent race conditions
        const result = await prisma.$transaction(async (tx) => {
          // Check booking is still pending
          const booking = await tx.booking.findUnique({
            where: { id: params.id },
          });

          if (!booking) {
            throw new AppError("BOOKING_NOT_FOUND", "Booking not found", 404);
          }

          if (booking.status !== BookingStatus.PENDING) {
            throw new AppError(
              "BOOKING_ALREADY_ASSIGNED",
              "This booking has already been assigned",
            );
          }

          // Create driver attempt record
          await tx.bookingDriverAttempt.create({
            data: {
              bookingId: booking.id,
              driverId: driver.id,
              status: BookingDriverAttemptStatus.ACCEPTED,
              respondedAt: new Date(),
            },
          });

          // Update booking
          const updatedBooking = await tx.booking.update({
            where: { id: params.id },
            data: {
              status: BookingStatus.ASSIGNED,
              driverId: driver.id,
              assignedAt: new Date(),
            },
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
          });

          // Update driver status to BUSY
          await tx.driver.update({
            where: { id: driver.id },
            data: { status: DriverStatus.BUSY },
          });

          return updatedBooking;
        });

        broadcastEvent("booking.assigned", {
          bookingId: result.id,
          bookingNumber: result.bookingNumber,
          driver: result.driver,
        });

        return successResponse(result);
      })
      .post("/bookings/:id/reject", async ({ params, request, jwt }) => {
        const user = await requireAuth({ request, jwt } as any);
        requireRole(user, [UserRole.DRIVER]);

        const driver = await prisma.driver.findUnique({
          where: { userId: user.id },
        });

        if (!driver) {
          throw new AppError(
            "DRIVER_NOT_FOUND",
            "Driver profile not found",
            404,
          );
        }

        const booking = await prisma.booking.findUnique({
          where: { id: params.id },
        });

        if (!booking) {
          throw new AppError("BOOKING_NOT_FOUND", "Booking not found", 404);
        }

        if (booking.status !== BookingStatus.PENDING) {
          throw new AppError(
            "INVALID_STATE",
            "Can only reject pending bookings",
          );
        }

        // Create rejection record
        await prisma.bookingDriverAttempt.create({
          data: {
            bookingId: booking.id,
            driverId: driver.id,
            status: BookingDriverAttemptStatus.REJECTED,
            respondedAt: new Date(),
          },
        });

        return successResponse({ message: "Booking rejected successfully" });
      })
      .post("/bookings/:id/arrived", async ({ params, request, jwt }) => {
        const user = await requireAuth({ request, jwt } as any);
        requireRole(user, [UserRole.DRIVER]);

        const driver = await prisma.driver.findUnique({
          where: { userId: user.id },
        });

        if (!driver) {
          throw new AppError(
            "DRIVER_NOT_FOUND",
            "Driver profile not found",
            404,
          );
        }

        const booking = await prisma.booking.findUnique({
          where: { id: params.id },
        });

        if (!booking) {
          throw new AppError("BOOKING_NOT_FOUND", "Booking not found", 404);
        }

        if (booking.driverId !== driver.id) {
          throw new AppError(
            "FORBIDDEN",
            "This booking is not assigned to you",
            403,
          );
        }

        if (booking.status !== BookingStatus.ASSIGNED) {
          throw new AppError(
            "INVALID_STATE",
            "Can only mark arrived for assigned bookings",
          );
        }

        const updatedBooking = await prisma.booking.update({
          where: { id: params.id },
          data: {
            status: BookingStatus.DRIVER_ARRIVED,
            driverArrivedAt: new Date(),
          },
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
        });

        broadcastEvent("booking.driver_arrived", {
          bookingId: updatedBooking.id,
          bookingNumber: updatedBooking.bookingNumber,
        });

        return successResponse(updatedBooking);
      })
      .post("/bookings/:id/start", async ({ params, request, jwt }) => {
        const user = await requireAuth({ request, jwt } as any);
        requireRole(user, [UserRole.DRIVER]);

        const driver = await prisma.driver.findUnique({
          where: { userId: user.id },
        });

        if (!driver) {
          throw new AppError(
            "DRIVER_NOT_FOUND",
            "Driver profile not found",
            404,
          );
        }

        const booking = await prisma.booking.findUnique({
          where: { id: params.id },
        });

        if (!booking) {
          throw new AppError("BOOKING_NOT_FOUND", "Booking not found", 404);
        }

        if (booking.driverId !== driver.id) {
          throw new AppError(
            "FORBIDDEN",
            "This booking is not assigned to you",
            403,
          );
        }

        if (booking.status !== BookingStatus.DRIVER_ARRIVED) {
          throw new AppError(
            "INVALID_STATE",
            "Can only start trip after driver has arrived",
          );
        }

        const updatedBooking = await prisma.booking.update({
          where: { id: params.id },
          data: {
            status: BookingStatus.IN_PROGRESS,
            startedAt: new Date(),
          },
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
        });

        broadcastEvent("booking.started", {
          bookingId: updatedBooking.id,
          bookingNumber: updatedBooking.bookingNumber,
        });

        return successResponse(updatedBooking);
      })
      .post("/bookings/:id/complete", async ({ params, request, jwt }) => {
        const user = await requireAuth({ request, jwt } as any);
        requireRole(user, [UserRole.DRIVER]);

        const driver = await prisma.driver.findUnique({
          where: { userId: user.id },
        });

        if (!driver) {
          throw new AppError(
            "DRIVER_NOT_FOUND",
            "Driver profile not found",
            404,
          );
        }

        const booking = await prisma.booking.findUnique({
          where: { id: params.id },
        });

        if (!booking) {
          throw new AppError("BOOKING_NOT_FOUND", "Booking not found", 404);
        }

        if (booking.driverId !== driver.id) {
          throw new AppError(
            "FORBIDDEN",
            "This booking is not assigned to you",
            403,
          );
        }

        if (booking.status !== BookingStatus.IN_PROGRESS) {
          throw new AppError(
            "INVALID_STATE",
            "Can only complete in-progress trips",
          );
        }

        const result = await prisma.$transaction(async (tx) => {
          const updatedBooking = await tx.booking.update({
            where: { id: params.id },
            data: {
              status: BookingStatus.COMPLETED,
              completedAt: new Date(),
            },
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
          });

          // Set driver back to ONLINE
          await tx.driver.update({
            where: { id: driver.id },
            data: { status: DriverStatus.ONLINE },
          });

          return updatedBooking;
        });

        broadcastEvent("booking.completed", {
          bookingId: result.id,
          bookingNumber: result.bookingNumber,
        });

        return successResponse(result);
      }),
  );
