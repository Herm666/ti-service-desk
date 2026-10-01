import { db } from "./db";
import type { Priority, TicketStatus } from "@prisma/client";

export const ACTIVE_STATUSES: TicketStatus[] = ["OPEN", "IN_PROGRESS", "WAITING"];

export function priorityLabel(p: Priority) { return { LOW: "Baixa", MEDIUM: "Média", HIGH: "Alta", CRITICAL: "Crítica" }[p]; }
export function statusLabel(s: TicketStatus) { return { OPEN: "Aberto", IN_PROGRESS: "Em atendimento", WAITING: "Em espera", RESOLVED: "Resolvido", CLOSED: "Fechado", CANCELLED: "Cancelado" }[s]; }

export async function nextDueAt(priority: Priority) {
  const sla = await db.sla.findUnique({ where: { priority } });
  if (!sla) return null;
  return new Date(Date.now() + sla.resolutionMins * 60_000);
}
