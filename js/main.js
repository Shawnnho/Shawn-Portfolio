// Shawn's portfolio: interactions

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Typing line
(function () {
  const el = document.getElementById('word');
  const words = ['bring designs to life', 'build REST APIs', 'build mobile apps', 'lead dev teams', 'design databases', 'ship full-stack apps', 'debug the hard stuff'];
  if (reduced) return;
  let w = 0, i = words[0].length, deleting = true;
  function step() {
    const word = words[w];
    if (deleting) {
      i--; el.textContent = word.slice(0, i);
      if (i === 0) { deleting = false; w = (w + 1) % words.length; }
      setTimeout(step, 40);
    } else {
      const next = words[w]; i++; el.textContent = next.slice(0, i);
      if (i === next.length) { deleting = true; setTimeout(step, 1800); } else setTimeout(step, 70);
    }
  }
  setTimeout(step, 2200);
})();

// Reveal on scroll
(function () {
  const els = document.querySelectorAll('.reveal, .step');
  if (reduced || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.15 });
  els.forEach(e => io.observe(e));
})();

// Journey line draws as you scroll
(function () {
  const list = document.getElementById('journeyList');
  const fill = document.getElementById('journeyFill');
  function update() {
    const r = list.getBoundingClientRect();
    const vh = window.innerHeight;
    const progress = Math.min(1, Math.max(0, (vh * 0.7 - r.top) / r.height));
    fill.style.height = (progress * (r.height - 12)) + 'px';
  }
  if (reduced) { fill.style.height = 'calc(100% - 12px)'; return; }
  update(); window.addEventListener('scroll', update, { passive: true }); window.addEventListener('resize', update);
})();

// Tile spotlight + subtle 3D tilt (mouse only)
(function () {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!fine) return;
  document.querySelectorAll('.tile').forEach(tile => {
    tile.addEventListener('mousemove', e => {
      const r = tile.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      tile.style.setProperty('--mx', x + 'px');
      tile.style.setProperty('--my', y + 'px');
      if (!reduced) {
        const rx = ((y / r.height) - 0.5) * -4, ry = ((x / r.width) - 0.5) * 4;
        tile.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      }
    });
    tile.addEventListener('mouseleave', () => { tile.style.transform = ''; });
  });
})();

// Hero blobs follow the mouse a little
(function () {
  if (reduced || !window.matchMedia('(pointer: fine)').matches) return;
  const hero = document.querySelector('.hero');
  hero.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth - 0.5) * 40, y = (e.clientY / window.innerHeight - 0.5) * 40;
    hero.querySelectorAll('.blob').forEach((b, i) => { b.style.translate = `${x * (i + 1) * 0.6}px ${y * (i + 1) * 0.6}px`; });
  });
})();

// Nav: active section, sliding indicator, scroll progress, mobile menu
(function () {
  const bar = document.getElementById('topbar');
  const links = Array.from(document.querySelectorAll('#navLinks a'));
  const ind = document.getElementById('ind');
  const prog = document.getElementById('prog');
  const label = document.getElementById('curLabel');
  const menuBtn = document.getElementById('menuBtn');
  const icon = document.getElementById('menuIcon');
  // Which nav item each section lights up
  const map = { home: 'home', work: 'work', journey: 'journey', testimonial: 'journey', certs: 'certs', beyond: 'certs', skills: 'skills', hobbies: 'hobbies', resume: 'resume', contact: 'contact' };
  const names = { home: 'Home', work: 'Work', journey: 'Journey', certs: 'Certs', skills: 'Skills', hobbies: 'Hobbies', resume: 'Resume', contact: 'Contact' };
  let current = null;

  function moveInd(a) {
    if (!a || a.classList.contains('hire')) { ind.classList.remove('on'); return; }
    ind.style.left = a.offsetLeft + 'px';
    ind.style.width = a.offsetWidth + 'px';
    ind.classList.add('on');
  }
  function setActive(key) {
    if (key === current) return;
    current = key;
    let activeLink = null;
    links.forEach(a => {
      const on = a.dataset.sec === key;
      a.classList.toggle('active', on);
      if (on) { a.setAttribute('aria-current', 'true'); activeLink = a; } else a.removeAttribute('aria-current');
    });
    moveInd(activeLink);
    label.textContent = names[key] || '';
  }

  // Pick the section that crosses a line 35% down the screen
  const sections = Object.keys(map).map(id => document.getElementById(id)).filter(Boolean);
  function spy() {
    const line = window.innerHeight * 0.35;
    let found = sections[0];
    for (const sec of sections) { if (sec.getBoundingClientRect().top <= line) found = sec; }
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) found = document.getElementById('contact');
    setActive(map[found.id]);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
    bar.classList.toggle('scrolled', window.scrollY > 20);
  }
  let ticking = false;
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { spy(); ticking = false; }); } }, { passive: true });
  window.addEventListener('resize', () => { const a = links.find(l => l.classList.contains('active')); moveInd(a); spy(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => moveInd(links.find(l => l.classList.contains('active'))));
  spy();

  // Mobile menu
  function setMenu(open) {
    bar.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    icon.setAttribute('d', open ? 'M6 6l12 12M18 6L6 18' : 'M4 7h16M4 12h16M4 17h16');
  }
  menuBtn.addEventListener('click', () => setMenu(!bar.classList.contains('open')));
  links.forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', e => { if (!bar.contains(e.target)) setMenu(false); });
})();

// Show the floating home button after scrolling past the hero
(function () {
  const btn = document.getElementById('toHome');
  const onScroll = () => btn.classList.toggle('show', window.scrollY > window.innerHeight * 0.8);
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
})();

// Hero stats count up once
(function () {
  if (reduced) return;
  document.querySelectorAll('.stat strong[data-count]').forEach((el, i) => {
    const target = +el.dataset.count; let n = 0; el.textContent = '0';
    setTimeout(() => {
      const t = setInterval(() => { n++; el.textContent = n; if (n >= target) clearInterval(t); }, 900 / target);
    }, 600 + i * 150);
  });
})();

// Screenshot galleries + shared lightbox
(function () {
  const lb = document.getElementById('lightbox'), lbImg = document.getElementById('lbImg');
  let active = null; // gallery currently shown in the lightbox
  function makeGallery(g) {
    const tabs = Array.from(g.querySelectorAll('.g-tab'));
    const imgs = Array.from(g.querySelectorAll('.g-view img'));
    const path = g.querySelector('.g-path');
    const frame = g.querySelector('.g-frame');
    const api = { idx: 0, auto: null };
    api.show = function (i) {
      api.idx = (i + imgs.length) % imgs.length;
      imgs.forEach((im, k) => im.classList.toggle('on', k === api.idx));
      tabs.forEach((t, k) => t.setAttribute('aria-selected', String(k === api.idx)));
      path.textContent = imgs[api.idx].dataset.path || '';
      if (active === api && lb.classList.contains('open')) { const im = imgs[api.idx]; lbImg.src = im.src; lbImg.alt = im.alt; lb.classList.toggle('tall', im.getAttribute('height') / im.getAttribute('width') > 0.8); lb.scrollTop = 0; }
    };
    api.stop = () => { clearInterval(api.auto); api.auto = null; };
    api.frame = frame;
    tabs.forEach((t, k) => t.addEventListener('click', () => { api.stop(); api.show(k); }));
    if (!reduced && imgs.length > 1) api.auto = setInterval(() => api.show(api.idx + 1), 4500);
    frame.addEventListener('click', () => { api.stop(); active = api; lb.classList.toggle('single', imgs.length < 2); lb.classList.add('open'); api.show(api.idx); document.getElementById('lbClose').focus(); });
    return api;
  }
  document.querySelectorAll('[data-gallery]').forEach(makeGallery);
  const close = () => { lb.classList.remove('open'); if (active) active.frame.focus(); };
  document.getElementById('lbClose').addEventListener('click', close);
  document.getElementById('lbPrev').addEventListener('click', () => active && active.show(active.idx - 1));
  document.getElementById('lbNext').addEventListener('click', () => active && active.show(active.idx + 1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open') || !active) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') active.show(active.idx + 1);
    if (e.key === 'ArrowLeft') active.show(active.idx - 1);
  });
})();

// Keep the copyright year current
document.getElementById('year').textContent = new Date().getFullYear();

// Copy email
document.getElementById('copyEmail').addEventListener('click', async () => {
  const note = document.getElementById('copyNote');
  const email = document.getElementById('emailText').textContent;
  try { await navigator.clipboard.writeText(email); note.textContent = 'Email copied.'; }
  catch (e) { note.textContent = 'Copy didn’t work here. The address is ' + email; }
});
