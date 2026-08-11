import { prisma } from "../utils/db";

export default class DriverService {
  static async getDriverById(driverId: string) {
    return await prisma.driver.findUnique({
      where: {
        id: driverId,
      },
    });
  }

  static async createDriver(data: any) {
    return await prisma.driver.create({
      data,
    });
  }

  static async updateDriver(driverId: string, data: any) {
    return await prisma.driver.update({
      where: {
        id: driverId,
      },
      data,
    });
  }

  static async deleteDriver(driverId: string) {
    return await prisma.driver.delete({
      where: {
        id: driverId,
      },
    });
  }
}
