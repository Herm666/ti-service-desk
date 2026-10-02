import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { canWorkTickets, getSessionUser } from "@/lib/auth";
import { TicketStatus, Priority } from "@prisma/client";

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  active: true,
  departmentId: true,
};

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const u = await getSessionUser();

  if (!u) {
    return NextResponse.json(
      { error: "Não autenticado" },
      { status: 401 }
    );
  }

  const { id } = await params;

  const t = await db.ticket.findUnique({
    where: {
      id,
    },

    include: {
      requester: {
        select: safeUserSelect,
      },

      assignee: {
        select: safeUserSelect,
      },

      department: true,

      category: true,

      messages: {
        orderBy: {
          createdAt: "asc",
        },

        include: {
          author: {
            select: safeUserSelect,
          },
        },
      },

      attachments: true,
    },
  });

  if (!t) {
    return NextResponse.json(
      { error: "Chamado não encontrado" },
      { status: 404 }
    );
  }

  if (
    u.role === "REQUESTER" &&
    t.requesterId !== u.id
  ) {
    return NextResponse.json(
      { error: "Sem acesso" },
      { status: 403 }
    );
  }

  return NextResponse.json(t);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const u = await getSessionUser();

  if (!u) {
    return NextResponse.json(
      { error: "Não autenticado" },
      { status: 401 }
    );
  }

  if (!canWorkTickets(u.role)) {
    return NextResponse.json(
      { error: "Sem permissão" },
      { status: 403 }
    );
  }

  const { id } = await params;

  const body = await req.json().catch(() => ({}));

  const data: {
    status?: TicketStatus;
    priority?: Priority;
    assigneeId?: string | null;
    resolvedAt?: Date | null;
    closedAt?: Date | null;
  } = {};

  if (
    body.status &&
    Object.values(TicketStatus).includes(body.status)
  ) {
    data.status = body.status;
  }

  if (
    body.priority &&
    Object.values(Priority).includes(body.priority)
  ) {
    data.priority = body.priority;
  }

  if (body.assigneeId !== undefined) {
    if (!body.assigneeId) {
      data.assigneeId = null;
    } else {
      const assignee = await db.user.findFirst({
        where: {
          id: body.assigneeId,
          active: true,
          role: {
            in: [
              "TECHNICIAN",
              "MANAGER",
              "ADMIN",
            ],
          },
        },
        select: {
          id: true,
        },
      });

      if (!assignee) {
        return NextResponse.json(
          {
            error:
              "O responsável selecionado não é um usuário operacional ativo.",
          },
          { status: 400 }
        );
      }

      data.assigneeId = assignee.id;
    }
  }

  if (data.status === "RESOLVED") {
    data.resolvedAt = new Date();
  }

  if (data.status === "CLOSED") {
    data.closedAt = new Date();
  }

  const ticket = await db.ticket.update({
    where: {
      id,
    },

    data,
  });

  await db.auditLog.create({
    data: {
      userId: u.id,
      action: "UPDATE",
      entity: "TICKET",
      entityId: id,
      details: JSON.stringify(body),
    },
  });

  return NextResponse.json(ticket);
}