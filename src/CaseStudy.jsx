import {useEffect} from 'react';
import './case-study.css';

const asset = path => './assets' + path;

export function CaseStudy({study, slug}) {
  useEffect(() => {
    const previous = document.title;
    document.title = study.name + ' — YINPENG.DESIGN';
    window.scrollTo(0, 0);
    return () => { document.title = previous; };
  }, [study]);

  return (
    <main className={slug === "migu" ? "case-study case-study-migu" : "case-study"}>
      <header className="case-header">
        <a className="case-brand" href="#selected-work">YINPENG.DESIGN</a>
        <a href="#selected-work">← 返回作品</a>
      </header>
      <div className="case-body">
        <div className="case-intro">
          <span className="case-kicker">SELECTED WORK / {study.category}</span>
          <h1>{study.name}</h1>
          <p>{study.description}</p>
          {study.website && (
            <a className="case-external" href={study.website} target="_blank" rel="noreferrer">
              访问独立站 ↗
            </a>
          )}
        </div>
        {study.video ? (
          <video className="case-video" src={asset(study.video)} poster={asset(study.imageUrl)}
            controls playsInline preload="metadata" aria-label={study.name}/>
        ) : (
          <img className="case-cover" src={asset(study.imageUrl)} alt={study.name + '封面'}/>
        )}
        {study.sections.map((section, index) => (
          <section className="case-section" key={section.title}>
            <span className="case-kicker">{String(index + 1).padStart(2, '0')} / CASE STUDY</span>
            <h2>{section.title}</h2>
            <div className={`case-gallery ${section.layout}`}>
              {section.images.map((path, imageIndex) => (
                <img key={path} src={asset(path)} loading="lazy" decoding="async"
                  alt={`${section.title} · ${imageIndex + 1}`}/>
              ))}
            </div>
          </section>
        ))}
        <a className="case-return" href="#selected-work">← 返回作品</a>
      </div>
    </main>
  );
}
