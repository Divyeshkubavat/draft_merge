const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

// Helper to replace the section between trust-line and footer in any bench HTML
function updateBenchSeoContent(fileName, pageHeading, guidesHtml) {
  const filePath = path.join(root, fileName);
  let html = fs.readFileSync(filePath, 'utf8');

  // Locate the end of workspaceOverlay
  const wsOverlayEnd = html.indexOf('id="workspaceOverlay"');
  if (wsOverlayEnd === -1) {
    console.error(`workspaceOverlay not found in ${fileName}`);
    return;
  }

  // Find the footer
  const footerStart = html.indexOf('<footer class="site-footer">');
  if (footerStart === -1) {
    console.error(`footer not found in ${fileName}`);
    return;
  }

  // Find workspace closing
  const wsClose = html.indexOf('</div>\n</div>\n</div>', wsOverlayEnd);
  let beforeSection = '';
  if (wsClose !== -1) {
    beforeSection = html.substring(0, wsClose + '</div>\n</div>\n</div>'.length);
  } else {
    // try other matching
    const optRow = html.indexOf('id="optRow"');
    const resBox = html.indexOf('id="resultBox"', optRow);
    const resBoxEnd = html.indexOf('</div>\n      </div>\n    </div>\n  </div>', resBox);
    if (resBoxEnd !== -1) {
      beforeSection = html.substring(0, resBoxEnd + '</div>\n      </div>\n    </div>\n  </div>'.length);
    } else {
      // Find trust line
      const trustIndex = html.indexOf('<div class="trust-line">');
      if (trustIndex !== -1) {
        beforeSection = html.substring(0, trustIndex);
      }
    }
  }

  const footerAndBeyond = html.substring(footerStart);

  const newMiddle = `\n\n<div class="trust-line">
  <span>🔒 100% browser-based</span> · <span>No uploads</span> · <span>No sign-up</span> · <span>No watermarks</span>
</div>

<section class="tool-seo-content">
  <h2>${pageHeading}</h2>

${guidesHtml.trim()}
</section>\n\n`;

  const finalHtml = beforeSection.trim() + newMiddle + footerAndBeyond;
  fs.writeFileSync(filePath, finalHtml, 'utf8');
  console.log(`Successfully polished and updated ${fileName}`);
}

module.exports = { updateBenchSeoContent, root };
