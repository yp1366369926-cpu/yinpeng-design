import {useEffect,useRef,useState} from 'react';
import {loadingProgress} from './loading-progress.js';
import './loading-screen.css';
import GradientASCII from './GradientASCII';

export function LoadingScreen({ready,progress,error,onComplete}){
  const [value,setValue]=useState(0),[phase,setPhase]=useState('loading');
  const inputs=useRef({ready,progress});inputs.current={ready,progress};
  const reduced=useRef(matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(()=>{
    const previous=document.body.style.overflow;
    document.body.style.overflow='hidden';
    return()=>{document.body.style.overflow=previous;};
  },[]);
  useEffect(()=>{
    let frame;const start=performance.now();let shown=0;
    const tick=now=>{
      const input=inputs.current;
      const target=loadingProgress(now-start,input.progress,input.ready,reduced.current);
      shown=reduced.current?target:shown+(target-shown)*.16;
      if(target===100&&shown>99.8){setValue(100);setPhase('complete');return;}
      setValue(shown);frame=requestAnimationFrame(tick);
    };
    frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
  },[]);
  useEffect(()=>{
    if(phase!=='complete')return;
    const timer=setTimeout(()=>setPhase('revealing'),reduced.current?0:200);
    return()=>clearTimeout(timer);
  },[phase]);
  useEffect(()=>{
    if(phase!=='revealing')return;
    const timer=setTimeout(onComplete,reduced.current?0:1450);
    return()=>clearTimeout(timer);
  },[phase,onComplete]);
  return <div className={`loading-screen is-${phase}${error?' has-error':''}`}>
    <div className="loading-veil" aria-hidden="true"/>
    <div className="loading-panel" aria-hidden="true"/>
    {error?<div className="loading-message" role="alert">3D 场景暂时无法加载，请刷新页面重试。</div>:
    <div className="loading-indicator" role="progressbar" aria-label="网站加载进度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.floor(value)}>
      <div className="loading-ascii" aria-hidden="true" style={{clipPath:`inset(${100-value}% 0 0 0)`}}>
        <GradientASCII
          colors={['#1e3fd8', '#f6f8ff', '#a5d8ff', '#38bdf8']}
          shape="horizon"
          characters=" =+xX0S8#@"
          cellSize={18}
          density={0.8}
        />
      </div>
      <span className="loading-percent" aria-hidden="true">{String(Math.floor(value)).padStart(3,'0')}<span>%</span></span>
    </div>}
  </div>;
}
