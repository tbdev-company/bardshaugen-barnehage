/* Bårdshaugen · v-premium «Lun eksklusivitet» */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');

  /* 1 · «Åpent nå» – Europe/Oslo, man–fre 06:45–17:15 */
  const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Oslo', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const status = () => {
    const p = {}; fmt.formatToParts(new Date()).forEach(x => p[x.type] = x.value);
    const d = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(p.weekday);
    const m = +p.hour * 60 + +p.minute, O = 405, C = 1035, wd = d < 5;
    let open = false, t;
    if (wd && m >= O && m < C) { open = true; t = 'Åpent nå · stenger 17.15'; }
    else if (wd && m < O) t = 'Stengt · åpner 06.45';
    else if (d < 4 || d === 6) t = 'Stengt · åpner i morgen 06.45';
    else t = 'Stengt · åpner mandag 06.45';
    $$('[data-status]').forEach(el => {
      el.classList.toggle('is-open', open);
      $('.status__t', el).textContent = t;
      el.title = 'Tar ikke hensyn til helligdager og stengte dager';
    });
  };
  status(); setInterval(status, 30000);

  /* 2 · Meny */
  const btn = $('.menu-btn'), nav = $('#meny');
  const setMenu = o => { btn.setAttribute('aria-expanded', o); nav.classList.toggle('is-open', o); };
  btn.addEventListener('click', () => setMenu(btn.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); btn.focus(); } });

  /* 3 · Avdekking + løpende topptekst */
  const runN = $('.running__n'), runT = $('.running__t');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    $$('.rv').forEach(el => io.observe(el));
    const ro = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { runN.textContent = e.target.dataset.n; runT.textContent = e.target.dataset.label; }
    }), { rootMargin: '-45% 0px -54% 0px' });
    $$('[data-label]').forEach(el => ro.observe(el));
  } else $$('.rv').forEach(el => el.classList.add('is-in'));

  /* 4 · Avdeling → detalj (View Transitions, med vanlig bytte som reserve) */
  const vt = f => (document.startViewTransition && !reduce.matches) ? document.startViewTransition(f) : (f(), null);
  const done = (t, f) => t ? t.finished.finally(f) : f();
  $$('[data-dlg]').forEach(b => {
    const d = document.getElementById(b.dataset.dlg), art = $('.avd__art', b.closest('li')), dArt = $('.dlg__art', d);
    const close = () => {
      if (!d.open) return;
      dArt.style.viewTransitionName = 'avd';
      const t = vt(() => { dArt.style.viewTransitionName = ''; d.close(); art.style.viewTransitionName = 'avd'; });
      done(t, () => { art.style.viewTransitionName = ''; });
      b.focus();
    };
    b.addEventListener('click', () => {
      art.style.viewTransitionName = 'avd';
      const t = vt(() => { art.style.viewTransitionName = ''; d.showModal(); dArt.style.viewTransitionName = 'avd'; $('.dlg__close', d).focus(); });
      done(t, () => { dArt.style.viewTransitionName = ''; });
    });
    $('.dlg__close', d).addEventListener('click', close);
    d.addEventListener('cancel', e => { e.preventDefault(); close(); });
    d.addEventListener('click', e => { if (e.target === d) close(); });
  });

  /* 5 · Magnetiske knapper og mykt markørlys – kun mus, ikke redusert bevegelse */
  if (!fine.matches || reduce.matches) return;
  $$('.mag').forEach(el => {
    let r = null, raf = 0;
    el.addEventListener('pointerenter', () => { r = el.getBoundingClientRect(); el.style.transitionDuration = '.18s'; });
    el.addEventListener('pointermove', e => {
      if (!r) return;
      const x = Math.max(-6, Math.min(6, (e.clientX - r.left - r.width / 2) / r.width * 14));
      const y = Math.max(-6, Math.min(6, (e.clientY - r.top - r.height / 2) / r.height * 14));
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => { el.style.transform = `translate(${x}px,${y}px)`; });
    }, { passive: true });
    el.addEventListener('pointerleave', () => { r = null; cancelAnimationFrame(raf); el.style.transitionDuration = ''; el.style.transform = ''; });
  });

  const glow = $('.glow');
  let gx = 0, gy = 0, pending = false, on = false;
  addEventListener('pointermove', e => {
    gx = e.clientX; gy = e.clientY;
    const dark = !!(e.target.closest && e.target.closest('.dark'));
    if (dark !== on) { on = dark; glow.classList.toggle('on', on); }
    if (on && !pending) {
      pending = true;
      requestAnimationFrame(() => { glow.style.transform = `translate3d(${gx}px,${gy}px,0)`; pending = false; });
    }
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { on = false; glow.classList.remove('on'); });
})();
