import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, canManage } from "@/lib/auth";

export async function GET() {
  try {
    const items = await db.department.findMany({
      where: {
        active: true,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        active: true,
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("GET /api/departments:", error);

    return NextResponse.json(
      {
        error: "Erro ao carregar setores.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();

    if (!user || !canManage(user.role)) {
      return NextResponse.json(
        {
          error: "Não autorizado.",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    const name = String(body.name || "").trim();

    if (!name) {
      return NextResponse.json(
        {
          error: "Informe o nome do setor.",
        },
        {
          status: 400,
        }
      );
    }

    const existing = await db.department.findUnique({
      where: {
        name,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: "Este setor já está cadastrado.",
        },
        {
          status: 409,
        }
      );
    }

    const department = await db.department.create({
      data: {
        name,
        active: true,
      },
    });

    return NextResponse.json(department, {
      status: 201,
    });
  } catch (error) {
    console.error("POST /api/departments:", error);

    return NextResponse.json(
      {
        error: "Erro ao cadastrar setor.",
      },
      {
        status: 500,
      }
    );
  }
}