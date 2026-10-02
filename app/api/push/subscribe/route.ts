import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const endpoint = body?.endpoint;
    const p256dh = body?.keys?.p256dh;
    const auth = body?.keys?.auth;

    if (
      typeof endpoint !== "string" ||
      typeof p256dh !== "string" ||
      typeof auth !== "string"
    ) {
      return NextResponse.json(
        { error: "Assinatura Push inválida." },
        { status: 400 }
      );
    }

    const subscription = await db.pushSubscription.upsert({
      where: {
        endpoint,
      },
      update: {
        userId: user.id,
        p256dh,
        auth,
      },
      create: {
        userId: user.id,
        endpoint,
        p256dh,
        auth,
      },
    });

    return NextResponse.json({
      success: true,
      id: subscription.id,
    });
  } catch (error) {
    console.error("POST /api/push/subscribe:", error);

    return NextResponse.json(
      { error: "Erro ao registrar notificações." },
      { status: 500 }
    );
  }
}