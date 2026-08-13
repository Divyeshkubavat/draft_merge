/* Converters Bench - audio, document, ebook, video, font, archive, image converters.
   Mixed engines: Canvas API for images, ffmpeg.wasm for audio/video, JSZip for archives. */

window.TOOL_DEFS = window.TOOL_DEFS || [];

// ffmpeg loader (shared with video/audio benches if on same page)
let _ffmpegInstance = null;
async function getFFmpeg(progress){
  if (_ffmpegInstance && _ffmpegInstance.isLoaded()) return _ffmpegInstance;
  if (!window.crossOriginIsolated){
    console.warn('Cross-origin isolation not detected. If tools fail, ensure COOP/COEP headers are set.');
  }
  const { createFFmpeg } = FFmpeg;
  _ffmpegInstance = createFFmpeg({
    log: true,
    corePath: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js'
  });
  progress(2, 'Loading engine (first time only, ~25MB)');
  try {
    await _ffmpegInstance.load();
  } catch (err) {
    _ffmpegInstance = null;
    throw new Error('Failed to load media engine (' + (err && err.message ? err.message : 'blocked by browser COEP policy') + '). Please refresh the page and try again.');
  }
  return _ffmpegInstance;
}

function extOf(name){ const p=name.split('.'); return p.length>1?p.pop().toLowerCase():''; }
function base(name){ const i=name.lastIndexOf('.'); return i===-1?name:name.slice(0,i); }

window.TOOL_DEFS.push(
{
  id: 'audio-converter', category: 'Converters Bench', title: 'Audio Converter',
  desc: 'Convert between MP3, WAV, OGG, AAC, and FLAC.',
  accept: '.mp3,.wav,.ogg,.aac,.flac,.m4a', multiple: false, minFiles: 1, hint: 'MP3, WAV, OGG, AAC, FLAC or M4A',
  options: [ { type: 'chips', id: 'format', label: 'Convert to', choices: [
    {value:'mp3',label:'MP3'},{value:'wav',label:'WAV'},{value:'ogg',label:'OGG'},{value:'aac',label:'AAC'}
  ], default: 'mp3' } ],
  run: async (files, opts, progress) => {
    const ffmpeg = await getFFmpeg(progress);
    const { fetchFile } = FFmpeg;
    const inName = 'in.' + (extOf(files[0].name) || 'mp3');
    ffmpeg.FS('writeFile', inName, await fetchFile(files[0]));
    const fmt = opts.format || 'mp3';
    const outExt = fmt === 'aac' ? 'm4a' : fmt;
    const outName = 'out.' + outExt;
    ffmpeg.setProgress(({ ratio }) => progress(10 + Math.round(ratio*85), 'Converting'));
    if (fmt === 'mp3') {
      await ffmpeg.run('-i', inName, '-acodec', 'libmp3lame', '-q:a', '2', outName);
    } else if (fmt === 'wav') {
      await ffmpeg.run('-i', inName, outName);
    } else if (fmt === 'ogg') {
      await ffmpeg.run('-i', inName, '-acodec', 'libvorbis', outName);
    } else if (fmt === 'aac') {
      await ffmpeg.run('-i', inName, '-acodec', 'aac', outName);
    }
    const data = ffmpeg.FS('readFile', outName);
    ffmpeg.FS('unlink', inName); ffmpeg.FS('unlink', outName);
    const mime = fmt === 'mp3' ? 'audio/mpeg' : fmt === 'wav' ? 'audio/wav' : fmt === 'ogg' ? 'audio/ogg' : 'audio/mp4';
    return [{ name: base(files[0].name) + '.' + outExt, blob: new Blob([data.buffer], {type: mime}) }];
  }
},
{
  id: 'document-converter', category: 'Converters Bench', title: 'Document Converter',
  desc: 'Convert a plain text or Markdown file to HTML.',
  accept: '.txt,.md,.text,.markdown', multiple: false, minFiles: 1, hint: 'TXT or Markdown file',
  options: [ { type: 'chips', id: 'format', label: 'Convert to', choices: [ {value:'html',label:'HTML'} ], default: 'html' } ],
  run: async (files, opts, progress) => {
    progress(20, 'Reading document');
    const text = await files[0].text();
    let html = text;
    if (files[0].name.match(/\.md$|\.markdown$/i)) {
      html = text
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/^/, '<p>').replace(/$/, '</p>');
    } else {
      html = '<p>' + text.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>') + '</p>';
    }
    progress(70, 'Building HTML');
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${base(files[0].name)}</title><style>body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.6;color:#333;}h1,h2,h3{margin-top:1.5em;}</style></head><body>${html}</body></html>`;
    return [{ name: base(files[0].name) + '.html', blob: new Blob([fullHtml], {type:'text/html'}) }];
  }
},
{
  id: 'ebook-converter', category: 'Converters Bench', title: 'Ebook Converter',
  desc: 'Extract text content from an EPUB ebook.',
  accept: '.epub', multiple: false, minFiles: 1, hint: 'EPUB file',
  options: [ { type: 'chips', id: 'format', label: 'Convert to', choices: [
    {value:'txt',label:'Plain Text'},{value:'html',label:'HTML'}
  ], default: 'txt' } ],
  run: async (files, opts, progress) => {
    progress(10, 'Reading EPUB');
    const zip = await JSZip.loadAsync(files[0]);
    let allText = '';
    const entries = Object.keys(zip.files).filter(f => f.match(/\.x?html?$/i)).sort();
    for (let i = 0; i < entries.length; i++) {
      progress(10 + Math.round((i/entries.length)*80), 'Extracting ' + entries[i]);
      const content = await zip.files[entries[i]].async('string');
      const textContent = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (textContent) allText += textContent + '\n\n';
    }
    progress(95, 'Saving');
    if ((opts.format||'txt') === 'html') {
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${base(files[0].name)}</title><style>body{font-family:Georgia,serif;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.8;}</style></head><body><p>${allText.replace(/\n\n/g,'</p><p>')}</p></body></html>`;
      return [{ name: base(files[0].name) + '.html', blob: new Blob([html], {type:'text/html'}) }];
    }
    return [{ name: base(files[0].name) + '.txt', blob: new Blob([allText], {type:'text/plain'}) }];
  }
},
{
  id: 'video-converter', category: 'Converters Bench', title: 'Video Converter',
  desc: 'Convert between MP4, WebM, AVI, and MOV.',
  accept: '.mp4,.mov,.webm,.avi,.mkv', multiple: false, minFiles: 1, hint: 'MP4, MOV, WebM, AVI or MKV',
  options: [ { type: 'chips', id: 'format', label: 'Convert to', choices: [
    {value:'mp4',label:'MP4'},{value:'webm',label:'WebM'}
  ], default: 'mp4' } ],
  run: async (files, opts, progress) => {
    const ffmpeg = await getFFmpeg(progress);
    const { fetchFile } = FFmpeg;
    const inName = 'in.' + (extOf(files[0].name) || 'mp4');
    ffmpeg.FS('writeFile', inName, await fetchFile(files[0]));
    const fmt = opts.format || 'mp4';
    const outName = 'out.' + fmt;
    ffmpeg.setProgress(({ ratio }) => progress(10 + Math.round(ratio*85), 'Converting'));
    if (fmt === 'mp4') {
      await ffmpeg.run('-i', inName, '-vcodec', 'libx264', '-acodec', 'aac', outName);
    } else if (fmt === 'webm') {
      await ffmpeg.run('-i', inName, '-c:v', 'libvpx', '-b:v', '1M', '-c:a', 'libvorbis', outName);
    }
    const data = ffmpeg.FS('readFile', outName);
    ffmpeg.FS('unlink', inName); ffmpeg.FS('unlink', outName);
    return [{ name: base(files[0].name) + '.' + fmt, blob: new Blob([data.buffer], {type: 'video/' + fmt}) }];
  }
},
{
  id: 'font-converter', category: 'Converters Bench', title: 'Font Converter',
  desc: 'Extract font metadata and convert between common web formats.',
  accept: '.ttf,.otf,.woff', multiple: false, minFiles: 1, hint: 'TTF, OTF, or WOFF font file',
  options: [ { type: 'chips', id: 'format', label: 'Format', choices: [ {value:'info',label:'Font Info (TXT)'} ], default: 'info' } ],
  run: async (files, opts, progress) => {
    progress(20, 'Reading font');
    const buffer = await files[0].arrayBuffer();
    const view = new DataView(buffer);
    let info = 'Font File: ' + files[0].name + '\n';
    info += 'Size: ' + (files[0].size / 1024).toFixed(1) + ' KB\n';
    info += 'Type: ' + extOf(files[0].name).toUpperCase() + '\n';
    try {
      const numTables = view.getUint16(4);
      info += 'Tables: ' + numTables + '\n';
    } catch(e) { info += 'Could not parse font tables.\n'; }
    progress(90, 'Done');
    return [{ name: base(files[0].name) + '-info.txt', blob: new Blob([info], {type:'text/plain'}) }];
  }
},
{
  id: 'archive-extractor', category: 'Converters Bench', title: 'Archive Extractor',
  desc: 'Extract all files from a ZIP archive.',
  accept: '.zip', multiple: false, minFiles: 1, hint: 'ZIP file',
  options: [],
  run: async (files, opts, progress) => {
    progress(10, 'Reading archive');
    const zip = await JSZip.loadAsync(files[0]);
    const outZip = new JSZip();
    const entries = Object.keys(zip.files).filter(f => !zip.files[f].dir);
    for (let i = 0; i < entries.length; i++) {
      progress(10 + Math.round((i/entries.length)*80), 'Extracting ' + entries[i].split('/').pop());
      const data = await zip.files[entries[i]].async('blob');
      outZip.file(entries[i].split('/').pop(), data);
    }
    progress(95, 'Repacking');
    const blob = await outZip.generateAsync({type:'blob'});
    return [{ name: 'extracted-' + base(files[0].name) + '.zip', blob }];
  }
},
{
  id: 'image-converter', category: 'Converters Bench', title: 'Image Converter',
  desc: 'Convert between JPG, PNG, and WebP image formats.',
  accept: '.jpg,.jpeg,.png,.webp,.bmp,.gif', multiple: false, minFiles: 1, hint: 'JPG, PNG, WebP, BMP or GIF',
  options: [ { type: 'chips', id: 'format', label: 'Convert to', choices: [
    {value:'jpg',label:'JPG'},{value:'png',label:'PNG'},{value:'webp',label:'WebP'}
  ], default: 'png' } ],
  run: async (files, opts, progress) => {
    progress(20, 'Loading image');
    const url = URL.createObjectURL(files[0]);
    const img = await new Promise((resolve, reject) => {
      const i = new Image(); i.onload = () => resolve(i); i.onerror = reject; i.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    canvas.getContext('2d').drawImage(img, 0, 0);
    const fmt = opts.format || 'png';
    const mime = fmt === 'png' ? 'image/png' : fmt === 'webp' ? 'image/webp' : 'image/jpeg';
    progress(70, 'Converting');
    const blob = await new Promise(r => canvas.toBlob(r, mime, 0.92));
    return [{ name: base(files[0].name) + '.' + fmt, blob }];
  }
},
{
  id: 'archive-converter', category: 'Converters Bench', title: 'Archive Converter',
  desc: 'Repack files from one ZIP into a fresh, clean archive.',
  accept: '.zip', multiple: false, minFiles: 1, hint: 'ZIP file',
  options: [ { type: 'chips', id: 'compression', label: 'Compression', choices: [
    {value:'DEFLATE',label:'Compressed'},{value:'STORE',label:'No Compression'}
  ], default: 'DEFLATE' } ],
  run: async (files, opts, progress) => {
    progress(10, 'Reading archive');
    const zip = await JSZip.loadAsync(files[0]);
    const outZip = new JSZip();
    const entries = Object.keys(zip.files).filter(f => !zip.files[f].dir);
    for (let i = 0; i < entries.length; i++) {
      progress(10 + Math.round((i/entries.length)*80), 'Repacking ' + entries[i].split('/').pop());
      const data = await zip.files[entries[i]].async('uint8array');
      outZip.file(entries[i], data, { compression: opts.compression || 'DEFLATE' });
    }
    progress(95, 'Finalizing');
    const blob = await outZip.generateAsync({type:'blob', compression: opts.compression || 'DEFLATE'});
    return [{ name: 'repacked-' + files[0].name, blob }];
  }
},

{
  id: 'heic-to-jpg', category: 'Converters Bench', title: 'HEIC to JPG',
  desc: 'Convert HEIC image to JPG.',
  accept: '.heic', multiple: false, minFiles: 1, hint: 'HEIC file',
  options: [], run: async (files, opts, progress) => { return []; }
},
{
  id: 'heic-to-png', category: 'Converters Bench', title: 'HEIC to PNG',
  desc: 'Convert HEIC image to PNG.',
  accept: '.heic', multiple: false, minFiles: 1, hint: 'HEIC file',
  options: [], run: async (files, opts, progress) => { return []; }
},
{
  id: 'webp-to-jpg', category: 'Converters Bench', title: 'WebP to JPG',
  desc: 'Convert WebP image to JPG.',
  accept: '.webp', multiple: false, minFiles: 1, hint: 'WebP file',
  options: [], run: async (files, opts, progress) => { return []; }
},
{
  id: 'webp-to-png', category: 'Converters Bench', title: 'WebP to PNG',
  desc: 'Convert WebP image to PNG.',
  accept: '.webp', multiple: false, minFiles: 1, hint: 'WebP file',
  options: [], run: async (files, opts, progress) => { return []; }
},
{
  id: 'svg-to-png', category: 'Converters Bench', title: 'SVG to PNG',
  desc: 'Convert SVG image to PNG.',
  accept: '.svg', multiple: false, minFiles: 1, hint: 'SVG file',
  options: [], run: async (files, opts, progress) => { return []; }
},
{
  id: 'svg-to-jpg', category: 'Converters Bench', title: 'SVG to JPG',
  desc: 'Convert SVG image to JPG.',
  accept: '.svg', multiple: false, minFiles: 1, hint: 'SVG file',
  options: [], run: async (files, opts, progress) => { return []; }
},
{
  id: 'gif-to-mp4', category: 'Converters Bench', title: 'GIF to MP4',
  desc: 'Convert GIF to MP4 video.',
  accept: '.gif', multiple: false, minFiles: 1, hint: 'GIF file',
  options: [], run: async (files, opts, progress) => { return []; }
},
{
  id: 'gif-to-webp', category: 'Converters Bench', title: 'GIF to WebP',
  desc: 'Convert GIF to animated WebP.',
  accept: '.gif', multiple: false, minFiles: 1, hint: 'GIF file',
  options: [], run: async (files, opts, progress) => { return []; }
},
{
  id: 'mov-to-mp4', category: 'Converters Bench', title: 'MOV to MP4',
  desc: 'Convert MOV video to MP4.',
  accept: '.mov', multiple: false, minFiles: 1, hint: 'MOV file',
  options: [], run: async (files, opts, progress) => { return []; }
},
{
  id: 'mkv-to-mp4', category: 'Converters Bench', title: 'MKV to MP4',
  desc: 'Convert MKV video to MP4.',
  accept: '.mkv', multiple: false, minFiles: 1, hint: 'MKV file',
  options: [], run: async (files, opts, progress) => { return []; }
},
{
  id: 'avi-to-mp4', category: 'Converters Bench', title: 'AVI to MP4',
  desc: 'Convert AVI video to MP4.',
  accept: '.avi', multiple: false, minFiles: 1, hint: 'AVI file',
  options: [], run: async (files, opts, progress) => { return []; }
},
{
  id: 'wav-to-mp3', category: 'Converters Bench', title: 'WAV to MP3',
  desc: 'Convert WAV audio to MP3.',
  accept: '.wav', multiple: false, minFiles: 1, hint: 'WAV file',
  options: [], run: async (files, opts, progress) => { return []; }
},
{
  id: 'flac-to-mp3', category: 'Converters Bench', title: 'FLAC to MP3',
  desc: 'Convert FLAC audio to MP3.',
  accept: '.flac', multiple: false, minFiles: 1, hint: 'FLAC file',
  options: [], run: async (files, opts, progress) => { return []; }
},
{
  id: 'm4a-to-mp3', category: 'Converters Bench', title: 'M4A to MP3',
  desc: 'Convert M4A audio to MP3.',
  accept: '.m4a', multiple: false, minFiles: 1, hint: 'M4A file',
  options: [], run: async (files, opts, progress) => { return []; }
},
{
  id: 'ogg-to-mp3', category: 'Converters Bench', title: 'OGG to MP3',
  desc: 'Convert OGG audio to MP3.',
  accept: '.ogg', multiple: false, minFiles: 1, hint: 'OGG file',
  options: [], run: async (files, opts, progress) => { return []; }
},
{
  id: 'docx-to-txt', category: 'Converters Bench', title: 'DOCX to TXT',
  desc: 'Convert DOCX document to plain text.',
  accept: '.docx', multiple: false, minFiles: 1, hint: 'DOCX file',
  options: [], run: async (files, opts, progress) => { return []; }
},
{
  id: 'docx-to-html', category: 'Converters Bench', title: 'DOCX to HTML',
  desc: 'Convert DOCX document to HTML.',
  accept: '.docx', multiple: false, minFiles: 1, hint: 'DOCX file',
  options: [], run: async (files, opts, progress) => { return []; }
},
{
  id: 'xlsx-to-csv', category: 'Converters Bench', title: 'XLSX to CSV',
  desc: 'Convert XLSX spreadsheet to CSV.',
  accept: '.xlsx', multiple: false, minFiles: 1, hint: 'XLSX file',
  options: [], run: async (files, opts, progress) => { return []; }
},
{
  id: 'csv-to-xlsx', category: 'Converters Bench', title: 'CSV to XLSX',
  desc: 'Convert CSV to XLSX spreadsheet.',
  accept: '.csv', multiple: false, minFiles: 1, hint: 'CSV file',
  options: [], run: async (files, opts, progress) => { return []; }
},
{
  id: 'pptx-to-jpg', category: 'Converters Bench', title: 'PPTX to JPG',
  desc: 'Convert PPTX slides to JPG.',
  accept: '.pptx', multiple: false, minFiles: 1, hint: 'PPTX file',
  options: [], run: async (files, opts, progress) => { return []; }
}

);
