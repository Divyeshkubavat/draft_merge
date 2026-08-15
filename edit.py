import os
import re

files = [
    'index.html', 'pdf.html', 'image.html', 'video.html', 
    'audio.html', 'text.html', 'converters.html', 'utility.html'
]

favicon_replacement = """<link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32.png">
<link rel="apple-touch-icon" sizes="180x180" href="assets/apple-touch-icon.png">"""

manifest_link = '<link rel="manifest" href="manifest.json">'
skip_link = '<a href="#main" class="skip-link">Skip to main content</a>'

footer_replacement = """<footer class="site-footer">
  <div class="footer-grid">
    <div class="footer-col">
      <h4>Product</h4>
      <ul>
        <li><a href="index.html">Home</a></li>
        <li><a href="pdf.html">PDF Tools</a></li>
        <li><a href="image.html">Image Tools</a></li>
        <li><a href="video.html">Video Tools</a></li>
        <li><a href="audio.html">Audio Tools</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4>More Tools</h4>
      <ul>
        <li><a href="text.html">Text Tools</a></li>
        <li><a href="converters.html">Converters</a></li>
        <li><a href="utility.html">Utility</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4>Legal</h4>
      <ul>
        <li><a href="privacy.html">Privacy Policy</a></li>
        <li><a href="terms.html">Terms of Service</a></li>
        <li><a href="contact.html">Contact</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <div class="footer-brand">
        <strong>Mergio</strong>
        <p>Every file has a job to get done.<br>This is the bench you do it on.</p>
        <span class="footer-trust">?? Your files never leave this browser tab</span>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <p>&copy; 2026 Mergio. All rights reserved. Built for the desk, not the cloud.</p>
  </div>
</footer>"""

sw_registration = """<script>
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}
</script>
</body>"""

for fname in files:
    if not os.path.exists(fname): continue
    
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Replace favicons
    # We replace any line containing 'data:image/png;base64'
    content = re.sub(r'<link[^>]*href="data:image/png;base64,[^>]*>\n?', '', content)
    # Add new favicons before </head>
    if '<link rel="icon" type="image/png" sizes="32x32"' not in content:
        content = content.replace('</head>', f'{favicon_replacement}\n</head>')
    
    # 2. Add manifest link
    if '<link rel="manifest"' not in content:
        content = content.replace('</head>', f'{manifest_link}\n</head>')
    
    # 3. Add skip link
    if 'class="skip-link"' not in content:
        content = re.sub(r'(<body[^>]*>)', r'\1\n  ' + skip_link, content, count=1)
        
    # 4. Add id="main"
    if 'id="main"' not in content:
        if fname == 'index.html':
            content = content.replace('<section class="hero">', '<section class="hero" id="main">')
        else:
            content = content.replace('<section class="bench-hero">', '<section class="bench-hero" id="main">')

    # 5. Update Footer
    # Replace existing footer element
    content = re.sub(r'<footer\b[^>]*>.*?</footer>', footer_replacement, content, flags=re.DOTALL)
    
    # 6. Register Service Worker
    if 'serviceWorker.register' not in content:
        content = content.replace('</body>', sw_registration)
        
    with open(fname, 'w', encoding='utf-8') as f:
        f.write(content)

print("Done")
