/* Bårdshaugen Barnehage – v-maximal «Barnehagens store bildebok» */
(() => {
  const d = document, H = d.documentElement;
  const $ = (s, c = d) => c.querySelector(s), $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)');
  H.classList.add('js');

  /* ---- Åpent nå (Europe/Oslo, man–fre 06:45–17:15) ---- */
  const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Oslo', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  function status() {
    const p = {};
    fmt.formatToParts(new Date()).forEach(x => p[x.type] = x.value);
    const wd = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].indexOf(p.weekday), t = +p.hour * 60 + +p.minute;
    const open = wd > -1 && t >= 405 && t < 1035;
    const when = wd > -1 && t < 405 ? 'kl. 06.45' : wd > -1 && wd < 4 ? 'i morgen kl. 06.45' : 'mandag kl. 06.45';
    $$('[data-status]').forEach(e => {
      const short = e.dataset.status === 'short';
      e.textContent = open ? (short ? 'Åpent nå!' : 'Åpent nå – vi stenger kl. 17.15') : (short ? 'Stengt nå' : 'Stengt nå – vi åpner ' + when);
      const s = e.closest('.status'); s.classList.add('is-live'); s.classList.toggle('is-open', open);
    });
  }
  status(); setInterval(status, 60000);

  /* ---- Lyd (av som standard, Web Audio) ---- */
  let ac = null, snd = false;
  const sb = $('#sound');
  sb.addEventListener('click', () => {
    snd = !snd;
    sb.setAttribute('aria-pressed', snd);
    $('.sound__state', sb).textContent = snd ? 'på' : 'av';
    if (snd && !ac) { const A = window.AudioContext || window.webkitAudioContext; if (A) ac = new A(); }
    if (ac && ac.state === 'suspended') ac.resume();
    plink([659, 880, 1319]);
  });
  function plink(notes, gap = .085, type = 'triangle') {
    if (!snd || !ac) return;
    const t0 = ac.currentTime + .01;
    notes.forEach((f, i) => {
      const o = ac.createOscillator(), g = ac.createGain(), t = t0 + i * gap;
      o.type = type;
      o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(.0001, t);
      g.gain.exponentialRampToValueAtTime(.16, t + .012);
      g.gain.exponentialRampToValueAtTime(.0001, t + .32);
      o.connect(g).connect(ac.destination);
      o.start(t); o.stop(t + .36);
    });
  }

  /* ---- Maskoter: triks ved trykk ---- */
  const tricks = {
    fox: [1100, [784, 988, 1175, 1568]],
    bear: [1750, [196, 247, 294, 392, 294], .14, 'sine'],
    ski: [1300, [523, 659, 784, 1047, 1319]]
  };
  $$('.mascot').forEach(b => b.addEventListener('click', () => {
    if (b.classList.contains('trick')) return;
    const [ms, notes, gap, type] = tricks[b.dataset.m];
    b.classList.add('trick');
    plink(notes, gap, type);
    setTimeout(() => b.classList.remove('trick'), RM.matches ? 1400 : ms);
  }));

  /* ---- Øyne som følger markør / finger / helling ---- */
  const eyes = $$('.mascot svg.m').map(s => ({ s, p: $$('.pupil', s).map(p => ({ p, x: +p.dataset.x, y: +p.dataset.y, r: +p.dataset.r })) }));
  let tx = 0, ty = 0, raf = 0;
  const aim = (x, y) => { tx = x; ty = y; if (!raf) raf = requestAnimationFrame(look); };
  function look() {
    raf = 0;
    if (RM.matches) return;
    eyes.forEach(({ s, p }) => {
      const r = s.getBoundingClientRect(), k = r.width / 240;
      if (r.bottom < 0 || r.top > innerHeight) return;
      p.forEach(e => {
        const dx = tx - (r.left + e.x * k), dy = ty - (r.top + e.y * k), dist = Math.hypot(dx, dy) || 1;
        const m = Math.min(1, dist / (140 * k)) * e.r;
        e.p.style.transform = `translate(${(dx / dist * m).toFixed(2)}px,${(dy / dist * m).toFixed(2)}px)`;
      });
    });
  }
  addEventListener('pointermove', e => aim(e.clientX, e.clientY), { passive: true });
  addEventListener('pointerdown', e => aim(e.clientX, e.clientY), { passive: true });

  const tb = $('#tilt');
  if (tb && 'DeviceOrientationEvent' in window && matchMedia('(pointer: coarse)').matches) {
    tb.hidden = false;
    tb.addEventListener('click', async () => {
      if (tb.getAttribute('aria-pressed') === 'true') return;
      try {
        const D = window.DeviceOrientationEvent;
        if (typeof D.requestPermission === 'function' && await D.requestPermission() !== 'granted') return;
      } catch (e) { return; }
      addEventListener('deviceorientation', e => {
        if (e.gamma == null) return;
        aim(innerWidth / 2 + e.gamma * 14, innerHeight / 3 + (e.beta - 40) * 12);
      }, { passive: true });
      tb.setAttribute('aria-pressed', 'true');
    });
  }

  /* ---- Avdelinger: kort → detalj med View Transitions ---- */
  const dlg = $('#sheet'), dArt = $('#sheet-art'), dT = $('#sheet-t'), dTag = $('#sheet-tag'), dTxt = $('#sheet-txt');
  let opener = null, card = null;
  const vt = f => (!RM.matches && d.startViewTransition) ? d.startViewTransition(f) : (f(), null);
  const names = (art, title, on) => { art.style.viewTransitionName = on ? 'avd-art' : ''; title.style.viewTransitionName = on ? 'avd-title' : ''; };
  $$('.avd-open').forEach(b => b.addEventListener('click', () => {
    opener = b; card = b.closest('.avd');
    const art = $('.avd-art', card), h = $('.avd-name', card);
    names(art, h, 1);
    const t = vt(() => {
      names(art, h, 0);
      dArt.innerHTML = art.innerHTML;
      dT.textContent = h.textContent;
      dTag.textContent = $('.avd-tag', card).textContent;
      dTxt.innerHTML = $('.avd-more', card).innerHTML;
      dlg.dataset.k = card.dataset.k;
      dlg.showModal();
      names(dArt, dT, 1);
    });
    const done = () => names(dArt, dT, 0);
    t ? t.finished.finally(done) : done();
  }));
  function shut() {
    if (!dlg.open) return;
    const art = card && $('.avd-art', card), h = card && $('.avd-name', card);
    if (card) names(dArt, dT, 1);
    const t = vt(() => {
      names(dArt, dT, 0);
      dlg.close();
      if (card) names(art, h, 1);
    });
    const done = () => { if (card) names(art, h, 0); };
    t ? t.finished.finally(done) : done();
    if (opener) opener.focus();
  }
  $('#sheet-x').addEventListener('click', shut);
  dlg.addEventListener('cancel', e => { e.preventDefault(); shut(); });
  dlg.addEventListener('click', e => { if (e.target === dlg) shut(); });

  /* ---- Lekeplassen: klistremerker som kan dras (mus, touch, piltaster) ---- */
  const field = $('#field');
  let z = 1;
  const stks = $$('.stk', field).map(s => {
    const st = { s, x: 0, y: 0 };
    let sx, sy, ox, oy, pend = 0, drag = false;
    const place = () => {
      const L = s.offsetLeft, T = s.offsetTop;
      st.x = Math.max(-L, Math.min(field.clientWidth - L - s.offsetWidth, st.x));
      st.y = Math.max(-T, Math.min(field.clientHeight - T - s.offsetHeight, st.y));
      s.style.translate = `${st.x}px ${st.y}px`;
    };
    st.place = place;
    s.addEventListener('pointerdown', e => {
      drag = true; s.setPointerCapture(e.pointerId);
      sx = e.clientX; sy = e.clientY; ox = st.x; oy = st.y;
      s.classList.add('drag'); s.style.zIndex = ++z;
    });
    s.addEventListener('pointermove', e => {
      if (!drag) return;
      st.x = ox + e.clientX - sx; st.y = oy + e.clientY - sy;
      if (!pend) pend = requestAnimationFrame(() => { pend = 0; place(); });
    });
    const end = () => { if (!drag) return; drag = false; s.classList.remove('drag'); plink([1047, 1568], .06); };
    s.addEventListener('pointerup', end);
    s.addEventListener('pointercancel', end);
    s.addEventListener('keydown', e => {
      const k = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
      if (!k) return;
      e.preventDefault();
      const step = e.shiftKey ? 48 : 12;
      st.x += k[0] * step; st.y += k[1] * step; s.style.zIndex = ++z;
      place();
    });
    return st;
  });
  $('#tidy').addEventListener('click', () => {
    stks.forEach(st => { st.x = st.y = 0; st.place(); });
    plink([1319, 1047, 784, 659], .07);
  });
  addEventListener('resize', () => stks.forEach(st => st.place()), { passive: true });

  /* ---- Pop-up-bok: elementer reiser seg når de kommer inn i bildet ---- */
  const pops = $$('.pop');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -6% 0px' });
    pops.forEach(e => io.observe(e));
  } else pops.forEach(e => e.classList.add('is-in'));
})();
