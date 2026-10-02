import { db } from "@/lib/db";
import { NewTicketForm } from "@/components/NewTicketForm";
import Link from "next/link";

export default async function NewTicket() {
  const [categories, departments] = await Promise.all([
    db.category.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    db.department.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <main className="public-main">
      <div className="between">
        <div><div className="eyebrow">CENTRAL OPERACIONAL TI</div><h1 className="title">Abrir novo chamado</h1><p className="muted">Informe os dados e descreva a necessidade. Os campos com asterisco são obrigatórios.</p></div>
        <Link className="btn secondary" href="/portal">← Voltar ao início</Link>
      </div>
      <div className="spacer" />
      {departments.length === 0 || categories.length === 0 ? (
        <div className="card"><h2>Portal em configuração</h2><p className="muted">Ainda não há setores ou categorias cadastrados. A equipe administradora precisa executar o cadastro inicial do sistema.</p></div>
      ) : (
        <div className="card"><NewTicketForm categories={categories} departments={departments} defaultDepartment={departments[0]?.id || ""} /></div>
      )}
    </main>
  );
}
