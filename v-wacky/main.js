// Bårdshaugen v-wacky: googly eyes, mascots, snowballs, polaroid string, sledge game, sound, open-now.
const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches, R = Math.random, raf = requestAnimationFrame;
const DE = document.documentElement;
DE.classList.add('js');

// ---- sound (off by default, Web Audio only after opt-in) ----
let ac, snd = 0;
const tone = (a, b, d, t = 'sine', v = .14, w = 0) => {
  if (!snd) return;
  const n = ac.currentTime + w, o = ac.createOscillator(), g = ac.createGain();
  o.type = t; o.frequency.setValueAtTime(a, n); o.frequency.exponentialRampToValueAtTime(b, n + d);
  g.gain.setValueAtTime(v, n); g.gain.exponentialRampToValueAtTime(.001, n + d);
  o.connect(g).connect(ac.destination); o.start(n); o.stop(n + d + .02);
};
const boing = () => { tone(120, 560, .12, 'sine', .2); tone(560, 130, .32, 'sine', .16, .11); };
const plink = () => { tone(1320, 1150, .2, 'triangle'); tone(1980, 1700, .22, 'triangle', .08, .09); };
const bonk = () => { tone(170, 45, .4, 'square', .07); };
const sb = $('#snd');
sb.onclick = () => {
  snd ^= 1;
  if (snd && !ac) ac = new (window.AudioContext || window.webkitAudioContext)();
  sb.setAttribute('aria-pressed', !!snd);
  plink();
};

// ---- open now (Europe/Oslo, Mon–Fri 06:45–17:15) ----
const P = {};
new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Oslo', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
  .formatToParts(new Date()).forEach(p => P[p.type] = p.value);
const wd = 'MonTueWedThuFriSatSun'.indexOf(P.weekday) / 3, mn = P.hour * 60 + +P.minute, isOpen = wd < 5 && mn >= 405 && mn < 1035;
$$('[data-open]').forEach(e => {
  e.textContent = isOpen ? 'Åpent nå! Vi stenger kl. 17.15'
    : 'Stengt nå. Vi åpner ' + (wd < 5 && mn < 405 ? 'i dag' : wd < 4 || wd > 5 ? 'i morgen' : 'mandag') + ' kl. 06.45';
  e.parentNode.classList.add(isOpen ? 'is-open' : 'is-closed');
});

// ---- googly eyes: one rAF-throttled pointer handler, one CSS var pair per eye group ----
if (!RM) {
  const groups = $$('.eyes');
  let px = innerWidth / 2, py = innerHeight / 3, q = 0;
  const look = () => {
    q = 0;
    const rs = groups.map(g => g.getBoundingClientRect());
    rs.forEach((b, i) => {
      if (b.bottom < -50 || b.top > innerHeight + 50) return;
      const dx = px - b.left - b.width / 2, dy = py - b.top - b.height / 2, d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 120);
      groups[i].style.setProperty('--x', (dx / d * k).toFixed(2));
      groups[i].style.setProperty('--y', (dy / d * k).toFixed(2));
    });
  };
  const mv = e => { px = e.clientX; py = e.clientY; if (!q) { q = 1; raf(look); } };
  addEventListener('pointermove', mv, { passive: true });
  addEventListener('pointerdown', mv, { passive: true });
}

// ---- mascots ----
const bub = $('#bubble'), cnt = {};
const LINES = {
  fox: ['Ta-daa! Et salto!', 'Ett salto til? Greit da.', 'Reven er litt svimmel nå.', 'Salto nummer mange. Applaus, takk!'],
  bear: ['BRØØØL! (Et veldig vennlig brøl.)', 'Bjørnen ville bare si hei.', 'Brøl nummer tre. Fortsatt vennlig.', 'Bjørnen trenger en liten lur nå.'],
  ski: ['Wiiiii! Til Sæterlia og tilbake!', 'Skiløperen glemte bremsene igjen.', 'Hei igjen! Var borte et lite øyeblikk.', 'Ny rekord i hjemmebakken!']
};
$$('.mascot').forEach(m => m.onclick = () => {
  const k = m.dataset.m, i = cnt[k] = (cnt[k] || 0) + 1;
  bub.textContent = LINES[k][(i - 1) % 4];
  k == 'bear' ? bonk() : boing();
  if (!RM) { m.classList.remove('go'); void m.offsetWidth; m.classList.add('go'); }
});
document.addEventListener('animationend', e => { const g = e.target.closest('.go'); g && e.animationName != 'idle' && g.classList.remove('go'); });

// ---- IKKE TRYKK! snowballs (capped, cleaned up) ----
let balls = 0, presses = 0;
const DONT = ['Neeei! Nå har du sluppet løs snøballene.', 'Du trykket IGJEN? Vi sa jo ikke trykk.', 'Ok, vi gir oss. Trykk så mye du vil.'];
$('#dont').onclick = () => {
  presses++;
  const msg = $('#dontmsg');
  if (RM) {
    $('#pile').hidden = false;
    msg.textContent = presses < 2 ? 'Du trykket likevel! Her er en rolig haug med snøballer. De ligger helt stille, akkurat som du liker det.' : 'Haugen ligger der fortsatt. Snøballteller: ' + presses + '.';
    return;
  }
  msg.textContent = DONT[presses - 1] || 'Snøballteller: ' + presses + '. Reven er imponert.';
  plink();
  for (let i = 0; i < 14 && balls < 40; i++) {
    balls++;
    const s = document.createElement('i'), z = 14 + R() * 30, h = innerHeight + 90;
    s.className = 'ball';
    s.style.cssText = `left:${(R() * 94).toFixed(1)}%;width:${z | 0}px;height:${z | 0}px`;
    document.body.append(s);
    const a = s.animate([
      { transform: 'translate(0,-70px)' },
      { transform: `translate(${(R() - .5) * 140 | 0}px,${h * .75 | 0}px) rotate(${R() * 400 | 0}deg)`, offset: .78 },
      { transform: `translate(${(R() - .5) * 200 | 0}px,${h}px) rotate(${R() * 720 | 0}deg)` }
    ], { duration: 1300 + R() * 1500, delay: R() * 700, easing: 'cubic-bezier(.5,0,.9,.7)', fill: 'backwards' });
    a.onfinish = a.oncancel = () => { s.remove(); balls--; };
  }
};

// ---- polaroids on a string (drag the sag; spring back; "Rist snora" as keyboard alternative) ----
const lines = $$('.line').map(L => {
  const path = $('path', L), pols = $$('.pol', L), REST = 44;
  let cx = 150, cy = REST, vx = 0, vy = 0, drag = 0, sx, sy, W = 1, run = 0;
  const lay = () => {
    path.setAttribute('d', `M0 8Q${cx.toFixed(1)} ${cy.toFixed(1)} 300 8`);
    pols.forEach((p, i) => {
      const t = (i + .5) / pols.length, u = 1 - t,
        x = 2 * u * t * cx + t * t * 300, y = u * u * 8 + 2 * u * t * cy + t * t * 8,
        tx = 2 * u * cx + 2 * t * (300 - cx), ty = 2 * u * (cy - 8) + 2 * t * (8 - cy),
        a = Math.atan2(ty, tx * W / 300) * 57.3 * .55 - vx * .25;
      p.style.transform = `translate(${((x - 300 * t) * W / 300).toFixed(1)}px,${(y - 14).toFixed(1)}px) rotate(${a.toFixed(1)}deg)`;
    });
  };
  const spring = () => {
    vx = (vx + (150 - cx) * .07) * .9; vy = (vy + (REST - cy) * .07) * .9;
    cx += vx; cy += vy; lay();
    if (Math.abs(vx) + Math.abs(vy) + Math.abs(150 - cx) + Math.abs(REST - cy) > .3) raf(spring);
    else { cx = 150; cy = REST; vx = vy = 0; run = 0; lay(); }
  };
  const go = () => { if (RM) { cx = 150; cy = REST; vx = vy = 0; lay(); } else if (!run) { run = 1; raf(spring); } };
  W = L.clientWidth; lay();
  L.addEventListener('pointerdown', e => {
    if (!e.target.closest('.pol')) return;
    drag = 1; W = L.clientWidth; sx = e.clientX - (cx - 150) * W / 600; sy = e.clientY - (cy - REST) / 2;
    L.setPointerCapture(e.pointerId); tone(400, 300, .08, 'triangle', .06);
  });
  L.addEventListener('pointermove', e => {
    if (!drag) return;
    const ncx = Math.max(10, Math.min(290, 150 + (e.clientX - sx) * 600 / W)), ncy = Math.max(8, Math.min(230, REST + (e.clientY - sy) * 2));
    vx = ncx - cx; cx = ncx; cy = ncy; lay();
  });
  const up = () => { if (drag) { drag = 0; boing(); go(); } };
  L.addEventListener('pointerup', up); L.addEventListener('pointercancel', up);
  return { resize: () => { W = L.clientWidth; lay(); }, shake: d => { if (RM) return; vy = 26 + R() * 10; vx = (R() - .5) * 30 * d; go(); } };
});
addEventListener('resize', () => lines.forEach(l => l.resize()), { passive: true });
let shakes = 0;
$('#shake').onclick = () => {
  shakes++;
  lines.forEach((l, i) => setTimeout(() => l.shake(i % 2 ? -1 : 1), i * 120));
  boing();
  $('#shakemsg').textContent = RM ? 'Snora står stille (du har bedt om mindre bevegelse). Bildene later som ingenting skjedde.'
    : shakes < 2 ? 'Wheee! Snora er ristet.' : 'Snora er ristet ' + shakes + ' ganger. Klypene holder!';
};

// ---- scroll reveal fallback (only if scroll-driven animations are unsupported) ----
if (!RM && !CSS.supports('animation-timeline: view()') && 'IntersectionObserver' in window) {
  DE.classList.add('io');
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: .12 });
  $$('.pop').forEach(e => io.observe(e));
}

// ---- Akebakken: endless sledge game (never autoplays) ----
const cv = $('#sled'), g = cv.getContext('2d'), W = cv.clientWidth < 520 ? 400 : 640, H = 220, GY = 182;
cv.style.aspectRatio = W + '/' + H;
const dpr = Math.min(2, devicePixelRatio || 1);
cv.width = W * dpr; cv.height = H * dpr; g.scale(dpr, dpr);
const bGo = $('#go'), bP = $('#pause'), st = $('#gstat');
let gs = 0, y = 0, vy = 0, ob = [], dist = 0, sp = 0, best = 0, ann = 25, lt = 0, flakes = [];
for (let i = 0; i < 26; i++) flakes.push([R() * W, R() * GY, 1 + R() * 2.4]);
const shp = (f, w = 3) => { g.fillStyle = f; g.fill(); g.lineWidth = w; g.stroke(); };
const score = () => dist / 40 | 0;
function sled(x, b) {
  g.beginPath(); g.moveTo(x - 6, b - 4); g.lineTo(x + 46, b - 4); g.quadraticCurveTo(x + 58, b - 4, x + 56, b - 16); g.lineWidth = 4; g.stroke();
  g.beginPath(); g.roundRect(x, b - 18, 48, 10, 3); shp('#d6322b');
  g.beginPath(); g.moveTo(x + 10, b - 18); g.lineTo(x + 14, b - 42); g.lineTo(x + 34, b - 42); g.lineTo(x + 40, b - 18); g.closePath(); shp('#2e3f8f');
  g.beginPath(); g.moveTo(x + 20, b - 40); g.lineTo(x - 6 - (dist / 6 % 4), b - 34); g.lineTo(x - 4, b - 28); g.lineTo(x + 22, b - 32); g.closePath(); shp('#ffe14d');
  g.beginPath(); g.arc(x + 24, b - 54, 12, 0, 7); shp('#f6d39a');
  g.beginPath(); g.moveTo(x + 11, b - 56); g.bezierCurveTo(x + 10, b - 76, x + 38, b - 76, x + 37, b - 56); g.closePath(); shp('#d6322b');
  g.beginPath(); g.arc(x + 24, b - 74, 5, 0, 7); shp('#fff', 2.5);
  for (const e of [19, 30]) { g.beginPath(); g.arc(x + e, b - 54, 5, 0, 7); shp('#fff', 2); g.fillStyle = '#111'; g.beginPath(); g.arc(x + e + 2, b - 54 - vy * .15, 2.4, 0, 7); g.fill(); }
}
function tree(x) {
  g.beginPath(); g.rect(x - 4, GY - 12, 8, 12); shp('#9a6a45');
  g.beginPath(); g.moveTo(x, GY - 52); g.lineTo(x + 17, GY - 22); g.lineTo(x + 9, GY - 22); g.lineTo(x + 19, GY - 10); g.lineTo(x - 19, GY - 10); g.lineTo(x - 9, GY - 22); g.lineTo(x - 17, GY - 22); g.closePath(); shp('#7cbf3a');
  g.beginPath(); g.moveTo(x - 7, GY - 40); g.lineTo(x, GY - 52); g.lineTo(x + 7, GY - 40); g.closePath(); shp('#fff', 2.5);
}
function stone(x) {
  g.beginPath(); g.moveTo(x - 18, GY); g.bezierCurveTo(x - 20, GY - 22, x + 16, GY - 28, x + 18, GY); g.closePath(); shp('#a9acaa');
  g.beginPath(); g.moveTo(x - 9, GY - 15); g.quadraticCurveTo(x, GY - 23, x + 8, GY - 17); g.lineWidth = 3; g.strokeStyle = '#fff'; g.stroke(); g.strokeStyle = '#111';
}
function draw() {
  g.clearRect(0, 0, W, H); g.strokeStyle = '#111'; g.lineJoin = g.lineCap = 'round';
  const o = dist * .25 % 320;
  for (let i = -1; i < 3; i++) {
    const x = i * 320 - o;
    g.beginPath(); g.moveTo(x, GY); g.lineTo(x + 100, 74); g.lineTo(x + 140, 104); g.lineTo(x + 196, 56); g.lineTo(x + 330, GY); g.closePath(); shp('#c8d3f5');
    g.beginPath(); g.moveTo(x + 172, 76); g.lineTo(x + 196, 56); g.lineTo(x + 220, 78); g.lineTo(x + 206, 72); g.lineTo(x + 196, 82); g.lineTo(x + 186, 72); g.closePath(); shp('#fff', 2.5);
  }
  g.fillStyle = '#fff';
  for (const f of flakes) { if (gs == 1) { f[1] += f[2] * .5; f[0] -= sp * .3; if (f[1] > GY) f[1] = 0; if (f[0] < 0) f[0] = W; } g.beginPath(); g.arc(f[0], f[1], f[2], 0, 7); g.fill(); }
  g.beginPath(); g.rect(-5, GY, W + 10, 50); shp('#fff', 4);
  for (const b of ob) b.t ? tree(b.x) : stone(b.x);
  sled(80, GY - y);
  g.fillStyle = '#111'; g.font = '800 22px Brico,sans-serif'; g.textAlign = 'left';
  g.fillText('Poeng: ' + score(), 16, 32);
  if (best) { g.textAlign = 'right'; g.fillText('Rekord: ' + best, W - 16, 32); }
  if (gs != 1) {
    const m = gs == 0 ? 'Trykk «Start akinga»' : gs == 2 ? 'Pause' : 'Krasj! Prøv igjen?';
    g.textAlign = 'center'; g.font = '800 26px Brico,sans-serif';
    const tw = g.measureText(m).width + 36;
    g.beginPath(); g.roundRect(W / 2 - tw / 2, 66, tw, 46, 23); shp(gs == 3 ? '#ff8fc8' : '#ffe14d');
    g.fillStyle = '#111'; g.fillText(m, W / 2, 98);
  }
}
function loop(t) {
  if (gs != 1) return;
  const k = Math.min(3, (t - lt) / 16.7 || 1); lt = t;
  dist += sp * k; if (!RM) sp = Math.min(10, sp + .0016 * k);
  vy -= .62 * k; y += vy * k; if (y <= 0) { y = 0; vy = 0; }
  const last = ob[ob.length - 1];
  if (!last || last.x < W - 190 - R() * 260 - sp * 8) ob.push({ x: W + 30, t: R() < .45 });
  for (const b of ob) {
    b.x -= sp * k;
    const w = b.t ? 15 : 16, h = b.t ? 48 : 20;
    if (b.x - w < 128 && b.x + w > 84 && y < h - 4) return crash();
  }
  ob = ob.filter(b => b.x > -40);
  const s = score(); if (s >= ann) { st.textContent = 'Poeng: ' + s; ann += 25; }
  draw(); raf(loop);
}
function start() {
  y = vy = dist = 0; ob = []; sp = RM ? 3 : 4.4; ann = 25; gs = 1;
  bGo.firstChild.textContent = 'Start på nytt'; bP.disabled = false; bP.setAttribute('aria-pressed', 'false'); bP.textContent = 'Pause';
  st.textContent = 'Akinga er i gang! Hopp med mellomrom eller pil opp.';
  cv.focus({ preventScroll: true }); lt = performance.now(); raf(loop);
}
function pause() {
  if (gs == 1) { gs = 2; bP.setAttribute('aria-pressed', 'true'); bP.textContent = 'Fortsett'; st.textContent = 'Pause. Poeng: ' + score() + '.'; draw(); }
  else if (gs == 2) { gs = 1; bP.setAttribute('aria-pressed', 'false'); bP.textContent = 'Pause'; st.textContent = 'Videre nedover!'; lt = performance.now(); raf(loop); }
}
function crash() {
  gs = 3; best = Math.max(best, score()); bonk(); draw(); bP.disabled = true;
  st.textContent = 'Krasj! Du fikk ' + score() + ' poeng. Rekord: ' + best + '.';
  bGo.firstChild.textContent = 'Prøv igjen';
}
function jump() { if (gs == 1 && y == 0) { vy = RM ? 10.6 : 11.6; boing(); } }
bGo.onclick = start;
bP.onclick = pause;
cv.addEventListener('keydown', e => {
  if (e.key == ' ' || e.key == 'ArrowUp') { if (gs == 1) { e.preventDefault(); jump(); } }
  else if (e.key == 'p' || e.key == 'P') pause();
});
cv.addEventListener('pointerdown', () => gs == 1 ? jump() : gs != 2 && start());
document.addEventListener('visibilitychange', () => document.hidden && gs == 1 && pause());
document.fonts.ready.then(draw);
draw();
