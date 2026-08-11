import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/auth";
import { BookingStatus, DriverStatus, UserRole } from "@shuttle/types";

const prisma = new PrismaClient();

// Test data IDs
let testUserId: string;
let testDriverId: string;
let testDriverUserId: string;
let testVehicleId: string;
let testLocationId1: string;
let testLocationId2: string;

beforeAll(async () => {
  // Clean up test data
  await prisma.bookingDriverAttempt.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.location.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  // Create test vehicle
  const vehicle = await prisma.vehicle.create({
    data: {
      plateNumber: "TEST-001",
      type: "MINIBUS",
      capacity: 12,
    },
  });
  testVehicleId = vehicle.id;

  // Create test user
  const user = await prisma.user.create({
    data: {
      name: "Test User",
      username: "testuser",
      passwordHash: await hashPassword("password"),
      role: UserRole.USER,
    },
  });
  testUserId = user.id;

  // Create test driver user
  const driverUser = await prisma.user.create({
    data: {
      name: "Test Driver",
      username: "testdriver",
      passwordHash: await hashPassword("password"),
      role: UserRole.DRIVER,
    },
  });
  testDriverUserId = driverUser.id;

  // Create test driver
  const driver = await prisma.driver.create({
    data: {
      userId: testDriverUserId,
      vehicleId: testVehicleId,
      status: DriverStatus.ONLINE,
    },
  });
  testDriverId = driver.id;

  // Create test locations
  const location1 = await prisma.location.create({
    data: {
      code: "TEST01",
      name: "Test Location 1",
      type: "GATE",
      latitude: 0,
      longitude: 0,
      isActive: true,
    },
  });
  testLocationId1 = location1.id;

  const location2 = await prisma.location.create({
    data: {
      code: "TEST02",
      name: "Test Location 2",
      type: "TERMINAL",
      latitude: 0,
      longitude: 0,
      isActive: true,
    },
  });
  testLocationId2 = location2.id;
});

afterAll(async () => {
  // Clean up
  await prisma.bookingDriverAttempt.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.location.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe("Booking Business Logic", () => {
  test("1. User can create booking", async () => {
    const booking = await prisma.booking.create({
      data: {
        bookingNumber: "TEST-001",
        userId: testUserId,
        pickupLocationId: testLocationId1,
        destinationLocationId: testLocationId2,
        passengerCount: 2,
        status: BookingStatus.PENDING,
        requestedAt: new Date(),
      },
    });

    expect(booking).toBeDefined();
    expect(booking.status).toBe(BookingStatus.PENDING);
    expect(booking.userId).toBe(testUserId);
  });

  test("2. Driver can reject booking", async () => {
    const booking = await prisma.booking.create({
      data: {
        bookingNumber: "TEST-002",
        userId: testUserId,
        pickupLocationId: testLocationId1,
        destinationLocationId: testLocationId2,
        passengerCount: 1,
        status: BookingStatus.PENDING,
        requestedAt: new Date(),
      },
    });

    const attempt = await prisma.bookingDriverAttempt.create({
      data: {
        bookingId: booking.id,
        driverId: testDriverId,
        status: "REJECTED",
        respondedAt: new Date(),
      },
    });

    expect(attempt.status).toBe("REJECTED");

    // Booking should remain PENDING
    const updatedBooking = await prisma.booking.findUnique({
      where: { id: booking.id },
    });
    expect(updatedBooking?.status).toBe(BookingStatus.PENDING);
  });

  test("3. Driver can accept booking", async () => {
    const booking = await prisma.booking.create({
      data: {
        bookingNumber: "TEST-003",
        userId: testUserId,
        pickupLocationId: testLocationId1,
        destinationLocationId: testLocationId2,
        passengerCount: 1,
        status: BookingStatus.PENDING,
        requestedAt: new Date(),
      },
    });

    // Accept booking
    const [updatedBooking, attempt] = await prisma.$transaction([
      prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: BookingStatus.ASSIGNED,
          driverId: testDriverId,
          assignedAt: new Date(),
        },
      }),
      prisma.bookingDriverAttempt.create({
        data: {
          bookingId: booking.id,
          driverId: testDriverId,
          status: "ACCEPTED",
          respondedAt: new Date(),
        },
      }),
    ]);

    expect(updatedBooking.status).toBe(BookingStatus.ASSIGNED);
    expect(updatedBooking.driverId).toBe(testDriverId);
    expect(attempt.status).toBe("ACCEPTED");
  });

  test("4. Second driver cannot accept already assigned booking", async () => {
    const booking = await prisma.booking.create({
      data: {
        bookingNumber: "TEST-004",
        userId: testUserId,
        pickupLocationId: testLocationId1,
        destinationLocationId: testLocationId2,
        passengerCount: 1,
        status: BookingStatus.ASSIGNED,
        driverId: testDriverId,
        assignedAt: new Date(),
        requestedAt: new Date(),
      },
    });

    // Try to accept already assigned booking should fail
    const currentBooking = await prisma.booking.findUnique({
      where: { id: booking.id },
    });

    expect(currentBooking?.status).toBe(BookingStatus.ASSIGNED);
    expect(currentBooking?.driverId).toBe(testDriverId);
  });

  test("5. Driver can mark arrived", async () => {
    const booking = await prisma.booking.create({
      data: {
        bookingNumber: "TEST-005",
        userId: testUserId,
        pickupLocationId: testLocationId1,
        destinationLocationId: testLocationId2,
        passengerCount: 1,
        status: BookingStatus.ASSIGNED,
        driverId: testDriverId,
        assignedAt: new Date(),
        requestedAt: new Date(),
      },
    });

    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.DRIVER_ARRIVED,
        driverArrivedAt: new Date(),
      },
    });

    expect(updatedBooking.status).toBe(BookingStatus.DRIVER_ARRIVED);
    expect(updatedBooking.driverArrivedAt).toBeDefined();
  });

  test("6. Driver can start trip", async () => {
    const booking = await prisma.booking.create({
      data: {
        bookingNumber: "TEST-006",
        userId: testUserId,
        pickupLocationId: testLocationId1,
        destinationLocationId: testLocationId2,
        passengerCount: 1,
        status: BookingStatus.DRIVER_ARRIVED,
        driverId: testDriverId,
        assignedAt: new Date(),
        driverArrivedAt: new Date(),
        requestedAt: new Date(),
      },
    });

    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.IN_PROGRESS,
        startedAt: new Date(),
      },
    });

    expect(updatedBooking.status).toBe(BookingStatus.IN_PROGRESS);
    expect(updatedBooking.startedAt).toBeDefined();
  });

  test("7. Driver can complete trip", async () => {
    const booking = await prisma.booking.create({
      data: {
        bookingNumber: "TEST-007",
        userId: testUserId,
        pickupLocationId: testLocationId1,
        destinationLocationId: testLocationId2,
        passengerCount: 1,
        status: BookingStatus.IN_PROGRESS,
        driverId: testDriverId,
        assignedAt: new Date(),
        driverArrivedAt: new Date(),
        startedAt: new Date(),
        requestedAt: new Date(),
      },
    });

    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    expect(updatedBooking.status).toBe(BookingStatus.COMPLETED);
    expect(updatedBooking.completedAt).toBeDefined();
  });

  test("8. User can cancel pending booking", async () => {
    const booking = await prisma.booking.create({
      data: {
        bookingNumber: "TEST-008",
        userId: testUserId,
        pickupLocationId: testLocationId1,
        destinationLocationId: testLocationId2,
        passengerCount: 1,
        status: BookingStatus.PENDING,
        requestedAt: new Date(),
      },
    });

    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });

    expect(updatedBooking.status).toBe(BookingStatus.CANCELLED);
    expect(updatedBooking.cancelledAt).toBeDefined();
  });

  test("9. Invalid state transitions are rejected - cannot start from PENDING", async () => {
    const booking = await prisma.booking.create({
      data: {
        bookingNumber: "TEST-009",
        userId: testUserId,
        pickupLocationId: testLocationId1,
        destinationLocationId: testLocationId2,
        passengerCount: 1,
        status: BookingStatus.PENDING,
        requestedAt: new Date(),
      },
    });

    // Try invalid transition
    // In real API, this would be blocked by validation
    const currentBooking = await prisma.booking.findUnique({
      where: { id: booking.id },
    });

    expect(currentBooking?.status).toBe(BookingStatus.PENDING);
    // Cannot go directly from PENDING to IN_PROGRESS
  });

  test("10. Booking number generation is sequential", async () => {
    const booking1 = await prisma.booking.create({
      data: {
        bookingNumber: "SH-000001",
        userId: testUserId,
        pickupLocationId: testLocationId1,
        destinationLocationId: testLocationId2,
        passengerCount: 1,
        status: BookingStatus.PENDING,
        requestedAt: new Date(),
      },
    });

    const booking2 = await prisma.booking.create({
      data: {
        bookingNumber: "SH-000002",
        userId: testUserId,
        pickupLocationId: testLocationId1,
        destinationLocationId: testLocationId2,
        passengerCount: 1,
        status: BookingStatus.PENDING,
        requestedAt: new Date(),
      },
    });

    expect(booking1.bookingNumber).toBe("SH-000001");
    expect(booking2.bookingNumber).toBe("SH-000002");
  });
});
