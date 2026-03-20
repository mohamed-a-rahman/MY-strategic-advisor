import { useState, useRef, useEffect } from "react";

const T = {
  teal900: "#0B3D3A", teal800: "#0F4F4A", teal700: "#135F59",
  teal600: "#177A72", teal500: "#1D9E94", teal400: "#26BFB3",
  teal300: "#5ED4CA", teal200: "#9DE6E1", teal100: "#CFFAF7", teal50: "#F0FFFE",
  white: "#FFFFFF", gray50: "#F8FAFA", gray100: "#EEF2F2", gray200: "#D6DEDE",
  gray300: "#B0BCBC", gray400: "#8A9A9A", gray500: "#627070",
  gray600: "#445252", gray700: "#2E3C3C", gray800: "#1E2828",
};

const ROLES = [
  { id:"all",       icon:"◈", label:"Unified Advisor",   sub:"All roles active",              color:T.teal600 },
  { id:"swe",       icon:"⌥", label:"Software Engineer", sub:"Architecture · Security · Dev",  color:T.teal700 },
  { id:"investor",  icon:"◎", label:"Investor",          sub:"PE · CRE · SaaS · Credit",       color:T.teal500 },
  { id:"career",    icon:"⬡", label:"Career Advisor",    sub:"IR · AI Transition",             color:T.teal800 },
  { id:"education", icon:"◉", label:"Education Guide",   sub:"Vibe Code → Pro Builder",        color:T.teal400 },
];

const STARTERS = [
  { label:"My IR advantage",       prompt:"Map how my Investor Relations background becomes a hidden asset as AI reshapes financial services — what should I build on top of it in the next 12 months?" },
  { label:"Learning roadmap",      prompt:"Design a 6-month learning roadmap from vibe coding to being a credible technical partner in an enterprise product build." },
  { label:"AI + private markets",  prompt:"What SaaS opportunities at the intersection of AI and private markets are being systematically underpriced right now?" },
  { label:"SWE collaboration",     prompt:"How do I structure a conversation with a senior SWE to co-build a product meeting institutional-grade security requirements?" },
  { label:"Top 3 moves now",       prompt:"What are the three highest-leverage moves I could make this quarter across all four of your advisory domains simultaneously?" },
];

const SYSTEM = `You are a unified long-term strategic advisor operating simultaneously in four expert roles for a sophisticated professional at the intersection of technology, capital markets, and career transformation.

ROLE 1 — SOFTWARE ENGINEER: Senior full-stack architect. Guide from vibe-coding to professional-grade, secure, scaleable product development.
ROLE 2 — PROFESSIONAL INVESTOR: Technology, Financial Services, Private Equity, Commercial Real Estate, Private Credit, Secondaries, SaaS.
ROLE 3 — CAREER ADVISOR (IR & AI Focus): Investor Relations professionals navigating AI-dominated services. Skill stacking, personal brand, career capital.
ROLE 4 — EDUCATION GUIDE: Non-SWE to credible technical co-builder. Vibe coding → product management → technical co-founder competence.

FORMATTING: Use markdown. ## for sections, **bold** for key terms, bullet lists, numbered steps, code blocks with language tags. Be direct, specific, peer-level. Connect insights across domains.
End every response with "⟡ Consider also:" with 2 high-value follow-up angles.`;

// ── BUILDER CONFIG (only visible in Builder mode) ──────────────────────────
const DEFAULT_CONFIG = {
  agentName: "Strategic Advisor",
  agentTagline: "Strategic Intelligence",
  sidebarBg: T.teal800,
  accentColor: T.teal600,
  accentLight: T.teal300,
  welcomeTitle: "Strategic Advisor",
  welcomeBody: "Your unified advisor across software engineering, investing, career development, and education. Select a role in the sidebar or ask anything.",
  showStarters: true,
  showRoleSubtitles: true,
  inputPlaceholder: "Ask your advisor…",
  fontStyle: "serif",
};

// ── MARKDOWN ───────────────────────────────────────────────────────────────
function inlineRender(text) {
  const parts = []; let i = 0;
  while (i < text.length) {
    if (text.slice(i,i+2)==="**") { const e=text.indexOf("**",i+2); if(e!==-1){parts.push(<strong key={i} style={{fontWeight:600,color:T.gray700}}>{text.slice(i+2,e)}</strong>);i=e+2;continue;} }
    if (text[i]==="`"&&text[i+1]!=="`") { const e=text.indexOf("`",i+1); if(e!==-1){parts.push(<code key={i} style={{background:T.teal50,border:`1px solid ${T.teal100}`,borderRadius:3,padding:"1px 5px",fontSize:"0.85em",fontFamily:"monospace",color:T.teal700}}>{text.slice(i+1,e)}</code>);i=e+1;continue;} }
    let j=i+1; while(j<text.length&&text[j]!=="*"&&text[j]!=="`")j++;
    parts.push(text.slice(i,j)); i=j;
  }
  return parts.length===1&&typeof parts[0]==="string"?parts[0]:<>{parts}</>;
}

function parseMarkdown(text) {
  const lines = text.split("\n"); const out = []; let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim().startsWith("```")) {
      const lang = line.trim().slice(3).trim(); const code = []; i++;
      while (i<lines.length&&!lines[i].trim().startsWith("```")){code.push(lines[i]);i++;}
      out.push(<div key={i} style={{margin:"0.6rem 0",borderRadius:6,overflow:"hidden",border:`1px solid ${T.gray200}`}}>{lang&&<div style={{padding:"3px 10px",background:T.gray100,fontSize:10,color:T.gray500,fontFamily:"monospace",letterSpacing:"0.1em",textTransform:"uppercase"}}>{lang}</div>}<pre style={{margin:0,padding:"12px 14px",background:T.gray50,fontSize:12,lineHeight:1.65,color:T.gray700,fontFamily:"monospace",overflowX:"auto"}}><code>{code.join("\n")}</code></pre></div>);
      i++; continue;
    }
    if (/^## /.test(line)){out.push(<div key={i} style={{fontSize:12,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:T.teal700,margin:"1rem 0 0.35rem",paddingBottom:"0.3rem",borderBottom:`1px solid ${T.teal100}`}}>{inlineRender(line.slice(3))}</div>);i++;continue;}
    if (/^### /.test(line)){out.push(<div key={i} style={{fontSize:13,fontWeight:600,color:T.teal600,margin:"0.75rem 0 0.25rem"}}>{inlineRender(line.slice(4))}</div>);i++;continue;}
    if (line.startsWith("> ")){const bq=[];while(i<lines.length&&lines[i].startsWith("> ")){bq.push(lines[i].slice(2));i++;}out.push(<div key={`bq${i}`} style={{borderLeft:`3px solid ${T.teal300}`,padding:"0.5rem 0.9rem",margin:"0.5rem 0",background:T.teal50,borderRadius:"0 4px 4px 0",fontSize:13,color:T.gray600,fontStyle:"italic"}}>{bq.map((b,bi)=><div key={bi}>{inlineRender(b)}</div>)}</div>);continue;}
    if (/^---+$/.test(line.trim())){out.push(<hr key={i} style={{border:"none",borderTop:`1px solid ${T.gray100}`,margin:"0.75rem 0"}}/>);i++;continue;}
    if (/^[-*] /.test(line)){const items=[];while(i<lines.length&&/^[-*] /.test(lines[i])){items.push(lines[i].replace(/^[-*] /,""));i++;}out.push(<ul key={`ul${i}`} style={{margin:"0.4rem 0",paddingLeft:0,listStyle:"none"}}>{items.map((it,ii)=><li key={ii} style={{display:"flex",gap:"0.5rem",fontSize:13,lineHeight:1.7,color:T.gray600,margin:"0.15rem 0"}}><span style={{color:T.teal500,flexShrink:0,marginTop:2}}>·</span><span>{inlineRender(it)}</span></li>)}</ul>);continue;}
    if (/^\d+\. /.test(line)){const items=[];while(i<lines.length&&/^\d+\. /.test(lines[i])){items.push(lines[i].replace(/^\d+\. /,""));i++;}out.push(<ol key={`ol${i}`} style={{margin:"0.4rem 0",paddingLeft:0,listStyle:"none"}}>{items.map((it,ii)=><li key={ii} style={{display:"flex",gap:"0.6rem",fontSize:13,lineHeight:1.7,color:T.gray600,margin:"0.2rem 0"}}><span style={{color:T.teal600,fontFamily:"monospace",fontSize:11,minWidth:"1.2rem",paddingTop:2}}>{ii+1}.</span><span>{inlineRender(it)}</span></li>)}</ol>);continue;}
    if (line.trim()===""){out.push(<div key={`sp${i}`} style={{height:"0.35rem"}}/>);i++;continue;}
    out.push(<p key={i} style={{margin:"0.15rem 0",fontSize:13,lineHeight:1.75,color:T.gray600}}>{inlineRender(line)}</p>);
    i++;
  }
  return out;
}

function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  const role = ROLES.find(r => r.id === (msg.roleId||"all"));
  const considerIdx = msg.content.indexOf("⟡ Consider also:");
  const main = considerIdx !== -1 ? msg.content.slice(0, considerIdx) : msg.content;
  const consider = considerIdx !== -1 ? msg.content.slice(considerIdx) : null;
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:isUser?"flex-end":"flex-start",gap:4}}>
      <div style={{fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",color:isUser?role.color:T.gray400,fontWeight:500}}>
        {isUser?`You · ${role.label}`:"◈ Strategic Advisor"}
      </div>
      <div style={{maxWidth:isUser?"82%":"100%",width:isUser?undefined:"100%",padding:isUser?"0.65rem 1rem":"1rem 1.1rem",borderRadius:isUser?"12px 12px 4px 12px":"4px 12px 12px 12px",background:isUser?T.teal600:T.white,border:isUser?"none":`1px solid ${T.gray100}`,boxShadow:isUser?"none":"0 1px 4px rgba(0,0,0,0.05)"}}>
        {isUser
          ? <p style={{margin:0,fontSize:13,lineHeight:1.65,color:T.white}}>{msg.content}</p>
          : <>{parseMarkdown(main)}{consider&&<div style={{marginTop:"1rem",padding:"0.75rem 1rem",background:T.teal50,border:`1px solid ${T.teal200}`,borderRadius:6}}><div style={{fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",color:T.teal600,fontWeight:600,marginBottom:"0.5rem"}}>⟡ Consider also</div>{parseMarkdown(consider.replace("⟡ Consider also:","").trim())}</div>}</>
        }
      </div>
    </div>
  );
}

// ── BUILDER PANEL ──────────────────────────────────────────────────────────
function BuilderPanel({ config, onChange }) {
  const field = (label, key, type="text", opts) => (
    <div style={{marginBottom:"1rem"}}>
      <div style={{fontSize:11,fontWeight:600,color:T.gray500,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4}}>{label}</div>
      {type==="text"&&<input value={config[key]} onChange={e=>onChange(key,e.target.value)} style={{width:"100%",padding:"0.45rem 0.6rem",border:`1px solid ${T.gray200}`,borderRadius:6,fontSize:12,color:T.gray700,background:T.white,fontFamily:"inherit",outline:"none"}}/>}
      {type==="color"&&<div style={{display:"flex",gap:6,alignItems:"center"}}><input type="color" value={config[key]} onChange={e=>onChange(key,e.target.value)} style={{width:32,height:28,border:"none",background:"none",cursor:"pointer",padding:0}}/><span style={{fontSize:11,color:T.gray400,fontFamily:"monospace"}}>{config[key]}</span></div>}
      {type==="toggle"&&<label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}><div style={{width:34,height:18,borderRadius:9,background:config[key]?T.teal500:T.gray200,position:"relative",transition:"background 0.2s",cursor:"pointer"}} onClick={()=>onChange(key,!config[key])}><div style={{position:"absolute",top:2,left:config[key]?16:2,width:14,height:14,borderRadius:"50%",background:T.white,transition:"left 0.2s"}}/></div><span style={{fontSize:12,color:T.gray600}}>{config[key]?"On":"Off"}</span></label>}
      {type==="select"&&<select value={config[key]} onChange={e=>onChange(key,e.target.value)} style={{width:"100%",padding:"0.45rem 0.6rem",border:`1px solid ${T.gray200}`,borderRadius:6,fontSize:12,color:T.gray700,background:T.white}}>{opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}</select>}
    </div>
  );
  return (
    <div style={{width:240,background:T.gray50,borderLeft:`1px solid ${T.gray200}`,display:"flex",flexDirection:"column",overflow:"hidden",flexShrink:0}}>
      <div style={{padding:"1rem 1.25rem 0.75rem",borderBottom:`1px solid ${T.gray200}`,background:T.white}}>
        <div style={{fontSize:13,fontWeight:700,color:T.gray800,letterSpacing:"0.04em"}}>Builder</div>
        <div style={{fontSize:11,color:T.gray400,marginTop:2}}>Customize your agent</div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"1rem 1.25rem"}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:T.teal600,marginBottom:"0.75rem",paddingBottom:"0.4rem",borderBottom:`1px solid ${T.teal100}`}}>Identity</div>
        {field("Agent Name","agentName")}
        {field("Tagline","agentTagline")}
        {field("Welcome Title","welcomeTitle")}
        <div style={{marginBottom:"1rem"}}>
          <div style={{fontSize:11,fontWeight:600,color:T.gray500,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4}}>Welcome Body</div>
          <textarea value={config.welcomeBody} onChange={e=>onChange("welcomeBody",e.target.value)} rows={3} style={{width:"100%",padding:"0.45rem 0.6rem",border:`1px solid ${T.gray200}`,borderRadius:6,fontSize:12,color:T.gray700,background:T.white,resize:"vertical",fontFamily:"inherit",outline:"none",lineHeight:1.5}}/>
        </div>
        {field("Input Placeholder","inputPlaceholder")}

        <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:T.teal600,margin:"1.25rem 0 0.75rem",paddingBottom:"0.4rem",borderBottom:`1px solid ${T.teal100}`}}>Colors</div>
        {field("Sidebar Background","sidebarBg","color")}
        {field("Accent (buttons, active)","accentColor","color")}
        {field("Accent Light (highlights)","accentLight","color")}

        <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:T.teal600,margin:"1.25rem 0 0.75rem",paddingBottom:"0.4rem",borderBottom:`1px solid ${T.teal100}`}}>Display</div>
        {field("Font Style","fontStyle","select",[{v:"serif",l:"Serif (editorial)"},{v:"sans-serif",l:"Sans-serif (modern)"},{v:"monospace",l:"Monospace (technical)"}])}
        {field("Show Quick Starts","showStarters","toggle")}
        {field("Show Role Subtitles","showRoleSubtitles","toggle")}

        <div style={{marginTop:"1rem",padding:"0.75rem",background:T.teal50,borderRadius:6,border:`1px solid ${T.teal100}`}}>
          <div style={{fontSize:11,color:T.teal700,lineHeight:1.5}}>Changes apply live. When ready to finalize, tell Claude what else to adjust or export to Replit/Vercel.</div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────
export default function App() {
  const [mode, setMode] = useState("preview"); // "preview" | "builder"
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState("all");
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, loading]);

  const updateConfig = (key, val) => setConfig(prev => ({...prev, [key]: val}));
  const role = ROLES.find(r => r.id === activeRole);

  const send = async (text) => {
    const t = (text || input).trim();
    if (!t || loading) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    const history = [...messages, { role:"user", content:t, roleId:activeRole }];
    setMessages(history);
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000, system:SYSTEM,
          messages: history.map(m=>({ role:m.role, content:m.role==="user"?`[Role: ${m.roleId||"all"}]\n\n${m.content}`:m.content }))
        })
      });
      const data = await res.json();
      const reply = data.content?.map(b=>b.text||"").join("") || "No response.";
      setMessages([...history, { role:"assistant", content:reply, roleId:activeRole }]);
    } catch(e) {
      setMessages([...history, { role:"assistant", content:`**Error:** ${e.message}`, roleId:activeRole }]);
    } finally { setLoading(false); }
  };

  const ff = config.fontStyle;

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100vh",background:T.gray50,fontFamily:ff,overflow:"hidden"}}>

      {/* ── MODE TOGGLE BAR ── */}
      <div style={{background:T.gray800,padding:"0.45rem 1rem",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:T.teal400}}/>
          <span style={{fontSize:11,color:"rgba(255,255,255,0.5)",letterSpacing:"0.1em",textTransform:"uppercase"}}>Demo Environment</span>
        </div>
        <div style={{display:"flex",gap:4,background:"rgba(255,255,255,0.06)",borderRadius:8,padding:"3px"}}>
          {["preview","builder"].map(m => (
            <button key={m} onClick={()=>setMode(m)} style={{
              padding:"0.3rem 0.85rem", borderRadius:6, border:"none", cursor:"pointer",
              background: mode===m ? T.teal600 : "transparent",
              color: mode===m ? T.white : "rgba(255,255,255,0.45)",
              fontSize:11, fontWeight: mode===m?600:400, letterSpacing:"0.06em", textTransform:"uppercase",
              transition:"all 0.15s",
            }}>
              {m==="preview" ? "◈ Preview" : "⚙ Builder"}
            </button>
          ))}
        </div>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.25)",letterSpacing:"0.08em"}}>v0.1 · Not yet deployed</div>
      </div>

      {/* ── BODY ── */}
      <div style={{flex:1,display:"flex",overflow:"hidden"}}>

        {/* ── SIDEBAR ── */}
        <div style={{width:220,background:config.sidebarBg,display:"flex",flexDirection:"column",flexShrink:0,overflow:"hidden",transition:"background 0.3s"}}>
          <div style={{padding:"1.1rem 1.1rem 0.9rem",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
            <div style={{display:"flex",alignItems:"center",gap:"0.55rem",marginBottom:"0.2rem"}}>
              <span style={{color:config.accentLight,fontSize:"1rem"}}>◈</span>
              <span style={{fontSize:"0.75rem",fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:T.white}}>{config.agentName}</span>
            </div>
            <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.3)",letterSpacing:"0.08em",textTransform:"uppercase",paddingLeft:"1.55rem"}}>{config.agentTagline}</div>
          </div>

          <div style={{padding:"0.75rem 0.65rem 0.4rem"}}>
            <div style={{fontSize:"0.57rem",letterSpacing:"0.18em",textTransform:"uppercase",color:"rgba(255,255,255,0.28)",marginBottom:"0.5rem",paddingLeft:"0.4rem"}}>Advisory Role</div>
            {ROLES.map(r => (
              <button key={r.id} onClick={()=>setActiveRole(r.id)} style={{
                width:"100%",display:"flex",alignItems:"flex-start",gap:"0.6rem",padding:"0.55rem 0.65rem",
                borderRadius:5,border:"none",cursor:"pointer",textAlign:"left",marginBottom:2,
                background:activeRole===r.id?"rgba(255,255,255,0.1)":"transparent",
                borderLeft:activeRole===r.id?`2px solid ${config.accentLight}`:"2px solid transparent",
                transition:"all 0.15s",
              }}>
                <span style={{fontSize:"0.8rem",color:activeRole===r.id?config.accentLight:"rgba(255,255,255,0.38)",flexShrink:0,marginTop:1}}>{r.icon}</span>
                <div>
                  <div style={{fontSize:"0.72rem",fontWeight:activeRole===r.id?600:400,color:activeRole===r.id?T.white:"rgba(255,255,255,0.52)"}}>{r.label}</div>
                  {config.showRoleSubtitles&&<div style={{fontSize:"0.59rem",color:"rgba(255,255,255,0.25)",marginTop:1,lineHeight:1.3}}>{r.sub}</div>}
                </div>
              </button>
            ))}
          </div>

          {config.showStarters&&(
            <div style={{padding:"0.65rem 0.65rem 0.4rem",borderTop:"1px solid rgba(255,255,255,0.06)",marginTop:"auto"}}>
              <div style={{fontSize:"0.57rem",letterSpacing:"0.18em",textTransform:"uppercase",color:"rgba(255,255,255,0.28)",marginBottom:"0.5rem",paddingLeft:"0.4rem"}}>Quick Start</div>
              {STARTERS.map((s,i)=>(
                <button key={i} onClick={()=>send(s.prompt)} style={{width:"100%",textAlign:"left",padding:"0.4rem 0.65rem",background:"transparent",border:"none",cursor:"pointer",fontSize:"0.67rem",color:"rgba(255,255,255,0.38)",borderRadius:4,marginBottom:2,transition:"all 0.15s",lineHeight:1.4}}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.07)";e.currentTarget.style.color="rgba(255,255,255,0.72)";}}
                onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="rgba(255,255,255,0.38);";}}>
                  → {s.label}
                </button>
              ))}
            </div>
          )}

          <div style={{padding:"0.65rem 1.1rem",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
            <div style={{display:"flex",alignItems:"center",gap:"0.45rem"}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:config.accentLight}}/>
              <span style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.28)",letterSpacing:"0.06em"}}>Claude Sonnet 4 · Live</span>
            </div>
          </div>
        </div>

        {/* ── MAIN CHAT ── */}
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div style={{padding:"0.8rem 1.4rem",borderBottom:`1px solid ${T.gray200}`,background:T.white,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:"0.65rem"}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:role.color}}/>
              <span style={{fontSize:"0.82rem",fontWeight:600,color:T.gray800}}>{role.label}</span>
              <span style={{fontSize:"0.7rem",color:T.gray300}}>·</span>
              <span style={{fontSize:"0.7rem",color:T.gray400}}>{role.sub}</span>
            </div>
            {messages.length>0&&<button onClick={()=>setMessages([])} style={{background:"none",border:`1px solid ${T.gray200}`,color:T.gray400,padding:"0.22rem 0.65rem",borderRadius:4,cursor:"pointer",fontSize:"0.66rem"}}>Clear ↺</button>}
          </div>

          <div style={{flex:1,overflowY:"auto",padding:"1.4rem",display:"flex",flexDirection:"column",gap:"1.2rem"}}>
            {messages.length===0&&(
              <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",paddingBottom:"2rem"}}>
                <div style={{width:44,height:44,borderRadius:"50%",background:T.teal50,border:`1px solid ${T.teal200}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem",color:T.teal600,marginBottom:"0.9rem"}}>◈</div>
                <div style={{fontSize:"1rem",fontWeight:600,color:T.gray700,marginBottom:"0.3rem"}}>{config.welcomeTitle}</div>
                <div style={{fontSize:"0.76rem",color:T.gray400,marginBottom:"1.75rem",textAlign:"center",maxWidth:360,lineHeight:1.6}}>{config.welcomeBody}</div>
                {config.showStarters&&(
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.55rem",maxWidth:480,width:"100%"}}>
                    {STARTERS.map((s,i)=>(
                      <button key={i} onClick={()=>send(s.prompt)} style={{background:T.white,border:`1px solid ${T.gray200}`,borderRadius:8,padding:"0.7rem 0.9rem",cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor=T.teal300;e.currentTarget.style.background=T.teal50;}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor=T.gray200;e.currentTarget.style.background=T.white;}}>
                        <div style={{fontSize:"0.7rem",fontWeight:600,color:T.teal700,marginBottom:"0.2rem"}}>{s.label}</div>
                        <div style={{fontSize:"0.65rem",color:T.gray400,lineHeight:1.4}}>{s.prompt.slice(0,68)}…</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {messages.map((msg,i)=><MessageBubble key={i} msg={msg}/>)}
            {loading&&(
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-start",gap:4}}>
                <div style={{fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",color:T.gray400}}>◈ Strategic Advisor</div>
                <div style={{padding:"0.8rem 1rem",borderRadius:"4px 12px 12px 12px",background:T.white,border:`1px solid ${T.gray100}`,boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
                  <div style={{display:"flex",gap:5}}>{[0,1,2].map(j=><div key={j} style={{width:6,height:6,borderRadius:"50%",background:T.teal400,animation:"pulse 1.1s ease-in-out infinite",animationDelay:`${j*0.18}s`}}/>)}</div>
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          <div style={{padding:"0.8rem 1.4rem 0.9rem",borderTop:`1px solid ${T.gray200}`,background:T.white,flexShrink:0}}>
            <div style={{display:"flex",gap:"0.55rem",alignItems:"flex-end",background:T.gray50,border:`1.5px solid ${T.teal300}`,borderRadius:10,padding:"0.45rem 0.45rem 0.45rem 0.85rem"}}>
              <textarea ref={textareaRef} value={input}
                onChange={e=>{setInput(e.target.value);e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,130)+"px";}}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
                placeholder={config.inputPlaceholder} rows={1}
                style={{flex:1,background:"transparent",border:"none",outline:"none",color:T.gray700,fontSize:"0.85rem",resize:"none",fontFamily:"inherit",lineHeight:1.6,padding:"0.28rem 0",maxHeight:130}}
              />
              <button onClick={()=>send()} disabled={loading||!input.trim()} style={{background:loading||!input.trim()?T.gray100:config.accentColor,border:"none",color:loading||!input.trim()?T.gray300:T.white,padding:"0.42rem 0.95rem",borderRadius:7,cursor:loading||!input.trim()?"not-allowed":"pointer",fontSize:"0.76rem",fontWeight:600,transition:"all 0.2s",flexShrink:0}}>
                {loading?"···":"Send"}
              </button>
            </div>
            <div style={{marginTop:"0.35rem",fontSize:"0.6rem",color:T.gray300,textAlign:"center",letterSpacing:"0.06em"}}>Shift+Enter for new line · Role: {role.label}</div>
          </div>
        </div>

        {/* ── BUILDER PANEL ── */}
        {mode==="builder"&&<BuilderPanel config={config} onChange={updateConfig}/>}
      </div>

      <style>{`
        @keyframes pulse{0%,100%{opacity:0.2;transform:scale(0.8)}50%{opacity:1;transform:scale(1.1)}}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${T.gray200};border-radius:2px}
        textarea::placeholder{color:${T.gray300}}*{box-sizing:border-box}
      `}</style>
    </div>
  );
}
