import { PrismaClient, Role, Priority, TicketStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Admin@123", 12);

  const departments = ["COMERCIAL","ESTOQUE","INTERATIVO","LABORATÓRIO TI","SEC_ESTAGIO","ADM","PEDAGÓGICO","CRA"];
  for (const name of departments) await db.department.upsert({ where:{name}, update:{}, create:{name} });

  const adminDept = await db.department.findUnique({where:{name:"LABORATÓRIO TI"}});
  const admin = await db.user.upsert({
    where:{email:"admin@tiservice.local"},
    update:{passwordHash, role:Role.ADMIN, active:true},
    create:{name:"Administrador TI",email:"admin@tiservice.local",passwordHash,role:Role.ADMIN,departmentId:adminDept?.id}
  });

  const tech = await db.user.upsert({
    where:{email:"tecnico@tiservice.local"},
    update:{passwordHash, role:Role.TECHNICIAN, active:true},
    create:{name:"Técnico TI",email:"tecnico@tiservice.local",passwordHash,role:Role.TECHNICIAN,departmentId:adminDept?.id}
  });

  const categories = ["Hardware","Software","Rede","Impressora","Sistemas","E-mail","Acesso","Telefonia","Segurança","Outros"];
  for (const name of categories) await db.category.upsert({where:{name},update:{},create:{name}});

  await db.sLA.upsert({
    where:{name:"Padrão"},
    update:{},
    create:{name:"Padrão",lowMinutes:2880,mediumMinutes:1440,highMinutes:480,criticalMinutes:120}
  });

  const userDept = await db.department.findUnique({where:{name:"ADM"}});
  const requester = await db.user.upsert({
    where:{email:"usuario@tiservice.local"},
    update:{passwordHash,departmentId:userDept?.id},
    create:{name:"Usuário de Teste",email:"usuario@tiservice.local",passwordHash,role:Role.USER,departmentId:userDept?.id}
  });

  const count = await db.ticket.count();
  if (!count) {
    const category = await db.category.findUnique({where:{name:"Rede"}});
    const sla = await db.sLA.findUnique({where:{name:"Padrão"}});
    const ticket = await db.ticket.create({
      data:{
        title:"Sem acesso à rede no laboratório",
        description:"Computador não consegue acessar a rede interna.",
        priority:Priority.HIGH,status:TicketStatus.ASSIGNED,
        requesterId:requester.id,assigneeId:tech.id,departmentId:userDept?.id,
        categoryId:category?.id,slaId:sla?.id,dueAt:new Date(Date.now()+480*60000)
      }
    });
    await db.ticketHistory.create({data:{ticketId:ticket.id,userId:admin.id,action:"CRIADO",details:"Chamado inicial de demonstração"}})
  }

  console.log("Seed concluído.");
  console.log("Admin: admin@tiservice.local / Admin@123");
  console.log("Técnico: tecnico@tiservice.local / Admin@123");
  console.log("Usuário: usuario@tiservice.local / Admin@123");
}
main().finally(()=>db.$disconnect());
