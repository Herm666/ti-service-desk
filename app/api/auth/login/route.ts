import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signSession } from "@/lib/auth";

const roleRedirect: Record<string, string> = { USER: "/portal", TECHNICIAN: "/tech", ADMIN: "/admin" };

export async function POST(req: Request) {
  try {
    const { email, password, profile } = await req.json();
    const u = await db.user.findUnique({ where: { email: String(email || "").toLowerCase().trim() } });
    if (!u || !u.active || !(await bcrypt.compare(password || "", u.passwordHash))) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }
    if (profile && profile !== u.role) {
      return NextResponse.json({ error: "O perfil selecionado não corresponde a este usuário." }, { status: 403 });
    }
    const token = await signSession(u.id, u.role);
    const res = NextResponse.json({ ok: true, role: u.role, redirect: roleRedirect[u.role] });
    res.cookies.set("ti_session", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 12, path: "/" });
    return res;
  } catch {
    return NextResponse.json({ error: "Erro no login" }, { status: 500 });
  }
}
