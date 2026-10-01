import { PrismaClient, Priority, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Troque@123", 12);
  const departments = ["ADM", "CRA", "PEDAGOGICO", "COMERCIAL", "ESTAGIO", "SALAS DE AULA", "LAB DE TI", "LAB INTERATIVO"];
  const deps = new Map<string, string>();
  for (const name of departments) {
    const d = await db.department.upsert({ where: { name }, update: {}, create: { name } });
    deps.set(name, d.id);
  }

  const users = [
    ["Hermeson Sena", "hermeson@graucabo.local", Role.ADMIN],
    ["Emanoel", "emanoel@graucabo.local", Role.TECHNICIAN],
    ["Ghabriel", "ghabriel@graucabo.local", Role.TECHNICIAN],
    ["Solicitante Demo", "solicitante@graucabo.local", Role.REQUESTER],
  ] as const;
  for (const [name, email, role] of users) {
    await db.user.upsert({ where: { email }, update: { name, role, passwordHash, active: true }, create: { name, email, role, passwordHash, departmentId: deps.get("ADM") } });
  }

  const categories = ["Computador", "Impressora", "Rede/Internet", "Sistema", "Acesso", "E-mail", "Projetor", "Outro"];
  for (const name of categories) await db.category.upsert({ where: { name }, update: {}, create: { name } });

  const sla = [
    ["Baixa", Priority.LOW, 480, 2880],
    ["Média", Priority.MEDIUM, 240, 1440],
    ["Alta", Priority.HIGH, 60, 480],
    ["Crítica", Priority.CRITICAL, 15, 120],
  ] as const;
  for (const [name, priority, responseMins, resolutionMins] of sla) {
    await db.sla.upsert({ where: { priority }, update: { name, responseMins, resolutionMins }, create: { name, priority, responseMins, resolutionMins } });
  }
  console.log("Seed concluído. Login inicial: hermeson@graucabo.local / Troque@123");
}

main().finally(() => db.$disconnect());
