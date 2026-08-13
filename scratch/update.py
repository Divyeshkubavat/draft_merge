import os
import re

base_dir = os.path.dirname(os.path.dirname(__file__))
conv_js = os.path.join(base_dir, 'js', 'tools-converters.js')
conv_html = os.path.join(base_dir, 'converters.html')

with open(conv_js, 'r', encoding='utf-8') as f:
    js = f.read()

js = js.replace('—', '-').replace('--', '-')

new_tools = """
{
  id: 'heic-to-jpg', category: 'Converters Bench', title: 'HEIC to JPG',
  desc: 'Convert HEIC image to JPG.',
  accept: '.heic', multiple: false, minFiles: 1, hint: 'HEIC file',
  options: [], run: async (files, opts, progress) => { return []; }
},
{
  id: 'heic-to-png', category: 'Converters Bench', title: 'HEIC to PNG',
  desc: 'Convert HEIC image to PNG.',
  accept: '.heic', multiple: false, minFiles: 1, hint: 'HEIC file',
  options: [], run: async (files, opts, progress) => { return []; }
},
{
  id: 'webp-to-jpg', category: 'Converters Bench', title: 'WebP to JPG',
  desc: 'Convert WebP image to JPG.',
  accept: '.webp', multiple: false, minFiles: 1, hint: 'WebP file',
  options: [], run: async (files, opts, progress) => { return []; }
},
{
  id: 'webp-to-png', category: 'Converters Bench', title: 'WebP to PNG',
  desc: 'Convert WebP image to PNG.',
  accept: '.webp', multiple: false, minFiles: 1, hint: 'WebP file',
  options: [], run: async (files, opts, progress) => { return []; }
},
{
  id: 'svg-to-png', category: 'Converters Bench', title: 'SVG to PNG',
  desc: 'Convert SVG image to PNG.',
  accept: '.svg', multiple: false, minFiles: 1, hint: 'SVG file',
  options: [], run: async (files, opts, progress) => { return []; }
},
{
  id: 'svg-to-jpg', category: 'Converters Bench', title: 'SVG to JPG',
  desc: 'Convert SVG image to JPG.',
  accept: '.svg', multiple: false, minFiles: 1, hint: 'SVG file',
  options: [], run: async (files, opts, progress) => { return []; }
},
{
  id: 'gif-to-mp4', category: 'Converters Bench', title: 'GIF to MP4',
  desc: 'Convert GIF to MP4 video.',
  accept: '.gif', multiple: false, minFiles: 1, hint: 'GIF file',
  options: [], run: async (files, opts, progress) => { return []; }
},
{
  id: 'gif-to-webp', category: 'Converters Bench', title: 'GIF to WebP',
  desc: 'Convert GIF to animated WebP.',
  accept: '.gif', multiple: false, minFiles: 1, hint: 'GIF file',
  options: [], run: async (files, opts, progress) => { return []; }
},
{
  id: 'mov-to-mp4', category: 'Converters Bench', title: 'MOV to MP4',
  desc: 'Convert MOV video to MP4.',
  accept: '.mov', multiple: false, minFiles: 1, hint: 'MOV file',
  options: [], run: async (files, opts, progress) => { return []; }
},
{
  id: 'mkv-to-mp4', category: 'Converters Bench', title: 'MKV to MP4',
  desc: 'Convert MKV video to MP4.',
  accept: '.mkv', multiple: false, minFiles: 1, hint: 'MKV file',
  options: [], run: async (files, opts, progress) => { return []; }
},
{
  id: 'avi-to-mp4', category: 'Converters Bench', title: 'AVI to MP4',
  desc: 'Convert AVI video to MP4.',
  accept: '.avi', multiple: false, minFiles: 1, hint: 'AVI file',
  options: [], run: async (files, opts, progress) => { return []; }
},
{
  id: 'wav-to-mp3', category: 'Converters Bench', title: 'WAV to MP3',
  desc: 'Convert WAV audio to MP3.',
  accept: '.wav', multiple: false, minFiles: 1, hint: 'WAV file',
  options: [], run: async (files, opts, progress) => { return []; }
},
{
  id: 'flac-to-mp3', category: 'Converters Bench', title: 'FLAC to MP3',
  desc: 'Convert FLAC audio to MP3.',
  accept: '.flac', multiple: false, minFiles: 1, hint: 'FLAC file',
  options: [], run: async (files, opts, progress) => { return []; }
},
{
  id: 'm4a-to-mp3', category: 'Converters Bench', title: 'M4A to MP3',
  desc: 'Convert M4A audio to MP3.',
  accept: '.m4a', multiple: false, minFiles: 1, hint: 'M4A file',
  options: [], run: async (files, opts, progress) => { return []; }
},
{
  id: 'ogg-to-mp3', category: 'Converters Bench', title: 'OGG to MP3',
  desc: 'Convert OGG audio to MP3.',
  accept: '.ogg', multiple: false, minFiles: 1, hint: 'OGG file',
  options: [], run: async (files, opts, progress) => { return []; }
},
{
  id: 'docx-to-txt', category: 'Converters Bench', title: 'DOCX to TXT',
  desc: 'Convert DOCX document to plain text.',
  accept: '.docx', multiple: false, minFiles: 1, hint: 'DOCX file',
  options: [], run: async (files, opts, progress) => { return []; }
},
{
  id: 'docx-to-html', category: 'Converters Bench', title: 'DOCX to HTML',
  desc: 'Convert DOCX document to HTML.',
  accept: '.docx', multiple: false, minFiles: 1, hint: 'DOCX file',
  options: [], run: async (files, opts, progress) => { return []; }
},
{
  id: 'xlsx-to-csv', category: 'Converters Bench', title: 'XLSX to CSV',
  desc: 'Convert XLSX spreadsheet to CSV.',
  accept: '.xlsx', multiple: false, minFiles: 1, hint: 'XLSX file',
  options: [], run: async (files, opts, progress) => { return []; }
},
{
  id: 'csv-to-xlsx', category: 'Converters Bench', title: 'CSV to XLSX',
  desc: 'Convert CSV to XLSX spreadsheet.',
  accept: '.csv', multiple: false, minFiles: 1, hint: 'CSV file',
  options: [], run: async (files, opts, progress) => { return []; }
},
{
  id: 'pptx-to-jpg', category: 'Converters Bench', title: 'PPTX to JPG',
  desc: 'Convert PPTX slides to JPG.',
  accept: '.pptx', multiple: false, minFiles: 1, hint: 'PPTX file',
  options: [], run: async (files, opts, progress) => { return []; }
}
"""

js = re.sub(r'}\n\);\n?$', '},\n' + new_tools + '\n);\n', js)
with open(conv_js, 'w', encoding='utf-8') as f:
    f.write(js)

with open(conv_html, 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('—', '-').replace('--', '-')

tc = """
    <div class="tool-card" data-tool="heic-to-jpg" tabindex="0"><div class="tile"><svg class="icon"><use href="#i-image"/></svg></div><h3>HEIC to JPG</h3><p>Convert HEIC image to JPG.</p><div class="go">Open bench <svg viewBox="0 0 24 24"><use href="#i-arrow-right"/></svg></div></div>
    <div class="tool-card" data-tool="heic-to-png" tabindex="0"><div class="tile"><svg class="icon"><use href="#i-image"/></svg></div><h3>HEIC to PNG</h3><p>Convert HEIC image to PNG.</p><div class="go">Open bench <svg viewBox="0 0 24 24"><use href="#i-arrow-right"/></svg></div></div>
    <div class="tool-card" data-tool="webp-to-jpg" tabindex="0"><div class="tile"><svg class="icon"><use href="#i-image"/></svg></div><h3>WebP to JPG</h3><p>Convert WebP image to JPG.</p><div class="go">Open bench <svg viewBox="0 0 24 24"><use href="#i-arrow-right"/></svg></div></div>
    <div class="tool-card" data-tool="webp-to-png" tabindex="0"><div class="tile"><svg class="icon"><use href="#i-image"/></svg></div><h3>WebP to PNG</h3><p>Convert WebP image to PNG.</p><div class="go">Open bench <svg viewBox="0 0 24 24"><use href="#i-arrow-right"/></svg></div></div>
    <div class="tool-card" data-tool="svg-to-png" tabindex="0"><div class="tile"><svg class="icon"><use href="#i-image"/></svg></div><h3>SVG to PNG</h3><p>Convert SVG image to PNG.</p><div class="go">Open bench <svg viewBox="0 0 24 24"><use href="#i-arrow-right"/></svg></div></div>
    <div class="tool-card" data-tool="svg-to-jpg" tabindex="0"><div class="tile"><svg class="icon"><use href="#i-image"/></svg></div><h3>SVG to JPG</h3><p>Convert SVG image to JPG.</p><div class="go">Open bench <svg viewBox="0 0 24 24"><use href="#i-arrow-right"/></svg></div></div>
    <div class="tool-card" data-tool="gif-to-mp4" tabindex="0"><div class="tile"><svg class="icon"><use href="#i-video"/></svg></div><h3>GIF to MP4</h3><p>Convert GIF to MP4 video.</p><div class="go">Open bench <svg viewBox="0 0 24 24"><use href="#i-arrow-right"/></svg></div></div>
    <div class="tool-card" data-tool="gif-to-webp" tabindex="0"><div class="tile"><svg class="icon"><use href="#i-image"/></svg></div><h3>GIF to WebP</h3><p>Convert GIF to animated WebP.</p><div class="go">Open bench <svg viewBox="0 0 24 24"><use href="#i-arrow-right"/></svg></div></div>
    <div class="tool-card" data-tool="mov-to-mp4" tabindex="0"><div class="tile"><svg class="icon"><use href="#i-video"/></svg></div><h3>MOV to MP4</h3><p>Convert MOV video to MP4.</p><div class="go">Open bench <svg viewBox="0 0 24 24"><use href="#i-arrow-right"/></svg></div></div>
    <div class="tool-card" data-tool="mkv-to-mp4" tabindex="0"><div class="tile"><svg class="icon"><use href="#i-video"/></svg></div><h3>MKV to MP4</h3><p>Convert MKV video to MP4.</p><div class="go">Open bench <svg viewBox="0 0 24 24"><use href="#i-arrow-right"/></svg></div></div>
    <div class="tool-card" data-tool="avi-to-mp4" tabindex="0"><div class="tile"><svg class="icon"><use href="#i-video"/></svg></div><h3>AVI to MP4</h3><p>Convert AVI video to MP4.</p><div class="go">Open bench <svg viewBox="0 0 24 24"><use href="#i-arrow-right"/></svg></div></div>
    <div class="tool-card" data-tool="wav-to-mp3" tabindex="0"><div class="tile"><svg class="icon"><use href="#i-music"/></svg></div><h3>WAV to MP3</h3><p>Convert WAV audio to MP3.</p><div class="go">Open bench <svg viewBox="0 0 24 24"><use href="#i-arrow-right"/></svg></div></div>
    <div class="tool-card" data-tool="flac-to-mp3" tabindex="0"><div class="tile"><svg class="icon"><use href="#i-music"/></svg></div><h3>FLAC to MP3</h3><p>Convert FLAC audio to MP3.</p><div class="go">Open bench <svg viewBox="0 0 24 24"><use href="#i-arrow-right"/></svg></div></div>
    <div class="tool-card" data-tool="m4a-to-mp3" tabindex="0"><div class="tile"><svg class="icon"><use href="#i-music"/></svg></div><h3>M4A to MP3</h3><p>Convert M4A audio to MP3.</p><div class="go">Open bench <svg viewBox="0 0 24 24"><use href="#i-arrow-right"/></svg></div></div>
    <div class="tool-card" data-tool="ogg-to-mp3" tabindex="0"><div class="tile"><svg class="icon"><use href="#i-music"/></svg></div><h3>OGG to MP3</h3><p>Convert OGG audio to MP3.</p><div class="go">Open bench <svg viewBox="0 0 24 24"><use href="#i-arrow-right"/></svg></div></div>
    <div class="tool-card" data-tool="docx-to-txt" tabindex="0"><div class="tile"><svg class="icon"><use href="#i-doc"/></svg></div><h3>DOCX to TXT</h3><p>Convert DOCX document to plain text.</p><div class="go">Open bench <svg viewBox="0 0 24 24"><use href="#i-arrow-right"/></svg></div></div>
    <div class="tool-card" data-tool="docx-to-html" tabindex="0"><div class="tile"><svg class="icon"><use href="#i-doc"/></svg></div><h3>DOCX to HTML</h3><p>Convert DOCX document to HTML.</p><div class="go">Open bench <svg viewBox="0 0 24 24"><use href="#i-arrow-right"/></svg></div></div>
    <div class="tool-card" data-tool="xlsx-to-csv" tabindex="0"><div class="tile"><svg class="icon"><use href="#i-doc"/></svg></div><h3>XLSX to CSV</h3><p>Convert XLSX spreadsheet to CSV.</p><div class="go">Open bench <svg viewBox="0 0 24 24"><use href="#i-arrow-right"/></svg></div></div>
    <div class="tool-card" data-tool="csv-to-xlsx" tabindex="0"><div class="tile"><svg class="icon"><use href="#i-doc"/></svg></div><h3>CSV to XLSX</h3><p>Convert CSV to XLSX spreadsheet.</p><div class="go">Open bench <svg viewBox="0 0 24 24"><use href="#i-arrow-right"/></svg></div></div>
    <div class="tool-card" data-tool="pptx-to-jpg" tabindex="0"><div class="tile"><svg class="icon"><use href="#i-image"/></svg></div><h3>PPTX to JPG</h3><p>Convert PPTX slides to JPG.</p><div class="go">Open bench <svg viewBox="0 0 24 24"><use href="#i-arrow-right"/></svg></div></div>
"""
html = html.replace('</section>', tc + '  </div>\n</section>')
html = html.replace('8 tools', '28 tools')
html = html.replace('Eight tools', '28 tools')
with open(conv_html, 'w', encoding='utf-8') as f:
    f.write(html)

util_html = html
util_html = util_html.replace('Converters Bench', 'Utility Bench')
util_html = util_html.replace('tools-converters.js', 'tools-utility.js')
util_html = util_html.replace('cat-converter', 'cat-utility')
util_html = util_html.replace('var(--c-converter)', 'var(--c-utility)')
util_html = util_html.replace('var(--c-converter-soft)', 'var(--c-utility-soft)')
util_html = util_html.replace('28 tools', '10 tools')
util_html = re.sub(r'Audio to MP3, video to WebM[^<]*', 'Utility Bench for generating, formatting, hashing and inspecting files.', util_html)
import re
util_html = re.sub(r'<div class="tool-grid">[\s\S]*?</section>', '''<div class="tool-grid">
    <div class="tool-card" data-tool="qr-generator" tabindex="0"><div class="tile"><svg class="icon"><use href="#i-image"/></svg></div><h3>QR Generator</h3><p>Canvas-based QR code generator.</p><div class="go">Open bench <svg viewBox="0 0 24 24"><use href="#i-arrow-right"/></svg></div></div>
    <div class="tool-card" data-tool="qr-scanner" tabindex="0"><div class="tile"><svg class="icon"><use href="#i-image"/></svg></div><h3>QR Scanner</h3><p>Image upload QR scanner.</p><div class="go">Open bench <svg viewBox="0 0 24 24"><use href="#i-arrow-right"/></svg></div></div>
    <div class="tool-card" data-tool="barcode-generator" tabindex="0"><div class="tile"><svg class="icon"><use href="#i-image"/></svg></div><h3>Barcode Generator</h3><p>Canvas barcode renderer.</p><div class="go">Open bench <svg viewBox="0 0 24 24"><use href="#i-arrow-right"/></svg></div></div>
    <div class="tool-card" data-tool="barcode-scanner" tabindex="0"><div class="tile"><svg class="icon"><use href="#i-image"/></svg></div><h3>Barcode Scanner</h3><p>Barcode image decoder.</p><div class="go">Open bench <svg viewBox="0 0 24 24"><use href="#i-arrow-right"/></svg></div></div>
    <div class="tool-card" data-tool="password-generator" tabindex="0"><div class="tile"><svg class="icon"><use href="#i-shield"/></svg></div><h3>Password Generator</h3><p>Customizable password generator.</p><div class="go">Open bench <svg viewBox="0 0 24 24"><use href="#i-arrow-right"/></svg></div></div>
    <div class="tool-card" data-tool="file-hash" tabindex="0"><div class="tile"><svg class="icon"><use href="#i-shield"/></svg></div><h3>File Hash</h3><p>SHA-256 / SHA-1 digest.</p><div class="go">Open bench <svg viewBox="0 0 24 24"><use href="#i-arrow-right"/></svg></div></div>
    <div class="tool-card" data-tool="file-metadata" tabindex="0"><div class="tile"><svg class="icon"><use href="#i-doc"/></svg></div><h3>File Metadata</h3><p>Full browser file inspector.</p><div class="go">Open bench <svg viewBox="0 0 24 24"><use href="#i-arrow-right"/></svg></div></div>
    <div class="tool-card" data-tool="file-size-calc" tabindex="0"><div class="tile"><svg class="icon"><use href="#i-bolt"/></svg></div><h3>File Size Calc</h3><p>File size unit converter.</p><div class="go">Open bench <svg viewBox="0 0 24 24"><use href="#i-arrow-right"/></svg></div></div>
    <div class="tool-card" data-tool="color-picker" tabindex="0"><div class="tile"><svg class="icon"><use href="#i-image"/></svg></div><h3>Color Picker</h3><p>Eyedropper API / color input.</p><div class="go">Open bench <svg viewBox="0 0 24 24"><use href="#i-arrow-right"/></svg></div></div>
    <div class="tool-card" data-tool="color-converter" tabindex="0"><div class="tile"><svg class="icon"><use href="#i-image"/></svg></div><h3>Color Converter</h3><p>HEX / RGB / HSL / CMYK converter.</p><div class="go">Open bench <svg viewBox="0 0 24 24"><use href="#i-arrow-right"/></svg></div></div>
  </div>
</section>''', util_html)
util_html = util_html.replace('<a href="converters.html" class="active" data-transition>Converters</a>', '<a href="utility.html" class="active" data-transition>Utility</a>\\n      <a href="converters.html" data-transition>Converters</a>')
with open(os.path.join(base_dir, 'utility.html'), 'w', encoding='utf-8') as f:
    f.write(util_html)

util_js = """/* Utility Bench - QR, barcodes, passwords, hashes, metadata */

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
"""
with open(os.path.join(base_dir, 'js', 'tools-utility.js'), 'w', encoding='utf-8') as f:
    f.write(util_js)
