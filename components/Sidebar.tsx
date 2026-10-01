import Link from "next/link";
import { nav } from "@/lib/ui";
import { logoutAction } from "./logout-action";
import type { Role } from "@prisma/client";

export function Sidebar({ role }: { role: Role }) {
  return <aside className="side">{nav.filter(n => n.roles.includes(role)).map(n => <Link key={n.href} href={n.href}>{n.label}</Link>)}<form action={logoutAction}><button className="logout">Sair</button></form></aside>;
}
