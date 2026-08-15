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

  // ---------- bench slider active state & auto-center ----------
  const curPath = window.location.pathname;
  let activeFound = false;
  document.querySelectorAll('.bs-item').forEach(item => {
    const bench = item.getAttribute('data-bench');
    const isHome = bench === 'home' && (curPath.endsWith('index.html') || curPath === '/' || curPath.endsWith('/'));
    const isMatch = isHome || (bench && curPath.includes(bench));
    if (isMatch && !activeFound) {
      item.classList.add('active');
      activeFound = true;
      setTimeout(() => {
        try { item.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }); } catch(e) {}
      }, 100);
    }
  });

  // ---------- global Ctrl+K / Cmd+K search shortcut ----------
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      const searchInput = document.getElementById('centralSearchInput');
      if (searchInput) {
        e.preventDefault();
        searchInput.scrollIntoView({ behavior:'smooth', block:'center' });
        searchInput.focus();
      }
    }
  });

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
    }, { threshold:0.08, rootMargin:'0px 0px -20px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  // ---------- animated counters (TASK 2) ----------
  const counters = document.querySelectorAll('[data-count-to], [data-count]');
  if (counters.length){
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animateCount = (el) => {
      const target = parseFloat(el.getAttribute('data-count-to') || el.dataset.count);
      const prefix = el.getAttribute('data-prefix') || '';
      const suffix = el.getAttribute('data-suffix') || '';
      if (isReduced) {
        el.textContent = prefix + target + suffix;
        return;
      }
      const dur = 900;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        const cur = Math.round(target * eased);
        el.textContent = prefix + cur + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = prefix + target + suffix;
      };
      requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window){
      const cio = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting){
            animateCount(e.target);
            cio.unobserve(e.target);
          }
        });
      }, { threshold:0.4 });
      counters.forEach(c => cio.observe(c));
    } else {
      counters.forEach(c => animateCount(c));
    }
  }

  // ---------- dark mode toggle & persistence (TASK 8) ----------
  const getStoredTheme = () => {
    try { return localStorage.getItem('mergio_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); }
    catch(e) { return 'light'; }
  };
  const setPageTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('mergio_theme', theme); } catch(e) {}
  };
  setPageTheme(getStoredTheme());

  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn){
    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      setPageTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // ---------- whole-window drag feedback (TASK 4) ----------
  let dragDepth = 0;
  window.addEventListener('dragenter', (e) => {
    dragDepth++;
    if (e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files')) {
      document.body.classList.add('drag-active');
    }
  });
  window.addEventListener('dragleave', () => {
    dragDepth--;
    if (dragDepth <= 0) {
      dragDepth = 0;
      document.body.classList.remove('drag-active');
    }
  });
  window.addEventListener('drop', () => {
    dragDepth = 0;
    document.body.classList.remove('drag-active');
  });

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
    transitionOverlay.classList.remove('active');
    window.addEventListener('pageshow', () => { transitionOverlay.classList.remove('active'); });
    window.addEventListener('load', () => { transitionOverlay.classList.remove('active'); });

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
        setTimeout(() => { window.location.href = href; }, 240);
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

  // --- Onboarding ---
  (function initOnboarding() {
    if (localStorage.getItem('mergio_onboarded')) return;
    const steps = [
      { title: 'Search 150+ Tools', desc: 'Press Ctrl+K or type in the search bar to instantly find any tool — from PDF merge to video compression.' },
      { title: 'Explore by Category', desc: 'Browse seven specialized benches: PDF, Image, Video, Audio, Text, Converters, and Utility.' },
      { title: 'Your Files Stay Private', desc: 'Every tool runs 100% in your browser. Nothing is uploaded — ever. Your files never leave this tab.' }
    ];
    let current = 0;
    
    const overlay = document.createElement('div');
    overlay.className = 'onboard-overlay';
    overlay.innerHTML = `
      <div class="onboard-card">
        <h3 class="onboard-title"></h3>
        <p class="onboard-desc"></p>
        <div class="onboard-dots">${steps.map((_,i) => `<span data-i="${i}"></span>`).join('')}</div>
        <div class="onboard-actions">
          <button class="onboard-skip">Skip</button>
          <button class="onboard-next">Next</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    
    function show(i) {
      overlay.querySelector('.onboard-title').textContent = steps[i].title;
      overlay.querySelector('.onboard-desc').textContent = steps[i].desc;
      overlay.querySelectorAll('.onboard-dots span').forEach((d, idx) => d.classList.toggle('active', idx === i));
      overlay.querySelector('.onboard-next').textContent = i === steps.length - 1 ? 'Get Started' : 'Next';
    }
    
    function close() {
      overlay.classList.remove('active');
      localStorage.setItem('mergio_onboarded', '1');
      setTimeout(() => overlay.remove(), 300);
    }
    
    overlay.querySelector('.onboard-skip').addEventListener('click', close);
    overlay.querySelector('.onboard-next').addEventListener('click', () => {
      current++;
      if (current >= steps.length) return close();
      show(current);
    });
    
    show(0);
    requestAnimationFrame(() => overlay.classList.add('active'));
  })();

  // --- PWA Install Prompt ---
  (function initPWAInstall() {
    let deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      // Show banner after 2nd visit or after a successful conversion
      const visits = parseInt(localStorage.getItem('mergio_visits') || '0', 10) + 1;
      localStorage.setItem('mergio_visits', String(visits));
      if (visits >= 2 && !localStorage.getItem('mergio_pwa_dismissed')) showInstallBanner();
    });
    
    function showInstallBanner() {
      if (document.querySelector('.pwa-banner')) return;
      const banner = document.createElement('div');
      banner.className = 'pwa-banner';
      banner.innerHTML = `
        <div class="pwa-banner-text">
          <h4>Install Mergio</h4>
          <p>Add to home screen for offline access to 150+ tools</p>
        </div>
        <button class="pwa-install">Install</button>
        <button class="pwa-dismiss" aria-label="Dismiss">&times;</button>
      `;
      document.body.appendChild(banner);
      requestAnimationFrame(() => requestAnimationFrame(() => banner.classList.add('show')));
      
      banner.querySelector('.pwa-install').addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          deferredPrompt = null;
        }
        banner.classList.remove('show');
        setTimeout(() => banner.remove(), 400);
      });
      
      banner.querySelector('.pwa-dismiss').addEventListener('click', () => {
        localStorage.setItem('mergio_pwa_dismissed', '1');
        banner.classList.remove('show');
        setTimeout(() => banner.remove(), 400);
      });
    }
    window._showInstallBanner = showInstallBanner;
  })();

  // --- Privacy-first analytics events (lightweight) ---
  window.mergioTrack = function(event, data) {
    // Lightweight local tracking - stores in sessionStorage for the history panel
    // Can be extended to send to Plausible/Umami later
    try {
      const log = JSON.parse(sessionStorage.getItem('mergio_events') || '[]');
      log.push({ event, data, ts: Date.now() });
      if (log.length > 200) log.splice(0, log.length - 200);
      sessionStorage.setItem('mergio_events', JSON.stringify(log));
    } catch(e) {}
  };
})();

