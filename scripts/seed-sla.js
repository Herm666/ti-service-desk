const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const slas = [
    {
      name: "SLA Baixa",
      priority: "LOW",
      responseMins: 480,
      resolutionMins: 2880,
    },
    {
      name: "SLA Média",
      priority: "MEDIUM",
      responseMins: 240,
      resolutionMins: 1440,
    },
    {
      name: "SLA Alta",
      priority: "HIGH",
      responseMins: 120,
      resolutionMins: 480,
    },
    {
      name: "SLA Crítica",
      priority: "CRITICAL",
      responseMins: 30,
      resolutionMins: 240,
    },
  ];

  for (const sla of slas) {
    await prisma.sla.upsert({
      where: {
        priority: sla.priority,
      },
      update: {
        name: sla.name,
        responseMins: sla.responseMins,
        resolutionMins: sla.resolutionMins,
        active: true,
      },
      create: {
        name: sla.name,
        priority: sla.priority,
        responseMins: sla.responseMins,
        resolutionMins: sla.resolutionMins,
        active: true,
      },
    });
  }

  console.log("SLAs cadastrados com sucesso.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });