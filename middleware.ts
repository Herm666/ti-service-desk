import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "development-secret-change-me");

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/api/auth") || pathname === "/login" || pathname.startsWith("/_next") || pathname === "/favicon.ico") return NextResponse.next();
  const token = req.cookies.get("ti_session")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", req.url));
  try {
    const { payload } = await jwtVerify(token, secret);
    const role = String(payload.role || "");
    if (pathname.startsWith("/portal") && role !== "USER") return NextResponse.redirect(new URL(role === "ADMIN" ? "/admin" : "/tech", req.url));
    if (pathname.startsWith("/tech") && !["TECHNICIAN", "ADMIN"].includes(role)) return NextResponse.redirect(new URL("/portal", req.url));
    if (pathname.startsWith("/admin") && role !== "ADMIN") return NextResponse.redirect(new URL(role === "TECHNICIAN" ? "/tech" : "/portal", req.url));
    if (["/users", "/assets", "/reports", "/knowledge", "/tickets"].some(x => pathname === x || pathname.startsWith(x + "/"))) {
      const allowedLegacy = (pathname.startsWith("/users/new") && role === "ADMIN") || (pathname.startsWith("/assets/new") && ["ADMIN","TECHNICIAN"].includes(role));
      if (!allowedLegacy) return NextResponse.redirect(new URL(role === "ADMIN" ? "/admin" : role === "TECHNICIAN" ? "/tech" : "/portal", req.url));
    }
    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete("ti_session");
    return res;
  }
}

export const config = { matcher: ["/((?!api/auth).*)"] };
