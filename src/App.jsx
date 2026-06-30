// App gerado — substituir src/App.jsx no projeto Vite
// Dependências: npm install firebase

import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// ── Firebase config ───────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyDgkNfvvrWJNIVwDoGyxw_VFLk7M28NnCw",
  authDomain: "financeiro-darlene.firebaseapp.com",
  projectId: "financeiro-darlene",
  storageBucket: "financeiro-darlene.firebasestorage.app",
  messagingSenderId: "183619911636",
  appId: "1:183619911636:web:064a6ef72819e8d0e72041"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// ── Cores ─────────────────────────────────────────────────────────
const C = {
  lilasDark:"#5B3F8A", lilasMid:"#7E5CB4", lilasLight:"#C4A8E0",
  lilasPale:"#EFE6F9", lilasBg:"#FAF6FF", white:"#FFFFFF",
  text:"#3A2D50", textLight:"#7A6D8A", green:"#2E7D32",
  greenLight:"#E8F5E9", red:"#C62828", redLight:"#FFEBEE",
  gold:"#F9A825", goldLight:"#FFFDE7", border:"#DDD0EE",
};

const CATEGORIAS = [
  {nome:"Moradia",emoji:"🏠"},{nome:"Alimentação",emoji:"🛒"},
  {nome:"Saúde",emoji:"💊"},{nome:"Transporte",emoji:"🚗"},
  {nome:"Educação / Terapia",emoji:"📚"},{nome:"Beleza / Bem-estar",emoji:"💅"},
  {nome:"Serviços Domésticos",emoji:"🧹"},{nome:"Contas Fixas",emoji:"📄"},
  {nome:"Cartão do Júnior",emoji:"💳"},{nome:"Impostos / IR",emoji:"🏛️"},
  {nome:"Outros",emoji:"📦"},
];

const BANCOS = [
  {nome:"Banco do Brasil",emoji:"🏦"},{nome:"Caixa Econômica",emoji:"🏛️"},
  {nome:"Nubank",emoji:"💜"},{nome:"Bradesco",emoji:"🔴"},
];

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
               "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

const GASTOS_INICIAIS = [
  {id:1,data:"2026-04-30",desc:"Condomínio",cat:"Moradia",valor:230.00},
  {id:2,data:"2026-04-30",desc:"Luz",cat:"Contas Fixas",valor:150.30},
  {id:3,data:"2026-04-30",desc:"Água",cat:"Contas Fixas",valor:290.00},
  {id:4,data:"2026-04-30",desc:"Academia - Pilates",cat:"Saúde",valor:300.00},
  {id:5,data:"2026-04-30",desc:"Uber",cat:"Transporte",valor:230.00},
  {id:6,data:"2026-04-30",desc:"Supera",cat:"Educação / Terapia",valor:400.00},
  {id:7,data:"2026-04-30",desc:"Vânia - Diarista",cat:"Serviços Domésticos",valor:1500.00},
  {id:8,data:"2026-04-30",desc:"Caixa Anair",cat:"Serviços Domésticos",valor:400.00},
  {id:9,data:"2026-04-30",desc:"Celular",cat:"Contas Fixas",valor:72.00},
  {id:10,data:"2026-04-30",desc:"Internet",cat:"Contas Fixas",valor:98.00},
  {id:11,data:"2026-04-30",desc:"Gás",cat:"Contas Fixas",valor:320.00},
  {id:12,data:"2026-04-30",desc:"Vânia Extra",cat:"Serviços Domésticos",valor:150.00},
  {id:13,data:"2026-04-30",desc:"Júnior - Plano de Saúde",cat:"Cartão do Júnior",valor:320.00},
  {id:14,data:"2026-04-30",desc:"Mercado",cat:"Alimentação",valor:1700.00},
  {id:15,data:"2026-04-30",desc:"Unhas",cat:"Beleza / Bem-estar",valor:200.00},
  {id:16,data:"2026-04-30",desc:"Verduras e Frutas",cat:"Alimentação",valor:320.00},
  {id:17,data:"2026-04-30",desc:"Remédios",cat:"Saúde",valor:300.00},
  {id:18,data:"2026-04-30",desc:"Alex",cat:"Outros",valor:350.00},
  {id:19,data:"2026-04-30",desc:"Caixa Verde",cat:"Outros",valor:1000.00},
  {id:20,data:"2026-04-30",desc:"Velas",cat:"Outros",valor:108.00},
  {id:21,data:"2026-04-30",desc:"IR - Parcela 1/8",cat:"Impostos / IR",valor:1275.00},
];

// ── Utils ─────────────────────────────────────────────────────────
const fmt = v => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(v||0);
const hoje = () => new Date().toISOString().split("T")[0];
const mesAtual = () => "2026-07";
const labelMes = ym => { if(!ym)return""; const[y,m]=ym.split("-"); return `${MESES[+m-1]} ${y}`; };
const labelMesCurto = ym => { if(!ym)return""; const[,m]=ym.split("-"); return MESES[+m-1].slice(0,3); };

// ── Hook Firebase ─────────────────────────────────────────────────
// Pense no Firebase como uma gaveta com etiquetas (chaves).
// Cada dado (gastos, receitas, bancos) tem sua própria gaveta.
// useFirestore abre a gaveta, lê o que tem, e salva de volta quando muda.
function useFirestore(chave, valorInicial) {
  const [val, setVal] = useState(valorInicial);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const ref = doc(db, "darlene", chave);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setVal(snap.data().valor);
        }
      } catch (e) {
        console.error("Erro ao carregar:", chave, e);
      } finally {
        setCarregando(false);
      }
    })();
  }, [chave]);

  const salvar = async (novoValor) => {
    setVal(novoValor);
    try {
      const ref = doc(db, "darlene", chave);
      await setDoc(ref, { valor: novoValor });
    } catch (e) {
      console.error("Erro ao salvar:", chave, e);
    }
  };

  return [val, salvar, carregando];
}

// ── Componentes base ──────────────────────────────────────────────
function Card({children,style={}}){
  return <div style={{background:C.white,borderRadius:16,padding:"16px",boxShadow:"0 2px 12px rgba(91,63,138,0.10)",marginBottom:12,border:`1px solid ${C.border}`,...style}}>{children}</div>;
}
function Btn({children,onClick,color=C.lilasMid,outline,small,danger,style={}}){
  const bg=outline?"transparent":danger?C.red:color;
  const txt=outline?(danger?C.red:C.lilasMid):C.white;
  return <button onClick={onClick} style={{background:bg,color:txt,border:`2px solid ${danger?C.red:(outline?C.lilasMid:color)}`,borderRadius:10,padding:small?"6px 14px":"12px 20px",fontSize:small?14:16,fontWeight:700,cursor:"pointer",...style}}>{children}</button>;
}
function Input({label,value,onChange,type="text",placeholder,required}){
  return(
    <div style={{marginBottom:14}}>
      <label style={{display:"block",fontSize:13,fontWeight:700,color:C.lilasDark,marginBottom:4}}>{label}{required&&<span style={{color:C.red}}> *</span>}</label>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{width:"100%",padding:"12px 14px",borderRadius:10,fontSize:16,border:`2px solid ${C.border}`,background:C.lilasBg,color:C.text,boxSizing:"border-box",outline:"none"}}/>
    </div>
  );
}
function Select({label,value,onChange,options,required}){
  return(
    <div style={{marginBottom:14}}>
      <label style={{display:"block",fontSize:13,fontWeight:700,color:C.lilasDark,marginBottom:4}}>{label}{required&&<span style={{color:C.red}}> *</span>}</label>
      <select value={value} onChange={e=>onChange(e.target.value)} style={{width:"100%",padding:"12px 14px",borderRadius:10,fontSize:16,border:`2px solid ${C.border}`,background:C.lilasBg,color:C.text,boxSizing:"border-box",appearance:"none"}}>
        <option value="">Escolha...</option>
        {options.map(o=><option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
      </select>
    </div>
  );
}
function Tag({children,color=C.lilasPale,textColor=C.lilasDark}){
  return <span style={{background:color,color:textColor,borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:600,display:"inline-block"}}>{children}</span>;
}
function SectionTitle({children,emoji}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
      {emoji&&<span style={{fontSize:22}}>{emoji}</span>}
      <h2 style={{margin:0,fontSize:18,fontWeight:800,color:C.lilasDark}}>{children}</h2>
    </div>
  );
}
function Loading(){
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"60vh",gap:16}}>
      <div style={{fontSize:40}}>💜</div>
      <div style={{color:C.lilasMid,fontWeight:700,fontSize:16}}>Carregando seus dados...</div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────
function Dashboard({gastos,receitas,bancos,mesSelecionado,onMudaMes}){
  const gastosMes=gastos.filter(g=>g.data?.startsWith(mesSelecionado));
  const receitasMes=receitas.filter(r=>r.mes===mesSelecionado);
  const totalReceita=receitasMes.reduce((s,r)=>s+(r.aposent1||0)+(r.aposent2||0),0);
  const totalGasto=gastosMes.reduce((s,g)=>s+(g.valor||0),0);
  const economia=totalReceita-totalGasto;
  const porCat={};
  CATEGORIAS.forEach(c=>{porCat[c.nome]=0;});
  gastosMes.forEach(g=>{if(porCat[g.cat]!==undefined)porCat[g.cat]+=g.valor||0;});
  const meses=[
    {value:"2026-07",label:"Julho 2026"},
    {value:"2026-08",label:"Agosto 2026"},
    {value:"2026-09",label:"Setembro 2026"},
    {value:"2026-10",label:"Outubro 2026"},
    {value:"2026-11",label:"Novembro 2026"},
    {value:"2026-12",label:"Dezembro 2026"},
  ];
  const maxCat=Math.max(...Object.values(porCat),1);
  return(
    <div>
      <div style={{marginBottom:16}}>
        <select value={mesSelecionado} onChange={e=>onMudaMes(e.target.value)} style={{width:"100%",padding:"12px 14px",borderRadius:12,fontSize:16,fontWeight:700,border:`2px solid ${C.lilasMid}`,background:C.lilasPale,color:C.lilasDark,appearance:"none"}}>
          {meses.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
        <Card style={{textAlign:"center",background:C.greenLight,border:`1.5px solid #A5D6A7`}}>
          <div style={{fontSize:12,color:C.textLight,fontWeight:600,marginBottom:4}}>💰 Receita</div>
          <div style={{fontSize:20,fontWeight:800,color:C.green}}>{fmt(totalReceita)}</div>
        </Card>
        <Card style={{textAlign:"center",background:C.redLight,border:`1.5px solid #EF9A9A`}}>
          <div style={{fontSize:12,color:C.textLight,fontWeight:600,marginBottom:4}}>💸 Gastos</div>
          <div style={{fontSize:20,fontWeight:800,color:C.red}}>{fmt(totalGasto)}</div>
        </Card>
      </div>
      <Card style={{textAlign:"center",marginBottom:12,background:economia>=0?C.greenLight:C.redLight,border:`2px solid ${economia>=0?"#A5D6A7":"#EF9A9A"}`}}>
        <div style={{fontSize:13,color:C.textLight,fontWeight:700,marginBottom:4}}>{economia>=0?"✨ Sobrou no mês":"⚠️ Faltou no mês"}</div>
        <div style={{fontSize:28,fontWeight:900,color:economia>=0?C.green:C.red}}>{fmt(Math.abs(economia))}</div>
        {totalReceita===0&&<div style={{fontSize:12,color:C.textLight,marginTop:4}}>Adicione a receita na aba 💰 Receitas</div>}
      </Card>
      <Card>
        <SectionTitle emoji="📊">Gastos por categoria</SectionTitle>
        {CATEGORIAS.map(cat=>{
          const v=porCat[cat.nome]||0; if(v===0)return null;
          const pct=Math.round((v/maxCat)*100);
          return(
            <div key={cat.nome} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                <span style={{fontSize:13,fontWeight:600,color:C.text}}>{cat.emoji} {cat.nome}</span>
                <span style={{fontSize:13,fontWeight:700,color:C.lilasDark}}>{fmt(v)}</span>
              </div>
              <div style={{background:C.lilasPale,borderRadius:20,height:8,overflow:"hidden"}}>
                <div style={{width:`${pct}%`,height:"100%",background:C.lilasMid,borderRadius:20}}/>
              </div>
            </div>
          );
        })}
        {gastosMes.length===0&&<div style={{textAlign:"center",color:C.textLight,padding:"20px 0",fontSize:14}}>Nenhum gasto lançado neste mês</div>}
      </Card>
      <Card>
        <SectionTitle emoji="🏦">Saldo nas contas</SectionTitle>
        {BANCOS.map(b=>{
          const saldo=bancos[b.nome]||0;
          return(
            <div key={b.nome} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:20}}>{b.emoji}</span>
                <span style={{fontSize:14,fontWeight:600,color:C.text}}>{b.nome}</span>
              </div>
              <span style={{fontSize:15,fontWeight:800,color:saldo>0?C.green:C.textLight}}>{fmt(saldo)}</span>
            </div>
          );
        })}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:10,marginTop:4}}>
          <span style={{fontSize:14,fontWeight:700,color:C.lilasDark}}>💜 Total guardado</span>
          <span style={{fontSize:17,fontWeight:900,color:C.lilasDark}}>{fmt(Object.values(bancos).reduce((s,v)=>s+(v||0),0))}</span>
        </div>
      </Card>
      <Card style={{background:C.goldLight,border:`1.5px solid #FFD54F`}}>
        <SectionTitle emoji="🏛️">Imposto de Renda — parcelas</SectionTitle>
        <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:14,color:C.text}}>Valor por parcela</span><span style={{fontWeight:700,color:C.text}}>{fmt(1275)}</span></div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}><span style={{fontSize:14,color:C.text}}>Total (8 parcelas)</span><span style={{fontWeight:700,color:C.text}}>{fmt(1275*8)}</span></div>
        <div style={{marginTop:8,fontSize:12,color:C.textLight}}>Lançar mensalmente como "Impostos / IR"</div>
      </Card>
    </div>
  );
}

// ── LANÇAMENTOS ───────────────────────────────────────────────────
function Lancamentos({gastos,onSave,mesSelecionado}){
  const [form,setForm]=useState({data:hoje(),dataDisplay:"",desc:"",cat:"",valor:""});
  const [erro,setErro]=useState("");
  const [editId,setEditId]=useState(null);
  const [filtroMes,setFiltroMes]=useState("2026-07");
  const [confirmDel,setConfirmDel]=useState(null);
  const gastosFiltrados=gastos.filter(g=>g.data?.startsWith(filtroMes)).sort((a,b)=>b.data.localeCompare(a.data));
  const meses=[
    {value:"2026-07",label:"Julho 2026"},
    {value:"2026-08",label:"Agosto 2026"},
    {value:"2026-09",label:"Setembro 2026"},
    {value:"2026-10",label:"Outubro 2026"},
    {value:"2026-11",label:"Novembro 2026"},
    {value:"2026-12",label:"Dezembro 2026"},
  ];
  const salvar=()=>{
    if(!form.desc||!form.cat||!form.valor||!form.data){setErro("Preencha todos os campos.");return;}
    const val=parseFloat(String(form.valor).replace(",","."));
    if(isNaN(val)||val<=0){setErro("Valor inválido.");return;}
    setErro("");
    if(editId){onSave(gastos.map(g=>g.id===editId?{...form,valor:val,id:editId}:g));setEditId(null);}
    else{onSave([...gastos,{...form,valor:val,id:Date.now()}]);}
    setForm({data:hoje(),desc:"",cat:"",valor:""});
  };
  const editar=g=>{const p=g.data?.split("-");const dd=p?`${p[2]}/${p[1]}/${p[0]}`:"";setForm({data:g.data,dataDisplay:dd,desc:g.desc,cat:g.cat,valor:String(g.valor)});setEditId(g.id);window.scrollTo({top:0,behavior:"smooth"});};
  const excluir=id=>{onSave(gastos.filter(g=>g.id!==id));setConfirmDel(null);};
  const cancelar=()=>{setForm({data:hoje(),dataDisplay:"",desc:"",cat:"",valor:""});setEditId(null);setErro("");};
  const totalMes=gastosFiltrados.reduce((s,g)=>s+(g.valor||0),0);
  const catOpts=CATEGORIAS.map(c=>({value:c.nome,label:`${c.emoji} ${c.nome}`}));
  return(
    <div>
      <Card style={{background:editId?C.goldLight:C.lilasPale,border:`2px solid ${editId?C.gold:C.lilasMid}`}}>
        <SectionTitle emoji={editId?"✏️":"➕"}>{editId?"Editar gasto":"Novo gasto"}</SectionTitle>
        <Input label="Data (DD/MM/AAAA)" value={form.dataDisplay||""} onChange={v=>{const clean=v.replace(/\D/g,"").slice(0,8);const fmt=clean.length>4?clean.slice(0,2)+"/"+clean.slice(2,4)+"/"+clean.slice(4):clean.length>2?clean.slice(0,2)+"/"+clean.slice(2):clean;const iso=clean.length===8?`${clean.slice(4)}-${clean.slice(2,4)}-${clean.slice(0,2)}`:form.data;setForm({...form,dataDisplay:fmt,data:iso});}} placeholder="30/07/2026" required/>
        <Input label="Descrição" value={form.desc} onChange={v=>setForm({...form,desc:v})} placeholder="Ex: Mercado, Remédio..." required/>
        <Select label="Categoria" value={form.cat} onChange={v=>setForm({...form,cat:v})} options={catOpts} required/>
        <Input label="Valor (R$)" value={form.valor} onChange={v=>setForm({...form,valor:v})} type="number" placeholder="0,00" required/>
        {erro&&<div style={{color:C.red,fontSize:13,marginBottom:10,fontWeight:600}}>⚠️ {erro}</div>}
        <div style={{display:"flex",gap:10}}>
          <Btn onClick={salvar} style={{flex:1}}>{editId?"💾 Salvar alteração":"✅ Adicionar"}</Btn>
          {editId&&<Btn outline onClick={cancelar} style={{flex:1}}>Cancelar</Btn>}
        </div>
      </Card>
      <div style={{marginBottom:12}}>
        <select value={filtroMes} onChange={e=>setFiltroMes(e.target.value)} style={{width:"100%",padding:"10px 14px",borderRadius:10,fontSize:15,fontWeight:700,border:`2px solid ${C.lilasMid}`,background:C.lilasPale,color:C.lilasDark,appearance:"none"}}>
          {meses.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <span style={{fontSize:14,color:C.textLight,fontWeight:600}}>{gastosFiltrados.length} lançamento{gastosFiltrados.length!==1?"s":""}</span>
        <span style={{fontSize:15,fontWeight:800,color:C.red}}>Total: {fmt(totalMes)}</span>
      </div>
      {gastosFiltrados.length===0&&<Card style={{textAlign:"center",padding:"32px 16px"}}><div style={{fontSize:36,marginBottom:8}}>💜</div><div style={{color:C.textLight,fontSize:15}}>Nenhum gasto lançado neste mês.</div></Card>}
      {gastosFiltrados.map(g=>{
        const cat=CATEGORIAS.find(c=>c.nome===g.cat);
        return(
          <Card key={g.id} style={{padding:"12px 14px"}}>
            {confirmDel===g.id?(
              <div>
                <div style={{fontWeight:700,color:C.red,marginBottom:10}}>Excluir "{g.desc}"?</div>
                <div style={{display:"flex",gap:8}}>
                  <Btn danger small onClick={()=>excluir(g.id)} style={{flex:1}}>Excluir</Btn>
                  <Btn outline small onClick={()=>setConfirmDel(null)} style={{flex:1}}>Cancelar</Btn>
                </div>
              </div>
            ):(
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:4}}>{g.desc}</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    <Tag>{cat?.emoji} {g.cat}</Tag>
                    <Tag color="#F3E5F5" textColor={C.lilasDark}>{g.data?.split("-").reverse().join("/")}</Tag>
                  </div>
                </div>
                <div style={{textAlign:"right",marginLeft:12}}>
                  <div style={{fontSize:17,fontWeight:900,color:C.red,marginBottom:6}}>{fmt(g.valor)}</div>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>editar(g)} style={{background:C.lilasPale,border:"none",borderRadius:8,padding:"4px 10px",fontSize:16,cursor:"pointer"}}>✏️</button>
                    <button onClick={()=>setConfirmDel(g.id)} style={{background:C.redLight,border:"none",borderRadius:8,padding:"4px 10px",fontSize:16,cursor:"pointer"}}>🗑️</button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ── RECEITAS ──────────────────────────────────────────────────────
function Receitas({receitas,onSave,mesSelecionado}){
  const [mes,setMes]=useState(mesSelecionado);
  const [form,setForm]=useState({aposent1:"",aposent2:""});
  const [salvo,setSalvo]=useState(false);
  useEffect(()=>{
    const r=receitas.find(r=>r.mes===mes)||{aposent1:"",aposent2:""};
    setForm({aposent1:r.aposent1||"",aposent2:r.aposent2||""});setSalvo(false);
  },[mes,receitas]);
  const meses=[
    {value:"2026-07",label:"Julho 2026"},
    {value:"2026-08",label:"Agosto 2026"},
    {value:"2026-09",label:"Setembro 2026"},
    {value:"2026-10",label:"Outubro 2026"},
    {value:"2026-11",label:"Novembro 2026"},
    {value:"2026-12",label:"Dezembro 2026"},
  ];
  const salvar=()=>{
    const v1=parseFloat(String(form.aposent1).replace(",","."))||0;
    const v2=parseFloat(String(form.aposent2).replace(",","."))||0;
    onSave([...receitas.filter(r=>r.mes!==mes),{mes,aposent1:v1,aposent2:v2}]);
    setSalvo(true);setTimeout(()=>setSalvo(false),2000);
  };
  const total=(parseFloat(String(form.aposent1).replace(",","."))||0)+(parseFloat(String(form.aposent2).replace(",","."))||0);
  return(
    <div>
      <Card style={{background:C.greenLight,border:`2px solid #A5D6A7`}}>
        <SectionTitle emoji="💰">Receitas do mês</SectionTitle>
        <div style={{marginBottom:14}}>
          <select value={mes} onChange={e=>setMes(e.target.value)} style={{width:"100%",padding:"10px 14px",borderRadius:10,fontSize:15,fontWeight:700,border:`2px solid #A5D6A7`,background:C.white,color:C.text,appearance:"none"}}>
            {meses.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <Input label="💵 Aposentadoria 1 (R$)" value={form.aposent1} onChange={v=>setForm({...form,aposent1:v})} type="number" placeholder="0,00"/>
        <Input label="💵 Aposentadoria 2 (R$)" value={form.aposent2} onChange={v=>setForm({...form,aposent2:v})} type="number" placeholder="0,00"/>
        <div style={{background:C.white,borderRadius:12,padding:"14px",marginBottom:14,border:`1.5px solid #A5D6A7`}}>
          <div style={{fontSize:13,color:C.textLight,marginBottom:4}}>Total do mês</div>
          <div style={{fontSize:26,fontWeight:900,color:C.green}}>{fmt(total)}</div>
        </div>
        <Btn onClick={salvar} color={C.green} style={{width:"100%"}}>{salvo?"✅ Salvo!":"💾 Salvar receitas"}</Btn>
      </Card>
      {receitas.length>0&&(
        <Card>
          <SectionTitle emoji="📋">Histórico de receitas</SectionTitle>
          {[...receitas].sort((a,b)=>b.mes.localeCompare(a.mes)).map(r=>(
            <div key={r.mes} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:14,color:C.text,fontWeight:600}}>{labelMes(r.mes)}</span>
              <span style={{fontSize:15,fontWeight:800,color:C.green}}>{fmt((r.aposent1||0)+(r.aposent2||0))}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// ── CONTAS ────────────────────────────────────────────────────────
function Contas({bancos,onSave}){
  const [form,setForm]=useState(bancos);
  const [salvo,setSalvo]=useState(false);
  useEffect(()=>{setForm(bancos);},[bancos]);
  const salvar=()=>{
    const parsed={};
    Object.entries(form).forEach(([k,v])=>{parsed[k]=parseFloat(String(v).replace(",","."))||0;});
    onSave(parsed);setSalvo(true);setTimeout(()=>setSalvo(false),2000);
  };
  const total=Object.values(form).reduce((s,v)=>s+(parseFloat(String(v).replace(",","."))||0),0);
  return(
    <div>
      <Card>
        <SectionTitle emoji="🏦">Atualizar saldos</SectionTitle>
        <p style={{color:C.textLight,fontSize:14,marginTop:0,marginBottom:16}}>Olhe no app do banco e anote o saldo uma vez por semana. 📱</p>
        {BANCOS.map(b=>(
          <div key={b.nome} style={{marginBottom:14}}>
            <label style={{display:"flex",alignItems:"center",gap:8,fontSize:14,fontWeight:700,color:C.text,marginBottom:6}}>
              <span style={{fontSize:22}}>{b.emoji}</span>{b.nome}
            </label>
            <div style={{position:"relative"}}>
              <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:14,color:C.textLight,fontWeight:600}}>R$</span>
              <input type="number" value={form[b.nome]??""} onChange={e=>setForm({...form,[b.nome]:e.target.value})} placeholder="0,00"
                style={{width:"100%",padding:"12px 14px 12px 42px",borderRadius:10,fontSize:16,border:`2px solid ${C.border}`,background:C.lilasBg,color:C.text,boxSizing:"border-box",outline:"none"}}/>
            </div>
          </div>
        ))}
        <div style={{background:C.lilasPale,borderRadius:12,padding:"14px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,border:`1.5px solid ${C.lilasLight}`}}>
          <span style={{fontSize:14,fontWeight:700,color:C.lilasDark}}>💜 Total guardado</span>
          <span style={{fontSize:22,fontWeight:900,color:C.lilasDark}}>{fmt(total)}</span>
        </div>
        <Btn onClick={salvar} style={{width:"100%"}}>{salvo?"✅ Salvo!":"💾 Salvar saldos"}</Btn>
      </Card>
    </div>
  );
}

// ── RESUMO ANUAL ──────────────────────────────────────────────────
function ResumoAnual({gastos,receitas}){
  const ano=new Date().getFullYear();
  const mesesAno=["07","08","09","10","11","12"].map(m=>`${ano}-${m}`);
  const dadosMes=mesesAno.map(ym=>{
    const gm=gastos.filter(g=>g.data?.startsWith(ym));
    const rm=receitas.filter(r=>r.mes===ym);
    const totalReceita=rm.reduce((s,r)=>s+(r.aposent1||0)+(r.aposent2||0),0);
    const totalGasto=gm.reduce((s,g)=>s+(g.valor||0),0);
    return{ym,totalReceita,totalGasto,economia:totalReceita-totalGasto,temDados:gm.length>0||totalReceita>0};
  });
  const totReceita=dadosMes.reduce((s,d)=>s+d.totalReceita,0);
  const totGasto=dadosMes.reduce((s,d)=>s+d.totalGasto,0);
  const totEcon=totReceita-totGasto;
  const porCat={};
  CATEGORIAS.forEach(c=>{porCat[c.nome]=0;});
  gastos.filter(g=>g.data?.startsWith(String(ano))).forEach(g=>{if(porCat[g.cat]!==undefined)porCat[g.cat]+=g.valor||0;});
  const maxCat=Math.max(...Object.values(porCat),1);
  const catComGasto=CATEGORIAS.filter(c=>porCat[c.nome]>0).sort((a,b)=>porCat[b.nome]-porCat[a.nome]);
  return(
    <div>
      <Card style={{background:`linear-gradient(135deg,${C.lilasDark},${C.lilasMid})`,border:"none"}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:13,color:C.lilasLight,fontWeight:600,marginBottom:4}}>Controle Anual</div>
          <div style={{fontSize:24,fontWeight:900,color:C.white}}>Julho — Dezembro {ano}</div>
        </div>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
        <Card style={{textAlign:"center",background:C.greenLight,border:`1.5px solid #A5D6A7`}}>
          <div style={{fontSize:11,color:C.textLight,fontWeight:600,marginBottom:4}}>💰 Total recebido</div>
          <div style={{fontSize:16,fontWeight:800,color:C.green}}>{fmt(totReceita)}</div>
        </Card>
        <Card style={{textAlign:"center",background:C.redLight,border:`1.5px solid #EF9A9A`}}>
          <div style={{fontSize:11,color:C.textLight,fontWeight:600,marginBottom:4}}>💸 Total gasto</div>
          <div style={{fontSize:16,fontWeight:800,color:C.red}}>{fmt(totGasto)}</div>
        </Card>
      </div>
      <Card style={{textAlign:"center",marginBottom:12,background:totEcon>=0?C.greenLight:C.redLight,border:`2px solid ${totEcon>=0?"#A5D6A7":"#EF9A9A"}`}}>
        <div style={{fontSize:13,color:C.textLight,fontWeight:700,marginBottom:4}}>{totEcon>=0?"✨ Total economizado":"⚠️ Total que faltou"}</div>
        <div style={{fontSize:26,fontWeight:900,color:totEcon>=0?C.green:C.red}}>{fmt(Math.abs(totEcon))}</div>
      </Card>
      <Card>
        <SectionTitle emoji="📅">Mês a mês</SectionTitle>
        {dadosMes.map(d=>(
          <div key={d.ym} style={{marginBottom:12,paddingBottom:12,borderBottom:`1px solid ${C.border}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:d.temDados?6:0}}>
              <span style={{fontSize:15,fontWeight:800,color:C.lilasDark}}>{labelMesCurto(d.ym)}</span>
              {d.temDados
                ?<span style={{fontSize:14,fontWeight:800,color:d.economia>=0?C.green:C.red}}>{d.economia>=0?"↑":"↓"} {fmt(Math.abs(d.economia))}</span>
                :<span style={{fontSize:12,color:C.textLight,fontStyle:"italic"}}>sem lançamentos</span>}
            </div>
            {d.temDados&&(
              <div style={{display:"flex",gap:8}}>
                <div style={{flex:1,background:C.greenLight,borderRadius:8,padding:"6px 10px",textAlign:"center"}}>
                  <div style={{fontSize:10,color:C.textLight,fontWeight:600}}>Receita</div>
                  <div style={{fontSize:13,fontWeight:700,color:C.green}}>{fmt(d.totalReceita)}</div>
                </div>
                <div style={{flex:1,background:C.redLight,borderRadius:8,padding:"6px 10px",textAlign:"center"}}>
                  <div style={{fontSize:10,color:C.textLight,fontWeight:600}}>Gastos</div>
                  <div style={{fontSize:13,fontWeight:700,color:C.red}}>{fmt(d.totalGasto)}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </Card>
      {catComGasto.length>0&&(
        <Card>
          <SectionTitle emoji="📊">Por categoria no ano</SectionTitle>
          {catComGasto.map(cat=>{
            const v=porCat[cat.nome];
            const pct=Math.round((v/maxCat)*100);
            return(
              <div key={cat.nome} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                  <span style={{fontSize:13,fontWeight:600,color:C.text}}>{cat.emoji} {cat.nome}</span>
                  <span style={{fontSize:13,fontWeight:700,color:C.lilasDark}}>{fmt(v)}</span>
                </div>
                <div style={{background:C.lilasPale,borderRadius:20,height:8,overflow:"hidden"}}>
                  <div style={{width:`${pct}%`,height:"100%",background:C.lilasMid,borderRadius:20}}/>
                </div>
              </div>
            );
          })}
        </Card>
      )}
      {catComGasto.length===0&&(
        <Card style={{textAlign:"center",padding:"32px 16px"}}>
          <div style={{fontSize:36,marginBottom:8}}>💜</div>
          <div style={{color:C.textLight,fontSize:15}}>Os lançamentos de julho em diante aparecerão aqui.</div>
        </Card>
      )}
    </div>
  );
}

// ── APP PRINCIPAL ─────────────────────────────────────────────────
export default function App(){
  const [tela,setTela]=useState("dashboard");
  const [mes,setMes]=useState(mesAtual);
  const [gastos,setGastos,carregandoGastos]=useFirestore("gastos",GASTOS_INICIAIS);
  const [receitas,setReceitas,carregandoReceitas]=useFirestore("receitas",[]);
  const [bancos,setBancos,carregandoBancos]=useFirestore("bancos",{});

  const carregando=carregandoGastos||carregandoReceitas||carregandoBancos;

  const tabs=[
    {id:"dashboard",emoji:"🏠",label:"Início"},
    {id:"lancamentos",emoji:"📝",label:"Gastos"},
    {id:"receitas",emoji:"💰",label:"Receitas"},
    {id:"contas",emoji:"🏦",label:"Bancos"},
    {id:"anual",emoji:"📅",label:"Ano"},
  ];

  return(
    <div style={{maxWidth:430,margin:"0 auto",minHeight:"100vh",background:C.lilasBg,fontFamily:"system-ui,-apple-system,sans-serif",color:C.text,paddingBottom:90}}>
      <div style={{background:`linear-gradient(135deg,${C.lilasDark} 0%,${C.lilasMid} 100%)`,padding:"20px 20px 16px",position:"sticky",top:0,zIndex:10,boxShadow:"0 2px 12px rgba(91,63,138,0.25)"}}>
        <div style={{fontSize:22,fontWeight:900,color:C.white,letterSpacing:-0.5}}>💜 Meu Financeiro</div>
        <div style={{fontSize:13,color:C.lilasLight,marginTop:2}}>
          {tela==="dashboard"?"Resumo do mês":tela==="lancamentos"?"Lançar gastos":tela==="receitas"?"Minhas receitas":tela==="contas"?"Minhas contas":"Resumo do ano"}
        </div>
      </div>
      <div style={{padding:"16px 14px"}}>
        {carregando?<Loading/>:<>
          {tela==="dashboard"  &&<Dashboard gastos={gastos} receitas={receitas} bancos={bancos} mesSelecionado={mes} onMudaMes={setMes}/>}
          {tela==="lancamentos"&&<Lancamentos gastos={gastos} onSave={setGastos} mesSelecionado={mes}/>}
          {tela==="receitas"   &&<Receitas receitas={receitas} onSave={setReceitas} mesSelecionado={mes}/>}
          {tela==="contas"     &&<Contas bancos={bancos} onSave={setBancos}/>}
          {tela==="anual"      &&<ResumoAnual gastos={gastos} receitas={receitas}/>}
        </>}
      </div>
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:C.white,borderTop:`2px solid ${C.border}`,display:"grid",gridTemplateColumns:"repeat(5,1fr)",boxShadow:"0 -2px 16px rgba(91,63,138,0.12)"}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTela(t.id)} style={{background:tela===t.id?C.lilasPale:"transparent",border:"none",cursor:"pointer",padding:"8px 0",borderTop:tela===t.id?`3px solid ${C.lilasMid}`:"3px solid transparent"}}>
            <div style={{fontSize:20}}>{t.emoji}</div>
            <div style={{fontSize:10,fontWeight:tela===t.id?800:600,color:tela===t.id?C.lilasDark:C.textLight}}>{t.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}