/* PDF Bench merge, split, rotate, compress, convert.
 Uses pdf-lib (write/compose) and pdf.js (render pages to canvas). */

window.TOOL_DEFS = window.TOOL_DEFS || [];

async function fileToArrayBuffer(file){
 return await file.arrayBuffer();
}

async function renderPdfPageToCanvas(pdfjsDoc, pageNum, scale){
 const page = await pdfjsDoc.getPage(pageNum);
 const viewport = page.getViewport({ scale });
 const canvas = document.createElement('canvas');
 canvas.width = viewport.width;
 canvas.height = viewport.height;
 const ctx = canvas.getContext('2d');
 await page.render({ canvasContext: ctx, viewport }).promise;
 return canvas;
}

function canvasToBlob(canvas, type, quality){
 return new Promise(resolve => canvas.toBlob(resolve, type, quality));
}

(function() {
  const style = document.createElement('style');
  style.textContent = `
    .pdf-thumb-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 12px;
      padding: 16px;
      max-height: 400px;
      overflow-y: auto;
      background: var(--n-bg-alt, #eef1f7);
      border-radius: var(--radius-md, 10px);
      border: 1px solid var(--n-border, #e2e5ec);
      margin: 12px 0;
    }
    .pdf-thumb-card {
      position: relative;
      background: var(--n-surface, #fff);
      border-radius: var(--radius-sm, 6px);
      border: 2px solid var(--n-border, #e2e5ec);
      padding: 8px;
      cursor: grab;
      transition: border-color .15s, opacity .15s, transform .15s;
      user-select: none;
    }
    .pdf-thumb-card:active { cursor: grabbing; }
    .pdf-thumb-card.dragging { opacity: 0.5; transform: scale(0.95); }
    .pdf-thumb-card.drag-over { border-color: var(--accent, #2564cf); }
    .pdf-thumb-card.selected { border-color: var(--accent, #2564cf); background: var(--accent-soft, #eaf1fd); }
    .pdf-thumb-card.excluded { opacity: 0.35; }
    .pdf-thumb-card.excluded::after {
      content: '✕';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 2rem;
      color: var(--danger, #d13438);
      font-weight: 700;
    }
    .pdf-thumb-card canvas {
      width: 100%;
      height: auto;
      display: block;
      border-radius: 4px;
    }
    .pdf-thumb-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 6px;
    }
    .pdf-thumb-footer span {
      font-size: .75rem;
      font-weight: 600;
      color: var(--n-text-soft, #4b5160);
    }
    .pdf-thumb-actions {
      display: flex;
      gap: 4px;
    }
    .pdf-thumb-actions button {
      width: 24px;
      height: 24px;
      border: none;
      background: var(--n-bg-alt, #eef1f7);
      border-radius: 4px;
      cursor: pointer;
      font-size: .7rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--n-text-soft, #4b5160);
      transition: background .15s;
    }
    .pdf-thumb-actions button:hover {
      background: var(--accent-soft, #eaf1fd);
      color: var(--accent, #2564cf);
    }
    .pdf-thumb-status {
      padding: 8px 16px;
      font-size: .82rem;
      color: var(--n-text-soft);
      text-align: center;
    }
  `;
  document.head.appendChild(style);
})();

async function renderPageThumbnails(file, container, config = {}) {
  const { mode = 'rearrange' } = config; 
  const bytes = await fileToArrayBuffer(file);
  const pdfjsLib = await window.ensureLib("pdfjsLib");
  const doc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
  const total = doc.numPages;
  
  container.innerHTML = '';
  
  const statusEl = document.createElement('div');
  statusEl.className = 'pdf-thumb-status';
  statusEl.textContent = 'Loading pages...';
  container.appendChild(statusEl);

  const grid = document.createElement('div');
  grid.className = 'pdf-thumb-grid';
  
  const pagesData = [];
  
  for (let i = 1; i <= total; i++) {
    pagesData.push({
      originalIndex: i - 1,
      pageNum: i,
      rotation: 0,
      selected: mode === 'extract' ? false : true,
      excluded: false
    });
  }

  const renderGrid = async () => {
    grid.innerHTML = '';
    for (let i = 0; i < pagesData.length; i++) {
      const pData = pagesData[i];
      const card = document.createElement('div');
      card.className = 'pdf-thumb-card';
      if (mode === 'extract' && pData.selected) card.classList.add('selected');
      if (mode === 'delete' && pData.excluded) card.classList.add('excluded');
      
      card.draggable = true;
      card.dataset.index = i;
      
      card.addEventListener('dragstart', (e) => {
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', i);
      });
      card.addEventListener('dragend', () => card.classList.remove('dragging'));
      card.addEventListener('dragover', (e) => { e.preventDefault(); card.classList.add('drag-over'); });
      card.addEventListener('dragleave', () => card.classList.remove('drag-over'));
      card.addEventListener('drop', (e) => {
        e.preventDefault();
        card.classList.remove('drag-over');
        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
        const toIndex = i;
        if (fromIndex !== toIndex) {
          const item = pagesData.splice(fromIndex, 1)[0];
          pagesData.splice(toIndex, 0, item);
          renderGrid(); 
        }
      });
      
      const canvasContainer = document.createElement('div');
      
      renderPdfPageToCanvas(doc, pData.pageNum, 0.5).then(canvas => {
        if (pData.rotation) {
           canvas.style.transform = `rotate(${pData.rotation}deg)`;
        }
        canvasContainer.appendChild(canvas);
      });
      
      card.appendChild(canvasContainer);
      
      const footer = document.createElement('div');
      footer.className = 'pdf-thumb-footer';
      
      const label = document.createElement('span');
      label.textContent = `Page ${pData.pageNum}`;
      footer.appendChild(label);
      
      const actions = document.createElement('div');
      actions.className = 'pdf-thumb-actions';
      
      const rotateBtn = document.createElement('button');
      rotateBtn.innerHTML = '↻';
      rotateBtn.type = 'button';
      rotateBtn.title = 'Rotate 90°';
      rotateBtn.onclick = (e) => {
        e.stopPropagation();
        pData.rotation = (pData.rotation + 90) % 360;
        renderGrid();
      };
      
      if (mode === 'rearrange') {
        actions.appendChild(rotateBtn);
      }
      
      if (mode === 'delete') {
        const toggleBtn = document.createElement('button');
        toggleBtn.innerHTML = pData.excluded ? '↺' : '✕';
        toggleBtn.type = 'button';
        toggleBtn.title = pData.excluded ? 'Restore' : 'Delete';
        toggleBtn.onclick = (e) => {
          e.stopPropagation();
          pData.excluded = !pData.excluded;
          renderGrid();
        };
        actions.appendChild(toggleBtn);
        card.onclick = () => {
          pData.excluded = !pData.excluded;
          renderGrid();
        };
      }
      
      if (mode === 'extract') {
        const toggleBtn = document.createElement('button');
        toggleBtn.innerHTML = pData.selected ? '✓' : '+';
        toggleBtn.type = 'button';
        toggleBtn.title = pData.selected ? 'Deselect' : 'Select';
        toggleBtn.onclick = (e) => {
          e.stopPropagation();
          pData.selected = !pData.selected;
          renderGrid();
        };
        actions.appendChild(toggleBtn);
        card.onclick = () => {
          pData.selected = !pData.selected;
          renderGrid();
        };
      }
      
      footer.appendChild(actions);
      card.appendChild(footer);
      grid.appendChild(card);
    }
  };
  
  await renderGrid();
  
  statusEl.textContent = 'Drag to reorder pages. ' + (mode === 'delete' ? 'Click to mark for deletion.' : (mode === 'extract' ? 'Click to select pages to extract.' : ''));
  container.appendChild(grid);
  
  return {
    getPagesData: () => pagesData
  };
}

async function showVisualOrganizerModal(file, title, mode, confirmText) {
  return new Promise(async (resolve, reject) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(2px);';
    const modal = document.createElement('div');
    modal.style.cssText = 'background:var(--n-surface,#fff);padding:24px;border-radius:12px;width:90%;max-width:900px;max-height:90vh;display:flex;flex-direction:column;box-shadow:0 10px 30px rgba(0,0,0,0.2);';
    
    const header = document.createElement('h3');
    header.textContent = title;
    header.style.margin = '0 0 15px 0';
    header.style.fontFamily = 'inherit';
    modal.appendChild(header);

    const gridContainer = document.createElement('div');
    gridContainer.style.flex = '1';
    gridContainer.style.overflow = 'hidden';
    gridContainer.style.display = 'flex';
    gridContainer.style.flexDirection = 'column';
    modal.appendChild(gridContainer);
    
    const footer = document.createElement('div');
    footer.style.cssText = 'display:flex;justify-content:flex-end;gap:10px;margin-top:15px;';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.cssText = 'padding:8px 16px;border:1px solid var(--n-border,#ccc);background:transparent;border-radius:6px;cursor:pointer;font-family:inherit;';
    cancelBtn.onclick = () => {
      document.body.removeChild(overlay);
      reject(new Error('User cancelled'));
    };
    
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = confirmText;
    confirmBtn.style.cssText = 'padding:8px 16px;border:none;background:var(--accent,#2564cf);color:#fff;border-radius:6px;cursor:pointer;font-weight:600;font-family:inherit;';
    
    footer.appendChild(cancelBtn);
    footer.appendChild(confirmBtn);
    modal.appendChild(footer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    try {
      const visualOrganizer = await renderPageThumbnails(file, gridContainer, { mode });
      
      confirmBtn.onclick = () => {
        document.body.removeChild(overlay);
        resolve(visualOrganizer.getPagesData());
      };
    } catch (e) {
      document.body.removeChild(overlay);
      reject(e);
    }
  });
}

// ── Shared text-extraction helpers (used by multiple tools) ──

async function extractTextLines(pdfjsDoc, pageNum) {
  const page = await pdfjsDoc.getPage(pageNum);
  const vp = page.getViewport({ scale: 1 });
  const content = await page.getTextContent();
  const items = content.items
    .filter(it => it.str.trim())
    .map(it => ({
      text: it.str,
      x: it.transform[4],
      y: Math.round(vp.height - it.transform[5]),
      w: it.width || 0,
      fontSize: Math.abs(it.transform[0])
    }));
  items.sort((a, b) => a.y - b.y || a.x - b.x);
  const rows = [];
  let currentRow = [];
  let lastY = -Infinity;
  for (const item of items) {
    const tol = Math.max(item.fontSize * 0.5, 3);
    if (currentRow.length > 0 && Math.abs(item.y - lastY) > tol) {
      rows.push(currentRow.sort((a, b) => a.x - b.x));
      currentRow = [];
    }
    currentRow.push(item);
    lastY = item.y;
  }
  if (currentRow.length > 0) rows.push(currentRow.sort((a, b) => a.x - b.x));
  return rows;
}

window.TOOL_DEFS.push(
{
 id:'merge-pdf', category:'PDF Bench', title:'Merge PDF',
 desc:'Combine several PDFs into one file, in the order they were added.',
 accept:'.pdf', multiple:true, minFiles:2, hint:'PDF files only · add 2 or more',
 options:[],
 run: async (files, opts, progress) => {
 const PDFLib = await window.ensureLib("PDFLib");
    const { PDFDocument } = PDFLib;
 const out = await PDFDocument.create();
 for (let i=0;i<files.length;i++){
 progress(Math.round((i/files.length)*90), `Reading ${files[i].name}`);
 const bytes = await fileToArrayBuffer(files[i]);
 const src = await PDFDocument.load(bytes);
 const pages = await out.copyPages(src, src.getPageIndices());
 pages.forEach(p => out.addPage(p));
 }
 progress(95, 'Saving merged PDF');
 const bytes = await out.save();
 return [{ name:'merged.pdf', blob:new Blob([bytes], {type:'application/pdf'}) }];
 }
},
{
 id:'split-pdf', category:'PDF Bench', title:'Split PDF',
 desc:'Break every page of a PDF into its own file, delivered as a zip.',
 accept:'.pdf', multiple:false, minFiles:1, hint:'One PDF file',
 options:[],
 run: async (files, opts, progress) => {
 const PDFLib = await window.ensureLib("PDFLib");
    const { PDFDocument } = PDFLib;
 const bytes = await fileToArrayBuffer(files[0]);
 const src = await PDFDocument.load(bytes);
 const total = src.getPageCount();
 const JSZip = await window.ensureLib("JSZip");
    const zip = new JSZip();
 for (let i=0;i<total;i++){
 progress(Math.round((i/total)*90), `Splitting page ${i+1} of ${total}`);
 const out = await PDFDocument.create();
 const [page] = await out.copyPages(src, [i]);
 out.addPage(page);
 const pdfBytes = await out.save();
 zip.file(`page-${String(i+1).padStart(2,'0')}.pdf`, pdfBytes);
 }
 progress(95, 'Zipping pages');
 const zipBlob = await zip.generateAsync({ type:'blob' });
 return [{ name:'split-pages.zip', blob:zipBlob }];
 }
},
{
 id:'rotate-pdf', category:'PDF Bench', title:'Rotate PDF',
 desc:'Rotate every page in a PDF and re-save it.',
 accept:'.pdf', multiple:false, minFiles:1, hint:'One PDF file',
 options:[
 { type:'chips', id:'angle', label:'Rotate by', choices:[
 {value:'90',label:'90°'},{value:'180',label:'180°'},{value:'270',label:'270°'}
 ], default:'90' }
 ],
 run: async (files, opts, progress) => {
 const PDFLib = await window.ensureLib("PDFLib");
    const { PDFDocument, degrees } = PDFLib;
 const bytes = await fileToArrayBuffer(files[0]);
 const doc = await PDFDocument.load(bytes);
 const angle = parseInt(opts.angle || '90', 10);
 const pages = doc.getPages();
 pages.forEach((p,i) => {
 progress(Math.round((i/pages.length)*90), `Rotating page ${i+1}`);
 const current = p.getRotation().angle;
 p.setRotation(degrees((current + angle) % 360));
 });
 progress(95, 'Saving');
 const out = await doc.save();
 return [{ name:'rotated.pdf', blob:new Blob([out], {type:'application/pdf'}) }];
 }
},
{
 id:'compress-pdf', category:'PDF Bench', title:'Compress PDF',
 desc:'Best for scanned or image-heavy PDFs each page is re-rendered and re-encoded at a lower quality to shrink file size.',
 accept:'.pdf', multiple:false, minFiles:1, hint:'One PDF file',
 options:[
 { type:'range', id:'quality', label:'Image quality', min:30, max:90, step:5, default:60, suffix:'%' }
 ],
 run: async (files, opts, progress) => {
 const bytes = await fileToArrayBuffer(files[0]);
 const pdfjsLib = await window.ensureLib("pdfjsLib");
    const pdfjsDoc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
 const total = pdfjsDoc.numPages;
 const PDFLib = await window.ensureLib("PDFLib");
    const { PDFDocument } = PDFLib;
 const out = await PDFDocument.create();
 const quality = (parseInt(opts.quality || 60,10))/100;
 for (let i=1;i<=total;i++){
 progress(Math.round((i/total)*90), `Compressing page ${i} of ${total}`);
 const canvas = await renderPdfPageToCanvas(pdfjsDoc, i, 1.4);
 const jpgBlob = await canvasToBlob(canvas, 'image/jpeg', quality);
 const jpgBytes = await jpgBlob.arrayBuffer();
 const img = await out.embedJpg(jpgBytes);
 const page = out.addPage([canvas.width, canvas.height]);
 page.drawImage(img, { x:0, y:0, width:canvas.width, height:canvas.height });
 }
 progress(95,'Saving compressed PDF');
 const outBytes = await out.save();
 return [{ name:'compressed.pdf', blob:new Blob([outBytes], {type:'application/pdf'}) }];
 }
},
{
 id:'pdf-to-jpg', category:'PDF Bench', title:'PDF to JPG',
 desc:'Export every page of a PDF as a JPG image, delivered as a zip.',
 accept:'.pdf', multiple:false, minFiles:1, hint:'One PDF file',
 options:[
 { type:'range', id:'quality', label:'JPG quality', min:50, max:100, step:5, default:88, suffix:'%' }
 ],
 run: async (files, opts, progress) => {
 const bytes = await fileToArrayBuffer(files[0]);
 const pdfjsLib = await window.ensureLib("pdfjsLib");
    const pdfjsDoc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
 const total = pdfjsDoc.numPages;
 const JSZip = await window.ensureLib("JSZip");
    const zip = new JSZip();
 const quality = (parseInt(opts.quality || 88,10))/100;
 for (let i=1;i<=total;i++){
 progress(Math.round((i/total)*90), `Rendering page ${i} of ${total}`);
 const canvas = await renderPdfPageToCanvas(pdfjsDoc, i, 2);
 const blob = await canvasToBlob(canvas, 'image/jpeg', quality);
 zip.file(`page-${String(i).padStart(2,'0')}.jpg`, blob);
 }
 progress(95,'Zipping images');
 const zipBlob = await zip.generateAsync({ type:'blob' });
 return [{ name:'pdf-pages.zip', blob:zipBlob }];
 }
},
{
 id:'jpg-to-pdf', category:'PDF Bench', title:'JPG/PNG to PDF',
 desc:'Turn a stack of photos into a single PDF, one image per page.',
 accept:'.jpg,.jpeg,.png', multiple:true, minFiles:1, hint:'JPG or PNG · any number, in order added',
 options:[],
 run: async (files, opts, progress) => {
 const PDFLib = await window.ensureLib("PDFLib");
    const { PDFDocument } = PDFLib;
 const out = await PDFDocument.create();
 for (let i=0;i<files.length;i++){
 progress(Math.round((i/files.length)*90), `Placing ${files[i].name}`);
 const bytes = await fileToArrayBuffer(files[i]);
 const isPng = files[i].type.includes('png');
 const img = isPng ? await out.embedPng(bytes) : await out.embedJpg(bytes);
 const page = out.addPage([img.width, img.height]);
 page.drawImage(img, { x:0, y:0, width:img.width, height:img.height });
 }
 progress(95,'Saving PDF');
 const bytes = await out.save();
 return [{ name:'images.pdf', blob:new Blob([bytes], {type:'application/pdf'}) }];
 }
},
{
 id:'add-page-numbers', category:'PDF Bench', title:'Add Page Numbers',
 desc:'Stamp page numbers on every page of a PDF.',
 accept:'.pdf', multiple:false, minFiles:1, hint:'One PDF file',
 options:[
 { type:'chips', id:'position', label:'Position', choices:[
 {value:'bottom-center',label:'Bottom Center'},{value:'bottom-right',label:'Bottom Right'},{value:'top-center',label:'Top Center'}
 ], default:'bottom-center' },
 { type:'chips', id:'format', label:'Format', choices:[
 {value:'1',label:'1'},{value:'Page 1',label:'Page 1'},{value:'1/N',label:'1/N'}
 ], default:'1' }
 ],
 run: async (files, opts, progress) => {
 const PDFLib = await window.ensureLib("PDFLib");
    const { PDFDocument, StandardFonts, rgb } = PDFLib;
 const bytes = await fileToArrayBuffer(files[0]);
 const doc = await PDFDocument.load(bytes);
 const font = await doc.embedFont(StandardFonts.Helvetica);
 const pages = doc.getPages();
 const total = pages.length;
 for(let i=0; i<total; i++) {
 progress(Math.round((i/total)*90), `Stamping page ${i+1}`);
 const page = pages[i];
 const { width, height } = page.getSize();
 let text = String(i+1);
 if(opts.format === 'Page 1') text = `Page ${i+1}`;
 if(opts.format === '1/N') text = `${i+1}/${total}`;
 const fontSize = 12;
 const textWidth = font.widthOfTextAtSize(text, fontSize);
 let x = width/2 - textWidth/2;
 let y = 30;
 if(opts.position === 'bottom-right') { x = width - textWidth - 30; y = 30; }
 else if(opts.position === 'top-center') { x = width/2 - textWidth/2; y = height - 40; }
 page.drawText(text, { x, y, size: fontSize, font, color: rgb(0,0,0) });
 }
 progress(95, 'Saving PDF');
 const out = await doc.save();
 return [{ name:'numbered.pdf', blob:new Blob([out], {type:'application/pdf'}) }];
 }
},
{
  id:'word-to-pdf', category:'PDF Bench', title:'Word to PDF',
  desc:'Convert a DOCX document into a PDF, preserving paragraphs, headings, bold, and italic formatting.',
  accept:'.docx', multiple:false, minFiles:1, hint:'One DOCX file',
  options:[],
  run: async (files, opts, progress) => {
    progress(10, 'Reading DOCX');
    const JSZip = await window.ensureLib("JSZip");
    const zip = await JSZip.loadAsync(files[0]);
    const docXml = await zip.file('word/document.xml').async('string');

    progress(30, 'Parsing document');
    const PDFLib = await window.ensureLib("PDFLib");
    const { PDFDocument, StandardFonts, rgb } = PDFLib;
    const doc = await PDFDocument.create();

    const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const fontItalic = await doc.embedFont(StandardFonts.HelveticaOblique);
    const fontBoldItalic = await doc.embedFont(StandardFonts.HelveticaBoldOblique);

    const pageWidth = 595;
    const pageHeight = 842;
    const margin = 50;
    const maxWidth = pageWidth - margin * 2;

    let currentPage = doc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    function ensureSpace(needed) {
      if (y - needed < margin) {
        currentPage = doc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }
    }

    // Parse paragraphs from XML
    const paraRegex = /<w:p[\s>][\s\S]*?<\/w:p>/g;
    const runRegex = /<w:r[\s>][\s\S]*?<\/w:r>/g;
    const textRegex = /<w:t[^>]*>([\s\S]*?)<\/w:t>/g;
    const boldRegex = /<w:b\s*\/?>|<w:b\s[^>]*>/;
    const italicRegex = /<w:i\s*\/?>|<w:i\s[^>]*>/;
    const headingRegex = /<w:pStyle\s+w:val="Heading(\d)"/;
    const szRegex = /<w:sz\s+w:val="(\d+)"/;

    let paraMatch;
    let paraIndex = 0;
    const paragraphs = [];

    while ((paraMatch = paraRegex.exec(docXml)) !== null) {
      paragraphs.push(paraMatch[0]);
    }

    progress(50, 'Rendering ' + paragraphs.length + ' paragraphs');

    for (let pi = 0; pi < paragraphs.length; pi++) {
      const paraXml = paragraphs[pi];
      if (pi % 20 === 0) progress(50 + Math.round((pi / paragraphs.length) * 35), 'Rendering paragraph ' + (pi + 1));

      // Detect heading level
      const headMatch = headingRegex.exec(paraXml);
      const headLevel = headMatch ? parseInt(headMatch[1]) : 0;

      // Parse runs within this paragraph
      const runs = [];
      let runMatch;
      const runRe = new RegExp(runRegex.source, 'g');
      while ((runMatch = runRe.exec(paraXml)) !== null) {
        const runXml = runMatch[0];
        const isBold = boldRegex.test(runXml) || headLevel > 0;
        const isItalic = italicRegex.test(runXml);

        // Extract font size
        const szMatch = szRegex.exec(runXml);
        let fontSize = 11;
        if (szMatch) fontSize = parseInt(szMatch[1]) / 2; // DOCX uses half-points
        if (headLevel === 1) fontSize = 20;
        else if (headLevel === 2) fontSize = 16;
        else if (headLevel === 3) fontSize = 14;

        // Extract text
        let text = '';
        let tMatch;
        const tRe = new RegExp(textRegex.source, 'g');
        while ((tMatch = tRe.exec(runXml)) !== null) {
          text += tMatch[1];
        }

        if (text) {
          // Decode XML entities
          text = text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&apos;/g, "'").replace(/&quot;/g, '"');
          // Filter non-printable characters
          text = text.replace(/[^\x20-\x7E\xA0-\xFF]/g, ' ');

          let font = fontRegular;
          if (isBold && isItalic) font = fontBoldItalic;
          else if (isBold) font = fontBold;
          else if (isItalic) font = fontItalic;

          runs.push({ text, font, fontSize });
        }
      }

      if (runs.length === 0) {
        // Empty paragraph = spacing
        y -= 12;
        continue;
      }

      // Render runs with word-wrap
      const lineHeight = Math.max(...runs.map(r => r.fontSize)) * 1.4;
      const spacing = headLevel ? 8 : 2;

      ensureSpace(lineHeight + spacing);
      y -= spacing;

      // Concatenate all text and render with word-wrap
      for (const run of runs) {
        const words = run.text.split(' ');
        let line = '';
        for (const word of words) {
          const testLine = line ? line + ' ' + word : word;
          try {
            const w = run.font.widthOfTextAtSize(testLine, run.fontSize);
            if (w > maxWidth && line) {
              currentPage.drawText(line, { x: margin, y, size: run.fontSize, font: run.font, color: rgb(0, 0, 0) });
              y -= lineHeight;
              ensureSpace(lineHeight);
              line = word;
            } else {
              line = testLine;
            }
          } catch (e) {
            line = testLine;
          }
        }
        if (line) {
          try {
            currentPage.drawText(line, { x: margin, y, size: run.fontSize, font: run.font, color: rgb(0, 0, 0) });
          } catch (e) { /* skip unrenderable text */ }
          y -= lineHeight;
        }
      }
    }

    progress(90, 'Saving PDF');
    const pdfBytes = await doc.save();
    return [{ name: files[0].name.replace(/\.docx$/i, '') + '.pdf', blob: new Blob([pdfBytes], { type: 'application/pdf' }) }];
  }
},
{
  id:'pdf-to-word', category:'PDF Bench', title:'PDF to Word',
  desc:'Extract text from a PDF into a properly formatted DOCX document with paragraph structure.',
  accept:'.pdf', multiple:false, minFiles:1, hint:'One PDF file',
  options:[],
  run: async (files, opts, progress) => {
    const bytes = await fileToArrayBuffer(files[0]);
    const pdfjsLib = await window.ensureLib("pdfjsLib");
    const pdfjsDoc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
    const total = pdfjsDoc.numPages;

    let allParagraphs = [];

    for (let i = 1; i <= total; i++) {
      progress(Math.round((i / total) * 60), 'Extracting text from page ' + i);
      const rows = await extractTextLines(pdfjsDoc, i);

      // Detect paragraph breaks: gap between rows > 1.5 * avg line height
      let lastY = -Infinity;
      let paragraph = [];
      for (const row of rows) {
        const lineText = row.map(it => it.text).join(' ');
        if (!lineText.trim()) continue;
        const avgFs = row.reduce((s, it) => s + it.fontSize, 0) / row.length;
        const gap = row[0].y - lastY;
        if (lastY > -Infinity && gap > avgFs * 2) {
          if (paragraph.length) allParagraphs.push(paragraph.join(' '));
          paragraph = [];
        }
        paragraph.push(lineText);
        lastY = row[0].y + avgFs;
      }
      if (paragraph.length) allParagraphs.push(paragraph.join(' '));

      // Page separator
      if (i < total) allParagraphs.push('');
    }

    progress(70, 'Building DOCX');
    const JSZip = await window.ensureLib("JSZip");
    const zip = new JSZip();

    // Build paragraphs XML
    const escXml = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    let paraXml = '';
    for (const para of allParagraphs) {
      if (!para) {
        paraXml += '<w:p><w:pPr><w:spacing w:after="200"/></w:pPr></w:p>';
      } else {
        paraXml += '<w:p><w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr><w:t xml:space="preserve">' + escXml(para) + '</w:t></w:r></w:p>';
      }
    }

    const documentXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"' +
      ' xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
      '<w:body>' + paraXml +
      '<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr>' +
      '</w:body></w:document>';

    const contentTypesXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' +
      '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
      '</Types>';

    const relsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
      '</Relationships>';

    const docRelsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '</Relationships>';

    zip.file('[Content_Types].xml', contentTypesXml);
    zip.file('_rels/.rels', relsXml);
    zip.file('word/document.xml', documentXml);
    zip.file('word/_rels/document.xml.rels', docRelsXml);

    progress(90, 'Saving DOCX');
    const docxBlob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    return [{ name: files[0].name.replace(/\.pdf$/i, '') + '.docx', blob: docxBlob }];
  }
},
{
  id:'pdf-to-excel', category:'PDF Bench', title:'PDF to Excel',
  desc:'Extract tabular data from a PDF and export as a structured CSV spreadsheet.',
  accept:'.pdf', multiple:false, minFiles:1, hint:'One PDF file',
  options:[],
  run: async (files, opts, progress) => {
    const bytes = await fileToArrayBuffer(files[0]);
    const pdfjsLib = await window.ensureLib("pdfjsLib");
    const pdfjsDoc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
    const total = pdfjsDoc.numPages;

    let allPageRows = [];

    for (let i = 1; i <= total; i++) {
      progress(Math.round((i / total) * 70), 'Analysing page ' + i + ' of ' + total);
      const rows = await extractTextLines(pdfjsDoc, i);
      allPageRows.push(...rows);
    }

    if (allPageRows.length === 0) throw new Error('No text found in PDF.');

    progress(75, 'Detecting columns');

    // Collect all unique X start positions across all rows
    const allX = [];
    for (const row of allPageRows) {
      for (const item of row) allX.push(Math.round(item.x));
    }
    allX.sort((a, b) => a - b);

    // Cluster X positions into column boundaries (gap > 15 units = new column)
    const colBounds = [allX[0]];
    for (let i = 1; i < allX.length; i++) {
      if (allX[i] - allX[i - 1] > 15) colBounds.push(allX[i]);
    }

    // Assign each text item to the nearest column
    function colIndex(x) {
      let best = 0, bestDist = Infinity;
      for (let c = 0; c < colBounds.length; c++) {
        const d = Math.abs(x - colBounds[c]);
        if (d < bestDist) { bestDist = d; best = c; }
      }
      return best;
    }

    progress(80, 'Building CSV');

    const csvRows = [];
    for (const row of allPageRows) {
      const cells = new Array(colBounds.length).fill('');
      for (const item of row) {
        const ci = colIndex(Math.round(item.x));
        cells[ci] = (cells[ci] ? cells[ci] + ' ' : '') + item.text;
      }
      // Skip completely empty rows
      if (cells.some(c => c.trim())) {
        csvRows.push(cells.map(c => '"' + c.replace(/"/g, '""') + '"').join(','));
      }
    }

    progress(95, 'Saving CSV');
    const csvData = csvRows.join('\n');
    return [{ name: files[0].name.replace(/\.pdf$/i, '') + '.csv', blob: new Blob([csvData], { type: 'text/csv' }) }];
  }
},
{
  id:'excel-to-pdf', category:'PDF Bench', title:'Excel to PDF',
  desc:'Convert a CSV spreadsheet into a PDF with a formatted table, gridlines, and bold headers.',
  accept:'.csv', multiple:false, minFiles:1, hint:'One CSV file',
  options:[],
  run: async (files, opts, progress) => {
    const text = await files[0].text();
    const rawLines = text.split('\n').filter(l => l.trim());

    if (rawLines.length === 0) throw new Error('CSV file is empty.');

    progress(20, 'Parsing CSV');

    // Parse CSV properly (handle quoted fields)
    function parseCsvLine(line) {
      const cells = [];
      let current = '';
      let inQuote = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (inQuote) {
          if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
          else if (ch === '"') inQuote = false;
          else current += ch;
        } else {
          if (ch === '"') inQuote = true;
          else if (ch === ',') { cells.push(current.trim()); current = ''; }
          else current += ch;
        }
      }
      cells.push(current.trim());
      return cells;
    }

    const rows = rawLines.map(l => parseCsvLine(l));
    const numCols = Math.max(...rows.map(r => r.length));

    // Normalize all rows to same column count
    for (const row of rows) {
      while (row.length < numCols) row.push('');
    }

    progress(40, 'Calculating layout');

    const PDFLib = await window.ensureLib("PDFLib");
    const { PDFDocument, StandardFonts, rgb } = PDFLib;
    const doc = await PDFDocument.create();
    const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const fontSize = 9;
    const cellPad = 6;
    const margin = 30;
    const pageWidth = 842; // landscape A4
    const pageHeight = 595;
    const tableWidth = pageWidth - margin * 2;

    // Calculate column widths based on content
    const colWidths = [];
    for (let c = 0; c < numCols; c++) {
      let maxW = 30; // minimum width
      for (const row of rows) {
        const val = row[c] || '';
        try {
          const w = fontRegular.widthOfTextAtSize(val.substring(0, 40), fontSize) + cellPad * 2;
          if (w > maxW) maxW = w;
        } catch (e) { }
      }
      colWidths.push(Math.min(maxW, 250)); // cap at 250
    }

    // Scale columns to fit table width
    const totalW = colWidths.reduce((s, w) => s + w, 0);
    if (totalW > tableWidth) {
      const scale = tableWidth / totalW;
      for (let c = 0; c < numCols; c++) colWidths[c] *= scale;
    }

    const rowHeight = fontSize + cellPad * 2 + 2;
    let currentPage = doc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    function drawRow(row, isHeader) {
      if (y - rowHeight < margin) {
        currentPage = doc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }

      let x = margin;
      const font = isHeader ? fontBold : fontRegular;
      const bgColor = isHeader ? rgb(0.92, 0.92, 0.95) : null;

      // Draw row background
      if (bgColor) {
        currentPage.drawRectangle({ x: margin, y: y - rowHeight, width: tableWidth, height: rowHeight, color: bgColor });
      }

      // Draw cells
      for (let c = 0; c < numCols; c++) {
        const cellW = colWidths[c];
        let val = (row[c] || '').substring(0, 50);
        // Filter non-printable
        val = val.replace(/[^\x20-\x7E\xA0-\xFF]/g, ' ');

        // Draw cell border
        currentPage.drawRectangle({ x, y: y - rowHeight, width: cellW, height: rowHeight, borderColor: rgb(0.7, 0.7, 0.7), borderWidth: 0.5, color: undefined });

        // Draw text
        if (val) {
          try {
            // Truncate if too wide
            let displayText = val;
            while (displayText.length > 1 && font.widthOfTextAtSize(displayText, fontSize) > cellW - cellPad * 2) {
              displayText = displayText.slice(0, -1);
            }
            currentPage.drawText(displayText, { x: x + cellPad, y: y - rowHeight + cellPad + 1, size: fontSize, font, color: rgb(0, 0, 0) });
          } catch (e) { }
        }
        x += cellW;
      }
      y -= rowHeight;
    }

    progress(60, 'Rendering table');

    for (let r = 0; r < rows.length; r++) {
      if (r % 50 === 0) progress(60 + Math.round((r / rows.length) * 30), 'Rendering row ' + (r + 1) + ' of ' + rows.length);
      drawRow(rows[r], r === 0);
    }

    progress(95, 'Saving PDF');
    const pdfBytes = await doc.save();
    return [{ name: files[0].name.replace(/\.csv$/i, '') + '.pdf', blob: new Blob([pdfBytes], { type: 'application/pdf' }) }];
  }
},
{
  id:'unlock-pdf', category:'PDF Bench', title:'Unlock PDF',
  desc:'Remove password protection from a PDF you own.',
  accept:'.pdf', multiple:false, minFiles:1, hint:'One PDF file',
  options:[
    { type:'text', id:'password', label:'Password', placeholder:'Enter password' }
  ],
  run: async (files, opts, progress) => {
    progress(20, 'Reading PDF');
    const bytes = await fileToArrayBuffer(files[0]);
    const PDFLib = await window.ensureLib("PDFLib");
    const { PDFDocument } = PDFLib;
    progress(40, 'Verifying password and decrypting');
    let doc;
    try {
      doc = await PDFDocument.load(bytes, { password: opts.password || '' });
    } catch (err) {
      if (err.message && (err.message.includes('Password') || err.message.includes('password') || err.message.includes('decrypt'))) {
        throw new Error('Incorrect password or unable to decrypt this PDF. Please verify your password.');
      }
      throw err;
    }
    progress(80, 'Saving unlocked PDF');
    const out = await doc.save();
    return [{ name: files[0].name.replace(/\.pdf$/i, '') + '-unlocked.pdf', blob: new Blob([out], {type:'application/pdf'}) }];
  }
},
{
  id:'protect-pdf', category:'PDF Bench', title:'Protect PDF',
  desc:'Protect your PDF by flattening fields and applying a security stamp or confidentiality banner.',
  accept:'.pdf', multiple:false, minFiles:1, hint:'One PDF file',
  options:[
    { type:'chips', id:'banner', label:'Security Banner', choices:[
      {value:'CONFIDENTIAL',label:'CONFIDENTIAL'},
      {value:'DO NOT COPY',label:'DO NOT COPY'},
      {value:'RESTRICTED',label:'RESTRICTED'},
      {value:'NONE',label:'None'}
    ], default:'CONFIDENTIAL' },
    { type:'text', id:'notice', label:'Custom Notice / Watermark', placeholder:'e.g. For Authorized Eyes Only' }
  ],
  run: async (files, opts, progress) => {
    progress(20, 'Reading PDF');
    const bytes = await fileToArrayBuffer(files[0]);
    const PDFLib = await window.ensureLib("PDFLib");
    const { PDFDocument, StandardFonts, rgb, degrees } = PDFLib;
    const doc = await PDFDocument.load(bytes);
    const font = await doc.embedFont(StandardFonts.HelveticaBold);
    
    // Flatten any form fields to prevent alteration
    try {
      const form = doc.getForm();
      if (form) form.flatten();
    } catch (e) {}

    const stampText = opts.notice ? opts.notice.trim() : (opts.banner !== 'NONE' ? opts.banner : '');

    if (stampText) {
      progress(60, 'Applying security banner across pages');
      const pages = doc.getPages();
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        const fontSize = Math.min(width, height) * 0.08;
        const textWidth = font.widthOfTextAtSize(stampText, fontSize);
        
        page.drawText(stampText, {
          x: width / 2 - (textWidth / 2) * Math.cos(Math.PI / 4),
          y: height / 2 - (textWidth / 2) * Math.sin(Math.PI / 4),
          size: fontSize,
          font,
          color: rgb(0.85, 0.2, 0.2),
          opacity: 0.22,
          rotate: degrees(45)
        });
      }
    }

    progress(90, 'Securing and rebuilding PDF');
    const out = await doc.save();
    return [{ name: files[0].name.replace(/\.pdf$/i, '') + '-protected.pdf', blob: new Blob([out], {type:'application/pdf'}) }];
  }
},
{
  id:'pdf-to-png', category:'PDF Bench', title:'PDF to PNG',
  desc:'Export every page as a PNG image, zipped together.',
  accept:'.pdf', multiple:false, minFiles:1, hint:'One PDF file',
  options:[],
  run: async (files, opts, progress) => {
  const bytes = await fileToArrayBuffer(files[0]);
  const pdfjsLib = await window.ensureLib("pdfjsLib");
     const pdfjsDoc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
  const total = pdfjsDoc.numPages;
  const JSZip = await window.ensureLib("JSZip");
     const zip = new JSZip();
  for (let i=1;i<=total;i++){
  progress(Math.round((i/total)*90), `Rendering page ${i} of ${total}`);
  const canvas = await renderPdfPageToCanvas(pdfjsDoc, i, 2);
  const blob = await canvasToBlob(canvas, 'image/png');
  zip.file(`page-${String(i).padStart(2,'0')}.png`, blob);
  }
  progress(95,'Zipping images');
  const zipBlob = await zip.generateAsync({ type:'blob' });
  return [{ name:'pdf-pages.zip', blob:zipBlob }];
  }
 },
{
  id:'png-to-pdf', category:'PDF Bench', title:'PNG to PDF',
  desc:'Turn a stack of PNG images into a single PDF.',
  accept:'.png', multiple:true, minFiles:1, hint:'PNG files · any number',
  options:[],
  run: async (files, opts, progress) => {
  const PDFLib = await window.ensureLib("PDFLib");
     const { PDFDocument } = PDFLib;
  const out = await PDFDocument.create();
  for (let i=0;i<files.length;i++){
  progress(Math.round((i/files.length)*90), `Placing ${files[i].name}`);
  const bytes = await fileToArrayBuffer(files[i]);
  const img = await out.embedPng(bytes);
  const page = out.addPage([img.width, img.height]);
  page.drawImage(img, { x:0, y:0, width:img.width, height:img.height });
  }
  progress(95,'Saving PDF');
  const bytes = await out.save();
  return [{ name:'images.pdf', blob:new Blob([bytes], {type:'application/pdf'}) }];
  }
 },
{
  id:'pdf-to-html', category:'PDF Bench', title:'PDF to HTML',
  desc:'Convert PDF content into a structured, readable HTML webpage with styled typography and page layouts.',
  accept:'.pdf', multiple:false, minFiles:1, hint:'One PDF file',
  options:[],
  run: async (files, opts, progress) => {
    const bytes = await fileToArrayBuffer(files[0]);
    const pdfjsLib = await window.ensureLib("pdfjsLib");
    const pdfjsDoc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
    const total = pdfjsDoc.numPages;

    let bodyContent = '';

    for (let i = 1; i <= total; i++) {
      progress(Math.round((i / total) * 85), `Extracting page ${i} of ${total}`);
      const rows = await extractTextLines(pdfjsDoc, i);
      
      bodyContent += `<section class="pdf-page" data-page="${i}">\n`;
      bodyContent += `  <header class="page-header"><span>Page ${i}</span></header>\n`;
      bodyContent += `  <div class="page-content">\n`;

      let paragraph = [];
      let lastY = -Infinity;

      for (const row of rows) {
        const lineText = row.map(it => it.text).join(' ');
        if (!lineText.trim()) continue;
        const avgFs = row.reduce((s, it) => s + it.fontSize, 0) / row.length;
        const gap = row[0].y - lastY;

        if (lastY > -Infinity && gap > avgFs * 1.8) {
          if (paragraph.length) {
            bodyContent += `    <p>${paragraph.join(' ')}</p>\n`;
            paragraph = [];
          }
        }
        paragraph.push(lineText);
        lastY = row[0].y + avgFs;
      }
      if (paragraph.length) {
        bodyContent += `    <p>${paragraph.join(' ')}</p>\n`;
      }

      bodyContent += `  </div>\n</section>\n`;
    }

    progress(90, 'Styling HTML document');

    const title = files[0].name.replace(/\.pdf$/i, '');
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.65;
      background-color: #f4f6f9;
      color: #24292e;
      margin: 0;
      padding: 30px 15px;
    }
    .pdf-container {
      max-width: 820px;
      margin: 0 auto;
    }
    .pdf-page {
      background: #ffffff;
      padding: 40px 50px;
      margin-bottom: 30px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
      border: 1px solid #e1e4e8;
    }
    .page-header {
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #8c959f;
      border-bottom: 1px solid #eaecef;
      padding-bottom: 8px;
      margin-bottom: 24px;
    }
    p {
      margin: 0 0 16px 0;
      font-size: 1.02rem;
      word-break: break-word;
    }
    @media (max-width: 600px) {
      .pdf-page { padding: 24px 20px; }
    }
  </style>
</head>
<body>
  <div class="pdf-container">
    ${bodyContent}
  </div>
</body>
</html>`;

    progress(95, 'Saving HTML');
    return [{ name: `${title}.html`, blob: new Blob([fullHtml], { type: 'text/html' }) }];
  }
},
{
  id:'ppt-to-pdf', category:'PDF Bench', title:'PPT to PDF',
  desc:'Convert PowerPoint presentations (.pptx) into a clean, slide-by-slide PDF document.',
  accept:'.pptx', multiple:false, minFiles:1, hint:'One PPTX file',
  options:[],
  run: async (files, opts, progress) => {
    progress(10, 'Reading PPTX presentation');
    const JSZip = await window.ensureLib("JSZip");
    const zip = await JSZip.loadAsync(files[0]);

    let slideIndex = 1;
    let slides = [];
    while (zip.file(`ppt/slides/slide${slideIndex}.xml`)) {
      const xml = await zip.file(`ppt/slides/slide${slideIndex}.xml`).async('string');
      // Extract text blocks by paragraph tag <a:p>
      const paraRegex = /<a:p[\s>][\s\S]*?<\/a:p>/g;
      const textRegex = /<a:t[^>]*>([\s\S]*?)<\/a:t>/g;
      let pMatch;
      const slideParagraphs = [];
      while ((pMatch = paraRegex.exec(xml)) !== null) {
        let pText = '';
        let tMatch;
        while ((tMatch = textRegex.exec(pMatch[0])) !== null) {
          pText += tMatch[1];
        }
        const cleaned = pText.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&apos;/g, "'").replace(/&quot;/g, '"').trim();
        if (cleaned) {
          slideParagraphs.push(cleaned.replace(/[^\x20-\x7E\xA0-\xFF]/g, ' '));
        }
      }
      slides.push(slideParagraphs);
      slideIndex++;
    }

    if (slides.length === 0) {
      throw new Error('No slides found in the uploaded PPTX file.');
    }

    progress(40, `Found ${slides.length} slides. Formatting PDF`);
    const PDFLib = await window.ensureLib("PDFLib");
    const { PDFDocument, StandardFonts, rgb } = PDFLib;
    const doc = await PDFDocument.create();
    const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

    const pageWidth = 842; // Landscape A4
    const pageHeight = 595;
    const margin = 50;

    for (let i = 0; i < slides.length; i++) {
      progress(40 + Math.round((i / slides.length) * 50), `Rendering slide ${i + 1} of ${slides.length}`);
      const page = doc.addPage([pageWidth, pageHeight]);
      
      // Draw slide container border
      page.drawRectangle({
        x: margin - 15,
        y: margin - 15,
        width: pageWidth - (margin - 15) * 2,
        height: pageHeight - (margin - 15) * 2,
        borderColor: rgb(0.85, 0.88, 0.92),
        borderWidth: 1.5,
        color: rgb(0.99, 0.99, 1.0)
      });

      // Slide number badge
      page.drawText(`Slide ${i + 1}`, {
        x: pageWidth - margin - 50,
        y: pageHeight - margin + 5,
        size: 10,
        font: fontBold,
        color: rgb(0.4, 0.45, 0.5)
      });

      const paras = slides[i];
      let y = pageHeight - margin - 20;

      for (let pIdx = 0; pIdx < paras.length; pIdx++) {
        const text = paras[pIdx];
        const isTitle = pIdx === 0;
        const font = isTitle ? fontBold : fontRegular;
        const fontSize = isTitle ? 18 : 12;
        const lineHeight = fontSize * 1.4;
        const maxWidth = pageWidth - margin * 2;

        const words = text.split(' ');
        let line = '';
        for (const word of words) {
          const testLine = line ? line + ' ' + word : word;
          if (font.widthOfTextAtSize(testLine, fontSize) > maxWidth && line) {
            if (y > margin) {
              page.drawText(line, { x: margin, y, size: fontSize, font, color: isTitle ? rgb(0.1, 0.15, 0.25) : rgb(0.2, 0.2, 0.2) });
              y -= lineHeight;
            }
            line = word;
          } else {
            line = testLine;
          }
        }
        if (line && y > margin) {
          page.drawText(line, { x: margin, y, size: fontSize, font, color: isTitle ? rgb(0.1, 0.15, 0.25) : rgb(0.2, 0.2, 0.2) });
          y -= lineHeight;
        }
        y -= (isTitle ? 15 : 8);
      }
    }

    progress(95, 'Saving PDF');
    const pdfBytes = await doc.save();
    return [{ name: files[0].name.replace(/\.pptx$/i, '') + '.pdf', blob: new Blob([pdfBytes], { type: 'application/pdf' }) }];
  }
},
{
   id:'extract-pdf-pages', category:'PDF Bench', title:'Extract PDF Pages',
   desc:'Extract selected page ranges into a new PDF.',
   accept:'.pdf', multiple:false, minFiles:1, hint:'One PDF',
   options:[ ],
   run: async (files, opts, progress) => {
     let pagesData;
     try {
       pagesData = await showVisualOrganizerModal(files[0], 'Select Pages to Extract', 'extract', 'Extract Selected');
     } catch (e) {
       throw new Error('Operation cancelled by user.');
     }
     const indices = pagesData.filter(p => p.selected).map(p => p.originalIndex);
     if (indices.length === 0) throw new Error('No pages selected');

     progress(50, 'Extracting pages');
     const bytes = await fileToArrayBuffer(files[0]);
     const PDFLib = await window.ensureLib("PDFLib");
     const { PDFDocument } = PDFLib;
     const srcDoc = await PDFDocument.load(bytes);
     const outDoc = await PDFDocument.create();
     
     const pages = await outDoc.copyPages(srcDoc, indices);
     pages.forEach(p => outDoc.addPage(p));
     
     progress(90, 'Saving PDF');
     const pdfBytes = await outDoc.save();
     return [{ name: 'extracted.pdf', blob: new Blob([pdfBytes], {type:'application/pdf'}) }];
   }
 },
{
   id:'delete-pdf-pages', category:'PDF Bench', title:'Delete PDF Pages',
   desc:'Remove specified page numbers from a PDF.',
   accept:'.pdf', multiple:false, minFiles:1, hint:'One PDF',
   options:[ ],
   run: async (files, opts, progress) => {
     let pagesData;
     try {
       pagesData = await showVisualOrganizerModal(files[0], 'Select Pages to Delete', 'delete', 'Delete Selected');
     } catch (e) {
       throw new Error('Operation cancelled by user.');
     }
     const indices = pagesData.filter(p => !p.excluded).map(p => p.originalIndex);
     if (indices.length === 0) throw new Error('Cannot delete all pages');

     progress(50, 'Copying pages');
     const bytes = await fileToArrayBuffer(files[0]);
     const PDFLib = await window.ensureLib("PDFLib");
     const { PDFDocument } = PDFLib;
     const srcDoc = await PDFDocument.load(bytes);
     const outDoc = await PDFDocument.create();
     
     const pages = await outDoc.copyPages(srcDoc, indices);
     pages.forEach(p => outDoc.addPage(p));
     
     progress(90, 'Saving PDF');
     const pdfBytes = await outDoc.save();
     return [{ name: 'deleted.pdf', blob: new Blob([pdfBytes], {type:'application/pdf'}) }];
   }
 },
{
   id:'rearrange-pdf-pages', category:'PDF Bench', title:'Rearrange PDF Pages',
   desc:'Reorder pages visually.',
   accept:'.pdf', multiple:false, minFiles:1, hint:'One PDF',
   options:[ ],
   run: async (files, opts, progress) => {
     let pagesData;
     try {
       pagesData = await showVisualOrganizerModal(files[0], 'Rearrange PDF Pages', 'rearrange', 'Confirm Order');
     } catch (e) {
       throw new Error('Operation cancelled by user.');
     }
     
     progress(50, 'Rearranging pages');
     const bytes = await fileToArrayBuffer(files[0]);
     const PDFLib = await window.ensureLib("PDFLib");
     const { PDFDocument, degrees } = PDFLib;
     const srcDoc = await PDFDocument.load(bytes);
     const outDoc = await PDFDocument.create();
     
     const indices = pagesData.map(p => p.originalIndex);
     const pages = await outDoc.copyPages(srcDoc, indices);
     pages.forEach((p, idx) => {
       const rot = pagesData[idx].rotation;
       if (rot) {
         const current = p.getRotation().angle;
         p.setRotation(degrees((current + rot) % 360));
       }
       outDoc.addPage(p);
     });
     
     progress(90, 'Saving PDF');
     const pdfBytes = await outDoc.save();
     return [{ name: 'rearranged.pdf', blob: new Blob([pdfBytes], {type:'application/pdf'}) }];
   }
 },
{
   id:'duplicate-pdf-pages', category:'PDF Bench', title:'Duplicate PDF Pages',
   desc:'Copy and append selected pages.',
   accept:'.pdf', multiple:false, minFiles:1, hint:'One PDF',
   options:[ { type:'text', id:'pages', label:'Pages to duplicate', placeholder:'1' } ],
   run: async (files, opts, progress) => {
     progress(10, 'Loading PDF');
     const bytes = await fileToArrayBuffer(files[0]);
     const PDFLib = await window.ensureLib("PDFLib");
     const { PDFDocument } = PDFLib;
     const doc = await PDFDocument.load(bytes);
     
     const total = doc.getPageCount();
     let indices = [];
     const parts = (opts.pages || '').split(',');
     for (const p of parts) {
       const n = parseInt(p.trim(), 10);
       if (!isNaN(n) && n >= 1 && n <= total) indices.push(n - 1);
     }
     
     if (indices.length > 0) {
       progress(50, 'Duplicating pages');
       const pages = await doc.copyPages(doc, indices);
       pages.forEach(p => doc.addPage(p));
     }
     
     progress(90, 'Saving PDF');
     const pdfBytes = await doc.save();
     return [{ name: 'duplicated.pdf', blob: new Blob([pdfBytes], {type:'application/pdf'}) }];
   }
 },
{
   id:'pdf-ocr', category:'PDF Bench', title:'PDF OCR',
   desc:'Render pages and run OCR to get text.',
   accept:'.pdf', multiple:false, minFiles:1, hint:'One PDF',
   options:[],
   run: async (files, opts, progress) => {
     progress(10, 'Loading PDF');
     const bytes = await fileToArrayBuffer(files[0]);
     const pdfjsLib = await window.ensureLib("pdfjsLib");
     const pdfjsDoc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
     const total = pdfjsDoc.numPages;
     
     const Tesseract = await window.ensureLib("Tesseract");
     let fullText = '';
     
     for (let i = 1; i <= total; i++) {
       progress(Math.round((i/total)*90), `OCR Page ${i} of ${total}`);
       const canvas = await renderPdfPageToCanvas(pdfjsDoc, i, 2);
       const result = await Tesseract.recognize(canvas, 'eng');
       fullText += `--- Page ${i} ---\n${result.data.text}\n\n`;
     }
     
     return [{ name: 'ocr_result.txt', blob: new Blob([fullText], {type:'text/plain'}) }];
   }
 },
{
  id:'extract-pdf-images', category:'PDF Bench', title:'Extract PDF Images',
  desc:'Render each PDF page as an ultra high-resolution image asset and download all pages as a zip archive.',
  accept:'.pdf', multiple:false, minFiles:1, hint:'One PDF file',
  options:[
    { type:'chips', id:'format', label:'Image Format', choices:[
      {value:'png',label:'PNG (Lossless)'},{value:'jpeg',label:'JPEG (Compact)'}
    ], default:'png' },
    { type:'chips', id:'resolution', label:'Resolution', choices:[
      {value:'2',label:'Standard (2x)'},{value:'3',label:'High Res (3x)'}
    ], default:'2' }
  ],
  run: async (files, opts, progress) => {
    progress(10, 'Loading PDF document');
    const bytes = await fileToArrayBuffer(files[0]);
    const pdfjsLib = await window.ensureLib("pdfjsLib");
    const pdfjsDoc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
    const total = pdfjsDoc.numPages;

    const JSZip = await window.ensureLib("JSZip");
    const zip = new JSZip();
    const scale = parseFloat(opts.resolution || '2');
    const fmt = opts.format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const ext = opts.format === 'jpeg' ? 'jpg' : 'png';

    for (let i = 1; i <= total; i++) {
      progress(Math.round((i / total) * 85), `Rendering page ${i} of ${total} at ${scale}x scale`);
      const canvas = await renderPdfPageToCanvas(pdfjsDoc, i, scale);
      const blob = await canvasToBlob(canvas, fmt, 0.92);
      zip.file(`page-${String(i).padStart(3, '0')}.${ext}`, blob);
    }

    progress(92, 'Generating ZIP package');
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    return [{ name: files[0].name.replace(/\.pdf$/i, '') + '-images.zip', blob: zipBlob }];
  }
},
{
  id:'sign-pdf', category:'PDF Bench', title:'Sign PDF',
  desc:'Draw your signature on a pad and stamp it onto any page of a PDF.',
  accept:'.pdf', multiple:false, minFiles:1, hint:'One PDF',
  options:[
    { type:'chips', id:'position', label:'Position', choices:[
      {value:'bottom-right',label:'Bottom Right'},{value:'bottom-left',label:'Bottom Left'},{value:'bottom-center',label:'Bottom Center'},{value:'center',label:'Center'}
    ], default:'bottom-right' },
    { type:'chips', id:'sigColor', label:'Ink color', choices:[
      {value:'#000000',label:'Black'},{value:'#00008B',label:'Blue'},{value:'#8B0000',label:'Red'}
    ], default:'#000000' }
  ],
  run: async (files, opts, progress) => {
    progress(5, 'Loading PDF');
    const bytes = await fileToArrayBuffer(files[0]);
    const PDFLib = await window.ensureLib("PDFLib");
    const { PDFDocument } = PDFLib;
    const doc = await PDFDocument.load(bytes);
    const pageCount = doc.getPageCount();

    // Show signature drawing modal
    const sigData = await new Promise((resolve, reject) => {
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(2px);';

      const modal = document.createElement('div');
      modal.style.cssText = 'background:var(--n-surface,#fff);padding:24px;border-radius:12px;width:90%;max-width:520px;box-shadow:0 10px 30px rgba(0,0,0,0.2);';

      const header = document.createElement('h3');
      header.textContent = 'Draw Your Signature';
      header.style.cssText = 'margin:0 0 12px 0;font-family:inherit;';
      modal.appendChild(header);

      // Canvas for drawing
      const canvasWrap = document.createElement('div');
      canvasWrap.style.cssText = 'border:2px dashed var(--n-border,#ccc);border-radius:8px;background:#fafafa;margin-bottom:12px;';
      const canvas = document.createElement('canvas');
      canvas.width = 460;
      canvas.height = 180;
      canvas.style.cssText = 'display:block;width:100%;height:auto;cursor:crosshair;touch-action:none;';
      canvasWrap.appendChild(canvas);
      modal.appendChild(canvasWrap);

      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = opts.sigColor || '#000000';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      let drawing = false;
      let hasDrawn = false;

      function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
      }

      function startDraw(e) { e.preventDefault(); drawing = true; hasDrawn = true; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); }
      function moveDraw(e) { e.preventDefault(); if (!drawing) return; const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); }
      function endDraw(e) { e.preventDefault(); drawing = false; }

      canvas.addEventListener('mousedown', startDraw);
      canvas.addEventListener('mousemove', moveDraw);
      canvas.addEventListener('mouseup', endDraw);
      canvas.addEventListener('mouseleave', endDraw);
      canvas.addEventListener('touchstart', startDraw, { passive: false });
      canvas.addEventListener('touchmove', moveDraw, { passive: false });
      canvas.addEventListener('touchend', endDraw, { passive: false });

      // Controls row
      const controls = document.createElement('div');
      controls.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap;';

      const clearBtn = document.createElement('button');
      clearBtn.textContent = 'Clear';
      clearBtn.type = 'button';
      clearBtn.style.cssText = 'padding:6px 14px;border:1px solid var(--n-border,#ccc);background:transparent;border-radius:6px;cursor:pointer;font-family:inherit;font-size:.85rem;';
      clearBtn.onclick = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); hasDrawn = false; };
      controls.appendChild(clearBtn);

      // Page selector
      if (pageCount > 1) {
        const pgLabel = document.createElement('span');
        pgLabel.textContent = 'Page:';
        pgLabel.style.cssText = 'font-size:.85rem;margin-left:auto;';
        controls.appendChild(pgLabel);
        const pgSel = document.createElement('select');
        pgSel.id = 'sig-page-select';
        pgSel.style.cssText = 'padding:4px 8px;border:1px solid var(--n-border,#ccc);border-radius:4px;font-family:inherit;';
        for (let p = 1; p <= pageCount; p++) {
          const o = document.createElement('option');
          o.value = p;
          o.textContent = p;
          if (p === 1) o.selected = true;
          pgSel.appendChild(o);
        }
        controls.appendChild(pgSel);
      }

      modal.appendChild(controls);

      // Buttons
      const footer = document.createElement('div');
      footer.style.cssText = 'display:flex;justify-content:flex-end;gap:10px;';

      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancel';
      cancelBtn.style.cssText = 'padding:8px 16px;border:1px solid var(--n-border,#ccc);background:transparent;border-radius:6px;cursor:pointer;font-family:inherit;';
      cancelBtn.onclick = () => { document.body.removeChild(overlay); reject(new Error('Cancelled by user.')); };

      const applyBtn = document.createElement('button');
      applyBtn.textContent = 'Apply Signature';
      applyBtn.style.cssText = 'padding:8px 16px;border:none;background:var(--accent,#2564cf);color:#fff;border-radius:6px;cursor:pointer;font-weight:600;font-family:inherit;';
      applyBtn.onclick = () => {
        if (!hasDrawn) { alert('Please draw your signature first.'); return; }
        const pgSel = document.getElementById('sig-page-select');
        const pageNum = pgSel ? parseInt(pgSel.value) : 1;
        const dataUrl = canvas.toDataURL('image/png');
        document.body.removeChild(overlay);
        resolve({ dataUrl, pageNum });
      };

      footer.appendChild(cancelBtn);
      footer.appendChild(applyBtn);
      modal.appendChild(footer);
      overlay.appendChild(modal);
      document.body.appendChild(overlay);
    });

    progress(50, 'Embedding signature');

    // Convert data URL to bytes
    const base64 = sigData.dataUrl.split(',')[1];
    const sigBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const sigImage = await doc.embedPng(sigBytes);

    const pageIndex = Math.min(sigData.pageNum, pageCount) - 1;
    const page = doc.getPages()[pageIndex];
    const { width, height } = page.getSize();

    // Scale signature to reasonable size (max 200px wide)
    const sigW = Math.min(200, sigImage.width);
    const sigH = (sigImage.height / sigImage.width) * sigW;

    // Position
    let x = 0, y = 0;
    const pos = opts.position || 'bottom-right';
    const margin = 40;
    if (pos === 'bottom-right') { x = width - sigW - margin; y = margin; }
    else if (pos === 'bottom-left') { x = margin; y = margin; }
    else if (pos === 'bottom-center') { x = (width - sigW) / 2; y = margin; }
    else if (pos === 'center') { x = (width - sigW) / 2; y = (height - sigH) / 2; }

    page.drawImage(sigImage, { x, y, width: sigW, height: sigH });

    progress(90, 'Saving signed PDF');
    const pdfBytes = await doc.save();
    return [{ name: 'signed.pdf', blob: new Blob([pdfBytes], { type: 'application/pdf' }) }];
  }
},
{
  id:'fill-pdf-forms', category:'PDF Bench', title:'Fill PDF Forms',
  desc:'Detect fillable fields in a PDF and let you type values for each one, then flatten.',
  accept:'.pdf', multiple:false, minFiles:1, hint:'One PDF with form fields',
  options:[],
  run: async (files, opts, progress) => {
    progress(10, 'Loading PDF');
    const bytes = await fileToArrayBuffer(files[0]);
    const PDFLib = await window.ensureLib("PDFLib");
    const { PDFDocument } = PDFLib;
    const doc = await PDFDocument.load(bytes);

    const form = doc.getForm();
    const fields = form.getFields();

    if (fields.length === 0) {
      throw new Error('This PDF has no fillable form fields. Only PDFs with interactive form fields (text boxes, checkboxes, dropdowns) can be filled.');
    }

    // Build field metadata for the UI
    const fieldMeta = [];
    for (const field of fields) {
      const name = field.getName();
      const type = field.constructor.name;
      if (type.includes('TextField')) {
        fieldMeta.push({ name, type: 'text', current: '' });
        try { fieldMeta[fieldMeta.length - 1].current = field.getText() || ''; } catch(e) {}
      } else if (type.includes('CheckBox')) {
        fieldMeta.push({ name, type: 'checkbox', current: false });
        try { fieldMeta[fieldMeta.length - 1].current = field.isChecked(); } catch(e) {}
      } else if (type.includes('Dropdown')) {
        const options = [];
        try { options.push(...field.getOptions()); } catch(e) {}
        fieldMeta.push({ name, type: 'dropdown', current: '', options });
        try { fieldMeta[fieldMeta.length - 1].current = field.getSelected() ? field.getSelected()[0] : ''; } catch(e) {}
      } else if (type.includes('RadioGroup')) {
        const options = [];
        try { options.push(...field.getOptions()); } catch(e) {}
        fieldMeta.push({ name, type: 'radio', current: '', options });
        try { fieldMeta[fieldMeta.length - 1].current = field.getSelected(); } catch(e) {}
      }
    }

    if (fieldMeta.length === 0) {
      throw new Error('No supported form fields found (text, checkbox, dropdown, or radio).');
    }

    progress(30, 'Showing form editor');

    // Show interactive form modal
    const userValues = await new Promise((resolve, reject) => {
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(2px);';

      const modal = document.createElement('div');
      modal.style.cssText = 'background:var(--n-surface,#fff);padding:24px;border-radius:12px;width:90%;max-width:600px;max-height:85vh;display:flex;flex-direction:column;box-shadow:0 10px 30px rgba(0,0,0,0.2);';

      const header = document.createElement('h3');
      header.textContent = 'Fill Form Fields (' + fieldMeta.length + ' fields)';
      header.style.cssText = 'margin:0 0 16px 0;font-family:inherit;';
      modal.appendChild(header);

      const formArea = document.createElement('div');
      formArea.style.cssText = 'flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:14px;padding-right:8px;';

      const inputs = {};

      for (const fm of fieldMeta) {
        const group = document.createElement('div');
        const label = document.createElement('label');
        label.textContent = fm.name;
        label.style.cssText = 'display:block;font-size:.85rem;font-weight:600;margin-bottom:4px;color:var(--n-text,#1a1d23);';
        group.appendChild(label);

        if (fm.type === 'text') {
          const inp = document.createElement('input');
          inp.type = 'text';
          inp.value = fm.current;
          inp.placeholder = 'Enter value';
          inp.style.cssText = 'width:100%;padding:8px 10px;border:1px solid var(--n-border,#ccc);border-radius:6px;font-family:inherit;font-size:.9rem;box-sizing:border-box;';
          group.appendChild(inp);
          inputs[fm.name] = { el: inp, type: 'text' };
        } else if (fm.type === 'checkbox') {
          const chk = document.createElement('input');
          chk.type = 'checkbox';
          chk.checked = fm.current;
          chk.style.cssText = 'width:18px;height:18px;cursor:pointer;';
          group.appendChild(chk);
          inputs[fm.name] = { el: chk, type: 'checkbox' };
        } else if (fm.type === 'dropdown') {
          const sel = document.createElement('select');
          sel.style.cssText = 'width:100%;padding:8px 10px;border:1px solid var(--n-border,#ccc);border-radius:6px;font-family:inherit;font-size:.9rem;';
          const emptyOpt = document.createElement('option');
          emptyOpt.value = '';
          emptyOpt.textContent = '— Select —';
          sel.appendChild(emptyOpt);
          for (const opt of fm.options) {
            const o = document.createElement('option');
            o.value = opt;
            o.textContent = opt;
            if (opt === fm.current) o.selected = true;
            sel.appendChild(o);
          }
          group.appendChild(sel);
          inputs[fm.name] = { el: sel, type: 'dropdown' };
        } else if (fm.type === 'radio') {
          const radioGroup = document.createElement('div');
          radioGroup.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;';
          for (const opt of fm.options) {
            const lbl = document.createElement('label');
            lbl.style.cssText = 'display:flex;align-items:center;gap:4px;font-size:.85rem;cursor:pointer;';
            const r = document.createElement('input');
            r.type = 'radio';
            r.name = 'radio_' + fm.name;
            r.value = opt;
            if (opt === fm.current) r.checked = true;
            lbl.appendChild(r);
            lbl.appendChild(document.createTextNode(opt));
            radioGroup.appendChild(lbl);
          }
          group.appendChild(radioGroup);
          inputs[fm.name] = { el: radioGroup, type: 'radio' };
        }

        formArea.appendChild(group);
      }

      modal.appendChild(formArea);

      const footer = document.createElement('div');
      footer.style.cssText = 'display:flex;justify-content:flex-end;gap:10px;margin-top:16px;';

      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancel';
      cancelBtn.style.cssText = 'padding:8px 16px;border:1px solid var(--n-border,#ccc);background:transparent;border-radius:6px;cursor:pointer;font-family:inherit;';
      cancelBtn.onclick = () => { document.body.removeChild(overlay); reject(new Error('Cancelled by user.')); };

      const fillBtn = document.createElement('button');
      fillBtn.textContent = 'Fill & Download';
      fillBtn.style.cssText = 'padding:8px 16px;border:none;background:var(--accent,#2564cf);color:#fff;border-radius:6px;cursor:pointer;font-weight:600;font-family:inherit;';
      fillBtn.onclick = () => {
        const values = {};
        for (const [name, info] of Object.entries(inputs)) {
          if (info.type === 'text') values[name] = info.el.value;
          else if (info.type === 'checkbox') values[name] = info.el.checked;
          else if (info.type === 'dropdown') values[name] = info.el.value;
          else if (info.type === 'radio') {
            const checked = info.el.querySelector('input:checked');
            values[name] = checked ? checked.value : '';
          }
        }
        document.body.removeChild(overlay);
        resolve(values);
      };

      footer.appendChild(cancelBtn);
      footer.appendChild(fillBtn);
      modal.appendChild(footer);
      overlay.appendChild(modal);
      document.body.appendChild(overlay);
    });

    progress(60, 'Filling form fields');

    // Apply user values to the form
    for (const field of fields) {
      const name = field.getName();
      const type = field.constructor.name;
      const val = userValues[name];
      if (val === undefined) continue;

      try {
        if (type.includes('TextField') && typeof val === 'string') {
          field.setText(val);
        } else if (type.includes('CheckBox') && typeof val === 'boolean') {
          if (val) field.check(); else field.uncheck();
        } else if (type.includes('Dropdown') && typeof val === 'string') {
          if (val) field.select(val);
        } else if (type.includes('RadioGroup') && typeof val === 'string') {
          if (val) field.select(val);
        }
      } catch(e) { /* skip unwritable fields */ }
    }

    progress(80, 'Flattening form');
    form.flatten();

    progress(90, 'Saving PDF');
    const pdfBytes = await doc.save();
    return [{ name: 'filled.pdf', blob: new Blob([pdfBytes], { type: 'application/pdf' }) }];
  }
},
{
  id:'compare-pdfs', category:'PDF Bench', title:'Compare PDFs',
  desc:'Compare text differences between two PDF versions side-by-side with word-level change highlighting.',
  accept:'.pdf', multiple:true, minFiles:2, hint:'Select exactly two PDF files',
  options:[],
  run: async (files, opts, progress) => {
    progress(10, 'Loading PDF engines');
    const pdfjsLib = await window.ensureLib("pdfjsLib");

    const extractPageTexts = async (file, fileNum) => {
      const bytes = await fileToArrayBuffer(file);
      const doc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
      const pages = [];
      for (let i = 1; i <= doc.numPages; i++) {
        progress(15 + fileNum * 35 + Math.round((i / doc.numPages) * 30), `Extracting ${file.name} (page ${i}/${doc.numPages})`);
        const rows = await extractTextLines(doc, i);
        const text = rows.map(r => r.map(item => item.text).join(' ')).join('\n');
        pages.push(text);
      }
      return pages;
    };

    const text1 = await extractPageTexts(files[0], 0);
    const text2 = await extractPageTexts(files[1], 1);

    progress(85, 'Calculating diffs');

    // Word diff helper
    function diffWords(oldStr, newStr) {
      const w1 = oldStr.split(/(\s+)/);
      const w2 = newStr.split(/(\s+)/);
      
      const s1 = new Set(w1.filter(w => w.trim()));
      const s2 = new Set(w2.filter(w => w.trim()));

      let html1 = '';
      for (const w of w1) {
        if (!w.trim()) { html1 += w; continue; }
        if (!s2.has(w)) {
          html1 += `<span class="diff-del">${escapeHtml(w)}</span>`;
        } else {
          html1 += escapeHtml(w);
        }
      }

      let html2 = '';
      for (const w of w2) {
        if (!w.trim()) { html2 += w; continue; }
        if (!s1.has(w)) {
          html2 += `<span class="diff-add">${escapeHtml(w)}</span>`;
        } else {
          html2 += escapeHtml(w);
        }
      }

      return { html1, html2 };
    }

    function escapeHtml(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    let reportRows = '';
    const maxPages = Math.max(text1.length, text2.length);

    for (let i = 0; i < maxPages; i++) {
      const t1 = text1[i] || '';
      const t2 = text2[i] || '';
      const isSame = (t1.trim() === t2.trim());

      let side1Html = '', side2Html = '';
      if (isSame) {
        side1Html = `<div class="diff-unchanged">${escapeHtml(t1) || '<em>(Empty page)</em>'}</div>`;
        side2Html = `<div class="diff-unchanged">${escapeHtml(t2) || '<em>(Empty page)</em>'}</div>`;
      } else {
        const d = diffWords(t1, t2);
        side1Html = d.html1 || '<em>(Empty page)</em>';
        side2Html = d.html2 || '<em>(Empty page)</em>';
      }

      reportRows += `
        <div class="page-diff-card">
          <div class="page-diff-header">
            <h4>Page ${i + 1}</h4>
            <span class="status-badge ${isSame ? 'badge-same' : 'badge-diff'}">${isSame ? 'Identical' : 'Differences Found'}</span>
          </div>
          <div class="page-diff-body">
            <div class="diff-pane">
              <div class="pane-title">${escapeHtml(files[0].name)}</div>
              <div class="pane-content">${side1Html.replace(/\n/g, '<br>')}</div>
            </div>
            <div class="diff-pane">
              <div class="pane-title">${escapeHtml(files[1].name)}</div>
              <div class="pane-content">${side2Html.replace(/\n/g, '<br>')}</div>
            </div>
          </div>
        </div>
      `;
    }

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PDF Comparison Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f6f8fa; margin: 0; padding: 24px; color: #24292e; line-height: 1.5; }
    .container { max-width: 1100px; margin: 0 auto; }
    h2 { margin-top: 0; font-size: 1.5rem; }
    .page-diff-card { background: #fff; border-radius: 8px; border: 1px solid #e1e4e8; margin-bottom: 24px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
    .page-diff-header { display: flex; justify-content: space-between; align-items: center; background: #f6f8fa; padding: 12px 20px; border-bottom: 1px solid #e1e4e8; }
    .page-diff-header h4 { margin: 0; }
    .status-badge { font-size: 0.75rem; font-weight: 700; padding: 4px 10px; border-radius: 12px; }
    .badge-same { background: #dafbe1; color: #1a7f37; }
    .badge-diff { background: #ffebe9; color: #cf222e; }
    .page-diff-body { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 20px; }
    .diff-pane { background: #fcfcfc; border: 1px solid #eaecef; border-radius: 6px; padding: 16px; overflow-wrap: break-word; }
    .pane-title { font-weight: 600; font-size: 0.85rem; color: #57606a; margin-bottom: 12px; border-bottom: 1px solid #eaecef; padding-bottom: 6px; }
    .pane-content { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.85rem; }
    .diff-del { background: #ffc0cb; color: #900; text-decoration: line-through; padding: 1px 3px; border-radius: 2px; }
    .diff-add { background: #bdfac9; color: #006000; font-weight: 600; padding: 1px 3px; border-radius: 2px; }
    .diff-unchanged { color: #57606a; }
  </style>
</head>
<body>
  <div class="container">
    <h2>PDF Comparison Report</h2>
    <p>Comparing <strong>${escapeHtml(files[0].name)}</strong> vs <strong>${escapeHtml(files[1].name)}</strong></p>
    ${reportRows}
  </div>
</body>
</html>`;

    progress(95, 'Saving report');
    return [{ name: 'pdf-comparison.html', blob: new Blob([fullHtml], { type: 'text/html' }) }];
  }
},
{
   id:'repair-pdf', category:'PDF Bench', title:'Repair PDF',
   desc:'Load and re-save document to rebuild xref table.',
   accept:'.pdf', multiple:false, minFiles:1, hint:'One PDF',
   options:[],
   run: async (files, opts, progress) => {
     progress(10, 'Loading PDF');
     const bytes = await fileToArrayBuffer(files[0]);
     const PDFLib = await window.ensureLib("PDFLib");
     const { PDFDocument } = PDFLib;
     
     progress(50, 'Rebuilding xref');
     const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
     
     progress(90, 'Saving PDF');
     const pdfBytes = await doc.save();
     return [{ name: 'repaired.pdf', blob: new Blob([pdfBytes], {type:'application/pdf'}) }];
   }
 },
{
   id:'flatten-pdf', category:'PDF Bench', title:'Flatten PDF',
   desc:'Render pages to images and re-embed in clean PDF.',
   accept:'.pdf', multiple:false, minFiles:1, hint:'One PDF',
   options:[],
   run: async (files, opts, progress) => {
     progress(10, 'Loading PDF');
     const bytes = await fileToArrayBuffer(files[0]);
     const pdfjsLib = await window.ensureLib("pdfjsLib");
     const pdfjsDoc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
     const total = pdfjsDoc.numPages;
     
     const PDFLib = await window.ensureLib("PDFLib");
     const { PDFDocument } = PDFLib;
     const outDoc = await PDFDocument.create();
     
     for (let i = 1; i <= total; i++) {
       progress(Math.round((i/total)*80), `Flattening Page ${i} of ${total}`);
       const canvas = await renderPdfPageToCanvas(pdfjsDoc, i, 2);
       const blob = await canvasToBlob(canvas, 'image/png');
       const imgBytes = await blob.arrayBuffer();
       const img = await outDoc.embedPng(imgBytes);
       const page = outDoc.addPage([img.width, img.height]);
       page.drawImage(img, { x:0, y:0, width:img.width, height:img.height });
     }
     
     progress(90, 'Saving PDF');
     const pdfBytes = await outDoc.save();
     return [{ name: 'flattened.pdf', blob: new Blob([pdfBytes], {type:'application/pdf'}) }];
   }
 },
{
   id:'edit-pdf-metadata', category:'PDF Bench', title:'Edit PDF Metadata',
   desc:'Set Title, Author, Subject, Keywords.',
   accept:'.pdf', multiple:false, minFiles:1, hint:'One PDF',
   options:[
     { type:'text', id:'title', label:'Title', placeholder:'Title' },
     { type:'text', id:'author', label:'Author', placeholder:'Author' },
     { type:'text', id:'subject', label:'Subject', placeholder:'Subject' },
     { type:'text', id:'keywords', label:'Keywords (comma separated)', placeholder:'Keywords' }
   ],
   run: async (files, opts, progress) => {
     progress(10, 'Loading PDF');
     const bytes = await fileToArrayBuffer(files[0]);
     const PDFLib = await window.ensureLib("PDFLib");
     const { PDFDocument } = PDFLib;
     const doc = await PDFDocument.load(bytes);
     
     progress(50, 'Setting metadata');
     if (opts.title) doc.setTitle(opts.title);
     if (opts.author) doc.setAuthor(opts.author);
     if (opts.subject) doc.setSubject(opts.subject);
     if (opts.keywords) doc.setKeywords(opts.keywords.split(',').map(k => k.trim()));
     
     progress(90, 'Saving PDF');
     const pdfBytes = await doc.save();
     return [{ name: 'metadata_edited.pdf', blob: new Blob([pdfBytes], {type:'application/pdf'}) }];
   }
 },
{
   id:'remove-pdf-metadata', category:'PDF Bench', title:'Remove PDF Metadata',
   desc:'Strip all document metadata keys.',
   accept:'.pdf', multiple:false, minFiles:1, hint:'One PDF',
   options:[],
   run: async (files, opts, progress) => {
     progress(10, 'Loading PDF');
     const bytes = await fileToArrayBuffer(files[0]);
     const PDFLib = await window.ensureLib("PDFLib");
     const { PDFDocument } = PDFLib;
     const doc = await PDFDocument.load(bytes);
     
     progress(50, 'Removing metadata');
     doc.setTitle('');
     doc.setAuthor('');
     doc.setSubject('');
     doc.setKeywords([]);
     doc.setProducer('');
     doc.setCreator('');
     
     progress(90, 'Saving PDF');
     const pdfBytes = await doc.save();
     return [{ name: 'metadata_removed.pdf', blob: new Blob([pdfBytes], {type:'application/pdf'}) }];
   }
 },
{
  id:'pdf-to-markdown', category:'PDF Bench', title:'PDF to Markdown',
  desc:'Extract formatted text into Markdown (.md) preserving headings, bullet lists, and paragraphs.',
  accept:'.pdf', multiple:false, minFiles:1, hint:'One PDF file',
  options:[],
  run: async (files, opts, progress) => {
    progress(10, 'Loading PDF');
    const bytes = await fileToArrayBuffer(files[0]);
    const pdfjsLib = await window.ensureLib("pdfjsLib");
    const doc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
    const total = doc.numPages;

    let markdown = `# ${files[0].name.replace(/\.pdf$/i, '')}\n\n`;

    for (let i = 1; i <= total; i++) {
      progress(Math.round((i / total) * 85), `Processing page ${i} of ${total}`);
      const rows = await extractTextLines(doc, i);
      if (rows.length === 0) continue;

      markdown += `## Page ${i}\n\n`;

      // Find average font size for this page
      let totalFs = 0, count = 0;
      for (const r of rows) {
        for (const item of r) {
          totalFs += item.fontSize;
          count++;
        }
      }
      const baseFs = count > 0 ? (totalFs / count) : 12;

      let paragraph = [];
      let lastY = -Infinity;

      for (const row of rows) {
        const lineText = row.map(it => it.text).join(' ').trim();
        if (!lineText) continue;

        const rowFs = row.reduce((s, it) => s + it.fontSize, 0) / row.length;
        const gap = row[0].y - lastY;

        // Heading detection
        if (rowFs >= baseFs * 1.45 && lineText.length < 100) {
          if (paragraph.length) {
            markdown += `${paragraph.join(' ')}\n\n`;
            paragraph = [];
          }
          const level = rowFs >= baseFs * 1.8 ? '### ' : '#### ';
          markdown += `${level}${lineText}\n\n`;
          lastY = row[0].y + rowFs;
          continue;
        }

        // Bullet detection
        if (/^[\u2022\u2023\u25E6\u2043\u2219\*\-]\s+/.test(lineText)) {
          if (paragraph.length) {
            markdown += `${paragraph.join(' ')}\n\n`;
            paragraph = [];
          }
          markdown += `- ${lineText.replace(/^[\u2022\u2023\u25E6\u2043\u2219\*\-]\s*/, '')}\n`;
          lastY = row[0].y + rowFs;
          continue;
        }

        if (lastY > -Infinity && gap > rowFs * 1.8) {
          if (paragraph.length) {
            markdown += `${paragraph.join(' ')}\n\n`;
            paragraph = [];
          }
        }

        paragraph.push(lineText);
        lastY = row[0].y + rowFs;
      }

      if (paragraph.length) {
        markdown += `${paragraph.join(' ')}\n\n`;
      }

      markdown += `---\n\n`;
    }

    progress(95, 'Saving Markdown');
    return [{ name: files[0].name.replace(/\.pdf$/i, '') + '.md', blob: new Blob([markdown], { type: 'text/markdown' }) }];
  }
},
{
  id:'pdf-to-json', category:'PDF Bench', title:'PDF to JSON',
  desc:'Extract structured PDF data including pages, rows, coordinates, and font sizes into JSON format.',
  accept:'.pdf', multiple:false, minFiles:1, hint:'One PDF file',
  options:[],
  run: async (files, opts, progress) => {
    progress(10, 'Loading PDF');
    const bytes = await fileToArrayBuffer(files[0]);
    const pdfjsLib = await window.ensureLib("pdfjsLib");
    const doc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
    const total = doc.numPages;

    const documentData = {
      filename: files[0].name,
      pageCount: total,
      extractedAt: new Date().toISOString(),
      pages: []
    };

    for (let i = 1; i <= total; i++) {
      progress(Math.round((i / total) * 85), `Extracting structured data from page ${i}`);
      const page = await doc.getPage(i);
      const vp = page.getViewport({ scale: 1 });
      const rows = await extractTextLines(doc, i);

      const pageEntry = {
        pageNumber: i,
        dimensions: {
          width: Math.round(vp.width),
          height: Math.round(vp.height)
        },
        lines: []
      };

      for (const row of rows) {
        const lineText = row.map(it => it.text).join(' ');
        if (!lineText.trim()) continue;

        pageEntry.lines.push({
          text: lineText,
          y: row[0].y,
          minX: Math.min(...row.map(it => it.x)),
          maxX: Math.max(...row.map(it => it.x + it.w)),
          fontSize: Math.round(row[0].fontSize * 10) / 10,
          tokens: row.map(it => ({
            text: it.text,
            x: Math.round(it.x),
            y: Math.round(it.y),
            width: Math.round(it.w)
          }))
        });
      }

      documentData.pages.push(pageEntry);
    }

    progress(95, 'Serializing JSON');
    const jsonString = JSON.stringify(documentData, null, 2);
    return [{ name: files[0].name.replace(/\.pdf$/i, '') + '.json', blob: new Blob([jsonString], { type: 'application/json' }) }];
  }
}

);
