import './portfolio.css';
import './chapters.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Portfolio,PointerTrail } from './Portfolio.jsx';
import { createHeroScene } from './hero-scene.js';
import { LoadingScreen } from './LoadingScreen.jsx';

// Replace these fields when the owner's personal information is available.
const profile={brand:'YINPENG.DESIGN',name:'Yinpeng',intro:"I'm Yinpeng, a UX designer with 7 years of experience, working on large-scale consumer and business projects. Outside work, I focus on AI design and exploration."};

export function App({skipIntro = false}){
  const stage=useRef(null),scene=useRef(null),audio=useRef(null),coordinates=useRef(null),pointerFrame=useRef(0),lastPointer=useRef(null);
  const [ready,setReady]=useState(false),[error,setError]=useState(false),[dark,setDark]=useState(false),[sound,setSound]=useState(false),[menu,setMenu]=useState(false),[time,setTime]=useState(''),[selected,setSelected]=useState(null);
  const [loadProgress,setLoadProgress]=useState(0),[entered,setEntered]=useState(skipIntro);
  const dialog=useRef(null);
  const waitForReveal=useRef(!skipIntro);
  const revealScene=useCallback(()=>scene.current?.reveal(),[]);
  const completeIntro=useCallback(()=>setEntered(true),[]);
  function updatePointer(e){lastPointer.current={x:e.clientX,y:e.clientY};if(pointerFrame.current)return;pointerFrame.current=requestAnimationFrame(()=>{pointerFrame.current=0;const p=lastPointer.current;if(coordinates.current)coordinates.current.textContent=`${String(Math.round(p.x)).padStart(4,'0')} X ${String(Math.round(p.y)).padStart(4,'0')} Y`;});}
  useEffect(()=>()=>cancelAnimationFrame(pointerFrame.current),[]);
  useEffect(()=>{if(selected)dialog.current?.showModal();else if(dialog.current?.open)dialog.current.close();},[selected]);
  useEffect(()=>{if(!ready&&!error)return;const observer=new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle('revealed',e.isIntersecting)),{threshold:.12});document.querySelectorAll('.reveal-text').forEach(e=>observer.observe(e));return()=>observer.disconnect();},[ready,error]);
  function go(id){document.getElementById(id)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});setMenu(false);}
  useEffect(()=>{let cancelled=false;const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;createHeroScene(stage.current,{reducedMotion,waitForReveal:waitForReveal.current,onProgress:value=>{if(!cancelled)setLoadProgress(value);},onReady:()=>{if(!cancelled)setReady(true);},onError:e=>{console.error(e);if(!cancelled)setError(true);}}).then(s=>{if(cancelled)s?.dispose();else scene.current=s;}).catch(e=>{console.error(e);if(!cancelled)setError(true);});return()=>{cancelled=true;scene.current?.dispose();};},[]);
  useEffect(()=>{const update=()=>setTime(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date()));update();const id=setInterval(update,10000);return()=>clearInterval(id);},[]);
  function theme(){const value=!dark;setDark(value);scene.current?.setTheme(value);}
  async function toggleSound(){if(!audio.current){audio.current=new Audio('./assets/bgm.mp3');audio.current.loop=true;audio.current.volume=.22;}if(sound){audio.current.pause();setSound(false);}else{try{await audio.current.play();setSound(true);}catch{setSound(false);}}}
  useEffect(()=>()=>audio.current?.pause(),[]);
  return <main className={`page ${dark?'dark':''} ${ready||error?'is-ready':''} ${error?'scene-fallback':''} ${entered||error?'':'is-entering'}`} onPointerMove={updatePointer}>
    <div ref={stage} className="scene" role="img" aria-label="Interactive blue glass hello lettering, floating stickers and a three-dimensional cursor arrow" />
    <div className="grid" aria-hidden="true">{[0,1,2,3].map(x=><div key={x} className="grid-line" style={{left:`${x*100/3}%`}}>{[1,2].map(y=><span key={y} style={{top:y===2?'calc(66.6667% + 12px)':'33.3333%'}} />)}</div>)}<div className="horizontal h-one"/><div className="horizontal h-two"/></div>
    <header><a className="brand" href="#" onClick={e=>{e.preventDefault();go('home');}}>{profile.brand}</a><nav aria-label="Page controls"><button onClick={()=>go('selected-work')}>WORK</button><button onClick={()=>go('contact')}>CONTACT</button><button onClick={theme} aria-label={`Theme: ${dark?'dark':'light'}`}>THEME[{dark?'D':'A'}]</button><button onClick={toggleSound} aria-pressed={sound}>SOUND[{sound?'|':'-'}]</button></nav><button className="mobile-menu" aria-label="Open display controls" aria-expanded={menu} onClick={()=>setMenu(!menu)}><span/><span/></button></header>
    {menu&&<div className="menu"><button onClick={()=>go('selected-work')}>WORK</button><button onClick={()=>go('contact')}>CONTACT</button><button onClick={theme}>THEME[{dark?'D':'A'}]</button><button onClick={toggleSound}>SOUND[{sound?'|':'-'}]</button><button onClick={()=>{scene.current?.burst();setMenu(false);}}>PLAY</button></div>}
    <section className="hero" id="home" aria-label="Introduction"><div className="content"><div className="top-copy"><p className="discipline">Design &amp;<br/>Engineering</p><p className="principle">Thinking in<br/>systems. Designing<br/>with care.</p><p className="intro">{profile.intro}</p></div><h1><span>UX DESIGNER</span><span>PERSONAL SITE</span></h1></div></section>
    <Portfolio onSelect={work=>{if(work.detailPage){sessionStorage.setItem('portfolio-return-scroll',String(window.scrollY));window.location.hash=work.href;}else if(work.external){window.open(work.href,'_blank','noopener,noreferrer');}else{setSelected(work);}}}/><PointerTrail ready={ready}/>
    <dialog ref={dialog} className="work-dialog" onCancel={()=>setSelected(null)} onClick={e=>{if(e.target===dialog.current)setSelected(null);}}>{selected&&<><button className="close-work" onClick={()=>setSelected(null)} autoFocus aria-label="Close work preview">CLOSE [×]</button><img src={'./assets'+selected.imageUrl} alt={selected.name}/><div><strong>{selected.name}</strong><span>{selected.year}</span></div><p>原站作品占位 · 后续替换为你的作品与项目介绍</p></>}</dialog>
    <footer><span className="clock-display"><span className="desktop-meta">GMT+8 CN </span>{time}</span><span className="copyright">YINPENG (C) 2026</span><button ref={coordinates} className="coordinates" onClick={()=>scene.current?.burst()} aria-label="Release floating stickers">0640 X 0360 Y</button><button className="replay" onClick={()=>innerWidth<1024?go('home'):scene.current?.burst()} aria-label="Return to top or animate stickers"><picture><source media="(max-width:1023px)" srcSet="./assets/progress.svg"/><img src="./assets/globe.svg" alt=""/></picture></button></footer>
    {!entered&&!error&&<LoadingScreen ready={ready} progress={loadProgress} error={error} onReveal={revealScene} onComplete={completeIntro}/>}

  </main>;
}
