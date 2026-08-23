const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const benches = [
  { name: 'PDF', file: 'pdf.html', js: 'js/tools-pdf.js' },
  { name: 'Image', file: 'image.html', js: 'js/tools-image.js' },
  { name: 'Video', file: 'video.html', js: 'js/tools-video.js' },
  { name: 'Text', file: 'text.html', js: 'js/tools-text.js' },
  { name: 'Audio', file: 'audio.html', js: 'js/tools-audio.js' },
  { name: 'Converters', file: 'converters.html', js: 'js/tools-converters.js' },
  { name: 'Utility', file: 'utility.html', js: 'js/tools-utility.js' },
];

console.log('========================================================================');
console.log('MERGIO ADSENSE LOW-VALUE CONTENT FIX AUDIT & VERIFICATION REPORT');
console.log('========================================================================\n');

let totalGuides = 0;
let totalWords = 0;

benches.forEach(b => {
  const htmlPath = path.join(root, b.file);
  const html = fs.readFileSync(htmlPath, 'utf8');

  // Count tool cards
  const toolCards = (html.match(/class="tool-card"/g) || []).length;

  // Count tool guides
  const toolGuides = (html.match(/class="tool-guide"/g) || []).length;

  // Extract SEO section
  const seoMatch = html.match(/<section class="tool-seo-content[^>]*>([\s\S]*?)<\/section>/);
  let wordCount = 0;
  if (seoMatch) {
    const text = seoMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    wordCount = text.split(' ').filter(w => w.length > 0).length;
  }

  // Check trust strip (should have compact trust-line, not 3-card strip)
  const hasCompactTrust = html.includes('trust-line');
  const hasOldStrip = html.includes('<div class="strip">');

  // Check badges
  const drawerBadge = html.match(/<span class="dl-badge">(\d+)<\/span>/);
  const sliderBadge = html.match(/<span class="bs-badge">(\d+)<\/span>/);

  totalGuides += toolGuides;
  totalWords += wordCount;

  console.log(`BENCH: ${b.name.toUpperCase()} (${b.file})`);
  console.log(`  - Tool Cards in Grid: ${toolCards}`);
  console.log(`  - Tool Guides Generated: ${toolGuides}`);
  console.log(`  - Unique SEO Words: ~${wordCount.toLocaleString()} words`);
  console.log(`  - Average Words/Guide: ~${toolGuides ? Math.round(wordCount / toolGuides) : 0} words`);
  console.log(`  - Compact Trust-Line: ${hasCompactTrust ? '✅ Present' : '❌ Missing'}`);
  console.log(`  - Old Bulky Strip Removed: ${!hasOldStrip ? '✅ Removed' : '❌ Still present'}`);
  console.log('------------------------------------------------------------------------');
});

// Check Homepage
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const whySection = indexHtml.match(/<section class="content-section[^>]*>([\s\S]*?)<\/section>/g) || [];
let homeWords = 0;
whySection.forEach(sec => {
  const text = sec.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  homeWords += text.split(' ').filter(w => w.length > 0).length;
});
const homeFaq = indexHtml.match(/<section class="faq-section[^>]*>([\s\S]*?)<\/section>/);
let faqWords = 0;
if (homeFaq) {
  const text = homeFaq[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  faqWords = text.split(' ').filter(w => w.length > 0).length;
}

console.log(`HOMEPAGE (index.html)`);
console.log(`  - Expanded Content Sections: ~${homeWords.toLocaleString()} words`);
console.log(`  - FAQ Section: ~${faqWords.toLocaleString()} words (10 FAQs)`);
console.log(`  - Total Homepage Unique Content: ~${(homeWords + faqWords).toLocaleString()} words`);
console.log('------------------------------------------------------------------------');

// Check Sitemap
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const urlCount = (sitemap.match(/<loc>/g) || []).length;
console.log(`SITEMAP (sitemap.xml)`);
console.log(`  - Total Indexed URLs & Anchors: ${urlCount}`);
console.log(`  - Utility Bench Included: ${sitemap.includes('/utility') ? '✅ Yes' : '❌ Missing'}`);
console.log('------------------------------------------------------------------------');

console.log(`\n🎉 TOTAL SITE-WIDE METRICS:`);
console.log(`  - Total Tool Guides Written: ${totalGuides}`);
console.log(`  - Total Bench Unique Words Added: ~${totalWords.toLocaleString()} words`);
console.log(`  - Total Site Unique Content: ~${(totalWords + homeWords + faqWords).toLocaleString()} words`);
console.log('========================================================================\n');
