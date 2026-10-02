"use client";

import { useState } from "react";

type Sla = {
  id: string;
  name: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  responseMins: number;
  resolutionMins: number;
  active: boolean;
};

function priorityLabel(priority: Sla["priority"]) {
  switch (priority) {
    case "LOW":
      return "Baixa";
    case "MEDIUM":
      return "Média";
    case "HIGH":
      return "Alta";
    case "CRITICAL":
      return "Crítica";
  }
}

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} min`;

  if (minutes % 60 === 0) {
    const hours = minutes / 60;

    if (hours >= 24 && hours % 24 === 0) {
      const days = hours / 24;
      return `${days} dia${days > 1 ? "s" : ""}`;
    }

    return `${hours}h`;
  }

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  return `${hours}h ${remaining}min`;
}

export function SlaManager({
  initialSlas,
}: {
  initialSlas: Sla[];
}) {
  const [slas, setSlas] = useState(initialSlas);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    priority: "LOW" as Sla["priority"],
    responseMins: "",
    resolutionMins: "",
    active: true,
  });

  function startEdit(sla: Sla) {
    setEditing(sla.id);

    setForm({
      name: sla.name,
      priority: sla.priority,
      responseMins: String(sla.responseMins),
      resolutionMins: String(sla.resolutionMins),
      active: sla.active,
    });

    setMessage("");
  }

  function cancelEdit() {
    setEditing(null);
    setMessage("");
  }

  async function save() {
    if (!editing) return;

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/sla/${editing}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          priority: form.priority,
          responseMins: Number(form.responseMins),
          resolutionMins: Number(form.resolutionMins),
          active: form.active,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Erro ao atualizar SLA."
        );
      }

      setSlas((current) =>
        current.map((sla) =>
          sla.id === data.id ? data : sla
        )
      );

      setEditing(null);
      setMessage("SLA atualizado com sucesso.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Erro ao atualizar SLA."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {message && (
        <div
          className="card"
          style={{ marginBottom: 20 }}
        >
          <strong>{message}</strong>
        </div>
      )}

      <div className="grid grid-4">
        {slas.map((sla) => {
          const isEditing = editing === sla.id;

          return (
            <div key={sla.id} className="card">
              <div className="eyebrow">
                PRIORIDADE
              </div>

              <h2 style={{ marginTop: 8 }}>
                {priorityLabel(sla.priority)}
              </h2>

              {!isEditing ? (
                <>
                  <p className="muted">
                    {sla.name}
                  </p>

                  <div className="spacer" />

                  <div>
                    <div className="muted">
                      Tempo de resposta
                    </div>

                    <strong style={{ fontSize: 24 }}>
                      {formatMinutes(sla.responseMins)}
                    </strong>
                  </div>

                  <div className="spacer" />

                  <div>
                    <div className="muted">
                      Tempo de resolução
                    </div>

                    <strong style={{ fontSize: 24 }}>
                      {formatMinutes(sla.resolutionMins)}
                    </strong>
                  </div>

                  <div className="spacer" />

                  <span
                    className="badge"
                    style={{
                      background: sla.active
                        ? "#dcfce7"
                        : "#fee2e2",
                      color: sla.active
                        ? "#166534"
                        : "#991b1b",
                    }}
                  >
                    {sla.active ? "ATIVO" : "INATIVO"}
                  </span>

                  <div className="spacer" />

                  <button
                    className="btn secondary"
                    onClick={() => startEdit(sla)}
                  >
                    Editar SLA
                  </button>
                </>
              ) : (
                <>
                  <div className="field">
                    <label>Nome</label>

                    <input
                      value={form.name}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="field">
                    <label>Prioridade</label>

                    <select
                      value={form.priority}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          priority:
                            e.target.value as Sla["priority"],
                        })
                      }
                    >
                      <option value="LOW">Baixa</option>
                      <option value="MEDIUM">Média</option>
                      <option value="HIGH">Alta</option>
                      <option value="CRITICAL">Crítica</option>
                    </select>
                  </div>

                  <div className="field">
                    <label>Resposta (minutos)</label>

                    <input
                      type="number"
                      min="1"
                      value={form.responseMins}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          responseMins: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="field">
                    <label>Resolução (minutos)</label>

                    <input
                      type="number"
                      min="1"
                      value={form.resolutionMins}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          resolutionMins: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="field">
                    <label>Status</label>

                    <select
                      value={form.active ? "true" : "false"}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          active: e.target.value === "true",
                        })
                      }
                    >
                      <option value="true">Ativo</option>
                      <option value="false">Inativo</option>
                    </select>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      marginTop: 16,
                    }}
                  >
                    <button
                      className="btn"
                      onClick={save}
                      disabled={saving}
                    >
                      {saving ? "Salvando..." : "Salvar"}
                    </button>

                    <button
                      className="btn secondary"
                      onClick={cancelEdit}
                      disabled={saving}
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}