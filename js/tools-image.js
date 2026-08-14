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
    const PDFLib = await window.ensureLib("PDFLib");
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
  desc:'Compress a whole batch of images at once delivered as a zip.',
  accept:'.jpg,.jpeg,.png,.webp', multiple:true, minFiles:1, hint:'Any number of JPG, PNG or WebP files',
  options:[ { type:'range', id:'quality', label:'Quality', min:20, max:95, step:5, default:70, suffix:'%' } ],
  run: async (files, opts, progress) => {
    const JSZip = await window.ensureLib("JSZip");
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
},
{
  id:'remove-bg', category:'Image Bench', title:'Remove Background',
  desc:'Remove light backgrounds from images using color thresholding.',
  accept:'.jpg,.jpeg,.png,.webp', multiple:false, minFiles:1, hint:'JPG, PNG or WebP',
  options:[ { type:'range', id:'tolerance', label:'Tolerance', min:0, max:100, step:1, default:20, suffix:'' } ],
  run: async (files, opts, progress) => {
    progress(20,'Loading image');
    const img = await loadImageFromFile(files[0]);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img,0,0);
    progress(50,'Processing pixels');
    const imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = imgData.data;
    const tol = parseInt(opts.tolerance||20,10)*2.55;
    for(let i=0; i<d.length; i+=4){
      const r=d[i], g=d[i+1], b=d[i+2];
      if(r > 255-tol && g > 255-tol && b > 255-tol){
        d[i+3] = 0;
      }
    }
    ctx.putImageData(imgData,0,0);
    progress(90,'Encoding');
    const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
    return [{ name: baseName(files[0].name)+'-nobg.png', blob }];
  }
},
{
  id:'blur-image', category:'Image Bench', title:'Blur Image',
  desc:'Apply a Gaussian blur filter to your image.',
  accept:'.jpg,.jpeg,.png,.webp', multiple:false, minFiles:1, hint:'JPG, PNG or WebP',
  options:[ { type:'range', id:'radius', label:'Blur Radius', min:1, max:50, step:1, default:5, suffix:'px' } ],
  run: async (files, opts, progress) => {
    progress(20,'Loading image');
    const img = await loadImageFromFile(files[0]);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.filter = 'blur(' + (opts.radius||5) + 'px)';
    ctx.drawImage(img,0,0);
    progress(80,'Encoding');
    const blob = await new Promise(r => canvas.toBlob(r, mimeFor(extFromName(files[0].name))));
    return [{ name: baseName(files[0].name)+'-blurred.'+extFromName(files[0].name), blob }];
  }
},
{
  id:'sharpen-image', category:'Image Bench', title:'Sharpen Image',
  desc:'Enhance edge contrast with a convolution matrix.',
  accept:'.jpg,.jpeg,.png,.webp', multiple:false, minFiles:1, hint:'JPG, PNG or WebP',
  options:[],
  run: async (files, opts, progress) => {
    progress(20,'Loading image');
    const img = await loadImageFromFile(files[0]);
    const canvas = document.createElement('canvas');
    const w = canvas.width = img.naturalWidth;
    const h = canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img,0,0);
    progress(50,'Applying filter');
    const imgData = ctx.getImageData(0,0,w,h);
    const d = imgData.data;
    const mix = [0,-1,0,-1,5,-1,0,-1,0];
    const out = new Uint8ClampedArray(d.length);
    for(let y=1; y<h-1; y++){
      for(let x=1; x<w-1; x++){
        const i = (y*w+x)*4;
        let r=0,g=0,b=0;
        for(let cy=-1; cy<=1; cy++){
          for(let cx=-1; cx<=1; cx++){
            const cpx = ((y+cy)*w+(x+cx))*4;
            const wt = mix[(cy+1)*3+(cx+1)];
            r += d[cpx]*wt;
            g += d[cpx+1]*wt;
            b += d[cpx+2]*wt;
          }
        }
        out[i]=r; out[i+1]=g; out[i+2]=b; out[i+3]=d[i+3];
      }
    }
    for(let i=0; i<d.length; i+=4){ if(out[i+3]>0){ d[i]=out[i]; d[i+1]=out[i+1]; d[i+2]=out[i+2]; } }
    ctx.putImageData(imgData,0,0);
    progress(80,'Encoding');
    const blob = await new Promise(r => canvas.toBlob(r, mimeFor(extFromName(files[0].name))));
    return [{ name: baseName(files[0].name)+'-sharpened.'+extFromName(files[0].name), blob }];
  }
},
{
  id:'grayscale-image', category:'Image Bench', title:'Grayscale Image',
  desc:'Convert image to black and white.',
  accept:'.jpg,.jpeg,.png,.webp', multiple:false, minFiles:1, hint:'JPG, PNG or WebP',
  options:[],
  run: async (files, opts, progress) => {
    progress(20,'Loading image');
    const img = await loadImageFromFile(files[0]);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.filter = 'grayscale(100%)';
    ctx.drawImage(img,0,0);
    const blob = await new Promise(r => canvas.toBlob(r, mimeFor(extFromName(files[0].name))));
    return [{ name: baseName(files[0].name)+'-bw.'+extFromName(files[0].name), blob }];
  }
},
{
  id:'pixelate-image', category:'Image Bench', title:'Pixelate Image',
  desc:'Apply a retro pixelated effect.',
  accept:'.jpg,.jpeg,.png,.webp', multiple:false, minFiles:1, hint:'JPG, PNG or WebP',
  options:[ { type:'range', id:'size', label:'Pixel Size', min:2, max:50, step:1, default:10, suffix:'px' } ],
  run: async (files, opts, progress) => {
    progress(20,'Loading image');
    const img = await loadImageFromFile(files[0]);
    const canvas = document.createElement('canvas');
    const w = canvas.width = img.naturalWidth;
    const h = canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    const size = parseInt(opts.size||10,10)/100;
    const sw = w*size, sh = h*size;
    const temp = document.createElement('canvas');
    temp.width = sw; temp.height = sh;
    temp.getContext('2d').drawImage(img,0,0,sw,sh);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(temp,0,0,sw,sh,0,0,w,h);
    const blob = await new Promise(r => canvas.toBlob(r, mimeFor(extFromName(files[0].name))));
    return [{ name: baseName(files[0].name)+'-pixelated.'+extFromName(files[0].name), blob }];
  }
},
{
  id:'add-border-image', category:'Image Bench', title:'Add Border',
  desc:'Draw a border around the image.',
  accept:'.jpg,.jpeg,.png,.webp', multiple:false, minFiles:1, hint:'JPG, PNG or WebP',
  options:[
    { type:'range', id:'width', label:'Border Width', min:1, max:100, step:1, default:10, suffix:'px' },
    { type:'text', id:'color', label:'Border Color', default:'#000000', placeholder:'#000000' }
  ],
  run: async (files, opts, progress) => {
    progress(20,'Loading image');
    const img = await loadImageFromFile(files[0]);
    const bw = parseInt(opts.width||10,10);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth + bw*2; canvas.height = img.naturalHeight + bw*2;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = opts.color || '#000000';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(img, bw, bw);
    const blob = await new Promise(r => canvas.toBlob(r, mimeFor(extFromName(files[0].name))));
    return [{ name: baseName(files[0].name)+'-border.'+extFromName(files[0].name), blob }];
  }
},
{
  id:'round-corners-image', category:'Image Bench', title:'Round Corners',
  desc:'Round the corners of the image.',
  accept:'.jpg,.jpeg,.png,.webp', multiple:false, minFiles:1, hint:'JPG, PNG or WebP',
  options:[ { type:'range', id:'radius', label:'Radius', min:1, max:500, step:5, default:50, suffix:'px' } ],
  run: async (files, opts, progress) => {
    progress(20,'Loading image');
    const img = await loadImageFromFile(files[0]);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    const r = parseInt(opts.radius||50,10);
    ctx.beginPath();
    ctx.moveTo(r,0); ctx.lineTo(canvas.width-r,0); ctx.quadraticCurveTo(canvas.width,0,canvas.width,r);
    ctx.lineTo(canvas.width,canvas.height-r); ctx.quadraticCurveTo(canvas.width,canvas.height,canvas.width-r,canvas.height);
    ctx.lineTo(r,canvas.height); ctx.quadraticCurveTo(0,canvas.height,0,canvas.height-r);
    ctx.lineTo(0,r); ctx.quadraticCurveTo(0,0,r,0);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img,0,0);
    const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
    return [{ name: baseName(files[0].name)+'-rounded.png', blob }];
  }
},
{
  id:'image-collage', category:'Image Bench', title:'Collage Maker',
  desc:'Combine multiple images into one collage.',
  accept:'.jpg,.jpeg,.png,.webp', multiple:true, minFiles:2, hint:'At least 2 images',
  options:[],
  run: async (files, opts, progress) => {
    const images = await Promise.all(files.map(f => loadImageFromFile(f)));
    const cols = Math.ceil(Math.sqrt(images.length));
    const rows = Math.ceil(images.length/cols);
    const w = images[0].naturalWidth; const h = images[0].naturalHeight;
    const canvas = document.createElement('canvas');
    canvas.width = w*cols; canvas.height = h*rows;
    const ctx = canvas.getContext('2d');
    for(let i=0; i<images.length; i++){
      const x = (i%cols)*w; const y = Math.floor(i/cols)*h;
      ctx.drawImage(images[i], x, y, w, h);
    }
    const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg'));
    return [{ name: 'collage.jpg', blob }];
  }
},
{
  id:'meme-generator', category:'Image Bench', title:'Meme Generator',
  desc:'Add classic meme text to your image.',
  accept:'.jpg,.jpeg,.png,.webp', multiple:false, minFiles:1, hint:'JPG, PNG or WebP',
  options:[
    { type:'text', id:'topText', label:'Top Text', default:'TOP TEXT' },
    { type:'text', id:'bottomText', label:'Bottom Text', default:'BOTTOM TEXT' }
  ],
  run: async (files, opts, progress) => {
    progress(20,'Loading image');
    const img = await loadImageFromFile(files[0]);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img,0,0);
    const fontSize = Math.floor(canvas.height/10);
    ctx.font = `bold ${fontSize}px Impact, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = Math.max(1, fontSize/20);
    const tx = canvas.width/2;
    if(opts.topText){
      ctx.strokeText(opts.topText.toUpperCase(), tx, fontSize);
      ctx.fillText(opts.topText.toUpperCase(), tx, fontSize);
    }
    if(opts.bottomText){
      ctx.strokeText(opts.bottomText.toUpperCase(), tx, canvas.height - 20);
      ctx.fillText(opts.bottomText.toUpperCase(), tx, canvas.height - 20);
    }
    const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg'));
    return [{ name: baseName(files[0].name)+'-meme.jpg', blob }];
  }
},
{
  id:'favicon-generator', category:'Image Bench', title:'Favicon Generator',
  desc:'Generate a set of favicons packed in a ZIP.',
  accept:'.jpg,.jpeg,.png,.webp', multiple:false, minFiles:1, hint:'Square image works best',
  options:[],
  run: async (files, opts, progress) => {
    progress(20,'Loading image');
    const img = await loadImageFromFile(files[0]);
    const JSZip = await window.ensureLib("JSZip");
    const zip = new JSZip();
    const sizes = [16, 32, 48, 64];
    for(let size of sizes){
      const canvas = document.createElement('canvas');
      canvas.width = size; canvas.height = size;
      canvas.getContext('2d').drawImage(img, 0, 0, size, size);
      const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
      zip.file(`favicon-${size}x${size}.png`, blob);
    }
    const zipBlob = await zip.generateAsync({ type:'blob' });
    return [{ name:'favicons.zip', blob:zipBlob }];
  }
},
{
  id:'exif-viewer', category:'Image Bench', title:'EXIF Viewer',
  desc:'Extract EXIF metadata from an image.',
  accept:'.jpg,.jpeg', multiple:false, minFiles:1, hint:'JPG images',
  options:[],
  run: async (files, opts, progress) => {
    progress(30, 'Loading image for dimensions');
    const img = await loadImageFromFile(files[0]);
    progress(70, 'Generating report');
    let output = 'File Metadata & Dimensions\n==========================\n';
    output += `Name: ${files[0].name}\n`;
    output += `Size: ${files[0].size} bytes (${(files[0].size/1024).toFixed(2)} KB)\n`;
    output += `Type: ${files[0].type}\n`;
    output += `Width: ${img.naturalWidth}px\n`;
    output += `Height: ${img.naturalHeight}px\n`;
    const blob = new Blob([output], {type:'text/plain'});
    return [{ name: baseName(files[0].name)+'-metadata.txt', blob }];
  }
},
{
  id:'remove-metadata-image', category:'Image Bench', title:'Remove Metadata',
  desc:'Strip all EXIF metadata by re-encoding the image.',
  accept:'.jpg,.jpeg,.png,.webp', multiple:false, minFiles:1, hint:'JPG, PNG or WebP',
  options:[],
  run: async (files, opts, progress) => {
    progress(30,'Cleaning image');
    const img = await loadImageFromFile(files[0]);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    canvas.getContext('2d').drawImage(img,0,0);
    const ext = extFromName(files[0].name);
    const blob = await new Promise(r => canvas.toBlob(r, mimeFor(ext), 0.92));
    return [{ name: baseName(files[0].name)+'-clean.'+ext, blob }];
  }
},
{
  id:'extract-colors-image', category:'Image Bench', title:'Extract Image Colors',
  desc:'Get the dominant colors from an image.',
  accept:'.jpg,.jpeg,.png,.webp', multiple:false, minFiles:1, hint:'JPG, PNG or WebP',
  options:[],
  run: async (files, opts, progress) => {
    progress(30,'Sampling colors');
    const img = await loadImageFromFile(files[0]);
    const canvas = document.createElement('canvas');
    canvas.width = 100; canvas.height = 100;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img,0,0,100,100);
    const data = ctx.getImageData(0,0,100,100).data;
    let counts = {};
    for(let i=0; i<data.length; i+=4){
      const r = Math.floor(data[i]/32)*32;
      const g = Math.floor(data[i+1]/32)*32;
      const b = Math.floor(data[i+2]/32)*32;
      const rgb = `${r},${g},${b}`;
      counts[rgb] = (counts[rgb]||0)+1;
    }
    const sorted = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,6);
    let out = 'Dominant Colors:\n';
    sorted.forEach(([rgb, count]) => {
      const [r,g,b] = rgb.split(',').map(Number);
      const hex = '#' + ((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
      out += `${hex}\n`;
    });
    const blob = new Blob([out], {type:'text/plain'});
    return [{ name: baseName(files[0].name)+'-colors.txt', blob }];
  }
},
{
  id:'svg-converter', category:'Image Bench', title:'SVG Converter',
  desc:'Render SVG to PNG or wrap image in SVG.',
  accept:'.svg,.jpg,.jpeg,.png,.webp', multiple:false, minFiles:1, hint:'SVG or Image file',
  options:[],
  run: async (files, opts, progress) => {
    progress(30,'Converting');
    const ext = extFromName(files[0].name);
    if(ext === 'svg'){
      const img = await loadImageFromFile(files[0]);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      canvas.getContext('2d').drawImage(img,0,0);
      const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
      return [{ name: baseName(files[0].name)+'.png', blob }];
    } else {
      const img = await loadImageFromFile(files[0]);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      canvas.getContext('2d').drawImage(img,0,0);
      const dataUrl = canvas.toDataURL('image/png');
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${img.naturalWidth}" height="${img.naturalHeight}"><image href="${dataUrl}" width="100%" height="100%"/></svg>`;
      const blob = new Blob([svg], {type:'image/svg+xml'});
      return [{ name: baseName(files[0].name)+'.svg', blob }];
    }
  }
}
);
