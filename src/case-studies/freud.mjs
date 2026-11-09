const assets = '/media/lora/';

const works = [
  ['173', 'The Painter’s Father', '1970', 435, 600],
  ['002', 'Hotel Bedroom', '1954', 401, 600],
  ['003', 'Reflection (Self-Portrait)', '1985', 541, 600],
  ['004', 'Queen Elizabeth II', '2000–01', 399, 600]
];

const copy = {
  en: {
    subtitle:'Teaching an image generator how colour gives a face its form.',
    intro:'Can a model learn the turn of a cheek from the paintings I choose for it?',
    hero:'Reading a message · Generated with the 39-oil LoRA',
    heroAlt:'An older man looking down at the smartphone in his hands.',callAlt:'Painted portrait of a woman holding a phone to her ear.',
    study:'A portrait experiment',
    artist:'Lucian Freud (1922–2011) was a British painter known for closely observed portraits. Look at the brow in his self-portrait below. A patch of ochre beside an olive shadow gives the bone its shape.',
    method:'I chose the references and used an AI assistant to train a LoRA, a small add-on for Stable Diffusion XL 1.0. I tried different groups of paintings to see which best carried those colours into a new sitter.',
    diagram:['Inside one SDXL attention layer','Input','SDXL','Frozen weights','LoRA A','Rank 16','LoRA B','Restore width','Output','The same input takes two paths. SDXL applies its frozen weights. The two trainable LoRA matrices reduce and expand the features. Their adjustment is added to the base result.'],
    works:'What belongs in the training set?',
    criterion:'I looked for faces large enough to study where a warm highlight meets a cool shadow.',
    chosen:'Selected for training',
    reasons:[
      'Pencil gives the jaw a precise edge. It offers no skin colour for this particular study.',
      'The figures and the bed describe a room. The faces occupy too little of the painting to study individual strokes.',
      'Olive shadow meets yellow ochre above the eye. Up close, those changes give the brow its weight.',
      'Short strokes of cream, rose and grey turn the cheek. The tight framing makes each change easy to see.'
    ],
    alts:['Pencil head with a dark outline along the jaw.','A figure in bed and another standing near the hotel window.','Self-portrait built from ochre and olive planes.','Crowned head with blocks of cream and rose across the cheeks.'],
    process:'From references to a working model',
    stageNames:['References','Shortlisted','Training','Held for checks'],compare:'Compare three models',
    branches:['77 mixed works','39 chosen at random','39 later oil portraits'],
    compareNote:'One phone call, three refinements. Each used the same prompt and seed.',
    finding:'In an earlier blind review of four portrait and reading scenes, the AI reviewer preferred the 39-oil version for skin colour and facial structure.',
    portraits:'One sitter prompt, three models',prompt:'Swept-back dark hair, an ivory collar, one cheek lit by a high window.',
    labels:['Base generator','Earlier painting study','Refined oil portraits'],
    notes:['Stable Diffusion XL','Open-access painting LoRA','39 later Freud oil portraits'],
    portraitAlts:['Base-model portrait of the side-lit sitter.','The same sitter description interpreted by the earlier painting model.','The same description interpreted by the later oil-portrait model.'],
    settings:'AI-generated portraits · Same subject description and seed · 1024 × 1024'
  },
  zh: {
    subtitle:'让图像生成模型学习，色彩如何塑造一张脸。',
    intro:'从我挑选的画里，模型能学会用颜色画出面颊的起伏吗？',
    hero:'读消息的人 · 由 39 幅油画训练的 LoRA 生成',heroAlt:'一位老人低头看着手里的手机。',callAlt:'一位女子将手机贴近耳畔。',
    study:'一次肖像实验',
    artist:'卢西安·弗洛伊德（1922–2011）是英国画家，以细致观察人物而闻名。看看下方自画像中的眉骨：一笔黄赭紧挨着橄榄色阴影，骨骼的起伏便显现出来。',
    method:'我挑选参考画作，并借助 AI 助手为 Stable Diffusion XL 1.0 训练了一个叫作 LoRA 的小型组件。我改变选画的数量与类型，观察哪一组最能保留新人物脸上的色彩层次。',
    diagram:['SDXL 注意力层内部','输入','SDXL','固定权重','LoRA A','压缩至秩 16','LoRA B','还原到输出维度','输出','同一组输入分成两路。一路经过固定权重，另一路经过可训练的 LoRA 矩阵，先压缩再展开。两路结果相加。'],
    works:'哪些作品适合训练？',criterion:'我希望画中的脸足够大，可以看清一块暖色高光在哪里转入冷色阴影。',chosen:'已选入训练集',
    reasons:['铅笔线准确地勾出下颌，却无法为这次实验提供肤色的冷暖信息。','人物和床共同构成了房间。面孔在整幅画里占比太小，很难观察具体笔触。','眼睛上方，橄榄色的阴影紧挨着黄赭色。近看这些转折，能感到眉骨的重量。','乳白、玫瑰色与灰色的短笔触托起面颊。紧凑的取景让每次颜色变化都清晰可见。'],
    alts:['用铅笔勾出的头像，下颌的轮廓线较深。','一人躺在旅馆床上，另一人站在窗前。','赭色与橄榄色塑造的自画像。','戴王冠的人物，双颊上带有乳白与玫瑰色块。'],
    process:'从参考作品到生成模型',stageNames:['参考作品','入选作品','用于训练','留作验证'],compare:'比较三种精调模型',
    branches:['77 件混合作品','39 件随机选画','39 幅较晚期油画肖像'],
    compareNote:'同一通电话，三种精调结果。三次生成使用同一句描述与同一个随机种子。',
    finding:'在此前四组肖像和阅读场景的盲评中，AI 评审根据肤色与面部结构，均选中了 39 幅油画这一版。',
    portraits:'同一句描述，三种画法',prompt:'向后梳的黑发，象牙白的衣领，高窗的光落在一侧脸颊。',
    labels:['基础模型','早期绘画实验','油画肖像精调模型'], notes:['Stable Diffusion XL','开放作品绘画 LoRA','39 件弗洛伊德较晚期油画肖像'],
    portraitAlts:['基础模型生成的侧光肖像。','相同的人物描述，由早期绘画模型生成。','相同的描述，由油画肖像精调模型生成。'],
    settings:'AI 生成肖像 · 相同描述与随机种子 · 1024 × 1024'
  }
};

function image(file,alt,w,h,eager=false) {
  return `<img src="${assets}${file}.webp" alt="${alt}" width="${w}" height="${h}" loading="${eager?'eager':'lazy'}" decoding="async">`;
}

function layerDiagram(d) {
  return `<figure class="layer-diagram">
    <figcaption>${d[0]}</figcaption>
    <svg viewBox="0 0 408 225" role="img" aria-labelledby="layer-title layer-desc">
      <title id="layer-title">${d[0]}</title><desc id="layer-desc">${d[9]}</desc>
      <defs>
        <pattern id="layer-grid" x="1" y="1" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="#69726c"/></pattern>
        <pattern id="adapter-grid" x="1" y="1" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="#a06948"/></pattern>
      </defs>
      <g fill="none" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
        <path stroke="#717973" d="M15 104h32q7 0 7-7V55q0-7 7-7h114m54 0h104q7 0 7 7v34"/>
        <path stroke="#a06948" d="M47 104q7 0 7 7v40q0 7 7 7h49m56 0h72m26 0h69q7 0 7-7v-31"/>
        <path stroke="#a06948" d="m106 155 4 3-4 3m128-6 4 3-4 3m103-36 3-5 3 5"/>
        <path stroke="#717973" d="m171 45 4 3-4 3m166 34 3 5 3-5m11 19h40m-5-4 5 4-5 4"/>
      </g>
      <circle cx="14" cy="104" r="4" fill="#454b47"/>
      <rect x="183" y="29" width="37" height="38" fill="url(#layer-grid)"/>
      <rect x="116" y="151" width="45" height="15" fill="url(#adapter-grid)"/>
      <rect x="244" y="136" width="15" height="45" fill="url(#adapter-grid)"/>
      <circle cx="340" cy="104" r="10" fill="white" stroke="#5a615c" stroke-width="1.5"/>
      <path d="M335 104h10m-5-5v10" fill="none" stroke="#545b55" stroke-width="1.5"/>
      <g text-anchor="middle" font-family="inherit" font-size="16" fill="#252525">
        <text x="3" y="88" text-anchor="start">${d[1]}</text><text x="405" y="88" text-anchor="end">${d[8]}</text>
        <text x="202" y="20">${d[2]}</text><text class="layer-detail" x="202" y="87">${d[3]}</text>
        <text x="138" y="194">${d[4]}</text><text class="layer-detail" x="138" y="214">${d[5]}</text>
        <text x="252" y="194">${d[6]}</text><text class="layer-detail" x="263" y="214">${d[7]}</text>
      </g>
    </svg></figure>`;
}

export function freudCase(lang) {
  const c=copy[lang];
  const references=works.map(([id,title,year,w,h],i)=>{
    const selected=i>=2;
    const mark=selected?'<span class="chosen-mark" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="m4 10 4 4 8-9" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg></span>':'';
    return `<figure><a class="work-print" data-work="${id}" href="${assets}ref-LF-${id}.webp" target="_blank" rel="noopener" aria-label="${title}${selected?' · '+c.chosen:''}">${image('ref-LF-'+id,c.alts[i],w,h)}${mark}</a><figcaption><strong>${title}</strong><span>${year}</span><p>${c.reasons[i]}</p></figcaption></figure>`;
  }).join('');
  const sheet=(name,label,w,h)=>`<a class="sheet-link" href="${assets}process-${name}.webp" target="_blank" rel="noopener">${image('process-'+name,label,w,h)}</a>`;
  const plates=[['collection',304,684,576],['shortlist',85,360,324],['train',77,924,588],['validation',8,336,168]].map(([name,count,w,h],i)=>{
    const label=c.stageNames[i];
    return `<figure class="flow-plate"><figcaption><strong>${count}</strong><span>${label}</span></figcaption>${sheet(name,count+' · '+label,w,h)}</figure>`;
  });
  const steps=`<li>${plates[0]}</li><li>${plates[1]}</li><li class="diagram-split">${plates[2]}${plates[3]}</li>`;
  const variants=['mixed-77','mixed-39','oil-39'].map((name,i)=>`<figure>${image('phone-'+name,c.callAlt,1024,1024)}<figcaption><b>${c.branches[i]}</b></figcaption></figure>`).join('');
  const triptych=['base','pilot','oil39'].map((id,i)=>`<figure>${image('portrait-classical-'+id,c.portraitAlts[i],1024,1024)}<figcaption><strong>${c.labels[i]}</strong><span>${c.notes[i]}</span></figcaption></figure>`).join('');
  return `<article class="freud-study">
    <div class="folio-opening"><header class="research-opening"><h1>Defying Freud</h1><h2>${c.subtitle}</h2><p class="folio-lead">${c.intro}</p></header>
    <figure class="research-freud-hero folio-hero" id="project-media">${image('older-man-phone',c.heroAlt,1024,1024,true)}<figcaption>${c.hero}</figcaption></figure></div>
    <section class="folio-section folio-background" id="experiment"><div><h2>${c.study}</h2><p>${c.artist}</p><p>${c.method}</p></div>${layerDiagram(c.diagram)}</section>
    <section class="folio-section" id="selection"><h2>${c.works}</h2><p class="folio-deck">${c.criterion}</p><div class="folio-works">${references}</div></section>
    <section class="folio-section" id="process"><h2>${c.process}</h2><ol class="folio-flow" role="list">${steps}</ol>
      <h3 class="comparison-heading">${c.compare}</h3><p class="folio-deck">${c.compareNote}</p><div class="folio-branches">${variants}</div><p class="folio-finding">${c.finding}</p></section>
    <section class="folio-section" id="portrait-refinement"><h2>${c.portraits}</h2><p class="folio-prompt">${c.prompt}</p><div class="folio-portraits research-material-grid">${triptych}</div><p class="folio-credit">${c.settings}</p></section>
  </article>`;
}
