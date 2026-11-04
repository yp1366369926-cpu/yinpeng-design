import {caseStudies} from './case-studies.js';

const project = slug => ({
  name: caseStudies[slug].name,
  imageUrl: caseStudies[slug].imageUrl,
  category: caseStudies[slug].category,
  href: '#/work/' + slug,
  detailPage: true,
});

export const works = [
  project('xinlimei'),
  {
  "name": "小云智能体",
  "imageUrl": "/work/xiaoyun-cover.png",
  "href": "#/work/xiaoyun-ip",
  "detailPage": true,
  "year": "2026",
  "gridClass": "col-span-12 lg:col-start-1 lg:col-span-6 xl:col-span-5",
  "type": "post",
  "codingProject": false
},
  project('cctalk'),
  project('migu'),
  project('web3'),
  project('material-pulse'),
  project('unbounded-vision'),
  project('light-matrix'),
];
