# Central Operacional TI — Grau Técnico Cabo

Portal de chamados desenvolvido com Next.js 15, React 19, Prisma 6 e PostgreSQL.

## Interface reformulada

A experiência pública foi redesenhada com cabeçalho azul-marinho, destaques verdes, indicadores, informações rápidas, fluxo de abertura/acompanhamento e layout responsivo.

## Requisitos

- Node.js compatível com Next.js 15
- PostgreSQL (por exemplo, Neon)
- Variáveis de ambiente configuradas conforme `.env.example`

## Executar localmente

```bash
npm install
cp .env.example .env
```

Preencha `DATABASE_URL` e `SESSION_SECRET` no `.env`. Depois:

```bash
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Acesse `http://localhost:3000`.

> O seed cria setores, categorias, regras de SLA e contas iniciais. Troque as senhas iniciais antes de disponibilizar o sistema.

## Fluxo público

- `/portal`: página inicial pública.
- `/portal/new`: abertura de chamado.
- `/portal/tickets`: consulta por número do chamado e nome do solicitante.
- `/login`: acesso da equipe interna.
- `/tech` e `/admin`: painéis internos autenticados.

## Observação de segurança

A consulta pública por número e nome é uma validação simples, não uma autenticação forte: nomes podem ser conhecidos por terceiros. Para chamados com dados sensíveis, recomenda-se migrar para token aleatório de acompanhamento ou código enviado ao contato cadastrado, além de aplicar rate limiting na API pública.

Não versione `.env` ou `.env.local`. Configure as variáveis diretamente no ambiente de hospedagem.
