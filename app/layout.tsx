import "./globals.css";
import { getSessionUser } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";

export const metadata = { title: "TI Service Desk", description: "Sistema de chamados e ativos de TI" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) return <>{children}</>;
  return <div className="shell"><Sidebar user={user} /><main className="main">{children}</main></div>;
}
