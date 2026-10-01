import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { db } from "./db";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "development-secret-change-me");

export async function signSession(userId: string, role: string) {
  return new SignJWT({ userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secret);
}

export async function getSessionUser() {
  const token = (await cookies()).get("ti_session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (!payload.userId || typeof payload.userId !== "string") return null;
    return db.user.findUnique({ where: { id: payload.userId }, include: { department: true } });
  } catch {
    return null;
  }
}

export function canManage(role: string) { return role === "ADMIN"; }
export function canWork(role: string) { return role === "ADMIN" || role === "TECHNICIAN"; }

export async function requireRole(roles: string[]) {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  if (!roles.includes(user.role)) throw new Error("FORBIDDEN");
  return user;
}
