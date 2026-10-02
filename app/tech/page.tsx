import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser, canWorkTickets } from "@/lib/auth";
import {
  ACTIVE_STATUSES,
  priorityLabel,
  statusLabel,
} from "@/lib/ticket";
import { NewTicketNotification } from "@/components/NewTicketNotification";
import PushNotifications from "@/components/PushNotifications";

export default async function TechDashboard() {
  const u = await getSessionUser();

  if (!u) redirect("/login");
  if (!canWorkTickets(u.role)) redirect("/portal");

  const active = {
    status: {
      in: ACTIVE_STATUSES,
    },
  };

  const [queue, mine, overdue, critical, recent] = await Promise.all([
    db.ticket.count({
      where: active,
    }),

    db.ticket.count({
      where: {
        assigneeId: u.id,
        status: {
          in: ACTIVE_STATUSES,
        },
      },
    }),

    db.ticket.count({
      where: {
        ...active,
        dueAt: {
          lt: new Date(),
        },
      },
    }),

    db.ticket.count({
      where: {
        ...active,
        priority: "CRITICAL",
      },
    }),

    db.ticket.findMany({
      where: active,
      orderBy: [
        {
          priority: "desc",
        },
        {
          createdAt: "asc",
        },
      ],
      take: 8,
      include: {
        requester: true,
        assignee: true,
        department: true,
      },
    }),
  ]);

  return (
    <>
      <PushNotifications />

      <NewTicketNotification />

      <div className="between">
        <div>
          <div className="eyebrow">PAINEL DO TÉCNICO</div>

          <div className="title">
            Central de atendimento
          </div>

          <p className="muted">
            Fila operacional, SLA e chamados atribuídos.
          </p>
        </div>

        <Link className="btn" href="/tech/tickets">
          Abrir fila
        </Link>
      </div>

      <div className="spacer" />

      <div className="grid grid4">
        <div className="card">
          <div className="muted">Fila ativa</div>
          <div className="metric">{queue}</div>
        </div>

        <div className="card">
          <div className="muted">Meus chamados</div>
          <div className="metric">{mine}</div>
        </div>

        <div className="card">
          <div className="muted">SLA vencido</div>
          <div className="metric">{overdue}</div>
        </div>

        <div className="card">
          <div className="muted">Críticos</div>
          <div className="metric">{critical}</div>
        </div>
      </div>

      <div className="spacer" />

      <div className="card">
        <div className="between">
          <h2>Fila prioritária</h2>

          <Link
            className="btn secondary"
            href="/tech/tickets"
          >
            Ver fila completa
          </Link>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Solicitante</th>
                <th>Assunto</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th>Setor</th>
              </tr>
            </thead>

            <tbody>
              {recent.map((t) => (
                <tr key={t.id}>
                  <td>
                    <Link href={`/tech/tickets/${t.id}`}>
                      #{t.number}
                    </Link>
                  </td>

                  <td>{t.requester.name}</td>

                  <td>
                    <Link href={`/tech/tickets/${t.id}`}>
                      {t.subject}
                    </Link>
                  </td>

                  <td>
                    <span
                      className={`badge ${t.priority.toLowerCase()}`}
                    >
                      {priorityLabel(t.priority)}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`badge ${t.status
                        .toLowerCase()
                        .replace("_", "-")}`}
                    >
                      {statusLabel(t.status)}
                    </span>
                  </td>

                  <td>{t.department.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}