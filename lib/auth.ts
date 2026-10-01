import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { db } from "./db";
import type { Role } from "@prisma/client";

const COOKIE = "grau_ti_session";
const secret = new TextEncoder().encode(process.env.SESSION_SECRET || "dev-secret-change-me");

type Session = { userId: string; role: Role };

export async function createSession(userId: string, role: Role) {
  const token = await new SignJWT({ role }).setProtectedHeader({ alg: "HS256" }).setSubject(userId).setIssuedAt().setExpirationTime("7d").sign(secret);
  (await cookies()).set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (!payload.sub || typeof payload.role !== "string") return null;
    return { userId: payload.sub, role: payload.role as Role };
  } catch { return null; }
}

export async function getSessionUser() {
  const session = await getSession();
  if (!session) return null;
  return db.user.findUnique({ where: { id: session.userId }, include: { department: true } });
}

export async function authenticate(email: string, password: string) {
  const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user || !user.active) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? user : null;
}

export function canManage(role: Role) { return role === "ADMIN" || role === "MANAGER"; }
export function canWorkTickets(role: Role) { return role === "ADMIN" || role === "MANAGER" || role === "TECHNICIAN"; }
