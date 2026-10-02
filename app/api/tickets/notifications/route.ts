import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, canWorkTickets } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 }
      );
    }

    if (!canWorkTickets(user.role)) {
      return NextResponse.json(
        { error: "Sem permissão." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const since = searchParams.get("since");

    const sinceDate = since ? new Date(since) : new Date();

    if (Number.isNaN(sinceDate.getTime())) {
      return NextResponse.json(
        { error: "Data inválida." },
        { status: 400 }
      );
    }

    const tickets = await db.ticket.findMany({
      where: {
        status: "OPEN",
        createdAt: {
          gt: sinceDate,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        number: true,
        subject: true,
        priority: true,
        status: true,
        createdAt: true,
        requester: {
          select: {
            name: true,
          },
        },
        department: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("GET /api/tickets/notifications:", error);

    return NextResponse.json(
      { error: "Erro ao verificar novos chamados." },
      { status: 500 }
    );
  }
}