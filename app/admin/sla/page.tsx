import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser, canManage } from "@/lib/auth";
import { SlaManager } from "@/components/SlaManager";

export default async function SlaPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (!canManage(user.role)) {
    redirect("/admin");
  }

  const slas = await db.sla.findMany({
    orderBy: {
      responseMins: "desc",
    },
  });

  const safeSlas = slas.map((sla) => ({
    id: sla.id,
    name: sla.name,
    priority: sla.priority as
      | "LOW"
      | "MEDIUM"
      | "HIGH"
      | "CRITICAL",
    responseMins: sla.responseMins,
    resolutionMins: sla.resolutionMins,
    active: sla.active,
  }));

  return (
    <main>
      <div className="between">
        <div>
          <div className="eyebrow">
            ADMINISTRAÇÃO
          </div>

          <h1 className="title">
            Gestão de SLA
          </h1>

          <p className="muted">
            Configure os prazos operacionais de
            atendimento e resolução dos chamados.
          </p>
        </div>

        <a
          href="/admin"
          className="btn secondary"
        >
          ← Voltar ao painel
        </a>
      </div>

      <div className="spacer" />

      <SlaManager initialSlas={safeSlas} />
    </main>
  );
}