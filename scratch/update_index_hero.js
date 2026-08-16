const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const heroAndHowItWorks = `<section class="hero" id="main">
  <div class="hero-content">
    <div class="hero-eyebrow reveal">150+ tools | zero uploads</div>
    <h1 class="hero-title reveal">Every file has a job to<br> get done. <span class="accent">This is the bench</span><br>you do it on.</h1>
    <p class="hero-desc reveal">Merge a PDF, shrink a photo, clip a video, convert an audio track, format JSON, or generate a QR code. No sign-up, no daily limit, no watermark | and your files never leave this browser tab.</p>

    <div class="central-search-box reveal">
      <div class="cs-input-wrapper">
        <svg class="cs-icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input type="text" id="centralSearchInput" placeholder="Search 150+ tools (e.g. compress pdf, remove bg, qr code, mp4 to mp3)..." autocomplete="off">
        <button id="csClearBtn" class="cs-clear hidden" aria-label="Clear search"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
      </div>
      <div id="searchResultsGrid" class="search-results-grid hidden"></div>
    </div>

    <div class="hero-trust-pills reveal">
      <span class="trust-pill"><svg viewBox="0 0 24 24" class="pill-ico"><path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z"/></svg> Runs 100% in browser</span>
      <span class="trust-pill"><svg viewBox="0 0 24 24" class="pill-ico"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/></svg> Zero uploads</span>
      <span class="trust-pill"><svg viewBox="0 0 24 24" class="pill-ico"><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/></svg> No sign-up or watermark</span>
    </div>
    <div class="hero-stats reveal">
      <div class="hero-stat"><div class="num" data-count-to="150" data-suffix="+">150+</div><div class="lbl">Browser-based tools</div></div>
      <div class="hero-stat"><div class="num" data-count-to="100" data-suffix="%">100%</div><div class="lbl">Private & client-side</div></div>
      <div class="hero-stat"><div class="num" data-count-to="0" data-prefix="$">0</div><div class="lbl">Free forever & no ads wall</div></div>
    </div>
  </div>

  <div class="hero-showcase reveal" aria-label="Mergio Studio Processing Hub">
    <div class="hsc-header">
      <div class="hsc-dots">
        <span class="hsc-dot red"></span>
        <span class="hsc-dot yellow"></span>
        <span class="hsc-dot green"></span>
      </div>
      <div class="hsc-status">
        <span class="hsc-live-dot"></span> WebAssembly Engine
      </div>
      <span class="hsc-badge">Studio Hub</span>
    </div>

    <div class="hsc-body">
      <!-- Job 1: PDF -->
      <div class="hsc-job job-pdf">
        <div class="hsc-job-icon"><svg viewBox="0 0 24 24"><use href="#i-merge"/></svg></div>
        <div class="hsc-job-info">
          <div class="hsc-job-name">financial_report.pdf</div>
          <div class="hsc-job-meta">14.8 MB → 3.6 MB • Compressed</div>
        </div>
        <div class="hsc-job-tag tag-green">−75% Size</div>
      </div>

      <!-- Job 2: Video Audio Extraction -->
      <div class="hsc-job job-video">
        <div class="hsc-job-icon"><svg viewBox="0 0 24 24"><use href="#i-music"/></svg></div>
        <div class="hsc-job-info">
          <div class="hsc-job-name">keynote_presentation.mp4</div>
          <div class="hsc-job-meta">Extracted to MP3 • 320 kbps</div>
        </div>
        <div class="hsc-job-tag tag-purple">
          <span class="hsc-bars">
            <i></i><i></i><i></i><i></i>
          </span>
          Audio Ready
        </div>
      </div>

      <!-- Job 3: HEIC to WebP -->
      <div class="hsc-job job-image">
        <div class="hsc-job-icon"><svg viewBox="0 0 24 24"><use href="#i-image"/></svg></div>
        <div class="hsc-job-info">
          <div class="hsc-job-name">photo_raw_hdr.heic</div>
          <div class="hsc-job-meta">Converted to WebP • Lossless</div>
        </div>
        <div class="hsc-job-tag tag-orange">100% Quality</div>
      </div>

      <!-- Quick Action Shortcuts -->
      <div class="hsc-quick-actions">
        <span class="hsc-qa-label">Quick Launch:</span>
        <div class="hsc-qa-chips">
          <a href="pdf.html" class="hsc-chip chip-pdf" data-transition><svg viewBox="0 0 24 24"><use href="#i-merge"/></svg> PDF Tools</a>
          <a href="image.html" class="hsc-chip chip-image" data-transition><svg viewBox="0 0 24 24"><use href="#i-image"/></svg> Image Lab</a>
          <a href="video.html" class="hsc-chip chip-video" data-transition><svg viewBox="0 0 24 24"><use href="#i-video"/></svg> Video Clip</a>
          <a href="converters.html" class="hsc-chip chip-convert" data-transition><svg viewBox="0 0 24 24"><use href="#i-convert"/></svg> Converters</a>
        </div>
      </div>
    </div>

    <div class="hsc-footer">
      <svg viewBox="0 0 24 24" class="hsc-shield-icon"><use href="#i-shield"/></svg>
      <span>0 KB Uploaded • Processing 100% Local in Browser Memory</span>
    </div>
  </div>
</section>

<section class="how-it-works reveal">
  <h2>How it works</h2>
  <div class="how-grid reveal-stagger">
    <div class="how-step"><div class="how-num">1</div><h3>Pick a bench</h3><p>Choose PDF, Image, Video, Audio, Text, Converters, or Utility, or use central search.</p></div>
    <div class="how-step"><div class="how-num">2</div><h3>Drop your file</h3><p>Drag it in or click to choose. Nothing uploads | the file stays on your device the whole time.</p></div>
    <div class="how-step"><div class="how-num">3</div><h3>Download the result</h3><p>Watch the live progress, then grab your finished file straight from the browser.</p></div>
  </div>
</section>

<section class="reveal" style="max-width:1220px;margin:44px auto 0;padding:0 28px;">
  <h2 style="font-size:22px;font-weight:700;letter-spacing:-.3px;">Explore the seven benches</h2>
  <p style="font-size:13.5px;color:var(--n-text-soft);margin-top:8px;max-width:600px;">Each bench is its own workstation with specialized tools built specifically for that file format.</p>
</section>`;

// Replace from end of benchSliderWrapper to start of bench-explore-grid
const startMarker = '<div class="bench-slider-wrapper" id="benchSliderWrapper">';
const endMarker = '<div class="bench-explore-grid reveal-stagger">';

const startIndex = html.indexOf(startMarker);
const endIndex = html.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const sliderEnd = html.indexOf('</div>\n</div>', startIndex) + '</div>\n</div>'.length;
  html = html.substring(0, sliderEnd) + '\n\n' + heroAndHowItWorks + '\n' + html.substring(endIndex);
  fs.writeFileSync('index.html', html, 'utf8');
  console.log('Successfully updated index.html');
} else {
  console.error('Markers not found!');
}
