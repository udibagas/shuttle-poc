import { UserRole } from "@shuttle/types";

export interface JWTPayload {
  id: string;
  username: string;
  role: UserRole;
}

export async function hashPassword(password: string): Promise<string> {
  return await Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: 10,
  });
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return await Bun.password.verify(password, hash);
}
