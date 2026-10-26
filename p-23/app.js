document.documentElement.classList.add('js');
document.addEventListener('DOMContentLoaded',()=>{
const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
const b=document.querySelector('.menu'),n=document.getElementById('nav');
if(b){b.addEventListener('click',()=>{const o=n.classList.toggle('open');b.setAttribute('aria-expanded',o)});n.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{n.classList.remove('open');b.setAttribute('aria-expanded',false)}))}
const els=document.querySelectorAll('.rv,.acc');
if(rm||!('IntersectionObserver' in window)){els.forEach(e=>e.classList.add('in'))}else{const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -10% 0px'});els.forEach(e=>io.observe(e))}
const kws=document.querySelectorAll('.kw');
if(!rm&&'IntersectionObserver' in window){const k=new IntersectionObserver(es=>es.forEach(e=>e.target.classList.toggle('on',e.isIntersecting||e.boundingClientRect.top<0)),{rootMargin:'0px 0px -42% 0px'});kws.forEach(e=>k.observe(e))}else kws.forEach(e=>e.classList.add('on'));
const px=[...document.querySelectorAll('[data-px]')];
if(!rm&&px.length&&!CSS.supports('animation-timeline: scroll()')){let vis=new Set(),tick=false;const io2=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting?vis.add(e.target):vis.delete(e.target)));px.forEach(e=>io2.observe(e.parentElement));
const run=()=>{tick=false;const y=scrollY;px.forEach(e=>{if(vis.has(e.parentElement))e.style.transform=`translate3d(0,${y*parseFloat(e.dataset.px)}px,0)`})};addEventListener('scroll',()=>{if(!tick){tick=true;requestAnimationFrame(run)}},{passive:true})}
const o=document.querySelector('.opentxt');if(o){try{const p=new Intl.DateTimeFormat('nb-NO',{timeZone:'Europe/Oslo',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());const g=t=>p.find(x=>x.type==t).value;const wd=g('weekday').toLowerCase(),m=+g('hour')*60+ +g('minute');const work=!/^(lør|søn)/.test(wd);const open=work&&m>=405&&m<1035;o.textContent=open?'Åpent nå, til 17.15':'Stengt nå. Åpent hverdager 06.45–17.15';o.parentElement.classList.toggle('closed',!open)}catch(e){}}
});