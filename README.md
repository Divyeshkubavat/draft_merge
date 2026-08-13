# Draft & Merge — a file workshop

A multi-page toolkit site with 22 working file tools across four "benches":
PDF, Image, Video, and Text. Everything runs **inside the visitor's browser** —
no backend, no file uploads, no sign-up.

## Pages

- `index.html` — landing page: what the site does, how it works, and an
  "Explore bench" card for each of the four categories.
- `pdf.html`, `image.html`, `video.html`, `text.html` — one page per bench,
  each with a detail section about that bench plus its tool grid. Only the
  libraries that bench actually needs are loaded on that page (e.g. `pdf.html`
  doesn't load ffmpeg, `video.html` doesn't load pdf-lib), so each page is
  lighter than the old single-page version.

Small touches added throughout: a top loading bar and fade transition between
pages, scroll-reveal animations, an animated tool-count on the homepage,
tilting "explore" cards, and a processing indicator with rotating status tips
(including a heads-up the first time the video engine downloads).

## How to open it

For the PDF, Image and Text benches: just open `index.html` in a modern
desktop browser and click through to a bench. No build step, no server
required.

### Video Bench — needs one extra step locally

Browser-based video processing needs `SharedArrayBuffer`, which browsers only
allow on pages served with two security headers (COOP/COEP). Opening the file
directly, or `python3 -m http.server`, won't send those headers, so video
tools will show a clear "needs security headers" message until you do one of
these:

**To test locally:** run the included zero-dependency server —
```
node serve.js
```
then open `http://localhost:8000`. This sets the required headers for you.

**Once deployed** (see "Going live" below), video tools work automatically —
the `_headers` file (Netlify/Cloudflare Pages) and `vercel.json` (Vercel) in
this folder already set the same headers for you. **GitHub Pages is the one
exception** — it doesn't support custom response headers, so the Video Bench
won't work if you host there. PDF, Image, and Text benches work fine on
GitHub Pages regardless.

## What's actually implemented (all real, no placeholders)

**PDF Bench** — Merge, Split, Rotate, Compress (image re-encode), PDF→JPG, JPG/PNG→PDF
**Image Bench** — Compress, Resize, Crop, Convert format, Rotate & flip, Watermark, Image→PDF, Bulk compressor
**Video Bench** — Compress, Convert format, Trim, Video→MP3, Video→GIF, Mute
**Text Bench** — Image→Text (OCR), PDF→Text

All of these produce a real, downloadable file — there are no "coming soon" buttons.

## Known scope limits (be upfront about these with users)

- **Word / Excel / PowerPoint → PDF conversion is NOT included.** Doing this
  well client-side needs much heavier libraries and still produces rougher
  results than a server-side converter (like LibreOffice headless). This is
  the one category from our tool list that genuinely needs a backend to do
  properly — happy to build that as a phase two with a small server component.
- **Compress PDF** works by re-rendering each page as an image and re-saving —
  great for scanned/photo-heavy PDFs, does less for PDFs that are already
  mostly text (text-based PDFs are already small).
- **Crop Image** uses ratio + anchor point rather than a free-drag box, to
  keep this build reliable. A drag-to-crop handle can be added later.
- **Video tools** download a ~25MB engine (ffmpeg.wasm) the first time any
  video tool is used in a session. This is normal and only happens once per
  visit. Large videos (over ~200MB) may be slow or hit memory limits on
  low-RAM devices — that's a real constraint of doing video processing in
  the browser instead of on a server.
- OCR accuracy depends on image clarity, like any OCR engine.

## File structure

```
index.html           Landing page: intro, how-it-works, explore-bench cards
pdf.html              PDF Bench: detail section + tool grid + workspace panel
image.html            Image Bench: detail section + tool grid + workspace panel
video.html             Video Bench: detail section + tool grid + workspace panel
text.html              Text Bench: detail section + tool grid + workspace panel
css/style.css         All styling (Fluent-inspired theme) + multi-page/animation styles
js/common.js          Shared cross-page JS: load bar, page transitions, scroll reveal, counters
js/tools-pdf.js       PDF tool logic (pdf-lib + pdf.js) — loaded on pdf.html only
js/tools-image.js     Image tool logic (Canvas API + pdf-lib/JSZip) — loaded on image.html only
js/tools-video.js     Video tool logic (ffmpeg.wasm) — loaded on video.html only
js/tools-text.js      OCR + PDF text extraction (Tesseract.js + pdf.js) — loaded on text.html only
js/app.js             Workspace wiring: dropzone, options, run/progress/download — loaded on each bench page
```

Each tool is a plain object pushed into `window.TOOL_DEFS` — to add a new
tool, copy the shape of an existing one in the matching `tools-*.js` file and
add a `.tool-card` block to that bench's HTML page. No framework, no build
step.

## Going live (so real visitors can use it)

This folder is static — it can be hosted for free on Cloudflare Pages,
Netlify, GitHub Pages, or Vercel by dragging the folder into their dashboard.
Because there's no backend, hosting costs stay at $0 even with heavy traffic;
your only real cost will be a domain name.

Before launch: swap in your own domain in any absolute links, and consider
adding a small `og:image` / social preview meta tag for link sharing.
