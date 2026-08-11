import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
export const jwtPlugin = new Elysia().use(
  jwt({
    name: "jwt",
    secret: process.env.JWT_SECRET || "change-this-secret-in-production",
  }),
);
