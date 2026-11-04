import {useEffect,useRef,useState} from 'react';
import {ipChapters} from './xiaoyun-ip-data.js';
import './xiaoyun-ip.css';

export function XiaoyunIP(){
  const page=useRef(null);
  const [active,setActive]=useState(0);
  useEffect(()=>{
    const previousTitle=document.title;
    document.title='小云 IP 设计 — YINPENG.DESIGN';
    window.scrollTo(0,0);
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(entry.isIntersecting){entry.target.classList.add('ip-visible');setActive(Number(entry.target.dataset.index));}
      }
    },{rootMargin:'-10% 0px -45% 0px',threshold:0});
    page.current.querySelectorAll('.ip-chapter').forEach(n=>observer.observe(n));
    return()=>{observer.disconnect();document.title=previousTitle;};
  },[]);
  function go(index){document.getElementById(ipChapters[index].slug)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
  return <div className="ip-project" ref={page}>
    <header className="ip-header"><a href="#selected-work" className="ip-brand">YINPENG.DESIGN</a><span className="ip-project-label">XIAOYUN / IP DESIGN</span><a href="#selected-work" className="ip-back">← 返回作品集</a></header>
    <nav className="ip-navigation" aria-label="项目章节"><span>{String(active+1).padStart(2,'0')} / {ipChapters.length}</span><label><span className="ip-sr-only">选择章节</span><select value={active} onChange={e=>go(Number(e.target.value))}>{ipChapters.map((s,i)=><option key={s.id} value={i}>{s.name.split(' / ')[1]||s.name}</option>)}</select></label><button onClick={()=>window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}>↑ 顶部</button></nav>
    <main className="ip-case-study" aria-label="小云 IP 设计完整作品展示">
      {ipChapters.map((section,i)=><section key={section.id} id={section.slug} className={`ip-chapter ${i===0?'ip-kv ip-visible':''}`} data-index={i} aria-label={section.name} style={{'--section-padding':`${(section.padding||0)/16}cqw`,'--section-gap':`${(section.gap||0)/16}cqw`}}>
        {section.children.map((node,j)=>{
          if(node.type!=='TEXT')return <figure className="ip-artwork" key={node.id} style={{aspectRatio:`${node.width}/${node.height}`}}><img src={node.image} alt={section.name.split(' / ')[1]||section.name} width={Math.round(node.width)} height={Math.round(node.height)} loading={i===0?'eager':'lazy'} fetchPriority={i===0?'high':'auto'} decoding="async"/></figure>;
          const Tag=node.size>=52?'h2':'p';
          return <Tag key={node.id} style={{fontSize:`clamp(${node.size>=52?26:node.size<=21?12:15}px, ${node.size/16}cqw, ${node.size}px)`,color:node.color,textAlign:node.align.toLowerCase(),fontWeight:node.size>=52||node.id==='35:8'?700:400}}>{node.text}</Tag>;
        })}
      </section>)}
    </main>
    <footer className="ip-footer"><span>小云 · 让连接更简单</span><a href="#selected-work">返回作品集 ↗</a></footer>
  </div>;
}
