import { prisma } from "./db";

export async function generateBookingNumber(): Promise<string> {
  // Get the last booking to determine the next number
  const lastBooking = await prisma.booking.findFirst({
    orderBy: { createdAt: "desc" },
    select: { bookingNumber: true },
  });

  let nextNumber = 1;

  if (lastBooking) {
    // Extract number from format SH-000001
    const match = lastBooking.bookingNumber.match(/SH-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }

  // Format with leading zeros (6 digits)
  return `SH-${String(nextNumber).padStart(6, "0")}`;
}
