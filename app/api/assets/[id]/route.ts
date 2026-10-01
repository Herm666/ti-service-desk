import { db } from "@/lib/db";
import { getSessionUser, canWork } from "@/lib/auth";
function clean(v: unknown) { return typeof v === "string" && v.trim() ? v.trim() : null; }
function dateOrNull(v: unknown) { if (!v) return null; const d = new Date(String(v)); return Number.isNaN(d.getTime()) ? null : d; }
function numOrNull(v: unknown) { if (v === "" || v === null || v === undefined) return null; const n = Number(v); return Number.isFinite(n) ? n : null; }
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await getSessionUser(); if (!u) return Response.json({ error: "Não autenticado" }, { status: 401 });
  const { id } = await params; const asset = await db.asset.findUnique({ where: { id }, include: { department: true, owner: true, histories: { orderBy: { createdAt: "desc" } } } });
  if (!asset) return Response.json({ error: "Ativo não encontrado" }, { status: 404 }); return Response.json(asset);
}
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await getSessionUser(); if (!u || !canWork(u.role)) return Response.json({ error: "Sem permissão" }, { status: 403 });
  const { id } = await params; const b = await req.json();
  try { const current = await db.asset.findUnique({ where: { id } }); if (!current) return Response.json({ error: "Ativo não encontrado" }, { status: 404 });
    const asset = await db.asset.update({ where: { id }, data: { tag: clean(b.tag)!, name: clean(b.name)!, type: clean(b.type)!, manufacturer: clean(b.manufacturer), model: clean(b.model), serial: clean(b.serial), hostname: clean(b.hostname), ip: clean(b.ip), mac: clean(b.mac), operatingSystem: clean(b.operatingSystem), processor: clean(b.processor), ram: clean(b.ram), storage: clean(b.storage), location: clean(b.location), locationDetail: clean(b.locationDetail), status: b.status || current.status, departmentId: clean(b.departmentId), ownerId: clean(b.ownerId), supplier: clean(b.supplier), acquisitionCost: numOrNull(b.acquisitionCost), purchaseDate: dateOrNull(b.purchaseDate), warrantyUntil: dateOrNull(b.warrantyUntil), notes: clean(b.notes) } });
    await db.assetHistory.create({ data: { assetId: id, userId: u.id, action: "UPDATED", details: `Ativo ${asset.tag} atualizado.` } }); return Response.json(asset);
  } catch (e: any) { return Response.json({ error: e?.code === "P2002" ? "O patrimônio informado já existe." : e?.message || "Erro ao atualizar ativo." }, { status: 400 }); }
}
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await getSessionUser(); if (!u || u.role !== "ADMIN") return Response.json({ error: "Somente administradores podem excluir ativos." }, { status: 403 });
  const { id } = await params; const asset = await db.asset.findUnique({ where: { id } }); if (!asset) return Response.json({ error: "Ativo não encontrado" }, { status: 404 });
  await db.asset.delete({ where: { id } }); await db.auditLog.create({ data: { userId: u.id, action: "DELETE", entity: "Asset", entityId: id, details: `Ativo ${asset.tag} - ${asset.name} excluído.` } }); return Response.json({ ok: true });
}
