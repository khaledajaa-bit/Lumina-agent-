// =========================================================
// Lumina Agent — site interactions
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileNav();
  initScrollReveal();
  initCounters();
  initCopyButton();
  initAmbientCanvas();
});

/* ---------- Header background on scroll ---------- */
function initHeaderScroll(){
  const header = document.getElementById('header');
  if(!header) return;
  const toggle = () => header.classList.toggle('scrolled', window.scrollY > 12);
  toggle();
  window.addEventListener('scroll', toggle, { passive:true });
}

/* ---------- Mobile nav toggle ---------- */
function initMobileNav(){
  const btn = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');
  if(!btn || !nav) return;

  btn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(isOpen));
    nav.style.cssText = isOpen
      ? 'display:flex;flex-direction:column;position:fixed;top:76px;left:0;right:0;background:rgba(6,10,7,0.97);backdrop-filter:blur(14px);padding:24px;gap:20px;border-bottom:1px solid var(--border);'
      : '';
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      nav.style.cssText = '';
      btn.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------- Scroll-triggered reveal ---------- */
function initScrollReveal(){
  const items = document.querySelectorAll('[data-reveal]');
  if(!items.length) return;

  if(!('IntersectionObserver' in window)){
    items.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold:0.15, rootMargin:'0px 0px -40px 0px' });

  items.forEach(el => observer.observe(el));
}

/* ---------- Animated stat counters ---------- */
function initCounters(){
  const stats = document.querySelectorAll('#hero-stats [data-count]');
  if(!stats.length) return;

  const animate = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();

    const formatNumber = (n) => {
      const fixed = n.toFixed(decimals);
      const parts = fixed.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    };

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = `${prefix}${formatNumber(value)}${suffix}`;
      if(progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if(!('IntersectionObserver' in window)){
    stats.forEach(animate);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        animate(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold:0.6 });

  stats.forEach(el => observer.observe(el));
}

/* ---------- Copy contract address ---------- */
function initCopyButton(){
  const btn = document.getElementById('copy-btn');
  const addressEl = document.getElementById('contract-address');
  if(!btn || !addressEl) return;

  btn.addEventListener('click', async () => {
    const text = addressEl.textContent.trim();
    try{
      await navigator.clipboard.writeText(text);
    }catch(err){
      const temp = document.createElement('textarea');
      temp.value = text;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
    }
    const original = btn.innerHTML;
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12l5 5L20 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    setTimeout(() => { btn.innerHTML = original; }, 1600);
  });
}

/* ---------- Ambient background glow (canvas) ---------- */
function initAmbientCanvas(){
  const canvas = document.getElementById('glow-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w, h, particles;

  const resize = () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  };

  const createParticles = (count) => {
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.4,
      vy: Math.random() * 0.12 + 0.03,
      alpha: Math.random() * 0.4 + 0.08
    }));
  };

  resize();
  createParticles(reduceMotion ? 0 : Math.min(60, Math.floor((w * h) / 24000)));
  window.addEventListener('resize', () => { resize(); createParticles(particles.length); });

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(57, 255, 136, ${p.alpha})`;
      ctx.fill();
      p.y -= p.vy;
      if(p.y < -10){ p.y = h + 10; p.x = Math.random() * w; }
    });
    if(!reduceMotion) requestAnimationFrame(draw);
  };

  if(particles.length) draw();
}
