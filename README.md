# TI Service Desk — V4 GLPI Style

Sistema de gestão de TI com três experiências:
- Solicitante: portal de abertura e acompanhamento de chamados.
- Técnico: fila operacional, SLA, atribuição, notas internas e inventário.
- Administrador: gestão completa de usuários, ativos, categorias, SLA, relatórios e auditoria.

## Arquitetura de produção

| Componente | Função |
|---|---|
| Vercel | Frontend + API/backend |
| PostgreSQL gerenciado | Chamados, usuários, setores, histórico, SLA |
| Storage (Vercel Blob) | Prints, PDFs, fotos e outros anexos |
| Domínio próprio | Endereço profissional |
| GitHub | Código e versionamento |
| Vercel Deploy | Publicação automática a cada push |

```
GitHub (push) -> Vercel Deploy (build automático)
                       |
                       v
   Vercel (Next.js: frontend + rotas /api)
                       |
        +--------------+--------------+
        |                             |
        v                             v
PostgreSQL gerenciado           Vercel Blob (anexos)
(Neon / Vercel Postgres)
```

## Stack
Next.js + TypeScript + Prisma + PostgreSQL + Vercel Blob.

## Deploy em produção (Vercel)

1. **GitHub**: suba o projeto em um repositório (privado, de preferência).
   ```
   git init
   git add .
   git commit -m "TI Service Desk V4"
   git branch -M main
   git remote add origin https://github.com/sua-org/ti-service-desk.git
   git push -u origin main
   ```
2. **Banco gerenciado**: crie um banco PostgreSQL (Vercel Postgres, em *Storage* no dashboard da Vercel, ou Neon). Copie a connection string com pooling (`DATABASE_URL`) e a direta (`DATABASE_URL_UNPOOLED`).
3. **Storage**: em *Storage* no dashboard da Vercel, crie um **Blob Store** e conecte ao projeto — a variável `BLOB_READ_WRITE_TOKEN` é gerada automaticamente.
4. **Importar o projeto na Vercel**: New Project -> selecione o repositório do GitHub -> framework detectado automaticamente como Next.js.
5. **Variáveis de ambiente** (Project Settings -> Environment Variables), copiando o padrão de `.env.example`:
   - `DATABASE_URL`
   - `DATABASE_URL_UNPOOLED`
   - `JWT_SECRET` (gere um valor aleatório grande)
   - `APP_URL` (o domínio final, ex.: `https://ti.suaescola.com.br`)
   - `BLOB_READ_WRITE_TOKEN`
6. **Migrar o schema**: rode localmente (apontando para o banco de produção) ou via `vercel env pull` + `npx prisma migrate deploy`:
   ```
   npx prisma migrate deploy
   npx prisma db seed
   ```
7. **Deploy**: clique em Deploy — a Vercel executa `prisma generate && next build` automaticamente (definido em `package.json`).
8. **Domínio próprio**: em Project Settings -> Domains, adicione o domínio da escola e aponte o DNS (CNAME/registro sugerido pela própria Vercel).
9. **Deploys automáticos**: a partir daqui, todo `git push` na branch `main` publica uma nova versão automaticamente; pushes em outras branches/PRs geram *preview deployments*.

## Ambiente de desenvolvimento local

Para desenvolver localmente, um banco PostgreSQL via Docker continua disponível (não é usado em produção):

1. Extraia o ZIP e abra um terminal na pasta do projeto.
2. Execute:
   docker compose up -d
3. Copie `.env.example` para `.env` e ajuste `DATABASE_URL` para `postgresql://ti_admin:troque-esta-senha@localhost:5432/ti_service_desk?schema=public` (sem `DATABASE_URL_UNPOOLED`, sem `BLOB_READ_WRITE_TOKEN` — os uploads locais exigem uma conta Vercel Blob mesmo em dev, ou você pode gerar um token de storage de desenvolvimento no dashboard da Vercel).
4. Execute:
   npm install
5. Execute:
   npx prisma generate
6. Execute:
   npx prisma db push
7. Execute:
   npx prisma db seed
8. Execute:
   npm run dev
9. Acesse:
   http://localhost:3000

## Contas de demonstração
- Administrador: admin@tiservice.local / Admin@123
- Técnico: tecnico@tiservice.local / Admin@123
- Solicitante: usuario@tiservice.local / Admin@123

## Banco (desenvolvimento local via Docker)
O PostgreSQL local fica persistido no volume Docker `ti_service_desk_pgdata`.

Ver dados:
docker exec -it ti-service-desk-db psql -U ti_admin -d ti_service_desk

Backup:
docker exec ti-service-desk-db pg_dump -U ti_admin -d ti_service_desk > backup.sql

Restaurar:
Get-Content backup.sql | docker exec -i ti-service-desk-db psql -U ti_admin -d ti_service_desk

Em produção, o backup passa a ser responsabilidade do provedor do banco gerenciado (Vercel Postgres/Neon oferecem backups automáticos/point-in-time restore no painel).

## Checklist antes de publicar
- troque todas as senhas e o `JWT_SECRET`;
- não reutilize as contas de demonstração em produção;
- confirme que `.env` não foi versionado (já está no `.gitignore`);
- configure SMTP se for usar notificações por e-mail;
- avalie LDAP/Active Directory se necessário;
- restrinja exclusões a administradores e mantenha a auditoria ativa.

## Inventário
O modelo de ativo deve ser usado como patrimônio de TI:
Computadores, monitores, impressoras, rede, notebooks, projetores, nobreaks, telefones, periféricos etc.

Estados recomendados:
ATIVO, MANUTENCAO, ESTOQUE, BAIXADO, EXTRAVIADO.

Não apague um equipamento apenas porque saiu de uso: prefira BAIXADO para preservar histórico.
