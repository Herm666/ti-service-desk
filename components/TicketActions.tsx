"use client"; import {useState} from "react";
export default function TicketActions({id,role}:{id:string,role:string}){const [body,setBody]=useState("");
async function act(status:string){await fetch("/api/tickets/"+id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})});location.reload()}
async function comment(){if(!body.trim())return;await fetch("/api/tickets/"+id+"/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({body})});setBody("");location.reload()}
return <div className="row">{role!=="USER"&&<select className="search" onChange={e=>e.target.value&&act(e.target.value)} defaultValue=""><option value="">Alterar status</option>{["OPEN","TRIAGE","ASSIGNED","IN_PROGRESS","PENDING","RESOLVED","CLOSED","CANCELLED"].map(s=><option key={s}>{s}</option>)}</select>}<button className="btn secondary" onClick={()=>{const x=prompt("Comentário");if(x){setBody(x);setTimeout(()=>comment(),0)}}}>Comentar</button></div>
}
