import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, canManage } from "@/lib/auth";

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

    const now = new Date();

    const [
      total,
      open,
      inProgress,
      waiting,
      resolved,
      closed,
      critical,
      overdue,
      byDepartment,
      byPriority,
      recent,
    ] = await Promise.all([
      db.ticket.count(),

      db.ticket.count({
        where: {
          status: "OPEN",
        },
      }),

      db.ticket.count({
        where: {
          status: "IN_PROGRESS",
        },
      }),

      db.ticket.count({
        where: {
          status: "WAITING",
        },
      }),

      db.ticket.count({
        where: {
          status: "RESOLVED",
        },
      }),

      db.ticket.count({
        where: {
          status: "CLOSED",
        },
      }),

      db.ticket.count({
        where: {
          priority: "CRITICAL",
          status: {
            notIn: ["RESOLVED", "CLOSED", "CANCELLED"],
          },
        },
      }),

      db.ticket.count({
        where: {
          dueAt: {
            lt: now,
          },
          status: {
            notIn: ["RESOLVED", "CLOSED", "CANCELLED"],
          },
        },
      }),

      db.department.findMany({
        where: {
          active: true,
        },
        orderBy: {
          name: "asc",
        },
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              tickets: true,
            },
          },
        },
      }),

      Promise.all([
        db.ticket.count({
          where: {
            priority: "LOW",
          },
        }),
        db.ticket.count({
          where: {
            priority: "MEDIUM",
          },
        }),
        db.ticket.count({
          where: {
            priority: "HIGH",
          },
        }),
        db.ticket.count({
          where: {
            priority: "CRITICAL",
          },
        }),
      ]),

      db.ticket.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
        select: {
          id: true,
          number: true,
          subject: true,
          status: true,
          priority: true,
          createdAt: true,

          requester: {
            select: {
              name: true,
            },
          },

          assignee: {
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
      }),
    ]);

    return NextResponse.json({
      totals: {
        total,
        open,
        inProgress,
        waiting,
        resolved,
        closed,
        critical,
        overdue,
      },

      priorities: {
        low: byPriority[0],
        medium: byPriority[1],
        high: byPriority[2],
        critical: byPriority[3],
      },

      departments: byDepartment.map((department) => ({
        id: department.id,
        name: department.name,
        tickets: department._count.tickets,
      })),

      recent,
    });
  } catch (error) {
    console.error("GET /api/dashboard:", error);

    return NextResponse.json(
      {
        error: "Erro ao carregar dashboard.",
      },
      {
        status: 500,
      }
    );
  }
}