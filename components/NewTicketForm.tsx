"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Option = { id: string; name: string };

export function NewTicketForm({ categories, departments, defaultDepartment }: { categories: Option[]; departments: Option[]; defaultDepartment: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [departmentId, setDepartmentId] = useState(defaultDepartment);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, subject, description, priority, categoryId, departmentId }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || "Não foi possível abrir o chamado.");
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
      <div className="field"><label>Nome completo *</label><input required maxLength={120} value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" /></div>
      <div className="field"><label>E-mail para contato *</label><input required type="email" maxLength={180} value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@empresa.com" /></div>
    </div>
    <div className="grid grid2">
      <div className="field"><label>Setor *</label><select required value={departmentId} onChange={e => setDepartmentId(e.target.value)}><option value="">Selecione seu setor</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
      <div className="field"><label>Categoria *</label><select required value={categoryId} onChange={e => setCategoryId(e.target.value)}><option value="">Selecione a categoria</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
    </div>
    <div className="grid grid2">
      <div className="field"><label>Assunto *</label><input required maxLength={160} value={subject} onChange={e => setSubject(e.target.value)} placeholder="Ex.: Computador sem acesso à internet" /></div>
      <div className="field"><label>Prioridade percebida</label><select value={priority} onChange={e => setPriority(e.target.value)}><option value="LOW">Baixa</option><option value="MEDIUM">Média</option><option value="HIGH">Alta</option><option value="CRITICAL">Crítica</option></select><small className="muted">A equipe de TI poderá ajustar a prioridade após a triagem.</small></div>
    </div>
    <div className="field"><label>Descrição do problema *</label><textarea required maxLength={5000} value={description} onChange={e => setDescription(e.target.value)} placeholder="Informe o equipamento, local, mensagem de erro, quando começou e o que já foi tentado." /></div>
    {error && <div className="error" role="alert">{error}</div>}
    <div className="actions"><button className="btn" disabled={loading}>{loading ? "Registrando chamado..." : "✓ Registrar chamado"}</button><button type="button" className="btn secondary" onClick={() => router.push("/portal")}>Cancelar</button></div>
  </form>;
}
