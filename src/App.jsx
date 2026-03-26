import { useState, useEffect, useCallback, useRef } from "react";

// ─── Audio Engine ─────────────────────────────────────────────────────────────
function useAudio(audioSettings) {
  const ctx = useRef(null);
  const getCtx = () => {
    if (!ctx.current) ctx.current = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.current.state === "suspended") ctx.current.resume();
    return ctx.current;
  };
  const playTone = useCallback((freqs, type, vol, spacing, dur) => {
    if (!audioSettings.enabled) return;
    const ac = getCtx();
    freqs.forEach((f, i) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.frequency.value = f; o.type = type;
      const t = ac.currentTime + i * spacing;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol * audioSettings.volume, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.start(t); o.stop(t + dur);
    });
  }, [audioSettings]);

  const SOUNDS = {
    classic: { freqs:[523,659,784,1047], type:"sine",     vol:0.18, sp:0.10, dur:0.18 },
    arcade:  { freqs:[440,550,660,880],  type:"square",   vol:0.10, sp:0.07, dur:0.12 },
    gentle:  { freqs:[440,554,659,880],  type:"sine",     vol:0.10, sp:0.14, dur:0.28 },
    marimba: { freqs:[523,659,784,1047], type:"triangle", vol:0.18, sp:0.10, dur:0.22 },
    piano:   { freqs:[392,494,587,784],  type:"sine",     vol:0.15, sp:0.09, dur:0.30 },
  };

  const coin = useCallback(() => {
    const s = SOUNDS[audioSettings.coinSound] || SOUNDS.classic;
    playTone(s.freqs, s.type, s.vol, s.sp, s.dur);
  }, [audioSettings, playTone]);

  const spend = useCallback(() => {
    if (!audioSettings.enabled) return;
    playTone([400,300], "triangle", 0.15, 0.12, 0.2);
  }, [audioSettings, playTone]);

  return { coin, spend };
}

// ─── Defaults ─────────────────────────────────────────────────────────────────
const DEFAULT_APPEARANCE = {
  bgColor:"FFF9EE", headerColor:"1A1F3C", accentColor:"F4A614",
  cardStyle:"rounded", fontStyle:"fredoka",
};
const DEFAULT_AUDIO = {
  enabled:true, volume:1.0, coinSound:"classic", burstEffect:true,
};
const DEFAULT_KIDS = [
  { id:"charlie", name:"Charlie", color:"4ECDC4", emoji:"✨", avatar:"🧒" },
  { id:"jaxson",  name:"Jaxson",  color:"FF6B6B", emoji:"🔥", avatar:"👦" },
];
const DEFAULT_ACTIVITIES = [
  { id:"reading",    emoji:"📖", label:"Reading",         pts:3, cat:"learn",  note:"per 20 min" },
  { id:"piano",      emoji:"🎹", label:"Piano",           pts:3, cat:"learn",  note:"per 20 min" },
  { id:"coding",     emoji:"💻", label:"Coding",          pts:4, cat:"learn",  note:"per 30 min" },
  { id:"sports",     emoji:"🏅", label:"Sports/Exercise", pts:2, cat:"active", note:"per session" },
  { id:"swim",       emoji:"🏄", label:"Swim / Surf",     pts:2, cat:"active", note:"per session" },
  { id:"bike",       emoji:"🚴", label:"Bike / Skate",    pts:2, cat:"active", note:"per session" },
  { id:"art",        emoji:"🎨", label:"Art Project",     pts:3, cat:"create", note:"per session" },
  { id:"chores",     emoji:"🧹", label:"Cleaning",        pts:2, cat:"create", note:"per task" },
  { id:"gamenight",  emoji:"🎲", label:"Game Night",      pts:2, cat:"create", note:"per session" },
  { id:"willi",      emoji:"🌟", label:"Help Willi",      pts:5, cat:"help",   note:"special!" },
  { id:"screenfree", emoji:"📵", label:"Screen-Free Day", pts:4, cat:"help",   note:"bonus!" },
];
const DEFAULT_REWARDS = [
  { id:"icecream",  emoji:"🍦", label:"Ice cream trip",           cost:15 },
  { id:"screenex",  emoji:"🎮", label:"Extra 60 min screen time", cost:12 },
  { id:"movie",     emoji:"🎬", label:"Family movie pick",        cost:10 },
  { id:"money",     emoji:"🛒", label:"$5 treat money",           cost:20 },
  { id:"beach",     emoji:"🏖️", label:"Beach day",               cost:25 },
  { id:"latenight", emoji:"🌙", label:"Stay up 30 min later",     cost:8  },
  { id:"chorecard", emoji:"🃏", label:"Skip one chore",           cost:10 },
  { id:"dinner",    emoji:"🍕", label:"Choose dinner tonight",    cost:12 },
];
const DEFAULT_CHALLENGES = [
  { id:"bookworm",    emoji:"📚", label:"Book Worm",     desc:"Reading sessions this month",      goal:5, reward:"🏆 Prize + 10 bonus tokens", type:"activity", actId:"reading" },
  { id:"screenslayer",emoji:"📵", label:"Screen Slayer", desc:"Low-screen weeks (under 315 min)", goal:2, reward:"🏆 Movie night prize",          type:"screenlow" },
  { id:"allrounder",  emoji:"🌈", label:"All-Rounder",   desc:"Different activity types done",    goal:5, reward:"🏆 $5 treat money",            type:"variety" },
  { id:"neighbor",    emoji:"🌟", label:"Good Neighbor", desc:"Times helping Willi",              goal:2, reward:"🏆 Family activity prize",      type:"activity", actId:"willi" },
];

const CAT_COLORS = { learn:"EFF6FF", active:"F0FDF4", create:"FFF7ED", help:"F5F3FF" };
const CAT_LABELS = { learn:"📚 Learning", active:"🏃 Active", create:"🎨 Create", help:"⭐ Help & Bonus" };
const COIN_SOUNDS   = ["classic","arcade","gentle","marimba","piano"];
const CARD_RADII    = { rounded:16, sharp:6, bubbly:24 };
const AVATAR_OPTIONS = ["🧒","👦","👧","🧒‍♀️","🦸","🦸‍♀️","🐶","🦊","🐱","⚡","🌊","🔥","💎","🚀","🎯","🌟"];
const COLOR_PALETTE  = ["4ECDC4","FF6B6B","A78BFA","F4A614","6BCB77","F472B6","60A5FA","FB923C","34D399","E879F9"];

function initState() {
  return {
    week:1, tokens:{charlie:{},jaxson:{}}, screenTime:{charlie:{},jaxson:{}},
    log:[], kids:DEFAULT_KIDS, activities:DEFAULT_ACTIVITIES,
    rewards:DEFAULT_REWARDS, challenges:DEFAULT_CHALLENGES,
    appearance:DEFAULT_APPEARANCE, audio:DEFAULT_AUDIO,
  };
}
function loadState() {
  try { const r=localStorage.getItem("bowersV3"); return r?{...initState(),...JSON.parse(r)}:initState(); }
  catch { return initState(); }
}

// ─── Small UI bits ────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#fff",borderRadius:20,padding:24,width:"100%",maxWidth:480,maxHeight:"88vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.25)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <span style={{fontFamily:"Fredoka One,cursive",fontSize:"1.25rem",color:"#1A1F3C"}}>{title}</span>
          <button onClick={onClose} style={{background:"#F3F4F6",border:"none",borderRadius:10,padding:"4px 10px",cursor:"pointer",fontSize:"1rem",color:"#6B7280"}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type="text", min, max, step, placeholder, hint }) {
  return (
    <div style={{marginBottom:14}}>
      <label style={{display:"block",fontSize:"0.72rem",fontWeight:800,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:1,marginBottom:hint?2:4}}>{label}</label>
      {hint&&<div style={{fontSize:"0.73rem",color:"#9CA3AF",marginBottom:4}}>{hint}</div>}
      <input type={type} value={value} min={min} max={max} step={step} placeholder={placeholder}
        onChange={e=>onChange(type==="number"?Number(e.target.value):e.target.value)}
        style={{width:"100%",border:"2px solid #E5E7EB",borderRadius:10,padding:"8px 12px",fontFamily:"Nunito,sans-serif",fontWeight:700,fontSize:"0.95rem",color:"#1A1F3C",outline:"none"}}
        onFocus={e=>e.target.style.borderColor="#4ECDC4"} onBlur={e=>e.target.style.borderColor="#E5E7EB"} />
    </div>
  );
}

function Toast({ msg }) {
  return (
    <div style={{position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",background:"#1A1F3C",color:"#fff",padding:"11px 26px",borderRadius:50,fontFamily:"Fredoka One,cursive",fontSize:"1rem",boxShadow:"0 6px 30px rgba(0,0,0,0.25)",zIndex:2000,pointerEvents:"none",whiteSpace:"nowrap"}}>
      {msg}
    </div>
  );
}

function CoinBurst({ x, y, onDone }) {
  useEffect(()=>{const t=setTimeout(onDone,700);return()=>clearTimeout(t);},[onDone]);
  return (
    <div style={{position:"fixed",left:x,top:y,pointerEvents:"none",zIndex:3000}}>
      {Array.from({length:8},(_,i)=>{
        const a=(i/8)*360,rad=a*Math.PI/180,dx=Math.cos(rad)*55,dy=Math.sin(rad)*55;
        return <div key={i} style={{position:"absolute",fontSize:"1.2rem",animation:"coinfly 0.6s ease-out forwards","--dx":`${dx}px`,"--dy":`${dy}px`}}>🪙</div>;
      })}
      <style>{`@keyframes coinfly{0%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(var(--dx),var(--dy)) scale(0.3);opacity:0}}`}</style>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [s, setS]           = useState(loadState);
  const [selectedKid, setSK]= useState("charlie");
  const [toast, setToast]   = useState(null);
  const [bursts, setBursts] = useState([]);
  const [modal, setModal]   = useState(null);
  const [editTarget, setET] = useState(null);
  const [tab, setTab]       = useState("log");
  const audio = useAudio(s.audio);

  const save = useCallback(ns=>{setS(ns);try{localStorage.setItem("bowersV3",JSON.stringify(ns));}catch{}}, []);
  const showToast = useCallback(msg=>{setToast(msg);setTimeout(()=>setToast(null),2400);}, []);

  const burst = useCallback(e=>{
    if (!s.audio.burstEffect) return;
    const r=e.currentTarget.getBoundingClientRect();
    setBursts(b=>[...b,{id:Date.now(),x:r.left+r.width/2,y:r.top+r.height/2}]);
  }, [s.audio.burstEffect]);

  const ap     = s.appearance;
  const navy   = "#"+ap.headerColor;
  const gold   = "#"+ap.accentColor;
  const cream  = "#"+ap.bgColor;
  const radius = CARD_RADII[ap.cardStyle]||16;
  const fontH  = ap.fontStyle==="fredoka"?"Fredoka One,cursive":ap.fontStyle==="fun"?"Comic Sans MS,cursive":"Georgia,serif";

  const wk    = `w${s.week}`;
  const getT  = kid=>s.tokens[kid]?.[wk]||0;
  const getMT = kid=>Object.values(s.tokens[kid]||{}).reduce((a,b)=>a+b,0);

  const logActivity = (act,e) => {
    const entry={id:Date.now(),kid:selectedKid,actId:act.id,emoji:act.emoji,label:act.label,pts:act.pts,week:s.week,ts:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})};
    const ns=structuredClone(s);
    if(!ns.tokens[selectedKid])ns.tokens[selectedKid]={};
    ns.tokens[selectedKid][wk]=(ns.tokens[selectedKid][wk]||0)+act.pts;
    ns.log=[entry,...ns.log];
    save(ns);audio.coin();burst(e);
    showToast(`+${act.pts} tokens → ${s.kids.find(k=>k.id===selectedKid)?.name}! 🎉`);
  };

  const deleteLog = id=>{
    const entry=s.log.find(e=>e.id===id);if(!entry)return;
    const ns=structuredClone(s);
    ns.log=ns.log.filter(e=>e.id!==id);
    if(entry.week===s.week)ns.tokens[entry.kid][wk]=Math.max(0,(ns.tokens[entry.kid][wk]||0)-entry.pts);
    save(ns);
  };

  const claimReward=(reward,kid)=>{
    if(getT(kid)<reward.cost){showToast("Not enough tokens! 😬");return;}
    const ns=structuredClone(s);ns.tokens[kid][wk]=getT(kid)-reward.cost;
    save(ns);audio.spend();
    showToast(`${s.kids.find(k=>k.id===kid)?.name} claimed: ${reward.label} ${reward.emoji}`);
  };

  const addTokens=(kid,n)=>{
    const ns=structuredClone(s);
    if(!ns.tokens[kid])ns.tokens[kid]={};
    ns.tokens[kid][wk]=Math.max(0,(ns.tokens[kid][wk]||0)+n);
    save(ns);if(n>0){audio.coin();showToast(`+${n} tokens → ${s.kids.find(k=>k.id===kid)?.name}`);}
  };

  const getScreen=kid=>s.screenTime[kid]?.[wk]||0;
  const setScreen=(kid,v)=>{const ns=structuredClone(s);if(!ns.screenTime[kid])ns.screenTime[kid]={};ns.screenTime[kid][wk]=v;save(ns);};

  const getChallengeProgress=(ch,kid)=>{
    if(ch.type==="activity") return s.log.filter(e=>e.kid===kid&&e.actId===ch.actId).length;
    if(ch.type==="screenlow")return Object.values(s.screenTime[kid]||{}).filter(v=>v<315).length;
    if(ch.type==="variety") return new Set(s.log.filter(e=>e.kid===kid).map(e=>e.actId)).size;
    return 0;
  };

  const openEdit=(type,target)=>{setModal(type);setET(structuredClone(target));};

  const saveActivity =()=>{ const ns=structuredClone(s);const i=ns.activities.findIndex(a=>a.id===editTarget.id);if(i>=0)ns.activities[i]=editTarget;else ns.activities.push({...editTarget,id:Date.now().toString()});save(ns);setModal(null); };
  const saveReward   =()=>{ const ns=structuredClone(s);const i=ns.rewards.findIndex(r=>r.id===editTarget.id);if(i>=0)ns.rewards[i]=editTarget;else ns.rewards.push({...editTarget,id:Date.now().toString()});save(ns);setModal(null); };
  const saveChallenge=()=>{ const ns=structuredClone(s);const i=ns.challenges.findIndex(c=>c.id===editTarget.id);if(i>=0)ns.challenges[i]=editTarget;else ns.challenges.push({...editTarget,id:Date.now().toString()});save(ns);setModal(null); };
  const saveKid=()=>{
    const ns=structuredClone(s);
    if(editTarget.id){const i=ns.kids.findIndex(k=>k.id===editTarget.id);if(i>=0)ns.kids[i]=editTarget;}
    else{const id=editTarget.name.toLowerCase().replace(/\s+/g,"_")+Date.now();ns.kids.push({...editTarget,id});ns.tokens[id]={};ns.screenTime[id]={};}
    save(ns);setModal(null);
  };
  const saveAppearance=()=>{const ns=structuredClone(s);ns.appearance=editTarget;save(ns);setModal(null);};
  const saveAudio=()=>{const ns=structuredClone(s);ns.audio=editTarget;save(ns);setModal(null);};

  const del=(key,idKey)=>id=>{const ns=structuredClone(s);ns[key]=ns[key].filter(x=>x[idKey]!==id);save(ns);setModal(null);};
  const delActivity =del("activities","id");
  const delReward   =del("rewards","id");
  const delChallenge=del("challenges","id");

  const cats=[...new Set(s.activities.map(a=>a.cat))];
  const weekLog=s.log.filter(e=>e.week===s.week);
  const kidColor=id=>"#"+(s.kids.find(k=>k.id===id)?.color||"888");
  const kidEmoji=id=>s.kids.find(k=>k.id===id)?.emoji||"";
  const kidAvatar=id=>s.kids.find(k=>k.id===id)?.avatar||"👦";

  const chGrad=["linear-gradient(135deg,#FFF3CD,#FFF9EE)","linear-gradient(135deg,#D1FAE5,#ECFDF5)","linear-gradient(135deg,#EDE9FE,#F5F3FF)","linear-gradient(135deg,#FFE4E6,#FFF1F2)"];
  const chFill=["#F4A614","#22C55E","#A78BFA","#FF6B6B"];

  const tbStyle=id=>({padding:"8px 18px",borderRadius:50,border:"none",fontFamily:fontH,fontSize:"0.9rem",background:tab===id?navy:"#fff",color:tab===id?"#fff":navy,boxShadow:tab===id?"0 4px 14px rgba(26,31,60,0.2)":"0 2px 8px rgba(0,0,0,0.07)",transform:tab===id?"scale(1.04)":"",transition:"all .2s",cursor:"pointer"});

  return (
    <div style={{fontFamily:"Nunito,sans-serif",background:cream,minHeight:"100vh",padding:"14px 12px 60px"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}button{cursor:pointer}
        .ab:hover{transform:translateY(-3px)!important;box-shadow:0 8px 20px rgba(0,0,0,0.13)!important}
        .ab:active{transform:scale(0.95)!important}
        .ei{opacity:0;transition:opacity .15s}.er:hover .ei{opacity:1}
        input:focus{outline:none}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:3px}
      `}</style>

      {/* Header */}
      <div style={{textAlign:"center",paddingBottom:6}}>
        <div style={{fontFamily:fontH,fontSize:"clamp(1.7rem,5vw,2.6rem)",color:navy}}>
          🌟 Bowers <span style={{color:gold}}>Token Board</span>
        </div>
        <div style={{color:"#9CA3AF",fontWeight:700,fontSize:"0.82rem",marginTop:2}}>Earn tokens · Do great things · Win big</div>
      </div>

      {/* Week nav */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,margin:"12px 0 6px"}}>
        <button onClick={()=>{const ns=structuredClone(s);ns.week=Math.max(1,s.week-1);save(ns);}} style={{background:navy,color:"#fff",border:"none",borderRadius:"50%",width:32,height:32,fontSize:"1.1rem"}}>‹</button>
        <span style={{fontFamily:fontH,fontSize:"1.2rem",color:navy,minWidth:110,textAlign:"center"}}>Week {s.week}</span>
        <button onClick={()=>{const ns=structuredClone(s);ns.week=Math.min(16,s.week+1);save(ns);}} style={{background:navy,color:"#fff",border:"none",borderRadius:"50%",width:32,height:32,fontSize:"1.1rem"}}>›</button>
      </div>

      {/* Balances */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,maxWidth:680,margin:"12px auto"}}>
        {s.kids.map(kid=>{
          const t=getT(kid.id),mt=getMT(kid.id),pct=Math.min(100,Math.round(mt/120*100));
          const kc="#"+kid.color;
          return (
            <div key={kid.id} style={{background:"#fff",borderRadius:radius,padding:"18px 14px",boxShadow:"0 4px 20px rgba(26,31,60,0.09)",textAlign:"center",position:"relative",overflow:"hidden",border:`2px solid ${kc}22`}}>
              <div style={{position:"absolute",top:-28,right:-28,width:90,height:90,borderRadius:"50%",background:kc,opacity:0.09}}/>
              <div style={{fontSize:"2rem",marginBottom:2}}>{kid.avatar}</div>
              <div style={{fontFamily:fontH,fontSize:"1.2rem",color:kc,marginBottom:2}}>{kid.emoji} {kid.name}</div>
              <div style={{fontFamily:fontH,fontSize:"2.8rem",color:navy,lineHeight:1.1}}>{t}<span style={{fontSize:"1.1rem",color:gold}}> 🪙</span></div>
              <div style={{fontSize:"0.72rem",color:"#9CA3AF",fontWeight:700,marginBottom:8}}>Month: {mt} tokens</div>
              <div style={{display:"flex",gap:5,justifyContent:"center",marginBottom:8}}>
                {[-2,-1,1,2].map(n=>(
                  <button key={n} onClick={()=>addTokens(kid.id,n)}
                    style={{padding:"2px 8px",borderRadius:8,border:`1.5px solid ${n>0?kc:"#E5E7EB"}`,background:n>0?`${kc}18`:"#F9FAFB",color:n>0?kc:"#9CA3AF",fontWeight:800,fontSize:"0.75rem"}}>
                    {n>0?`+${n}`:n}
                  </button>
                ))}
              </div>
              <div style={{background:"#F3F4F6",borderRadius:99,height:7,overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:99,background:`linear-gradient(90deg,${kc},${kc}88)`,width:`${pct}%`,transition:"width .6s ease"}}/>
              </div>
              <div style={{fontSize:"0.65rem",color:"#9CA3AF",fontWeight:700,marginTop:2}}>{pct}% of monthly goal</div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div style={{display:"flex",justifyContent:"center",gap:7,margin:"14px 0",flexWrap:"wrap"}}>
        {[["log","⚡ Log"],["rewards","🎁 Rewards"],["challenges","🏆 Challenges"],["settings","⚙️ Settings"]].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={tbStyle(id)}>{label}</button>
        ))}
      </div>

      <div style={{maxWidth:680,margin:"0 auto"}}>

        {/* ── LOG ── */}
        {tab==="log"&&<>
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            {s.kids.map(kid=>(
              <button key={kid.id} onClick={()=>setSK(kid.id)}
                style={{flex:1,padding:"9px",borderRadius:radius,border:`2.5px solid ${selectedKid===kid.id?"#"+kid.color:"#E5E7EB"}`,background:selectedKid===kid.id?`#${kid.color}18`:"#fff",fontFamily:fontH,fontSize:"0.95rem",color:selectedKid===kid.id?"#"+kid.color:navy,transition:"all .15s",boxShadow:selectedKid===kid.id?`0 0 0 3px #${kid.color}33`:"none"}}>
                {kid.avatar} {kid.name}
              </button>
            ))}
          </div>

          {cats.map(cat=>{
            const acts=s.activities.filter(a=>a.cat===cat);if(!acts.length)return null;
            return (
              <div key={cat} style={{marginBottom:14}}>
                <div style={{fontSize:"0.7rem",fontWeight:800,textTransform:"uppercase",letterSpacing:1,color:"#9CA3AF",marginBottom:7}}>{CAT_LABELS[cat]||cat}</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(105px,1fr))",gap:8}}>
                  {acts.map(act=>(
                    <div key={act.id} className="er" style={{position:"relative"}}>
                      <button className="ab" onClick={e=>logActivity(act,e)}
                        style={{width:"100%",border:"none",borderRadius:radius,padding:"10px 6px",background:"#"+CAT_COLORS[cat]+"FF",display:"flex",flexDirection:"column",alignItems:"center",gap:3,color:navy,boxShadow:"0 2px 8px rgba(0,0,0,0.07)",transition:"transform .15s,box-shadow .15s"}}>
                        <span style={{fontSize:"1.4rem"}}>{act.emoji}</span>
                        <span style={{fontWeight:800,fontSize:"0.76rem",textAlign:"center",lineHeight:1.2}}>{act.label}</span>
                        <span style={{fontSize:"0.7rem",fontWeight:800,color:gold}}>+{act.pts} pts</span>
                        <span style={{fontSize:"0.62rem",color:"#9CA3AF",fontWeight:600}}>{act.note}</span>
                      </button>
                      <button className="ei" onClick={()=>openEdit("editActivity",act)}
                        style={{position:"absolute",top:4,right:4,background:"rgba(255,255,255,0.9)",border:"none",borderRadius:6,padding:"1px 5px",fontSize:"0.65rem",color:"#9CA3AF"}}>✏️</button>
                    </div>
                  ))}
                  <button onClick={()=>openEdit("editActivity",{id:null,emoji:"⭐",label:"New Activity",pts:2,cat,note:"per session"})}
                    style={{border:"2px dashed #E5E7EB",borderRadius:radius,padding:"10px 6px",background:"transparent",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,color:"#D1D5DB",fontSize:"0.76rem",fontWeight:800,transition:"all .15s"}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor="#9CA3AF";e.currentTarget.style.color="#9CA3AF"}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor="#E5E7EB";e.currentTarget.style.color="#D1D5DB"}}>
                    <span style={{fontSize:"1.3rem"}}>＋</span>Add
                  </button>
                </div>
              </div>
            );
          })}

          <div style={{background:"#fff",borderRadius:radius,padding:18,boxShadow:"0 4px 20px rgba(26,31,60,0.08)",marginBottom:14}}>
            <div style={{fontFamily:fontH,fontSize:"1rem",color:navy,marginBottom:10}}>📱 Screen Time This Week</div>
            {s.kids.map(kid=>(
              <div key={kid.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <label style={{fontWeight:800,color:navy,minWidth:68,fontSize:"0.85rem"}}>{kid.emoji} {kid.name}</label>
                <input type="number" min={0} max={840} value={getScreen(kid.id)} onChange={e=>setScreen(kid.id,Number(e.target.value))}
                  style={{width:75,border:"2px solid #E5E7EB",borderRadius:9,padding:"5px 9px",fontFamily:"Nunito",fontWeight:700,fontSize:"0.9rem",color:navy}}/>
                <span style={{fontSize:"0.72rem",color:"#9CA3AF",fontWeight:600}}>min/wk</span>
                <span style={{fontSize:"0.72rem",fontWeight:800,color:getScreen(kid.id)<315?"#22C55E":"#EF4444"}}>{getScreen(kid.id)<315?"✅ On track":"⚠️ High"}</span>
              </div>
            ))}
            <div style={{fontSize:"0.68rem",color:"#9CA3AF",fontWeight:600,marginTop:4}}>Under 315 min/week = great week · Baseline: 420 min</div>
          </div>

          <div style={{background:"#fff",borderRadius:radius,padding:18,boxShadow:"0 4px 20px rgba(26,31,60,0.08)"}}>
            <div style={{fontFamily:fontH,fontSize:"1rem",color:navy,marginBottom:10}}>📋 This Week's Log</div>
            {weekLog.length===0
              ?<div style={{textAlign:"center",color:"#D1D5DB",fontWeight:700,padding:18}}>No activities logged yet 👀</div>
              :weekLog.map(e=>(
                <div key={e.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:"1px solid #F3F4F6"}}>
                  <span style={{fontSize:"1.1rem",minWidth:26,textAlign:"center"}}>{e.emoji}</span>
                  <span style={{flex:1,fontWeight:700,color:navy,fontSize:"0.82rem"}}>{e.label}</span>
                  <span style={{fontSize:"0.7rem",fontWeight:800,padding:"2px 7px",borderRadius:20,background:`${kidColor(e.kid)}18`,color:kidColor(e.kid)}}>{kidEmoji(e.kid)}</span>
                  <span style={{fontWeight:800,color:gold,fontSize:"0.82rem",minWidth:30,textAlign:"right"}}>+{e.pts}</span>
                  <button onClick={()=>deleteLog(e.id)} style={{background:"none",border:"none",color:"#D1D5DB",fontSize:"0.85rem",padding:"2px 5px",borderRadius:5,transition:"color .15s"}}
                    onMouseEnter={e=>e.currentTarget.style.color="#EF4444"} onMouseLeave={e=>e.currentTarget.style.color="#D1D5DB"}>✕</button>
                </div>
              ))
            }
          </div>
        </>}

        {/* ── REWARDS ── */}
        {tab==="rewards"&&(
          <div style={{background:"#fff",borderRadius:radius,padding:18,boxShadow:"0 4px 20px rgba(26,31,60,0.08)"}}>
            <div style={{fontFamily:fontH,fontSize:"1.1rem",color:navy,marginBottom:14}}>🎁 Rewards Menu</div>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {s.rewards.map(r=>(
                <div key={r.id} className="er" style={{display:"flex",alignItems:"center",gap:10,padding:"11px 13px",borderRadius:radius,background:"#FAFAFA",border:"1.5px solid #F3F4F6",transition:"all .2s",position:"relative"}}>
                  <span style={{fontSize:"1.3rem",minWidth:26,textAlign:"center"}}>{r.emoji}</span>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:800,color:navy,fontSize:"0.88rem"}}>{r.label}</div>
                    <div style={{fontSize:"0.72rem",fontWeight:800,color:gold}}>{r.cost} 🪙 tokens</div>
                  </div>
                  <div style={{display:"flex",gap:5,alignItems:"center"}}>
                    {s.kids.map(kid=>(
                      <button key={kid.id} onClick={()=>claimReward(r,kid.id)} disabled={getT(kid.id)<r.cost} title={kid.name}
                        style={{padding:"4px 11px",borderRadius:9,border:"none",background:getT(kid.id)>=r.cost?"#"+ap.accentColor:"#E5E7EB",color:getT(kid.id)>=r.cost?navy:"#9CA3AF",fontFamily:fontH,fontSize:"0.8rem",cursor:getT(kid.id)>=r.cost?"pointer":"not-allowed"}}>
                        {kid.emoji}
                      </button>
                    ))}
                    <button className="ei" onClick={()=>openEdit("editReward",r)} style={{background:"none",border:"none",color:"#9CA3AF",fontSize:"0.82rem",padding:"3px 5px"}}>✏️</button>
                    <button className="ei" onClick={()=>delReward(r.id)} style={{background:"none",border:"none",color:"#9CA3AF",fontSize:"0.82rem",padding:"3px 5px"}}
                      onMouseEnter={e=>e.currentTarget.style.color="#EF4444"} onMouseLeave={e=>e.currentTarget.style.color="#9CA3AF"}>🗑️</button>
                  </div>
                </div>
              ))}
              <button onClick={()=>openEdit("editReward",{id:null,emoji:"🎁",label:"New Reward",cost:10})}
                style={{border:"2px dashed #E5E7EB",borderRadius:radius,padding:"11px",background:"transparent",color:"#9CA3AF",fontWeight:800,fontSize:"0.85rem"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor="#9CA3AF"} onMouseLeave={e=>e.currentTarget.style.borderColor="#E5E7EB"}>
                ＋ Add Reward
              </button>
            </div>
          </div>
        )}

        {/* ── CHALLENGES ── */}
        {tab==="challenges"&&(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {s.challenges.map((ch,ci)=>(
                <div key={ch.id} className="er" style={{background:chGrad[ci%4],borderRadius:radius,padding:14,position:"relative"}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
                    <span style={{fontSize:"1.1rem"}}>{ch.emoji}</span>
                    <span style={{fontFamily:fontH,fontSize:"0.95rem",color:navy}}>{ch.label}</span>
                  </div>
                  <div style={{fontSize:"0.72rem",fontWeight:700,color:"#6B7280",marginBottom:7}}>{ch.desc}</div>
                  {s.kids.map(kid=>{
                    const v=Math.min(getChallengeProgress(ch,kid.id),ch.goal),pct=Math.round(v/ch.goal*100);
                    return (
                      <div key={kid.id} style={{marginBottom:5}}>
                        <div style={{fontSize:"0.7rem",fontWeight:800,color:"#9CA3AF",marginBottom:2}}>{kid.avatar} {kid.name}: {v}/{ch.goal} {pct>=100?"✅":""}</div>
                        <div style={{background:"rgba(255,255,255,0.6)",borderRadius:99,height:7,overflow:"hidden"}}>
                          <div style={{height:"100%",borderRadius:99,background:chFill[ci%4],width:`${pct}%`,transition:"width .5s ease"}}/>
                        </div>
                      </div>
                    );
                  })}
                  <div style={{fontSize:"0.68rem",fontWeight:800,color:"#6B7280",marginTop:5}}>{ch.reward}</div>
                  <div className="ei" style={{position:"absolute",top:7,right:7,display:"flex",gap:4}}>
                    <button onClick={()=>openEdit("editChallenge",ch)} style={{background:"rgba(255,255,255,0.85)",border:"none",borderRadius:6,padding:"2px 6px",fontSize:"0.7rem",color:"#6B7280"}}>✏️</button>
                    <button onClick={()=>delChallenge(ch.id)} style={{background:"rgba(255,255,255,0.85)",border:"none",borderRadius:6,padding:"2px 6px",fontSize:"0.7rem",color:"#6B7280"}}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={()=>openEdit("editChallenge",{id:null,emoji:"🏆",label:"New Challenge",desc:"Description",goal:5,reward:"Prize!",type:"activity",actId:"reading"})}
              style={{marginTop:10,width:"100%",border:"2px dashed #E5E7EB",borderRadius:radius,padding:"11px",background:"transparent",color:"#9CA3AF",fontWeight:800,fontSize:"0.85rem"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor="#9CA3AF"} onMouseLeave={e=>e.currentTarget.style.borderColor="#E5E7EB"}>
              ＋ Add Challenge
            </button>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {tab==="settings"&&(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {/* Kids */}
            <div style={{background:"#fff",borderRadius:radius,padding:18,boxShadow:"0 4px 20px rgba(26,31,60,0.08)"}}>
              <div style={{fontFamily:fontH,fontSize:"1rem",color:navy,marginBottom:12}}>👨‍👩‍👧‍👦 Kids</div>
              {s.kids.map(kid=>(
                <div key={kid.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #F3F4F6"}}>
                  <span style={{fontSize:"1.4rem"}}>{kid.avatar}</span>
                  <span style={{flex:1,fontWeight:800,color:navy}}>{kid.name}</span>
                  <span style={{width:18,height:18,borderRadius:"50%",background:"#"+kid.color,display:"inline-block"}}/>
                  <button onClick={()=>openEdit("editKid",kid)} style={{background:"#F3F4F6",border:"none",borderRadius:8,padding:"4px 10px",color:"#6B7280",fontWeight:700,fontSize:"0.78rem"}}>Edit</button>
                </div>
              ))}
              <button onClick={()=>openEdit("editKid",{id:null,emoji:"⭐",name:"New Kid",color:"A78BFA",avatar:"🧒"})}
                style={{marginTop:10,width:"100%",border:"2px dashed #E5E7EB",borderRadius:10,padding:"9px",background:"transparent",color:"#9CA3AF",fontWeight:800,fontSize:"0.82rem"}}>
                ＋ Add Kid
              </button>
            </div>
            {/* Appearance */}
            <div style={{background:"#fff",borderRadius:radius,padding:18,boxShadow:"0 4px 20px rgba(26,31,60,0.08)"}}>
              <div style={{fontFamily:fontH,fontSize:"1rem",color:navy,marginBottom:4}}>🎨 Appearance</div>
              <div style={{fontSize:"0.78rem",color:"#9CA3AF",fontWeight:600,marginBottom:12}}>Colors, card style, fonts — no rebuild ever needed</div>
              <button onClick={()=>openEdit("appearance",s.appearance)}
                style={{width:"100%",padding:"10px",borderRadius:12,border:"2px solid #E5E7EB",background:"#FAFAFA",fontWeight:800,color:navy,fontSize:"0.88rem"}}>
                ✏️ Open Appearance Settings
              </button>
            </div>
            {/* Audio */}
            <div style={{background:"#fff",borderRadius:radius,padding:18,boxShadow:"0 4px 20px rgba(26,31,60,0.08)"}}>
              <div style={{fontFamily:fontH,fontSize:"1rem",color:navy,marginBottom:4}}>🔊 Audio & Effects</div>
              <div style={{fontSize:"0.78rem",color:"#9CA3AF",fontWeight:600,marginBottom:12}}>Coin sounds, volume, burst animation — no rebuild ever needed</div>
              <button onClick={()=>openEdit("audioSettings",s.audio)}
                style={{width:"100%",padding:"10px",borderRadius:12,border:"2px solid #E5E7EB",background:"#FAFAFA",fontWeight:800,color:navy,fontSize:"0.88rem"}}>
                🔊 Open Audio Settings
              </button>
            </div>
            {/* Reset */}
            <div style={{background:"#FFF5F5",borderRadius:radius,padding:18,border:"1.5px solid #FCA5A5"}}>
              <div style={{fontFamily:fontH,fontSize:"1rem",color:"#DC2626",marginBottom:10}}>⚠️ Reset</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <button onClick={()=>{if(!window.confirm("Reset this week's data?"))return;const ns=structuredClone(s);s.kids.forEach(k=>{if(ns.tokens[k.id])ns.tokens[k.id][wk]=0;if(ns.screenTime[k.id])ns.screenTime[k.id][wk]=0;});ns.log=ns.log.filter(e=>e.week!==s.week);save(ns);showToast("Week reset! 🌟");}}
                  style={{padding:"9px 16px",borderRadius:12,border:"none",background:"#FCA5A5",color:"#fff",fontFamily:fontH,fontSize:"0.88rem"}}>Reset This Week</button>
                <button onClick={()=>{if(!window.confirm("Reset ALL data? Cannot be undone."))return;save(initState());showToast("Everything reset!");}}
                  style={{padding:"9px 16px",borderRadius:12,border:"none",background:"#DC2626",color:"#fff",fontFamily:fontH,fontSize:"0.88rem"}}>Reset All Data</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── MODALS ── */}
      {modal==="editActivity"&&editTarget&&(
        <Modal title={editTarget.id?"Edit Activity":"New Activity"} onClose={()=>setModal(null)}>
          <Field label="Emoji" value={editTarget.emoji} onChange={v=>setET(t=>({...t,emoji:v}))} hint="Paste any emoji from your phone keyboard 🎯" />
          <Field label="Activity Name" value={editTarget.label} onChange={v=>setET(t=>({...t,label:v}))} />
          <Field label="Tokens Earned" type="number" min={1} value={editTarget.pts} onChange={v=>setET(t=>({...t,pts:v}))} />
          <Field label="Note (e.g. per 20 min)" value={editTarget.note} onChange={v=>setET(t=>({...t,note:v}))} />
          <div style={{marginBottom:14}}>
            <label style={{display:"block",fontSize:"0.72rem",fontWeight:800,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Category</label>
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
              {Object.entries(CAT_LABELS).map(([k,v])=>(
                <button key={k} onClick={()=>setET(t=>({...t,cat:k}))}
                  style={{padding:"5px 12px",borderRadius:10,border:`2px solid ${editTarget.cat===k?"#4ECDC4":"#E5E7EB"}`,background:editTarget.cat===k?"#EFF9FF":"#fff",fontWeight:700,fontSize:"0.78rem",color:navy}}>
                  {v.split(" ")[0]} {k}
                </button>
              ))}
            </div>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            {editTarget.id&&<button onClick={()=>delActivity(editTarget.id)} style={{padding:"9px 14px",borderRadius:11,border:"none",background:"#FCA5A5",color:"#fff",fontWeight:800}}>Delete</button>}
            <button onClick={saveActivity} style={{padding:"9px 18px",borderRadius:11,border:"none",background:navy,color:"#fff",fontFamily:fontH,fontSize:"0.95rem"}}>Save</button>
          </div>
        </Modal>
      )}

      {modal==="editReward"&&editTarget&&(
        <Modal title={editTarget.id?"Edit Reward":"New Reward"} onClose={()=>setModal(null)}>
          <Field label="Emoji" value={editTarget.emoji} onChange={v=>setET(t=>({...t,emoji:v}))} hint="Paste any emoji" />
          <Field label="Reward Name" value={editTarget.label} onChange={v=>setET(t=>({...t,label:v}))} />
          <Field label="Token Cost" type="number" min={1} value={editTarget.cost} onChange={v=>setET(t=>({...t,cost:v}))} />
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            {editTarget.id&&<button onClick={()=>delReward(editTarget.id)} style={{padding:"9px 14px",borderRadius:11,border:"none",background:"#FCA5A5",color:"#fff",fontWeight:800}}>Delete</button>}
            <button onClick={saveReward} style={{padding:"9px 18px",borderRadius:11,border:"none",background:navy,color:"#fff",fontFamily:fontH,fontSize:"0.95rem"}}>Save</button>
          </div>
        </Modal>
      )}

      {modal==="editChallenge"&&editTarget&&(
        <Modal title={editTarget.id?"Edit Challenge":"New Challenge"} onClose={()=>setModal(null)}>
          <Field label="Emoji" value={editTarget.emoji} onChange={v=>setET(t=>({...t,emoji:v}))} />
          <Field label="Title" value={editTarget.label} onChange={v=>setET(t=>({...t,label:v}))} />
          <Field label="Description" value={editTarget.desc} onChange={v=>setET(t=>({...t,desc:v}))} />
          <Field label="Goal Number" type="number" min={1} value={editTarget.goal} onChange={v=>setET(t=>({...t,goal:v}))} hint="How many times they need to complete this" />
          <Field label="Prize / Reward Text" value={editTarget.reward} onChange={v=>setET(t=>({...t,reward:v}))} />
          <div style={{marginBottom:14}}>
            <label style={{display:"block",fontSize:"0.72rem",fontWeight:800,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Type</label>
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
              {[["activity","Count an Activity"],["screenlow","Low Screen Weeks"],["variety","Activity Variety"]].map(([k,v])=>(
                <button key={k} onClick={()=>setET(t=>({...t,type:k}))}
                  style={{padding:"5px 12px",borderRadius:10,border:`2px solid ${editTarget.type===k?"#4ECDC4":"#E5E7EB"}`,background:editTarget.type===k?"#EFF9FF":"#fff",fontWeight:700,fontSize:"0.78rem",color:navy}}>
                  {v}
                </button>
              ))}
            </div>
          </div>
          {editTarget.type==="activity"&&(
            <div style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:"0.72rem",fontWeight:800,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Which Activity to Track</label>
              <select value={editTarget.actId||""} onChange={e=>setET(t=>({...t,actId:e.target.value}))}
                style={{width:"100%",border:"2px solid #E5E7EB",borderRadius:10,padding:"8px 12px",fontFamily:"Nunito",fontWeight:700,fontSize:"0.9rem",color:navy}}>
                {s.activities.map(a=><option key={a.id} value={a.id}>{a.emoji} {a.label}</option>)}
              </select>
            </div>
          )}
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            {editTarget.id&&<button onClick={()=>delChallenge(editTarget.id)} style={{padding:"9px 14px",borderRadius:11,border:"none",background:"#FCA5A5",color:"#fff",fontWeight:800}}>Delete</button>}
            <button onClick={saveChallenge} style={{padding:"9px 18px",borderRadius:11,border:"none",background:navy,color:"#fff",fontFamily:fontH,fontSize:"0.95rem"}}>Save</button>
          </div>
        </Modal>
      )}

      {modal==="editKid"&&editTarget&&(
        <Modal title={editTarget.id?"Edit Kid":"Add Kid"} onClose={()=>setModal(null)}>
          <Field label="Name" value={editTarget.name} onChange={v=>setET(t=>({...t,name:v}))} />
          <div style={{marginBottom:14}}>
            <label style={{display:"block",fontSize:"0.72rem",fontWeight:800,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Avatar</label>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {AVATAR_OPTIONS.map(a=>(
                <button key={a} onClick={()=>setET(t=>({...t,avatar:a}))}
                  style={{fontSize:"1.5rem",padding:6,borderRadius:10,border:`2.5px solid ${editTarget.avatar===a?"#4ECDC4":"transparent"}`,background:editTarget.avatar===a?"#EFF9FF":"transparent",transition:"all .15s"}}>
                  {a}
                </button>
              ))}
            </div>
          </div>
          <Field label="Emoji badge (shown in logs)" value={editTarget.emoji} onChange={v=>setET(t=>({...t,emoji:v}))} hint="Short identifier like ✨ or 🔥" />
          <div style={{marginBottom:14}}>
            <label style={{display:"block",fontSize:"0.72rem",fontWeight:800,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Color</label>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {COLOR_PALETTE.map(c=>(
                <button key={c} onClick={()=>setET(t=>({...t,color:c}))}
                  style={{width:30,height:30,borderRadius:"50%",background:"#"+c,border:`3px solid ${editTarget.color===c?"#1A1F3C":"transparent"}`,transform:editTarget.color===c?"scale(1.2)":"",transition:"all .15s"}}/>
              ))}
            </div>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            {editTarget.id&&s.kids.length>1&&(
              <button onClick={()=>{const ns=structuredClone(s);ns.kids=ns.kids.filter(k=>k.id!==editTarget.id);save(ns);setModal(null);}}
                style={{padding:"9px 14px",borderRadius:11,border:"none",background:"#FCA5A5",color:"#fff",fontWeight:800}}>Remove</button>
            )}
            <button onClick={saveKid} style={{padding:"9px 18px",borderRadius:11,border:"none",background:navy,color:"#fff",fontFamily:fontH,fontSize:"0.95rem"}}>Save</button>
          </div>
        </Modal>
      )}

      {/* Appearance Modal */}
      {modal==="appearance"&&editTarget&&(
        <Modal title="🎨 Appearance Settings" onClose={()=>setModal(null)}>
          <div style={{fontSize:"0.8rem",color:"#6B7280",fontWeight:600,marginBottom:16,padding:"8px 12px",background:"#F0FDF4",borderRadius:10}}>✅ Changes apply instantly — no rebuild needed</div>

          <div style={{marginBottom:14}}>
            <label style={{display:"block",fontSize:"0.72rem",fontWeight:800,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Background Color</label>
            <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              {["FFF9EE","F0FDF4","EFF6FF","F5F3FF","FFF1F2","F8FAFC"].map(c=>(
                <button key={c} onClick={()=>setET(t=>({...t,bgColor:c}))}
                  style={{width:32,height:32,borderRadius:8,background:"#"+c,border:`3px solid ${editTarget.bgColor===c?"#1A1F3C":"#E5E7EB"}`,transform:editTarget.bgColor===c?"scale(1.15)":"",transition:"all .15s"}}/>
              ))}
              <input type="color" value={"#"+editTarget.bgColor} onChange={e=>setET(t=>({...t,bgColor:e.target.value.replace("#","")}))}
                style={{width:32,height:32,borderRadius:8,border:"2px solid #E5E7EB",cursor:"pointer",padding:0}} title="Pick any color"/>
            </div>
          </div>

          <div style={{marginBottom:14}}>
            <label style={{display:"block",fontSize:"0.72rem",fontWeight:800,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Header Color</label>
            <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              {["1A1F3C","1E3A5F","1A3C2B","3D1A3C","2D2D2D","0F172A"].map(c=>(
                <button key={c} onClick={()=>setET(t=>({...t,headerColor:c}))}
                  style={{width:32,height:32,borderRadius:8,background:"#"+c,border:`3px solid ${editTarget.headerColor===c?"#F4A614":"transparent"}`,transform:editTarget.headerColor===c?"scale(1.15)":"",transition:"all .15s"}}/>
              ))}
              <input type="color" value={"#"+editTarget.headerColor} onChange={e=>setET(t=>({...t,headerColor:e.target.value.replace("#","")}))}
                style={{width:32,height:32,borderRadius:8,border:"2px solid #E5E7EB",cursor:"pointer",padding:0}}/>
            </div>
          </div>

          <div style={{marginBottom:14}}>
            <label style={{display:"block",fontSize:"0.72rem",fontWeight:800,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Accent Color (gold highlights)</label>
            <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              {["F4A614","22C55E","4ECDC4","A78BFA","FF6B6B","F472B6"].map(c=>(
                <button key={c} onClick={()=>setET(t=>({...t,accentColor:c}))}
                  style={{width:32,height:32,borderRadius:8,background:"#"+c,border:`3px solid ${editTarget.accentColor===c?"#1A1F3C":"transparent"}`,transform:editTarget.accentColor===c?"scale(1.15)":"",transition:"all .15s"}}/>
              ))}
              <input type="color" value={"#"+editTarget.accentColor} onChange={e=>setET(t=>({...t,accentColor:e.target.value.replace("#","")}))}
                style={{width:32,height:32,borderRadius:8,border:"2px solid #E5E7EB",cursor:"pointer",padding:0}}/>
            </div>
          </div>

          <div style={{marginBottom:14}}>
            <label style={{display:"block",fontSize:"0.72rem",fontWeight:800,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Card Style</label>
            <div style={{display:"flex",gap:7}}>
              {[["rounded","Rounded"],["sharp","Sharp"],["bubbly","Bubbly"]].map(([k,v])=>(
                <button key={k} onClick={()=>setET(t=>({...t,cardStyle:k}))}
                  style={{flex:1,padding:"8px",borderRadius:CARD_RADII[k],border:`2px solid ${editTarget.cardStyle===k?"#4ECDC4":"#E5E7EB"}`,background:editTarget.cardStyle===k?"#EFF9FF":"#fff",fontWeight:700,fontSize:"0.82rem",color:navy}}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div style={{marginBottom:20}}>
            <label style={{display:"block",fontSize:"0.72rem",fontWeight:800,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Title Font</label>
            <div style={{display:"flex",gap:7}}>
              {[["fredoka","Fredoka ★"],["bold","Classic"],["fun","Fun"]].map(([k,v])=>(
                <button key={k} onClick={()=>setET(t=>({...t,fontStyle:k}))}
                  style={{flex:1,padding:"8px",borderRadius:10,border:`2px solid ${editTarget.fontStyle===k?"#4ECDC4":"#E5E7EB"}`,background:editTarget.fontStyle===k?"#EFF9FF":"#fff",fontWeight:700,fontSize:"0.82rem",color:navy,fontFamily:k==="fredoka"?"Fredoka One,cursive":k==="fun"?"Comic Sans MS,cursive":"Georgia,serif"}}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          <button onClick={saveAppearance} style={{width:"100%",padding:"11px",borderRadius:12,border:"none",background:navy,color:"#fff",fontFamily:fontH,fontSize:"1rem"}}>
            ✅ Apply
          </button>
        </Modal>
      )}

      {/* Audio Modal */}
      {modal==="audioSettings"&&editTarget&&(
        <Modal title="🔊 Audio & Effects" onClose={()=>setModal(null)}>
          <div style={{fontSize:"0.8rem",color:"#6B7280",fontWeight:600,marginBottom:16,padding:"8px 12px",background:"#F0FDF4",borderRadius:10}}>✅ Changes apply instantly — no rebuild needed</div>

          <div style={{marginBottom:14}}>
            <label style={{display:"block",fontSize:"0.72rem",fontWeight:800,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Sound</label>
            <div style={{display:"flex",gap:8}}>
              {[[true,"🔊 On"],[false,"🔇 Off"]].map(([v,label])=>(
                <button key={String(v)} onClick={()=>setET(t=>({...t,enabled:v}))}
                  style={{flex:1,padding:"9px",borderRadius:11,border:`2px solid ${editTarget.enabled===v?"#4ECDC4":"#E5E7EB"}`,background:editTarget.enabled===v?"#EFF9FF":"#fff",fontWeight:800,fontSize:"0.88rem",color:navy}}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{marginBottom:14}}>
            <label style={{display:"block",fontSize:"0.72rem",fontWeight:800,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Volume — {Math.round(editTarget.volume*100)}%</label>
            <input type="range" min={0.1} max={1} step={0.05} value={editTarget.volume} onChange={e=>setET(t=>({...t,volume:Number(e.target.value)}))}
              style={{width:"100%",accentColor:"#4ECDC4"}}/>
          </div>

          <div style={{marginBottom:14}}>
            <label style={{display:"block",fontSize:"0.72rem",fontWeight:800,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Coin Earn Sound</label>
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
              {COIN_SOUNDS.map(sound=>(
                <button key={sound} onClick={()=>setET(t=>({...t,coinSound:sound}))}
                  style={{padding:"6px 12px",borderRadius:10,border:`2px solid ${editTarget.coinSound===sound?"#4ECDC4":"#E5E7EB"}`,background:editTarget.coinSound===sound?"#EFF9FF":"#fff",fontWeight:700,fontSize:"0.8rem",color:navy,textTransform:"capitalize"}}>
                  {sound}
                </button>
              ))}
            </div>
          </div>

          <div style={{marginBottom:20}}>
            <label style={{display:"block",fontSize:"0.72rem",fontWeight:800,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Coin Burst Animation</label>
            <div style={{display:"flex",gap:8}}>
              {[[true,"🪙 On"],[false,"Off"]].map(([v,label])=>(
                <button key={String(v)} onClick={()=>setET(t=>({...t,burstEffect:v}))}
                  style={{flex:1,padding:"9px",borderRadius:11,border:`2px solid ${editTarget.burstEffect===v?"#4ECDC4":"#E5E7EB"}`,background:editTarget.burstEffect===v?"#EFF9FF":"#fff",fontWeight:800,fontSize:"0.88rem",color:navy}}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={saveAudio} style={{width:"100%",padding:"11px",borderRadius:12,border:"none",background:navy,color:"#fff",fontFamily:fontH,fontSize:"1rem"}}>
            ✅ Apply
          </button>
        </Modal>
      )}

      {toast&&<Toast msg={toast}/>}
      {bursts.map(b=><CoinBurst key={b.id} x={b.x} y={b.y} onDone={()=>setBursts(p=>p.filter(i=>i.id!==b.id))}/>)}
    </div>
  );
}
