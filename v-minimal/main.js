// v-minimal: «Åpent nå» (Europe/Oslo) + fallback for the scroll-drawn line.
(() => {
  const d = document, root = d.documentElement;
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const OPEN = 405, CLOSE = 1035; // 06:45, 17:15

  function status() {
    const p = {};
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Oslo', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date()).forEach(x => p[x.type] = x.value);
    const wd = DAYS.indexOf(p.weekday), m = +p.hour * 60 + +p.minute, open = wd > -1 && m >= OPEN && m < CLOSE;
    const t = open ? 'Åpent nå · stenger 17.15'
      : 'Stengt nå · åpner ' + (wd > -1 && m < OPEN ? '' : wd > -1 && wd < 4 ? 'i morgen ' : 'mandag ') + '06.45';
    root.dataset.open = open ? 1 : 0;
    d.querySelectorAll('[data-status]').forEach(e => e.textContent = t);
    if (open) {
      root.style.setProperty('--now', ((m - OPEN) / (CLOSE - OPEN)).toFixed(4));
      const n = d.querySelector('[data-now]');
      if (n) n.textContent = 'Nå ' + p.hour + '.' + p.minute;
    }
  }
  status();
  setInterval(status, 60000);

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Quiet reveals (title wipe, bars, department line icons), triggered once.
  const rv = d.querySelectorAll('.h2,.bars,.dept');
  if ('IntersectionObserver' in window) {
    root.classList.add('rv');
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -10% 0px' });
    rv.forEach(e => io.observe(e));
  }

  // The line itself is pure CSS (scroll-driven). Without support: a rAF fallback.
  if (window.CSS && CSS.supports('animation-timeline: view()')) return;
  root.classList.add('nt');
  const segs = [...d.querySelectorAll('.seg')], fin = d.querySelector('.pan--fin');
  let box = [], vh = 0, max = 0, raf = 0;
  const clamp = v => Math.max(0, Math.min(1, v));
  function draw() {
    raf = 0;
    const tip = scrollY + vh * .7;
    segs.forEach((s, i) => s.style.setProperty('--p', clamp((tip - box[i][0]) / box[i][1]).toFixed(4)));
    if (fin) fin.style.setProperty('--p', clamp(1 - (max - scrollY) / (vh * .75)).toFixed(4));
  }
  function measure() { // layout is read here only, never in the scroll handler
    vh = innerHeight; max = root.scrollHeight - vh;
    box = segs.map(s => { const r = s.getBoundingClientRect(); return [r.top + scrollY, r.height]; });
    draw();
  }
  addEventListener('scroll', () => raf || (raf = requestAnimationFrame(draw)), { passive: true });
  addEventListener('resize', measure, { passive: true });
  addEventListener('load', measure);
  measure();
})();
