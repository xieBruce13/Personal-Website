// Experimental case studies share the site's editorial layout and verified project evidence.
// The animated references and illustrative heatmaps are not presented as measured model outputs.
const copy = {
  en: {
    labels: {role:'Role',format:'Format',stage:'Stage',reference:'Reference',motion:'Motion study'},
    eye: {
      title:'Eye Tracking', headline:'What did they actually look at?',
      intro:'A browser-based experiment that turns estimated visual attention into evidence for reviewing design portfolios.',
      role:'Research & prototyping',format:'Browser tool · HCI',stage:'Working prototype',
      heat:'Illustrative attention animation. This is not recorded participant gaze.',
      interface:'Current browser prototype · document upload, webcam setup and reading workflow.',
      problemLabel:'01 / The question', problem:'A portfolio can look right and still communicate the wrong thing.',
      problemBody:'Designers choose what should stand out. Viewers decide—often unconsciously—what they actually see. The gap is hard to inspect with ordinary feedback.',
      buildLabel:'02 / The prototype', build:'From a document to a view of attention.',
      buildBody:'I built a browser-local workflow for loading a page, calibrating webcam-based gaze estimation, reading the document and reviewing page-specific heatmaps.',
      live:'Open the live prototype',private:'Camera access is optional and requested explicitly. The demo currently requires owner access.',
      flowLabel:'How it works',
      steps:[
        ['01','Upload','Open a PDF, DOCX or text document.'],
        ['02','Calibrate','Use 17 gaze targets and five held-out checks.'],
        ['03','Read','Estimate where attention lands while a page is visible.'],
        ['04','Review','Inspect per-page heatmaps and export the data.']
      ],
      decisionsLabel:'03 / Design decisions', decisions:'Attention is evidence, not an answer.',
      decisionsBody:'I separated gaze estimation from interpretation. A long fixation may signal interest, confusion or effort; it cannot tell us which without asking the viewer.',
      notes:[
        ['Check before measuring','A separate calibration check makes tracking quality visible before interpreting the heatmap.'],
        ['Keep the context','Page transitions and tab inactivity are excluded from viewing-time estimates.'],
        ['Protect the source','Camera frames and documents remain in browser memory rather than being uploaded to a server.']
      ],
      sample:'A separate heatmap study used to explore how attention might be visualized. The colors are illustrative.',
      nextLabel:'04 / Where it goes',next:'From seeing to redesigning.',
      nextBody:'The current prototype can collect and display gaze estimates. The next research cycle is to improve accuracy, pair gaze with explicit feedback, and test whether an editable AI layout revision helps the creator communicate more clearly.',
      built:'Built now',builtList:['Document viewing and camera calibration','Page-specific heatmaps, quality warnings and JSON export','Automated tests for the processing workflow'],
      later:'To validate next',laterList:['Tracking accuracy with real viewing conditions','Liked, confusing and missed areas as separate signals','AI-assisted layout revision and a before/after study'],
      repo:'View project source',repoNote:'Source repository is private; access depends on GitHub permissions.'
    }
  },
  zh: {
    labels: {role:'我的工作',format:'形式',stage:'阶段',reference:'参考图',motion:'动态研究'},
    eye: {
      title:'Eye Tracking',headline:'观众真正看到了什么？',
      intro:'一个基于浏览器的眼动研究原型，将估计的视觉注意力转化为作品集设计的观察证据。',
      role:'研究与原型开发',format:'浏览器工具 · 人机交互',stage:'已有可运行原型',
      heat:'示意性的注意力动态热图，并非真实参与者的眼动记录。',
      interface:'当前浏览器原型：文档上传、摄像头设置与阅读流程。',
      problemLabel:'01 / 研究问题',problem:'作品集看起来很好，不代表它传达了正确的信息。',
      problemBody:'创作者决定什么内容最重要，观众却有自己的观看路径。仅靠传统反馈，很难看清二者之间的差距。',
      buildLabel:'02 / 原型',build:'从一页作品，到可观察的注意力。',
      buildBody:'我开发了一套本地浏览器流程：加载文档、校准摄像头眼动估计、阅读页面，并查看对应的注意力热图。',
      live:'打开在线原型',private:'摄像头权限需要主动开启；当前演示仅对项目所有者开放。',
      flowLabel:'使用流程',
      steps:[
        ['01','上传文档','支持 PDF、DOCX 和文本文件。'],
        ['02','完成校准','17 个校准点及 5 个独立检验点。'],
        ['03','阅读页面','估计观众在页面上的注视位置。'],
        ['04','查看证据','按页查看热图并导出数据。']
      ],
      decisionsLabel:'03 / 设计决策',decisions:'注意力是证据，而不是结论。',
      decisionsBody:'我把眼动估计与行为解释分开处理。长时间注视可能意味着喜欢、困惑或费力理解，不能单凭注视时长判断。',
      notes:[
        ['先检验，再解释','独立的校准检验可以在分析热图前提示追踪质量。'],
        ['保留观看语境','翻页与切离标签页的时间不计入页面有效观看。'],
        ['保护原始数据','摄像头画面与文档保存在浏览器内存中，不上传服务器。']
      ],
      sample:'用于研究注意力可视化的示意热图，颜色并非实测数据。',
      nextLabel:'04 / 下一步',next:'从观察，到重新设计。',
      nextBody:'当前原型已经能够采集并展示眼动估计。接下来要提升追踪准确度，加入明确的主观反馈，并验证 AI 生成的可编辑版式能否更好地传达重点。',
      built:'已经实现',builtList:['文档阅读、摄像头校准','按页热图、质量提示与 JSON 导出','处理流程的自动化测试'],
      later:'下一步验证',laterList:['真实观看条件下的追踪准确度','分别采集喜欢、困惑与未看到的区域','AI 辅助重排与前后效果对比'],
      repo:'查看项目源码',repoNote:'源码仓库为私有，访问需具备 GitHub 权限。'
    }
  }
};

const meta=(c,labels)=>`<dl class="research-meta"><div><dt>${labels.role}</dt><dd>${c.role}</dd></div><div><dt>${labels.format}</dt><dd>${c.format}</dd></div><div><dt>${labels.stage}</dt><dd>${c.stage}</dd></div></dl>`;
const opening=(c,labels)=>`<section class="research-opening"><h1>${c.title}</h1><h2>${c.headline}</h2><p>${c.intro}</p>${meta(c,labels)}</section>`;
const sectionHead=(label,title,body='')=>`<div class="research-section-heading"><span>${label}</span><div><h2>${title}</h2>${body?`<p>${body}</p>`:''}</div></div>`;

export function eyeCase(l){
 const c=copy[l].eye;
 return `${opening(c,copy[l].labels)}
 <figure class="research-eye-hero" id="project-media"><div class="research-eye-film"><video muted loop playsinline controls preload="metadata" poster="/media/eye-tracking/attention-heatmap-poster.webp" aria-label="${c.heat}"><source src="/media/eye-tracking/attention-heatmap-loop.mp4" type="video/mp4"></video><span class="research-art-label">01 / ATTENTION STUDY</span></div><div class="research-eye-frame"><img src="/media/eye-tracking/prototype-live-capture.jpg" width="1200" height="750" alt="${c.interface}" loading="eager" decoding="async"><span class="research-art-label">02 / WORKING INTERFACE</span></div><figcaption>${c.heat}</figcaption></figure>
 <section class="research-section research-question">${sectionHead(c.problemLabel,c.problem,c.problemBody)}</section>
 <section class="research-section research-prototype">${sectionHead(c.buildLabel,c.build,c.buildBody)}<figure class="research-browser"><div class="research-browser-top" aria-hidden="true"><span></span><span></span><span></span><p>Eye Tracking Canva</p></div><img src="/media/eye-tracking/prototype-live-capture.jpg" width="1200" height="750" alt="${c.interface}" loading="lazy" decoding="async"></figure><div class="research-demo-link"><a href="https://eye-tracking-canva-bruce.brucexie13.chatgpt.site" target="_blank" rel="noopener noreferrer">${c.live}<span aria-hidden="true">↗</span></a><p>${c.private}</p></div></section>
 <section class="research-section research-flow"><div class="research-section-heading"><span>${c.flowLabel}</span></div><ol class="research-steps">${c.steps.map(([number,name,description])=>`<li><span>${number}</span><strong>${name}</strong><p>${description}</p></li>`).join('')}</ol></section>
 <section class="research-section research-decisions">${sectionHead(c.decisionsLabel,c.decisions,c.decisionsBody)}<div class="research-evidence"><figure><img src="/media/eye-tracking/attention-study.png" width="1154" height="1400" alt="${c.sample}" loading="lazy" decoding="async"><figcaption>${c.sample}</figcaption></figure><div class="research-evidence-notes">${c.notes.map(([title,description],i)=>`<article><span>0${i+1}</span><h3>${title}</h3><p>${description}</p></article>`).join('')}</div></div></section>
 <section class="research-section research-future">${sectionHead(c.nextLabel,c.next,c.nextBody)}<div class="research-status-grid"><div><h3>${c.built}</h3><ul>${c.builtList.map(t=>`<li>${t}</li>`).join('')}</ul></div><div><h3>${c.later}</h3><ul>${c.laterList.map(t=>`<li>${t}</li>`).join('')}</ul></div></div><div class="research-source"><a href="https://github.com/xieBruce13/Eye-Tracking-Canva" target="_blank" rel="noopener noreferrer">${c.repo} ↗</a><span>${c.repoNote}</span></div></section>`;
}
