import Link from "next/link";

export default function Sidebar({ user }: { user: any }) {
  const groups: Record<string, { label: string; path: string }[]> = {
    USER: [
      { path: "/portal", label: "Dashboard" }, { path: "/portal/tickets", label: "Meus chamados" }, { path: "/portal/new", label: "Abrir chamado" }, { path: "/portal/knowledge", label: "Base de conhecimento" }, { path: "/portal/profile", label: "Meu perfil" },
    ],
    TECHNICIAN: [
      { path: "/tech", label: "Dashboard técnico" }, { path: "/tech/tickets", label: "Fila de atendimento" }, { path: "/tech/assets", label: "Inventário" }, { path: "/tech/knowledge", label: "Base de conhecimento" }, { path: "/tech/reports", label: "Relatórios" },
    ],
    ADMIN: [
      { path: "/admin", label: "Dashboard administrativo" }, { path: "/admin/tickets", label: "Chamados" }, { path: "/admin/users", label: "Usuários" }, { path: "/admin/assets", label: "Inventário" }, { path: "/admin/categories", label: "Categorias" }, { path: "/admin/sla", label: "SLA" }, { path: "/admin/audit", label: "Auditoria" },
    ],
  };
  const links = groups[user.role] || groups.USER;
  return <aside className="sidebar"><div className="brand">🛠️ TI Service Desk</div><div className="role-chip">{user.role === "USER" ? "PORTAL DO SOLICITANTE" : user.role === "TECHNICIAN" ? "PAINEL DO TÉCNICO" : "PAINEL ADMINISTRATIVO"}</div><div className="userbox"><b>{user.name}</b><span>{user.email}</span>{user.department?.name && <span>{user.department.name}</span>}</div><nav className="nav">{links.map(l => <Link key={l.path} href={l.path}>{l.label}</Link>)}</nav><form action="/api/auth/logout" method="post" className="logout"><button className="btn secondary" style={{ width: "100%" }}>Sair</button></form></aside>;
}
