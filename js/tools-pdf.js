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
 desc:'Convert a DOCX document into a PDF.',
 accept:'.docx', multiple:false, minFiles:1, hint:'One DOCX file',
 options:[],
 run: async (files, opts, progress) => {
 progress(10, 'Reading DOCX');
 const JSZip = await window.ensureLib("JSZip");
    const zip = await JSZip.loadAsync(files[0]);
 const docXml = await zip.file('word/document.xml').async('string');
 const text = docXml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
 progress(50, 'Creating PDF');
 const PDFLib = await window.ensureLib("PDFLib");
    const { PDFDocument, StandardFonts, rgb } = PDFLib;
 const doc = await PDFDocument.create();
 const font = await doc.embedFont(StandardFonts.Helvetica);
 const fontSize = 11;
 const margin = 50;
 const pageWidth = 595; const pageHeight = 842;
 const maxWidth = pageWidth - margin * 2;
 const words = text.split(' ');
 let currentPage = doc.addPage([pageWidth, pageHeight]);
 let y = pageHeight - margin;
 let line = '';
 for (const word of words) {
 const testLine = line ? line + ' ' + word : word;
 const width = font.widthOfTextAtSize(testLine, fontSize);
 if (width > maxWidth) {
 currentPage.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0,0,0) });
 y -= fontSize * 1.5;
 line = word;
 if (y < margin) {
 currentPage = doc.addPage([pageWidth, pageHeight]);
 y = pageHeight - margin;
 }
 } else {
 line = testLine;
 }
 }
 if (line) currentPage.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0,0,0) });
 progress(90, 'Saving PDF');
 const pdfBytes = await doc.save();
 return [{ name: files[0].name.replace(/\.docx$/i, '') + '.pdf', blob: new Blob([pdfBytes], {type:'application/pdf'}) }];
 }
},
{
 id:'pdf-to-word', category:'PDF Bench', title:'PDF to Word',
 desc:'Extract all text from a PDF into a plain text document.',
 accept:'.pdf', multiple:false, minFiles:1, hint:'One PDF file',
 options:[],
 run: async (files, opts, progress) => {
 const bytes = await fileToArrayBuffer(files[0]);
 const pdfjsLib = await window.ensureLib("pdfjsLib");
    const pdfjsDoc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
 const total = pdfjsDoc.numPages;
 let fullText = '';
 for(let i=1; i<=total; i++) {
 progress(Math.round((i/total)*90), `Extracting text from page ${i}`);
 const page = await pdfjsDoc.getPage(i);
 const content = await page.getTextContent();
 const strings = content.items.map(item => item.str);
 fullText += strings.join(' ') + '\n\n';
 }
 progress(95, 'Saving text');
 return [{ name: files[0].name.replace(/\.pdf$/i, '') + '.txt', blob: new Blob([fullText], {type:'text/plain'}) }];
 }
},
{
 id:'pdf-to-excel', category:'PDF Bench', title:'PDF to Excel',
 desc:'Extract text from a PDF and save as CSV for spreadsheet import.',
 accept:'.pdf', multiple:false, minFiles:1, hint:'One PDF file',
 options:[],
 run: async (files, opts, progress) => {
 const bytes = await fileToArrayBuffer(files[0]);
 const pdfjsLib = await window.ensureLib("pdfjsLib");
    const pdfjsDoc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
 const total = pdfjsDoc.numPages;
 let csvData = '';
 for(let i=1; i<=total; i++) {
 progress(Math.round((i/total)*90), `Extracting page ${i}`);
 const page = await pdfjsDoc.getPage(i);
 const content = await page.getTextContent();
 csvData += content.items.map(item => `"${item.str.replace(/"/g, '""')}"`).join(',') + '\n';
 }
 return [{ name: files[0].name.replace(/\.pdf$/i, '') + '.csv', blob: new Blob([csvData], {type:'text/csv'}) }];
 }
},
{
 id:'excel-to-pdf', category:'PDF Bench', title:'Excel to PDF',
 desc:'Convert a CSV spreadsheet into a formatted PDF.',
 accept:'.csv', multiple:false, minFiles:1, hint:'One CSV file',
 options:[],
 run: async (files, opts, progress) => {
 const text = await files[0].text();
 const lines = text.split('\n');
 const PDFLib = await window.ensureLib("PDFLib");
    const { PDFDocument, StandardFonts, rgb } = PDFLib;
 const doc = await PDFDocument.create();
 const font = await doc.embedFont(StandardFonts.Helvetica);
 const fontSize = 10;
 const margin = 40;
 const pageWidth = 842; const pageHeight = 595;
 let currentPage = doc.addPage([pageWidth, pageHeight]);
 let y = pageHeight - margin;
 for(let i=0; i<lines.length; i++) {
 progress(Math.round((i/lines.length)*90), `Rendering row ${i+1}`);
 const line = lines[i].trim();
 if(!line) continue;
 const cols = line.split(',');
 let x = margin;
 for(let c=0; c<cols.length; c++) {
 let val = cols[c].replace(/^"|"$/g, '');
 currentPage.drawText(val, { x, y, size: fontSize, font, color: rgb(0,0,0) });
 x += 100;
 }
 y -= fontSize * 1.5;
 if (y < margin) {
 currentPage = doc.addPage([pageWidth, pageHeight]);
 y = pageHeight - margin;
 }
 }
 const pdfBytes = await doc.save();
 return [{ name: files[0].name.replace(/\.csv$/i, '') + '.pdf', blob: new Blob([pdfBytes], {type:'application/pdf'}) }];
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
 progress(40, 'Unlocking');
 const doc = await PDFDocument.load(bytes, { password: opts.password || '' });
 progress(80, 'Saving unlocked PDF');
 const out = await doc.save();
 return [{ name: 'unlocked.pdf', blob: new Blob([out], {type:'application/pdf'}) }];
 }
},
{
  id:'protect-pdf', category:'PDF Bench', title:'Protect PDF',
  desc:'Re-saves a PDF. Note: browser-based encryption is limited, so this just rebuilds the file.',
  accept:'.pdf', multiple:false, minFiles:1, hint:'One PDF file',
  options:[ { type:'text', id:'password', label:'Set Password', placeholder:'Enter password' } ],
  run: async (files, opts, progress) => {
  progress(20, 'Reading PDF');
  const bytes = await fileToArrayBuffer(files[0]);
  const PDFLib = await window.ensureLib("PDFLib");
     const { PDFDocument } = PDFLib;
  const doc = await PDFDocument.load(bytes);
  progress(80, 'Setting permissions (rebuilding)');
  const out = await doc.save();
  return [{ name: 'protected.pdf', blob: new Blob([out], {type:'application/pdf'}) }];
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
  desc:'Convert PDF content into an HTML document.',
  accept:'.pdf', multiple:false, minFiles:1, hint:'One PDF file',
  options:[],
  run: async (files, opts, progress) => {
  const bytes = await fileToArrayBuffer(files[0]);
  const pdfjsLib = await window.ensureLib("pdfjsLib");
     const pdfjsDoc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
  const total = pdfjsDoc.numPages;
  let html = '<!DOCTYPE html><html><body>';
  for(let i=1; i<=total; i++) {
  progress(Math.round((i/total)*90), `Extracting page ${i}`);
  const page = await pdfjsDoc.getPage(i);
  const content = await page.getTextContent();
  html += `<div>${content.items.map(item => item.str).join(' ')}</div><hr>`;
  }
  html += '</body></html>';
  progress(95, 'Saving HTML');
  return [{ name: files[0].name.replace(/\.pdf$/i, '') + '.html', blob: new Blob([html], {type:'text/html'}) }];
  }
 },
 {
  id:'ppt-to-pdf', category:'PDF Bench', title:'PPT to PDF',
  desc:'Convert PowerPoint slides to a PDF document.',
  accept:'.pptx', multiple:false, minFiles:1, hint:'One PPTX file',
  options:[],
  run: async (files, opts, progress) => {
  progress(10, 'Reading PPTX');
  const JSZip = await window.ensureLib("JSZip");
     const zip = await JSZip.loadAsync(files[0]);
  let slideIndex = 1;
  let slides = [];
  while(zip.file(`ppt/slides/slide${slideIndex}.xml`)) {
  const xml = await zip.file(`ppt/slides/slide${slideIndex}.xml`).async('string');
  const text = xml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  slides.push(text);
  slideIndex++;
  }
  progress(50, 'Creating PDF');
  const PDFLib = await window.ensureLib("PDFLib");
     const { PDFDocument, StandardFonts, rgb } = PDFLib;
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;
  for(let i=0; i<slides.length; i++) {
  progress(Math.round((i/slides.length)*40)+50, `Rendering slide ${i+1}`);
  const page = doc.addPage([842, 595]);
  const safeText = slides[i].replace(/[^\x20-\x7E\xA0-\xFF]/g, ' ');
  const words = safeText.split(' ');
  let line = '';
  let y = 550;
  for (const word of words) {
    if (font.widthOfTextAtSize(line + word + ' ', fontSize) > 742) {
      page.drawText(line, { x: 50, y, size: fontSize, font, color: rgb(0,0,0) });
      line = word + ' ';
      y -= 15;
    } else {
      line += word + ' ';
    }
  }
  if (line) {
    page.drawText(line, { x: 50, y, size: fontSize, font, color: rgb(0,0,0) });
  }
  }
  progress(90, 'Saving PDF');
  const pdfBytes = await doc.save();
  return [{ name: files[0].name.replace(/\.pptx$/i, '') + '.pdf', blob: new Blob([pdfBytes], {type:'application/pdf'}) }];
  }
 },
 {
   id:'extract-pdf-pages', category:'PDF Bench', title:'Extract PDF Pages',
   desc:'Extract selected page ranges into a new PDF.',
   accept:'.pdf', multiple:false, minFiles:1, hint:'One PDF',
   options:[ { type:'text', id:'ranges', label:'Pages (e.g. 1, 3-5)', placeholder:'1,3-5' } ],
   run: async (files, opts, progress) => {
     progress(10, 'Loading PDF');
     const bytes = await fileToArrayBuffer(files[0]);
     const PDFLib = await window.ensureLib("PDFLib");
     const { PDFDocument } = PDFLib;
     const srcDoc = await PDFDocument.load(bytes);
     const outDoc = await PDFDocument.create();
     
     const total = srcDoc.getPageCount();
     let indices = [];
     const parts = (opts.ranges || '').split(',');
     for (const p of parts) {
       const trimmed = p.trim();
       if (!trimmed) continue;
       if (trimmed.includes('-')) {
         const [start, end] = trimmed.split('-').map(n => parseInt(n, 10));
         if (!isNaN(start) && !isNaN(end)) {
           for (let i = start; i <= end; i++) {
             if (i >= 1 && i <= total) indices.push(i - 1);
           }
         }
       } else {
         const n = parseInt(trimmed, 10);
         if (!isNaN(n) && n >= 1 && n <= total) indices.push(n - 1);
       }
     }
     
     if (indices.length > 0) {
       progress(50, 'Extracting pages');
       const pages = await outDoc.copyPages(srcDoc, indices);
       pages.forEach(p => outDoc.addPage(p));
     }
     progress(90, 'Saving PDF');
     const pdfBytes = await outDoc.save();
     return [{ name: 'extracted.pdf', blob: new Blob([pdfBytes], {type:'application/pdf'}) }];
   }
 },
 {
   id:'delete-pdf-pages', category:'PDF Bench', title:'Delete PDF Pages',
   desc:'Remove specified page numbers from a PDF.',
   accept:'.pdf', multiple:false, minFiles:1, hint:'One PDF',
   options:[ { type:'text', id:'pages', label:'Pages to remove (e.g. 2,4)', placeholder:'2,4' } ],
   run: async (files, opts, progress) => {
     progress(10, 'Loading PDF');
     const bytes = await fileToArrayBuffer(files[0]);
     const PDFLib = await window.ensureLib("PDFLib");
     const { PDFDocument } = PDFLib;
     const srcDoc = await PDFDocument.load(bytes);
     const outDoc = await PDFDocument.create();
     
     const total = srcDoc.getPageCount();
     const toRemove = new Set((opts.pages || '').split(',').map(n => parseInt(n.trim(), 10) - 1));
     let indices = [];
     for (let i = 0; i < total; i++) {
       if (!toRemove.has(i)) indices.push(i);
     }
     
     if (indices.length > 0) {
       progress(50, 'Copying pages');
       const pages = await outDoc.copyPages(srcDoc, indices);
       pages.forEach(p => outDoc.addPage(p));
     }
     
     progress(90, 'Saving PDF');
     const pdfBytes = await outDoc.save();
     return [{ name: 'deleted.pdf', blob: new Blob([pdfBytes], {type:'application/pdf'}) }];
   }
 },
 {
   id:'rearrange-pdf-pages', category:'PDF Bench', title:'Rearrange PDF Pages',
   desc:'Reorder pages using an index array.',
   accept:'.pdf', multiple:false, minFiles:1, hint:'One PDF',
   options:[ { type:'text', id:'order', label:'New order (e.g. 3,2,1)', placeholder:'3,2,1' } ],
   run: async (files, opts, progress) => {
     progress(10, 'Loading PDF');
     const bytes = await fileToArrayBuffer(files[0]);
     const PDFLib = await window.ensureLib("PDFLib");
     const { PDFDocument } = PDFLib;
     const srcDoc = await PDFDocument.load(bytes);
     const outDoc = await PDFDocument.create();
     
     const total = srcDoc.getPageCount();
     let indices = [];
     const parts = (opts.order || '').split(',');
     for (const p of parts) {
       const n = parseInt(p.trim(), 10);
       if (!isNaN(n) && n >= 1 && n <= total) indices.push(n - 1);
     }
     
     if (indices.length > 0) {
       progress(50, 'Rearranging pages');
       const pages = await outDoc.copyPages(srcDoc, indices);
       pages.forEach(p => outDoc.addPage(p));
     }
     
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
   desc:'Render each page as PNG image and zip all pages together.',
   accept:'.pdf', multiple:false, minFiles:1, hint:'One PDF',
   options:[],
   run: async (files, opts, progress) => {
     progress(10, 'Loading PDF');
     const bytes = await fileToArrayBuffer(files[0]);
     const pdfjsLib = await window.ensureLib("pdfjsLib");
     const pdfjsDoc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
     const total = pdfjsDoc.numPages;
     
     const JSZip = await window.ensureLib("JSZip");
     const zip = new JSZip();
     
     for (let i = 1; i <= total; i++) {
       progress(Math.round((i/total)*90), `Rendering Page ${i} of ${total}`);
       const canvas = await renderPdfPageToCanvas(pdfjsDoc, i, 2);
       const blob = await canvasToBlob(canvas, 'image/png');
       zip.file(`page-${String(i).padStart(3, '0')}.png`, blob);
     }
     
     progress(95, 'Zipping images');
     const zipBlob = await zip.generateAsync({ type:'blob' });
     return [{ name: 'pdf_images.zip', blob: zipBlob }];
   }
 },
 {
   id:'sign-pdf', category:'PDF Bench', title:'Sign PDF',
   desc:'Stamp a SIGNED watermark on the first page.',
   accept:'.pdf', multiple:false, minFiles:1, hint:'One PDF (and optional image)',
   options:[],
   run: async (files, opts, progress) => {
     progress(10, 'Loading PDF');
     const bytes = await fileToArrayBuffer(files[0]);
     const PDFLib = await window.ensureLib("PDFLib");
     const { PDFDocument, rgb } = PDFLib;
     const doc = await PDFDocument.load(bytes);
     
     progress(50, 'Applying watermark');
     const pages = doc.getPages();
     if (pages.length > 0) {
       const firstPage = pages[0];
       firstPage.drawText('SIGNED', {
         x: 50,
         y: 50,
         size: 48,
         color: rgb(1, 0, 0),
         opacity: 0.5
       });
     }
     
     progress(90, 'Saving PDF');
     const pdfBytes = await doc.save();
     return [{ name: 'signed.pdf', blob: new Blob([pdfBytes], {type:'application/pdf'}) }];
   }
 },
 {
   id:'fill-pdf-forms', category:'PDF Bench', title:'Fill PDF Forms',
   desc:'Fill form fields with placeholder values and flatten.',
   accept:'.pdf', multiple:false, minFiles:1, hint:'One PDF',
   options:[],
   run: async (files, opts, progress) => {
     progress(10, 'Loading PDF');
     const bytes = await fileToArrayBuffer(files[0]);
     const PDFLib = await window.ensureLib("PDFLib");
     const { PDFDocument } = PDFLib;
     const doc = await PDFDocument.load(bytes);
     
     progress(50, 'Filling forms');
     const form = doc.getForm();
     const fields = form.getFields();
     let notes = '';
     if (fields.length === 0) {
       notes = 'No form fields found. ';
     } else {
       for (const field of fields) {
         try {
           if (field.constructor.name.includes('TextField')) {
             field.setText('Filled Field');
           }
         } catch(e) {}
       }
       form.flatten();
     }
     
     progress(90, 'Saving PDF');
     const pdfBytes = await doc.save();
     return [{ name: notes ? 'unfilled.pdf' : 'filled.pdf', blob: new Blob([pdfBytes], {type:'application/pdf'}) }];
   }
 },
 {
   id:'compare-pdfs', category:'PDF Bench', title:'Compare PDFs',
   desc:'Compare text content of two PDFs.',
   accept:'.pdf', multiple:true, minFiles:2, hint:'Two PDFs',
   options:[],
   run: async (files, opts, progress) => {
     progress(10, 'Loading PDFs');
     const pdfjsLib = await window.ensureLib("pdfjsLib");
     
     const extractText = async (file) => {
       const bytes = await fileToArrayBuffer(file);
       const doc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
       let text = [];
       for (let i = 1; i <= doc.numPages; i++) {
         const page = await doc.getPage(i);
         const content = await page.getTextContent();
         text.push(content.items.map(it => it.str).join(' '));
       }
       return text;
     };
     
     progress(40, 'Extracting text from PDF 1');
     const text1 = await extractText(files[0]);
     progress(70, 'Extracting text from PDF 2');
     const text2 = await extractText(files[1]);
     
     progress(90, 'Comparing text');
     let html = '<!DOCTYPE html><html><body><h2>PDF Comparison</h2>';
     const maxPages = Math.max(text1.length, text2.length);
     for (let i = 0; i < maxPages; i++) {
       html += `<h3>Page ${i + 1}</h3>`;
       const t1 = text1[i] || '';
       const t2 = text2[i] || '';
       if (t1 === t2) {
         html += `<p style="color:gray;">Identical</p>`;
       } else {
         html += `<h4>File 1:</h4><p style="color:red;">${t1}</p>`;
         html += `<h4>File 2:</h4><p style="color:green;">${t2}</p>`;
       }
       html += `<hr>`;
     }
     html += '</body></html>';
     
     return [{ name: 'comparison.html', blob: new Blob([html], {type:'text/html'}) }];
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
   desc:'Extract text formatted as Markdown.',
   accept:'.pdf', multiple:false, minFiles:1, hint:'One PDF',
   options:[],
   run: async (files, opts, progress) => {
     progress(10, 'Loading PDF');
     const bytes = await fileToArrayBuffer(files[0]);
     const pdfjsLib = await window.ensureLib("pdfjsLib");
     const doc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
     const total = doc.numPages;
     
     let md = '';
     for (let i = 1; i <= total; i++) {
       progress(Math.round((i/total)*90), `Extracting Page ${i}`);
       const page = await doc.getPage(i);
       const content = await page.getTextContent();
       const text = content.items.map(it => it.str).join(' ');
       md += `# Page ${i}\n\n${text}\n\n---\n\n`;
     }
     
     return [{ name: 'extracted.md', blob: new Blob([md], {type:'text/markdown'}) }];
   }
 },
 {
   id:'pdf-to-json', category:'PDF Bench', title:'PDF to JSON',
   desc:'Extract text structured as JSON page array.',
   accept:'.pdf', multiple:false, minFiles:1, hint:'One PDF',
   options:[],
   run: async (files, opts, progress) => {
     progress(10, 'Loading PDF');
     const bytes = await fileToArrayBuffer(files[0]);
     const pdfjsLib = await window.ensureLib("pdfjsLib");
     const doc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
     const total = doc.numPages;
     
     let data = [];
     for (let i = 1; i <= total; i++) {
       progress(Math.round((i/total)*90), `Extracting Page ${i}`);
       const page = await doc.getPage(i);
       const content = await page.getTextContent();
       const text = content.items.map(it => it.str).join(' ');
       data.push({ page: i, text });
     }
     
     const jsonString = JSON.stringify(data, null, 2);
     return [{ name: 'extracted.json', blob: new Blob([jsonString], {type:'application/json'}) }];
   }
 }

);
