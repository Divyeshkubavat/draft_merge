/* Audio Bench — trim, pitch, record, volume, equalizer, join, speed, reverse.
   Uses ffmpeg.wasm for audio processing. */

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
  progress(2, 'Loading audio engine (first time only, ~25MB)');
  try {
    await _ffmpegInstance.load();
  } catch (err) {
    _ffmpegInstance = null;
    throw new Error('Failed to load audio engine (' + (err && err.message ? err.message : 'blocked by browser COEP policy') + '). Please refresh the page and try again.');
  }
  return _ffmpegInstance;
}

function extOf(name){ const p=name.split('.'); return p.length>1?p.pop().toLowerCase():'mp3'; }
function base(name){ const i=name.lastIndexOf('.'); return i===-1?name:name.slice(0,i); }

window.TOOL_DEFS.push(
{
  id:'trim-audio', category:'Audio Bench', title:'Trim Audio',
  desc:'Cut an audio file to a specific start time and duration.',
  accept:'.mp3,.wav,.ogg,.aac,.flac,.m4a', multiple:false, minFiles:1, hint:'MP3, WAV, OGG, AAC, FLAC or M4A',
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
    await ffmpeg.run('-ss', String(start), '-i', inName, '-t', String(dur), '-c', 'copy', 'out.mp3');
    const data = ffmpeg.FS('readFile','out.mp3');
    ffmpeg.FS('unlink', inName); ffmpeg.FS('unlink','out.mp3');
    return [{ name: base(files[0].name)+'-trimmed.mp3', blob:new Blob([data.buffer], {type:'audio/mp3'}) }];
  }
},
{
  id:'change-pitch', category:'Audio Bench', title:'Change Pitch',
  desc:'Shift the pitch of an audio file up or down without changing speed.',
  accept:'.mp3,.wav,.ogg,.aac,.flac,.m4a', multiple:false, minFiles:1, hint:'MP3, WAV, OGG, AAC, FLAC or M4A',
  options:[
    { type:'range', id:'semitones', label:'Pitch change', min:-12, max:12, step:1, default:0, suffix:' semitones' }
  ],
  run: async (files, opts, progress) => {
    const ffmpeg = await getFFmpeg(progress);
    const { fetchFile } = FFmpeg;
    const inName = 'in.'+extOf(files[0].name);
    ffmpeg.FS('writeFile', inName, await fetchFile(files[0]));
    const semi = parseInt(opts.semitones || '0', 10);
    const ratio = Math.pow(2, semi/12);
    ffmpeg.setProgress(({ ratio:r }) => progress(10 + Math.round(r*85), 'Processing pitch'));
    await ffmpeg.run('-i', inName, '-af', `asetrate=44100*${ratio},aresample=44100`, 'out.mp3');
    const data = ffmpeg.FS('readFile','out.mp3');
    ffmpeg.FS('unlink', inName); ffmpeg.FS('unlink','out.mp3');
    return [{ name: base(files[0].name)+'-pitch.mp3', blob:new Blob([data.buffer], {type:'audio/mp3'}) }];
  }
},
{
  id:'voice-recorder', category:'Audio Bench', title:'Voice Recorder',
  desc:'Record audio from your microphone directly in the browser.',
  accept:'', multiple:false, minFiles:0, noFile:true, hint:'No file needed — click Run to start recording',
  options:[
    { type:'text', id:'duration', label:'Duration (seconds)', default:'10', placeholder:'10' }
  ],
  run: async (files, opts, progress) => {
     progress(5, 'Requesting microphone access');
     const stream = await navigator.mediaDevices.getUserMedia({audio:true});
     const recorder = new MediaRecorder(stream, {mimeType:'audio/webm'});
     const chunks = [];
     recorder.ondataavailable = e => { if(e.data.size>0) chunks.push(e.data); };
     recorder.start();
     const dur = Math.max(1, parseInt(opts.duration||'10',10)) * 1000;
     const startTime = Date.now();
     await new Promise(resolve => {
       const interval = setInterval(() => {
         const elapsed = Date.now() - startTime;
         progress(5 + Math.round((elapsed/dur)*90), 'Recording...');
         if (elapsed >= dur) { clearInterval(interval); resolve(); }
       }, 200);
     });
     recorder.stop();
     stream.getTracks().forEach(t => t.stop());
     await new Promise(r => { recorder.onstop = r; });
     progress(98, 'Saving');
     return [{ name: 'recording.webm', blob: new Blob(chunks, {type:'audio/webm'}) }];
  }
},
{
  id:'change-volume', category:'Audio Bench', title:'Change Volume',
  desc:'Boost or reduce the volume level of an audio file.',
  accept:'.mp3,.wav,.ogg,.aac,.flac,.m4a', multiple:false, minFiles:1, hint:'MP3, WAV, OGG, AAC, FLAC or M4A',
  options:[
    { type:'range', id:'volume', label:'Volume', min:0, max:300, step:10, default:100, suffix:'%' }
  ],
  run: async (files, opts, progress) => {
    const ffmpeg = await getFFmpeg(progress);
    const { fetchFile } = FFmpeg;
    const inName = 'in.'+extOf(files[0].name);
    ffmpeg.FS('writeFile', inName, await fetchFile(files[0]));
    const vol = (parseInt(opts.volume || '100', 10) / 100).toFixed(2);
    ffmpeg.setProgress(({ ratio }) => progress(10 + Math.round(ratio*85), 'Adjusting volume'));
    await ffmpeg.run('-i', inName, '-af', `volume=${vol}`, 'out.mp3');
    const data = ffmpeg.FS('readFile','out.mp3');
    ffmpeg.FS('unlink', inName); ffmpeg.FS('unlink','out.mp3');
    return [{ name: base(files[0].name)+'-volume.mp3', blob:new Blob([data.buffer], {type:'audio/mp3'}) }];
  }
},
{
  id:'equalizer', category:'Audio Bench', title:'Equalizer',
  desc:'Apply preset EQ profiles to shape your audio tone.',
  accept:'.mp3,.wav,.ogg,.aac,.flac,.m4a', multiple:false, minFiles:1, hint:'MP3, WAV, OGG, AAC, FLAC or M4A',
  options:[
    { type:'chips', id:'preset', label:'Preset', choices:[
      {value:'flat',label:'Flat'},{value:'bass-boost',label:'Bass Boost'},{value:'treble-boost',label:'Treble Boost'},{value:'vocal',label:'Vocal'}
    ], default:'flat' }
  ],
  run: async (files, opts, progress) => {
    const ffmpeg = await getFFmpeg(progress);
    const { fetchFile } = FFmpeg;
    const inName = 'in.'+extOf(files[0].name);
    ffmpeg.FS('writeFile', inName, await fetchFile(files[0]));
    
    let afArgs = [];
    const p = opts.preset || 'flat';
    if(p === 'bass-boost') afArgs = ['-af', 'equalizer=f=100:width_type=h:width=200:g=8'];
    else if(p === 'treble-boost') afArgs = ['-af', 'equalizer=f=8000:width_type=h:width=2000:g=8'];
    else if(p === 'vocal') afArgs = ['-af', 'equalizer=f=3000:width_type=h:width=1000:g=5,equalizer=f=100:width_type=h:width=200:g=-3'];
    
    ffmpeg.setProgress(({ ratio }) => progress(10 + Math.round(ratio*85), 'Applying equalizer'));
    if(afArgs.length) {
      await ffmpeg.run('-i', inName, ...afArgs, 'out.mp3');
    } else {
      await ffmpeg.run('-i', inName, '-c', 'copy', 'out.mp3');
    }
    const data = ffmpeg.FS('readFile','out.mp3');
    ffmpeg.FS('unlink', inName); ffmpeg.FS('unlink','out.mp3');
    return [{ name: base(files[0].name)+'-eq.mp3', blob:new Blob([data.buffer], {type:'audio/mp3'}) }];
  }
},
{
  id:'audio-joiner', category:'Audio Bench', title:'Audio Joiner',
  desc:'Concatenate multiple audio files into one continuous track.',
  accept:'.mp3,.wav,.ogg,.aac,.flac,.m4a', multiple:true, minFiles:2, hint:'Add 2 or more audio files',
  options:[],
  run: async (files, opts, progress) => {
    const ffmpeg = await getFFmpeg(progress);
    const { fetchFile } = FFmpeg;
    
    let listContent = '';
    let exts = new Set();
    for(let i=0; i<files.length; i++) {
      const e = extOf(files[i].name);
      exts.add(e);
      const name = `in${i}.${e}`;
      ffmpeg.FS('writeFile', name, await fetchFile(files[i]));
      listContent += `file '${name}'\n`;
    }
    ffmpeg.FS('writeFile', 'list.txt', new TextEncoder().encode(listContent));
    
    ffmpeg.setProgress(({ ratio }) => progress(10 + Math.round(ratio*85), 'Joining tracks'));
    
    if (exts.size === 1) {
      await ffmpeg.run('-f', 'concat', '-safe', '0', '-i', 'list.txt', '-c', 'copy', 'out.mp3');
    } else {
      await ffmpeg.run('-f', 'concat', '-safe', '0', '-i', 'list.txt', '-acodec', 'libmp3lame', 'out.mp3');
    }
    
    const data = ffmpeg.FS('readFile','out.mp3');
    for(let i=0; i<files.length; i++) ffmpeg.FS('unlink', `in${i}.${extOf(files[i].name)}`);
    ffmpeg.FS('unlink', 'list.txt');
    ffmpeg.FS('unlink', 'out.mp3');
    return [{ name: 'joined-audio.mp3', blob:new Blob([data.buffer], {type:'audio/mp3'}) }];
  }
},
{
  id:'change-speed', category:'Audio Bench', title:'Change Speed',
  desc:'Speed up or slow down audio playback without changing pitch.',
  accept:'.mp3,.wav,.ogg,.aac,.flac,.m4a', multiple:false, minFiles:1, hint:'MP3, WAV, OGG, AAC, FLAC or M4A',
  options:[
    { type:'chips', id:'speed', label:'Speed', choices:[
      {value:'0.5',label:'0.5×'},{value:'0.75',label:'0.75×'},{value:'1.5',label:'1.5×'},{value:'2',label:'2×'}
    ], default:'1.5' }
  ],
  run: async (files, opts, progress) => {
    const ffmpeg = await getFFmpeg(progress);
    const { fetchFile } = FFmpeg;
    const inName = 'in.'+extOf(files[0].name);
    ffmpeg.FS('writeFile', inName, await fetchFile(files[0]));
    const spd = opts.speed || '1.5';
    ffmpeg.setProgress(({ ratio }) => progress(10 + Math.round(ratio*85), 'Changing speed'));
    await ffmpeg.run('-i', inName, '-af', `atempo=${spd}`, 'out.mp3');
    const data = ffmpeg.FS('readFile','out.mp3');
    ffmpeg.FS('unlink', inName); ffmpeg.FS('unlink','out.mp3');
    return [{ name: base(files[0].name)+'-speed.mp3', blob:new Blob([data.buffer], {type:'audio/mp3'}) }];
  }
},
{
  id:'reverse-audio', category:'Audio Bench', title:'Reverse Audio',
  desc:'Play an audio file backwards.',
  accept:'.mp3,.wav,.ogg,.aac,.flac,.m4a', multiple:false, minFiles:1, hint:'MP3, WAV, OGG, AAC, FLAC or M4A',
  options:[],
  run: async (files, opts, progress) => {
    const ffmpeg = await getFFmpeg(progress);
    const { fetchFile } = FFmpeg;
    const inName = 'in.'+extOf(files[0].name);
    ffmpeg.FS('writeFile', inName, await fetchFile(files[0]));
    ffmpeg.setProgress(({ ratio }) => progress(10 + Math.round(ratio*85), 'Reversing audio'));
    await ffmpeg.run('-i', inName, '-af', 'areverse', 'out.mp3');
    const data = ffmpeg.FS('readFile','out.mp3');
    ffmpeg.FS('unlink', inName); ffmpeg.FS('unlink','out.mp3');
    return [{ name: base(files[0].name)+'-reversed.mp3', blob:new Blob([data.buffer], {type:'audio/mp3'}) }];
  }
}
);
