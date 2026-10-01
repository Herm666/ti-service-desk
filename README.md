# Central Operacional TI - Grau Cabo

Portal de chamados para o Grau Técnico Cabo, reconstruído para Vercel + PostgreSQL gerenciado e sem Docker.

## Arquitetura

- Next.js App Router
- TypeScript strict
- Prisma + PostgreSQL
- Sessão HTTP-only assinada
- Vercel Blob opcional para anexos
- Sem Docker
- Sem banco local obrigatório

## Desenvolvimento local

Requisitos: Node.js 20.19+ / 22.12+ / 24.x e uma URL PostgreSQL.

```bash
npm install
copy .env.example .env.local
```

Preencha `DATABASE_URL` e `SESSION_SECRET`.

```bash
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

## Primeiro acesso

- `hermeson@graucabo.local`
- `Troque@123`

Troque a senha antes de entregar o sistema.

## Vercel

1. Suba este projeto para um repositório GitHub novo.
2. Importe o repositório na Vercel.
3. Crie/associe um PostgreSQL pelo Marketplace e configure `DATABASE_URL`.
4. Configure `SESSION_SECRET`.
5. Para anexos, crie um Blob Store e configure `BLOB_READ_WRITE_TOKEN`.
6. Faça o deploy.
7. Depois de provisionar o banco, execute `npx prisma migrate deploy` contra o banco de produção ou use o fluxo de migrations da sua CI.

O banco é independente do deploy: novo deploy não apaga os chamados.
