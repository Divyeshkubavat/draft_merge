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
    'image-converter':'i-image', 'archive-converter':'i-archive'
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
  function renderOptions(){
    optRow.innerHTML = '';
    (currentTool.options||[]).forEach(opt => {
      currentOpts[opt.id] = opt.default;
      const field = document.createElement('div');
      field.className = 'opt-field';

      if (opt.type === 'range'){
        field.innerHTML = `<label>${opt.label} <span class="range-val">${opt.default}${opt.suffix||''}</span></label>
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
        field.innerHTML = `<label>${opt.label}</label><select>${choices}</select>`;
        field.querySelector('select').addEventListener('change', (e) => { currentOpts[opt.id] = e.target.value; });
      }
      else if (opt.type === 'chips'){
        const chipsHtml = opt.choices.map(c => `<button type="button" class="chip ${c.value===opt.default?'active':''}" data-val="${c.value}">${c.label}</button>`).join('');
        field.innerHTML = `<label>${opt.label}</label><div class="chip-group">${chipsHtml}</div>`;
        field.querySelectorAll('.chip').forEach(chip => {
          chip.addEventListener('click', () => {
            field.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentOpts[opt.id] = chip.dataset.val;
          });
        });
      }
      else if (opt.type === 'text'){
        field.innerHTML = `<label>${opt.label}</label><input type="text" value="${opt.default||''}" placeholder="${opt.placeholder||''}">`;
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
    requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('open')));
  }

  function closeWorkspace(){
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => overlay.classList.add('hidden'), 220);
  }

  document.getElementById('closeWorkspace').addEventListener('click', closeWorkspace);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeWorkspace(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !overlay.classList.contains('hidden')) closeWorkspace(); });

  document.querySelectorAll('.tool-card').forEach(card => {
    card.addEventListener('click', () => openWorkspace(card.dataset.tool));
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openWorkspace(card.dataset.tool); } });
  });

  // ---------- dropzone ----------
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
      results.forEach(r => {
        const url = URL.createObjectURL(r.blob);
        const a = document.createElement('a');
        a.className = 'dl';
        a.href = url;
        a.download = r.name;
        a.innerHTML = `<span>${r.name} · ${fmtSize(r.blob.size)}</span><span class="dl-arrow">Download <svg viewBox="0 0 24 24"><use href="#i-download"/></svg></span>`;
        resultFiles.appendChild(a);
      });
      resultBox.classList.add('show');
    } catch (err){
      console.error(err);
      clearTip();
      errorText.textContent = 'Something went wrong: ' + (err && err.message ? err.message : 'the file could not be processed. Try a different file or a smaller one.');
      errorBox.classList.add('show');
      statusBox.classList.remove('show');
    } finally {
      runBtn.classList.remove('running');
      runBtn.disabled = false;
      runBtnLabel.textContent = originalLabel;
      updateRunState();
    }
  });

})();
