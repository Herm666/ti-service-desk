import Link from "next/link";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export default async function PortalDashboard() {
  const u = await getSessionUser(); if (!u) return null;
  const where = { requesterId: u.id };
  const [total, open, progress, resolved, overdue, recent] = await Promise.all([
    db.ticket.count({ where }),
    db.ticket.count({ where: { ...where, status: { in: ["OPEN", "TRIAGE", "ASSIGNED"] } } }),
    db.ticket.count({ where: { ...where, status: { in: ["IN_PROGRESS", "PENDING"] } } }),
    db.ticket.count({ where: { ...where, status: { in: ["RESOLVED", "CLOSED"] } } }),
    db.ticket.count({ where: { ...where, dueAt: { lt: new Date() }, status: { notIn: ["RESOLVED", "CLOSED", "CANCELLED"] } } }),
    db.ticket.findMany({ where, orderBy: { createdAt: "desc" }, take: 6, include: { category: true, assignee: true } })
  ]);
  return <><div className="topbar"><div><div className="eyebrow">PORTAL DO SOLICITANTE</div><div className="title">Olá, {u.name.split(" ")[0]} 👋</div><div className="muted">Acompanhe suas solicitações de TI em um só lugar.</div></div><Link className="btn" href="/portal/new">+ Abrir chamado</Link></div>
    <div className="grid grid4"><Metric label="Meus chamados" value={total} /><Metric label="Abertos" value={open} /><Metric label="Em atendimento" value={progress} /><Metric label="Resolvidos" value={resolved} /></div>
    <div className="grid grid3 portal-grid"><div className="card span2"><div className="between"><h3>Chamados recentes</h3><Link className="link" href="/portal/tickets">Ver todos</Link></div><table className="table"><thead><tr><th>#</th><th>Assunto</th><th>Status</th><th>Técnico</th></tr></thead><tbody>{recent.map(t => <tr key={t.id}><td><Link href={`/portal/tickets/${t.id}`}>#{t.number}</Link></td><td>{t.title}<div className="muted small">{t.category?.name || "Sem categoria"}</div></td><td><span className={`badge ${t.status === "RESOLVED" || t.status === "CLOSED" ? "green" : t.status === "IN_PROGRESS" ? "blue" : "orange"}`}>{statusLabel(t.status)}</span></td><td>{t.assignee?.name || "Aguardando atribuição"}</td></tr>)}</tbody></table></div><div className="card"><h3>Atalhos</h3><div className="quick-links"><Link href="/portal/new">➕ <b>Novo chamado</b><small>Solicitar suporte</small></Link><Link href="/portal/tickets">📋 <b>Meus chamados</b><small>Consultar andamento</small></Link><Link href="/portal/knowledge">📚 <b>Autoatendimento</b><small>Ver soluções</small></Link></div><div className="notice">{overdue > 0 ? `Você tem ${overdue} chamado(s) fora do SLA.` : "Nenhum chamado seu está fora do SLA."}</div></div></div></>;
}
function Metric({ label, value }: { label: string; value: number }) { return <div className="card"><div className="muted">{label}</div><div className="metric">{value}</div></div>; }
function statusLabel(s: string) { const m: Record<string,string> = { OPEN:"Aberto", TRIAGE:"Triagem", ASSIGNED:"Atribuído", IN_PROGRESS:"Em atendimento", PENDING:"Aguardando", RESOLVED:"Resolvido", CLOSED:"Fechado", CANCELLED:"Cancelado" }; return m[s] || s; }
