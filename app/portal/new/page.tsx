import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NewTicketForm } from "@/components/NewTicketForm";
export default async function NewTicket(){const u=await getSessionUser();if(!u)redirect("/login");const [categories,departments]=await Promise.all([db.category.findMany({where:{active:true},orderBy:{name:"asc"}}),db.department.findMany({where:{active:true},orderBy:{name:"asc"}})]);return <><div className="eyebrow">NOVO CHAMADO</div><div className="title">Solicitar atendimento</div><p className="muted">Descreva o problema com clareza para reduzir o tempo de diagnóstico.</p><div className="spacer"/><div className="card"><NewTicketForm categories={categories} departments={departments} defaultDepartment={u.departmentId||departments[0]?.id||""}/></div></>}
