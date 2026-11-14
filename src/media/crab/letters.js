function createCrabLetters() {
  const titles=[...document.querySelectorAll('.hero-name,.hero h1')];
  const unavailable=()=>document.documentElement.classList.contains('copy-editing');

  function choose() {
    if(unavailable())return null;
    const candidates=[];
    for(const title of titles){
      const walker=document.createTreeWalker(title,NodeFilter.SHOW_TEXT);
      while(walker.nextNode()){
        const node=walker.currentNode;
        if(node.parentElement.closest('.crab-letter-eaten'))continue;
        let offset=0;
        for(const character of node.data){
          const start=offset;
          offset+=character.length;
          if(!/\p{L}/u.test(character))continue;
          const range=document.createRange();
          range.setStart(node,start);range.setEnd(node,offset);
          const rect=range.getBoundingClientRect();
          if(rect.width && rect.bottom>64 && rect.top<innerHeight){
            candidates.push({character,range,node,start,end:offset});
          }
        }
      }
    }
    if(!candidates.length)return null;
    const selected=candidates[Math.floor(Math.random()*candidates.length)];
    const style=getComputedStyle(selected.node.parentElement);
    const floating=document.createElement('span');
    floating.className='crab-morsel';
    floating.setAttribute('aria-hidden','true');
    floating.textContent=selected.character;
    Object.assign(floating.style,{
      fontFamily:style.fontFamily,fontWeight:style.fontWeight,fontSize:style.fontSize,
      lineHeight:style.lineHeight,letterSpacing:style.letterSpacing,color:style.color
    });
    let placeholder=null,finished=false,letterWidth=0,letterHeight=0;
    function valid() {
      if(unavailable() || finished)return false;
      if(placeholder)return placeholder.isConnected;
      return selected.node.isConnected &&
        selected.node.data.slice(selected.start,selected.end)===selected.character;
    }
    function position() {
      if(!valid())return null;
      const rect=placeholder ? placeholder.getBoundingClientRect() : selected.range.getBoundingClientRect();
      return {x:rect.left+rect.width/2,y:rect.top+scrollY+rect.height/2,width:rect.width,height:rect.height};
    }
    function pick() {
      if(placeholder || !valid())return;
      const rect=position();
      letterWidth=rect.width;letterHeight=rect.height;
      placeholder=document.createElement('span');
      placeholder.className='crab-letter-eaten';
      selected.range.surroundContents(placeholder);
      floating.style.width=rect.width+'px';
      floating.style.height=rect.height+'px';
      document.body.append(floating);
    }
    function show(at,rotation=0,size=1,opacity=1) {
      if(!placeholder || finished)return;
      floating.style.transform='translate('+(at.x-letterWidth/2)+'px,'+
        (at.y-scrollY-letterHeight/2)+'px) rotate('+rotation+'rad) scale('+size+')';
      floating.style.opacity=opacity;
    }
    function finish(restore=false) {
      floating.remove();
      if(restore && placeholder?.isConnected)placeholder.replaceWith(...placeholder.childNodes);
      finished=true;
    }
    return {position,pick,show,finish,valid,character:selected.character};
  }
  function restore() {
    for(const title of titles){
      for(const letter of title.querySelectorAll('.crab-letter-eaten'))letter.replaceWith(...letter.childNodes);
      title.normalize();
    }
  }
  return {choose,restore};
}
