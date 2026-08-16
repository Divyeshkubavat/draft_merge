const fs = require('fs');

const css = fs.readFileSync('css/style.css', 'utf8');

const regex = /(?:width|min-width)\s*:\s*([0-9]+)px/g;
let match;
const lines = css.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  let m;
  const re = /(?:width|min-width|max-width)\s*:\s*([0-9]+)px/g;
  while ((m = re.exec(line)) !== null) {
    const val = parseInt(m[1], 10);
    if (val > 300 && val < 1000 && !line.includes('max-width') && !line.includes('clamp') && !line.includes('radial-gradient')) {
      console.log(`Line ${i + 1}: ${line.trim()}`);
    }
  }
}
