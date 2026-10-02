import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, canManage } from "@/lib/auth";
import { Priority } from "@prisma/client";

export async function GET() {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 }
      );
    }

    if (!canManage(user.role)) {
      return NextResponse.json(
        { error: "Sem permissão." },
        { status: 403 }
      );
    }

    const slas = await db.sla.findMany({
      orderBy: {
        priority: "asc",
      },
    });

    return NextResponse.json(slas);
  } catch (error) {
    console.error("GET /api/sla:", error);

    return NextResponse.json(
      { error: "Erro ao carregar SLAs." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 }
      );
    }

    if (!canManage(user.role)) {
      return NextResponse.json(
        { error: "Sem permissão." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const priority = body.priority as Priority;

    const responseMins = Number(body.responseMins);
    const resolutionMins = Number(body.resolutionMins);

    if (
      !name ||
      !Object.values(Priority).includes(priority) ||
      !Number.isInteger(responseMins) ||
      !Number.isInteger(resolutionMins) ||
      responseMins <= 0 ||
      resolutionMins <= 0
    ) {
      return NextResponse.json(
        { error: "Dados de SLA inválidos." },
        { status: 400 }
      );
    }

    const existing = await db.sla.findUnique({
      where: {
        priority,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          error:
            "Já existe um SLA configurado para esta prioridade.",
        },
        { status: 409 }
      );
    }

    const sla = await db.sla.create({
      data: {
        name,
        priority,
        responseMins,
        resolutionMins,
        active: true,
      },
    });

    return NextResponse.json(sla, {
      status: 201,
    });
  } catch (error) {
    console.error("POST /api/sla:", error);

    return NextResponse.json(
      { error: "Erro ao criar SLA." },
      { status: 500 }
    );
  }
}