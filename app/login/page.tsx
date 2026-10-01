import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";
export default async function Login(){ if(await getSessionUser()) redirect("/"); return <div className="login"><div className="login-card"><div className="eyebrow">GRAU CABO</div><h1>Central Operacional TI</h1><p className="muted">Abertura e acompanhamento de chamados.</p><LoginForm/></div></div>; }
