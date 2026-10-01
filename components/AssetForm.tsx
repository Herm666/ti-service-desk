"use client";
import { useState } from "react";
const types=["COMPUTADOR","NOTEBOOK","MONITOR","IMPRESSORA","SERVIDOR","SWITCH","ROTEADOR","ACCESS POINT","TELEFONE IP","ESTABILIZADOR","NOBREAK","PROJETOR","PERIFÉRICO","OUTRO"];
const statuses=["ACTIVE","MAINTENANCE","STOCK","RETIRED","LOST"];
export default function AssetForm({ initial, departments, users, editing=false }: { initial?: any; departments?: any[]; users?: any[]; editing?: boolean }) {
 const [d,setD]=useState<any>({tag:"",name:"",type:"COMPUTADOR",manufacturer:"",model:"",serial:"",hostname:"",ip:"",mac:"",operatingSystem:"",processor:"",ram:"",storage:"",location:"",locationDetail:"",status:"ACTIVE",departmentId:"",ownerId:"",supplier:"",acquisitionCost:"",purchaseDate:"",warrantyUntil:"",notes:"",...initial});
 const [busy,setBusy]=useState(false); const set=(k:string,v:any)=>setD((x:any)=>({...x,[k]:v}));
 async function save(e:any){e.preventDefault();setBusy(true);const r=await fetch(editing?`/api/assets/${initial.id}`:"/api/assets",{method:editing?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)});const j=await r.json();if(r.ok) location.href=`/assets/${j.id}`; else {alert(j.error||"Erro");setBusy(false)}}
 return <form className="form" onSubmit={save}>
  <div className="section-title">Identificação e patrimônio</div><div className="three"><Field l="Patrimônio *" k="tag" d={d} set={set} req/><Field l="Nome do ativo *" k="name" d={d} set={set} req/><div className="field"><label>Tipo *</label><select value={d.type} onChange={e=>set("type",e.target.value)}>{types.map(x=><option key={x}>{x}</option>)}</select></div></div>
  <div className="three"><Field l="Fabricante" k="manufacturer" d={d} set={set}/><Field l="Modelo" k="model" d={d} set={set}/><Field l="Número de série" k="serial" d={d} set={set}/></div>
  <div className="section-title">Identificação técnica</div><div className="three"><Field l="Hostname" k="hostname" d={d} set={set}/><Field l="IP" k="ip" d={d} set={set}/><Field l="MAC" k="mac" d={d} set={set}/></div>
  <div className="three"><Field l="Sistema operacional" k="operatingSystem" d={d} set={set}/><Field l="Processador" k="processor" d={d} set={set}/><Field l="RAM" k="ram" d={d} set={set}/></div>
  <div className="three"><Field l="Armazenamento" k="storage" d={d} set={set}/><Field l="Local" k="location" d={d} set={set}/><Field l="Sala/posição" k="locationDetail" d={d} set={set}/></div>
  <div className="section-title">Responsabilidade e financeiro</div><div className="three"><div className="field"><label>Setor</label><select value={d.departmentId||""} onChange={e=>set("departmentId",e.target.value)}><option value="">Sem setor</option>{(departments||[]).map(x=><option value={x.id} key={x.id}>{x.name}</option>)}</select></div><div className="field"><label>Responsável</label><select value={d.ownerId||""} onChange={e=>set("ownerId",e.target.value)}><option value="">Sem responsável</option>{(users||[]).map(x=><option value={x.id} key={x.id}>{x.name} — {x.email}</option>)}</select></div><Field l="Fornecedor" k="supplier" d={d} set={set}/></div>
  <div className="three"><Field l="Valor de aquisição (R$)" k="acquisitionCost" d={d} set={set} type="number" step="0.01"/><Field l="Data de aquisição" k="purchaseDate" d={d} set={set} type="date"/><Field l="Garantia até" k="warrantyUntil" d={d} set={set} type="date"/></div>
  <div className="section-title">Ciclo de vida</div><div className="field"><label>Status</label><select value={d.status} onChange={e=>set("status",e.target.value)}>{statuses.map(x=><option key={x} value={x}>{({ACTIVE:"Ativo",MAINTENANCE:"Em manutenção",STOCK:"Em estoque",RETIRED:"Baixado",LOST:"Extraviado"} as any)[x]}</option>)}</select></div>
  <div className="field"><label>Observações</label><textarea rows={4} value={d.notes||""} onChange={e=>set("notes",e.target.value)}/></div>
  <div style={{display:"flex",gap:10}}><button className="btn" disabled={busy}>{busy?(editing?"Salvando...":"Cadastrando..."):(editing?"Salvar alterações":"Cadastrar ativo")}</button><button type="button" className="btn secondary" onClick={()=>history.back()}>Cancelar</button></div>
 </form>
}
function Field({l,k,d,set,req,type="text",step}:any){return <div className="field"><label>{l}</label><input required={req} type={type} step={step} value={d[k]??""} onChange={e=>set(k,e.target.value)}/></div>}
