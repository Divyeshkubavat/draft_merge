import re

tools = [
    ('audio-converter', 'Audio Converter', 'Convert between MP3, WAV, OGG, AAC, and FLAC using FFmpeg compiled to WebAssembly. Perfect for making music tracks compatible with older devices or saving space.', 'How to convert audio formats:', 'audio', 'FFmpeg WASM'),
    ('document-converter', 'Document Converter', 'Quickly turn plain text or Markdown files into HTML format. Great for web developers or writers who need to prepare text for online publishing.', 'How to convert text to HTML:', 'document', 'client-side processing'),
    ('ebook-converter', 'Ebook Converter', 'Extract readable text content from an EPUB ebook using JSZip. This helps when you want to read a book in a basic text editor or extract quotes.', 'How to extract text from EPUB:', 'ebook', 'JSZip'),
    ('video-converter', 'Video Converter', 'Switch video files between MP4, WebM, AVI, and MOV using WebAssembly FFmpeg. Essential for ensuring your video plays on the web or specific media players.', 'How to change video format:', 'video', 'FFmpeg WebAssembly'),
    ('font-converter', 'Font Converter', 'Extract metadata and file information from TTF, OTF, and WOFF font files using a DataView binary parser. Ideal for web designers verifying font properties.', 'How to extract font details:', 'font', 'DataView binary parser'),
    ('archive-extractor', 'Archive Extractor', 'Unzip and extract all files from a ZIP archive directly in your browser. A convenient way to access compressed files without installing software.', 'How to extract ZIP archives:', 'archive', 'JSZip'),
    ('image-converter', 'Image Converter', 'Convert photos and graphics between JPG, PNG, and WebP using the HTML5 Canvas API. Essential for optimizing images for web performance.', 'How to convert images:', 'image', 'HTML5 Canvas API'),
    ('archive-converter', 'Archive Converter', 'Repack a ZIP archive with different compression settings entirely inside your browser tab using JSZip. Useful for optimizing archive size.', 'How to repack ZIP files:', 'archive', 'JSZip repack'),
    ('heic-to-jpg', 'HEIC to JPG', 'Transform Apple HEIC photos into standard JPG format for broad compatibility. Crucial for sharing iPhone photos with Windows users or non-Apple devices.', 'How to convert HEIC to JPG:', 'image', 'Canvas rendering'),
    ('heic-to-png', 'HEIC to PNG', 'Turn high-efficiency HEIC images into lossless PNG files. Helpful when you need a widely supported format without losing quality.', 'How to convert HEIC to PNG:', 'image', 'client-side Canvas'),
    ('webp-to-jpg', 'WebP to JPG', 'Change modern WebP images back into classic JPG format. Necessary when uploading to older platforms that do not support WebP.', 'How to convert WebP to JPG:', 'image', 'Canvas API'),
    ('webp-to-png', 'WebP to PNG', 'Convert WebP images to standard PNGs while preserving transparency. Perfect for using web graphics in desktop editing software.', 'How to convert WebP to PNG:', 'image', 'Canvas pixel manipulation'),
    ('svg-to-png', 'SVG to PNG', 'Render vector SVG graphics into raster PNG images at 2x resolution. Great for generating fallbacks or using vector assets in raster-only contexts.', 'How to convert SVG to PNG:', 'image', 'Canvas 2x rendering'),
    ('svg-to-jpg', 'SVG to JPG', 'Convert SVG vector files into standard JPGs with a solid white background. Ideal for inserting logos or icons into standard documents.', 'How to convert SVG to JPG:', 'image', 'Canvas white background'),
    ('gif-to-mp4', 'GIF to MP4', 'Turn heavy animated GIFs into lightweight MP4 video files using FFmpeg faststart. Massively reduces file size for faster page loading.', 'How to convert GIF to MP4:', 'video', 'FFmpeg faststart'),
    ('gif-to-webp', 'GIF to WebP', 'Transform classic GIFs into animated WebP files for modern browsers. Improves performance and loading speed on the web.', 'How to convert GIF to animated WebP:', 'image', 'FFmpeg animated WebP'),
    ('mov-to-mp4', 'MOV to MP4', 'Convert Apple MOV videos into standard MP4 format using FFmpeg libx264. Ensures playback compatibility on practically any device.', 'How to convert MOV to MP4:', 'video', 'FFmpeg libx264'),
    ('mkv-to-mp4', 'MKV to MP4', 'Change MKV video containers to standard MP4 files without losing quality. Required for playing videos natively in most web browsers.', 'How to convert MKV to MP4:', 'video', 'FFmpeg container switch'),
    ('avi-to-mp4', 'AVI to MP4', 'Modernize old AVI video files by converting them to MP4 format. Crucial for sharing legacy videos on modern social media platforms.', 'How to convert AVI to MP4:', 'video', 'FFmpeg processing'),
    ('wav-to-mp3', 'WAV to MP3', 'Compress large, lossless WAV audio into standard MP3 format using FFmpeg libmp3lame. Reduces file size significantly for easy sharing.', 'How to convert WAV to MP3:', 'audio', 'FFmpeg libmp3lame'),
    ('flac-to-mp3', 'FLAC to MP3', 'Convert high-fidelity FLAC tracks to MP3 format for mobile listening. Useful when space is limited on your portable devices.', 'How to convert FLAC to MP3:', 'audio', 'FFmpeg processing'),
    ('m4a-to-mp3', 'M4A to MP3', 'Change Apple M4A audio files into universally supported MP3s. Great for playing iTunes music in other media players.', 'How to convert M4A to MP3:', 'audio', 'FFmpeg libmp3lame'),
    ('ogg-to-mp3', 'OGG to MP3', 'Convert OGG Vorbis audio files to standard MP3. Helpful when you need maximum compatibility with hardware audio players.', 'How to convert OGG to MP3:', 'audio', 'FFmpeg'),
    ('docx-to-txt', 'DOCX to TXT', 'Extract unformatted plain text from Microsoft Word DOCX files using JSZip XML parsing. Perfect for feeding text into other applications or scripts.', 'How to convert DOCX to text:', 'document', 'JSZip XML extraction'),
    ('docx-to-html', 'DOCX to HTML', 'Turn Microsoft Word documents into HTML code right in your browser. A lifesaver for quickly moving document content to a website.', 'How to convert DOCX to HTML:', 'document', 'JSZip XML rendering'),
    ('xlsx-to-csv', 'XLSX to CSV', 'Extract data from Excel XLSX spreadsheets into standard CSV format. Essential for importing data into databases or other software tools.', 'How to convert XLSX to CSV:', 'document', 'JSZip XML and shared strings'),
    ('csv-to-xlsx', 'CSV to XLSX', 'Build a full OpenXML Excel spreadsheet from a simple CSV file. Great for sharing tabular data in a universally recognized format.', 'How to convert CSV to Excel:', 'document', 'JSZip full OpenXML build'),
    ('pptx-to-jpg', 'PPTX to JPG', 'Extract slides from a PowerPoint PPTX file and save them as JPG images. Useful for sharing presentations where PowerPoint is not installed.', 'How to extract JPGs from PPTX:', 'image', 'JSZip media extraction'),
]

html_parts = []
html_parts.append('<section class="tool-seo-content reveal">\n<h2>Complete Guide to Mergio Converters</h2>\n<div class="tool-seo-grid">')

for (id, title, desc, step_intro, category, tech) in tools:
    # Adding variety to the FAQ
    faq1_q = f"Is there a file size limit for {title}?"
    faq1_a = f"Because {title} runs entirely in your browser using {tech}, very large files might cause slower processing or run out of memory depending on your device specs, but there is no hard cap imposed by our servers."
    
    faq2_q = f"Is my data secure when using the {title}?"
    faq2_a = f"Absolutely. Your files never leave your device. The {title} works locally via 100% browser-based technology."

    html = f'''
<article class="tool-guide" id="{id}-guide">
  <h3>{title}</h3>
  <p>{desc}</p>
  <h4>{step_intro}</h4>
  <ol>
    <li>Select your file and drag it into the <strong>{title}</strong> dropzone.</li>
    <li>Adjust any necessary output options (if applicable).</li>
    <li>Click "Run Conversion" to process the file instantly.</li>
    <li>Download the resulting file directly to your device.</li>
  </ol>
  <div class="tool-tip-box">
    <strong>Pro Tip:</strong> All processing is done locally. No accounts, no uploads, and no watermarks!
  </div>
  <details class="tool-faq">
    <summary>{faq1_q}</summary>
    <p>{faq1_a}</p>
  </details>
  <details class="tool-faq">
    <summary>{faq2_q}</summary>
    <p>{faq2_a}</p>
  </details>
</article>'''
    html_parts.append(html)

html_parts.append('</div>\n</section>')
content_to_insert = '\\n'.join(html_parts)

with open('c:/Users/dkuba/Downloads/draft-and-merge-multipage/converters.html', 'r', encoding='utf-8') as f:
    original = f.read()

# Replace the trust strip
old_strip = """<div class="strip">
  <div class="strip-inner reveal-stagger">
    <div class="strip-item"><div class="ico"><svg class="icon"><use href="#i-shield"/></svg></div><h4>Nothing uploaded</h4><p>Every tool runs inside your browser tab using your device's own processing power. Files are never sent to a server.</p></div>
    <div class="strip-item"><div class="ico"><svg class="icon"><use href="#i-bolt"/></svg></div><h4>No account, no limit</h4><p>There's no sign-up wall and no daily cap. Open a bench, drop a file, get your result.</p></div>
    <div class="strip-item"><div class="ico"><svg class="icon"><use href="#i-spark"/></svg></div><h4>No watermark</h4><p>What you export is exactly what you made | nothing stamped on top of it.</p></div>
  </div>
</div>"""

new_strip = """<div class="trust-line">
  <span>🔒 100% browser-based</span> · <span>No uploads</span> · <span>No sign-up</span> · <span>No watermarks</span>
</div>"""

if old_strip in original:
    original = original.replace(old_strip, new_strip)
else:
    # regex fallback
    original = re.sub(r'<div class="strip">.*?</div>\s*</div>', new_strip, original, flags=re.DOTALL)

# Insert the content
original = original.replace('<footer class="site-footer">', content_to_insert + '\n<footer class="site-footer">')

with open('c:/Users/dkuba/Downloads/draft-and-merge-multipage/converters.html', 'w', encoding='utf-8') as f:
    f.write(original)
print("Done formatting and writing 28 tools.")
