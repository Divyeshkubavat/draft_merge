/* Text Bench — OCR on images, text-layer pull from PDFs. */

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
      full += `\n\n----- Page ${i} -----\n\n` + pageText;
    }
    const text = full.trim() || '(no text layer found — this PDF may be a scan)';
    return [{ name: files[0].name.replace(/\.[^.]+$/, '') + '.txt', blob:new Blob([text], {type:'text/plain'}) }];
  }
}
);
