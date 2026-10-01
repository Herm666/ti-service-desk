"use client";
import { useState } from "react";

const profiles = [
  { id: "USER", label: "Solicitante", icon: "👤", text: "Abrir e acompanhar meus chamados" },
  { id: "TECHNICIAN", label: "Técnico", icon: "🛠️", text: "Atender fila, SLA e inventário" },
  { id: "ADMIN", label: "Administrador", icon: "⚙️", text: "Gerenciar toda a operação" },
];

export default function Login() {
  const [profile, setProfile] = useState("USER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    const r = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, profile }) });
    const j = await r.json();
    setLoading(false);
    if (r.ok) location.href = j.redirect;
    else setError(j.error || "Falha no login");
  }

  return <div className="login"><div className="login-card wide">
    <div className="login-logo">🛠️</div><h1>TI Service Desk</h1><p className="muted">Central de serviços de TI</p>
    <div className="profile-grid">{profiles.map(p => <button type="button" key={p.id} className={`profile-card ${profile === p.id ? "selected" : ""}`} onClick={() => setProfile(p.id)}><span>{p.icon}</span><b>{p.label}</b><small>{p.text}</small></button>)}</div>
    {error && <p className="error">{error}</p>}
    <form className="form" onSubmit={submit}><div className="field"><label>E-mail</label><input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="seu.email@empresa.com" /></div><div className="field"><label>Senha</label><input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Sua senha" /></div><button className="btn" disabled={loading}>{loading ? "Entrando..." : `Entrar como ${profiles.find(p => p.id === profile)?.label}`}</button></form>
    <div className="demo-box"><b>Usuários de demonstração</b><br/>Solicitante: usuario@tiservice.local / Admin@123<br/>Técnico: tecnico@tiservice.local / Admin@123<br/>Administrador: admin@tiservice.local / Admin@123</div>
  </div></div>;
}
