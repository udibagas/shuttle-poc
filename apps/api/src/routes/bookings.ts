import { Elysia, t } from "elysia";
import { prisma } from "../utils/db";
import { successResponse, AppError } from "../utils/errors";
import { requireAuth, requireRole } from "../middleware/auth";
import { generateBookingNumber } from "../utils/booking";
import { UserRole, BookingStatus } from "@shuttle/types";
import type { CreateBookingRequest } from "@shuttle/types";
import { broadcastEvent } from "../websocket";
import { jwtPlugin } from "../plugins/jwt";

export const bookingRoutes = (app: Elysia) =>
  app.use(jwtPlugin).group("/bookings", (app) =>
    app
      .post(
        "/",
        async ({ body, request, jwt }) => {
          const user = requireAuth({ request, jwt } as any);
          requireRole(user, [UserRole.USER]);

          const data = body as CreateBookingRequest;

          // Validation: pickup and destination must be different
          if (data.pickupLocationId === data.destinationLocationId) {
            throw new AppError(
              "INVALID_BOOKING",
              "Pickup and destination locations must be different",
            );
          }

          // Validate locations exist
          const [pickupLocation, destinationLocation] = await Promise.all([
            prisma.location.findUnique({
              where: { id: data.pickupLocationId },
            }),
            prisma.location.findUnique({
              where: { id: data.destinationLocationId },
            }),
          ]);

          if (!pickupLocation || !destinationLocation) {
            throw new AppError(
              "INVALID_LOCATION",
              "Invalid pickup or destination location",
            );
          }

          // Validate passenger count
          if (data.passengerCount < 1) {
            throw new AppError(
              "INVALID_PASSENGER_COUNT",
              "Passenger count must be at least 1",
            );
          }

          // Generate booking number
          const bookingNumber = await generateBookingNumber();

          // Create booking
          const booking = await prisma.booking.create({
            data: {
              bookingNumber,
              userId: user.id,
              pickupLocationId: data.pickupLocationId,
              destinationLocationId: data.destinationLocationId,
              passengerCount: data.passengerCount,
              notes: data.notes || null,
              status: BookingStatus.PENDING,
              requestedAt: new Date(),
            },
            include: {
              user: true,
              pickupLocation: true,
              destinationLocation: true,
            },
          });

          // Broadcast to online drivers
          broadcastEvent("booking.created", {
            bookingId: booking.id,
            bookingNumber: booking.bookingNumber,
            pickupLocation: booking.pickupLocation,
            destinationLocation: booking.destinationLocation,
            passengerCount: booking.passengerCount,
          });

          return successResponse(booking);
        },
        {
          body: t.Object({
            pickupLocationId: t.String(),
            destinationLocationId: t.String(),
            passengerCount: t.Number(),
            notes: t.Optional(t.String()),
          }),
        },
      )
      .get("/", async ({ request, jwt, query }) => {
        const user = requireAuth({ request, jwt } as any);

        let whereClause: any = {};

        if (user.role === UserRole.USER) {
          whereClause.userId = user.id;
        } else if (user.role === UserRole.DRIVER) {
          const driver = await prisma.driver.findUnique({
            where: { userId: user.id },
          });
          if (driver) {
            whereClause.driverId = driver.id;
          }
        }

        const bookings = await prisma.booking.findMany({
          where: whereClause,
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
        });

        return successResponse(bookings);
      })
      .get("/:id", async ({ params, request, jwt }) => {
        const user = requireAuth({ request, jwt } as any);

        const booking = await prisma.booking.findUnique({
          where: { id: params.id },
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

        if (!booking) {
          throw new AppError("BOOKING_NOT_FOUND", "Booking not found", 404);
        }

        // Authorization check
        if (user.role === UserRole.USER && booking.userId !== user.id) {
          throw new AppError(
            "FORBIDDEN",
            "You do not have access to this booking",
            403,
          );
        }

        if (user.role === UserRole.DRIVER) {
          const driver = await prisma.driver.findUnique({
            where: { userId: user.id },
          });
          if (driver && booking.driverId !== driver.id) {
            throw new AppError(
              "FORBIDDEN",
              "You do not have access to this booking",
              403,
            );
          }
        }

        return successResponse(booking);
      })
      .post("/:id/cancel", async ({ params, request, jwt }) => {
        const user = requireAuth({ request, jwt } as any);
        requireRole(user, [UserRole.USER]);

        const booking = await prisma.booking.findUnique({
          where: { id: params.id },
        });

        if (!booking) {
          throw new AppError("BOOKING_NOT_FOUND", "Booking not found", 404);
        }

        if (booking.userId !== user.id) {
          throw new AppError(
            "FORBIDDEN",
            "You can only cancel your own bookings",
            403,
          );
        }

        if (booking.status !== BookingStatus.PENDING) {
          throw new AppError(
            "INVALID_STATE",
            "Only pending bookings can be cancelled",
          );
        }

        const updatedBooking = await prisma.booking.update({
          where: { id: params.id },
          data: {
            status: BookingStatus.CANCELLED,
            cancelledAt: new Date(),
          },
          include: {
            user: true,
            pickupLocation: true,
            destinationLocation: true,
          },
        });

        broadcastEvent("booking.cancelled", {
          bookingId: updatedBooking.id,
          bookingNumber: updatedBooking.bookingNumber,
        });

        return successResponse(updatedBooking);
      }),
  );
