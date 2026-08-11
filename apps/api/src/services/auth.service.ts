import { prisma } from "../utils/db";

export default class AuthService {
  static async getUserById(userId: string) {
    return await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  }

  static async getUserByUsername(username: string) {
    return await prisma.user.findUnique({
      where: {
        username,
      },
    });
  }

  static async createUser(data: any) {
    return await prisma.user.create({
      data,
    });
  }

  static async updateUser(userId: string, data: any) {
    return await prisma.user.update({
      where: {
        id: userId,
      },
      data,
    });
  }

  static async deleteUser(userId: string) {
    return await prisma.user.delete({
      where: {
        id: userId,
      },
    });
  }
}
