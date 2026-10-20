// Bårdshaugen · v-animert «Reisen opp til Sæterlia»
(() => {
  const d = document, H = d.documentElement;
  const $ = (s, c = d) => c.querySelector(s), $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)');
  const SDA = window.CSS && CSS.supports('animation-timeline: view()');
  H.classList.add('js');
  if (!SDA) H.classList.add('no-sda');

  /* Mobile menu */
  const mb = $('.menu-btn'), nav = $('#meny');
  const setMenu = o => { mb.setAttribute('aria-expanded', o); nav.classList.toggle('open', o); };
  mb.addEventListener('click', () => setMenu(mb.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  d.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); mb.focus(); } });

  /* «Åpent nå»: real clock, Europe/Oslo, Mon–Fri 06:45–17:15 */
  const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Oslo', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  function openNow() {
    const parts = fmt.formatToParts(new Date()), g = t => parts.find(p => p.type === t).value;
    const wd = g('weekday'), m = +g('hour') * 60 + +g('minute');
    const weekday = !['Sat', 'Sun'].includes(wd), open = weekday && m >= 405 && m < 1035;
    const txt = open ? 'Åpent nå – stenger kl. 17.15'
      : 'Stengt nå – åpner ' + (weekday && m < 405 ? 'i dag' : (!weekday || wd === 'Fri') ? 'mandag' : 'i morgen') + ' kl. 06.45';
    $$('[data-open]').forEach(el => {
      el.classList.toggle('is-open', open); el.classList.toggle('is-closed', !open);
      $('.open-txt', el).textContent = txt;
    });
  }
  openNow(); setInterval(openNow, 30000);

  /* Journey: progress p (0–1) from cached offsets; never reads layout while scrolling */
  const J = $('.journey'), clock = $('.jclock b');
  let top = 0, len = 1, P = 0, lastMin = -1, phase = 'morning', ticking = false;
  function measure() {
    top = J.getBoundingClientRect().top + scrollY;
    len = Math.max(1, J.offsetHeight - innerHeight);
    update();
  }
  function update() {
    ticking = false;
    P = Math.min(1, Math.max(0, (scrollY - top) / len));
    if (!SDA) J.style.setProperty('--p', P.toFixed(4));
    const min = 405 + Math.round(P * 126) * 5;
    if (min !== lastMin) {
      lastMin = min;
      clock.textContent = String(min / 60 | 0).padStart(2, '0') + '.' + String(min % 60).padStart(2, '0');
    }
    const ph = P < .25 ? 'morning' : P < .86 ? 'day' : 'dusk';
    if (ph !== phase) J.dataset.phase = phase = ph;
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', measure);
  addEventListener('load', measure);
  measure();

  /* Reveal fallback when scroll-driven animations are unsupported */
  if (!SDA && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    $$('.reveal').forEach(el => io.observe(el));
  }

  /* Sound: off by default, AudioContext only after the user turns it on */
  const sb = $('.sound');
  let ac, master, windGain, noise, on = false;
  function initAudio() {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    master = ac.createGain(); master.gain.value = .55; master.connect(ac.destination);
    noise = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const ch = noise.getChannelData(0);
    for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource(), lp = ac.createBiquadFilter();
    src.buffer = noise; src.loop = true; lp.type = 'lowpass'; lp.frequency.value = 380;
    windGain = ac.createGain(); windGain.gain.value = 0;
    src.connect(lp).connect(windGain).connect(master); src.start();
    setInterval(ambience, 1500);
  }
  function ambience() {
    if (!on) return;
    windGain.gain.setTargetAtTime(.03 + P * .16, ac.currentTime, 1);
    if (P < .7 && Math.random() < .75 - P) bird();
  }
  function env(g, t, peak, dur) {
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + .015);
    g.gain.exponentialRampToValueAtTime(.0008, t + dur);
  }
  function bird() {
    const t0 = ac.currentTime + Math.random() * .5, n = 2 + (Math.random() * 3 | 0), f = 2300 + Math.random() * 1500;
    for (let i = 0; i < n; i++) {
      const o = ac.createOscillator(), g = ac.createGain(), t = t0 + i * .12;
      o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 1.45, t + .07);
      env(g, t, .045, .1); o.connect(g).connect(master); o.start(t); o.stop(t + .12);
    }
  }
  function tone(f, when, dur = .35, vol = .12) {
    const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + when;
    o.type = 'triangle'; o.frequency.value = f; env(g, t, vol, dur);
    o.connect(g).connect(master); o.start(t); o.stop(t + dur + .05);
  }
  function plink(base) { if (on) [0, 4, 7, 12].forEach((s, i) => tone(base * 2 ** (s / 12), i * .08)); }
  function whoosh(sec) {
    if (!on) return;
    const s = ac.createBufferSource(), bp = ac.createBiquadFilter(), g = ac.createGain(), t = ac.currentTime;
    s.buffer = noise; bp.type = 'bandpass'; bp.Q.value = 1.2;
    bp.frequency.setValueAtTime(500, t); bp.frequency.exponentialRampToValueAtTime(2600, t + sec * .8);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.35, t + sec * .7); g.gain.exponentialRampToValueAtTime(.001, t + sec + .3);
    s.connect(bp).connect(g).connect(master); s.start(t); s.stop(t + sec + .4);
    tone(784, sec * .5, .5, .07); tone(1046, sec * .5 + .12, .6, .07);
  }
  sb.addEventListener('click', () => {
    on = !on;
    sb.setAttribute('aria-pressed', on);
    $('.sound-state', sb).textContent = on ? 'på' : 'av';
    if (on) { if (!ac) initAudio(); ac.resume(); plink(523); } else if (ac) ac.suspend();
  });

  /* Mascots: tap tricks */
  $$('.mascot').forEach(b => b.addEventListener('click', () => {
    b.classList.remove('trick'); void b.offsetWidth; b.classList.add('trick');
    plink(+b.dataset.note);
    clearTimeout(b._t); b._t = setTimeout(() => b.classList.remove('trick'), 1400);
  }));

  /* Department detail: <dialog> + View Transitions (plain swap as fallback) */
  const dlg = $('#detail'), art = $('.detail-art', dlg), copy = $('.detail-copy', dlg), dh = $('#detail-h');
  let opener = null, srcArt = null, srcBoard = null;
  const vt = fn => (d.startViewTransition && !RM.matches) ? d.startViewTransition(fn) : (fn(), null);
  const name = (el, n) => { if (el) el.style.viewTransitionName = n; };
  function openDept(btn) {
    const a = btn.closest('.dept');
    opener = btn; srcArt = $('.mascot', a); srcBoard = a.closest('.board');
    name(srcArt, 'dept-art'); name(srcBoard, 'dept-board');
    vt(() => {
      name(srcArt, ''); name(srcBoard, '');
      dh.textContent = a.dataset.name;
      const tag = d.createElement('p'); tag.className = 'tag'; tag.textContent = $('.plank span', a).textContent;
      copy.replaceChildren(tag, ...$$('.dept-copy > *', a).map(n => n.cloneNode(true)));
      art.replaceChildren($('svg', srcArt).cloneNode(true));
      name(art, 'dept-art'); name($('.detail-in', dlg), 'dept-board');
      dlg.showModal();
    });
  }
  function closeDept() {
    const t = vt(() => {
      name(art, ''); name($('.detail-in', dlg), '');
      dlg.close();
      name(srcArt, 'dept-art'); name(srcBoard, 'dept-board');
    });
    const done = () => { name(srcArt, ''); name(srcBoard, ''); opener && opener.focus(); };
    t ? t.finished.then(done, done) : done();
  }
  $$('.more').forEach(b => b.addEventListener('click', () => openDept(b)));
  $('.close', dlg).addEventListener('click', closeDept);
  dlg.addEventListener('cancel', e => { e.preventDefault(); closeDept(); });
  dlg.addEventListener('click', e => { if (e.target === dlg) closeDept(); });

  /* Sledge run («Ake ned!») along the slope path */
  const run = $('#sled-run'), L = run.getTotalLength(), sleds = $$('.sled'), ake = $('#ake'), st = $('#ake-status');
  let busy = false;
  function sledAt(t) {
    const l = L * t, q = run.getPointAtLength(l),
      a = run.getPointAtLength(Math.max(0, l - 3)), b = run.getPointAtLength(Math.min(L, l + 3));
    const ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI - 180;
    const tr = `translate(${q.x.toFixed(1)} ${q.y.toFixed(1)}) rotate(${ang.toFixed(1)}) scale(1.6)`;
    sleds.forEach(s => s.setAttribute('transform', tr));
  }
  sledAt(0);
  function finish() {
    st.textContent = 'Wheee! Akebrettet suste helt ned bakken.';
    setTimeout(() => {
      sleds.forEach(s => s.classList.add('gone'));
      setTimeout(() => { sledAt(0); sleds.forEach(s => s.classList.remove('gone')); busy = false; ake.textContent = 'Ake en gang til!'; }, RM.matches ? 0 : 450);
    }, 1600);
  }
  ake.addEventListener('click', () => {
    if (busy) return;
    busy = true; st.textContent = '';
    if (RM.matches) { whoosh(.6); sledAt(1); finish(); return; }
    const D = 2600, t0 = performance.now();
    whoosh(D / 1000);
    (function frame(now) {
      const k = Math.min(1, (now - t0) / D);
      sledAt(k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);
      k < 1 ? requestAnimationFrame(frame) : finish();
    })(t0);
  });
})();
