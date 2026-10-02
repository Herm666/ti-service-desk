import Link from "next/link";
import { db } from "@/lib/db";
import { ACTIVE_STATUSES } from "@/lib/ticket";

export default async function Portal() {
  const [total, open, waiting, completed, departments] = await Promise.all([
    db.ticket.count(),
    db.ticket.count({ where: { status: "OPEN" } }),
    db.ticket.count({ where: { status: "WAITING" } }),
    db.ticket.count({ where: { status: { in: ["RESOLVED", "CLOSED"] } } }),
    db.department.count({ where: { active: true } }),
  ]);

  return (
    <>
      <header className="public-header">
        <Link href="/portal" className="brand-lockup">
          <span className="brand-mark">grau<span>+</span></span>
          <span className="brand-copy"><strong>GRAU <em>TÉCNICO</em></strong><small>CABO • CENTRAL OPERACIONAL TI</small></span>
        </Link>
        <div className="header-title"><strong>Portal de Chamados de TI</strong><span>Mais organização, agilidade e transparência no suporte de TI.</span></div>
        <nav className="header-actions">
          <Link className="btn" href="/portal/new">＋ Novo chamado</Link>
          <Link className="btn ghost" href="/portal/tickets">Consultar chamado</Link>
        </nav>
      </header>

      <main className="public-main">
        <section className="dashboard-grid">
          <div className="welcome-card">
            <div className="welcome-row">
              <div><div className="eyebrow">CENTRAL DE ATENDIMENTO</div><h1 className="title">Tecnologia a serviço de você.</h1><p className="muted">Bem-vindo ao Portal de Chamados de TI do Grau Técnico Cabo. Registre sua solicitação e acompanhe o atendimento em um só lugar.</p></div>
              <div className="mini-logo">G<span>+</span></div>
            </div>
            <div className="metric-grid">
              <div className="metric-card"><div className="metric-icon">▤</div><div><span className="metric-label">Abertos</span><strong className="metric-value">{open}</strong></div></div>
              <div className="metric-card"><div className="metric-icon">◷</div><div><span className="metric-label">Em espera</span><strong className="metric-value">{waiting}</strong></div></div>
              <div className="metric-card"><div className="metric-icon">✓</div><div><span className="metric-label">Concluídos</span><strong className="metric-value">{completed}</strong></div></div>
              <div className="metric-card"><div className="metric-icon">▣</div><div><span className="metric-label">Total registrado</span><strong className="metric-value">{total}</strong></div></div>
            </div>
            <div className="quick-actions"><div className="search-hint">⌕ &nbsp; Para acompanhar, consulte pelo número do chamado e nome.</div><Link className="btn" href="/portal/tickets">Consultar →</Link><Link className="btn secondary" href="/portal/new">＋ Novo chamado</Link></div>
          </div>

          <aside className="info-card">
            <div className="campus-image"><div><strong>grau técnico</strong><span>Educação que aproxima você do seu futuro.</span></div></div>
            <div className="info-content">
              <h2>Informações rápidas</h2>
              <div className="info-row"><div className="info-icon">◷</div><div><strong>Horário de atendimento</strong><span>Segunda a sexta, das 07h30 às 16h30.</span></div></div>
              <div className="info-row"><div className="info-icon">♙</div><div><strong>Equipe de TI</strong><span>Atendimento centralizado para os setores da unidade.</span></div></div>
              <div className="info-row"><div className="info-icon">⌘</div><div><strong>Setores atendidos</strong><span>{departments} setores cadastrados na central.</span></div></div>
              <div className="info-row"><div className="info-icon">✦</div><div><strong>Precisa de ajuda?</strong><span>Descreva o problema com detalhes para agilizar o diagnóstico.</span></div></div>
            </div>
          </aside>
        </section>

        <section className="bottom-grid">
          <div className="bottom-card"><div className="eyebrow">SIMPLES E ORGANIZADO</div><h2>Como funciona?</h2><p className="muted">Solicitar atendimento é simples. Em poucos passos, sua demanda fica registrada e pode ser acompanhada.</p><div className="steps"><div className="step"><div className="step-icon">▤</div><strong>1. Registre</strong><p>Informe o assunto, setor e descrição do problema.</p></div><div className="step"><div className="step-icon">◷</div><strong>2. Acompanhe</strong><p>Consulte o andamento pelo número e nome.</p></div><div className="step"><div className="step-icon">✓</div><strong>3. Conclua</strong><p>O histórico do atendimento fica registrado.</p></div></div></div>
          <div className="bottom-card"><div className="eyebrow">GESTÃO E TRANSPARÊNCIA</div><h2>Principais benefícios</h2><ul className="benefit-list"><li><span className="check">✓</span> Centralização das solicitações em um único ambiente.</li><li><span className="check">✓</span> Mais agilidade na triagem e priorização dos chamados.</li><li><span className="check">✓</span> Histórico, responsável e evolução do atendimento registrados.</li><li><span className="check">✓</span> Indicadores para apoiar decisões e melhorias.</li><li><span className="check">✓</span> Menos perda de informações em conversas paralelas no WhatsApp.</li></ul></div>
        </section>

        <footer className="closing-banner"><div><strong>Tecnologia a serviço de uma operação mais organizada, eficiente e transparente.</strong><br/><span>Central Operacional TI • Grau Técnico Cabo</span></div><div className="closing-points"><span>✓ Mais controle</span><span>✓ Mais produtividade</span><span>✓ Melhor gestão</span></div></footer>
      </main>
    </>
  );
}
