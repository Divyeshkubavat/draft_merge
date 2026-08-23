import re

html_path = r'c:\Users\dkuba\Downloads\draft-and-merge-multipage\video.html'
with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the 8 tools
tools_to_remove = [
    'extract-frames',
    'gif-to-video',
    'add-subtitles',
    'video-framerate',
    'remove-video-metadata',
    'video-thumbnail',
    'video-to-webm',
    'webm-to-mp4'
]

for tool in tools_to_remove:
    # regex to match <div class="tool-card" data-tool="TOOL_NAME"... </div>
    # Needs to match until the next \n
    pattern = r'^\s*<div class="tool-card" data-tool="' + tool + r'".*?</div>\n'
    content = re.sub(pattern, '', content, flags=re.MULTILINE)

# Replace trust strip
old_strip = """<div class="strip">
  <div class="strip-inner reveal-stagger">
    <div class="strip-item"><div class="ico"><svg class="icon"><use href="#i-shield"/></svg></div><h4>Nothing uploaded</h4><p>Every tool runs inside your browser tab using your device's own processing power. Files are never sent to a server.</p></div>
    <div class="strip-item"><div class="ico"><svg class="icon"><use href="#i-bolt"/></svg></div><h4>No account, no limit</h4><p>There's no sign-up wall and no daily cap. Open a bench, drop a file, get your result.</p></div>
    <div class="strip-item"><div class="ico"><svg class="icon"><use href="#i-spark"/></svg></div><h4>No watermark</h4><p>What you export is exactly what you made nothing stamped on top of it.</p></div>
  </div>
</div>"""
new_strip = """<div class="trust-line">
  <span>🔒 100% browser-based</span> · <span>No uploads</span> · <span>No sign-up</span> · <span>No watermarks</span>
</div>"""

if old_strip in content:
    content = content.replace(old_strip, new_strip)
else:
    print("Warning: old strip not found exactly. Trying regex.")
    content = re.sub(r'<div class="strip">.*?</div>\s*</div>', new_strip, content, flags=re.DOTALL)

# Insert SEO content
with open(r'c:\Users\dkuba\Downloads\draft-and-merge-multipage\seo_content.html', 'r', encoding='utf-8') as f:
    seo_content = f.read()

content = content.replace('<footer class="site-footer">', seo_content + '\n<footer class="site-footer">')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated video.html successfully.")
