import Link from "next/link";
import { TicketLookupForm } from "@/components/TicketLookupForm";

export default function Tickets() {
  return <main className="public-main">
    <div className="between"><div><div className="eyebrow">ACOMPANHAMENTO</div><h1 className="title">Consultar chamado</h1><p className="muted">Informe o número do chamado e o nome utilizado na abertura.</p></div><Link className="btn secondary" href="/portal">← Início</Link></div>
    <div className="spacer" />
    <section className="card"><TicketLookupForm /></section>
    <div className="spacer" />
    <section className="card"><div className="between"><div><h2>Precisa registrar uma nova solicitação?</h2><p className="muted">Descreva o problema para que a equipe de TI possa avaliar e direcionar o atendimento.</p></div><Link className="btn" href="/portal/new">＋ Abrir chamado</Link></div></section>
  </main>;
}
