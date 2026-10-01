import { db } from "@/lib/db";
import { getSessionUser, canWork } from "@/lib/auth";
import { TicketStatus, Priority } from "@prisma/client";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await getSessionUser(); if (!u) return Response.json({ error: "Não autenticado" }, { status: 401 });
  const { id } = await params; const current = await db.ticket.findUnique({ where: { id } });
  if (!current) return Response.json({ error: "Chamado não encontrado" }, { status: 404 });
  const b = await req.json();
  if (!canWork(u.role)) {
    if (current.requesterId !== u.id || !["OPEN"].includes(b.status)) return Response.json({ error: "Sem permissão" }, { status: 403 });
    const t = await db.ticket.update({ where: { id }, data: { status: TicketStatus.OPEN, resolvedAt: null, closedAt: null } });
    await db.ticketHistory.create({ data: { ticketId: id, userId: u.id, action: "REABERTO", details: "Chamado reaberto pelo solicitante" } });
    return Response.json(t);
  }
  if (b.status && !Object.values(TicketStatus).includes(b.status)) return Response.json({ error: "Status inválido" }, { status: 400 });
  if (b.priority && !Object.values(Priority).includes(b.priority)) return Response.json({ error: "Prioridade inválida" }, { status: 400 });
  const data: any = {};
  if (b.status) data.status = b.status;
  if (b.priority) data.priority = b.priority;
  if ("assigneeId" in b) data.assigneeId = b.assigneeId || null;
  if (b.status === "RESOLVED") data.resolvedAt = new Date();
  if (b.status !== "RESOLVED") data.resolvedAt = null;
  if (b.status === "CLOSED") data.closedAt = new Date();
  if (b.status !== "CLOSED") data.closedAt = null;
  const t = await db.ticket.update({ where: { id }, data });
  const detail = [b.status && `status=${b.status}`, b.priority && `prioridade=${b.priority}`, "assigneeId" in b && `técnico=${b.assigneeId || "não atribuído"}`].filter(Boolean).join("; ");
  await db.ticketHistory.create({ data: { ticketId: id, userId: u.id, action: "ATUALIZAÇÃO", details: detail || "Chamado atualizado" } });
  await db.auditLog.create({ data: { userId: u.id, action: "TICKET_UPDATE", entity: "Ticket", entityId: id, details: detail || "Chamado atualizado" } });
  return Response.json(t);
}
