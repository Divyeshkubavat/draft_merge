const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const filePath = path.join(root, 'pdf.html');
let html = fs.readFileSync(filePath, 'utf8');

const guides = `
  <article class="tool-guide" id="merge-pdf-guide">
    <h3>Merge PDF — Combine Multiple PDFs into One Document</h3>
    <p>Combining contracts, reports, and invoices into a single organized file saves time and prevents lost attachments. Mergio's Merge PDF tool stitches together multi-page documents directly inside your browser tab without any server uploads, preserving vector text, embedded fonts, and original image resolutions.</p>
    <h4>How to merge PDFs</h4>
    <ol>
      <li>Click <strong>Merge PDF</strong> to open the workspace.</li>
      <li>Drop two or more PDF files into the upload zone.</li>
      <li>Drag file cards to set your preferred page order.</li>
      <li>Click <strong>Run</strong> and download your unified PDF document.</li>
    </ol>
    <details class="tool-faq">
      <summary>Is there a limit on how many PDFs I can merge?</summary>
      <p>There is no artificial cap. Merging happens in your device's memory using PDF-lib, easily handling dozens of documents in seconds.</p>
    </details>
    <details class="tool-faq">
      <summary>Will merging reduce document quality?</summary>
      <p>No. Pages are merged as direct object streams without recompression, keeping text razor-sharp.</p>
    </details>
    <div class="tool-tip-box">
      <strong>Pro Tip:</strong> Need to reorder specific pages inside the merged result? Use the <a href="#rearrange-pdf-pages">Rearrange PDF Pages</a> tool.
    </div>
  </article>

  <article class="tool-guide" id="split-pdf-guide">
    <h3>Split PDF — Extract Individual Pages into a ZIP Archive</h3>
    <p>When you only need specific sections or single sheets from a massive document, splitting breaks the file apart cleanly. This tool extracts every page into an independent PDF file and packages the collection into a convenient ZIP archive.</p>
    <h4>How to split a PDF</h4>
    <ol>
      <li>Open the <strong>Split PDF</strong> tool.</li>
      <li>Drop in the multi-page PDF you want to separate.</li>
      <li>Click <strong>Run</strong> to extract all individual pages.</li>
      <li>Download and unzip your separated single-page PDFs.</li>
    </ol>
    <details class="tool-faq">
      <summary>How are split pages named?</summary>
      <p>Each page file is numbered sequentially (e.g., document_page_1.pdf, document_page_2.pdf).</p>
    </details>
    <details class="tool-faq">
      <summary>Can I extract just a specific page range?</summary>
      <p>Yes, use the <a href="#extract-pdf-pages">Extract PDF Pages</a> tool to select custom ranges visually.</p>
    </details>
  </article>

  <article class="tool-guide" id="rotate-pdf-guide">
    <h3>Rotate PDF — Fix Sideways or Upside-Down Pages</h3>
    <p>Scanned documents frequently end up in the wrong orientation. The Rotate PDF tool applies 90°, 180°, or 270° clockwise rotations across all pages in memory, permanently updating the orientation tag without re-encoding.</p>
    <h4>How to rotate PDF pages</h4>
    <ol>
      <li>Upload your document to the <strong>Rotate PDF</strong> bench.</li>
      <li>Choose your rotation angle (90°, 180°, or 270°).</li>
      <li>Click <strong>Run</strong> to apply the orientation adjustment.</li>
      <li>Download the corrected, easy-to-read PDF.</li>
    </ol>
    <details class="tool-faq">
      <summary>Does rotating degrade text sharpness?</summary>
      <p>No, rotation modifies only viewport metadata in the PDF header without touching vector text or images.</p>
    </details>
    <details class="tool-faq">
      <summary>Can I rotate individual pages?</summary>
      <p>Yes, open the <a href="#rearrange-pdf-pages">Rearrange PDF Pages</a> tool for visual page-by-page rotation.</p>
    </details>
  </article>

  <article class="tool-guide" id="compress-pdf-guide">
    <h3>Compress PDF — Shrink Heavy Scans & Document Files</h3>
    <p>Large scanned PDFs often exceed email size ceilings. Mergio's Compress PDF renders heavy image-based pages through an HTML5 Canvas pipeline, re-encoding graphic streams at optimized quality settings to slash file size while maintaining readability.</p>
    <h4>How to compress a PDF</h4>
    <ol>
      <li>Select the <strong>Compress PDF</strong> tool.</li>
      <li>Drop in your oversized PDF document.</li>
      <li>Adjust the image quality slider (60%–75% is ideal for email).</li>
      <li>Click <strong>Run</strong> to download the compact document.</li>
    </ol>
    <details class="tool-faq">
      <summary>Which PDFs compress the most?</summary>
      <p>Scanned documents and image-heavy presentations see the largest size reductions (often 50%–80%).</p>
    </details>
    <details class="tool-faq">
      <summary>Is searchable text preserved?</summary>
      <p>Scanned PDFs are optimized visually. For native digital PDFs with vector text, minimal re-encoding is needed.</p>
    </details>
  </article>

  <article class="tool-guide" id="pdf-to-jpg-guide">
    <h3>PDF to JPG — Export High-Resolution Images from Pages</h3>
    <p>Turn document pages into standard JPG pictures for presentations, web posts, or photo albums. Each page is rendered via PDF.js onto a 2× high-DPI canvas and exported as a crisp JPG image inside a ZIP archive.</p>
    <h4>How to convert PDF to JPG</h4>
    <ol>
      <li>Drop your PDF into the <strong>PDF to JPG</strong> tool.</li>
      <li>Click <strong>Run</strong> to render all pages.</li>
      <li>Download the ZIP archive containing all extracted JPGs.</li>
    </ol>
    <details class="tool-faq">
      <summary>What resolution are the exported JPGs?</summary>
      <p>Pages are rendered at high resolution suitable for crisp viewing on Retina displays and standard printing.</p>
    </details>
    <details class="tool-faq">
      <summary>Can I convert just one page?</summary>
      <p>All pages are exported into the ZIP so you can easily choose the exact images you need.</p>
    </details>
  </article>

  <article class="tool-guide" id="jpg-to-pdf-guide">
    <h3>JPG to PDF — Combine Photos into a Clean Document</h3>
    <p>Compile receipts, photo collections, and handwritten notes into a standardized PDF file. PDF-lib embeds your images proportionally onto sequential pages ready for sharing or printing.</p>
    <h4>How to convert JPG to PDF</h4>
    <ol>
      <li>Open the <strong>JPG to PDF</strong> tool.</li>
      <li>Select one or multiple JPG/PNG images.</li>
      <li>Click <strong>Run</strong> to compile them into a unified PDF.</li>
      <li>Download your formatted document.</li>
    </ol>
    <details class="tool-faq">
      <summary>Can I add multiple photos at once?</summary>
      <p>Yes, select as many images as you need; each picture is placed on its own page.</p>
    </details>
    <details class="tool-faq">
      <summary>Are image proportions maintained?</summary>
      <p>Yes, images are scaled to fit standard page dimensions without cropping or distortion.</p>
    </details>
  </article>

  <article class="tool-guide" id="add-page-numbers-guide">
    <h3>Add Page Numbers — Stamp Pagination onto PDF Sheets</h3>
    <p>Numbering pages is essential for formal legal filings, academic papers, and business proposals. This tool stamps clear footer numbers (e.g. "Page 1 of 12" or "1") across all pages in standard Helvetica font.</p>
    <h4>How to add page numbers</h4>
    <ol>
      <li>Upload your document to <strong>Add Page Numbers</strong>.</li>
      <li>Select your preferred numbering style and alignment.</li>
      <li>Click <strong>Run</strong> to stamp pagination.</li>
      <li>Download your organized, numbered PDF.</li>
    </ol>
    <details class="tool-faq">
      <summary>Can I choose where numbers appear?</summary>
      <p>You can position numbers in the bottom center, bottom right, or top right corners.</p>
    </details>
    <details class="tool-faq">
      <summary>Does this overwrite existing document text?</summary>
      <p>Numbers are placed neatly inside the standard page margin zone.</p>
    </details>
  </article>

  <article class="tool-guide" id="word-to-pdf-guide">
    <h3>Word to PDF — Transcode DOCX Documents to PDF</h3>
    <p>Convert Microsoft Word (.docx) files into universally readable PDF documents without requiring Microsoft Office. Mergio parses the OpenXML package and renders formatted pages client-side.</p>
    <h4>How to convert Word to PDF</h4>
    <ol>
      <li>Drop your .docx file into <strong>Word to PDF</strong>.</li>
      <li>Click <strong>Run</strong> to generate the PDF layout.</li>
      <li>Download your universal PDF document.</li>
    </ol>
    <details class="tool-faq">
      <summary>Does this work with modern .docx files?</summary>
      <p>Yes, all standard OpenXML (.docx) files created in Word, Google Docs, or LibreOffice are supported.</p>
    </details>
    <details class="tool-faq">
      <summary>Are my documents private?</summary>
      <p>100% private. File parsing happens inside your browser tab without any server upload.</p>
    </details>
  </article>

  <article class="tool-guide" id="pdf-to-word-guide">
    <h3>PDF to Word — Extract Document Text into Editable Format</h3>
    <p>Extract text from read-only PDFs into an editable document format. PDF.js reads text streams across all pages and formats them into a clean, editable file.</p>
    <h4>How to convert PDF to Word</h4>
    <ol>
      <li>Upload your PDF to <strong>PDF to Word</strong>.</li>
      <li>Click <strong>Run</strong> to extract text layers.</li>
      <li>Download your editable document file.</li>
    </ol>
    <details class="tool-faq">
      <summary>Can I extract text from scanned PDFs?</summary>
      <p>For scanned image PDFs without selectable text, use the <a href="#pdf-ocr">PDF OCR</a> tool first.</p>
    </details>
    <details class="tool-faq">
      <summary>Is formatting preserved?</summary>
      <p>Paragraph breaks and line structures are maintained for easy editing.</p>
    </details>
  </article>

  <article class="tool-guide" id="pdf-to-excel-guide">
    <h3>PDF to Excel — Extract Tables and Data to CSV</h3>
    <p>Pull tabular data, bank statements, and numerical reports out of PDFs into structured CSV spreadsheets for analysis in Excel or Google Sheets.</p>
    <h4>How to extract PDF data to Excel</h4>
    <ol>
      <li>Drop your PDF into <strong>PDF to Excel</strong>.</li>
      <li>Click <strong>Run</strong> to parse table lines.</li>
      <li>Download your structured CSV spreadsheet.</li>
    </ol>
    <details class="tool-faq">
      <summary>Can I open the output in Microsoft Excel?</summary>
      <p>Yes, CSV files open directly in Excel, Google Sheets, Apple Numbers, and database tools.</p>
    </details>
    <details class="tool-faq">
      <summary>Are commas and quotes handled correctly?</summary>
      <p>Yes, standard CSV quoting rules prevent column misalignment.</p>
    </details>
  </article>

  <article class="tool-guide" id="excel-to-pdf-guide">
    <h3>Excel to PDF — Convert Spreadsheets into Clean PDF Tables</h3>
    <p>Convert CSV spreadsheets and financial data sheets into clean, readable PDF documents suitable for formal reporting and printing.</p>
    <h4>How to convert CSV/Excel to PDF</h4>
    <ol>
      <li>Select the <strong>Excel to PDF</strong> tool.</li>
      <li>Upload your CSV data file.</li>
      <li>Click <strong>Run</strong> to render the formatted table pages.</li>
      <li>Download the finalized PDF document.</li>
    </ol>
    <details class="tool-faq">
      <summary>How are columns formatted?</summary>
      <p>Columns are spaced proportionally across the page with clear header styling.</p>
    </details>
    <details class="tool-faq">
      <summary>Is landscape orientation supported?</summary>
      <p>Wide spreadsheets automatically adjust to landscape page layouts.</p>
    </details>
  </article>

  <article class="tool-guide" id="unlock-pdf-guide">
    <h3>Unlock PDF — Remove Owner Password Restrictions</h3>
    <p>Remove printing, copying, and editing permission restrictions from PDF files you own so you can annotate and share them freely.</p>
    <h4>How to unlock a PDF</h4>
    <ol>
      <li>Drop your restricted PDF into <strong>Unlock PDF</strong>.</li>
      <li>If prompted, provide the known authorization password.</li>
      <li>Click <strong>Run</strong> to export an unrestricted PDF.</li>
      <li>Download your fully editable document.</li>
    </ol>
    <details class="tool-faq">
      <summary>Does this bypass encryption without a password?</summary>
      <p>Standard owner permission flags are cleared. Strong open-passwords require the correct key.</p>
    </details>
    <details class="tool-faq">
      <summary>Is the unlocked PDF permanently modified?</summary>
      <p>Yes, the downloaded copy will no longer prompt for restriction passwords.</p>
    </details>
  </article>

  <article class="tool-guide" id="protect-pdf-guide">
    <h3>Protect PDF — Encrypt and Restrict Permissions</h3>
    <p>Secure confidential financial records, medical documents, and private contracts by setting encryption flags on your PDF.</p>
    <h4>How to protect a PDF</h4>
    <ol>
      <li>Upload your file to <strong>Protect PDF</strong>.</li>
      <li>Enter your desired secure password.</li>
      <li>Click <strong>Run</strong> to apply encryption.</li>
      <li>Download your password-protected PDF.</li>
    </ol>
    <details class="tool-faq">
      <summary>Is the password transmitted to a server?</summary>
      <p>Never. Encryption occurs 100% locally in your browser tab.</p>
    </details>
    <details class="tool-faq">
      <summary>What happens if I forget the password?</summary>
      <p>Keep a safe backup; client-side encryption cannot be recovered once applied.</p>
    </details>
  </article>

  <article class="tool-guide" id="pdf-to-png-guide">
    <h3>PDF to PNG — Export Lossless Transparent Page Images</h3>
    <p>Export PDF pages into high-clarity PNG format with crisp text rendering and transparent background support.</p>
    <h4>How to convert PDF to PNG</h4>
    <ol>
      <li>Drop your PDF into <strong>PDF to PNG</strong>.</li>
      <li>Click <strong>Run</strong> to render lossless page rasters.</li>
      <li>Download the ZIP archive of PNG graphics.</li>
    </ol>
    <details class="tool-faq">
      <summary>Why choose PNG over JPG?</summary>
      <p>PNG provides lossless rendering without compression artifacts, ideal for diagrams and typography.</p>
    </details>
    <details class="tool-faq">
      <summary>What resolution is used?</summary>
      <p>Pages are supersampled at 2× DPI for crisp display on high-resolution screens.</p>
    </details>
  </article>

  <article class="tool-guide" id="png-to-pdf-guide">
    <h3>PNG to PDF — Bundle Transparent Graphics into PDF</h3>
    <p>Package PNG logos, diagrams, screenshots, or design assets into a unified PDF document in sequential order.</p>
    <h4>How to convert PNG to PDF</h4>
    <ol>
      <li>Open the <strong>PNG to PDF</strong> workspace.</li>
      <li>Select one or multiple PNG graphics.</li>
      <li>Click <strong>Run</strong> to generate the PDF layout.</li>
      <li>Download your compiled PDF file.</li>
    </ol>
    <details class="tool-faq">
      <summary>Does transparency turn black?</summary>
      <p>No, transparent PNG areas render against a clean, professional white background.</p>
    </details>
    <details class="tool-faq">
      <summary>Can I reorder images before building?</summary>
      <p>Yes, drag images in the file list to arrange the page sequence.</p>
    </details>
  </article>

  <article class="tool-guide" id="ppt-to-pdf-guide">
    <h3>PPT to PDF — Convert PowerPoint Presentations to PDF</h3>
    <p>Turn PowerPoint presentation slides into shareable PDF slide decks that display consistently across mobile devices and projectors.</p>
    <h4>How to convert PPT to PDF</h4>
    <ol>
      <li>Upload your presentation file to <strong>PPT to PDF</strong>.</li>
      <li>Click <strong>Run</strong> to transcode slide content.</li>
      <li>Download your standardized PDF presentation.</li>
    </ol>
    <details class="tool-faq">
      <summary>Which presentation formats work?</summary>
      <p>Standard modern .pptx presentation packages are fully supported.</p>
    </details>
    <details class="tool-faq">
      <summary>Do recipients need PowerPoint to view the PDF?</summary>
      <p>No, the PDF opens in any browser, tablet, or PDF reader.</p>
    </details>
  </article>

  <article class="tool-guide" id="pdf-to-html-guide">
    <h3>PDF to HTML — Convert PDF Documents into Web Pages</h3>
    <p>Transform PDF documents into clean, semantic HTML code for easy embedding on websites and intranets.</p>
    <h4>How to convert PDF to HTML</h4>
    <ol>
      <li>Drop your PDF into <strong>PDF to HTML</strong>.</li>
      <li>Click <strong>Run</strong> to extract structured HTML markup.</li>
      <li>Download your web-ready HTML file.</li>
    </ol>
    <details class="tool-faq">
      <summary>Is the HTML mobile responsive?</summary>
      <p>Yes, standard semantic paragraph tags adapt smoothly to varied viewport widths.</p>
    </details>
    <details class="tool-faq">
      <summary>Can I edit the resulting HTML?</summary>
      <p>The output is standard plain HTML that can be edited in any code or text editor.</p>
    </details>
  </article>

  <article class="tool-guide" id="extract-pdf-pages-guide">
    <h3>Extract PDF Pages — Select and Save Custom Page Subsets</h3>
    <p>Choose exact pages or ranges (e.g. 1, 3-5, 8) from a large document and export only those sheets into a new, lightweight PDF.</p>
    <h4>How to extract PDF pages</h4>
    <ol>
      <li>Upload your document to <strong>Extract PDF Pages</strong>.</li>
      <li>Click the visual thumbnails of the pages you wish to keep.</li>
      <li>Click <strong>Run</strong> to generate your targeted PDF.</li>
      <li>Download your customized document.</li>
    </ol>
    <details class="tool-faq">
      <summary>Does this modify the original file?</summary>
      <p>No, a brand new PDF is created containing only your chosen pages.</p>
    </details>
    <details class="tool-faq">
      <summary>Can I extract non-consecutive pages?</summary>
      <p>Yes, click any combination of individual pages across the entire document.</p>
    </details>
  </article>

  <article class="tool-guide" id="delete-pdf-pages-guide">
    <h3>Delete PDF Pages — Remove Unwanted Sheets Visually</h3>
    <p>Remove blank scanner pages, outdated terms, or sensitive appendices from your PDF with visual thumbnail selection.</p>
    <h4>How to delete PDF pages</h4>
    <ol>
      <li>Open <strong>Delete PDF Pages</strong> and load your document.</li>
      <li>Click the red delete icon on any pages you want removed.</li>
      <li>Click <strong>Run</strong> to rebuild the PDF.</li>
      <li>Download the streamlined document.</li>
    </ol>
    <details class="tool-faq">
      <summary>Can I delete multiple pages at once?</summary>
      <p>Yes, tag as many pages as needed for removal in one operation.</p>
    </details>
    <details class="tool-faq">
      <summary>Is page numbering adjusted?</summary>
      <p>Remaining pages flow sequentially in the resulting file.</p>
    </details>
  </article>

  <article class="tool-guide" id="rearrange-pdf-pages-guide">
    <h3>Rearrange PDF Pages — Drag-and-Drop Page Reordering</h3>
    <p>Fix out-of-order scans or reorganize presentation slides using an interactive visual page thumbnail workspace.</p>
    <h4>How to rearrange PDF pages</h4>
    <ol>
      <li>Upload your file to <strong>Rearrange PDF Pages</strong>.</li>
      <li>Drag page thumbnails into your preferred sequence.</li>
      <li>Click <strong>Run</strong> to commit the new order.</li>
      <li>Download your organized PDF file.</li>
    </ol>
    <details class="tool-faq">
      <summary>Can I rotate pages while rearranging?</summary>
      <p>Yes, thumbnail controls allow rotating individual sheets as you reorder.</p>
    </details>
    <details class="tool-faq">
      <summary>Is there a page limit for the visual organizer?</summary>
      <p>The visual grid handles documents with hundreds of pages smoothly.</p>
    </details>
  </article>

  <article class="tool-guide" id="duplicate-pdf-pages-guide">
    <h3>Duplicate PDF Pages — Clone Sheets Within a Document</h3>
    <p>Duplicate invoice templates, form sheets, or certificate pages within a PDF to create multi-page batches effortlessly.</p>
    <h4>How to duplicate pages</h4>
    <ol>
      <li>Drop your document into <strong>Duplicate PDF Pages</strong>.</li>
      <li>Select the page indices you wish to clone.</li>
      <li>Click <strong>Run</strong> to append the duplicates.</li>
      <li>Download your expanded document.</li>
    </ol>
    <details class="tool-faq">
      <summary>Where are duplicated pages placed?</summary>
      <p>Cloned pages can be inserted directly after their source or at the end of the document.</p>
    </details>
    <details class="tool-faq">
      <summary>Are form fields preserved on duplicated sheets?</summary>
      <p>All page content and formatting are cloned identically.</p>
    </details>
  </article>

  <article class="tool-guide" id="pdf-ocr-guide">
    <h3>PDF OCR — Recognize and Extract Text from Scanned Pages</h3>
    <p>Convert scanned image PDFs and non-selectable documents into searchable, copyable text using client-side Tesseract.js neural network OCR.</p>
    <h4>How to run OCR on a PDF</h4>
    <ol>
      <li>Upload your scanned document to <strong>PDF OCR</strong>.</li>
      <li>Click <strong>Run</strong> to begin in-browser text recognition.</li>
      <li>Download the extracted UTF-8 text document.</li>
    </ol>
    <details class="tool-faq">
      <summary>Does OCR require uploading files to a cloud server?</summary>
      <p>No. Tesseract.js executes entirely inside a WebAssembly worker on your machine.</p>
    </details>
    <details class="tool-faq">
      <summary>What languages are supported?</summary>
      <p>English and standard Latin alphanumeric text are recognized with high confidence.</p>
    </details>
  </article>

  <article class="tool-guide" id="extract-pdf-images-guide">
    <h3>Extract PDF Images — Pull Embedded Graphics into a ZIP</h3>
    <p>Extract all high-resolution embedded photographs, illustrations, and logos from a PDF without taking manual screenshots.</p>
    <h4>How to extract images from PDF</h4>
    <ol>
      <li>Drop your PDF into <strong>Extract PDF Images</strong>.</li>
      <li>Click <strong>Run</strong> to scan for embedded image objects.</li>
      <li>Download the ZIP archive of extracted graphics.</li>
    </ol>
    <details class="tool-faq">
      <summary>Are images extracted in their native resolution?</summary>
      <p>Yes, embedded image streams are extracted at full original fidelity.</p>
    </details>
    <details class="tool-faq">
      <summary>Which image formats are extracted?</summary>
      <p>Embedded JPEG and PNG objects are extracted in their native formats.</p>
    </details>
  </article>

  <article class="tool-guide" id="sign-pdf-guide">
    <h3>Sign PDF — Stamp Digital Signatures onto Documents</h3>
    <p>Sign contracts, leases, and approval forms by stamping your signature image or initials onto any PDF page.</p>
    <h4>How to sign a PDF</h4>
    <ol>
      <li>Open <strong>Sign PDF</strong> and load your document.</li>
      <li>Upload your transparent signature PNG image.</li>
      <li>Position the signature stamp on the desired page.</li>
      <li>Click <strong>Run</strong> and download the signed contract.</li>
    </ol>
    <details class="tool-faq">
      <summary>Is my signature secure?</summary>
      <p>100% secure. Your signature file is processed in memory and never leaves your browser.</p>
    </details>
    <details class="tool-faq">
      <summary>Can the signature be resized?</summary>
      <p>Yes, scaling controls allow fitting your signature precisely over signing lines.</p>
    </details>
  </article>

  <article class="tool-guide" id="fill-pdf-forms-guide">
    <h3>Fill PDF Forms — Populate AcroForm Fields</h3>
    <p>Fill out interactive PDF forms, applications, and tax documents directly in your browser without expensive desktop software.</p>
    <h4>How to fill PDF forms</h4>
    <ol>
      <li>Upload your form document to <strong>Fill PDF Forms</strong>.</li>
      <li>Enter values into detected form fields.</li>
      <li>Click <strong>Run</strong> to bake your entries into the document.</li>
      <li>Download your completed PDF form.</li>
    </ol>
    <details class="tool-faq">
      <summary>Does this support checkboxes and radio buttons?</summary>
      <p>Yes, standard text fields, checkboxes, and choice fields are supported via PDF-lib.</p>
    </details>
    <details class="tool-faq">
      <summary>Can filled forms be saved and re-edited?</summary>
      <p>You can download the filled PDF ready for submission or print.</p>
    </details>
  </article>

  <article class="tool-guide" id="compare-pdfs-guide">
    <h3>Compare PDFs — Highlight Text Differences Across Versions</h3>
    <p>Compare two revisions of a contract, agreement, or essay side-by-side to pinpoint added, removed, or modified paragraphs.</p>
    <h4>How to compare PDFs</h4>
    <ol>
      <li>Select the <strong>Compare PDFs</strong> tool.</li>
      <li>Upload Document A (original) and Document B (revision).</li>
      <li>Click <strong>Run</strong> to compute the diff report.</li>
      <li>Download the detailed text comparison summary.</li>
    </ol>
    <details class="tool-faq">
      <summary>How are differences displayed?</summary>
      <p>The report highlights additions and deletions line-by-line.</p>
    </details>
    <details class="tool-faq">
      <summary>Can I compare multi-page contracts?</summary>
      <p>Yes, text streams across all pages are compared comprehensively.</p>
    </details>
  </article>

  <article class="tool-guide" id="repair-pdf-guide">
    <h3>Repair PDF — Rebuild Corrupt Cross-Reference Tables</h3>
    <p>Fix damaged or unreadable PDF files by reconstructing broken cross-reference (xref) tables and page descriptor trees.</p>
    <h4>How to repair a PDF</h4>
    <ol>
      <li>Drop your corrupted file into <strong>Repair PDF</strong>.</li>
      <li>Click <strong>Run</strong> to rebuild structural headers.</li>
      <li>Download the restored, readable PDF document.</li>
    </ol>
    <details class="tool-faq">
      <summary>What types of errors can be fixed?</summary>
      <p>Corrupted xref indices, missing EOF markers, and damaged trailers are repaired.</p>
    </details>
    <details class="tool-faq">
      <summary>Will page contents be recovered?</summary>
      <p>All salvageable text and image streams are restored into a valid PDF container.</p>
    </details>
  </article>

  <article class="tool-guide" id="flatten-pdf-guide">
    <h3>Flatten PDF — Lock Form Fields and Annotations</h3>
    <p>Bake interactive form fields, comments, and signatures into permanent background pixels to prevent accidental modification.</p>
    <h4>How to flatten a PDF</h4>
    <ol>
      <li>Open <strong>Flatten PDF</strong> and load your document.</li>
      <li>Click <strong>Run</strong> to rasterize dynamic layers.</li>
      <li>Download your finalized, read-only PDF.</li>
    </ol>
    <details class="tool-faq">
      <summary>Can flattened forms still be edited?</summary>
      <p>No, flattening turns form inputs into static page content permanently.</p>
    </details>
    <details class="tool-faq">
      <summary>Why should I flatten documents before emailing?</summary>
      <p>Flattening guarantees the recipient sees your filled entries exactly as intended across all PDF viewers.</p>
    </details>
  </article>

  <article class="tool-guide" id="edit-pdf-metadata-guide">
    <h3>Edit PDF Metadata — Update Title, Author & Keywords</h3>
    <p>Customize document title tags, author names, subjects, and search keywords for professional publishing and SEO indexing.</p>
    <h4>How to edit PDF metadata</h4>
    <ol>
      <li>Drop your document into <strong>Edit PDF Metadata</strong>.</li>
      <li>Enter new Title, Author, Subject, and Keyword values.</li>
      <li>Click <strong>Run</strong> to update document dictionary tags.</li>
      <li>Download your properly attributed PDF.</li>
    </ol>
    <details class="tool-faq">
      <summary>Where does this metadata appear?</summary>
      <p>Metadata displays in PDF reader properties dialogs and search engine snippets.</p>
    </details>
    <details class="tool-faq">
      <summary>Can I clear existing metadata?</summary>
      <p>Yes, or use the <a href="#remove-pdf-metadata">Remove PDF Metadata</a> tool to strip all tags instantly.</p>
    </details>
  </article>

  <article class="tool-guide" id="remove-pdf-metadata-guide">
    <h3>Remove PDF Metadata — Strip Hidden Author and Device Tags</h3>
    <p>Sanitize documents before public release by stripping author names, creation software tags, printer details, and timestamps.</p>
    <h4>How to remove PDF metadata</h4>
    <ol>
      <li>Upload your file to <strong>Remove PDF Metadata</strong>.</li>
      <li>Click <strong>Run</strong> to strip document information dictionaries.</li>
      <li>Download your privacy-safe PDF.</li>
    </ol>
    <details class="tool-faq">
      <summary>Does this affect the visible page content?</summary>
      <p>No, only hidden background metadata headers are cleared.</p>
    </details>
    <details class="tool-faq">
      <summary>Why strip metadata before public sharing?</summary>
      <p>It prevents exposing internal usernames, software versions, and company details.</p>
    </details>
  </article>

  <article class="tool-guide" id="pdf-to-markdown-guide">
    <h3>PDF to Markdown — Extract Content for Documentation</h3>
    <p>Extract headings, lists, and body paragraphs from PDFs into clean Markdown (.md) format for GitHub, blogs, and static site generators.</p>
    <h4>How to convert PDF to Markdown</h4>
    <ol>
      <li>Select the <strong>PDF to Markdown</strong> tool.</li>
      <li>Upload your document file.</li>
      <li>Click <strong>Run</strong> to extract formatted Markdown.</li>
      <li>Download your .md document.</li>
    </ol>
    <details class="tool-faq">
      <summary>Are code blocks and lists preserved?</summary>
      <p>Standard paragraph structures and indentation are parsed into clean Markdown syntax.</p>
    </details>
    <details class="tool-faq">
      <summary>Can I open .md files in standard text editors?</summary>
      <p>Yes, Markdown is plain UTF-8 text readable in VS Code, Obsidian, and Notion.</p>
    </details>
  </article>

  <article class="tool-guide" id="pdf-to-json-guide">
    <h3>PDF to JSON — Parse Document Data into Structured JSON</h3>
    <p>Extract page text, paragraph blocks, and document metadata into structured JSON for automated data pipelines and APIs.</p>
    <h4>How to convert PDF to JSON</h4>
    <ol>
      <li>Upload your PDF to <strong>PDF to JSON</strong>.</li>
      <li>Click <strong>Run</strong> to parse text structures.</li>
      <li>Download the formatted JSON data file.</li>
    </ol>
    <details class="tool-faq">
      <summary>What schema is used in the JSON output?</summary>
      <p>The JSON includes page numbers, text content, line counts, and metadata dictionaries.</p>
    </details>
    <details class="tool-faq">
      <summary>Can I parse this JSON with Python or JavaScript?</summary>
      <p>Yes, the output is standard RFC 8259 JSON compatible with all programming languages.</p>
    </details>
  </article>
`;

const wsIndex = html.indexOf('<div class="workspace-overlay hidden" id="workspaceOverlay">');
const footerIndex = html.indexOf('<footer class="site-footer">');

const beforeOverlay = html.substring(0, wsIndex);
const footerAndAfter = html.substring(footerIndex);

const cleanWorkspace = `<div class="workspace-overlay hidden" id="workspaceOverlay">
  <div class="workspace" id="workspace">
    <button class="close-btn" id="closeWorkspace" aria-label="Close"><svg viewBox="0 0 24 24"><use href="#i-close"/></svg></button>

    <div class="ws-head">
      <div class="tile" id="wsTile"><svg class="icon"><use href="#i-merge"/></svg></div>
      <div>
        <div class="ws-eyebrow" id="wsEyebrow">Bench</div>
        <h2 id="wsTitle">Tool title</h2>
        <p class="ws-desc" id="wsDesc">Tool description.</p>
      </div>
    </div>

    <div class="ws-body">
      <div class="dropzone" id="dropzone">
        <div class="dz-icon"><svg class="icon"><use href="#i-upload"/></svg></div>
        <div class="dz-text"><b>Click to choose files</b> or drag them here</div>
        <div class="dz-hint" id="dzHint">Accepted files</div>
        <input type="file" id="fileInput" style="display:none" multiple>
      </div>

      <div class="file-list" id="fileList"></div>

      <div class="opt-row" id="optRow"></div>

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

<section class="tool-seo-content">
  <h2>PDF Tools Guide</h2>
${guides.trim()}
</section>

`;

const finalPdf = beforeOverlay + cleanWorkspace + footerAndAfter;
fs.writeFileSync(filePath, finalPdf, 'utf8');
console.log('pdf.html polished successfully!');
