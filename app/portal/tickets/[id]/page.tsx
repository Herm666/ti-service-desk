import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { TicketDetail } from "@/components/TicketDetail";

export default async function Page({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ name?: string }>;
}) {
  const { id } = await params;
  const { name } = await searchParams;
  if (!name?.trim()) redirect("/portal/tickets");

  const ticket = await db.ticket.findUnique({
    where: { id },
    include: {
      requester: true, assignee: true, department: true, category: true,
      messages: { where: { internal: false }, orderBy: { createdAt: "asc" }, include: { author: true } },
      attachments: true,
    },
  });
  if (!ticket || ticket.requester.name.trim().toLocaleLowerCase("pt-BR") !== name.trim().toLocaleLowerCase("pt-BR")) notFound();

  return <main className="public-main">
    <div className="between"><div><div className="eyebrow">ACOMPANHAMENTO</div><h1 className="title">Chamado #{ticket.number}</h1><p className="muted">Acompanhe o histórico e o status da solicitação.</p></div><Link className="btn secondary" href="/portal/tickets">← Consultar outro chamado</Link></div>
    <div className="spacer" /><TicketDetail ticket={ticket} publicView />
  </main>;
}
