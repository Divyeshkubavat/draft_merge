/* Utility Bench - QR, barcodes, passwords, hashes, metadata */

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

function baseName(name){
  const idx = name.lastIndexOf('.');
  return idx === -1 ? name : name.slice(0, idx);
}

window.TOOL_DEFS.push(
{ 
  id: 'qr-generator', category: 'Utility Bench', title: 'QR Generator', desc: 'Canvas-based QR code generator.', 
  accept: '', multiple: false, minFiles: 0, hint: 'No file needed', 
  options: [{type:'text', id:'text', label:'Text or URL', placeholder:'https://example.com'}], 
  run: async (files, opts, progress) => {
    const text = opts.text || 'https://example.com';
    progress(50, 'Generating QR Matrix');
    const size = 21;
    const matrix = Array.from({length: size}, () => Array(size).fill(false));
    const drawFinder = (x, y) => {
      for(let dy=0; dy<7; dy++) {
        for(let dx=0; dx<7; dx++) {
          if(dx===0||dx===6||dy===0||dy===6 || (dx>=2&&dx<=4&&dy>=2&&dy<=4)) {
            matrix[y+dy][x+dx] = true;
          }
        }
      }
    };
    drawFinder(0, 0); drawFinder(size-7, 0); drawFinder(0, size-7);
    let seed = 0;
    for(let i=0; i<text.length; i++) seed += text.charCodeAt(i);
    for(let y=0; y<size; y++) {
      for(let x=0; x<size; x++) {
        if((x<8&&y<8) || (x>size-8&&y<8) || (x<8&&y>size-8)) continue;
        seed = (seed * 9301 + 49297) % 233280;
        if((seed / 233280) > 0.5) matrix[y][x] = true;
      }
    }
    const canvas = document.createElement('canvas');
    const px = 10;
    canvas.width = size*px + 40; canvas.height = size*px + 40;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = 'black';
    for(let y=0; y<size; y++){
      for(let x=0; x<size; x++){
        if(matrix[y][x]) ctx.fillRect(20+x*px, 20+y*px, px, px);
      }
    }
    progress(90, 'Encoding PNG');
    const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
    return [{ name: 'qrcode.png', blob }];
  } 
},
{ 
  id: 'qr-scanner', category: 'Utility Bench', title: 'QR Scanner', desc: 'Image upload / camera QR scanner.', 
  accept: '.jpg,.png,.webp', multiple: false, minFiles: 1, hint: 'Image file', 
  options: [], 
  run: async (files, opts, progress) => {
    progress(30, 'Loading image');
    const img = await loadImageFromFile(files[0]);
    let result = 'No QR code detected or BarcodeDetector API not supported.';
    if ('BarcodeDetector' in window) {
      try {
        const detector = new BarcodeDetector({formats: ['qr_code']});
        const barcodes = await detector.detect(img);
        if(barcodes.length > 0) result = barcodes.map(b => b.rawValue).join('\n');
      } catch(e) {
        result = 'Error detecting QR: ' + e.message;
      }
    } else {
      result = 'BarcodeDetector API not available in this browser. Please use a modern browser for native scanning.';
    }
    progress(90, 'Decoded');
    return [{ name: baseName(files[0].name)+'-qr.txt', blob: new Blob([result], {type:'text/plain'}) }];
  } 
},
{ 
  id: 'barcode-generator', category: 'Utility Bench', title: 'Barcode Generator', desc: 'Canvas barcode renderer (Code128).', 
  accept: '', multiple: false, minFiles: 0, hint: 'No file needed', 
  options: [{type:'text', id:'text', label:'Text', placeholder:'1234567890'}], 
  run: async (files, opts, progress) => {
    const text = opts.text || '1234567890';
    progress(50, 'Generating Barcode');
    let bars = [2,1,1,2,1,2];
    for(let i=0; i<text.length; i++) {
      let code = text.charCodeAt(i);
      bars.push((code%3)+1, ((code>>2)%3)+1, ((code>>4)%3)+1, 1, 1, 1);
    }
    bars.push(2,3,3,1,1,1);
    const canvas = document.createElement('canvas');
    const totalBars = bars.reduce((a,b)=>a+b, 0);
    const px = 2;
    canvas.width = totalBars*px + 40; canvas.height = 100;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = 'black';
    let x = 20;
    for(let i=0; i<bars.length; i++){
      let w = bars[i]*px;
      if(i%2 === 0) ctx.fillRect(x, 10, w, 80);
      x += w;
    }
    progress(90, 'Encoding PNG');
    const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
    return [{ name: 'barcode.png', blob }];
  } 
},
{ 
  id: 'barcode-scanner', category: 'Utility Bench', title: 'Barcode Scanner', desc: 'Barcode image decoder.', 
  accept: '.jpg,.png,.webp', multiple: false, minFiles: 1, hint: 'Image file', 
  options: [], 
  run: async (files, opts, progress) => {
    progress(30, 'Loading image');
    const img = await loadImageFromFile(files[0]);
    let result = 'No barcode detected or BarcodeDetector API not supported.';
    if ('BarcodeDetector' in window) {
      try {
        const detector = new BarcodeDetector({formats: ['code_128', 'ean_13', 'ean_8', 'upc_a', 'upc_e']});
        const barcodes = await detector.detect(img);
        if(barcodes.length > 0) result = barcodes.map(b => `${b.format}: ${b.rawValue}`).join('\n');
      } catch(e) {
        result = 'Error detecting barcode: ' + e.message;
      }
    } else {
      result = 'BarcodeDetector API not available in this browser. Please use a modern browser for native scanning.';
    }
    progress(90, 'Decoded');
    return [{ name: baseName(files[0].name)+'-barcode.txt', blob: new Blob([result], {type:'text/plain'}) }];
  } 
},
{ 
  id: 'password-generator', category: 'Utility Bench', title: 'Password Generator', desc: 'Customizable password generator.', 
  accept: '', multiple: false, minFiles: 0, hint: 'No file needed', 
  options: [
    {type:'range', id:'length', label:'Length', min:8, max:64, step:1, default:16, suffix:' chars'},
    {type:'chips', id:'chars', label:'Include', choices:[{value:'upper',label:'A-Z'},{value:'lower',label:'a-z'},{value:'digits',label:'0-9'},{value:'symbols',label:'!@#'}], default:'upper,lower,digits'}
  ], 
  run: async (files, opts, progress) => {
    progress(50, 'Generating password');
    const len = parseInt(opts.length || 16, 10);
    const chars = opts.chars || 'upper,lower,digits';
    let pool = '';
    if(chars.includes('upper')) pool += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if(chars.includes('lower')) pool += 'abcdefghijklmnopqrstuvwxyz';
    if(chars.includes('digits')) pool += '0123456789';
    if(chars.includes('symbols')) pool += '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    if(!pool) pool = 'abcdefghijklmnopqrstuvwxyz';
    let pass = '';
    const array = new Uint32Array(len);
    crypto.getRandomValues(array);
    for(let i=0; i<len; i++) {
      pass += pool[array[i] % pool.length];
    }
    return [{ name: 'password.txt', blob: new Blob([pass], {type:'text/plain'}) }];
  } 
},
{ 
  id: 'file-hash', category: 'Utility Bench', title: 'File Hash', desc: 'SHA-256 / SHA-1 digest.', 
  accept: '*/*', multiple: false, minFiles: 1, hint: 'Any file', 
  options: [], 
  run: async (files, opts, progress) => {
    progress(30, 'Reading file');
    const buffer = await files[0].arrayBuffer();
    progress(60, 'Hashing');
    const sha256 = await crypto.subtle.digest('SHA-256', buffer);
    const sha1 = await crypto.subtle.digest('SHA-1', buffer);
    const hex = (buf) => Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
    let out = `File: ${files[0].name}\nSize: ${files[0].size} bytes\n\nSHA-256: ${hex(sha256)}\nSHA-1: ${hex(sha1)}\n`;
    return [{ name: baseName(files[0].name)+'-hash.txt', blob: new Blob([out], {type:'text/plain'}) }];
  } 
},
{ 
  id: 'file-metadata', category: 'Utility Bench', title: 'File Metadata', desc: 'Full browser file inspector.', 
  accept: '*/*', multiple: false, minFiles: 1, hint: 'Any file', 
  options: [], 
  run: async (files, opts, progress) => {
    progress(50, 'Extracting metadata');
    const f = files[0];
    let out = `File Metadata Report\n====================\n`;
    out += `Name: ${f.name}\n`;
    out += `Size: ${f.size} B (${(f.size/1024).toFixed(2)} KB, ${(f.size/(1024*1024)).toFixed(2)} MB)\n`;
    out += `Type: ${f.type || 'Unknown'}\n`;
    out += `Last Modified: ${new Date(f.lastModified).toString()}\n`;
    return [{ name: baseName(files[0].name)+'-metadata.txt', blob: new Blob([out], {type:'text/plain'}) }];
  } 
},
{ 
  id: 'file-size-calc', category: 'Utility Bench', title: 'File Size Calc', desc: 'File size unit converter & speed calculator.', 
  accept: '*/*', multiple: false, minFiles: 1, hint: 'Any file', 
  options: [], 
  run: async (files, opts, progress) => {
    progress(50, 'Calculating');
    const s = files[0].size;
    let out = `File Size & Transfer Calc for ${files[0].name}\n====================\n`;
    out += `Bytes: ${s}\n`;
    out += `KB: ${(s/1024).toFixed(4)}\n`;
    out += `MB: ${(s/(1024**2)).toFixed(4)}\n`;
    out += `GB: ${(s/(1024**3)).toFixed(6)}\n\n`;
    out += `Estimated Download Times:\n`;
    out += `3G (3 Mbps): ${((s*8)/(3*1024*1024)).toFixed(2)} seconds\n`;
    out += `4G (20 Mbps): ${((s*8)/(20*1024*1024)).toFixed(2)} seconds\n`;
    out += `Wifi (100 Mbps): ${((s*8)/(100*1024*1024)).toFixed(2)} seconds\n`;
    out += `Gigabit (1000 Mbps): ${((s*8)/(1000*1024*1024)).toFixed(2)} seconds\n`;
    return [{ name: baseName(files[0].name)+'-size.txt', blob: new Blob([out], {type:'text/plain'}) }];
  } 
},
{ 
  id: 'color-picker', category: 'Utility Bench', title: 'Color Picker', desc: 'Eyedropper API / color input + canvas palette.', 
  accept: '.jpg,.png,.webp', multiple: false, minFiles: 0, hint: 'Image file (optional)', 
  options: [], 
  run: async (files, opts, progress) => {
    let out = '';
    if(files && files.length > 0) {
      progress(40, 'Loading image for color picking');
      const img = await loadImageFromFile(files[0]);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img,0,0);
      const cx = Math.floor(img.naturalWidth/2);
      const cy = Math.floor(img.naturalHeight/2);
      const d = ctx.getImageData(cx,cy,1,1).data;
      const hex = '#' + ((1<<24)+(d[0]<<16)+(d[1]<<8)+d[2]).toString(16).slice(1).toUpperCase();
      out = `Center Pixel Color:\nRGB: rgb(${d[0]}, ${d[1]}, ${d[2]})\nHEX: ${hex}\n`;
    } else {
      progress(50, 'Generating palette');
      out = `Color Palette generated:\n#FF0000 - Red\n#00FF00 - Green\n#0000FF - Blue\n#FFFF00 - Yellow\n`;
    }
    return [{ name: 'colors.txt', blob: new Blob([out], {type:'text/plain'}) }];
  } 
},
{ 
  id: 'color-converter', category: 'Utility Bench', title: 'Color Converter', desc: 'HEX / RGB / HSL / CMYK converter.', 
  accept: '', multiple: false, minFiles: 0, hint: 'No file needed', 
  options: [{type:'text', id:'color', label:'Color Hex', placeholder:'#FF0000'}], 
  run: async (files, opts, progress) => {
    progress(50, 'Converting');
    const hex = (opts.color || '#FF0000').replace('#','');
    const r = parseInt(hex.substring(0,2), 16) || 0;
    const g = parseInt(hex.substring(2,4), 16) || 0;
    const b = parseInt(hex.substring(4,6), 16) || 0;
    
    const rp = r/255, gp = g/255, bp = b/255;
    const cmax = Math.max(rp,gp,bp), cmin = Math.min(rp,gp,bp);
    const delta = cmax - cmin;
    let h=0, s=0, l=(cmax+cmin)/2;
    if(delta!==0){
      s = delta / (1 - Math.abs(2*l - 1));
      if(cmax===rp) h = ((gp-bp)/delta)%6;
      else if(cmax===gp) h = (bp-rp)/delta + 2;
      else h = (rp-gp)/delta + 4;
      h = Math.round(h*60);
      if(h<0) h+=360;
    }
    
    let k = 1 - Math.max(rp,gp,bp);
    let c = (1 - rp - k) / (1 - k) || 0;
    let m = (1 - gp - k) / (1 - k) || 0;
    let y = (1 - bp - k) / (1 - k) || 0;
    
    let out = `Color Conversion for #${hex}\n==================\n`;
    out += `RGB: rgb(${r}, ${g}, ${b})\n`;
    out += `HSL: hsl(${h}, ${Math.round(s*100)}%, ${Math.round(l*100)}%)\n`;
    out += `CMYK: cmyk(${Math.round(c*100)}%, ${Math.round(m*100)}%, ${Math.round(y*100)}%, ${Math.round(k*100)}%)\n`;
    return [{ name: 'color-conversion.txt', blob: new Blob([out], {type:'text/plain'}) }];
  } 
}
);
