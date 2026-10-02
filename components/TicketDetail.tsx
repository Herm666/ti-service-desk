"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Technician = {
  id: string;
  name: string;
  email: string;
};

export function TicketDetail({
  ticket,
  tech = false,
  publicView = false,
}: {
  ticket: any;
  tech?: boolean;
  publicView?: boolean;
}) {
  const router = useRouter();

  const [body, setBody] = useState("");
  const [status, setStatus] = useState(ticket.status);
  const [priority, setPriority] = useState(ticket.priority);
  const [assigneeId, setAssigneeId] = useState(ticket.assigneeId || "");
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tech) return;

    async function loadTechnicians() {
      try {
        const response = await fetch("/api/users?role=TECHNICIAN");

        if (!response.ok) return;

        const data = await response.json();

        if (Array.isArray(data)) {
          setTechnicians(data);
        }
      } catch (error) {
        console.error("Erro ao carregar técnicos:", error);
      }
    }

    loadTechnicians();
  }, [tech]);

  async function message(e: React.FormEvent) {
    e.preventDefault();

    if (!body.trim()) return;

    setLoading(true);

    try {
      await fetch(`/api/tickets/${ticket.id}/messages`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          body,
          internal: false,
        }),
      });

      setBody("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function update() {
    setLoading(true);

    try {
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          status,
          priority,
          assigneeId: assigneeId || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        alert(data.error || "Não foi possível atualizar o chamado.");
        return;
      }

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="card">
        <div className="ticket-head">
          <div>
            <div className="eyebrow">CHAMADO #{ticket.number}</div>

            <h1>{ticket.subject}</h1>

            <p className="muted">
              {ticket.department.name} ·{" "}
              {ticket.category?.name || "Sem categoria"}
            </p>
          </div>

          <div className="actions">
            <span
              className={`badge ${ticket.priority.toLowerCase()}`}
            >
              {ticket.priority}
            </span>

            <span
              className={`badge ${ticket.status
                .toLowerCase()
                .replace("_", "-")}`}
            >
              {ticket.status}
            </span>
          </div>
        </div>

        <hr
          style={{
            border: 0,
            borderTop: "1px solid var(--line)",
            margin: "20px 0",
          }}
        />

        <p style={{ whiteSpace: "pre-wrap" }}>
          {ticket.description}
        </p>
      </div>

      <div className="spacer" />

      {tech && (
        <div className="card">
          <div className="grid grid2">
            <div className="field">
              <label>Status</label>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="OPEN">Aberto</option>
                <option value="IN_PROGRESS">Em atendimento</option>
                <option value="WAITING">Em espera</option>
                <option value="RESOLVED">Resolvido</option>
                <option value="CLOSED">Fechado</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>

            <div className="field">
              <label>Prioridade</label>

              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="LOW">Baixa</option>
                <option value="MEDIUM">Média</option>
                <option value="HIGH">Alta</option>
                <option value="CRITICAL">Crítica</option>
              </select>
            </div>
          </div>

          <div className="field" style={{ marginTop: 16 }}>
            <label>Responsável</label>

            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
            >
              <option value="">Não atribuído</option>

              {technicians.map((technician) => (
                <option key={technician.id} value={technician.id}>
                  {technician.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: 16 }}>
            <button
              className="btn"
              onClick={update}
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar atualização"}
            </button>
          </div>
        </div>
      )}

      <div className="spacer" />

      <div className="card">
        <h2>Histórico</h2>

        <div className="grid">
          {ticket.messages
            .filter((m: any) => !m.internal)
            .map((m: any) => (
              <div className="message" key={m.id}>
                <div className="message-meta">
                  <b>{m.author.name}</b> ·{" "}
                  {new Date(m.createdAt).toLocaleString("pt-BR")}
                </div>

                <div style={{ whiteSpace: "pre-wrap" }}>
                  {m.body}
                </div>
              </div>
            ))}
        </div>

        <div className="spacer" />

        {!publicView && (
          <form onSubmit={message} className="form">
            <div className="field">
              <label>Adicionar mensagem</label>

              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Informe o andamento ou responda ao solicitante..."
              />
            </div>

            <button className="btn" disabled={loading}>
              Enviar mensagem
            </button>
          </form>
        )}
      </div>
    </>
  );
}