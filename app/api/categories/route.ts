import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, canManage } from "@/lib/auth";

export async function GET() {
  try {
    const items = await db.category.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        active: true,
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("GET /api/categories:", error);

    return NextResponse.json(
      { error: "Erro ao carregar categorias." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();

    if (!user || !canManage(user.role)) {
      return NextResponse.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const name = String(body.name || "").trim();

    if (!name) {
      return NextResponse.json(
        { error: "Informe o nome da categoria." },
        { status: 400 }
      );
    }

    const existing = await db.category.findUnique({
      where: { name },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Esta categoria já está cadastrada." },
        { status: 409 }
      );
    }

    const category = await db.category.create({
      data: {
        name,
        active: true,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("POST /api/categories:", error);

    return NextResponse.json(
      { error: "Erro ao cadastrar categoria." },
      { status: 500 }
    );
  }
}