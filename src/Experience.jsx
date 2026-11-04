import { useState } from 'react';

// Original career copy from Yinpeng's published portfolio, accessed 2026-10-09.
const experience = [
  {
    period: '2023.07 — 2025.05', role: '资深 UI 设计师 / 设计 Leader', company: '青岛尚美数智科技集团有限公司', industry: '酒店 · 数智科技',
    groups: [
      { title: '核心职责', items: [
        '完成从用户需求分析、原型设计到视觉设计、交互优化的全流程工作，把控设计质量，确保设计方案落地效果达到预期。',
        '深入研究电商行业用户行为与设计趋势，结合公司业务目标，提出创新性的设计理念与方案，提升产品的用户吸引力和转化率。',
        '与产品、开发、运营等跨部门团队紧密协作，推动设计方案的实施，解决设计过程中出现的问题，确保项目顺利推进。',
      ] },
      { title: '主要负责项目', items: [
        '负责 B 端 / 店长端 PMS、CRS 的 UI 设计、功能梳理与产出。',
        '负责移动端超级系列、酒店后台综合平台的设计。',
        '负责心里美 App 的部分 C 端 UI 设计。',
        '负责酒店智能化大屏、自助机等终端的 UI 设计。',
      ] },
    ],
  },
  {
    period: '2021.08 — 2023.04', role: '资深 UI 设计师', company: '上海沪江教育', industry: '在线教育',
    groups: [{ title: '工作内容', items: [
      '负责移动端产品 CCtalk 的功能设计、更新迭代与产品视觉排版优化。',
      '负责 CCtalk 网师后台功能完善、三合一页面设计，并针对产品经理提出的需求进行线上落地。',
      '负责新产品绯凡的整体 UI 产出、视觉规范等。',
      '负责运营部门提出的节假日首页氛围设计及用户营销类小部件设计。',
    ] }],
  },
  {
    period: '2019.07 — 2021.08', role: '运营设计师', company: '北京持柔科技有限公司', industry: '科技 · 运营设计',
    groups: [{ title: '工作内容', items: [
      '负责校园代理业务的活动设计：海报、落地页、详情页，以及领袖家长团公众号的物料设计。',
      '负责电商渠道设计：京东、淘宝的宝贝头图、详情页与海报。',
      '负责 BD 渠道的海报、详情页、Banner 等。',
      '负责新媒体课包及 AB 测试相关设计。',
    ] }],
  },
];

export function Experience() {
  const [open, setOpen] = useState(null);
  return <section className="experience" id="experience" aria-labelledby="experience-title">
    <div className="experience-heading reveal-text"><span className="experience-eyebrow">2019 — 2025 / CAREER</span><h2 id="experience-title">WORK EXPERIENCE<span>工作履历</span></h2><span className="experience-hint">CLICK TO EXPLORE ↘</span></div>
    <div className="experience-stats reveal-text">
      {[
        ['07', '+', 'YEARS OF EXPERIENCE', '年设计经验'],
        ['03', '', 'INDUSTRIES IN DEPTH', '行业经验'],
        ['100w', '', 'TEAM REVENUE APPROACHING', '团队营收规模'],
        ['∞', '', 'CURIOSITY FOR DESIGN', '持续探索设计'],
      ].map(([value, suffix, label, chinese]) => <div key={label}><strong>{value}<sup>{suffix}</sup></strong><span>{label}<small>{chinese}</small></span></div>)}
    </div>
    <div className="experience-list">
      {experience.map((job, index) => <article key={job.company} className={`experience-job${open === index ? ' is-open' : ''}`}>
        <h3><button id={`career-button-${index}`} className="experience-toggle" aria-expanded={open === index} aria-controls={`career-details-${index}`} onClick={() => setOpen(open === index ? null : index)}>
          <span className="experience-period">{job.period}</span><span className="experience-role">{job.role}</span><span className="experience-company">{job.company}</span><span className="experience-plus" aria-hidden="true" />
        </button></h3>
        <div className="experience-expansion" inert={open !== index} aria-hidden={open !== index}>
          <div className="experience-overflow"><div className="experience-details" id={`career-details-${index}`} role="region" aria-labelledby={`career-button-${index}`}>
            <div className="experience-industry"><span>INDUSTRY / 行业</span><p>{job.industry}</p><span className="experience-index">0{index + 1}</span></div>
            <div className="experience-content">{job.groups.map(group => <div key={group.title}><h4>{group.title}</h4><ul>{group.items.map(item => <li key={item}>{item}</li>)}</ul></div>)}</div>
          </div></div>
        </div>
      </article>)}
    </div>
  </section>;
}
