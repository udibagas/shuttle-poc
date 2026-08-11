import { prisma } from "../utils/db";

export default class BookingService {
  static async getBookingById(bookingId: string) {
    return await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
    });
  }

  static async createBooking(data: any) {
    return await prisma.booking.create({
      data,
    });
  }

  static async updateBooking(bookingId: string, data: any) {
    return await prisma.booking.update({
      where: {
        id: bookingId,
      },
      data,
    });
  }

  static async deleteBooking(bookingId: string) {
    return await prisma.booking.delete({
      where: {
        id: bookingId,
      },
    });
  }
}
