import os
import re

files = [
    'index.html', 'pdf.html', 'image.html', 'video.html', 
    'audio.html', 'text.html', 'converters.html', 'utility.html'
]

for fname in files:
    if not os.path.exists(fname): continue
    
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = re.sub(
        r'<span class=.footer-trust.>[^<]*</span>', 
        '<span class=\"footer-trust\">' + chr(128274) + ' Your files never leave this browser tab</span>', 
        content
    )
    
    with open(fname, 'w', encoding='utf-8') as f:
        f.write(content)
