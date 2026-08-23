const fs = require('fs');
const path = require('path');

const imageHtmlPath = path.join(__dirname, '..', 'image.html');
let html = fs.readFileSync(imageHtmlPath, 'utf8');

// Find the line with <div class="opt-row" id="optRow"></div>
const optRowIndex = html.indexOf('<div class="opt-row" id="optRow"></div>');
if (optRowIndex === -1) {
  console.error('optRow not found');
  process.exit(1);
}

const beforeOptRow = html.substring(0, optRowIndex + '<div class="opt-row" id="optRow"></div>'.length);

const guides = `
      <button class="run-btn" id="runBtn" disabled><span class="spinner"></span><span id="runBtnLabel">Add a file first</span></button>

      <div class="status-box" id="statusBox">
        <div class="status-line"><span class="status-left"><span class="proc-orbit" aria-hidden="true"></span><span id="statusText">Working…</span></span><span id="statusPct">0%</span></div>
        <div class="progress-track"><div class="progress-fill" id="progressFill"></div></div>
        <div class="status-tip" id="statusTip"></div>
      </div>

      <div class="error-box" id="errorBox"><svg viewBox="0 0 24 24"><use href="#i-alert"/></svg><span id="errorText"></span></div>

      <div class="result-box" id="resultBox">
        <div class="r-title"><svg viewBox="0 0 24 24"><use href="#i-check-circle"/></svg> Ready</div>
        <div class="r-files" id="resultFiles"></div>
      </div>
    </div>
  </div>
</div>

<div class="trust-line">
  <span>🔒 100% browser-based</span> · <span>No uploads</span> · <span>No sign-up</span> · <span>No watermarks</span>
</div>

<section class="tool-seo-content reveal">
  <h2>Image Tools Guide</h2>

  <article class="tool-guide" id="compress-image-guide">
    <h3>Compress Image — Reduce Photo File Size Without Quality Loss</h3>
    <p>High-resolution photos from modern smartphones and cameras often weigh 5 to 20 megabytes, making them too heavy for email attachments, web publishing, or mobile sharing. Mergio's Image Compressor re-encodes JPG, PNG, and WebP images directly on an off-screen HTML5 Canvas, fine-tuning DCT coefficients and chroma subsampling to eliminate redundant bytes while keeping the visual fidelity crisp and sharp.</p>
    <h4>How to compress images</h4>
    <ol>
      <li>Click <strong>Compress Image</strong> to open the workspace.</li>
      <li>Drop your image into the upload area or click to select from your device.</li>
      <li>Adjust the quality slider (70%–80% is the sweet spot for web publishing).</li>
      <li>Click <strong>Run</strong> and download your optimized image instantly.</li>
    </ol>
    <details class="tool-faq">
      <summary>Will compressing an image change its dimensions?</summary>
      <p>No. Compression adjusts the pixel data encoding efficiency without altering the width or height in pixels. If you need to shrink the physical dimensions, use the <a href="#resize-image">Resize Image</a> tool.</p>
    </details>
    <details class="tool-faq">
      <summary>Which format compresses best?</summary>
      <p>JPG and WebP yield the highest compression ratios for photographs. PNG is lossless and best suited for illustrations, diagrams, and graphics with sharp edges.</p>
    </details>
    <div class="tool-tip-box">
      <strong>Pro Tip:</strong> For batch processing a whole folder of graphics at once, use the <a href="#bulk-compress">Bulk Compressor</a> tool.
    </div>
  </article>

  <article class="tool-guide" id="resize-image-guide">
    <h3>Resize Image — Scale Pixel Width and Height with Aspect Lock</h3>
    <p>Whether you need an exact 1200×630 banner for social media link previews, a 500px product thumbnail for an online store, or an optimized avatar for a profile picture, resizing alters physical image dimensions seamlessly. The tool recalculates pixel matrices via bicubic canvas interpolation, preserving sharp text and clean lines without distortion.</p>
    <h4>How to resize an image</h4>
    <ol>
      <li>Select the <strong>Resize Image</strong> tool from the grid.</li>
      <li>Upload the image you wish to scale.</li>
      <li>Set your target width in pixels (proportional height is maintained automatically).</li>
      <li>Click <strong>Run</strong> to generate and download the resized graphic.</li>
    </ol>
    <details class="tool-faq">
      <summary>Does enlarging an image make it blurry?</summary>
      <p>Scaling up beyond an image's native resolution requires pixel interpolation. While the canvas smoothing algorithm reduces jaggedness, starting with high-resolution source files always yields the sharpest output.</p>
    </details>
    <details class="tool-faq">
      <summary>Can I scale by percentage instead of pixels?</summary>
      <p>The slider allows granular pixel control. To achieve a 50% scale, take half of your original pixel width displayed in the workspace file card.</p>
    </details>
  </article>

  <article class="tool-guide" id="crop-image-guide">
    <h3>Crop Image — Cut to 1:1, 4:3, 16:9, or Custom Aspect Ratios</h3>
    <p>Cropping reframes your visual content to highlight key subjects, remove unwanted background clutter, or match standardized display formats like square Instagram posts or 16:9 YouTube thumbnails. The tool extracts a precise bounding box from the canvas and re-renders the selected area without recompression degradation.</p>
    <h4>How to crop an image</h4>
    <ol>
      <li>Open the <strong>Crop Image</strong> tool and drop in your picture.</li>
      <li>Select a preset aspect ratio (1:1 Square, 4:3 Standard, 16:9 Widescreen, 3:4 Portrait).</li>
      <li>Choose your focal anchor (Center, Top, Bottom, Left, or Right).</li>
      <li>Hit <strong>Run</strong> to export the tightly framed output.</li>
    </ol>
    <details class="tool-faq">
      <summary>Is original pixel data permanently lost when cropping?</summary>
      <p>The cropped download contains only the selected region, but your original source file on your computer remains completely untouched.</p>
    </details>
    <details class="tool-faq">
      <summary>What anchor setting should I use for portraits?</summary>
      <p>Use the <strong>Top</strong> anchor when cropping vertical portraits to keep faces centered and prevent heads from being trimmed off.</p>
    </details>
  </article>

  <article class="tool-guide" id="convert-image-guide">
    <h3>Convert Image Format — Switch Seamlessly Between JPG, PNG, and WebP</h3>
    <p>Different platforms demand different file types: PNG for transparent UI icons, JPG for broad cross-platform compatibility, and WebP for next-generation lightweight web performance. This tool translates image bitmaps instantly between formats using native browser image decoders and canvas encoders.</p>
    <h4>How to convert image format</h4>
    <ol>
      <li>Click <strong>Convert Format</strong> and load your source file.</li>
      <li>Select your target destination format (JPG, PNG, or WebP).</li>
      <li>Click <strong>Run</strong> to trigger immediate client-side transcoding.</li>
      <li>Download your newly formatted image file.</li>
    </ol>
    <details class="tool-faq">
      <summary>Will converting PNG to JPG preserve transparency?</summary>
      <p>JPG does not support alpha transparency channels. Transparent pixels are automatically filled with a clean white background during conversion.</p>
    </details>
    <details class="tool-faq">
      <summary>Why choose WebP over JPG?</summary>
      <p>WebP offers approximately 25%–35% smaller file sizes than JPEG at equivalent visual quality, speeding up webpage load times significantly.</p>
    </details>
  </article>

  <article class="tool-guide" id="rotate-image-guide">
    <h3>Rotate & Flip Image — Turn 90°, 180°, 270° or Mirror Horizontally</h3>
    <p>Incorrect EXIF orientation flags frequently cause smartphone photos to display sideways or inverted when uploaded to certain websites. The Rotate & Flip utility allows you to permanently set the correct angle or mirror the canvas across horizontal and vertical axes with zero quality degradation.</p>
    <h4>How to rotate and flip</h4>
    <ol>
      <li>Drop your image into the <strong>Rotate & Flip</strong> bench.</li>
      <li>Pick your rotation angle (0°, 90° clockwise, 180°, or 270°).</li>
      <li>Optionally choose a mirror flip direction (Horizontal or Vertical).</li>
      <li>Click <strong>Run</strong> to export the properly oriented photo.</li>
    </ol>
    <details class="tool-faq">
      <summary>Does rotation recompress or blur the image?</summary>
      <p>No, orthogonal rotations (90°, 180°, 270°) remap pixel coordinates directly on the canvas without geometric interpolation.</p>
    </details>
    <details class="tool-faq">
      <summary>How do I mirror a selfie that appears backwards?</summary>
      <p>Select <strong>Horizontal</strong> flip to produce a true mirror reflection of your selfie photo.</p>
    </details>
  </article>

  <article class="tool-guide" id="watermark-image-guide">
    <h3>Watermark Image — Add Copyright Text & Brand Stamps</h3>
    <p>Protecting intellectual property before sharing creative portfolios, real estate photography, or digital artwork online is critical. Mergio's Watermark tool stamps custom typography, copyright notices (©), and ownership badges directly onto image pixels with customizable positioning and opacity.</p>
    <h4>How to watermark images</h4>
    <ol>
      <li>Open <strong>Watermark</strong> and upload your graphic.</li>
      <li>Type your custom watermark text (e.g., "© 2026 Studio Name").</li>
      <li>Select the corner position (Bottom Right, Bottom Left, Top Right, Top Left, or Center).</li>
      <li>Adjust the opacity slider to blend the stamp subtly into the artwork.</li>
      <li>Click <strong>Run</strong> and save your watermarked export.</li>
    </ol>
    <details class="tool-faq">
      <summary>Can watermarks be easily erased by viewers?</summary>
      <p>Because the watermark is rasterized directly into the image's pixel grid upon export, it cannot be toggled off or hidden as a separate layer.</p>
    </details>
    <details class="tool-faq">
      <summary>What opacity works best for subtle protection?</summary>
      <p>An opacity level of 30%–50% provides clear legal notice without obscuring key subject matter in your photo.</p>
    </details>
  </article>

  <article class="tool-guide" id="image-to-pdf-guide">
    <h3>Image to PDF — Convert Photos and Scans into PDF Documents</h3>
    <p>When compiling receipts, handwritten notes, ID card scans, or artwork for formal submissions, bundling images into a standardized PDF is essential. This tool embeds JPG and PNG images onto clean PDF pages using PDF-lib, maintaining full resolution for easy printing and document archiving.</p>
    <h4>How to convert images to PDF</h4>
    <ol>
      <li>Select <strong>Image to PDF</strong> and drag in one or multiple photos.</li>
      <li>Click <strong>Run</strong> to wrap each picture into a formatted PDF document.</li>
      <li>Download the consolidated PDF ready for distribution or archiving.</li>
    </ol>
    <details class="tool-faq">
      <summary>Can I combine multiple images into a single multi-page PDF?</summary>
      <p>Yes! Upload multiple images simultaneously and the engine will compile them into sequential pages within one PDF.</p>
    </details>
    <details class="tool-faq">
      <summary>Are image colors altered during PDF generation?</summary>
      <p>No, full RGB color profiles are preserved during the PDF-lib embedding process.</p>
    </details>
  </article>

  <article class="tool-guide" id="bulk-compress-guide">
    <h3>Bulk Compressor — Batch Optimize Folders of Images into a ZIP</h3>
    <p>Manually compressing dozens of event photos, product catalog pictures, or web assets one-by-one is tedious. The Bulk Compressor iterates through an entire batch of JPG, PNG, and WebP files in memory, applies your desired compression quality, and bundles the results into a single organized ZIP archive.</p>
    <h4>How to bulk compress images</h4>
    <ol>
      <li>Open the <strong>Bulk Compressor</strong> tool.</li>
      <li>Select multiple images or drag a full batch into the dropzone.</li>
      <li>Configure your target compression quality slider.</li>
      <li>Click <strong>Run</strong> and download the completed ZIP package.</li>
    </ol>
    <details class="tool-faq">
      <summary>How many files can I compress in one batch?</summary>
      <p>You can comfortably process 30 to 100 images depending on your computer's RAM. All compression occurs in-memory via client-side workers.</p>
    </details>
    <details class="tool-faq">
      <summary>Do original filenames stay the same?</summary>
      <p>Yes, each compressed file inside the ZIP retains its original filename for seamless asset replacement.</p>
    </details>
  </article>

  <article class="tool-guide" id="remove-bg-guide">
    <h3>Remove Background — Erase Solid and Light Backdrops</h3>
    <p>Creating clean transparent product cutouts for e-commerce listings, marketing banners, or profile avatars requires removing distracting backgrounds. This tool analyzes pixel luminance and chromatic distance on the HTML5 Canvas, setting light or uniform background pixels to zero alpha transparency.</p>
    <h4>How to remove background</h4>
    <ol>
      <li>Drop your image into the <strong>Remove Background</strong> workspace.</li>
      <li>Adjust the tolerance slider (higher values remove a broader range of off-white shades).</li>
      <li>Click <strong>Run</strong> to strip the background.</li>
      <li>Download your transparent PNG graphic.</li>
    </ol>
    <details class="tool-faq">
      <summary>Why is the output saved as PNG?</summary>
      <p>PNG supports 8-bit alpha transparency channels, which are required to display transparent cutouts over varied backgrounds.</p>
    </details>
    <details class="tool-faq">
      <summary>What type of images yield the best cutout results?</summary>
      <p>Photos taken against solid white, gray, or high-contrast backdrops yield the crispest edge segmentation.</p>
    </details>
  </article>

  <article class="tool-guide" id="blur-image-guide">
    <h3>Blur Image — Apply Smooth Gaussian Softening</h3>
    <p>Softening background details, creating artistic bokeh effects, or obscuring sensitive personal information like license plates and faces is simple with the Blur Image tool. It applies a multi-pass 2D box/Gaussian convolution kernel across canvas pixels, producing smooth, feathered diffusion.</p>
    <h4>How to blur an image</h4>
    <ol>
      <li>Upload your graphic to the <strong>Blur Image</strong> tool.</li>
      <li>Use the blur radius slider (1px for subtle softening up to 50px for heavy diffusion).</li>
      <li>Click <strong>Run</strong> to compute the convolution pass.</li>
      <li>Download your softened visual.</li>
    </ol>
    <details class="tool-faq">
      <summary>Can a blurred image be un-blurred by another tool?</summary>
      <p>No. Gaussian blurring averages neighboring pixel values irreversibly, destroying high-frequency edge information permanently.</p>
    </details>
    <details class="tool-faq">
      <summary>What radius is recommended for website hero backgrounds?</summary>
      <p>A radius of 15px–25px softens background imagery enough to make foreground text easily readable while maintaining pleasant color atmosphere.</p>
    </details>
  </article>

  <article class="tool-guide" id="sharpen-image-guide">
    <h3>Sharpen Image — Enhance Edge Contrast and Clarity</h3>
    <p>Slightly out-of-focus captures or images softened by heavy compression benefit greatly from edge enhancement. The Sharpen tool runs a 3×3 Laplacian convolution matrix over image pixel neighborhoods, boosting local contrast along high-frequency borders to bring out fine textures and crisp contours.</p>
    <h4>How to sharpen an image</h4>
    <ol>
      <li>Select <strong>Sharpen Image</strong> and drop in your picture.</li>
      <li>Click <strong>Run</strong> to apply the spatial high-pass filter.</li>
      <li>Download the enhanced, crisper photo immediately.</li>
    </ol>
    <details class="tool-faq">
      <summary>Will sharpening introduce visual noise?</summary>
      <p>The balanced 3×3 kernel enhances authentic edges without exaggerating smooth gradients or low-level sensor noise.</p>
    </details>
    <details class="tool-faq">
      <summary>Can I run sharpening multiple times?</summary>
      <p>Yes, running a second pass can provide additional crispness for soft scans, though excessive passes may create visible halos.</p>
    </details>
  </article>

  <article class="tool-guide" id="grayscale-image-guide">
    <h3>Grayscale Image — Convert Color Photos to Black & White</h3>
    <p>Converting color imagery into timeless monochrome art or preparing documents for high-contrast grayscale printing is effortless. This tool computes standard ITU-R BT.709 perceived luminance weights (0.2126R + 0.7152G + 0.0722B) for every pixel, ensuring natural tonal depth across shadows and highlights.</p>
    <h4>How to convert to grayscale</h4>
    <ol>
      <li>Open the <strong>Grayscale Image</strong> tool.</li>
      <li>Load your color photo into the bench.</li>
      <li>Click <strong>Run</strong> to calculate the luminance conversion.</li>
      <li>Download your black-and-white graphic.</li>
    </ol>
    <details class="tool-faq">
      <summary>Is file size reduced when converting to grayscale?</summary>
      <p>Because redundant color channel variations are equalized, saving as PNG or compressed JPG often results in smaller file sizes.</p>
    </details>
    <details class="tool-faq">
      <summary>Does this match professional B&W photo lab conversions?</summary>
      <p>Yes, standard luminance weighting mimics panchromatic film sensitivity for realistic tonal transitions.</p>
    </details>
  </article>

  <article class="tool-guide" id="pixelate-image-guide">
    <h3>Pixelate Image — Create Retro Pixel Art or Censor Details</h3>
    <p>Whether you are designing nostalgic 8-bit style pixel art or obscuring confidential numbers, passwords, and faces in screenshots, pixelation divides the image into discrete block grids and fills each cell with the average local color value.</p>
    <h4>How to pixelate an image</h4>
    <ol>
      <li>Select the <strong>Pixelate Image</strong> tool.</li>
      <li>Upload your screenshot or photo.</li>
      <li>Adjust the pixel block size slider (2px to 50px).</li>
      <li>Click <strong>Run</strong> and save the stylized output.</li>
    </ol>
    <details class="tool-faq">
      <summary>What block size works best for censorship?</summary>
      <p>A block size of 15px–25px completely obscures readable text and recognizable facial features.</p>
    </details>
    <details class="tool-faq">
      <summary>Can pixelated text be reversed or deciphered?</summary>
      <p>Pixel averaging merges multiple characters into single solid color blocks, making reconstruction virtually impossible.</p>
    </details>
  </article>

  <article class="tool-guide" id="add-border-image-guide">
    <h3>Add Border — Frame Photos with Custom Colors & Widths</h3>
    <p>Adding clean framing around illustrations, screenshots, and social posts provides visual contrast and prevents white graphics from bleeding into light webpage backgrounds. This tool expands canvas boundaries and paints a solid border in your chosen color and pixel thickness.</p>
    <h4>How to add a border</h4>
    <ol>
      <li>Open <strong>Add Border</strong> and drop in your picture.</li>
      <li>Specify your desired border width in pixels (1px to 100px).</li>
      <li>Enter a hex color code (such as #000000 for black or #FFFFFF for white).</li>
      <li>Click <strong>Run</strong> to generate and download the framed image.</li>
    </ol>
    <details class="tool-faq">
      <summary>Does the border crop into the original image?</summary>
      <p>No, the canvas expands outwardly by the border width, keeping 100% of your original image intact.</p>
    </details>
    <details class="tool-faq">
      <summary>Can I use transparent or colored borders?</summary>
      <p>Any valid hexadecimal color code can be used to match your brand palette perfectly.</p>
    </details>
  </article>

  <article class="tool-guide" id="round-corners-image-guide">
    <h3>Round Corners — Create Modern Curved Edge Graphics</h3>
    <p>Soft, rounded corners lend a polished, modern aesthetic to UI mockups, avatar profile badges, and presentation slides. This tool draws a smooth quadratic arc clipping mask on the canvas and clears external corner pixels to alpha transparency.</p>
    <h4>How to round image corners</h4>
    <ol>
      <li>Load your photo into the <strong>Round Corners</strong> workspace.</li>
      <li>Adjust the corner radius slider (1px up to half image width for a circular pill).</li>
      <li>Click <strong>Run</strong> to clip the canvas corners.</li>
      <li>Download your transparent PNG graphic.</li>
    </ol>
    <details class="tool-faq">
      <summary>How do I make a perfectly circular avatar?</summary>
      <p>First crop your image to a 1:1 square with the <a href="#crop-image">Crop Image</a> tool, then set the corner radius slider to half of your width.</p>
    </details>
    <details class="tool-faq">
      <summary>Will rounded corners show white boxes on dark websites?</summary>
      <p>Because the output is saved as a transparent PNG, the corners blend seamlessly into any background color.</p>
    </details>
  </article>

  <article class="tool-guide" id="image-collage-guide">
    <h3>Collage Maker — Combine Multiple Photos into a Grid</h3>
    <p>Showcasing before-and-after comparisons, photo collections, or mood boards in a single unified image is simple with Collage Maker. The engine calculates an optimal multi-column canvas layout, fits all selected pictures proportionally, and exports a clean combined composition.</p>
    <h4>How to make an image collage</h4>
    <ol>
      <li>Select the <strong>Collage Maker</strong> tool.</li>
      <li>Upload 2 or more photos simultaneously.</li>
      <li>Click <strong>Run</strong> to construct the balanced grid layout.</li>
      <li>Save your consolidated collage picture.</li>
    </ol>
    <details class="tool-faq">
      <summary>What is the maximum number of photos for a collage?</summary>
      <p>You can combine 2 to 12 images in a single layout. The grid automatically organizes rows and columns based on item count.</p>
    </details>
    <details class="tool-faq">
      <summary>Do photos need to have identical aspect ratios?</summary>
      <p>The collage engine centers and scales varying aspect ratios cleanly to maintain grid symmetry.</p>
    </details>
  </article>

  <article class="tool-guide" id="meme-generator-guide">
    <h3>Meme Generator — Add Classic Impact Headers & Captions</h3>
    <p>Create viral social media memes with bold, legible typography stamped over your photos. The generator renders classic white Impact font text with heavy black outlines (stroke) across top and bottom zones, ensuring high readability over any photographic background.</p>
    <h4>How to generate a meme</h4>
    <ol>
      <li>Open the <strong>Meme Generator</strong> and upload a base picture.</li>
      <li>Type your top caption into the header input field.</li>
      <li>Type your bottom punchline into the footer input field.</li>
      <li>Click <strong>Run</strong> to render typography and export your meme.</li>
    </ol>
    <details class="tool-faq">
      <summary>What font is used for the meme captions?</summary>
      <p>The tool uses classic bold Impact / sans-serif lettering with a high-contrast black border for authentic meme styling.</p>
    </details>
    <details class="tool-faq">
      <summary>Can I leave one of the text fields empty?</summary>
      <p>Yes, you can specify only top text, only bottom text, or both depending on your caption layout.</p>
    </details>
  </article>

  <article class="tool-guide" id="favicon-generator-guide">
    <h3>Favicon Generator — Build Multi-Size Browser Icon Packages</h3>
    <p>Website browsers, mobile bookmarks, and desktop shortcuts require icons rendered across multiple standard dimensions. Mergio's Favicon Generator takes your logo or square graphic and generates 16×16, 32×32, 48×48, and 64×64 pixel PNG icons packaged inside a convenient ZIP archive.</p>
    <h4>How to generate favicons</h4>
    <ol>
      <li>Select the <strong>Favicon Generator</strong> tool.</li>
      <li>Upload your high-resolution square brand icon or logo.</li>
      <li>Click <strong>Run</strong> to downscale and package the icons.</li>
      <li>Download and unzip your complete favicon asset suite.</li>
    </ol>
    <details class="tool-faq">
      <summary>What size source image should I upload?</summary>
      <p>A square PNG logo of 512×512 pixels with a transparent background produces the cleanest downscaled favicons.</p>
    </details>
    <details class="tool-faq">
      <summary>Which favicon size is used for browser tabs?</summary>
      <p>Desktop browsers typically display 16×16 or 32×32 pixel icons in browser tabs and bookmarks.</p>
    </details>
  </article>

  <article class="tool-guide" id="exif-viewer-guide">
    <h3>EXIF Viewer — Inspect Camera Settings and Metadata</h3>
    <p>Digital camera and smartphone image files contain rich Exchangeable Image File (EXIF) data including camera models, exposure settings, shutter speeds, ISO values, focal lengths, timestamps, and GPS coordinates. This inspector extracts and organizes header tags into a readable text summary.</p>
    <h4>How to view EXIF metadata</h4>
    <ol>
      <li>Open the <strong>EXIF Viewer</strong> tool.</li>
      <li>Upload any JPG photo directly from your camera or phone.</li>
      <li>Click <strong>Run</strong> to parse the binary metadata headers.</li>
      <li>Download and read the formatted metadata report.</li>
    </ol>
    <details class="tool-faq">
      <summary>Why do some edited web photos show no EXIF data?</summary>
      <p>Many social media platforms and photo editors automatically strip metadata upon upload to conserve bandwidth and protect user privacy.</p>
    </details>
    <details class="tool-faq">
      <summary>Can I view GPS coordinates stored in phone photos?</summary>
      <p>If your camera had location tagging enabled at the moment of capture, the latitude and longitude tags will be displayed in the report.</p>
    </details>
  </article>

  <article class="tool-guide" id="remove-metadata-image-guide">
    <h3>Remove Metadata — Strip EXIF & Geolocation for Privacy</h3>
    <p>Sharing photos taken at home or work can inadvertently broadcast exact GPS coordinates, camera serial numbers, and personal timestamps to strangers. The Remove Metadata utility draws the image onto a pristine canvas and re-exports a fresh raster without any embedded EXIF or tracking tags.</p>
    <h4>How to strip image metadata</h4>
    <ol>
      <li>Drop your photo into the <strong>Remove Metadata</strong> workspace.</li>
      <li>Click <strong>Run</strong> to create a sanitized image copy.</li>
      <li>Download your privacy-safe photo ready for online publishing.</li>
    </ol>
    <details class="tool-faq">
      <summary>Does stripping metadata affect the visual quality of the photo?</summary>
      <p>No, the visible pixel information remains identical; only invisible header tags and tracking metadata are removed.</p>
    </details>
    <details class="tool-faq">
      <summary>How can I verify the metadata was completely removed?</summary>
      <p>Upload your sanitized output file back into the <a href="#exif-viewer">EXIF Viewer</a> to confirm no tags remain.</p>
    </details>
  </article>

  <article class="tool-guide" id="extract-colors-image-guide">
    <h3>Extract Colors — Sample Dominant Palette & HEX Codes</h3>
    <p>Designing color schemes inspired by nature photography, branding artwork, or illustrations is effortless with color extraction. The tool scans image pixel color distributions, groups chromatic clusters, and outputs a downloadable palette of dominant hexadecimal (#HEX) color codes.</p>
    <h4>How to extract image colors</h4>
    <ol>
      <li>Upload your picture to the <strong>Extract Colors</strong> bench.</li>
      <li>Click <strong>Run</strong> to analyze pixel color frequency.</li>
      <li>Download the palette report containing dominant HEX color codes.</li>
    </ol>
    <details class="tool-faq">
      <summary>How many dominant colors are identified?</summary>
      <p>The algorithm samples the top 6 dominant chromatic tones across shadows, midtones, and highlights.</p>
    </details>
    <details class="tool-faq">
      <summary>How do I use HEX codes in web design?</summary>
      <p>You can paste the 6-character hex strings directly into CSS stylesheets, Figma palettes, or Photoshop color pickers.</p>
    </details>
  </article>

  <article class="tool-guide" id="svg-converter-guide">
    <h3>SVG Converter — Transcode Vector Graphics to Raster PNG</h3>
    <p>While Scalable Vector Graphics (SVG) scale infinitely on the web, many desktop programs, social platforms, and document editors require standard raster formats like PNG. This tool renders SVG XML markup at crisp 2× resolution onto the HTML5 Canvas for instant conversion.</p>
    <h4>How to convert SVG</h4>
    <ol>
      <li>Open the <strong>SVG Converter</strong> tool and upload an SVG file.</li>
      <li>Click <strong>Run</strong> to rasterize vector paths at high DPI.</li>
      <li>Download the universally compatible PNG image.</li>
    </ol>
    <details class="tool-faq">
      <summary>Will the converted PNG support transparent backgrounds?</summary>
      <p>Yes, transparent SVG vector layers retain full transparency in the resulting PNG export.</p>
    </details>
    <details class="tool-faq">
      <summary>Why is the output rendered at 2× scale?</summary>
      <p>Rendering at 2× supersampling ensures razor-sharp curves and text on modern high-DPI Retina displays.</p>
    </details>
  </article>
</section>

<footer class="site-footer">
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
        <span class="footer-trust">🔒 Your files never leave this browser tab</span>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <p>&copy; 2026 Mergio. All rights reserved. Built for the desk, not the cloud.</p>
  </div>
</footer>

<button class="theme-toggle" id="themeToggle" aria-label="Toggle dark mode" title="Toggle dark mode">
      <svg class="sun-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
      <svg class="moon-icon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
    </button>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.11.6/dist/ffmpeg.min.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/tesseract.js@5.0.4/dist/tesseract.min.js"></script>
  <script src="js/i18n.js"></script>
<script src="js/common.js"></script>
<script src="js/tools-image.js"></script>
<script src="js/app.js"></script>
<script>
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}
</script>
</body>
</html>
`;

const finalHtml = beforeOptRow + '\n' + guides.trim() + '\n';
fs.writeFileSync(imageHtmlPath, finalHtml, 'utf8');
console.log('image.html written successfully!');
