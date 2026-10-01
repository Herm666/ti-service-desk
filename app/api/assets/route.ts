import { db } from "@/lib/db";
import { getSessionUser, canWork } from "@/lib/auth";

function clean(v: unknown) { return typeof v === "string" && v.trim() ? v.trim() : null; }
function dateOrNull(v: unknown) { if (!v) return null; const d = new Date(String(v)); return Number.isNaN(d.getTime()) ? null : d; }
function numOrNull(v: unknown) { if (v === "" || v === null || v === undefined) return null; const n = Number(v); return Number.isFinite(n) ? n : null; }

export async function GET(req: Request) {
  const u = await getSessionUser();
  if (!u) return Response.json({ error: "Não autenticado" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const status = searchParams.get("status") || "";
  const type = searchParams.get("type") || "";
  const where: any = {};
  if (q) where.OR = [
    { tag: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } },
    { serial: { contains: q, mode: "insensitive" } }, { hostname: { contains: q, mode: "insensitive" } },
    { ip: { contains: q, mode: "insensitive" } }, { mac: { contains: q, mode: "insensitive" } },
  ];
  if (status) where.status = status;
  if (type) where.type = type;
  const assets = await db.asset.findMany({ where, orderBy: { createdAt: "desc" }, include: { department: true, owner: true } });
  return Response.json(assets);
}

export async function POST(req: Request) {
  const u = await getSessionUser();
  if (!u || !canWork(u.role)) return Response.json({ error: "Sem permissão" }, { status: 403 });
  try {
    const b = await req.json();
    if (!clean(b.tag) || !clean(b.name) || !clean(b.type)) return Response.json({ error: "Patrimônio, nome e tipo são obrigatórios." }, { status: 400 });
    const asset = await db.asset.create({ data: {
      tag: clean(b.tag)!, name: clean(b.name)!, type: clean(b.type)!, manufacturer: clean(b.manufacturer), model: clean(b.model), serial: clean(b.serial), hostname: clean(b.hostname), ip: clean(b.ip), mac: clean(b.mac), operatingSystem: clean(b.operatingSystem), processor: clean(b.processor), ram: clean(b.ram), storage: clean(b.storage), location: clean(b.location), locationDetail: clean(b.locationDetail), status: b.status || "ACTIVE", departmentId: clean(b.departmentId), ownerId: clean(b.ownerId), supplier: clean(b.supplier), acquisitionCost: numOrNull(b.acquisitionCost), purchaseDate: dateOrNull(b.purchaseDate), warrantyUntil: dateOrNull(b.warrantyUntil), notes: clean(b.notes),
    }});
    await db.assetHistory.create({ data: { assetId: asset.id, userId: u.id, action: "CREATED", details: `Ativo ${asset.tag} cadastrado.` } });
    return Response.json(asset, { status: 201 });
  } catch (e: any) { return Response.json({ error: e?.code === "P2002" ? "O patrimônio informado já existe." : e?.message || "Erro ao cadastrar ativo." }, { status: 400 }); }
}
