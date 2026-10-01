import { NextResponse } from "next/server";
import { authenticate, createSession } from "@/lib/auth";
export async function POST(req:Request){ const {email,password}=await req.json().catch(()=>({})); if(typeof email!=="string"||typeof password!=="string") return NextResponse.json({error:"Informe e-mail e senha."},{status:400}); const user=await authenticate(email,password); if(!user) return NextResponse.json({error:"Credenciais inválidas."},{status:401}); await createSession(user.id,user.role); return NextResponse.json({ok:true}); }
