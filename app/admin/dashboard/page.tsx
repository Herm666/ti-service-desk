import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser, canManage } from "@/lib/auth";

const priorityLabel: Record<string, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  CRITICAL: "Crítica",
};

const statusLabel: Record<string, string> = {
  OPEN: "Aberto",
  IN_PROGRESS: "Em atendimento",
  WAITING: "Em espera",
  RESOLVED: "Resolvido",
  CLOSED: "Fechado",
  CANCELLED: "Cancelado",
};

export default async function ManagerDashboard() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (!canManage(user.role)) {
    redirect("/");
  }

  const [
    total,
    open,
    inProgress,
    waiting,
    resolved,
    closed,
    critical,
    overdue,
    departments,
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
          lt: new Date(),
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

  return (
    <>
      <div className="between">
        <div>
          <div className="eyebrow">
            GESTÃO OPERACIONAL
          </div>

          <div className="title">
            Dashboard Gerencial
          </div>

          <p className="muted">
            Visão consolidada dos chamados, SLA e operação da Central de TI.
          </p>
        </div>

        <Link
          className="btn secondary"
          href="/admin"
        >
          ← Administração
        </Link>
      </div>

      <div className="spacer" />

      <div className="grid grid4">
        <div className="card">
          <div className="muted">
            Total de chamados
          </div>

          <div className="metric">
            {total}
          </div>
        </div>

        <div className="card">
          <div className="muted">
            Abertos
          </div>

          <div className="metric">
            {open}
          </div>
        </div>

        <div className="card">
          <div className="muted">
            Em atendimento
          </div>

          <div className="metric">
            {inProgress}
          </div>
        </div>

        <div className="card">
          <div className="muted">
            Em espera
          </div>

          <div className="metric">
            {waiting}
          </div>
        </div>
      </div>

      <div className="spacer" />

      <div className="grid grid4">
        <div className="card">
          <div className="muted">
            Resolvidos
          </div>

          <div className="metric">
            {resolved}
          </div>
        </div>

        <div className="card">
          <div className="muted">
            Fechados
          </div>

          <div className="metric">
            {closed}
          </div>
        </div>

        <div className="card">
          <div className="muted">
            Críticos ativos
          </div>

          <div className="metric">
            {critical}
          </div>
        </div>

        <div className="card">
          <div className="muted">
            SLA vencido
          </div>

          <div className="metric">
            {overdue}
          </div>
        </div>
      </div>

      <div className="spacer" />

      <div className="grid grid2">
        <div className="card">
          <div className="between">
            <div>
              <h2>
                Chamados por setor
              </h2>

              <p className="muted">
                Distribuição da demanda por área.
              </p>
            </div>
          </div>

          <div className="spacer" />

          <div className="grid">
            {departments.map((department) => (
              <div
                key={department.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <span>
                  {department.name}
                </span>

                <strong>
                  {department._count.tickets}
                </strong>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2>
            Indicadores operacionais
          </h2>

          <p className="muted">
            Situação atual da operação.
          </p>

          <div className="spacer" />

          <div className="grid">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px 0",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <span>
                Chamados ativos
              </span>

              <strong>
                {open + inProgress + waiting}
              </strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px 0",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <span>
                Chamados críticos
              </span>

              <strong>
                {critical}
              </strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px 0",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <span>
                SLA vencido
              </span>

              <strong>
                {overdue}
              </strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px 0",
              }}
            >
              <span>
                Taxa de resolução
              </span>

              <strong>
                {total > 0
                  ? Math.round(
                      ((resolved + closed) / total) * 100
                    )
                  : 0}
                %
              </strong>
            </div>
          </div>
        </div>
      </div>

      <div className="spacer" />

      <div className="card">
        <div className="between">
          <div>
            <h2>
              Chamados recentes
            </h2>

            <p className="muted">
              Últimos chamados registrados na Central de TI.
            </p>
          </div>

          <Link
            className="btn secondary"
            href="/tech/tickets"
          >
            Ver fila
          </Link>
        </div>

        <div className="spacer" />

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Solicitante</th>
                <th>Assunto</th>
                <th>Setor</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th>Responsável</th>
              </tr>
            </thead>

            <tbody>
              {recent.map((ticket) => (
                <tr key={ticket.id}>
                  <td>
                    <Link
                      href={`/tech/tickets/${ticket.id}`}
                    >
                      #{ticket.number}
                    </Link>
                  </td>

                  <td>
                    {ticket.requester.name}
                  </td>

                  <td>
                    <Link
                      href={`/tech/tickets/${ticket.id}`}
                    >
                      {ticket.subject}
                    </Link>
                  </td>

                  <td>
                    {ticket.department.name}
                  </td>

                  <td>
                    <span
                      className={`badge ${ticket.priority.toLowerCase()}`}
                    >
                      {priorityLabel[ticket.priority]}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`badge ${ticket.status
                        .toLowerCase()
                        .replace("_", "-")}`}
                    >
                      {statusLabel[ticket.status]}
                    </span>
                  </td>

                  <td>
                    {ticket.assignee?.name ||
                      "Não atribuído"}
                  </td>
                </tr>
              ))}

              {recent.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    Nenhum chamado registrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}