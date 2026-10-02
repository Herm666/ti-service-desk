"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type NotificationTicket = {
  id: string;
  number: number;
  subject: string;
  priority: string;
  status: string;
  createdAt: string;
  requester: {
    name: string;
  };
  department: {
    name: string;
  };
};

const priorityLabel: Record<string, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  CRITICAL: "Crítica",
};

const priorityClass: Record<string, string> = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};

export function NewTicketNotification() {
  const router = useRouter();

  const [ticket, setTicket] = useState<NotificationTicket | null>(null);
  const [queue, setQueue] = useState<NotificationTicket[]>([]);
  const [visible, setVisible] = useState(false);

  const initialized = useRef(false);
  const lastCheck = useRef<string>(new Date().toISOString());
  const notifiedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    async function checkNewTickets() {
      try {
        const response = await fetch(
          `/api/tickets/notifications?since=${encodeURIComponent(
            lastCheck.current
          )}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          return;
        }

        const tickets: NotificationTicket[] = await response.json();

        lastCheck.current = new Date().toISOString();

        if (cancelled || !tickets.length) {
          return;
        }

        const newTickets = tickets.filter(
          (item) => !notifiedIds.current.has(item.id)
        );

        if (!newTickets.length) {
          return;
        }

        newTickets.forEach((item) => {
          notifiedIds.current.add(item.id);
        });

        if (!initialized.current) {
          initialized.current = true;
          return;
        }

        setQueue((current) => [...current, ...newTickets]);
      } catch (error) {
        console.error("Erro ao verificar novos chamados:", error);
      }
    }

    initialized.current = true;

    const interval = window.setInterval(checkNewTickets, 10000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (ticket || queue.length === 0) {
      return;
    }

    const [next, ...remaining] = queue;

    setTicket(next);
    setQueue(remaining);
    setVisible(true);
  }, [queue, ticket]);

  function closeNotification() {
    setVisible(false);

    window.setTimeout(() => {
      setTicket(null);
    }, 200);
  }

  function openTicket() {
    if (!ticket) {
      return;
    }

    router.push(`/tech/tickets/${ticket.id}`);
  }

  if (!ticket || !visible) {
    return null;
  }

  const priorityText =
    priorityLabel[ticket.priority] || ticket.priority;

  const priorityBadgeClass =
    priorityClass[ticket.priority] || "medium";

  return (
    <div
      style={{
        position: "fixed",
        right: "24px",
        bottom: "24px",
        width: "390px",
        maxWidth: "calc(100vw - 32px)",
        zIndex: 99999,
        animation: "newTicketNotificationIn 0.25s ease-out",
      }}
    >
      <style>
        {`
          @keyframes newTicketNotificationIn {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.97);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>

      <div
        style={{
          background: "var(--card, #ffffff)",
          border: "1px solid var(--line, #e5e7eb)",
          borderRadius: "16px",
          boxShadow: "0 18px 50px rgba(0,0,0,0.22)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: "#111827",
            color: "#ffffff",
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontWeight: 700,
              letterSpacing: "0.04em",
              fontSize: "13px",
            }}
          >
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#22c55e",
                display: "inline-block",
                boxShadow: "0 0 0 5px rgba(34,197,94,0.15)",
              }}
            />

            NOVO CHAMADO
          </div>

          <button
            type="button"
            onClick={closeNotification}
            aria-label="Fechar"
            style={{
              border: 0,
              background: "transparent",
              color: "#ffffff",
              fontSize: "20px",
              cursor: "pointer",
              lineHeight: 1,
              opacity: 0.8,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: "18px" }}>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#6b7280",
              marginBottom: "6px",
            }}
          >
            CHAMADO #{ticket.number}
          </div>

          <div
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "var(--text, #111827)",
              marginBottom: "14px",
              lineHeight: 1.3,
            }}
          >
            {ticket.subject}
          </div>

          <div
            style={{
              display: "grid",
              gap: "8px",
              fontSize: "14px",
              color: "var(--muted, #6b7280)",
              marginBottom: "16px",
            }}
          >
            <div>
              <strong>Solicitante:</strong>{" "}
              {ticket.requester.name}
            </div>

            <div>
              <strong>Setor:</strong>{" "}
              {ticket.department.name}
            </div>

            <div>
              <strong>Prioridade:</strong>{" "}
              <span
                className={`badge ${priorityBadgeClass}`}
                style={{
                  display: "inline-block",
                  marginLeft: "4px",
                }}
              >
                {priorityText}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="btn"
            onClick={openTicket}
            style={{
              width: "100%",
              justifyContent: "center",
            }}
          >
            ABRIR CHAMADO
          </button>
        </div>
      </div>
    </div>
  );
}