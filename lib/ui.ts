export const nav = [
  { href: "/portal", label: "Meu portal", roles: ["REQUESTER", "TECHNICIAN", "MANAGER", "ADMIN"] },
  { href: "/portal/new", label: "Novo chamado", roles: ["REQUESTER", "TECHNICIAN", "MANAGER", "ADMIN"] },
  { href: "/tech", label: "Painel técnico", roles: ["TECHNICIAN", "MANAGER", "ADMIN"] },
  { href: "/tech/tickets", label: "Fila de chamados", roles: ["TECHNICIAN", "MANAGER", "ADMIN"] },
  { href: "/admin", label: "Administração", roles: ["ADMIN", "MANAGER"] },
];
