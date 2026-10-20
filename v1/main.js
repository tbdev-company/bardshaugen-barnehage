const btn=document.querySelector('.menu-btn'),nav=document.getElementById('meny');
btn.addEventListener('click',()=>{const o=btn.getAttribute('aria-expanded')==='true';btn.setAttribute('aria-expanded',String(!o));nav.classList.toggle('open',!o);});
nav.addEventListener('click',e=>{if(e.target.closest('a')){btn.setAttribute('aria-expanded','false');nav.classList.remove('open');}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){btn.click();btn.focus();}});
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
  const layers=[...document.querySelectorAll('.hills [data-depth]')];let t=false;
  addEventListener('scroll',()=>{if(t)return;t=true;requestAnimationFrame(()=>{const y=scrollY;if(y<900)layers.forEach(l=>l.style.transform=`translateY(${y*l.dataset.depth}px)`);t=false;});},{passive:true});
}
