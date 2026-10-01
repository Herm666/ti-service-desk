"use client";
import { useState } from "react";
export default function AssetDeleteButton({ id, tag }: { id: string; tag: string }) {
  const [busy, setBusy] = useState(false);
  async function remove() {
    if (!confirm(`Excluir definitivamente o ativo ${tag}?\n\nEssa ação remove o cadastro e o histórico do ativo.`)) return;
    setBusy(true); const r = await fetch(`/api/assets/${id}`, { method: "DELETE" });
    if (r.ok) location.reload(); else { const j = await r.json(); alert(j.error || "Não foi possível excluir."); setBusy(false); }
  }
  return <button className="btn danger small" disabled={busy} onClick={remove}>{busy ? "Excluindo..." : "Excluir"}</button>;
}
