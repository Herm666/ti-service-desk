import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    const allowedRoles = [
      "REQUESTER",
      "TECHNICIAN",
      "MANAGER",
      "ADMIN",
    ] as const;

    if (role && !allowedRoles.includes(role as (typeof allowedRoles)[number])) {
      return NextResponse.json(
        { error: "Perfil inválido." },
        { status: 400 }
      );
    }

    const users = await db.user.findMany({
      where: {
        active: true,
        ...(role === "TECHNICIAN"
          ? {
              role: {
                in: ["TECHNICIAN", "MANAGER", "ADMIN"],
              },
            }
          : role
            ? { role: role as (typeof allowedRoles)[number] }
            : {}),
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        departmentId: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("GET /api/users:", error);

    return NextResponse.json(
      { error: "Erro ao carregar usuários." },
      { status: 500 }
    );
  }
}