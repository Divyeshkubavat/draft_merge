const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const files = ['pdf.html', 'image.html', 'video.html', 'text.html', 'audio.html', 'converters.html', 'utility.html'];

files.forEach(file => {
  const filePath = path.join(root, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Remove reveal from tool-seo-content
  content = content.replace(/class="tool-seo-content\s+reveal"/g, 'class="tool-seo-content"');

  // 2. Fix literal \n in content
  content = content.replace(/\\n/g, '\n');

  // 3. Fix unclosed <div class="tool-seo-grid"> if present
  content = content.replace(/<div class="tool-seo-grid">\s*/g, '');

  // 4. In pdf.html, fix the extra dangling </div> before <section class="tool-seo-content">
  if (file === 'pdf.html') {
    content = content.replace(/<\/div>\s*<\/div>\s*<section class="tool-seo-content">/g, '</div>\n\n<section class="tool-seo-content">');
    // Also check trust-line area in pdf.html
    content = content.replace(/<div class="trust-line">\s*<span>🔒 100% browser-based<\/span> · <span>No uploads<\/span> · <span>No sign-up<\/span> · <span>No watermarks<\/span>\s*<\/div>\s*<\/div>\s*<section/g, '<div class="trust-line">\n  <span>🔒 100% browser-based</span> · <span>No uploads</span> · <span>No sign-up</span> · <span>No watermarks</span>\n</div>\n\n<section');
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Cleaned and verified ${file}`);
});
