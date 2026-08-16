(function(){
  'use strict';

  // ---------- per-tool icon + accent lookup ----------
  const TOOL_ICON = {
    'merge-pdf':'i-merge', 'split-pdf':'i-split', 'rotate-pdf':'i-rotate', 'compress-pdf':'i-compress',
    'pdf-to-jpg':'i-pdf-jpg', 'jpg-to-pdf':'i-jpg-pdf',
    'compress-image':'i-compress', 'resize-image':'i-resize', 'crop-image':'i-crop', 'convert-image':'i-convert',
    'rotate-image':'i-flip', 'watermark-image':'i-watermark', 'image-to-pdf':'i-jpg-pdf', 'bulk-compress':'i-stack',
    'compress-video':'i-compress', 'convert-video':'i-convert', 'trim-video':'i-trim', 'video-to-mp3':'i-music',
    'video-to-gif':'i-gif', 'mute-video':'i-mute',
    'extract-text-image':'i-ocr', 'extract-text-pdf':'i-text-extract',
    // Video new tools
    'video-editor':'i-editor', 'add-image-to-video':'i-overlay', 'resize-video':'i-resize',
    'screen-recorder':'i-screen', 'add-text-to-video':'i-text-add', 'loop-video':'i-loop',
    'text-to-speech':'i-tts', 'remove-logo-from-video':'i-delogo', 'change-video-volume':'i-volume',
    'merge-videos':'i-merge', 'crop-video':'i-crop', 'change-video-speed':'i-speed',
    'rotate-video':'i-rotate', 'stabilize-video':'i-stabilize', 'add-audio-to-video':'i-add-audio',
    'flip-video':'i-flip', 'video-recorder':'i-camera',
    // Audio tools
    'trim-audio':'i-trim', 'change-pitch':'i-pitch', 'voice-recorder':'i-camera',
    'change-volume':'i-volume', 'equalizer':'i-equalizer', 'audio-joiner':'i-join',
    'change-speed':'i-speed', 'reverse-audio':'i-reverse',
    // PDF new tools
    'add-page-numbers':'i-page-num', 'word-to-pdf':'i-word', 'pdf-to-word':'i-word',
    'pdf-to-excel':'i-excel', 'excel-to-pdf':'i-excel', 'unlock-pdf':'i-unlock',
    'protect-pdf':'i-lock', 'pdf-to-png':'i-pdf-jpg', 'png-to-pdf':'i-jpg-pdf',
    'ppt-to-pdf':'i-ppt', 'pdf-to-html':'i-html',
    // Converter tools
    'audio-converter':'i-music', 'document-converter':'i-doc', 'ebook-converter':'i-ebook',
    'video-converter':'i-video', 'font-converter':'i-font', 'archive-extractor':'i-archive',
    'image-converter':'i-image', 'archive-converter':'i-archive',
    // Utility tools
    'qr-generator':'i-qr', 'qr-scanner':'i-qr', 'barcode-generator':'i-barcode',
    'barcode-scanner':'i-barcode', 'password-generator':'i-shield', 'file-hash':'i-hash',
    'file-metadata':'i-doc', 'file-size-calc':'i-bolt', 'color-picker':'i-color',
    'color-converter':'i-color'
  };
  const CATEGORY_CLASS = { 'PDF Bench':'cat-pdf', 'Image Bench':'cat-image', 'Video Bench':'cat-video', 'Text Bench':'cat-text', 'Audio Bench':'cat-audio', 'Converters Bench':'cat-converter', 'Utility Bench':'cat-utility' };

  // ---------- tool registry lookup ----------
  function findTool(id){
    return (window.TOOL_DEFS||[]).find(t => t.id === id);
  }
  // ---------- Central Search Logic ----------
  const csInput = document.getElementById('centralSearchInput');
  const csClearBtn = document.getElementById('csClearBtn');
  const csGrid = document.getElementById('searchResultsGrid');
  if (csInput && csGrid) {
    csInput.addEventListener('input', () => {
      const q = csInput.value.toLowerCase().trim();
      if (!q) {
        csGrid.classList.add('hidden');
        if (csClearBtn) csClearBtn.classList.add('hidden');
        return;
      }
      if (csClearBtn) csClearBtn.classList.remove('hidden');
      
      const tools = window.TOOL_DEFS || [];
      const matches = tools.filter(t => 
        (t.title && t.title.toLowerCase().includes(q)) || 
        (t.desc && t.desc.toLowerCase().includes(q)) || 
        (t.id && t.id.toLowerCase().includes(q)) || 
        (t.category && t.category.toLowerCase().includes(q))
      );
      
      csGrid.innerHTML = '';
      if (matches.length === 0) {
        csGrid.innerHTML = '<div style="padding:12px;color:#666;text-align:center;">No tools found</div>';
      } else {
        matches.forEach(t => {
          const iconId = TOOL_ICON[t.id] || 'i-bolt';
          const catClass = CATEGORY_CLASS[t.category] || '';
          
          const a = document.createElement('a');
          a.className = 'search-result-card ' + catClass;
          a.href = '#';
          a.innerHTML = `
            <div class="sr-icon"><svg><use href="#${iconId}"/></svg></div>
            <div class="sr-content">
              <h4>${t.title}</h4>
              <p>${t.desc}</p>
            </div>
          `;
          a.addEventListener('click', (e) => {
            e.preventDefault();
            csGrid.classList.add('hidden');
            if (typeof openWorkspace === 'function') {
              openWorkspace(t.id);
            } else {
              // fallback if openWorkspace isn't available on the page
              const page = (t.category || '').split(' ')[0].toLowerCase() + '.html';
              window.location.href = page;
            }
          });
          csGrid.appendChild(a);
        });
      }
      csGrid.classList.remove('hidden');
    });

    if (csClearBtn) {
      csClearBtn.addEventListener('click', () => {
        csInput.value = '';
        csInput.dispatchEvent(new Event('input'));
        csInput.focus();
      });
    }

    // Hide search when clicking outside
    document.addEventListener('click', (e) => {
      if (!csInput.contains(e.target) && !csGrid.contains(e.target) && (!csClearBtn || !csClearBtn.contains(e.target))) {
        csGrid.classList.add('hidden');
      }
    });
    csInput.addEventListener('focus', () => {
      if (csInput.value.trim()) csGrid.classList.remove('hidden');
    });
  }

  // ---------- workspace elements ----------
  const overlay = document.getElementById('workspaceOverlay');
  if (!overlay) return; // page has no workspace (e.g. the home page)

  const workspace = document.getElementById('workspace');
  const wsTile = document.getElementById('wsTile');
  const wsEyebrow = document.getElementById('wsEyebrow');
  const wsTitle = document.getElementById('wsTitle');
  const wsDesc = document.getElementById('wsDesc');
  const dropzone = document.getElementById('dropzone');
  const dzHint = document.getElementById('dzHint');
  const fileInput = document.getElementById('fileInput');
  const fileListEl = document.getElementById('fileList');
  const optRow = document.getElementById('optRow');
  const runBtn = document.getElementById('runBtn');
  const runBtnLabel = document.getElementById('runBtnLabel');
  const statusBox = document.getElementById('statusBox');
  const statusText = document.getElementById('statusText');
  const statusPct = document.getElementById('statusPct');
  const statusTip = document.getElementById('statusTip');
  const progressFill = document.getElementById('progressFill');
  const errorBox = document.getElementById('errorBox');
  const errorText = document.getElementById('errorText');
  const resultBox = document.getElementById('resultBox');
  const resultFiles = document.getElementById('resultFiles');

  if (statusBox) statusBox.setAttribute('aria-live', 'polite');
  if (errorBox) { errorBox.setAttribute('role', 'alert'); errorBox.setAttribute('aria-live', 'assertive'); }

  let currentTool = null;
  let currentFiles = [];
  let currentOpts = {};

  function resetWorkspaceState(){
    currentFiles = [];
    currentOpts = {};
    fileListEl.innerHTML = '';
    statusBox.classList.remove('show');
    errorBox.classList.remove('show');
    resultBox.classList.remove('show');
    progressFill.style.width = '0%';
    fileInput.value = '';
    if (statusTip){ statusTip.classList.remove('show'); statusTip.textContent = ''; }
  }

  function fmtSize(bytes){
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' KB';
    return (bytes/1024/1024).toFixed(1) + ' MB';
  }

  function renderFileList(){
    fileListEl.innerHTML = '';
    currentFiles.forEach((f, idx) => {
      const row = document.createElement('div');
      row.className = 'file-row';
      row.innerHTML = `<span class="fico"><svg viewBox="0 0 24 24"><use href="#i-upload"/></svg></span><span class="fname">${f.name}</span><span class="fsize">${fmtSize(f.size)}</span><button class="frm" aria-label="Remove file"><svg viewBox="0 0 24 24"><use href="#i-close"/></svg></button>`;
      row.querySelector('.frm').addEventListener('click', () => {
        currentFiles.splice(idx,1);
        renderFileList();
        updateRunState();
      });
      fileListEl.appendChild(row);
    });
  }

  function updateRunState(){
    const min = currentTool.noFile ? 0 : (currentTool.minFiles || 1);
    if (currentFiles.length >= min){
      runBtn.disabled = false;
      runBtnLabel.textContent = 'Run';
    } else {
      runBtn.disabled = true;
      runBtnLabel.textContent = min > 1 ? `Add at least ${min} files` : 'Add a file first';
    }
  }

  function addFiles(fileListObj){
    const arr = Array.from(fileListObj);
    if (currentTool.multiple){
      currentFiles = currentFiles.concat(arr);
    } else {
      currentFiles = arr.slice(0,1);
    }
    renderFileList();
    updateRunState();
  }

  // ---------- option rendering ----------
  const OPTION_TIPS = {
    'quality': 'Lower = smaller file, higher = better quality. 75 is a good balance.',
    'dpi': '72 for web, 150 for documents, 300 for print.',
    'bitrate': '128 kbps for podcasts, 320 kbps for music.',
    'width': 'Output width in pixels. Height adjusts automatically to keep aspect ratio.',
    'height': 'Output height in pixels.',
    'format': 'Choose the output file format.',
    'compression': 'Higher compression = smaller file but may reduce quality.',
    'resolution': 'Higher resolution = larger file but more detail.',
    'scale': 'Resize factor. 0.5 = half size, 2 = double size.',
    'pages': 'Specify page numbers or ranges (e.g., 1-3, 5, 7-9).',
    'speed': 'Playback speed multiplier. 1.0 = normal speed.',
    'volume': 'Audio volume adjustment.'
  };

  function renderOptions(){
    optRow.innerHTML = '';
    (currentTool.options||[]).forEach(opt => {
      currentOpts[opt.id] = opt.default;
      const field = document.createElement('div');
      field.className = 'opt-field';

      const tipText = OPTION_TIPS[opt.id.toLowerCase()] || OPTION_TIPS[(opt.label || '').toLowerCase()];
      const helpHtml = tipText ? `<span class="opt-help" tabindex="0" aria-label="Help">?<span class="opt-tip">${tipText}</span></span>` : '';

      if (opt.type === 'range'){
        field.innerHTML = `<label>${opt.label}${helpHtml} <span class="range-val">${opt.default}${opt.suffix||''}</span></label>
          <input type="range" min="${opt.min}" max="${opt.max}" step="${opt.step}" value="${opt.default}">`;
        const input = field.querySelector('input');
        const val = field.querySelector('.range-val');
        input.addEventListener('input', () => {
          currentOpts[opt.id] = input.value;
          val.textContent = input.value + (opt.suffix||'');
        });
      }
      else if (opt.type === 'select'){
        const choices = opt.choices.map(c => `<option value="${c.value}" ${c.value===opt.default?'selected':''}>${c.label}</option>`).join('');
        field.innerHTML = `<label>${opt.label}${helpHtml}</label><select>${choices}</select>`;
        field.querySelector('select').addEventListener('change', (e) => { currentOpts[opt.id] = e.target.value; });
      }
      else if (opt.type === 'chips'){
        const chipsHtml = opt.choices.map(c => `<button type="button" class="chip ${c.value===opt.default?'active':''}" data-val="${c.value}">${c.label}</button>`).join('');
        field.innerHTML = `<label>${opt.label}${helpHtml}</label><div class="chip-group">${chipsHtml}</div>`;
        field.querySelectorAll('.chip').forEach(chip => {
          chip.addEventListener('click', () => {
            field.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentOpts[opt.id] = chip.dataset.val;
          });
        });
      }
      else if (opt.type === 'text'){
        field.innerHTML = `<label>${opt.label}${helpHtml}</label><input type="text" value="${opt.default||''}" placeholder="${opt.placeholder||''}">`;
        field.querySelector('input').addEventListener('input', (e) => { currentOpts[opt.id] = e.target.value; });
      }
      optRow.appendChild(field);
    });
  }

  // ---------- open / close workspace ----------
  function openWorkspace(toolId){
    const tool = findTool(toolId);
    if (!tool){ console.error('Unknown tool', toolId); return; }
    currentTool = tool;
    resetWorkspaceState();
    wsEyebrow.textContent = tool.category;
    wsTitle.textContent = tool.title;
    wsDesc.textContent = tool.desc;
    dzHint.textContent = tool.hint || 'Choose a file';
    fileInput.multiple = !!tool.multiple;
    fileInput.accept = tool.accept || '';

    const iconId = TOOL_ICON[tool.id] || 'i-merge';
    wsTile.innerHTML = `<svg class="icon"><use href="#${iconId}"/></svg>`;
    Object.values(CATEGORY_CLASS).forEach(c => workspace.classList.remove(c));
    workspace.classList.add(CATEGORY_CLASS[tool.category] || 'cat-pdf');

    renderOptions();
    updateRunState();
    if (currentTool.noFile) {
      runBtn.disabled = false;
      runBtnLabel.textContent = 'Run';
    }
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    history.pushState({ tool: toolId }, '', '#' + toolId);
    
    const ws = document.getElementById('workspace');
    if (ws) {
      ws.setAttribute('role', 'dialog');
      ws.setAttribute('aria-modal', 'true');
      ws.setAttribute('aria-labelledby', 'wsTitle');
    }
    
    // Focus trap
    if (ws) {
      const focusable = ws.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable.length) focusable[0].focus();
      ws._trapHandler = function(e) {
        if (e.key !== 'Tab') return;
        const f = ws.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      };
      ws.addEventListener('keydown', ws._trapHandler);
    }
    
    if (window.mergioTrack) window.mergioTrack('tool_opened', { tool: toolId });
    
    requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('open')));
  }

  function closeWorkspace(){
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    
    const wsEl = document.getElementById('workspace');
    if (wsEl && wsEl._trapHandler) {
      wsEl.removeEventListener('keydown', wsEl._trapHandler);
      wsEl._trapHandler = null;
    }
    if (wsEl) { wsEl.removeAttribute('role'); wsEl.removeAttribute('aria-modal'); }
    
    setTimeout(() => {
      overlay.classList.add('hidden');
      if (location.hash) history.replaceState(null, '', location.pathname);
    }, 220);
  }

  document.getElementById('closeWorkspace').addEventListener('click', closeWorkspace);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeWorkspace(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !overlay.classList.contains('hidden')) closeWorkspace(); });

  document.querySelectorAll('.tool-card').forEach(card => {
    card.addEventListener('click', () => openWorkspace(card.dataset.tool));
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openWorkspace(card.dataset.tool); } });
  });

  // ---------- dropzone ----------
  if (dropzone) {
    dropzone.setAttribute('role', 'button');
    dropzone.setAttribute('tabindex', '0');
    dropzone.setAttribute('aria-label', 'Upload or drop files here');
    dropzone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); dropzone.click(); }
    });
  }
  dropzone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => { if (fileInput.files.length) addFiles(fileInput.files); });
  ['dragenter','dragover'].forEach(evt => dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.add('drag'); }));
  ['dragleave','drop'].forEach(evt => dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.remove('drag'); }));
  dropzone.addEventListener('drop', (e) => { if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files); });

  // ---------- progress, with rotating "still working" tips on long waits ----------
  const GENERAL_TIPS = [
    'Still faster than opening five browser tabs of ads.',
    'Your file never leaves this tab — no server involved.',
    'Big files just take a little longer, hang tight.',
    'Good things take a few seconds.'
  ];
  const ENGINE_TIPS = [
    'Downloading the video engine — about 25MB, first time only.',
    'This only happens once per visit — every tool after this is instant.',
    'Almost done setting things up…'
  ];
  let tipTimer = null;
  let tipIndex = 0;

  function clearTip(){
    if (tipTimer){ clearTimeout(tipTimer); tipTimer = null; }
    if (statusTip){ statusTip.classList.remove('show'); }
  }

  function scheduleTip(label){
    if (!statusTip) return;
    clearTip();
    tipIndex = 0;
    const pool = /engine/i.test(label || '') ? ENGINE_TIPS : GENERAL_TIPS;
    const show = () => {
      statusTip.textContent = pool[tipIndex % pool.length];
      statusTip.classList.add('show');
      tipIndex++;
      tipTimer = setTimeout(show, 2600);
    };
    tipTimer = setTimeout(show, 1800);
  }

  function progress(pct, label){
    statusBox.classList.add('show');
    statusText.textContent = label || 'Working…';
    statusPct.textContent = Math.max(0,Math.min(100,pct)) + '%';
    progressFill.style.width = Math.max(0,Math.min(100,pct)) + '%';
    const pf = document.getElementById('progressFill');
    if (pf) {
      pf.setAttribute('role', 'progressbar');
      pf.setAttribute('aria-valuemin', '0');
      pf.setAttribute('aria-valuemax', '100');
      pf.setAttribute('aria-valuenow', String(Math.round(pct)));
    }
    scheduleTip(label);
  }

  // ---------- run ----------
  runBtn.addEventListener('click', async () => {
    errorBox.classList.remove('show');
    resultBox.classList.remove('show');
    runBtn.disabled = true;
    runBtn.classList.add('running');
    const originalLabel = runBtnLabel.textContent;
    runBtnLabel.textContent = 'Working…';
    progress(3, 'Starting');
    try {
      const results = await currentTool.run(currentFiles, currentOpts, progress);
      clearTip();
      progress(100, 'Done');
      resultFiles.innerHTML = '';

      // Check if first result is an image and can show before/after comparison slider (TASK 6)
      const firstResult = results[0];
      const isImgResult = firstResult && firstResult.blob && firstResult.blob.type.startsWith('image/') && currentFiles[0] && currentFiles[0].type.startsWith('image/');

      if (isImgResult && currentTool.id.includes('image')) {
        const origUrl = URL.createObjectURL(currentFiles[0]);
        const resUrl = URL.createObjectURL(firstResult.blob);
        
        const compareDiv = document.createElement('div');
        compareDiv.className = 'compare-container';
        compareDiv.innerHTML = `
          <img class="compare-after" src="${resUrl}" alt="After">
          <div class="compare-before-wrap" id="compareBeforeWrap">
            <img class="compare-before" src="${origUrl}" alt="Before">
          </div>
          <div class="compare-slider-handle" id="compareHandle">
            <svg viewBox="0 0 24 24"><path d="M8 12h8M8 12l3-3M8 12l3 3M16 12l-3-3M16 12l-3 3" fill="none" stroke="currentColor" stroke-width="2"/></svg>
          </div>
          <span class="compare-label lbl-before">Original</span>
          <span class="compare-label lbl-after">Processed</span>
        `;

        let isSliding = false;
        const setPos = (clientX) => {
          const rect = compareDiv.getBoundingClientRect();
          const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
          const pct = (x / rect.width) * 100;
          const wrap = compareDiv.querySelector('#compareBeforeWrap');
          const handle = compareDiv.querySelector('#compareHandle');
          if (wrap) wrap.style.width = pct + '%';
          if (handle) handle.style.left = pct + '%';
        };

        compareDiv.addEventListener('mousedown', (e) => { isSliding = true; setPos(e.clientX); });
        window.addEventListener('mousemove', (e) => { if (isSliding) setPos(e.clientX); });
        window.addEventListener('mouseup', () => { isSliding = false; });
        compareDiv.addEventListener('touchstart', (e) => { isSliding = true; setPos(e.touches[0].clientX); }, { passive:true });
        window.addEventListener('touchmove', (e) => { if (isSliding) setPos(e.touches[0].clientX); }, { passive:true });
        window.addEventListener('touchend', () => { isSliding = false; });

        resultFiles.appendChild(compareDiv);
      }

      results.forEach(r => {
        const url = URL.createObjectURL(r.blob);
        
        if (typeof historyManager !== 'undefined') {
          historyManager.add({
            toolTitle: currentTool.title,
            outputName: r.name,
            size: r.blob.size > 1048576 ? (r.blob.size / 1048576).toFixed(1) + ' MB' : (r.blob.size / 1024).toFixed(0) + ' KB',
            blobUrl: url,
            icon: '✓',
            catColor: 'var(--success-soft)',
            catAccent: 'var(--success)',
            timeAgo: 'just now'
          });
        }
        
        const a = document.createElement('a');
        a.className = 'dl';
        a.href = url;
        a.download = r.name;
        a.innerHTML = `<span>${r.name} · <span class="dl-size">${fmtSize(r.blob.size)}</span></span><span class="dl-arrow">Download <svg viewBox="0 0 24 24"><use href="#i-download"/></svg></span>`;
        
        const shareBtn = document.createElement('button');
        shareBtn.className = 'result-share';
        shareBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg> Share';
        shareBtn.style.marginLeft = '8px';
        shareBtn.addEventListener('click', async () => {
          const shareData = {
            title: 'Processed with Mergio',
            text: `✅ ${currentTool.title}: ${r.name} (${fmtSize(r.blob.size)}) — processed 100% in-browser at mergio.vercel.app`,
            url: 'https://mergio.vercel.app/#' + currentTool.id
          };
          if (navigator.share) {
            try { await navigator.share(shareData); } catch(e) {}
          } else {
            await navigator.clipboard.writeText(shareData.text + '\\n' + shareData.url);
            shareBtn.textContent = '✓ Copied!';
            setTimeout(() => shareBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg> Share', 2000);
          }
        });
        
        const wrap = document.createElement('div');
        wrap.style.display = 'flex';
        wrap.style.alignItems = 'center';
        wrap.style.gap = '8px';
        wrap.appendChild(a);
        wrap.appendChild(shareBtn);
        resultFiles.appendChild(wrap);
      });
      if (window.mergioTrack) window.mergioTrack('tool_completed', { tool: currentTool.id, category: currentTool.category });
      
      const rTitle = resultBox.querySelector('.r-title');
      if (rTitle) {
        rTitle.innerHTML = `<svg class="success-check-svg" viewBox="0 0 24 24"><circle class="success-check-circle" cx="12" cy="12" r="9"/><path class="success-check-path" d="m8 12.5 2.5 2.5L16 9.5"/></svg> Ready for download`;
      }
      resultBox.classList.add('show');
    } catch (err){
      console.error(err);
      clearTip();
      errorText.textContent = 'Something went wrong: ' + (err && err.message ? err.message : 'the file could not be processed. Try a different file or a smaller one.');
      
      const existingActions = document.getElementById('errorBox').querySelector('.error-actions');
      if (existingActions) existingActions.remove();
      
      const errActions = document.createElement('div');
      errActions.className = 'error-actions';
      errActions.innerHTML = `
        <button class="error-retry">↻ Retry</button>
        <button class="error-alt">Try Different Settings</button>
      `;
      errActions.querySelector('.error-retry').addEventListener('click', () => {
        document.getElementById('errorBox').style.display = 'none';
        document.getElementById('runBtn')?.click();
      });
      errActions.querySelector('.error-alt').addEventListener('click', () => {
        document.getElementById('errorBox').style.display = 'none';
        document.querySelector('.opt-field select, .opt-field input[type=range]')?.focus();
      });
      document.getElementById('errorBox').appendChild(errActions);
      
      errorBox.classList.add('show');
      statusBox.classList.remove('show');
      if (window.mergioTrack) window.mergioTrack('tool_error', { tool: currentTool.id, error: String(err).slice(0, 200) });
    } finally {
      runBtn.classList.remove('running');
      runBtn.disabled = false;
      runBtnLabel.textContent = originalLabel;
      updateRunState();
    }
  });

  // --- Conversion History (delegated to window.historyManager in common.js) ---
  
  // URL Hash Routing logic
  window.addEventListener('popstate', (e) => {
    if (document.getElementById('workspaceOverlay')?.classList.contains('open') || 
        document.getElementById('workspace')?.style.display === 'flex' ||
        document.getElementById('workspaceOverlay')?.style.display !== 'none') {
      closeWorkspace();
    }
  });

  // Auto-open tool from hash on page load
  window.addEventListener('load', () => {
    const hash = location.hash.slice(1);
    if (hash && window.TOOL_DEFS) {
      const tool = window.TOOL_DEFS.find(t => t.id === hash);
      if (tool) setTimeout(() => openWorkspace(hash), 500);
    }
  });
})();
