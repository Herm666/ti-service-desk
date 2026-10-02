import "./globals.css";
import { getSessionUser } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";
import Link from "next/link";

export const metadata = {
  title: "Central Operacional TI | Grau Cabo",
  description: "Portal de atendimento de TI do Grau Técnico Cabo.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getSessionUser();

  return (
    <html lang="pt-BR">
      <body>
        {user ? (
          <div className="app-shell">
            <header className="staff-topbar">
              <Link href="/" className="brand-lockup">
                <span className="brand-mark">G<span>+</span></span>
                <span className="brand-copy"><strong>GRAU <em>TÉCNICO</em></strong><small>CENTRAL OPERACIONAL TI</small></span>
              </Link>
              <div className="staff-user"><span className="avatar">{user.name.slice(0,1).toUpperCase()}</span><span><strong>{user.name}</strong><small>{user.role === "REQUESTER" ? "Solicitante" : user.role === "TECHNICIAN" ? "Equipe de TI" : "Gestão de TI"}</small></span></div>
            </header>
            <div className="staff-layout">
              <Sidebar role={user.role} />
              <main className="staff-content">{children}</main>
            </div>
          </div>
        ) : <div className="public-shell">{children}</div>}
      </body>
    </html>
  );
}
