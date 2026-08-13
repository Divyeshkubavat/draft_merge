/* Utility Bench - QR, barcodes, passwords, hashes, metadata */

window.TOOL_DEFS = window.TOOL_DEFS || [];

window.TOOL_DEFS.push(
{ id: 'qr-generator', category: 'Utility Bench', title: 'QR Generator', desc: 'Canvas-based QR code generator.', accept: '', multiple: false, minFiles: 0, hint: 'No file needed', options: [], run: async () => [] },
{ id: 'qr-scanner', category: 'Utility Bench', title: 'QR Scanner', desc: 'Image upload / camera QR scanner.', accept: '.jpg,.png,.webp', multiple: false, minFiles: 1, hint: 'Image file', options: [], run: async () => [] },
{ id: 'barcode-generator', category: 'Utility Bench', title: 'Barcode Generator', desc: 'Canvas barcode renderer (Code128).', accept: '', multiple: false, minFiles: 0, hint: 'No file needed', options: [], run: async () => [] },
{ id: 'barcode-scanner', category: 'Utility Bench', title: 'Barcode Scanner', desc: 'Barcode image decoder.', accept: '.jpg,.png,.webp', multiple: false, minFiles: 1, hint: 'Image file', options: [], run: async () => [] },
{ id: 'password-generator', category: 'Utility Bench', title: 'Password Generator', desc: 'Customizable password generator.', accept: '', multiple: false, minFiles: 0, hint: 'No file needed', options: [], run: async () => [] },
{ id: 'file-hash', category: 'Utility Bench', title: 'File Hash', desc: 'SHA-256 / SHA-1 digest.', accept: '*/*', multiple: false, minFiles: 1, hint: 'Any file', options: [], run: async () => [] },
{ id: 'file-metadata', category: 'Utility Bench', title: 'File Metadata', desc: 'Full browser file inspector.', accept: '*/*', multiple: false, minFiles: 1, hint: 'Any file', options: [], run: async () => [] },
{ id: 'file-size-calc', category: 'Utility Bench', title: 'File Size Calc', desc: 'File size unit converter & speed calculator.', accept: '*/*', multiple: false, minFiles: 1, hint: 'Any file', options: [], run: async () => [] },
{ id: 'color-picker', category: 'Utility Bench', title: 'Color Picker', desc: 'Eyedropper API / color input + canvas palette.', accept: '.jpg,.png,.webp', multiple: false, minFiles: 0, hint: 'Image file (optional)', options: [], run: async () => [] },
{ id: 'color-converter', category: 'Utility Bench', title: 'Color Converter', desc: 'HEX / RGB / HSL / CMYK converter.', accept: '', multiple: false, minFiles: 0, hint: 'No file needed', options: [], run: async () => [] }
);
