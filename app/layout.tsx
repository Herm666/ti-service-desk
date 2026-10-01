import "./globals.css";
import { getSessionUser } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";

export const metadata = { title: "Central Operacional TI - Grau Cabo", description: "Central de atendimento de TI" };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getSessionUser();
  if (!user) return <div className="shell">{children}</div>;
  return <div className="shell"><header className="top"><div className="brand">GRAU CABO <small>CENTRAL OPERACIONAL TI</small></div><div className="muted">{user.name}</div></header><div className="layout"><Sidebar role={user.role}/><main className="content">{children}</main></div></div>;
}
