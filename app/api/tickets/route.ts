import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendPushToTechTeam } from "@/lib/push";
import { Priority } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

export async function GET() {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const where =
      user.role === "REQUESTER"
        ? { requesterId: user.id }
        : {};

    const tickets = await db.ticket.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            active: true,
            departmentId: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            active: true,
            departmentId: true,
          },
        },
        department: true,
        category: true,
        sla: true,
      },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("GET /api/tickets:", error);

    return NextResponse.json(
      { error: "Erro ao carregar chamados." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const subject =
      typeof body.subject === "string"
        ? body.subject.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const departmentId =
      typeof body.departmentId === "string"
        ? body.departmentId
        : "";

    const categoryId =
      typeof body.categoryId === "string" &&
      body.categoryId
        ? body.categoryId
        : null;

    if (
      !name ||
      !email ||
      !subject ||
      !description ||
      !departmentId
    ) {
      return NextResponse.json(
        {
          error:
            "Nome, e-mail, assunto, descrição e setor são obrigatórios.",
        },
        { status: 400 }
      );
    }

    if (
      name.length > 120 ||
      email.length > 180 ||
      subject.length > 160 ||
      description.length > 5000
    ) {
      return NextResponse.json(
        {
          error:
            "Um ou mais campos ultrapassaram o limite permitido.",
        },
        { status: 400 }
      );
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        {
          error: "Informe um e-mail válido.",
        },
        { status: 400 }
      );
    }

    const [department, category] =
      await Promise.all([
        db.department.findFirst({
          where: {
            id: departmentId,
            active: true,
          },
        }),

        categoryId
          ? db.category.findFirst({
              where: {
                id: categoryId,
                active: true,
              },
            })
          : Promise.resolve(null),
      ]);

    if (!department) {
      return NextResponse.json(
        {
          error:
            "O setor selecionado não está disponível.",
        },
        { status: 400 }
      );
    }

    if (categoryId && !category) {
      return NextResponse.json(
        {
          error:
            "A categoria selecionada não está disponível.",
        },
        { status: 400 }
      );
    }

    const priority =
      Object.values(Priority).includes(
        body.priority
      )
        ? (body.priority as Priority)
        : Priority.MEDIUM;

    let requester =
      await db.user.findUnique({
        where: {
          email,
        },
      });

    if (requester && !requester.active) {
      return NextResponse.json(
        {
          error:
            "Este cadastro está desativado. Procure a equipe de TI.",
        },
        { status: 403 }
      );
    }

    if (
      requester &&
      requester.role !== "REQUESTER"
    ) {
      return NextResponse.json(
        {
          error:
            "Este e-mail pertence a uma conta interna. Entre em contato com a equipe de TI.",
        },
        { status: 403 }
      );
    }

    if (requester) {
      requester = await db.user.update({
        where: {
          id: requester.id,
        },
        data: {
          name,
          departmentId,
        },
      });
    } else {
      requester = await db.user.create({
        data: {
          name,
          email,
          passwordHash: await bcrypt.hash(
            randomUUID(),
            12
          ),
          role: "REQUESTER",
          active: true,
          departmentId,
        },
      });
    }

    /*
     * Localiza o SLA correspondente à prioridade
     * escolhida para o chamado.
     */
    const sla = await db.sla.findUnique({
      where: {
        priority,
      },
    });

    /*
     * Calcula o prazo de resolução utilizando
     * o SLA cadastrado.
     */
    const dueAt = sla
      ? new Date(
          Date.now() +
            sla.resolutionMins * 60_000
        )
      : null;

    const ticket = await db.ticket.create({
      data: {
        subject,
        description,
        priority,
        requesterId: requester.id,
        departmentId,
        categoryId,

        /*
         * Registra exatamente qual SLA foi aplicado
         * ao chamado.
         */
        slaId: sla?.id ?? null,

        /*
         * Registra a data limite de resolução.
         */
        dueAt,
      },
    });

    await db.auditLog.create({
      data: {
        userId: requester.id,
        action: "CREATE",
        entity: "TICKET",
        entityId: ticket.id,
        details: `Chamado #${ticket.number} criado pelo portal público`,
      },
    });

    /*
     * Envia notificação Push para técnicos,
     * gestores e administradores que possuem
     * uma assinatura Push ativa.
     *
     * O envio não bloqueia a criação do chamado.
     */
    try {
      await sendPushToTechTeam({
        title: "NOVO CHAMADO — GRAU CABO",
        body: `Chamado #${ticket.number}: ${ticket.subject}`,
        url: `/tech/tickets/${ticket.id}`,
        tag: `ticket-${ticket.id}`,
      });
    } catch (pushError) {
      console.error(
        "Erro ao enviar notificação Push do chamado:",
        pushError
      );
    }

    return NextResponse.json(
      {
        id: ticket.id,
        number: ticket.number,
        slaId: ticket.slaId,
        dueAt: ticket.dueAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/tickets:", error);

    return NextResponse.json(
      {
        error: "Erro ao criar chamado.",
      },
      { status: 500 }
    );
  }
}