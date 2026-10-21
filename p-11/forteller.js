(()=>{
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const root=document.documentElement;
if(!('IntersectionObserver' in window))return;

/* 1. Word highlighting: split once, IO toggles a class; no scroll handlers, no layout reads */
if(!reduce){
  const tells=document.querySelectorAll('.tell');
  tells.forEach(p=>{
    let i=0;
    const walk=n=>{
      [...n.childNodes].forEach(c=>{
        if(c.nodeType===3){
          const parts=c.textContent.split(/(\s+)/);const f=document.createDocumentFragment();
          parts.forEach(t=>{if(!t)return;if(/^\s+$/.test(t)){f.appendChild(document.createTextNode(t));return}
            const s=document.createElement('span');s.className='w';s.textContent=t;s.style.setProperty('--d',(i++%7)*45+'ms');f.appendChild(s)});
          c.replaceWith(f);
        }else if(c.nodeType===1){
          if(c.classList.contains('kw')){c.classList.add('w');c.style.setProperty('--d',(i++%7)*45+'ms')}
          else if(!c.classList.contains('fill'))walk(c);
          else{c.classList.add('w')}
        }
      });
    };walk(p);
  });
  const io=new IntersectionObserver(es=>{
    for(const e of es){
      const lit=e.isIntersecting||e.boundingClientRect.top<0;
      e.target.classList.toggle('on',lit);
    }
  },{rootMargin:'0px 0px -38% 0px'});
  document.querySelectorAll('.tell .w').forEach(w=>io.observe(w));
  root.classList.add('hl');
}

/* 2. Fallback for browsers without scroll-driven animations */
if(reduce||CSS.supports('animation-timeline: view()'))return;
root.classList.add('io');
const io2=new IntersectionObserver(es=>{for(const e of es)if(e.isIntersecting){e.target.classList.add('in');io2.unobserve(e.target)}},{rootMargin:'0px 0px -15% 0px'});
document.querySelectorAll('.beat,.reveal,.words h2,.ledger div').forEach(el=>io2.observe(el));
/* parallax + layer swap for the visible scene only, batched in rAF (read all, then write) */
const scenes=[...document.querySelectorAll('.scene')];const active=new Set();
const io3=new IntersectionObserver(es=>{for(const e of es)e.isIntersecting?active.add(e.target):active.delete(e.target);tick()});
scenes.forEach(s=>io3.observe(s));
let raf=0;const tick=()=>{if(!raf&&active.size)raf=requestAnimationFrame(frame)};
function frame(){raf=0;const vh=innerHeight;const m=[];
  active.forEach(s=>{const r=s.getBoundingClientRect();m.push([s,Math.min(1,Math.max(0,(vh-r.top)/(r.height+vh)))])});
  m.forEach(([s,p])=>{const a=s.querySelector('.layer.a');if(a)a.style.transform=`scale(${1.14-.12*p}) translate3d(0,${-2+4*p}%,0)`;
    const L=s.querySelectorAll('.layer.b,.layer.c');L.forEach((l,i)=>l.classList.toggle('on',p>(L.length>1?[.35,.6][i]:.45)))});
}
addEventListener('scroll',tick,{passive:true});
})();
