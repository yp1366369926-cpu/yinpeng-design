import { useEffect, useRef } from 'react';
import { works } from './portfolio-data.js';
import { Experience } from './Experience.jsx';

function MotionText({text}) {
 let seed=0x811c9dc5;for(const c of text)seed=Math.imul(seed^c.charCodeAt(0),0x1000193);
 const chars=Array.from(text),delays=chars.map((_,i)=>{let v=seed+=0x6d2b79f5;v=Math.imul(v^v>>>15,1|v);v^=v+Math.imul(v^v>>>7,61|v);const r=((v^v>>>14)>>>0)/4294967296;return Math.min(290,i/Math.max(1,chars.length-1)*290*.7+r*290*.35);});
 return <span aria-label={text}>{chars.map((c,i)=><span key={i} className="motion-letter" aria-hidden="true" style={{'--letter-delay':`${delays[i]}ms`}}>{c===' '?'\u00a0':c}</span>)}</span>;
}

const desktopGroups=[[0],[1,2],[3,4],[5,6,7]];

const skills=['Figma','Photoshop','Illustrator','Codex','Claude Code','即时设计','Sketch'];

export function Portfolio({onSelect}) {
 const groups=desktopGroups;
 return <>
  <section className="about" id="about" aria-label="About Yinpeng">
   <div className="portrait personal-card">
    <div className="portrait-photo paper-target" data-image="./assets/img/yinpeng-full.png" style={{'--fallback-image': 'url("./assets/img/yinpeng-full.png")'}} role="img" aria-label="Yinpeng portrait"/>
    <img className="signature" src="./assets/yinpeng-sign.svg" alt=""/>
    <div className="portrait-details">
     <div className="portrait-name"><strong>殷鹏</strong><span><img className="verified-badge" src="./assets/verified-badge.svg" alt=""/> 花瓣认证UI设计师</span></div>
     <p className="portrait-role">UI/UX设计师 · 7年工作经验 · 专业科班</p>
     <div className="portrait-facts"><div><strong>20,000+</strong><span>原创作品采集数</span></div><dl><dt>学校</dt><dd>首都师范大学｜视觉传达与艺术</dd><dt>电话/微信</dt><dd>17601241637 / Eric-destiny</dd><dt>邮箱</dt><dd><a href="mailto:yp1366369926@gmail.com">yp1366369926@gmail.com</a></dd></dl></div>
     <div className="skill-marquee" aria-label="Tools: Figma, Photoshop, Illustrator, Codex, Claude Code, 即时设计, Sketch"><span className="tools-label">TOOLS</span><div className="skill-window"><div className="skill-track">{[0,1].map(copy=><div className="skill-group" key={copy} aria-hidden={copy===1}>{skills.map((name,i)=><span className="skill-pill" key={name}><i className={`tool-icon tool-${i}`}>{['Fi','Ps','Ai','Cx','Cc','即','Sk'][i]}</i>{name}</span>)}</div>)}</div></div></div>
    </div>
   </div>
   <div className="about-copy"><p className="reveal-text">I explore how to combine design tools with AI to improve efficiency, while learning emerging design styles and digital trends to build the next generation of consumer and business products.</p><p className="muted reveal-text">From 2019 to 2026, I worked at three companies across education, hospitality, and technology.</p></div>
  </section>
  <Experience />
  <section id="selected-work" className="works" aria-label="Selected work">
   {groups.map((group,page)=><div className={`work-screen work-screen-${page}`} key={group.join('-')}><span className="work-chapter-label">SELECTED WORK / {String(page+1).padStart(2,'0')} — {String(groups.length).padStart(2,'0')}</span>{group.map(i=>{const w=works[i];return <article key={w.name} className={`work work-${i}`}><button className="work-link" onClick={()=>onSelect(w)} aria-label={`${w.name} - ${w.year||w.category}`}><div className="cover paper-target" data-image={'./assets'+w.imageUrl} data-hover={w.hoverImageUrl?'./assets'+w.hoverImageUrl:undefined} style={{'--fallback-image': 'url("./assets'+w.imageUrl+'")',aspectRatio:i===5?'1064/1496':i>=6?'1':i>=3?'1440/936':'1332/750'}}>{w.codingProject&&<span className="coding">Coding Project</span>}</div><div className="work-caption"><span>{w.name}</span><span>{w.year||w.category}{w.type==='tools'||w.type==='event'?` ${w.type} ↗`:''}</span></div></button></article>;})}</div>)}
  </section>
  <section className="tunnel" id="purpose" aria-label="Design philosophy">{[0,2,4,6].map(i=><div key={i} className="tunnel-stop" style={{top:`${i*100}svh`}} aria-hidden="true"/>)}<div className="tunnel-sticky"><h2 className="purpose-title"><MotionText text="INNOVATE"/><br/><MotionText text="WITH"/><br/><MotionText text="PURPOSE"/></h2><h2 className="human-title"><MotionText text="INNOVATE"/><br/><MotionText text="WITH A"/><br/><MotionText text="HUMAN TOUCH"/></h2><h2 className="future-title"><MotionText text="FUTURE-FIRST"/><br/><MotionText text="ALWAYS"/></h2><div className="values"><svg className="tunnel-rings" viewBox="0 0 344 344" aria-hidden="true"><defs><clipPath id="ring-clip"><path d="M20 22H324V322H20Z"/></clipPath></defs><g clipPath="url(#ring-clip)">{Array.from({length:7},(_,i)=><ellipse key={i} cx="172" cy="172" rx="0" ry="0" fill="none" stroke="#C0FE04" strokeWidth="2" vectorEffect="non-scaling-stroke"/>)}</g></svg><p><MotionText text="Building tomorrow’s"/><br/><MotionText text="digital products."/></p><p><MotionText text="Independent by"/><br/><MotionText text="design & engineering."/></p><p><MotionText text="Clarity first."/><br/><MotionText text="Delight second."/></p><p><MotionText text="Ship in small loops."/><br/><MotionText text="Aim for long arcs."/></p></div></div></section>
  <section id="contact" className="contact"><h2 className="reveal-text"><span>LET'S <i>CREATE</i></span><span>SOMETHING</span><span className="indent">EXTRAORDINARY</span></h2><div className="contact-links"><a href="mailto:17600043819@163.com">17600043819@163.com</a><div><a href="https://www.figma.com/design/1lVI4MkkqwQLs94oa63V8n/%E4%B8%AA%E4%BA%BA%E4%BD%9C%E5%93%81?m=auto&t=EfF6cBE50NVkIsIT-1" target="_blank" rel="noreferrer">FIGMA</a></div></div></section>
 </>;
}

export function PointerTrail({ready}){
 const canvas=useRef(null);
 useEffect(()=>{
  if(!ready||matchMedia('(prefers-reduced-motion: reduce)').matches||matchMedia('(pointer: coarse)').matches)return;
  const c=canvas.current,ctx=c.getContext('2d');let raf,last=0,points=[],pos=null;
  const resize=()=>{const d=Math.min(devicePixelRatio,2);c.width=innerWidth*d;c.height=innerHeight*d;ctx.setTransform(d,0,0,d,0,0);};
  const move=e=>{pos={x:e.clientX,y:e.clientY};const t=performance.now();if(t-last>20){points.push({...pos,t});last=t;}};
  const leave=()=>{pos=null};resize();window.addEventListener('resize',resize);window.addEventListener('pointermove',move);document.addEventListener('pointerleave',leave);
  function frame(t){ctx.clearRect(0,0,innerWidth,innerHeight);points=points.filter(p=>t-p.t<650);if(scrollY>innerHeight*.7){points.forEach((p,i)=>{ctx.globalAlpha=(1-(t-p.t)/650)*.7;ctx.fillStyle='#c9ff3c';const size=2+i/points.length*5;ctx.fillRect(p.x-size/2,p.y-size/2,size,size);});if(pos){ctx.globalAlpha=.8;ctx.fillStyle='#c9ff3c';ctx.fillRect(pos.x-8,pos.y-8,16,16);}}ctx.globalAlpha=1;raf=requestAnimationFrame(frame);}raf=requestAnimationFrame(frame);
  return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize);window.removeEventListener('pointermove',move);document.removeEventListener('pointerleave',leave);};
 },[ready]);return <canvas ref={canvas} className="pointer-trail" aria-hidden="true"/>;
}
