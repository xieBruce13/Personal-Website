import {icon} from '../icons.mjs';

const media = '/media/eye-tracking';
const prototype = 'https://eye-tracking-canva-bruce.brucexie13.chatgpt.site';
const placementStudy = 'https://pubmed.ncbi.nlm.nih.gov/22309059/';
const scanningStudy = 'https://www.nngroup.com/articles/eyetracking-tasks-efficient-scanning/';

const copy = {
  en: {
    premise: 'Gaze tracking with a laptop webcam.',
    live: 'Open prototype', access: 'Private access',
    landing: 'Where do your eyes go? Open the Eye Tracking prototype in a new tab.',
    play: 'Play animation', pause: 'Pause animation',
    context: 'Context & problem',
    problem: 'In design reviews, I use eye tracking to see which images draw the eye and whether people look at the captions. Dedicated trackers are expensive and take time to set up for a short review.',
    solution: 'Solution',
    build: 'I built a browser tool that estimates gaze while someone reads a PDF. I can run a session on my laptop and save a heatmap for each page. Camera frames and documents stay on the device.',
    calibration: 'How the webcam estimates gaze',
    model: [
      ['Find the eyes', 'WebGazer crops an image of each eye and records the position of the head.'],
      ['Learn the screen', 'As the reader looks at 17 targets, ridge regression learns to map those features to screen coordinates.'],
      ['Check the estimate', 'Five new targets test accuracy. The dotted line shows how far one prediction falls from its target.']
    ],
    observation: 'When I tested with glasses, tracking seemed less reliable. I use the calibration check to decide whether I can compare broad areas of the page.',
    mapTitle: 'How a heatmap is made',
    mapIntro: 'One image, one caption, and a few simulated gaze samples.',
    stages: [
      ['Page positions', 'Each dot marks one gaze estimate on the PDF.', 'Seven dots fall on the gray image square and two on the line representing its caption.'],
      ['Time per cell', 'The tool adds viewing time to a 60 × 80 grid, skipping gaps over 750 ms.', 'A few grid cells mark the same positions. Darker cells hold more time.'],
      ['Heatmap export', 'Smoothing blends nearby cells. Warmer areas show longer dwell on this page.', 'One warm spot sits on the image and a smaller, cooler spot sits on the caption.']
    ],
    why: 'Why this is useful',
    use: 'When I put a caption beside an image, I want to know whether readers find the connection. Eye tracking shows where they spent time. Asking them to explain the image in their own words tells me what came through.',
    findings: [
      ['Placement changes how people read.', 'In experiments with a car-brake diagram, readers looked back and forth more often when the words sat beside the parts they described.', 'Johnson & Mayer, 2012', placementStudy],
      ['The task changes where people look.', 'On the same travel page, a participant scanned photos to pick a destination and prices to find the cheapest trip. That’s why I would give readers the same task when comparing layouts.', 'Pernice, 2017', scanningStudy]
    ],
    next: 'Next steps',
    plans: [
      ['Measure the error', 'I’ll look at known points on screen and measure how far each webcam estimate lands from its target. I’ll pay particular attention to the errors when I wear my glasses.'],
      ['Compare setups', 'I’ll keep the targets fixed and change the calibration, camera or monitor size one at a time. If the error still spans both image and text, I’ll compare another tracker with WebGazer.'],
      ['Pilot a design review', 'Once I can distinguish those regions reliably, I’ll test two PDFs that differ only in caption placement. Each reader will get the same question. I’ll compare their heatmaps with what they can explain afterward.']
    ]
  },
  zh: {
    premise: '用笔记本摄像头记录注视位置。',
    live: '打开原型', access: '访问权限受限',
    landing: '你的目光停在哪里？在新标签页打开眼动追踪原型。',
    play: '播放动画', pause: '暂停动画',
    context: '背景与问题',
    problem: '在设计评审中，我常用眼动追踪来了解哪些图像最先吸引目光，以及读者是否看了图注。专用眼动仪价格昂贵，每次都要设置设备，很难在简短的评审中随手收集数据。',
    solution: '解决方案',
    build: '我开发了一款浏览器工具，在读者翻阅 PDF 时估计注视位置。只用笔记本就能完成采集，并逐页保存热图。摄像头画面和文档都保留在本机。',
    calibration: '摄像头如何估计视线',
    model: [
      ['提取双眼特征', 'WebGazer 分别截取两只眼睛的图像，并记录头部的位置。'],
      ['建立坐标映射', '读者依次看向 17 个目标点。工具通过岭回归学习如何将这些特征映射为屏幕坐标。'],
      ['检验估计误差', '再用 5 个新位置检验精度。虚线示意真实目标与预测位置之间的距离。']
    ],
    observation: '早期测试时，我戴眼镜后感觉追踪更不稳定。因此我会先看校准误差，再判断能否用这次记录比较页面上的几个较大区域。',
    mapTitle: '一张热图怎样生成',
    mapIntro: '用一张图、一段图注和几个模拟注视点，演示热图的生成过程。',
    stages: [
      ['页面位置', '每个点代表一次估计的注视位置。', '七个点落在代表图像的灰色方块上，两个点落在代表图注的横线上。'],
      ['累计停留时间', '工具在 60 × 80 的网格中累加停留时间，跳过超过 750 毫秒的间隔。', '相应位置的网格颜色越深，表示停留时间越长。'],
      ['导出热图', '相邻网格经过平滑处理。颜色越暖，表示在本页该处停留得越久。', '图像上有一处暖色热点，图注上的热点较小，颜色也较冷。']
    ],
    why: '这对设计研究有什么用',
    use: '把说明放在图像旁边时，我想知道读者能否把两者联系起来。眼动记录能让我看到读者在哪里停留。再请他们用自己的话解释图像，我就能知道他们读懂了什么。',
    findings: [
      ['图注的位置会改变阅读方式。', '在一项关于汽车制动原理图的研究中，当说明文字紧邻对应部件时，读者的目光更常在文字和图示之间往返。', 'Johnson 与 Mayer，2012', placementStudy],
      ['阅读目的会改变注视位置。', '面对同一个旅游页面，一位参与者挑选心仪的目的地时逐一看照片，寻找最便宜的行程时则逐一看价格。因此，比较两种版式时，我会给读者相同的任务。', 'Pernice，2017', scanningStudy]
    ],
    next: '下一步',
    plans: [
      ['测量追踪误差', '我会依次看向屏幕上的已知位置，测量每次预测与目标之间的距离。我最早是在戴眼镜时注意到视线漂移的，因此会专门重复测试这种情况。'],
      ['比较采集条件', '我会使用相同的目标点，每次只调整校准方式、摄像头或显示器尺寸中的一项，与 WebGazer 的基线结果比较。如果误差仍大到无法区分图像和文字，我会再测试其他追踪工具。'],
      ['试做一轮设计评审', '等追踪精度足以区分图文区域后，我会用两份只有图注位置不同的 PDF 做测试。所有读者回答同一个问题，再把他们的热图和读后解释放在一起比较。']
    ]
  }
};

// Positions from the prototype’s initial calibration and separate validation pass.
const targets = [[.5,.5],[.1,.12],[.5,.12],[.9,.12],[.1,.5],[.9,.5],[.1,.88],[.5,.88],[.9,.88],[.3,.3],[.7,.3],[.3,.7],[.7,.7],[.5,.3],[.5,.7],[.3,.5],[.7,.5]];
const checks = [[.2,.23],[.8,.24],[.52,.55],[.22,.78],[.78,.77]];
function targetDots(points, isCheck) {
  return points.map(([x,y]) => `<circle cx="${26+208*x}" cy="${14+120*y}" r="${isCheck ? 4.2 : 3.1}" class="${isCheck ? 'check-target' : 'fit-target'}"/>`).join('');
}
function eyePatch(transform) {
  return `<g transform="${transform}">
    <path class="eye-brackets" d="M-5 0v-8H5m73 0h10v8m0 45v8H78M5 53H-5v-8"/>
    <path class="eye-lid" d="M3 20C19 3 44-2 68 11"/>
    <path class="eye-contour" d="M0 27C17 5 43 2 71 16c5 3 9 6 12 9-20 16-51 24-83 2Z"/>
    <circle class="iris" cx="42" cy="24" r="14"/><circle class="fit-target" cx="42" cy="24" r="7"/>
    <circle cx="45" cy="20" r="2.6" fill="white"/>
  </g>`;
}
const centerMark = '<circle class="guide-ring" cx="130" cy="74" r="10"/>';
const drawings = [
  eyePatch('translate(28 53)') + eyePatch('translate(232 53) scale(-1 1)'),
  centerMark + targetDots(targets,false),
  targetDots(checks,true) + '<circle class="guide-ring" cx="134.16" cy="80" r="10"/><path class="error-line" d="m137.6 77.6 28-19.6"/><circle cx="169" cy="55.5" r="4.6" class="fit-target"/>'
];

// This unframed page sits under each signal layer, keeping every coordinate aligned.
const pageArt = `<svg class="eye-page-art" viewBox="0 0 240 136" aria-hidden="true" focusable="false">
  <rect x="80" y="10" width="80" height="80" fill="#d7d7d7"/>
  <line x1="81" y1="101" x2="151" y2="101" stroke="#a6a6a6" stroke-width="4" stroke-linecap="round"/>
</svg>`;

export function eyeCase(language) {
  const c=copy[language];
  const landing = ['wide','phone'].map(size => `<video class="eye-landing-${size}" aria-hidden="true" muted loop playsinline preload="none"
    poster="${media}/landing-${size}.webp" src="${media}/landing-${size}.mp4"></video>`).join('');
  const views=['positions','dwell','heatmap'];
  return `<article class="eye-study">
    <header class="research-opening eye-heading"><h1>Eye Tracking</h1><h2>${c.premise}</h2></header>
    <div class="eye-landing" id="project-media">
      <a href="${prototype}" target="_blank" rel="noopener noreferrer" aria-label="${c.landing}" aria-describedby="eye-access-note">
        <span class="eye-landing-frame">${landing}</span>
        <span class="eye-landing-caption">${c.live} ${icon('arrow')}<small id="eye-access-note">${c.access}</small></span>
      </a>
      <button type="button" class="eye-playback" data-play="${c.play}" data-pause="${c.pause}" hidden>${c.play}</button>
    </div>
    <div class="eye-brief">
      <section aria-labelledby="eye-context-title"><h2 id="eye-context-title">${c.context}</h2><p>${c.problem}</p></section>
      <section aria-labelledby="eye-solution-title"><h2 id="eye-solution-title">${c.solution}</h2><p>${c.build}</p></section>
    </div>
    <section class="eye-chapter" aria-labelledby="eye-model-title">
      <h2 id="eye-model-title">${c.calibration}</h2>
      <ol class="eye-model">${c.model.map(([title,body],i)=>`<li>
        <div class="eye-step-art"><svg viewBox="0 0 260 148" aria-hidden="true" focusable="false">${drawings[i]}</svg></div>
        <div><h3>${title}</h3><p>${body}</p></div>
      </li>`).join('')}</ol>
      <p class="eye-observation">${c.observation}</p>
    </section>
    <section class="eye-chapter" aria-labelledby="eye-map-title">
      <h2 id="eye-map-title">${c.mapTitle}</h2><p class="eye-lead">${c.mapIntro}</p>
      <ol class="eye-detail-flow">${c.stages.map(([title,body,alt],i)=>`<li><figure>
        <div class="eye-step-art">${pageArt}<img src="${media}/layout-${views[i]}.svg" loading="lazy" width="240" height="136" alt="${alt}"></div>
        <figcaption><h3>${title}</h3><p>${body}</p></figcaption>
      </figure></li>`).join('')}</ol>
    </section>
    <section class="eye-chapter eye-use" aria-labelledby="eye-use-title">
      <div><h2 id="eye-use-title">${c.why}</h2><p class="eye-lead">${c.use}</p></div>
      <div class="eye-findings">${c.findings.map(([title,body,source,url])=>`<div><h3>${title}</h3><p>${body} <cite><a href="${url}">${source}</a></cite></p></div>`).join('')}</div>
    </section>
    <section class="eye-chapter eye-next" aria-labelledby="eye-next-title">
      <h2 id="eye-next-title">${c.next}</h2>
      <ol>${c.plans.map(([title,body])=>`<li><h3>${title}</h3><p>${body}</p></li>`).join('')}</ol>
    </section>
  </article>`;
}
