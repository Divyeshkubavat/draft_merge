/* Image Bench — compress, resize, crop, convert, rotate, watermark. Pure Canvas API. */

window.TOOL_DEFS = window.TOOL_DEFS || [];

function loadImageFromFile(file){
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { resolve(img); };
    img.onerror = reject;
    img.src = url;
  });
}

function mimeFor(ext){
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  return 'image/jpeg';
}

function extFromName(name){
  const parts = name.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : 'jpg';
}

function baseName(name){
  const idx = name.lastIndexOf('.');
  return idx === -1 ? name : name.slice(0, idx);
}

window.TOOL_DEFS.push(
{
  id:'compress-image', category:'Image Bench', title:'Compress Image',
  desc:'Reduce file size by re-encoding at a lower quality. Best on JPG photos.',
  accept:'.jpg,.jpeg,.png,.webp', multiple:false, minFiles:1, hint:'JPG, PNG or WebP',
  options:[ { type:'range', id:'quality', label:'Quality', min:20, max:95, step:5, default:70, suffix:'%' } ],
  run: async (files, opts, progress) => {
    progress(20,'Loading image');
    const img = await loadImageFromFile(files[0]);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    canvas.getContext('2d').drawImage(img,0,0);
    progress(70,'Re-encoding');
    const q = parseInt(opts.quality||70,10)/100;
    const blob = await new Promise(r => canvas.toBlob(r,'image/jpeg', q));
    progress(95,'Done');
    return [{ name: baseName(files[0].name)+'-compressed.jpg', blob }];
  }
},
{
  id:'resize-image', category:'Image Bench', title:'Resize Image',
  desc:'Set an exact width in pixels — height scales to match automatically.',
  accept:'.jpg,.jpeg,.png,.webp', multiple:false, minFiles:1, hint:'JPG, PNG or WebP',
  options:[ { type:'range', id:'width', label:'Target width', min:100, max:4000, step:10, default:1080, suffix:'px' } ],
  run: async (files, opts, progress) => {
    progress(20,'Loading image');
    const img = await loadImageFromFile(files[0]);
    const targetW = parseInt(opts.width||1080,10);
    const ratio = img.naturalHeight / img.naturalWidth;
    const targetH = Math.round(targetW * ratio);
    const canvas = document.createElement('canvas');
    canvas.width = targetW; canvas.height = targetH;
    canvas.getContext('2d').drawImage(img,0,0,targetW,targetH);
    progress(80,'Encoding');
    const ext = extFromName(files[0].name);
    const blob = await new Promise(r => canvas.toBlob(r, mimeFor(ext), 0.92));
    return [{ name: baseName(files[0].name)+`-${targetW}w.${ext==='png'?'png':'jpg'}`, blob }];
  }
},
{
  id:'crop-image', category:'Image Bench', title:'Crop Image',
  desc:'Crop to a chosen ratio, from the anchor point you pick.',
  accept:'.jpg,.jpeg,.png,.webp', multiple:false, minFiles:1, hint:'JPG, PNG or WebP',
  options:[
    { type:'chips', id:'ratio', label:'Ratio', choices:[
      {value:'1:1',label:'Square'},{value:'4:3',label:'4:3'},{value:'16:9',label:'16:9'},{value:'3:4',label:'Portrait 3:4'}
    ], default:'1:1' },
    { type:'select', id:'anchor', label:'Anchor point', choices:[
      {value:'center',label:'Center'},{value:'top',label:'Top'},{value:'bottom',label:'Bottom'},{value:'left',label:'Left'},{value:'right',label:'Right'}
    ], default:'center' }
  ],
  run: async (files, opts, progress) => {
    progress(20,'Loading image');
    const img = await loadImageFromFile(files[0]);
    const [rw, rh] = (opts.ratio||'1:1').split(':').map(Number);
    const targetRatio = rw/rh;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const currentRatio = iw/ih;
    let cw, ch;
    if (currentRatio > targetRatio){ ch = ih; cw = Math.round(ch*targetRatio); }
    else { cw = iw; ch = Math.round(cw/targetRatio); }
    let sx = (iw-cw)/2, sy=(ih-ch)/2;
    const anchor = opts.anchor||'center';
    if (anchor==='top') sy = 0;
    if (anchor==='bottom') sy = ih-ch;
    if (anchor==='left') sx = 0;
    if (anchor==='right') sx = iw-cw;
    progress(60,'Cropping');
    const canvas = document.createElement('canvas');
    canvas.width = cw; canvas.height = ch;
    canvas.getContext('2d').drawImage(img, sx, sy, cw, ch, 0, 0, cw, ch);
    const ext = extFromName(files[0].name);
    const blob = await new Promise(r => canvas.toBlob(r, mimeFor(ext), 0.92));
    return [{ name: baseName(files[0].name)+'-cropped.'+(ext==='png'?'png':'jpg'), blob }];
  }
},
{
  id:'convert-image', category:'Image Bench', title:'Convert Format',
  desc:'Switch an image between JPG, PNG and WebP.',
  accept:'.jpg,.jpeg,.png,.webp', multiple:false, minFiles:1, hint:'JPG, PNG or WebP',
  options:[ { type:'chips', id:'format', label:'Convert to', choices:[
    {value:'jpg',label:'JPG'},{value:'png',label:'PNG'},{value:'webp',label:'WebP'}
  ], default:'png' } ],
  run: async (files, opts, progress) => {
    progress(20,'Loading image');
    const img = await loadImageFromFile(files[0]);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    canvas.getContext('2d').drawImage(img,0,0);
    const fmt = opts.format||'png';
    progress(75,'Converting');
    const blob = await new Promise(r => canvas.toBlob(r, mimeFor(fmt), 0.92));
    return [{ name: baseName(files[0].name)+'.'+fmt, blob }];
  }
},
{
  id:'rotate-image', category:'Image Bench', title:'Rotate & Flip',
  desc:'Turn an image by 90° steps and mirror it horizontally or vertically.',
  accept:'.jpg,.jpeg,.png,.webp', multiple:false, minFiles:1, hint:'JPG, PNG or WebP',
  options:[
    { type:'chips', id:'angle', label:'Rotate', choices:[
      {value:'0',label:'0°'},{value:'90',label:'90°'},{value:'180',label:'180°'},{value:'270',label:'270°'}
    ], default:'0' },
    { type:'chips', id:'flip', label:'Flip', choices:[
      {value:'none',label:'None'},{value:'h',label:'Horizontal'},{value:'v',label:'Vertical'}
    ], default:'none' }
  ],
  run: async (files, opts, progress) => {
    progress(20,'Loading image');
    const img = await loadImageFromFile(files[0]);
    const angle = parseInt(opts.angle||0,10);
    const swap = angle===90 || angle===270;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const canvas = document.createElement('canvas');
    canvas.width = swap ? ih : iw;
    canvas.height = swap ? iw : ih;
    const ctx = canvas.getContext('2d');
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.rotate(angle*Math.PI/180);
    const flip = opts.flip||'none';
    ctx.scale(flip==='h'?-1:1, flip==='v'?-1:1);
    ctx.drawImage(img, -iw/2, -ih/2);
    progress(80,'Encoding');
    const ext = extFromName(files[0].name);
    const blob = await new Promise(r => canvas.toBlob(r, mimeFor(ext), 0.92));
    return [{ name: baseName(files[0].name)+'-edited.'+(ext==='png'?'png':'jpg'), blob }];
  }
},
{
  id:'watermark-image', category:'Image Bench', title:'Watermark',
  desc:'Stamp your image with custom text before you share it.',
  accept:'.jpg,.jpeg,.png,.webp', multiple:false, minFiles:1, hint:'JPG, PNG or WebP',
  options:[
    { type:'text', id:'text', label:'Watermark text', default:'© your name', placeholder:'e.g. © Draft & Merge' },
    { type:'select', id:'position', label:'Position', choices:[
      {value:'br',label:'Bottom right'},{value:'bl',label:'Bottom left'},{value:'tr',label:'Top right'},{value:'tl',label:'Top left'},{value:'center',label:'Center'}
    ], default:'br' },
    { type:'range', id:'opacity', label:'Opacity', min:10, max:100, step:5, default:55, suffix:'%' }
  ],
  run: async (files, opts, progress) => {
    progress(20,'Loading image');
    const img = await loadImageFromFile(files[0]);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img,0,0);
    const fontSize = Math.max(18, Math.round(canvas.width/28));
    ctx.font = `600 ${fontSize}px 'Inter', sans-serif`;
    ctx.fillStyle = `rgba(255,255,255,${(parseInt(opts.opacity||55,10))/100})`;
    ctx.strokeStyle = `rgba(0,0,0,${(parseInt(opts.opacity||55,10))/150})`;
    ctx.lineWidth = Math.max(1, fontSize/12);
    const text = opts.text || '© your name';
    const metrics = ctx.measureText(text);
    const pad = fontSize;
    let x, y;
    const pos = opts.position||'br';
    if (pos==='br'){ x=canvas.width-metrics.width-pad; y=canvas.height-pad; }
    else if (pos==='bl'){ x=pad; y=canvas.height-pad; }
    else if (pos==='tr'){ x=canvas.width-metrics.width-pad; y=pad+fontSize; }
    else if (pos==='tl'){ x=pad; y=pad+fontSize; }
    else { x=(canvas.width-metrics.width)/2; y=canvas.height/2; }
    progress(70,'Stamping');
    ctx.strokeText(text,x,y);
    ctx.fillText(text,x,y);
    const ext = extFromName(files[0].name);
    const blob = await new Promise(r => canvas.toBlob(r, mimeFor(ext), 0.92));
    return [{ name: baseName(files[0].name)+'-watermarked.'+(ext==='png'?'png':'jpg'), blob }];
  }
},
{
  id:'image-to-pdf', category:'Image Bench', title:'Image to PDF',
  desc:'Turn a stack of photos into a single PDF, one image per page.',
  accept:'.jpg,.jpeg,.png', multiple:true, minFiles:1, hint:'JPG or PNG · any number, in order added',
  options:[],
  run: async (files, opts, progress) => {
    const { PDFDocument } = PDFLib;
    const out = await PDFDocument.create();
    for (let i=0;i<files.length;i++){
      progress(Math.round((i/files.length)*90), `Placing ${files[i].name}`);
      const bytes = await files[i].arrayBuffer();
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
  id:'bulk-compress', category:'Image Bench', title:'Bulk Compressor',
  desc:'Compress a whole batch of images at once — delivered as a zip.',
  accept:'.jpg,.jpeg,.png,.webp', multiple:true, minFiles:1, hint:'Any number of JPG, PNG or WebP files',
  options:[ { type:'range', id:'quality', label:'Quality', min:20, max:95, step:5, default:70, suffix:'%' } ],
  run: async (files, opts, progress) => {
    const zip = new JSZip();
    const q = parseInt(opts.quality||70,10)/100;
    for (let i=0;i<files.length;i++){
      progress(Math.round((i/files.length)*90), `Compressing ${files[i].name}`);
      const img = await loadImageFromFile(files[i]);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      canvas.getContext('2d').drawImage(img,0,0);
      const blob = await new Promise(r => canvas.toBlob(r,'image/jpeg', q));
      zip.file(baseName(files[i].name)+'-compressed.jpg', blob);
    }
    progress(95,'Zipping');
    const zipBlob = await zip.generateAsync({ type:'blob' });
    return [{ name:'compressed-images.zip', blob:zipBlob }];
  }
}
);
