import React, {useEffect, useRef, useState} from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import { XiaoyunIP } from "./XiaoyunIP.jsx";
import { CaseStudy } from "./CaseStudy.jsx";
import { caseStudies } from "./case-studies.js";
import "./styles.css";

function SiteRouter(){
  const [hash,setHash]=useState(window.location.hash);
  useEffect(()=>{const update=()=>setHash(window.location.hash);window.addEventListener('hashchange',update);return()=>window.removeEventListener('hashchange',update);},[]);
  const slug = hash.startsWith('#/work/') ? hash.slice(7) : '';
  const study = Object.hasOwn(caseStudies, slug) ? caseStudies[slug] : null;
  const project = slug === 'xiaoyun-ip' || Boolean(study);
  const visitedProject = useRef(project);
  useEffect(()=>{
    if(project){
      visitedProject.current = true;
      return;
    }
    const saved=sessionStorage.getItem('portfolio-return-scroll');
    if(hash==='#selected-work' || (visitedProject.current && saved !== null)){
      const timer=setTimeout(()=>{if(saved){window.scrollTo(0,Number(saved));sessionStorage.removeItem('portfolio-return-scroll');}else document.getElementById('selected-work')?.scrollIntoView();},150);
      return()=>clearTimeout(timer);
    }
  },[hash,project]);
  if (slug === 'xiaoyun-ip') return <XiaoyunIP/>;
  if (study) return <CaseStudy key={slug} study={study} slug={slug}/>;
  return <App skipIntro={visitedProject.current || hash === '#selected-work'}/>;
}
createRoot(document.getElementById("root")).render(<React.StrictMode><SiteRouter/></React.StrictMode>);
