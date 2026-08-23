import re
with open('utility.html', 'r', encoding='utf-8') as f:
    content = f.read()

strip_pattern = re.compile(r'<div class="strip">\s*<div class="strip-inner reveal-stagger">\s*<div class="strip-item">.*?</p></div>\s*</div>\s*</div>', re.DOTALL)

trust_line = """<div class="trust-line">
  <span>🔒 100% browser-based</span> · <span>No uploads</span> · <span>No sign-up</span> · <span>No watermarks</span>
</div>"""

seo_content = """
<section class="tool-seo-content reveal">
  <h2>Utility Tools Guide</h2>
  
  <article class="tool-guide" id="qr-generator-guide">
    <h3>QR Code Generator</h3>
    <p>Creating a quick response code allows you to instantly share links, contact details, or Wi-Fi credentials with anyone carrying a smartphone. Whether you need a scannable menu for your restaurant or a quick link for your business card, this generator renders a clean, high-resolution QR matrix directly using the HTML5 Canvas API.</p>
    <ol>
      <li>Open the QR Generator tool from the utility bench.</li>
      <li>Enter your desired text or URL into the input field.</li>
      <li>Click "Run" to process the data locally in your browser.</li>
      <li>Download the freshly generated PNG image of your QR code.</li>
    </ol>
    <details class="tool-faq">
      <summary>Does the generated QR code ever expire?</summary>
      <p>No, the QR codes generated here are static. They encode the exact text or URL you provide and will function indefinitely as long as the destination link remains active.</p>
    </details>
    <details class="tool-faq">
      <summary>Can I customize the colors of the QR code?</summary>
      <p>Currently, the tool generates a standard high-contrast black and white matrix to ensure maximum scannability across all devices.</p>
    </details>
    <div class="tool-tip-box">
      <strong>Tip:</strong> Keep URLs as short as possible before generating the code to produce a simpler, easier-to-scan pattern.
    </div>
  </article>

  <article class="tool-guide" id="qr-scanner-guide">
    <h3>QR Code Scanner</h3>
    <p>Retrieving the contents of a QR code from an image file is incredibly useful when someone emails you a screenshot or digital flyer. This tool leverages the native BarcodeDetector API to parse and decode the matrix right on your device, avoiding the need to print the image or scan your screen with a second device.</p>
    <ol>
      <li>Select the QR Scanner tool.</li>
      <li>Upload a JPG, PNG, or WebP image containing a QR code.</li>
      <li>Click "Run" to let the browser analyze the image.</li>
      <li>Read or download the decoded text result.</li>
    </ol>
    <details class="tool-faq">
      <summary>Are my scanned images sent to a server for processing?</summary>
      <p>Absolutely not. The scanning happens entirely on your local machine using client-side scripts.</p>
    </details>
    <details class="tool-faq">
      <summary>What if my browser doesn't support the BarcodeDetector API?</summary>
      <p>If your browser lacks native support, the tool will notify you. We recommend using a modern browser like Chrome or Edge for full functionality.</p>
    </details>
    <div class="tool-tip-box">
      <strong>Tip:</strong> Ensure the uploaded image is clear and well-lit. Blurry or low-contrast QR codes may fail to decode properly.
    </div>
  </article>

  <article class="tool-guide" id="barcode-generator-guide">
    <h3>Barcode Generator</h3>
    <p>Managing inventory or tagging products often requires standardized linear barcodes. This utility generates Code 128 barcodes, an extremely dense alphanumeric symbology, rendering the precise bars and spaces via Canvas so you can easily embed them into labels or documents.</p>
    <ol>
      <li>Launch the Barcode Generator tool.</li>
      <li>Type your alphanumeric product code or tracking number.</li>
      <li>Press "Run" to construct the visual barcode.</li>
      <li>Save the output as a transparent PNG file.</li>
    </ol>
    <details class="tool-faq">
      <summary>What characters are supported in Code 128?</summary>
      <p>Code 128 supports all 128 ASCII characters, making it highly versatile for numbers, letters, and standard punctuation.</p>
    </details>
    <details class="tool-faq">
      <summary>Can I scan this barcode with a physical scanner?</summary>
      <p>Yes, the generated image maintains strict proportions and can be printed and scanned by any standard laser or CCD barcode reader.</p>
    </details>
    <div class="tool-tip-box">
      <strong>Tip:</strong> When printing, avoid scaling the image aggressively, as altering the relative widths of the bars can cause scanning failures.
    </div>
  </article>

  <article class="tool-guide" id="barcode-scanner-guide">
    <h3>Barcode Scanner</h3>
    <p>Extracting numbers from a photographed shipping label or product package saves time and prevents manual data entry errors. By uploading an image to this tool, your browser will hunt for recognizable linear barcode formats like Code 128, UPC, or EAN and instantly return the encoded data.</p>
    <ol>
      <li>Open the Barcode Scanner from the dashboard.</li>
      <li>Drop your image file (JPG, PNG, WebP) into the workspace.</li>
      <li>Initiate the scan by clicking "Run".</li>
      <li>Review the extracted format and raw value in the output text.</li>
    </ol>
    <details class="tool-faq">
      <summary>Which barcode formats can this tool read?</summary>
      <p>It supports widely used linear formats including Code 128, EAN-13, EAN-8, UPC-A, and UPC-E, provided your browser supports the underlying API.</p>
    </details>
    <details class="tool-faq">
      <summary>Why didn't my barcode scan correctly?</summary>
      <p>Glares, poor focus, or damaged labels can impede detection. Try cropping the image closely around the barcode for better results.</p>
    </details>
    <div class="tool-tip-box">
      <strong>Tip:</strong> You can pair this tool with the <a href="#barcode-generator-guide">Barcode Generator</a> to verify your own generated codes.
    </div>
  </article>

  <article class="tool-guide" id="password-generator-guide">
    <h3>Password Generator</h3>
    <p>Securing your accounts demands strong, unpredictable passwords that resist brute-force attacks. This generator utilizes the Web Crypto API's cryptographically secure pseudo-random number generator (CSPRNG) to assemble robust passwords locally, guaranteeing nobody else intercepts the result.</p>
    <ol>
      <li>Select the Password Generator tool.</li>
      <li>Adjust the slider to choose your desired password length (up to 64 characters).</li>
      <li>Toggle character types like uppercase, lowercase, numbers, and symbols.</li>
      <li>Click "Run" to generate and download your new secure credential.</li>
    </ol>
    <details class="tool-faq">
      <summary>Is the generated password saved anywhere?</summary>
      <p>No, the password is created dynamically in your browser's memory and is discarded the moment you close the tab or generate a new one.</p>
    </details>
    <details class="tool-faq">
      <summary>Are these passwords truly random?</summary>
      <p>Yes, we use `crypto.getRandomValues()`, which relies on your operating system's entropy pool, offering far better security than standard random functions.</p>
    </details>
    <div class="tool-tip-box">
      <strong>Tip:</strong> We recommend a minimum length of 16 characters for critical accounts to maximize entropy.
    </div>
  </article>

  <article class="tool-guide" id="file-hash-guide">
    <h3>File Hash Generator</h3>
    <p>Verifying the integrity of a downloaded file or confirming that two files are identical requires computing a cryptographic checksum. This tool reads your file bit by bit and computes both SHA-256 and SHA-1 hashes directly in the browser, providing a foolproof way to check for tampering or corruption.</p>
    <ol>
      <li>Navigate to the File Hash tool.</li>
      <li>Upload the file you wish to inspect.</li>
      <li>Click "Run" to start the hashing process.</li>
      <li>Compare the resulting hexadecimal hashes against your expected values.</li>
    </ol>
    <details class="tool-faq">
      <summary>Can I hash very large files?</summary>
      <p>Yes, but extremely large files may take a moment to process since they must be read into your device's memory to calculate the digest.</p>
    </details>
    <details class="tool-faq">
      <summary>Which hash should I trust more, SHA-1 or SHA-256?</summary>
      <p>Always rely on SHA-256. SHA-1 is considered cryptographically broken and is provided here only for legacy compatibility.</p>
    </details>
    <div class="tool-tip-box">
      <strong>Tip:</strong> Hashing a file doesn't change it; it simply creates a unique fingerprint based on its current contents.
    </div>
  </article>

  <article class="tool-guide" id="file-metadata-guide">
    <h3>File Metadata Viewer</h3>
    <p>Sometimes you need to know exactly what your operating system sees when it looks at a file, beyond just the filename. This viewer inspects the underlying properties of any uploaded file, exposing details like the precise byte size, raw MIME type, and last modification timestamp.</p>
    <ol>
      <li>Choose the File Metadata tool.</li>
      <li>Drop any file into the designated area.</li>
      <li>Press "Run" to extract the file headers and properties.</li>
      <li>Read the generated plain text report.</li>
    </ol>
    <details class="tool-faq">
      <summary>Does this tool read EXIF data from photos?</summary>
      <p>This specific utility focuses on broad system-level file attributes. For deeper image-specific EXIF extraction, you may need a dedicated photo inspector.</p>
    </details>
    <details class="tool-faq">
      <summary>Can this tool reveal hidden tracking data?</summary>
      <p>It exposes standard file properties provided by the browser's File API, but it does not perform deep forensic analysis of proprietary document streams.</p>
    </details>
    <div class="tool-tip-box">
      <strong>Tip:</strong> Checking the exact MIME type is extremely useful for web developers debugging upload forms.
    </div>
  </article>

  <article class="tool-guide" id="file-size-calc-guide">
    <h3>File Size Calculator</h3>
    <p>Planning a massive file transfer or configuring server storage requires accurate byte-to-megabyte conversions and speed estimates. This calculator takes any file and breaks down its exact size across different units, while providing estimated download times across standard network speeds.</p>
    <ol>
      <li>Open the File Size Calculator.</li>
      <li>Upload the file you are planning to host or transfer.</li>
      <li>Click "Run" to execute the math.</li>
      <li>Review the converted units and network transfer estimates in the output text.</li>
    </ol>
    <details class="tool-faq">
      <summary>Are the network speeds exact?</summary>
      <p>The speeds provided (e.g., 3G, 4G, Gigabit) are theoretical maximums. Real-world transfer times will vary based on network congestion and server overhead.</p>
    </details>
    <details class="tool-faq">
      <summary>Does this calculate in base-10 or base-2?</summary>
      <p>The calculations use traditional binary prefixes (base-2), where 1 KB equals 1024 bytes, which is standard for most operating systems.</p>
    </details>
    <div class="tool-tip-box">
      <strong>Tip:</strong> Use these estimates to warn your users before they initiate large downloads on mobile data networks.
    </div>
  </article>

  <article class="tool-guide" id="color-picker-guide">
    <h3>Color Picker</h3>
    <p>Grabbing the exact hex code from a logo or a photograph is a daily chore for designers and front-end developers. This tool allows you to upload an image, render it onto a canvas, and programmatically sample the pixel data to return the precise RGB and hexadecimal values.</p>
    <ol>
      <li>Select the Color Picker tool.</li>
      <li>Upload a reference image (optional).</li>
      <li>Click "Run" to analyze the image or generate a sample palette.</li>
      <li>Copy the extracted color codes for your project.</li>
    </ol>
    <details class="tool-faq">
      <summary>How does the tool select the color?</summary>
      <p>If an image is uploaded, it currently samples the exact center pixel of the image using the Canvas `getImageData` method.</p>
    </details>
    <details class="tool-faq">
      <summary>What happens if I don't upload an image?</summary>
      <p>The tool will output a basic primary color palette for quick reference instead.</p>
    </details>
    <div class="tool-tip-box">
      <strong>Tip:</strong> If you need a color from a specific spot, crop the image beforehand so the target color is perfectly centered.
    </div>
  </article>

  <article class="tool-guide" id="color-converter-guide">
    <h3>Color Converter</h3>
    <p>Translating a brand color from web-friendly HEX to print-ready CMYK or CSS-native HSL requires complex mathematical transformations. This converter instantly processes any valid hex code and outputs the equivalent values across all major color spaces, ensuring design consistency across mediums.</p>
    <ol>
      <li>Launch the Color Converter.</li>
      <li>Input your starting 6-character hexadecimal code (e.g., #FF5733).</li>
      <li>Click "Run" to perform the conversion logic.</li>
      <li>Review the RGB, HSL, and CMYK equivalents in the result file.</li>
    </ol>
    <details class="tool-faq">
      <summary>Is the CMYK conversion perfect for professional printing?</summary>
      <p>The tool provides a mathematical conversion based on standard RGB profiles. Professional prepress may still require specific ICC profiles depending on the ink and paper used.</p>
    </details>
    <details class="tool-faq">
      <summary>Do I need to include the hash symbol in my input?</summary>
      <p>The tool is robust enough to handle the input whether you include the leading hash (#) or just paste the alphanumeric characters.</p>
    </details>
    <div class="tool-tip-box">
      <strong>Tip:</strong> Using HSL (Hue, Saturation, Lightness) in your CSS makes it much easier to create programmatic hover states by simply adjusting the lightness value.
    </div>
  </article>
</section>
"""

new_content = strip_pattern.sub(trust_line + '\n\n' + seo_content, content)

with open('utility.html', 'w', encoding='utf-8') as f:
    f.write(new_content)
print('Done!')
