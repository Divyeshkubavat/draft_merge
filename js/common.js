(function(){
  'use strict';

  // ---------- top page-load progress bar ----------
  const bar = document.getElementById('pageLoadBar');
  if (bar){
    requestAnimationFrame(() => { bar.style.width = '65%'; });
    window.addEventListener('load', () => {
      bar.style.width = '100%';
      setTimeout(() => bar.classList.add('done'), 300);
    });
  }

  // ---------- header scroll shadow ----------
  const siteHeader = document.getElementById('siteHeader');
  if (siteHeader){
    const onScroll = () => siteHeader.classList.toggle('scrolled', window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive:true });
    onScroll();
  }

  // ---------- brand click: scroll-top on home, navigate elsewhere ----------
  const logoHome = document.getElementById('logoHome');
  if (logoHome){
    logoHome.addEventListener('click', (e) => {
      const path = window.location.pathname;
      const isHome = path.endsWith('index.html') || path === '/' || path.endsWith('/');
      if (isHome){
        e.preventDefault();
        window.scrollTo({ top:0, behavior:'smooth' });
      }
      // otherwise let the page-transition handler (below) intercept the navigation
    });
  }

  // ---------- scroll reveal ----------
  const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  if (revealEls.length && 'IntersectionObserver' in window){
    revealEls.forEach(el => {
      if (el.classList.contains('reveal-stagger')){
        Array.from(el.children).forEach((child, i) => child.style.setProperty('--i', i));
      }
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold:0.12, rootMargin:'0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  // ---------- animated counters ----------
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length){
    const animateCount = (el) => {
      const target = parseFloat(el.dataset.count);
      const dur = 1000;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(step); else el.textContent = target;
      };
      requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window){
      const cio = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting){ animateCount(e.target); cio.unobserve(e.target); } });
      }, { threshold:0.6 });
      counters.forEach(c => cio.observe(c));
    } else {
      counters.forEach(c => { c.textContent = c.dataset.count; });
    }
  }

  // ---------- bench card tilt-on-hover (desktop only) ----------
  const benchCards = document.querySelectorAll('.bench-card');
  if (benchCards.length && window.matchMedia('(hover:hover) and (pointer:fine)').matches){
    benchCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(800px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  // ---------- smooth cross-page transition ----------
  const transitionOverlay = document.getElementById('pageTransition');
  if (transitionOverlay){
    document.querySelectorAll('a[data-transition]').forEach(a => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (!href || href.startsWith('#') || a.target === '_blank' || e.metaKey || e.ctrlKey) return;
        // let the home-scroll handler above run first for the logo-on-home case
        if (a.id === 'logoHome'){
          const path = window.location.pathname;
          const isHome = path.endsWith('index.html') || path === '/' || path.endsWith('/');
          if (isHome) return;
        }
        e.preventDefault();
        transitionOverlay.classList.add('active');
        setTimeout(() => { window.location.href = href; }, 280);
      });
    });
  }

  // ---------- dynamic dependency loader ----------
  window.loadScript = function(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        if (existing.getAttribute('data-loaded') === 'true') return resolve();
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)));
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.crossOrigin = 'anonymous';
      script.onload = () => { script.setAttribute('data-loaded', 'true'); resolve(); };
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  };

  window.ensureLib = async function(libName) {
    if (libName === 'pdfjsLib') {
      if (!window.pdfjsLib) {
        await window.loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
      }
      if (window.pdfjsLib && !window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }
      return window.pdfjsLib;
    }
    if (libName === 'PDFLib') {
      if (!window.PDFLib) {
        await window.loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js');
      }
      return window.PDFLib;
    }
    if (libName === 'JSZip') {
      if (!window.JSZip) {
        await window.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
      }
      return window.JSZip;
    }
    if (libName === 'Tesseract') {
      if (!window.webTesseract && !window.Tesseract) {
        await window.loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5.0.4/dist/tesseract.min.js');
      }
      return window.Tesseract;
    }
    if (libName === 'FFmpeg') {
      if (!window.FFmpeg) {
        await window.loadScript('https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.11.6/dist/ffmpeg.min.js');
      }
      return window.FFmpeg;
    }
  };
})();

