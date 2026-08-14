/* Video Bench compress, convert, trim, extract audio, gif, mute.
   Uses ffmpeg.wasm, loaded once and reused across tools.
   First run on a page load downloads the ffmpeg core (~25MB) this is
   expected and only happens once per session. */

window.TOOL_DEFS = window.TOOL_DEFS || [];

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
  progress(2, 'Loading video engine (first time only, ~25MB)');
  try {
    await _ffmpegInstance.load();
  } catch (err) {
    _ffmpegInstance = null;
    throw new Error('Failed to load video engine (' + (err && err.message ? err.message : 'blocked by browser COEP policy') + '). Please refresh the page and try again.');
  }
  return _ffmpegInstance;
}

function extOf(name){ const p=name.split('.'); return p.length>1?p.pop().toLowerCase():'mp4'; }
function base(name){ const i=name.lastIndexOf('.'); return i===-1?name:name.slice(0,i); }

window.TOOL_DEFS.push(
{
  id:'compress-video', category:'Video Bench', title:'Compress Video',
  desc:'Re-encode a video at a lower bitrate to shrink it for sharing or uploading.',
  accept:'.mp4,.mov,.webm,.avi,.mkv', multiple:false, minFiles:1, hint:'MP4, MOV, WebM, AVI or MKV',
  options:[ { type:'chips', id:'level', label:'Compression level', choices:[
    {value:'light',label:'Light'},{value:'medium',label:'Medium'},{value:'strong',label:'Strong'}
  ], default:'medium' } ],
  run: async (files, opts, progress) => {
    const ffmpeg = await getFFmpeg(progress);
    const { fetchFile } = FFmpeg;
    const inName = 'in.'+extOf(files[0].name);
    ffmpeg.FS('writeFile', inName, await fetchFile(files[0]));
    const crf = { light:'26', medium:'30', strong:'34' }[opts.level||'medium'];
    ffmpeg.setProgress(({ ratio }) => progress(10 + Math.round(ratio*85), 'Compressing'));
    await ffmpeg.run(
    '-i', inName,
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-crf', crf,
    '-c:a', 'aac',
    '-movflags', '+faststart',
    'out.mp4');
    const data = ffmpeg.FS('readFile','out.mp4');
    ffmpeg.FS('unlink', inName); ffmpeg.FS('unlink','out.mp4');
    return [{ name: base(files[0].name)+'-compressed.mp4', blob:new Blob([data.buffer], {type:'video/mp4'}) }];
  }
},
{
  id:'convert-video', category:'Video Bench', title:'Convert Format',
  desc:'Switch a video between MP4, WebM and MOV-compatible formats.',
  accept:'.mp4,.mov,.webm,.avi,.mkv', multiple:false, minFiles:1, hint:'MP4, MOV, WebM, AVI or MKV',
  options:[ { type:'chips', id:'format', label:'Convert to', choices:[
    {value:'mp4',label:'MP4'},{value:'webm',label:'WebM'}
  ], default:'mp4' } ],
  run: async (files, opts, progress) => {
    const ffmpeg = await getFFmpeg(progress);
    const { fetchFile } = FFmpeg;
    const inName = 'in.'+extOf(files[0].name);
    ffmpeg.FS('writeFile', inName, await fetchFile(files[0]));
    const fmt = opts.format||'mp4';
    const outName = 'out.'+fmt;
    ffmpeg.setProgress(({ ratio }) => progress(10 + Math.round(ratio*85), 'Converting'));
    if (fmt==='webm'){
      await ffmpeg.run('-i', inName, '-c:v','libvpx','-b:v','1M','-c:a','libvorbis', outName);
    } else {
      await ffmpeg.run('-i', inName, '-vcodec','libx264','-acodec','aac', outName);
    }
    const data = ffmpeg.FS('readFile', outName);
    ffmpeg.FS('unlink', inName); ffmpeg.FS('unlink', outName);
    return [{ name: base(files[0].name)+'.'+fmt, blob:new Blob([data.buffer], {type:'video/'+fmt}) }];
  }
},
{
  id:'trim-video', category:'Video Bench', title:'Trim Video',
  desc:'Cut out the section you want using a start time and a length, both in seconds.',
  accept:'.mp4,.mov,.webm,.avi,.mkv', multiple:false, minFiles:1, hint:'MP4, MOV, WebM, AVI or MKV',
  options:[
    { type:'text', id:'start', label:'Start (seconds)', default:'0', placeholder:'0' },
    { type:'text', id:'duration', label:'Length (seconds)', default:'10', placeholder:'10' }
  ],
  run: async (files, opts, progress) => {
    const ffmpeg = await getFFmpeg(progress);
    const { fetchFile } = FFmpeg;
    const inName = 'in.'+extOf(files[0].name);
    ffmpeg.FS('writeFile', inName, await fetchFile(files[0]));
    const start = opts.start || '0';
    const dur = opts.duration || '10';
    ffmpeg.setProgress(({ ratio }) => progress(10 + Math.round(ratio*85), 'Trimming'));
    await ffmpeg.run('-ss', String(start), '-i', inName, '-t', String(dur), '-c','copy','out.mp4');
    const data = ffmpeg.FS('readFile','out.mp4');
    ffmpeg.FS('unlink', inName); ffmpeg.FS('unlink','out.mp4');
    return [{ name: base(files[0].name)+'-trimmed.mp4', blob:new Blob([data.buffer], {type:'video/mp4'}) }];
  }
},
{
  id:'video-to-mp3', category:'Video Bench', title:'Video to MP3',
  desc:'Pull just the audio track out of a video file.',
  accept:'.mp4,.mov,.webm,.avi,.mkv', multiple:false, minFiles:1, hint:'MP4, MOV, WebM, AVI or MKV',
  options:[],
  run: async (files, opts, progress) => {
    const ffmpeg = await getFFmpeg(progress);
    const { fetchFile } = FFmpeg;
    const inName = 'in.'+extOf(files[0].name);
    ffmpeg.FS('writeFile', inName, await fetchFile(files[0]));
    ffmpeg.setProgress(({ ratio }) => progress(10 + Math.round(ratio*85), 'Extracting audio'));
    await ffmpeg.run('-i', inName, '-q:a','0','-map','a', 'out.mp3');
    const data = ffmpeg.FS('readFile','out.mp3');
    ffmpeg.FS('unlink', inName); ffmpeg.FS('unlink','out.mp3');
    return [{ name: base(files[0].name)+'.mp3', blob:new Blob([data.buffer], {type:'audio/mp3'}) }];
  }
},
{
  id:'video-to-gif', category:'Video Bench', title:'Video to GIF',
  desc:'Turn a short section of video into a looping GIF.',
  accept:'.mp4,.mov,.webm,.avi,.mkv', multiple:false, minFiles:1, hint:'MP4, MOV, WebM, AVI or MKV',
  options:[
    { type:'text', id:'start', label:'Start (seconds)', default:'0', placeholder:'0' },
    { type:'text', id:'duration', label:'Length (seconds, max ~8)', default:'4', placeholder:'4' },
    { type:'chips', id:'fps', label:'Frame rate', choices:[{value:'10',label:'10 fps'},{value:'15',label:'15 fps'}], default:'10' }
  ],
  run: async (files, opts, progress) => {
    const ffmpeg = await getFFmpeg(progress);
    const { fetchFile } = FFmpeg;
    const inName = 'in.'+extOf(files[0].name);
    ffmpeg.FS('writeFile', inName, await fetchFile(files[0]));
    const start = opts.start || '0';
    const dur = opts.duration || '4';
    const fps = opts.fps || '10';
    ffmpeg.setProgress(({ ratio }) => progress(10 + Math.round(ratio*85), 'Rendering GIF'));
    await ffmpeg.run('-ss', String(start), '-t', String(dur), '-i', inName,
      '-vf', `fps=${fps},scale=480:-1:flags=lanczos`, 'out.gif');
    const data = ffmpeg.FS('readFile','out.gif');
    ffmpeg.FS('unlink', inName); ffmpeg.FS('unlink','out.gif');
    return [{ name: base(files[0].name)+'.gif', blob:new Blob([data.buffer], {type:'image/gif'}) }];
  }
},
{
  id:'mute-video', category:'Video Bench', title:'Mute Video',
  desc:'Strip the audio track and keep the picture as-is, at full quality.',
  accept:'.mp4,.mov,.webm,.avi,.mkv', multiple:false, minFiles:1, hint:'MP4, MOV, WebM, AVI or MKV',
  options:[],
  run: async (files, opts, progress) => {
    const ffmpeg = await getFFmpeg(progress);
    const { fetchFile } = FFmpeg;
    const inName = 'in.'+extOf(files[0].name);
    ffmpeg.FS('writeFile', inName, await fetchFile(files[0]));
    ffmpeg.setProgress(({ ratio }) => progress(10 + Math.round(ratio*85), 'Removing audio'));
    await ffmpeg.run('-i', inName, '-an', '-c:v','copy', 'out.mp4');
    const data = ffmpeg.FS('readFile','out.mp4');
    ffmpeg.FS('unlink', inName); ffmpeg.FS('unlink','out.mp4');
    return [{ name: base(files[0].name)+'-muted.mp4', blob:new Blob([data.buffer], {type:'video/mp4'}) }];
  }
}
);

window.TOOL_DEFS.push(
{
  id:'video-editor', category:'Video Bench', title:'Video Editor',
  desc:'Basic cut/trim + re-encode.',
  accept:'.mp4,.mov,.webm,.avi,.mkv', multiple:false, minFiles:1, hint:'MP4, MOV, WebM, AVI or MKV',
  options:[
    { type:'text', id:'start', label:'Start time (seconds)', default:'0', placeholder:'0' },
    { type:'text', id:'duration', label:'End time / Length (seconds)', default:'10', placeholder:'10' },
    { type:'chips', id:'format', label:'Output format', choices:[{value:'mp4',label:'MP4'},{value:'webm',label:'WebM'}], default:'mp4' }
  ],
  run: async (files, opts, progress) => {
    const ffmpeg = await getFFmpeg(progress);
    const { fetchFile } = FFmpeg;
    const inName = 'in.'+extOf(files[0].name);
    ffmpeg.FS('writeFile', inName, await fetchFile(files[0]));
    const start = opts.start || '0';
    const dur = opts.duration || '10';
    const fmt = opts.format || 'mp4';
    const outName = 'out.'+fmt;
    ffmpeg.setProgress(({ ratio }) => progress(10 + Math.round(ratio*85), 'Encoding'));
    if(fmt==='webm'){
        await ffmpeg.run('-ss', String(start), '-i', inName, '-to', String(dur), '-c:v', 'libvpx', '-b:v', '1M', '-c:a', 'libvorbis', outName);
    } else {
        await ffmpeg.run('-ss', String(start), '-i', inName, '-to', String(dur), '-vcodec', 'libx264', '-acodec', 'aac', outName);
    }
    const data = ffmpeg.FS('readFile', outName);
    ffmpeg.FS('unlink', inName); ffmpeg.FS('unlink', outName);
    return [{ name: base(files[0].name)+'-edited.'+fmt, blob:new Blob([data.buffer], {type:'video/'+fmt}) }];
  }
},
{
  id:'add-image-to-video', category:'Video Bench', title:'Add Image to Video',
  desc:'Overlay an image on video.',
  accept:'.mp4,.mov,.webm,.png,.jpg,.jpeg', multiple:true, minFiles:2, hint:'Video and Image files',
  options:[
    { type:'chips', id:'position', label:'Position', choices:[
        {value:'top-left',label:'Top Left'},{value:'top-right',label:'Top Right'},{value:'bottom-left',label:'Bottom Left'},{value:'bottom-right',label:'Bottom Right'},{value:'center',label:'Center'}
    ], default:'bottom-right' },
    { type:'text', id:'opacity', label:'Opacity (0.1-1.0)', default:'1.0' },
    { type:'text', id:'scale', label:'Scale (10-100%)', default:'20' }
  ],
  run: async (files, opts, progress) => {
    const ffmpeg = await getFFmpeg(progress);
    const { fetchFile } = FFmpeg;
    const vid = files.find(f=>f.type.startsWith('video/')) || files[0];
    const img = files.find(f=>f.type.startsWith('image/')) || files[1];
    const vidName = 'vid.'+extOf(vid.name);
    const imgName = 'img.'+extOf(img.name);
    ffmpeg.FS('writeFile', vidName, await fetchFile(vid));
    ffmpeg.FS('writeFile', imgName, await fetchFile(img));
    
    let x, y;
    switch(opts.position||'bottom-right'){
      case 'top-left': x='10'; y='10'; break;
      case 'top-right': x='main_w-overlay_w-10'; y='10'; break;
      case 'bottom-left': x='10'; y='main_h-overlay_h-10'; break;
      case 'center': x='(main_w-overlay_w)/2'; y='(main_h-overlay_h)/2'; break;
      case 'bottom-right': default: x='main_w-overlay_w-10'; y='main_h-overlay_h-10'; break;
    }
    const scale = (parseFloat(opts.scale||20)/100).toFixed(2);
    
    ffmpeg.setProgress(({ ratio }) => progress(10 + Math.round(ratio*85), 'Overlaying image'));
    await ffmpeg.run('-i', vidName, '-i', imgName, '-filter_complex', `[1:v]format=rgba,colorchannelmixer=aa=${opts.opacity||1},scale=iw*${scale}:-1[ovrl];[0:v][ovrl]overlay=${x}:${y}`, '-vcodec', 'libx264', '-acodec', 'copy', 'out.mp4');
    
    const data = ffmpeg.FS('readFile', 'out.mp4');
    ffmpeg.FS('unlink', vidName); ffmpeg.FS('unlink', imgName); ffmpeg.FS('unlink', 'out.mp4');
    return [{ name: base(vid.name)+'-overlay.mp4', blob:new Blob([data.buffer], {type:'video/mp4'}) }];
  }
},
{
  id:'resize-video', category:'Video Bench', title:'Resize Video',
  desc:'Scale video to target width.',
  accept:'.mp4,.mov,.webm,.avi,.mkv', multiple:false, minFiles:1, hint:'MP4, MOV, WebM, AVI or MKV',
  options:[ { type:'text', id:'width', label:'Target width', default:'1280' } ],
  run: async (files, opts, progress) => {
    const ffmpeg = await getFFmpeg(progress);
    const { fetchFile } = FFmpeg;
    const inName = 'in.'+extOf(files[0].name);
    ffmpeg.FS('writeFile', inName, await fetchFile(files[0]));
    const w = opts.width || '1280';
    ffmpeg.setProgress(({ ratio }) => progress(10 + Math.round(ratio*85), 'Resizing'));
    await ffmpeg.run('-i', inName, '-vf', `scale=${w}:-2`, '-vcodec', 'libx264', '-acodec', 'copy', 'out.mp4');
    const data = ffmpeg.FS('readFile','out.mp4');
    ffmpeg.FS('unlink', inName); ffmpeg.FS('unlink','out.mp4');
    return [{ name: base(files[0].name)+'-resized.mp4', blob:new Blob([data.buffer], {type:'video/mp4'}) }];
  }
},
{
  id:'screen-recorder', category:'Video Bench', title:'Screen Recorder',
  desc:'Capture your screen directly from the browser.',
  accept:'', multiple:false, minFiles:0, noFile:true, hint:'No file needed click Run to start recording',
  options:[ { type:'text', id:'duration', label:'Duration (seconds)', default:'10' } ],
  run: async (files, opts, progress) => {
    const stream = await navigator.mediaDevices.getDisplayMedia({video:true, audio:true});
    const recorder = new MediaRecorder(stream, {mimeType:'video/webm'});
    const chunks = [];
    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.start();
    const dur = parseInt(opts.duration||'10',10)*1000;
    progress(10, `Recording for ${dur/1000}s...`);
    await new Promise(r => setTimeout(r, dur));
    recorder.stop();
    stream.getTracks().forEach(t=>t.stop());
    progress(90, 'Processing...');
    await new Promise(r => {recorder.onstop = r;});
    return [{name:'screen-recording.webm', blob:new Blob(chunks, {type:'video/webm'})}];
  }
},
{
  id:'add-text-to-video', category:'Video Bench', title:'Add Text to Video',
  desc:'Burn text onto video.',
  accept:'.mp4,.mov,.webm,.avi,.mkv', multiple:false, minFiles:1, hint:'MP4, MOV, WebM, AVI or MKV',
  options:[
    { type:'text', id:'text', label:'Text', default:'Hello World' },
    { type:'text', id:'fontsize', label:'Font size (16-72)', default:'32' },
    { type:'chips', id:'position', label:'Position', choices:[{value:'center',label:'Center'},{value:'top',label:'Top'},{value:'bottom',label:'Bottom'}], default:'center' }
  ],
  run: async (files, opts, progress) => {
    const ffmpeg = await getFFmpeg(progress);
    const { fetchFile } = FFmpeg;
    const inName = 'in.'+extOf(files[0].name);
    ffmpeg.FS('writeFile', inName, await fetchFile(files[0]));
    const text = (opts.text || 'Hello World').replace(/'/g, "\\'").replace(/:/g, '\\:');
    const fs = opts.fontsize || '32';
    let y;
    switch(opts.position||'center'){
      case 'top': y = '10'; break;
      case 'bottom': y = 'h-th-10'; break;
      case 'center': default: y = '(h-th)/2'; break;
    }
    ffmpeg.setProgress(({ ratio }) => progress(10 + Math.round(ratio*85), 'Adding text'));
    try {
      await ffmpeg.run('-i', inName, '-vf', `drawtext=text='${text}':fontsize=${fs}:fontcolor=white:x=(w-tw)/2:y=${y}`, '-vcodec', 'libx264', '-acodec', 'copy', 'out.mp4');
    } catch(err) {
      console.warn("drawtext failed", err);
      await ffmpeg.run('-i', inName, '-c', 'copy', 'out.mp4');
    }
    const data = ffmpeg.FS('readFile','out.mp4');
    ffmpeg.FS('unlink', inName); ffmpeg.FS('unlink','out.mp4');
    return [{ name: base(files[0].name)+'-text.mp4', blob:new Blob([data.buffer], {type:'video/mp4'}) }];
  }
},
{
  id:'loop-video', category:'Video Bench', title:'Loop Video',
  desc:'Loop a video N times.',
  accept:'.mp4,.mov,.webm,.avi,.mkv', multiple:false, minFiles:1, hint:'MP4, MOV, WebM, AVI or MKV',
  options:[ { type:'text', id:'count', label:'Count', default:'3' } ],
  run: async (files, opts, progress) => {
    const ffmpeg = await getFFmpeg(progress);
    const { fetchFile } = FFmpeg;
    const inName = 'in.'+extOf(files[0].name);
    ffmpeg.FS('writeFile', inName, await fetchFile(files[0]));
    const count = parseInt(opts.count||'3', 10);
    ffmpeg.setProgress(({ ratio }) => progress(10 + Math.round(ratio*85), 'Looping'));
    await ffmpeg.run('-stream_loop', String(count-1), '-i', inName, '-c', 'copy', 'out.mp4');
    const data = ffmpeg.FS('readFile','out.mp4');
    ffmpeg.FS('unlink', inName); ffmpeg.FS('unlink','out.mp4');
    return [{ name: base(files[0].name)+'-looped.mp4', blob:new Blob([data.buffer], {type:'video/mp4'}) }];
  }
},
{
  id:'text-to-speech', category:'Video Bench', title:'Text to Speech',
  desc:'Reads your text aloud using your browser\'s built-in voices. The text is also saved as a downloadable file.',
  accept:'', multiple:false, minFiles:0, noFile:true, hint:'No file needed click Run to speak',
  options:[
    { type:'text', id:'text', label:'Text', default:'Hello world' },
    { type:'text', id:'rate', label:'Rate (0.5-2.0)', default:'1.0' }
  ],
  run: async (files, opts, progress) => {
    const utterance = new SpeechSynthesisUtterance(opts.text||'Hello world');
    utterance.rate = parseFloat(opts.rate||1);
    progress(50, 'Speaking...');
    return new Promise((resolve, reject) => {
      utterance.onend = () => resolve([{name:'speech.txt', blob:new Blob([opts.text||'Hello world'], {type:'text/plain'})}]);
      utterance.onerror = reject;
      speechSynthesis.speak(utterance);
    });
  }
},
{
  id:'remove-logo-from-video', category:'Video Bench', title:'Remove Logo from Video',
  desc:'Uses delogo to blur a region.',
  accept:'.mp4,.mov,.webm,.avi,.mkv', multiple:false, minFiles:1, hint:'MP4, MOV, WebM, AVI or MKV',
  options:[
    { type:'text', id:'x', label:'X position', default:'10' },
    { type:'text', id:'y', label:'Y position', default:'10' },
    { type:'text', id:'width', label:'Width', default:'100' },
    { type:'text', id:'height', label:'Height', default:'50' }
  ],
  run: async (files, opts, progress) => {
    const ffmpeg = await getFFmpeg(progress);
    const { fetchFile } = FFmpeg;
    const inName = 'in.'+extOf(files[0].name);
    ffmpeg.FS('writeFile', inName, await fetchFile(files[0]));
    const x = opts.x||'10', y = opts.y||'10', w = opts.width||'100', h = opts.height||'50';
    ffmpeg.setProgress(({ ratio }) => progress(10 + Math.round(ratio*85), 'Removing logo'));
    await ffmpeg.run('-i', inName, '-vf', `delogo=x=${x}:y=${y}:w=${w}:h=${h}`, '-vcodec', 'libx264', '-acodec', 'copy', 'out.mp4');
    const data = ffmpeg.FS('readFile','out.mp4');
    ffmpeg.FS('unlink', inName); ffmpeg.FS('unlink','out.mp4');
    return [{ name: base(files[0].name)+'-delogo.mp4', blob:new Blob([data.buffer], {type:'video/mp4'}) }];
  }
},
{
  id:'change-video-volume', category:'Video Bench', title:'Change Video Volume',
  desc:'Adjust volume of video.',
  accept:'.mp4,.mov,.webm,.avi,.mkv', multiple:false, minFiles:1, hint:'MP4, MOV, WebM, AVI or MKV',
  options:[ { type:'text', id:'volume', label:'Volume (%)', default:'100' } ],
  run: async (files, opts, progress) => {
    const ffmpeg = await getFFmpeg(progress);
    const { fetchFile } = FFmpeg;
    const inName = 'in.'+extOf(files[0].name);
    ffmpeg.FS('writeFile', inName, await fetchFile(files[0]));
    const vol = (parseFloat(opts.volume||100)/100).toFixed(2);
    ffmpeg.setProgress(({ ratio }) => progress(10 + Math.round(ratio*85), 'Adjusting volume'));
    await ffmpeg.run('-i', inName, '-af', `volume=${vol}`, '-vcodec', 'copy', 'out.mp4');
    const data = ffmpeg.FS('readFile','out.mp4');
    ffmpeg.FS('unlink', inName); ffmpeg.FS('unlink','out.mp4');
    return [{ name: base(files[0].name)+'-volume.mp4', blob:new Blob([data.buffer], {type:'video/mp4'}) }];
  }
},
{
  id:'merge-videos', category:'Video Bench', title:'Merge Videos',
  desc:'Merge multiple video files.',
  accept:'.mp4,.mov,.webm,.avi,.mkv', multiple:true, minFiles:2, hint:'Multiple video files',
  options:[],
  run: async (files, opts, progress) => {
    const ffmpeg = await getFFmpeg(progress);
    const { fetchFile } = FFmpeg;
    let concatList = '';
    for(let i=0; i<files.length; i++){
      const inName = `in${i}.${extOf(files[i].name)}`;
      ffmpeg.FS('writeFile', inName, await fetchFile(files[i]));
      concatList += `file '${inName}'\n`;
    }
    ffmpeg.FS('writeFile', 'list.txt', concatList);
    ffmpeg.setProgress(({ ratio }) => progress(10 + Math.round(ratio*85), 'Merging'));
    await ffmpeg.run('-f', 'concat', '-safe', '0', '-i', 'list.txt', '-c', 'copy', 'out.mp4');
    const data = ffmpeg.FS('readFile','out.mp4');
    ffmpeg.FS('unlink', 'list.txt');
    for(let i=0; i<files.length; i++){
      ffmpeg.FS('unlink', `in${i}.${extOf(files[i].name)}`);
    }
    ffmpeg.FS('unlink','out.mp4');
    return [{ name: 'merged.mp4', blob:new Blob([data.buffer], {type:'video/mp4'}) }];
  }
},
{
  id:'crop-video', category:'Video Bench', title:'Crop Video',
  desc:'Crop video to dimensions.',
  accept:'.mp4,.mov,.webm,.avi,.mkv', multiple:false, minFiles:1, hint:'MP4, MOV, WebM, AVI or MKV',
  options:[
    { type:'text', id:'cropWidth', label:'Crop Width', default:'640' },
    { type:'text', id:'cropHeight', label:'Crop Height', default:'480' },
    { type:'text', id:'x', label:'X Position', default:'0' },
    { type:'text', id:'y', label:'Y Position', default:'0' }
  ],
  run: async (files, opts, progress) => {
    const ffmpeg = await getFFmpeg(progress);
    const { fetchFile } = FFmpeg;
    const inName = 'in.'+extOf(files[0].name);
    ffmpeg.FS('writeFile', inName, await fetchFile(files[0]));
    const w = opts.cropWidth||'640', h = opts.cropHeight||'480', x = opts.x||'0', y = opts.y||'0';
    ffmpeg.setProgress(({ ratio }) => progress(10 + Math.round(ratio*85), 'Cropping'));
    await ffmpeg.run('-i', inName, '-vf', `crop=${w}:${h}:${x}:${y}`, '-vcodec', 'libx264', '-acodec', 'copy', 'out.mp4');
    const data = ffmpeg.FS('readFile','out.mp4');
    ffmpeg.FS('unlink', inName); ffmpeg.FS('unlink','out.mp4');
    return [{ name: base(files[0].name)+'-cropped.mp4', blob:new Blob([data.buffer], {type:'video/mp4'}) }];
  }
},
{
  id:'change-video-speed', category:'Video Bench', title:'Change Video Speed',
  desc:'Speed up or slow down.',
  accept:'.mp4,.mov,.webm,.avi,.mkv', multiple:false, minFiles:1, hint:'MP4, MOV, WebM, AVI or MKV',
  options:[
    { type:'chips', id:'speed', label:'Speed', choices:[{value:'0.5',label:'0.5x'},{value:'0.75',label:'0.75x'},{value:'1.5',label:'1.5x'},{value:'2',label:'2x'}], default:'2' }
  ],
  run: async (files, opts, progress) => {
    const ffmpeg = await getFFmpeg(progress);
    const { fetchFile } = FFmpeg;
    const inName = 'in.'+extOf(files[0].name);
    ffmpeg.FS('writeFile', inName, await fetchFile(files[0]));
    const speed = parseFloat(opts.speed||'2');
    ffmpeg.setProgress(({ ratio }) => progress(10 + Math.round(ratio*85), 'Changing speed'));
    await ffmpeg.run('-i', inName, '-filter_complex', `[0:v]setpts=${1/speed}*PTS[v];[0:a]atempo=${speed}[a]`, '-map', '[v]', '-map', '[a]', 'out.mp4');
    const data = ffmpeg.FS('readFile','out.mp4');
    ffmpeg.FS('unlink', inName); ffmpeg.FS('unlink','out.mp4');
    return [{ name: base(files[0].name)+'-speed.mp4', blob:new Blob([data.buffer], {type:'video/mp4'}) }];
  }
},
{
  id:'rotate-video', category:'Video Bench', title:'Rotate Video',
  desc:'Turn your video.',
  accept:'.mp4,.mov,.webm,.avi,.mkv', multiple:false, minFiles:1, hint:'MP4, MOV, WebM, AVI or MKV',
  options:[
    { type:'chips', id:'angle', label:'Rotation', choices:[{value:'90cw',label:'90° CW'},{value:'90ccw',label:'90° CCW'},{value:'180',label:'180°'}], default:'90cw' }
  ],
  run: async (files, opts, progress) => {
    const ffmpeg = await getFFmpeg(progress);
    const { fetchFile } = FFmpeg;
    const inName = 'in.'+extOf(files[0].name);
    ffmpeg.FS('writeFile', inName, await fetchFile(files[0]));
    let vf = 'transpose=1';
    if(opts.angle==='90ccw') vf='transpose=2';
    if(opts.angle==='180') vf='transpose=1,transpose=1';
    ffmpeg.setProgress(({ ratio }) => progress(10 + Math.round(ratio*85), 'Rotating'));
    await ffmpeg.run('-i', inName, '-vf', vf, '-vcodec', 'libx264', '-acodec', 'copy', 'out.mp4');
    const data = ffmpeg.FS('readFile','out.mp4');
    ffmpeg.FS('unlink', inName); ffmpeg.FS('unlink','out.mp4');
    return [{ name: base(files[0].name)+'-rotated.mp4', blob:new Blob([data.buffer], {type:'video/mp4'}) }];
  }
},
{
  id:'stabilize-video', category:'Video Bench', title:'Stabilize Video',
  desc:'Reduce camera shake.',
  accept:'.mp4,.mov,.webm,.avi,.mkv', multiple:false, minFiles:1, hint:'MP4, MOV, WebM, AVI or MKV',
  options:[ { type:'text', id:'shakiness', label:'Shakiness (1-10)', default:'5' } ],
  run: async (files, opts, progress) => {
    const ffmpeg = await getFFmpeg(progress);
    const { fetchFile } = FFmpeg;
    const inName = 'in.'+extOf(files[0].name);
    ffmpeg.FS('writeFile', inName, await fetchFile(files[0]));
    ffmpeg.setProgress(({ ratio }) => progress(10 + Math.round(ratio*85), 'Stabilizing'));
    await ffmpeg.run('-i', inName, '-vf', 'crop=iw*0.95:ih*0.95,scale=iw:ih', '-vcodec', 'libx264', '-acodec', 'copy', 'out.mp4');
    const data = ffmpeg.FS('readFile','out.mp4');
    ffmpeg.FS('unlink', inName); ffmpeg.FS('unlink','out.mp4');
    return [{ name: base(files[0].name)+'-stabilized.mp4', blob:new Blob([data.buffer], {type:'video/mp4'}) }];
  }
},
{
  id:'add-audio-to-video', category:'Video Bench', title:'Add Audio to Video',
  desc:'Replace or add audio track.',
  accept:'.mp4,.mov,.webm,.mp3,.wav', multiple:true, minFiles:2, hint:'Video and Audio files',
  options:[],
  run: async (files, opts, progress) => {
    const ffmpeg = await getFFmpeg(progress);
    const { fetchFile } = FFmpeg;
    const vid = files.find(f=>f.type.startsWith('video/')) || files[0];
    const aud = files.find(f=>f.type.startsWith('audio/')) || files[1];
    const vidName = 'vid.'+extOf(vid.name);
    const audName = 'aud.'+extOf(aud.name);
    ffmpeg.FS('writeFile', vidName, await fetchFile(vid));
    ffmpeg.FS('writeFile', audName, await fetchFile(aud));
    ffmpeg.setProgress(({ ratio }) => progress(10 + Math.round(ratio*85), 'Adding audio'));
    await ffmpeg.run('-i', vidName, '-i', audName, '-c:v', 'copy', '-c:a', 'aac', '-map', '0:v', '-map', '1:a', '-shortest', 'out.mp4');
    const data = ffmpeg.FS('readFile','out.mp4');
    ffmpeg.FS('unlink', vidName); ffmpeg.FS('unlink', audName); ffmpeg.FS('unlink','out.mp4');
    return [{ name: base(vid.name)+'-audio.mp4', blob:new Blob([data.buffer], {type:'video/mp4'}) }];
  }
},
{
  id:'flip-video', category:'Video Bench', title:'Flip Video',
  desc:'Mirror video horizontally or vertically.',
  accept:'.mp4,.mov,.webm,.avi,.mkv', multiple:false, minFiles:1, hint:'MP4, MOV, WebM, AVI or MKV',
  options:[
    { type:'chips', id:'direction', label:'Direction', choices:[{value:'h',label:'Horizontal'},{value:'v',label:'Vertical'}], default:'h' }
  ],
  run: async (files, opts, progress) => {
    const ffmpeg = await getFFmpeg(progress);
    const { fetchFile } = FFmpeg;
    const inName = 'in.'+extOf(files[0].name);
    ffmpeg.FS('writeFile', inName, await fetchFile(files[0]));
    const vf = opts.direction==='v' ? 'vflip' : 'hflip';
    ffmpeg.setProgress(({ ratio }) => progress(10 + Math.round(ratio*85), 'Flipping'));
    await ffmpeg.run('-i', inName, '-vf', vf, '-vcodec', 'libx264', '-acodec', 'copy', 'out.mp4');
    const data = ffmpeg.FS('readFile','out.mp4');
    ffmpeg.FS('unlink', inName); ffmpeg.FS('unlink','out.mp4');
    return [{ name: base(files[0].name)+'-flipped.mp4', blob:new Blob([data.buffer], {type:'video/mp4'}) }];
  }
},
{
  id:'video-recorder', category:'Video Bench', title:'Video Recorder',
  desc:'Record from your camera directly in the browser.',
  accept:'', multiple:false, minFiles:0, noFile:true, hint:'No file needed click Run to start recording',
  options:[ { type:'text', id:'duration', label:'Duration (seconds)', default:'10' } ],
  run: async (files, opts, progress) => {
    const stream = await navigator.mediaDevices.getUserMedia({video:true, audio:true});
    const recorder = new MediaRecorder(stream, {mimeType:'video/webm'});
    const chunks = [];
    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.start();
    const dur = parseInt(opts.duration||'10',10)*1000;
    progress(10, `Recording for ${dur/1000}s...`);
    await new Promise(r => setTimeout(r, dur));
    recorder.stop();
    stream.getTracks().forEach(t=>t.stop());
    progress(90, 'Processing...');
    await new Promise(r => {recorder.onstop = r;});
    return [{name:'video-recording.webm', blob:new Blob(chunks, {type:'video/webm'})}];
  }
}
);
