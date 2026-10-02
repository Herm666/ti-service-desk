import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, canManage } from "@/lib/auth";
import { Priority } from "@prisma/client";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const body = await request.json().catch(() => ({}));

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const priority =
      typeof body.priority === "string"
        ? body.priority
        : "";

    const responseMins = Number(body.responseMins);
    const resolutionMins = Number(body.resolutionMins);

    const active =
      typeof body.active === "boolean"
        ? body.active
        : true;

    if (!name) {
      return NextResponse.json(
        { error: "O nome do SLA é obrigatório." },
        { status: 400 }
      );
    }

    if (
      !Object.values(Priority).includes(
        priority as Priority
      )
    ) {
      return NextResponse.json(
        { error: "Prioridade inválida." },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(responseMins) ||
      responseMins <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "O tempo de resposta deve ser um número inteiro maior que zero.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(resolutionMins) ||
      resolutionMins <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "O tempo de resolução deve ser um número inteiro maior que zero.",
        },
        { status: 400 }
      );
    }

    const existing = await db.sla.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "SLA não encontrado." },
        { status: 404 }
      );
    }

    const priorityConflict = await db.sla.findFirst({
      where: {
        priority: priority as Priority,
        id: {
          not: id,
        },
      },
    });

    if (priorityConflict) {
      return NextResponse.json(
        {
          error:
            "Já existe outro SLA configurado para esta prioridade.",
        },
        { status: 409 }
      );
    }

    const sla = await db.sla.update({
      where: {
        id,
      },
      data: {
        name,
        priority: priority as Priority,
        responseMins,
        resolutionMins,
        active,
      },
    });

    return NextResponse.json(sla);
  } catch (error) {
    console.error("PATCH /api/sla/[id]:", error);

    return NextResponse.json(
      { error: "Erro ao atualizar SLA." },
      { status: 500 }
    );
  }
}