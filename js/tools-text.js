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
{ id:'text-to-pdf', category:'Text Bench', title:'Text to PDF', desc:'Convert text to PDF.', accept:'.txt', multiple:false, minFiles:1, hint:'One Text file', options:[], run: async () => [] },
{ id:'text-to-word', category:'Text Bench', title:'Text to Word', desc:'Convert text to Word.', accept:'.txt', multiple:false, minFiles:1, hint:'One Text file', options:[], run: async () => [] },
{ id:'text-to-html', category:'Text Bench', title:'Text to HTML', desc:'Convert text to HTML.', accept:'.txt', multiple:false, minFiles:1, hint:'One Text file', options:[], run: async () => [] },
{ id:'text-to-markdown', category:'Text Bench', title:'Text to Markdown', desc:'Convert text to Markdown.', accept:'.txt', multiple:false, minFiles:1, hint:'One Text file', options:[], run: async () => [] },
{ id:'markdown-to-html', category:'Text Bench', title:'Markdown to HTML', desc:'Convert Markdown to HTML.', accept:'.md', multiple:false, minFiles:1, hint:'One MD file', options:[], run: async () => [] },
{ id:'markdown-to-pdf', category:'Text Bench', title:'Markdown to PDF', desc:'Convert Markdown to PDF.', accept:'.md', multiple:false, minFiles:1, hint:'One MD file', options:[], run: async () => [] },
{ id:'word-counter', category:'Text Bench', title:'Word Counter', desc:'Count words in text.', accept:'.txt', multiple:false, minFiles:1, hint:'One Text file', options:[], run: async () => [] },
{ id:'character-counter', category:'Text Bench', title:'Character Counter', desc:'Count characters in text.', accept:'.txt', multiple:false, minFiles:1, hint:'One Text file', options:[], run: async () => [] },
{ id:'case-converter', category:'Text Bench', title:'Case Converter', desc:'Convert text case.', accept:'.txt', multiple:false, minFiles:1, hint:'One Text file', options:[], run: async () => [] },
{ id:'remove-duplicate-lines', category:'Text Bench', title:'Remove Duplicate Lines', desc:'Remove duplicate lines.', accept:'.txt', multiple:false, minFiles:1, hint:'One Text file', options:[], run: async () => [] },
{ id:'find-replace', category:'Text Bench', title:'Find and Replace', desc:'Find and replace text.', accept:'.txt', multiple:false, minFiles:1, hint:'One Text file', options:[], run: async () => [] },
{ id:'json-formatter', category:'Text Bench', title:'JSON Formatter', desc:'Format JSON.', accept:'.json', multiple:false, minFiles:1, hint:'One JSON file', options:[], run: async () => [] },
{ id:'json-minifier', category:'Text Bench', title:'JSON Minifier', desc:'Minify JSON.', accept:'.json', multiple:false, minFiles:1, hint:'One JSON file', options:[], run: async () => [] },
{ id:'xml-formatter', category:'Text Bench', title:'XML Formatter', desc:'Format XML.', accept:'.xml', multiple:false, minFiles:1, hint:'One XML file', options:[], run: async () => [] },
{ id:'csv-to-json', category:'Text Bench', title:'CSV to JSON', desc:'Convert CSV to JSON.', accept:'.csv', multiple:false, minFiles:1, hint:'One CSV file', options:[], run: async () => [] },
{ id:'json-to-csv', category:'Text Bench', title:'JSON to CSV', desc:'Convert JSON to CSV.', accept:'.json', multiple:false, minFiles:1, hint:'One JSON file', options:[], run: async () => [] },
{ id:'base64-encoder', category:'Text Bench', title:'Base64 Encoder', desc:'Encode to Base64.', accept:'.txt', multiple:false, minFiles:1, hint:'One Text file', options:[], run: async () => [] },
{ id:'base64-decoder', category:'Text Bench', title:'Base64 Decoder', desc:'Decode from Base64.', accept:'.txt', multiple:false, minFiles:1, hint:'One Text file', options:[], run: async () => [] },
{ id:'url-encoder', category:'Text Bench', title:'URL Encoder', desc:'Encode URL.', accept:'.txt', multiple:false, minFiles:1, hint:'One Text file', options:[], run: async () => [] },
{ id:'url-decoder', category:'Text Bench', title:'URL Decoder', desc:'Decode URL.', accept:'.txt', multiple:false, minFiles:1, hint:'One Text file', options:[], run: async () => [] }

);
