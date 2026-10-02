import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const number = Number(searchParams.get("number"));
  const name = (searchParams.get("name") || "").trim();

  if (!Number.isSafeInteger(number) || number < 1 || !name) {
    return NextResponse.json({ error: "Informe o número do chamado e o nome do solicitante." }, { status: 400 });
  }

  const ticket = await db.ticket.findUnique({
    where: { number },
    select: { id: true, number: true, requester: { select: { name: true } } },
  });

  if (!ticket || ticket.requester.name.trim().toLocaleLowerCase("pt-BR") !== name.toLocaleLowerCase("pt-BR")) {
    return NextResponse.json({ error: "Chamado não encontrado. Confira o número e o nome informado." }, { status: 404 });
  }

  return NextResponse.json({ id: ticket.id, number: ticket.number });
}
