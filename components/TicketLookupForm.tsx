"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function TicketLookupForm() {
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`/api/tickets/lookup?number=${encodeURIComponent(number)}&name=${encodeURIComponent(name.trim())}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || "Não foi possível localizar o chamado.");
        setLoading(false);
        return;
      }
      router.push(`/portal/tickets/${data.id}?name=${encodeURIComponent(name.trim())}`);
    } catch {
      setError("Falha de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  return <form className="form" onSubmit={submit}>
    <div className="grid grid2">
      <div className="field"><label>Número do chamado *</label><input required type="number" min="1" step="1" value={number} onChange={e => setNumber(e.target.value)} placeholder="Ex.: 1025" /></div>
      <div className="field"><label>Nome do solicitante *</label><input required value={name} onChange={e => setName(e.target.value)} placeholder="Nome informado na abertura" /></div>
    </div>
    {error && <div className="error" role="alert">{error}</div>}
    <div className="actions"><button className="btn" disabled={loading}>{loading ? "Consultando..." : "Consultar chamado"}</button></div>
  </form>;
}
