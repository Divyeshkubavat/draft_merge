import os

files = [
    'index.html', 'pdf.html', 'image.html', 'video.html', 
    'audio.html', 'text.html', 'converters.html', 'utility.html'
]

for fname in files:
    if not os.path.exists(fname): continue
    
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace('?? Your files never leave this browser tab', '🔒 Your files never leave this browser tab')
    
    with open(fname, 'w', encoding='utf-8') as f:
        f.write(content)
