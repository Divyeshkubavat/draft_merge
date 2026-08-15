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

for fname in files:
    if not os.path.exists(fname): continue
    
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove existing favicons to clean up the duplicates
    content = re.sub(r'<link[^>]*href="assets/apple-touch-icon\.png"[^>]*>\n?', '', content)
    content = re.sub(r'<link[^>]*href="assets/favicon-32\.png"[^>]*>\n?', '', content)
    
    # Remove existing manifest
    content = re.sub(r'<link rel="manifest" href="manifest\.json">\n?', '', content)
    
    # Add new favicons and manifest before </head>
    content = content.replace('</head>', f'{favicon_replacement}\n{manifest_link}\n</head>')
    
    # Fix bench-hero id="main"
    if 'id="main"' not in content:
        if fname == 'index.html':
            pass # Already done
        else:
            content = re.sub(r'<section class="bench-hero ([^"]+)"', r'<section class="bench-hero \1" id="main"', content)

    # For index.html, if it's already there it might have 'id="main"' in it
    # We can be sure index.html has `<section class="hero" id="main">` already from previous step.

    with open(fname, 'w', encoding='utf-8') as f:
        f.write(content)

print("Cleanup Done")
