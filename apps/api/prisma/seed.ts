import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  UserRole,
  DriverStatus,
  VehicleType,
  LocationType,
} from "./generated/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// WARNING: These are DEMO CREDENTIALS for POC purposes only
// DO NOT use these credentials in production
const DEMO_PASSWORD_HASH = await Bun.password.hash("password", {
  algorithm: "bcrypt",
  cost: 10,
});

async function main() {
  console.log("🌱 Starting seed...");

  // Clean existing data
  console.log("🧹 Cleaning existing data...");
  await prisma.bookingDriverAttempt.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.location.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  // Create Vehicles
  console.log("🚐 Creating vehicles...");
  const vehicles = await Promise.all([
    prisma.vehicle.create({
      data: {
        plateNumber: "B 1234 XYZ",
        type: VehicleType.MINIBUS,
        capacity: 12,
      },
    }),
    prisma.vehicle.create({
      data: {
        plateNumber: "B 5678 XYZ",
        type: VehicleType.VAN,
        capacity: 7,
      },
    }),
    prisma.vehicle.create({
      data: {
        plateNumber: "B 9012 XYZ",
        type: VehicleType.MINIBUS,
        capacity: 12,
      },
    }),
  ]);

  // Create Admin User
  console.log("👤 Creating admin user...");
  const adminUser = await prisma.user.create({
    data: {
      name: "Administrator",
      username: "admin",
      passwordHash: DEMO_PASSWORD_HASH,
      role: UserRole.ADMIN,
    },
  });

  // Create Regular Users
  console.log("👥 Creating regular users...");
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: "Budi Santoso",
        username: "user01",
        passwordHash: DEMO_PASSWORD_HASH,
        role: UserRole.USER,
      },
    }),
    prisma.user.create({
      data: {
        name: "Siti Aminah",
        username: "user02",
        passwordHash: DEMO_PASSWORD_HASH,
        role: UserRole.USER,
      },
    }),
    prisma.user.create({
      data: {
        name: "Rudi Hermawan",
        username: "user03",
        passwordHash: DEMO_PASSWORD_HASH,
        role: UserRole.USER,
      },
    }),
  ]);

  // Create Driver Users and Drivers
  console.log("🚗 Creating drivers...");
  const driverUser1 = await prisma.user.create({
    data: {
      name: "Ahmad Supardi",
      username: "driver01",
      passwordHash: DEMO_PASSWORD_HASH,
      role: UserRole.DRIVER,
    },
  });

  const driver1 = await prisma.driver.create({
    data: {
      userId: driverUser1.id,
      vehicleId: vehicles[0].id,
      status: DriverStatus.ONLINE,
    },
  });

  const driverUser2 = await prisma.user.create({
    data: {
      name: "Joko Widodo",
      username: "driver02",
      passwordHash: DEMO_PASSWORD_HASH,
      role: UserRole.DRIVER,
    },
  });

  const driver2 = await prisma.driver.create({
    data: {
      userId: driverUser2.id,
      vehicleId: vehicles[1].id,
      status: DriverStatus.OFFLINE,
    },
  });

  const driverUser3 = await prisma.user.create({
    data: {
      name: "Agus Setiawan",
      username: "driver03",
      passwordHash: DEMO_PASSWORD_HASH,
      role: UserRole.DRIVER,
    },
  });

  const driver3 = await prisma.driver.create({
    data: {
      userId: driverUser3.id,
      vehicleId: vehicles[2].id,
      status: DriverStatus.ONLINE,
    },
  });

  // Create Locations
  console.log("📍 Creating locations...");
  const locations = await Promise.all([
    prisma.location.create({
      data: {
        code: "G001",
        name: "Gate 1 - Main Entrance",
        type: LocationType.GATE,
        latitude: -6.115,
        longitude: 106.885,
        isActive: true,
      },
    }),
    prisma.location.create({
      data: {
        code: "G002",
        name: "Gate 2 - East Entrance",
        type: LocationType.GATE,
        latitude: -6.116,
        longitude: 106.886,
        isActive: true,
      },
    }),
    prisma.location.create({
      data: {
        code: "T001",
        name: "Terminal A - Container Terminal",
        type: LocationType.TERMINAL,
        latitude: -6.114,
        longitude: 106.884,
        isActive: true,
      },
    }),
    prisma.location.create({
      data: {
        code: "T002",
        name: "Terminal B - Bulk Terminal",
        type: LocationType.TERMINAL,
        latitude: -6.113,
        longitude: 106.883,
        isActive: true,
      },
    }),
    prisma.location.create({
      data: {
        code: "WH01",
        name: "Warehouse A - Dry Cargo",
        type: LocationType.WAREHOUSE,
        latitude: -6.117,
        longitude: 106.887,
        isActive: true,
      },
    }),
    prisma.location.create({
      data: {
        code: "WH02",
        name: "Warehouse B - Cold Storage",
        type: LocationType.WAREHOUSE,
        latitude: -6.118,
        longitude: 106.888,
        isActive: true,
      },
    }),
    prisma.location.create({
      data: {
        code: "WS01",
        name: "Workshop - Vehicle Maintenance",
        type: LocationType.WORKSHOP,
        latitude: -6.119,
        longitude: 106.889,
        isActive: true,
      },
    }),
    prisma.location.create({
      data: {
        code: "OF01",
        name: "Main Office - Administration",
        type: LocationType.OFFICE,
        latitude: -6.112,
        longitude: 106.882,
        isActive: true,
      },
    }),
    prisma.location.create({
      data: {
        code: "OF02",
        name: "Operations Office",
        type: LocationType.OFFICE,
        latitude: -6.1125,
        longitude: 106.8825,
        isActive: true,
      },
    }),
  ]);

  console.log("✅ Seed completed successfully!");
  console.log("");
  console.log("📋 Demo Credentials (DO NOT USE IN PRODUCTION):");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Admin:");
  console.log("  Username: admin");
  console.log("  Password: password");
  console.log("");
  console.log("Users:");
  console.log("  Username: user01 / Password: password");
  console.log("  Username: user02 / Password: password");
  console.log("  Username: user03 / Password: password");
  console.log("");
  console.log("Drivers:");
  console.log("  Username: driver01 / Password: password (ONLINE)");
  console.log("  Username: driver02 / Password: password (OFFLINE)");
  console.log("  Username: driver03 / Password: password (ONLINE)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");
  console.log(`Created:`);
  console.log(`  - ${vehicles.length} vehicles`);
  console.log(`  - 1 admin user`);
  console.log(`  - ${users.length} regular users`);
  console.log(`  - 3 drivers (2 ONLINE, 1 OFFLINE)`);
  console.log(`  - ${locations.length} locations`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
