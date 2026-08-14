/* Text Bench OCR on images, text-layer pull from PDFs. */

window.TOOL_DEFS = window.TOOL_DEFS || [];

window.TOOL_DEFS.push(
{
 id:'extract-text-image', category:'Text Bench', title:'Image to Text (OCR)',
 desc:'Reads printed or typed text out of a photo or scan. Works best on clear, well-lit images.',
 accept:'.jpg,.jpeg,.png,.webp', multiple:false, minFiles:1, hint:'JPG, PNG or WebP',
 options:[],
 run: async (files, opts, progress) => {
 progress(5, 'Loading OCR engine');
 const Tesseract = await window.ensureLib("Tesseract");
    const result = await Tesseract.recognize(files[0], 'eng', {
 logger: m => {
 if (m.status === 'recognizing text'){
 progress(10 + Math.round(m.progress*85), 'Reading text');
 }
 }
 });
 const text = result.data.text.trim() || '(no text detected)';
 return [{ name: files[0].name.replace(/\.[^.]+$/, '') + '.txt', blob:new Blob([text], {type:'text/plain'}) }];
 }
},
{
 id:'extract-text-pdf', category:'Text Bench', title:'PDF to Text',
 desc:'Copies the text layer out of a text-based PDF. For scanned PDFs with no text layer, use Image to Text on the page images instead.',
 accept:'.pdf', multiple:false, minFiles:1, hint:'One PDF file',
 options:[],
 run: async (files, opts, progress) => {
 const bytes = await files[0].arrayBuffer();
 const pdfjsLib = await window.ensureLib("pdfjsLib");
    const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
 let full = '';
 for (let i=1;i<=doc.numPages;i++){
 progress(Math.round((i/doc.numPages)*90), `Reading page ${i} of ${doc.numPages}`);
 const page = await doc.getPage(i);
 const content = await page.getTextContent();
 const pageText = content.items.map(it => it.str).join(' ');
 full += `\n\n- Page ${i} -\n\n` + pageText;
 }
 const text = full.trim() || '(no text layer found this PDF may be a scan)';
 return [{ name: files[0].name.replace(/\.[^.]+$/, '') + '.txt', blob:new Blob([text], {type:'text/plain'}) }];
 }
},
{
  id:'text-to-pdf', category:'Text Bench', title:'Text to PDF', desc:'Convert text to PDF.', accept:'.txt', multiple:false, minFiles:1, hint:'One Text file', options:[],
  run: async (files, opts, progress) => {
    progress(10, 'Loading PDF generator...');
    const PDFLib = await window.ensureLib('PDFLib');
    const { PDFDocument, StandardFonts, rgb } = PDFLib;
    let text = await files[0].text();
    text = text.replace(/[^\x20-\x7E\xA0-\xFF\n]/g, ' ');
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const fontSize = 12;
    const margin = 50;
    const maxLineWidth = width - margin * 2;
    
    let y = height - margin;
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
        progress(10 + Math.round((i/lines.length)*80), 'Generating PDF...');
        const words = lines[i].split(' ');
        let currentLine = '';
        for (let j = 0; j < words.length; j++) {
            const word = words[j];
            const w = font.widthOfTextAtSize(currentLine + ' ' + word, fontSize);
            if (w < maxLineWidth) {
                currentLine += (currentLine ? ' ' : '') + word;
            } else {
                page.drawText(currentLine, { x: margin, y: y, size: fontSize, font: font, color: rgb(0,0,0) });
                y -= fontSize + 2;
                currentLine = word;
                if (y < margin) {
                    page = pdfDoc.addPage();
                    y = height - margin;
                }
            }
        }
        if (currentLine) {
            page.drawText(currentLine, { x: margin, y: y, size: fontSize, font: font, color: rgb(0,0,0) });
            y -= fontSize + 2;
            if (y < margin) {
                page = pdfDoc.addPage();
                y = height - margin;
            }
        }
    }
    const pdfBytes = await pdfDoc.save();
    return [{ name: files[0].name.replace(/\.[^.]+$/, '') + '.pdf', blob: new Blob([pdfBytes], {type: 'application/pdf'}) }];
  }
},
{
  id:'text-to-word', category:'Text Bench', title:'Text to Word', desc:'Convert text to Word.', accept:'.txt', multiple:false, minFiles:1, hint:'One Text file', options:[],
  run: async (files, opts, progress) => {
    progress(20, 'Loading JSZip...');
    const JSZip = await window.ensureLib('JSZip');
    const zip = new JSZip();
    const text = await files[0].text();
    const paragraphs = text.split('\n').map(p => `<w:p><w:r><w:t>${p.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</w:t></w:r></w:p>`).join('');
    
    zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n  <Default Extension="xml" ContentType="application/xml"/>\n  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>\n</Types>`);
    zip.folder('_rels').file('.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>\n</Relationships>`);
    zip.folder('word').file('document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">\n  <w:body>${paragraphs}</w:body>\n</w:document>`);

    progress(80, 'Generating DOCX...');
    const blob = await zip.generateAsync({ type: 'blob' });
    return [{ name: files[0].name.replace(/\.[^.]+$/, '') + '.docx', blob }];
  }
},
{
  id:'text-to-html', category:'Text Bench', title:'Text to HTML', desc:'Convert text to HTML.', accept:'.txt', multiple:false, minFiles:1, hint:'One Text file', options:[],
  run: async (files, opts, progress) => {
    progress(50, 'Converting to HTML...');
    const text = await files[0].text();
    const body = text.split('\n').map(p => p.trim() ? `<p>${p.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>` : '').join('\n');
    const html = `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8">\n<title>${files[0].name}</title>\n</head>\n<body>\n${body}\n</body>\n</html>`;
    return [{ name: files[0].name.replace(/\.[^.]+$/, '') + '.html', blob: new Blob([html], {type: 'text/html'}) }];
  }
},
{
  id:'text-to-markdown', category:'Text Bench', title:'Text to Markdown', desc:'Convert text to Markdown.', accept:'.txt', multiple:false, minFiles:1, hint:'One Text file', options:[],
  run: async (files, opts, progress) => {
    progress(50, 'Converting to Markdown...');
    const text = await files[0].text();
    const md = text.split(/\n\s*\n/).map(p => p.trim()).join('\n\n');
    return [{ name: files[0].name.replace(/\.[^.]+$/, '') + '.md', blob: new Blob([md], {type: 'text/markdown'}) }];
  }
},
{
  id:'markdown-to-html', category:'Text Bench', title:'Markdown to HTML', desc:'Convert Markdown to HTML.', accept:'.md', multiple:false, minFiles:1, hint:'One MD file', options:[],
  run: async (files, opts, progress) => {
    progress(50, 'Parsing Markdown...');
    let md = await files[0].text();
    md = md.replace(/^### (.*$)/gim, '<h3>$1</h3>')
           .replace(/^## (.*$)/gim, '<h2>$1</h2>')
           .replace(/^# (.*$)/gim, '<h1>$1</h1>')
           .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
           .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
           .replace(/\*(.*)\*/gim, '<i>$1</i>')
           .replace(/!\[(.*?)\]\((.*?)\)/gim, "<img alt='$1' src='$2' />")
           .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2'>$1</a>")
           .replace(/\n$/gim, '<br />');

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${md}</body></html>`;
    return [{ name: files[0].name.replace(/\.[^.]+$/, '') + '.html', blob: new Blob([html], {type: 'text/html'}) }];
  }
},
{
  id:'markdown-to-pdf', category:'Text Bench', title:'Markdown to PDF', desc:'Convert Markdown to PDF.', accept:'.md', multiple:false, minFiles:1, hint:'One MD file', options:[],
  run: async (files, opts, progress) => {
    progress(10, 'Loading PDF generator...');
    const PDFLib = await window.ensureLib('PDFLib');
    const { PDFDocument, StandardFonts, rgb } = PDFLib;
    let md = await files[0].text();
    let text = md.replace(/[#_*~`>]/g, '');
    text = text.replace(/[^\x20-\x7E\xA0-\xFF\n]/g, ' ');

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const fontSize = 12;
    const margin = 50;
    const maxLineWidth = width - margin * 2;
    
    let y = height - margin;
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
        progress(10 + Math.round((i/lines.length)*80), 'Generating PDF...');
        const words = lines[i].split(' ');
        let currentLine = '';
        for (let j = 0; j < words.length; j++) {
            const word = words[j];
            const w = font.widthOfTextAtSize(currentLine + ' ' + word, fontSize);
            if (w < maxLineWidth) {
                currentLine += (currentLine ? ' ' : '') + word;
            } else {
                page.drawText(currentLine, { x: margin, y: y, size: fontSize, font: font, color: rgb(0,0,0) });
                y -= fontSize + 2;
                currentLine = word;
                if (y < margin) {
                    page = pdfDoc.addPage();
                    y = height - margin;
                }
            }
        }
        if (currentLine) {
            page.drawText(currentLine, { x: margin, y: y, size: fontSize, font: font, color: rgb(0,0,0) });
            y -= fontSize + 2;
            if (y < margin) {
                page = pdfDoc.addPage();
                y = height - margin;
            }
        }
    }
    const pdfBytes = await pdfDoc.save();
    return [{ name: files[0].name.replace(/\.[^.]+$/, '') + '.pdf', blob: new Blob([pdfBytes], {type: 'application/pdf'}) }];
  }
},
{
  id:'word-counter', category:'Text Bench', title:'Word Counter', desc:'Count words in text.', accept:'.txt', multiple:false, minFiles:1, hint:'One Text file', options:[],
  run: async (files, opts, progress) => {
    progress(50, 'Analyzing text...');
    const text = await files[0].text();
    const words = (text.match(/\b\w+\b/g) || []).length;
    const chars = text.length;
    const sentences = (text.match(/[^.!?]+[.!?]+/g) || []).length;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim()).length;
    const wpm = 200;
    const readingTime = Math.ceil(words / wpm);
    const report = `Words: ${words}\nCharacters: ${chars}\nSentences: ${sentences}\nParagraphs: ${paragraphs}\nEstimated Reading Time: ${readingTime} min`;
    return [{ name: 'word_count_report.txt', blob: new Blob([report], {type: 'text/plain'}) }];
  }
},
{
  id:'character-counter', category:'Text Bench', title:'Character Counter', desc:'Count characters in text.', accept:'.txt', multiple:false, minFiles:1, hint:'One Text file', options:[],
  run: async (files, opts, progress) => {
    progress(50, 'Analyzing characters...');
    const text = await files[0].text();
    const charsTotal = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    const vowels = (text.match(/[aeiou]/gi) || []).length;
    const consonants = (text.match(/[bcdfghjklmnpqrstvwxyz]/gi) || []).length;
    const digits = (text.match(/\d/g) || []).length;
    const report = `Total Characters: ${charsTotal}\nCharacters (no spaces): ${charsNoSpaces}\nVowels: ${vowels}\nConsonants: ${consonants}\nDigits: ${digits}`;
    return [{ name: 'character_count_report.txt', blob: new Blob([report], {type: 'text/plain'}) }];
  }
},
{
  id:'case-converter', category:'Text Bench', title:'Case Converter', desc:'Convert text case.', accept:'.txt', multiple:false, minFiles:1, hint:'One Text file',
  options:[{ id:'caseType', type:'chips', label:'Case', values:['Uppercase', 'Lowercase', 'Title Case', 'Sentence Case'], default:'Uppercase' }],
  run: async (files, opts, progress) => {
    progress(50, 'Converting case...');
    const text = await files[0].text();
    let res = text;
    if (opts.caseType === 'Uppercase') res = text.toUpperCase();
    else if (opts.caseType === 'Lowercase') res = text.toLowerCase();
    else if (opts.caseType === 'Title Case') res = text.replace(/\b\w/g, c => c.toUpperCase());
    else if (opts.caseType === 'Sentence Case') res = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
    return [{ name: files[0].name.replace(/\.[^.]+$/, '') + '_case.txt', blob: new Blob([res], {type: 'text/plain'}) }];
  }
},
{
  id:'remove-duplicate-lines', category:'Text Bench', title:'Remove Duplicate Lines', desc:'Remove duplicate lines.', accept:'.txt', multiple:false, minFiles:1, hint:'One Text file', options:[],
  run: async (files, opts, progress) => {
    progress(50, 'Removing duplicates...');
    const text = await files[0].text();
    const lines = text.split('\n');
    const unique = [...new Set(lines)];
    const res = unique.join('\n');
    return [{ name: files[0].name.replace(/\.[^.]+$/, '') + '_dedup.txt', blob: new Blob([res], {type: 'text/plain'}) }];
  }
},
{
  id:'find-replace', category:'Text Bench', title:'Find and Replace', desc:'Find and replace text.', accept:'.txt', multiple:false, minFiles:1, hint:'One Text file',
  options:[{ id:'findStr', type:'text', label:'Find', default:'' }, { id:'replaceStr', type:'text', label:'Replace', default:'' }],
  run: async (files, opts, progress) => {
    progress(50, 'Replacing...');
    const text = await files[0].text();
    const findStr = opts.findStr;
    const replaceStr = opts.replaceStr;
    const escapedFind = findStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const res = findStr ? text.replace(new RegExp(escapedFind, 'g'), replaceStr) : text;
    return [{ name: files[0].name.replace(/\.[^.]+$/, '') + '_replaced.txt', blob: new Blob([res], {type: 'text/plain'}) }];
  }
},
{
  id:'json-formatter', category:'Text Bench', title:'JSON Formatter', desc:'Format JSON.', accept:'.json', multiple:false, minFiles:1, hint:'One JSON file', options:[],
  run: async (files, opts, progress) => {
    progress(50, 'Formatting JSON...');
    const text = await files[0].text();
    let res = text;
    try {
      res = JSON.stringify(JSON.parse(text), null, 2);
    } catch(e) {}
    return [{ name: files[0].name.replace(/\.[^.]+$/, '') + '_formatted.json', blob: new Blob([res], {type: 'application/json'}) }];
  }
},
{
  id:'json-minifier', category:'Text Bench', title:'JSON Minifier', desc:'Minify JSON.', accept:'.json', multiple:false, minFiles:1, hint:'One JSON file', options:[],
  run: async (files, opts, progress) => {
    progress(50, 'Minifying JSON...');
    const text = await files[0].text();
    let res = text;
    try {
      res = JSON.stringify(JSON.parse(text));
    } catch(e) {}
    return [{ name: files[0].name.replace(/\.[^.]+$/, '') + '_min.json', blob: new Blob([res], {type: 'application/json'}) }];
  }
},
{
  id:'xml-formatter', category:'Text Bench', title:'XML Formatter', desc:'Format XML.', accept:'.xml', multiple:false, minFiles:1, hint:'One XML file', options:[],
  run: async (files, opts, progress) => {
    progress(50, 'Formatting XML...');
    let xml = await files[0].text();
    let formatted = '';
    let pad = 0;
    xml = xml.replace(/(>)(<)(\/*)/g, '$1\n$2$3');
    xml.split('\n').forEach(node => {
      let indent = 0;
      if (node.match(/.+<\/\w[^>]*>$/)) {
        indent = 0;
      } else if (node.match(/^<\/\w/)) {
        if (pad != 0) pad -= 1;
      } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
        indent = 1;
      } else {
        indent = 0;
      }
      formatted += '  '.repeat(pad) + node + '\n';
      pad += indent;
    });
    return [{ name: files[0].name.replace(/\.[^.]+$/, '') + '_formatted.xml', blob: new Blob([formatted], {type: 'application/xml'}) }];
  }
},
{
  id:'csv-to-json', category:'Text Bench', title:'CSV to JSON', desc:'Convert CSV to JSON.', accept:'.csv', multiple:false, minFiles:1, hint:'One CSV file', options:[],
  run: async (files, opts, progress) => {
    progress(50, 'Parsing CSV...');
    const text = await files[0].text();
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length === 0) return [];
    const headers = lines[0].split(',');
    const result = [];
    for (let i = 1; i < lines.length; i++) {
      const obj = {};
      const currentline = lines[i].split(',');
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentline[j] || '';
      }
      result.push(obj);
    }
    return [{ name: files[0].name.replace(/\.[^.]+$/, '') + '.json', blob: new Blob([JSON.stringify(result, null, 2)], {type: 'application/json'}) }];
  }
},
{
  id:'json-to-csv', category:'Text Bench', title:'JSON to CSV', desc:'Convert JSON to CSV.', accept:'.json', multiple:false, minFiles:1, hint:'One JSON file', options:[],
  run: async (files, opts, progress) => {
    progress(50, 'Converting to CSV...');
    const text = await files[0].text();
    let arr = [];
    try {
      arr = JSON.parse(text);
    } catch(e) {}
    if (!Array.isArray(arr) || arr.length === 0) return [];
    const headers = Object.keys(arr[0]);
    let csv = headers.join(',') + '\n';
    for (const obj of arr) {
      csv += headers.map(h => {
        let val = obj[h] === null || obj[h] === undefined ? '' : String(obj[h]);
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          val = '"' + val.replace(/"/g, '""') + '"';
        }
        return val;
      }).join(',') + '\n';
    }
    return [{ name: files[0].name.replace(/\.[^.]+$/, '') + '.csv', blob: new Blob([csv], {type: 'text/csv'}) }];
  }
},
{
  id:'base64-encoder', category:'Text Bench', title:'Base64 Encoder', desc:'Encode to Base64.', accept:'.txt', multiple:false, minFiles:1, hint:'One Text file', options:[],
  run: async (files, opts, progress) => {
    progress(50, 'Encoding to Base64...');
    const buffer = await files[0].arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    const b64 = btoa(binary);
    return [{ name: files[0].name.replace(/\.[^.]+$/, '') + '_base64.txt', blob: new Blob([b64], {type: 'text/plain'}) }];
  }
},
{
  id:'base64-decoder', category:'Text Bench', title:'Base64 Decoder', desc:'Decode from Base64.', accept:'.txt', multiple:false, minFiles:1, hint:'One Text file', options:[],
  run: async (files, opts, progress) => {
    progress(50, 'Decoding Base64...');
    let text = await files[0].text();
    text = text.trim();
    let decoded;
    try {
      const binary = atob(text);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
      }
      decoded = bytes;
    } catch(e) {
      decoded = new Uint8Array();
    }
    return [{ name: files[0].name.replace(/\.[^.]+$/, '') + '_decoded.bin', blob: new Blob([decoded], {type: 'application/octet-stream'}) }];
  }
},
{
  id:'url-encoder', category:'Text Bench', title:'URL Encoder', desc:'Encode URL.', accept:'.txt', multiple:false, minFiles:1, hint:'One Text file', options:[],
  run: async (files, opts, progress) => {
    progress(50, 'Encoding URL...');
    const text = await files[0].text();
    const res = encodeURIComponent(text);
    return [{ name: files[0].name.replace(/\.[^.]+$/, '') + '_url.txt', blob: new Blob([res], {type: 'text/plain'}) }];
  }
},
{
  id:'url-decoder', category:'Text Bench', title:'URL Decoder', desc:'Decode URL.', accept:'.txt', multiple:false, minFiles:1, hint:'One Text file', options:[],
  run: async (files, opts, progress) => {
    progress(50, 'Decoding URL...');
    const text = await files[0].text();
    let res = text;
    try {
      res = decodeURIComponent(text);
    } catch(e) {}
    return [{ name: files[0].name.replace(/\.[^.]+$/, '') + '_urldec.txt', blob: new Blob([res], {type: 'text/plain'}) }];
  }
}

);
