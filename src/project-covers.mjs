import {icon} from './icons.mjs';

// A deliberately edited product composition. The watch is original product art;
// the decorative conversation is drawn in HTML from the case-study scenario.
export function pisonCover(lang){
 const zh=lang==='zh';
 return `<div class="project-art pison-editorial-cover" aria-hidden="true">
  <div class="pison-cover-copy"><span class="pison-cover-title">Pison<span class="pison-cover-descriptor">Health Agent</span></span><p>${zh?'身体的信号。<br>更好的下一步。':'Your signals.<br>Your next move.'}</p></div>
  <div class="pison-cover-objects">
   <div class="cover-phone"><div class="cover-phone-screen">
    <div class="cover-phone-status"><span>9:41</span><i></i><span class="cover-status-bars">▮▮▮ <b></b></span></div>
    <div class="cover-phone-contact"><span class="cover-agent-avatar">${icon('spark')}</span><strong>Pison Ultimate Agent</strong><span>iMessage</span></div>
    <div class="cover-phone-conversation">
     <span class="cover-chat-date">${zh?'今天 9:41':'Today 9:41'}</span>
     <p>${zh?'明晚 7 点有比赛。今晚一起为更好的状态做准备？':'Game tomorrow at 7. Want to plan tonight around feeling ready?'}</p>
     <p class="cover-chat-user">${zh?'但下午 4 点喝咖啡，我感觉更清醒。':'I feel sharper after a 4 pm coffee, though.'}</p>
     <p>${zh?'你过去的记录里，晚喝咖啡往往伴随着更晚入睡。明天有比赛，今天不如把咖啡提前一点。':'Later coffees have lined up with later sleep in your history. With the game tomorrow, an earlier coffee may be a better tradeoff.'}</p>
     <p class="cover-chat-user">${zh?'那就提前一点。':'Let’s move it earlier.'}</p>
    </div>
    <div class="cover-phone-compose">${icon('plus')}<span>iMessage</span>${icon('up')}</div><i class="cover-home-bar"></i>
   </div></div>
   <img class="cover-watch" src="/media/pison/pison-watch.webp" alt="" loading="lazy" width="476" height="560">
  </div>
 </div>`;
}


// Thematic cover illustrations, never presented as measured data or product footage.
export function studyCover(slug,lang){
 if(slug==='qwen-create')return `<div class="project-art study-cover study-qwen" aria-hidden="true"><span class="study-title">Qwen<br>Create</span><div class="study-visual"><div class="qwen-canvas"><div class="qwen-canvas-bar"><i></i><i></i><i></i></div><div class="qwen-creative qwen-creative-one"><i></i></div><div class="qwen-creative qwen-creative-two"><i></i><i></i><i></i></div><div class="qwen-creative qwen-creative-three">${icon('spark')}</div><span class="qwen-flow-line"></span><span class="qwen-flow-node">${icon('spark')}</span></div></div></div>`;
 if(slug==='eye-tracking-thingz')return `<div class="project-art study-cover study-eye" aria-hidden="true"><span class="study-title">Eye Tracking<br>Thingz</span><div class="study-visual"><div class="eye-optic"><svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">${Array.from({length:19},(_,i)=>`<ellipse cx="200" cy="150" rx="${173-i*5.5}" ry="${28+i*5.8}" stroke="#${i%3===0?'b4b4b4':'d8d8d8'}" stroke-width=".8"/>`).join('')}<path d="M17 150H383M200 9V291" stroke="#c4c4c4" stroke-width=".65" stroke-dasharray="2 7"/><circle cx="200" cy="150" r="39" fill="#191919"/><circle cx="190" cy="139" r="6" fill="#fff"/></svg><span class="eye-reticle"></span></div></div></div>`;
 if(slug==='lucian-freud-lora')return `<div class="project-art study-cover study-lora" aria-hidden="true"><div class="lora-composition"><div class="lora-sheet lora-sheet-back"></div><div class="lora-sheet lora-sheet-middle"></div><div class="lora-sheet lora-sheet-front"><svg viewBox="0 0 280 330" role="presentation" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="lora-paper" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#dad8d3"/><stop offset="1" stop-color="#aaa79e"/></linearGradient><radialGradient id="lora-head" cx=".35" cy=".3" r=".85"><stop stop-color="#d9d3c9"/><stop offset=".56" stop-color="#a09a8f"/><stop offset="1" stop-color="#77736d"/></radialGradient></defs><rect width="280" height="330" fill="url(#lora-paper)"/><path d="M22 330Q43 249 108 233Q180 205 258 330Z" fill="#888680"/><path d="M67 94Q90 22 153 27Q235 29 230 126L214 203Q184 253 139 256Q86 244 70 195L56 141Z" fill="url(#lora-head)"/><path d="M78 113Q96 42 141 48Q186 35 211 88" fill="none" stroke="#77736c" stroke-width="24" opacity=".5"/><path d="M84 151Q112 138 132 153M162 153Q189 141 210 155" fill="none" stroke="#5a5955" stroke-width="7" stroke-linecap="round" opacity=".7"/><path d="M145 154Q137 192 132 204Q149 211 165 202" fill="none" stroke="#65615c" stroke-width="7" opacity=".6"/><path d="M117 225Q148 239 178 223" fill="none" stroke="#665f5a" stroke-width="8" stroke-linecap="round" opacity=".65"/><path d="M49 88Q104 122 224 61M41 180Q135 226 245 153M38 273Q140 254 252 294" fill="none" stroke="#e6e0d8" stroke-width="16" opacity=".17"/><g stroke="#fafaf8" stroke-width=".7" opacity=".42"><path d="M93 0V330M187 0V330M0 110H280M0 220H280"/></g></svg></div><div class="lora-study-strip">${Array.from({length:4},(_,i)=>`<span style="--patch:${i}"></span>`).join('')}</div></div></div>`;
 return `<div class="project-art study-cover study-hive" aria-hidden="true"><span class="study-title">Co-Hive</span><div class="study-visual"><div class="hive-locker">${Array.from({length:9},(_,i)=>`<div class="hive-cell${i===4?' hive-cell-open':''}"><span class="hive-door"><i></i></span>${i===4?'<span class="hive-item"></span>':''}</div>`).join('')}</div></div></div>`;
}
export function placeholderCovers(lang,start=5){
 return ['orbit','layers'].map((shape,i)=>`<article class="project-card project-placeholder" aria-label="${lang==='zh'?'未来项目':'Future project'} ${i+start}"><div class="project-image"><div class="project-art placeholder-art placeholder-${shape}" aria-hidden="true"><div class="placeholder-object">${Array.from({length:shape==='layers'?5:3},()=>'<i></i>').join('')}</div></div><span class="placeholder-label">${lang==='zh'?'即将呈现':'Coming soon'}</span><span class="placeholder-number" aria-hidden="true">0${i+start}</span></div></article>`).join('');
}
