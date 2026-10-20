/* Bårdshaugen · v-stilistisk «Folkekunst og rosemaling» */
(() => {
  const d = document, de = d.documentElement, rm = matchMedia('(prefers-reduced-motion: reduce)');

  /* «Åpent nå» – Europe/Oslo, man–fre 06:45–17:15 (helligdager ikke medregnet) */
  const st = d.getElementById('status'), stt = d.getElementById('status-t');
  const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Oslo', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  function status() {
    const p = {};
    fmt.formatToParts(new Date()).forEach(x => p[x.type] = x.value);
    const wd = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(p.weekday);
    const m = +p.hour * 60 + +p.minute, O = 405, C = 1035, work = wd > -1 && wd < 5;
    const open = work && m >= O && m < C;
    st.dataset.state = open ? 'open' : 'closed';
    stt.textContent = open ? 'Åpent nå · stenger kl. 17.15'
      : work && m < O ? 'Stengt nå · åpner kl. 06.45 i dag'
      : wd > -1 && wd < 4 ? 'Stengt nå · åpner i morgen kl. 06.45'
      : 'Stengt nå · åpner mandag kl. 06.45';
  }
  if (st && stt) { status(); setInterval(status, 60000); }

  /* Blomstring: IntersectionObserver-fallback når scroll-drevne animasjoner mangler */
  if (!rm.matches && !(window.CSS && CSS.supports('timeline-trigger: --t view() contain')) && 'IntersectionObserver' in window) {
    de.classList.add('io');
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -12% 0px' });
    d.querySelectorAll('.orn:not(.orn--hero), .arch, .doors, .scores, .vine').forEach(el => io.observe(el));
  }

  /* Skapdørene: avdeling → detalj i <dialog> med View Transitions */
  const dlg = d.getElementById('dept');
  if (!dlg || !dlg.showModal) return;
  const art = dlg.querySelector('.dlg__art'), $ = id => d.getElementById(id);
  let opener = null, door = null;
  const name = (el, n) => { if (el) el.style.viewTransitionName = n; };
  const vt = fn => (d.startViewTransition && !rm.matches) ? d.startViewTransition(fn) : (fn(), null);
  const parts = () => [door.querySelector('.door__roundel'), door.querySelector('.door__panel')];

  function fill(btn) {
    art.replaceChildren(door.querySelector('.door__art').cloneNode(true));
    $('dept-tag').textContent = door.querySelector('.tag').textContent;
    $('dept-t').textContent = door.querySelector('h3').textContent;
    $('dept-txt').textContent = door.querySelector('.door__txt').textContent;
    $('dept-ph').textContent = btn.dataset.ph;
    const a = door.querySelector('.door__tel a'), t = $('dept-tel');
    t.href = a.getAttribute('href'); t.textContent = a.textContent;
  }

  function open(btn) {
    opener = btn; door = btn.closest('.door');
    fill(btn);
    const [r, p] = parts();
    name(r, 'dept-art'); name(p, 'dept-panel');
    const t = vt(() => {
      name(r, ''); name(p, '');
      dlg.showModal();
      name(art, 'dept-art'); name(dlg, 'dept-panel');
    });
    const clear = () => { name(art, ''); name(dlg, ''); };
    t ? t.finished.finally(clear) : clear();
  }

  function close() {
    if (!dlg.open) return;
    const [r, p] = parts();
    name(art, 'dept-art'); name(dlg, 'dept-panel');
    const t = vt(() => {
      name(art, ''); name(dlg, '');
      dlg.close();
      name(r, 'dept-art'); name(p, 'dept-panel');
    });
    const clear = () => { name(r, ''); name(p, ''); };
    t ? t.finished.finally(clear) : clear();
  }

  d.querySelectorAll('.door__open').forEach(b => b.addEventListener('click', () => open(b)));
  $('dept-close').addEventListener('click', close);
  dlg.addEventListener('cancel', e => { e.preventDefault(); close(); });
  dlg.addEventListener('click', e => { if (e.target === dlg) close(); });
  dlg.addEventListener('close', () => { if (opener) opener.focus(); });
})();
