import { useState, useRef, useEffect } from "react";

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap";
document.head.appendChild(fontLink);

const T = {
  // Sidebar stays dark teal
  sidebar:    "#0A3330",
  sidebarBdr: "rgba(255,255,255,0.07)",

  // Main surfaces — white and off-white
  white:      "#FFFFFF",
  offwhite:   "#F7FAFA",
  surface:    "#F0F6F6",
  surfaceHov: "#E6F2F2",

  // Teal scale
  teal600:    "#177A72",
  teal500:    "#1D9E94",
  teal400:    "#26BFB3",
  teal300:    "#5ED4CA",
  teal200:    "#9DE6E1",
  teal100:    "#CFFAF7",
  teal50:     "#F0FFFE",

  // Neutral text & borders
  gray800:    "#1A2C2C",
  gray700:    "#243636",
  gray600:    "#3D5252",
  gray500:    "#577070",
  gray400:    "#7A9090",
  gray300:    "#A8BEBE",
  gray200:    "#C8D8D8",
  gray150:    "#DDE8E8",
  gray100:    "#EBF2F2",
  gray50:     "#F4F9F9",
};

const ROLES = [
  { id:"all",       icon:"◈", label:"Unified",   full:"Unified Advisor",   sub:"All four roles active",                color:T.teal500 },
  { id:"swe",       icon:"⌥", label:"Engineer",  full:"Software Engineer", sub:"Architecture · Security · Scale",      color:T.teal600 },
  { id:"investor",  icon:"◎", label:"Investor",  full:"Investor",          sub:"PE · CRE · SaaS · Private Credit",     color:T.teal400 },
  { id:"career",    icon:"⬡", label:"Career",    full:"Career Advisor",    sub:"IR · AI Transition · Positioning",     color:T.teal600 },
  { id:"education", icon:"◉", label:"Education", full:"Education Guide",   sub:"Vibe Coding → Institutional Builder",  color:T.teal300 },
];

const STARTERS = [
  { label:"My IR advantage in AI",    prompt:"Map how my Investor Relations background becomes a hidden asset as AI reshapes financial services — what should I build on top of it in the next 12 months?" },
  { label:"6-month learning roadmap", prompt:"Design a 6-month learning roadmap from vibe coding to being a credible technical partner in an enterprise product build." },
  { label:"AI × private markets",     prompt:"What SaaS opportunities at the intersection of AI and private markets are being systematically underpriced right now?" },
  { label:"Co-building with SWEs",    prompt:"How do I structure a conversation with a senior SWE to co-build a product meeting institutional-grade security requirements?" },
  { label:"Highest-leverage moves",   prompt:"What are the three highest-leverage moves I could make this quarter across all four of your advisory domains simultaneously?" },
  { label:"Competitive positioning",  prompt:"How do I position myself and my firm against legacy fund administrators who can't compete on technology in an AI-first world?" },
];

const SYSTEM = `You are a unified long-term strategic advisor operating simultaneously in four expert roles for a sophisticated professional at the intersection of technology, capital markets, and career transformation.

ROLE 1 — SOFTWARE ENGINEER: Senior full-stack architect. Guide from vibe-coding to professional-grade, secure, scaleable product development.
ROLE 2 — PROFESSIONAL INVESTOR: Technology, Financial Services, Private Equity, Commercial Real Estate, Private Credit, Secondaries, SaaS.
ROLE 3 — CAREER ADVISOR (IR & AI Focus): Investor Relations professionals navigating AI-dominated services. Skill stacking, personal brand, career capital.
ROLE 4 — EDUCATION GUIDE: Non-SWE to credible technical co-builder. Vibe coding → product management → technical co-founder competence.

FORMATTING: Use markdown. ## for sections, **bold** for key terms, bullet lists, numbered steps, code blocks with language tags. Be direct, specific, peer-level. Connect insights across domains.
End every response with "⟡ Consider also:" with 2 high-value follow-up angles.`;

const DEFAULT_CONFIG = {
  agentName:        "Advisor",
  agentTagline:     "AI-Powered Strategic Intelligence",
  welcomeTitle:     "Your Strategic\nIntelligence Layer",
  welcomeBody:      "Unified advisor across private markets, technology, and career transformation. Built for professionals who move fast.",
  accentColor:      T.teal500,
  accentLight:      T.teal300,
  showStarters:     true,
  showRoleSubtitles:true,
  inputPlaceholder: "Ask anything…",
};

// ── MARKDOWN ─────────────────────────────────────────────────────────────────
function inlineRender(text) {
  const parts = []; let i = 0;
  while (i < text.length) {
    if (text.slice(i,i+2)==="**") { const e=text.indexOf("**",i+2); if(e!==-1){parts.push(<strong key={i} style={{fontWeight:600,color:T.gray800}}>{text.slice(i+2,e)}</strong>);i=e+2;continue;} }
    if (text[i]==="`"&&text[i+1]!=="`") { const e=text.indexOf("`",i+1); if(e!==-1){parts.push(<code key={i} style={{background:T.teal50,border:`1px solid ${T.teal100}`,borderRadius:4,padding:"2px 6px",fontSize:"0.82em",fontFamily:"monospace",color:T.teal600,fontWeight:500}}>{text.slice(i+1,e)}</code>);i=e+1;continue;} }
    let j=i+1; while(j<text.length&&text[j]!=="*"&&text[j]!=="`")j++;
    parts.push(text.slice(i,j)); i=j;
  }
  return parts.length===1&&typeof parts[0]==="string"?parts[0]:<>{parts}</>;
}

function parseMarkdown(text) {
  const lines=text.split("\n"); const out=[]; let i=0;
  while(i<lines.length){
    const line=lines[i];
    if(line.trim().startsWith("```")){
      const lang=line.trim().slice(3).trim(); const code=[]; i++;
      while(i<lines.length&&!lines[i].trim().startsWith("```")){code.push(lines[i]);i++;}
      out.push(<div key={i} style={{margin:"0.75rem 0",borderRadius:8,overflow:"hidden",border:`1px solid ${T.gray200}`,boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>{lang&&<div style={{padding:"4px 12px",background:T.gray100,fontSize:10,color:T.gray500,fontFamily:"monospace",letterSpacing:"0.12em",textTransform:"uppercase",borderBottom:`1px solid ${T.gray150}`}}>{lang}</div>}<pre style={{margin:0,padding:"14px 16px",background:T.gray800,fontSize:12,lineHeight:1.7,color:"#a8d8d4",fontFamily:"'Fira Code','Cascadia Code',Consolas,monospace",overflowX:"auto"}}><code>{code.join("\n")}</code></pre></div>);
      i++;continue;
    }
    if(/^## /.test(line)){out.push(<div key={i} style={{fontSize:11,fontWeight:600,letterSpacing:"0.14em",textTransform:"uppercase",color:T.teal600,margin:"1.25rem 0 0.5rem",paddingBottom:"0.4rem",borderBottom:`1px solid ${T.teal100}`}}>{inlineRender(line.slice(3))}</div>);i++;continue;}
    if(/^### /.test(line)){out.push(<div key={i} style={{fontSize:13,fontWeight:600,color:T.teal600,margin:"0.9rem 0 0.3rem"}}>{inlineRender(line.slice(4))}</div>);i++;continue;}
    if(line.startsWith("> ")){const bq=[];while(i<lines.length&&lines[i].startsWith("> ")){bq.push(lines[i].slice(2));i++;}out.push(<div key={`bq${i}`} style={{borderLeft:`3px solid ${T.teal300}`,padding:"0.6rem 1rem",margin:"0.6rem 0",background:T.teal50,borderRadius:"0 6px 6px 0",fontSize:13,color:T.gray600,fontStyle:"italic"}}>{bq.map((b,bi)=><div key={bi}>{inlineRender(b)}</div>)}</div>);continue;}
    if(/^---+$/.test(line.trim())){out.push(<hr key={i} style={{border:"none",borderTop:`1px solid ${T.gray150}`,margin:"1rem 0"}}/>);i++;continue;}
    if(/^[-*] /.test(line)){const items=[];while(i<lines.length&&/^[-*] /.test(lines[i])){items.push(lines[i].replace(/^[-*] /,""));i++;}out.push(<ul key={`ul${i}`} style={{margin:"0.5rem 0",paddingLeft:0,listStyle:"none"}}>{items.map((it,ii)=><li key={ii} style={{display:"flex",gap:"0.6rem",fontSize:13.5,lineHeight:1.75,color:T.gray600,margin:"0.2rem 0",alignItems:"flex-start"}}><span style={{color:T.teal400,flexShrink:0,marginTop:"0.35rem",fontSize:7}}>◆</span><span>{inlineRender(it)}</span></li>)}</ul>);continue;}
    if(/^\d+\. /.test(line)){const items=[];while(i<lines.length&&/^\d+\. /.test(lines[i])){items.push(lines[i].replace(/^\d+\. /,""));i++;}out.push(<ol key={`ol${i}`} style={{margin:"0.5rem 0",paddingLeft:0,listStyle:"none"}}>{items.map((it,ii)=><li key={ii} style={{display:"flex",gap:"0.75rem",fontSize:13.5,lineHeight:1.75,color:T.gray600,margin:"0.25rem 0",alignItems:"flex-start"}}><span style={{color:T.teal500,fontFamily:"monospace",fontSize:11,minWidth:"1.4rem",paddingTop:"0.2rem",fontWeight:600}}>{ii+1}.</span><span>{inlineRender(it)}</span></li>)}</ol>);continue;}
    if(line.trim()===""){out.push(<div key={`sp${i}`} style={{height:"0.45rem"}}/>);i++;continue;}
    out.push(<p key={i} style={{margin:"0.2rem 0",fontSize:13.5,lineHeight:1.8,color:T.gray600}}>{inlineRender(line)}</p>);
    i++;
  }
  return out;
}

function MessageBubble({ msg }) {
  const isUser=msg.role==="user";
  const role=ROLES.find(r=>r.id===(msg.roleId||"all"));
  const considerIdx=msg.content.indexOf("⟡ Consider also:");
  const main=considerIdx!==-1?msg.content.slice(0,considerIdx):msg.content;
  const consider=considerIdx!==-1?msg.content.slice(considerIdx):null;
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:isUser?"flex-end":"flex-start",gap:5}}>
      <div style={{fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",color:isUser?role.color:T.gray400,fontWeight:600,fontFamily:"Sora,sans-serif"}}>
        {isUser?`You · ${role.full}`:"◈  Strategic Advisor"}
      </div>
      <div style={{
        maxWidth:isUser?"80%":"100%",
        width:isUser?undefined:"100%",
        padding:isUser?"0.8rem 1.1rem":"1.2rem 1.35rem",
        borderRadius:isUser?"14px 14px 3px 14px":"3px 14px 14px 14px",
        background:isUser?T.teal600:T.white,
        border:isUser?"none":`1px solid ${T.gray150}`,
        boxShadow:isUser?`0 3px 14px rgba(23,122,114,0.22)`:"0 1px 5px rgba(0,0,0,0.05)",
      }}>
        {isUser
          ?<p style={{margin:0,fontSize:14,lineHeight:1.7,color:T.white,fontWeight:400,fontFamily:"Sora,sans-serif"}}>{msg.content}</p>
          :<>
            {parseMarkdown(main)}
            {consider&&(
              <div style={{marginTop:"1rem",padding:"0.9rem 1.1rem",background:T.teal50,border:`1px solid ${T.teal100}`,borderRadius:8}}>
                <div style={{fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:T.teal600,fontWeight:700,marginBottom:"0.55rem",fontFamily:"Sora,sans-serif"}}>⟡ Consider also</div>
                {parseMarkdown(consider.replace("⟡ Consider also:","").trim())}
              </div>
            )}
          </>
        }
      </div>
    </div>
  );
}

// ── BUILDER ───────────────────────────────────────────────────────────────────
function BuilderPanel({ config, onChange, onClose }) {
  const F=(label,key,type="text")=>(
    <div key={key} style={{marginBottom:"0.9rem"}}>
      <div style={{fontSize:10,fontWeight:600,color:T.gray500,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4,fontFamily:"Sora,sans-serif"}}>{label}</div>
      {type==="text"&&<input value={config[key]} onChange={e=>onChange(key,e.target.value)} style={{width:"100%",padding:"0.45rem 0.7rem",border:`1px solid ${T.gray150}`,borderRadius:7,fontSize:12,color:T.gray700,background:T.white,fontFamily:"Sora,sans-serif",outline:"none"}}/>}
      {type==="color"&&<div style={{display:"flex",gap:8,alignItems:"center"}}><input type="color" value={config[key]} onChange={e=>onChange(key,e.target.value)} style={{width:34,height:28,border:"none",cursor:"pointer",padding:0,background:"none"}}/><span style={{fontSize:11,color:T.gray400,fontFamily:"monospace"}}>{config[key]}</span></div>}
      {type==="toggle"&&<div style={{width:36,height:20,borderRadius:10,background:config[key]?T.teal500:T.gray200,position:"relative",cursor:"pointer",transition:"background 0.2s"}} onClick={()=>onChange(key,!config[key])}><div style={{position:"absolute",top:2,left:config[key]?16:2,width:16,height:16,borderRadius:"50%",background:T.white,transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}/></div>}
    </div>
  );
  return(
    <div style={{position:"fixed",top:0,right:0,bottom:0,width:265,background:T.white,borderLeft:`1px solid ${T.gray150}`,display:"flex",flexDirection:"column",zIndex:1000,boxShadow:"-6px 0 28px rgba(0,0,0,0.08)"}}>
      <div style={{padding:"1.1rem 1.25rem",borderBottom:`1px solid ${T.gray150}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{fontSize:13,fontWeight:700,color:T.gray800,fontFamily:"Sora,sans-serif"}}>Builder Mode</div><div style={{fontSize:11,color:T.gray400,marginTop:1,fontFamily:"Sora,sans-serif"}}>Owner access only</div></div>
        <button onClick={onClose} style={{background:T.gray50,border:`1px solid ${T.gray150}`,borderRadius:7,padding:"0.28rem 0.65rem",cursor:"pointer",fontSize:12,color:T.gray600,fontFamily:"Sora,sans-serif"}}>✕</button>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"1rem 1.25rem"}}>
        {[
          {section:"Identity", fields:[["Agent Name","agentName"],["Tagline","agentTagline"],["Welcome Title","welcomeTitle"],["Input Placeholder","inputPlaceholder"]]},
          {section:"Colors",   fields:[["Accent","accentColor","color"],["Accent Light","accentLight","color"]]},
        ].map(({section,fields})=>(
          <div key={section}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:T.teal600,margin:"0.25rem 0 0.7rem",paddingBottom:"0.4rem",borderBottom:`1px solid ${T.teal100}`,fontFamily:"Sora,sans-serif"}}>{section}</div>
            {fields.map(([label,key,type])=>F(label,key,type||"text"))}
          </div>
        ))}
        <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:T.teal600,margin:"0.5rem 0 0.7rem",paddingBottom:"0.4rem",borderBottom:`1px solid ${T.teal100}`,fontFamily:"Sora,sans-serif"}}>Display</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.85rem"}}><span style={{fontSize:12,color:T.gray600,fontFamily:"Sora,sans-serif"}}>Quick Starts</span>{F("","showStarters","toggle")}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:12,color:T.gray600,fontFamily:"Sora,sans-serif"}}>Role Subtitles</span>{F("","showRoleSubtitles","toggle")}</div>
      </div>
    </div>
  );
}

// ── WELCOME SCREEN ─────────────────────────────────────────────────────────────
function WelcomeScreen({ config, onSend, isMobile }) {
  const titleLines = config.welcomeTitle.split("\n");
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto",background:T.offwhite}}>
      {/* Hero — white card with teal accents */}
      <div style={{padding:isMobile?"2rem 1.5rem 1.75rem":"3.5rem 3rem 2.5rem",background:T.white,borderBottom:`1px solid ${T.gray150}`}}>
        <div style={{maxWidth:620}}>
          {/* Eyebrow pill */}
          <div style={{display:"inline-flex",alignItems:"center",gap:"0.5rem",background:T.teal50,border:`1px solid ${T.teal200}`,borderRadius:20,padding:"0.3rem 0.9rem",marginBottom:"1.4rem"}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:T.teal400,boxShadow:`0 0 5px ${T.teal400}`}}/>
            <span style={{fontSize:11,color:T.teal600,letterSpacing:"0.14em",textTransform:"uppercase",fontFamily:"Sora,sans-serif",fontWeight:600}}>{config.agentTagline}</span>
          </div>

          <h1 style={{margin:"0 0 1rem",fontFamily:"'DM Serif Display',Georgia,serif",fontSize:isMobile?"2rem":"2.75rem",fontWeight:400,color:T.gray800,lineHeight:1.1,letterSpacing:"-0.01em"}}>
            {titleLines.map((line,i)=>(
              <span key={i}>{i>0&&<br/>}{i===1?<em style={{color:T.teal500,fontStyle:"italic"}}>{line}</em>:line}</span>
            ))}
          </h1>

          <p style={{margin:"0 0 1.75rem",fontSize:isMobile?14:15,color:T.gray500,fontFamily:"Sora,sans-serif",fontWeight:400,lineHeight:1.7,maxWidth:480}}>
            {config.welcomeBody}
          </p>

          {/* Role pills — teal on white */}
          <div style={{display:"flex",flexWrap:"wrap",gap:"0.45rem"}}>
            {ROLES.slice(1).map(r=>(
              <div key={r.id} style={{display:"flex",alignItems:"center",gap:"0.4rem",background:T.surface,border:`1px solid ${T.gray150}`,borderRadius:20,padding:"0.32rem 0.85rem",transition:"all 0.15s"}}>
                <span style={{fontSize:11,color:T.teal500}}>{r.icon}</span>
                <span style={{fontSize:11,color:T.gray600,fontFamily:"Sora,sans-serif",fontWeight:500,letterSpacing:"0.03em"}}>{r.full}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Starter cards */}
      {config.showStarters&&(
        <div style={{padding:isMobile?"1.5rem":"2rem 3rem 2.5rem"}}>
          <div style={{fontSize:10,letterSpacing:"0.18em",textTransform:"uppercase",color:T.gray400,marginBottom:"1rem",fontFamily:"Sora,sans-serif",fontWeight:600}}>Start a conversation</div>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:"0.65rem",maxWidth:760}}>
            {STARTERS.map((s,i)=>(
              <button key={i} onClick={()=>onSend(s.prompt)}
                style={{background:T.white,border:`1px solid ${T.gray150}`,borderRadius:10,padding:"1rem 1.1rem",cursor:"pointer",textAlign:"left",transition:"all 0.18s",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=T.teal300;e.currentTarget.style.background=T.teal50;e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow=`0 4px 14px rgba(23,122,114,0.1)`;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=T.gray150;e.currentTarget.style.background=T.white;e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.04)";}}>
                <div style={{fontSize:12,fontWeight:600,color:T.teal600,marginBottom:"0.3rem",fontFamily:"Sora,sans-serif"}}>{s.label}</div>
                <div style={{fontSize:12,color:T.gray400,lineHeight:1.5,fontFamily:"Sora,sans-serif",fontWeight:300}}>{s.prompt.slice(0,72)}…</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [config,setConfig]=useState(DEFAULT_CONFIG);
  const [messages,setMessages]=useState([]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [activeRole,setActiveRole]=useState("all");
  const [showSidebar,setShowSidebar]=useState(false);
  const [builderOpen,setBuilderOpen]=useState(false);
  const [isMobile,setIsMobile]=useState(false);
  const bottomRef=useRef(null);
  const textareaRef=useRef(null);
  const tapCount=useRef(0);
  const tapTimer=useRef(null);

  useEffect(()=>{
    const check=()=>setIsMobile(window.innerWidth<768);
    check(); window.addEventListener("resize",check);
    return()=>window.removeEventListener("resize",check);
  },[]);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[messages,loading]);

  const handleLogoTap=()=>{
    tapCount.current+=1; clearTimeout(tapTimer.current);
    tapTimer.current=setTimeout(()=>{tapCount.current=0;},2000);
    if(tapCount.current>=5){tapCount.current=0;setBuilderOpen(b=>!b);}
  };

  const updateConfig=(k,v)=>setConfig(p=>({...p,[k]:v}));
  const role=ROLES.find(r=>r.id===activeRole);
  const hasMessages=messages.length>0;

  const send=async(text)=>{
    const t=(text||input).trim();
    if(!t||loading)return;
    setInput(""); if(textareaRef.current)textareaRef.current.style.height="auto";
    if(isMobile)setShowSidebar(false);
    const history=[...messages,{role:"user",content:t,roleId:activeRole}];
    setMessages(history); setLoading(true);
    try{
      const res=await fetch("/api/chat",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:SYSTEM,
          messages:history.map(m=>({role:m.role,content:m.role==="user"?`[Role: ${m.roleId||"all"}]\n\n${m.content}`:m.content}))})
      });
      const data=await res.json();
      const reply=data.content?.map(b=>b.text||"").join("")||"No response.";
      setMessages([...history,{role:"assistant",content:reply,roleId:activeRole}]);
    }catch(e){
      setMessages([...history,{role:"assistant",content:`**Error:** ${e.message}`,roleId:activeRole}]);
    }finally{setLoading(false);}
  };

  // ── SIDEBAR ──────────────────────────────────────────────────────────────────
  const SidebarContent=()=>(
    <>
      <div style={{padding:"1.3rem 1.15rem 1rem",borderBottom:T.sidebarBdr}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:"0.6rem",cursor:"pointer"}} onClick={handleLogoTap}>
            <div style={{width:28,height:28,borderRadius:8,background:T.teal500,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.8rem",color:T.white,boxShadow:`0 2px 8px rgba(29,158,148,0.35)`}}>◈</div>
            <span style={{fontSize:"0.78rem",fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:T.white,fontFamily:"Sora,sans-serif"}}>{config.agentName}</span>
          </div>
          {isMobile&&<button onClick={()=>setShowSidebar(false)} style={{background:"rgba(255,255,255,0.08)",border:"none",color:"rgba(255,255,255,0.6)",borderRadius:6,padding:"0.28rem 0.6rem",cursor:"pointer",fontSize:13}}>✕</button>}
        </div>
        <div style={{fontSize:"0.59rem",color:"rgba(255,255,255,0.28)",letterSpacing:"0.08em",textTransform:"uppercase",paddingLeft:"2.4rem",marginTop:"0.15rem",fontFamily:"Sora,sans-serif"}}>{config.agentTagline}</div>
      </div>

      <div style={{padding:"0.85rem 0.7rem",flex:1,overflowY:"auto"}}>
        <div style={{fontSize:"0.57rem",letterSpacing:"0.18em",textTransform:"uppercase",color:"rgba(255,255,255,0.25)",marginBottom:"0.55rem",paddingLeft:"0.5rem",fontFamily:"Sora,sans-serif",fontWeight:600}}>Advisory Role</div>
        {ROLES.map(r=>(
          <button key={r.id} onClick={()=>{setActiveRole(r.id);if(isMobile)setShowSidebar(false);}}
            style={{width:"100%",display:"flex",alignItems:"center",gap:"0.65rem",padding:"0.6rem 0.7rem",borderRadius:8,border:"none",cursor:"pointer",textAlign:"left",marginBottom:2,background:activeRole===r.id?"rgba(255,255,255,0.09)":"transparent",borderLeft:activeRole===r.id?`2px solid ${T.teal300}`:"2px solid transparent",transition:"all 0.15s",outline:"none"}}>
            <div style={{width:26,height:26,borderRadius:7,background:activeRole===r.id?"rgba(94,212,202,0.15)":"rgba(255,255,255,0.05)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.72rem",color:activeRole===r.id?T.teal300:"rgba(255,255,255,0.32)",transition:"all 0.15s",flexShrink:0}}>{r.icon}</div>
            <div style={{overflow:"hidden",minWidth:0}}>
              <div style={{fontSize:"0.71rem",fontWeight:activeRole===r.id?600:400,color:activeRole===r.id?T.white:"rgba(255,255,255,0.48)",fontFamily:"Sora,sans-serif",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.full}</div>
              {config.showRoleSubtitles&&<div style={{fontSize:"0.59rem",color:"rgba(255,255,255,0.2)",marginTop:1,fontFamily:"Sora,sans-serif",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.sub}</div>}
            </div>
          </button>
        ))}

        {config.showStarters&&(
          <div style={{marginTop:"1rem",borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:"0.8rem"}}>
            <div style={{fontSize:"0.57rem",letterSpacing:"0.18em",textTransform:"uppercase",color:"rgba(255,255,255,0.25)",marginBottom:"0.55rem",paddingLeft:"0.5rem",fontFamily:"Sora,sans-serif",fontWeight:600}}>Quick Start</div>
            {STARTERS.map((s,i)=>(
              <button key={i} onClick={()=>send(s.prompt)}
                style={{width:"100%",textAlign:"left",padding:"0.42rem 0.7rem",background:"transparent",border:"none",cursor:"pointer",fontSize:"0.67rem",color:"rgba(255,255,255,0.33)",borderRadius:6,marginBottom:1,transition:"all 0.15s",lineHeight:1.45,fontFamily:"Sora,sans-serif"}}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.06)";e.currentTarget.style.color="rgba(255,255,255,0.7)";}}
                onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="rgba(255,255,255,0.33)";}}>
                → {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{padding:"0.8rem 1.15rem",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:T.teal400,boxShadow:`0 0 6px ${T.teal400}`}}/>
          <span style={{fontSize:"0.59rem",color:"rgba(255,255,255,0.25)",letterSpacing:"0.08em",fontFamily:"Sora,sans-serif"}}>Claude Sonnet 4 · Live</span>
        </div>
      </div>
    </>
  );

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100vh",background:T.offwhite,fontFamily:"Sora,sans-serif",overflow:"hidden"}}>

      {/* Mobile header */}
      {isMobile&&(
        <div style={{background:T.sidebar,padding:"0.75rem 1rem",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,borderBottom:T.sidebarBdr}}>
          <button onClick={()=>setShowSidebar(true)} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.75)",borderRadius:8,padding:"0.38rem 0.75rem",cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",gap:"0.4rem",fontFamily:"Sora,sans-serif"}}>
            <span>☰</span><span>Menu</span>
          </button>
          <div style={{display:"flex",alignItems:"center",gap:"0.5rem",cursor:"pointer"}} onClick={handleLogoTap}>
            <div style={{width:22,height:22,borderRadius:6,background:T.teal500,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.65rem",color:T.white}}>◈</div>
            <span style={{fontSize:"0.72rem",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:T.white,fontFamily:"Sora,sans-serif"}}>{config.agentName}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:T.teal400,boxShadow:`0 0 5px ${T.teal400}`}}/>
            <span style={{fontSize:10,color:"rgba(255,255,255,0.3)",fontFamily:"Sora,sans-serif"}}>Live</span>
          </div>
        </div>
      )}

      {/* Mobile overlay */}
      {isMobile&&showSidebar&&(
        <>
          <div onClick={()=>setShowSidebar(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:40}}/>
          <div style={{position:"fixed",top:0,left:0,bottom:0,width:285,background:T.sidebar,zIndex:50,display:"flex",flexDirection:"column"}}>
            <SidebarContent/>
          </div>
        </>
      )}

      <div style={{flex:1,display:"flex",overflow:"hidden"}}>

        {/* Desktop sidebar */}
        {!isMobile&&(
          <div style={{width:235,background:T.sidebar,display:"flex",flexDirection:"column",flexShrink:0,overflow:"hidden"}}>
            <SidebarContent/>
          </div>
        )}

        {/* Main */}
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

          {/* Desktop topbar — only when chatting */}
          {!isMobile&&hasMessages&&(
            <div style={{padding:"0.85rem 1.75rem",borderBottom:`1px solid ${T.gray150}`,background:T.white,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
              <div style={{display:"flex",alignItems:"center",gap:"0.7rem"}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:role.color,boxShadow:`0 0 7px ${role.color}`}}/>
                <span style={{fontSize:"0.82rem",fontWeight:600,color:T.gray800,fontFamily:"Sora,sans-serif"}}>{role.full}</span>
                <span style={{fontSize:"0.7rem",color:T.gray300}}>·</span>
                <span style={{fontSize:"0.71rem",color:T.gray400,fontFamily:"Sora,sans-serif"}}>{role.sub}</span>
              </div>
              <button onClick={()=>setMessages([])}
                style={{background:"none",border:`1px solid ${T.gray150}`,color:T.gray400,padding:"0.25rem 0.75rem",borderRadius:6,cursor:"pointer",fontSize:"0.68rem",fontFamily:"Sora,sans-serif",transition:"all 0.15s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=T.teal200;e.currentTarget.style.color=T.teal600;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=T.gray150;e.currentTarget.style.color=T.gray400;}}>
                New conversation ↺
              </button>
            </div>
          )}

          {/* Mobile role strip — only when chatting */}
          {isMobile&&hasMessages&&(
            <div style={{display:"flex",overflowX:"auto",borderBottom:`1px solid ${T.gray150}`,background:T.white,flexShrink:0,scrollbarWidth:"none"}}>
              {ROLES.map(r=>(
                <button key={r.id} onClick={()=>setActiveRole(r.id)}
                  style={{flexShrink:0,padding:"0.65rem 1rem",border:"none",borderBottom:activeRole===r.id?`2px solid ${r.color}`:"2px solid transparent",background:"transparent",cursor:"pointer",fontSize:"0.7rem",fontWeight:activeRole===r.id?600:400,color:activeRole===r.id?r.color:T.gray400,whiteSpace:"nowrap",transition:"all 0.15s",fontFamily:"Sora,sans-serif"}}>
                  {r.icon} {r.label}
                </button>
              ))}
            </div>
          )}

          {/* Welcome or chat */}
          {!hasMessages
            ? <WelcomeScreen config={config} onSend={send} isMobile={isMobile}/>
            : <div style={{flex:1,overflowY:"auto",padding:isMobile?"1rem":"1.5rem 1.75rem",display:"flex",flexDirection:"column",gap:"1.5rem",background:T.offwhite}}>
                {messages.map((msg,i)=><MessageBubble key={i} msg={msg}/>)}
                {loading&&(
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-start",gap:5}}>
                    <div style={{fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",color:T.gray400,fontWeight:600,fontFamily:"Sora,sans-serif"}}>◈  Strategic Advisor</div>
                    <div style={{padding:"1rem 1.2rem",borderRadius:"3px 14px 14px 14px",background:T.white,border:`1px solid ${T.gray150}`,boxShadow:"0 1px 5px rgba(0,0,0,0.05)"}}>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        {[0,1,2].map(j=><div key={j} style={{width:7,height:7,borderRadius:"50%",background:T.teal400,animation:"pulse 1.1s ease-in-out infinite",animationDelay:`${j*0.18}s`}}/>)}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef}/>
              </div>
          }

          {/* Input */}
          <div style={{
            padding:isMobile?"0.75rem":"1rem 1.75rem 1.1rem",
            borderTop:hasMessages?`1px solid ${T.gray150}`:"none",
            background:hasMessages?T.white:T.offwhite,
            flexShrink:0,
          }}>
            <div style={{
              display:"flex",gap:"0.55rem",alignItems:"flex-end",
              background:T.white,
              border:`1.5px solid ${T.teal300}`,
              borderRadius:12,
              padding:"0.5rem 0.5rem 0.5rem 0.95rem",
              boxShadow:hasMessages?"0 0 0 3px rgba(94,212,202,0.08)":"0 2px 16px rgba(23,122,114,0.08)",
            }}>
              <textarea ref={textareaRef} value={input}
                onChange={e=>{setInput(e.target.value);e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,120)+"px";}}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey&&!isMobile){e.preventDefault();send();}}}
                placeholder={config.inputPlaceholder} rows={1}
                style={{flex:1,background:"transparent",border:"none",outline:"none",color:T.gray700,fontSize:isMobile?16:14,resize:"none",fontFamily:"Sora,sans-serif",lineHeight:1.6,padding:"0.3rem 0",maxHeight:120,fontWeight:400}}
              />
              <button onClick={()=>send()} disabled={loading||!input.trim()}
                style={{
                  background:loading||!input.trim()?T.gray100:T.teal500,
                  border:"none",color:loading||!input.trim()?T.gray300:T.white,
                  padding:isMobile?"0.55rem 1.1rem":"0.48rem 1.1rem",
                  borderRadius:9,cursor:loading||!input.trim()?"not-allowed":"pointer",
                  fontSize:13,fontWeight:600,transition:"all 0.2s",flexShrink:0,
                  fontFamily:"Sora,sans-serif",
                  boxShadow:loading||!input.trim()?"none":`0 2px 10px rgba(29,158,148,0.3)`,
                  minHeight:isMobile?42:undefined,letterSpacing:"0.02em",
                }}>
                {loading?"···":"Send →"}
              </button>
            </div>
            {!isMobile&&<div style={{marginTop:"0.4rem",fontSize:"0.6rem",color:T.gray300,textAlign:"center",letterSpacing:"0.07em",fontFamily:"Sora,sans-serif"}}>Shift + Enter for new line · {role.full}</div>}
          </div>
        </div>

        {builderOpen&&!isMobile&&<BuilderPanel config={config} onChange={updateConfig} onClose={()=>setBuilderOpen(false)}/>}
      </div>

      <style>{`
        @keyframes pulse{0%,100%{opacity:0.2;transform:scale(0.75)}50%{opacity:1;transform:scale(1.15)}}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${T.gray150};border-radius:3px}
        textarea::placeholder{color:${T.gray300}}
        *{box-sizing:border-box}
        @media(max-width:767px){::-webkit-scrollbar{display:none}}
      `}</style>
    </div>
  );
}
