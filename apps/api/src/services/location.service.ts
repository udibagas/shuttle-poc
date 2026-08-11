import { prisma } from "../utils/db";

export default class LocationService {
  static async getLocationById(locationId: string) {
    return await prisma.location.findUnique({
      where: {
        id: locationId,
      },
    });
  }

  static async createLocation(data: any) {
    return await prisma.location.create({
      data,
    });
  }

  static async updateLocation(locationId: string, data: any) {
    return await prisma.location.update({
      where: {
        id: locationId,
      },
      data,
    });
  }

  static async deleteLocation(locationId: string) {
    return await prisma.location.delete({
      where: {
        id: locationId,
      },
    });
  }
}
