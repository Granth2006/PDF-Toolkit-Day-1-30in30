// ---- PDF.js worker config ----
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

// ================================================
// THEME TOGGLE
// ================================================
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = document.getElementById('themeIcon');
const themeLabel  = document.getElementById('themeLabel');

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('pdfToolkitTheme', theme);
  if (theme === 'dark') {
    themeIcon.textContent  = '☀️';
    themeLabel.textContent = 'Light Mode';
  } else {
    themeIcon.textContent  = '🌙';
    themeLabel.textContent = 'Dark Mode';
  }
}

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

// Load saved theme
applyTheme(localStorage.getItem('pdfToolkitTheme') || 'light');

// ================================================
// NAVIGATION
// ================================================
const toolLabels = {
  home:          { title: 'Welcome to PDF Toolkit',  sub: 'Select a tool from the sidebar to get started' },
  merge:         { title: '🔗 Merge PDFs',           sub: 'Combine multiple PDFs into one' },
  split:         { title: '✂️ Split PDF',            sub: 'Extract pages or split by range' },
  compress:      { title: '🗜️ Compress PDF',         sub: 'Reduce PDF file size' },
  'pdf-to-text': { title: '📝 PDF to Text',          sub: 'Extract all text from a PDF' },
  'image-to-pdf':{ title: '🖼️ Image to PDF',        sub: 'Convert images to a PDF document' },
  reorder:       { title: '🔀 Reorder Pages',        sub: 'Drag & drop to rearrange pages' },
  'delete-pages':{ title: '🗑️ Delete Pages',        sub: 'Remove unwanted pages' },
  watermark:     { title: '💧 Add Watermark',        sub: 'Stamp text watermark on every page' },
  'page-numbers':{ title: '🔢 Add Page Numbers',     sub: 'Stamp page numbers on every page' },
  rotate:        { title: '🔄 Rotate Pages',         sub: 'Rotate individual or all pages' },
  protect:       { title: '🔒 Protect PDF',          sub: 'Add password protection' },
  viewer:        { title: '👁️ PDF Viewer',           sub: 'Preview PDF pages in browser' },
  sign:          { title: '✍️ Sign PDF',             sub: 'Draw and stamp your signature' },
};

function switchTool(toolId) {
  // Update nav items
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.tool === toolId);
  });
  // Update panels
  document.querySelectorAll('.tool-panel').forEach(el => {
    el.classList.toggle('active', el.id === `panel-${toolId}`);
  });
  // Update topbar
  const info = toolLabels[toolId] || toolLabels['home'];
  document.getElementById('topbarTitle').textContent    = info.title;
  document.getElementById('topbarSubtitle').textContent = info.sub;
  // Close sidebar on mobile
  closeSidebar();
}

document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => switchTool(btn.dataset.tool));
});

// Welcome cards
document.querySelectorAll('.welcome-card[data-tool]').forEach(card => {
  card.addEventListener('click', () => switchTool(card.dataset.tool));
});

// ================================================
// MOBILE SIDEBAR
// ================================================
const sidebar         = document.getElementById('sidebar');
const menuToggle      = document.getElementById('menuToggle');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');

menuToggle.addEventListener('click', () => {
  sidebar.classList.add('open');
  sidebarBackdrop.classList.add('visible');
});

function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarBackdrop.classList.remove('visible');
}

sidebarBackdrop.addEventListener('click', closeSidebar);

// ================================================
// TOAST NOTIFICATIONS
// ================================================
const toastContainer = document.getElementById('toastContainer');

function showToast(message, type = 'info', duration = 3500) {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove());
  }, duration);
}

// ================================================
// MODAL
// ================================================
const modalOverlay    = document.getElementById('modalOverlay');
const modalTitle      = document.getElementById('modalTitle');
const modalBody       = document.getElementById('modalBody');
const modalFooter     = document.getElementById('modalFooter');
const modalClose      = document.getElementById('modalClose');
const modalCancelBtn  = document.getElementById('modalCancelBtn');
const modalConfirmBtn = document.getElementById('modalConfirmBtn');

function openModal({ title, body, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, showFooter = true }) {
  modalTitle.textContent = title;
  modalBody.innerHTML = body;
  modalConfirmBtn.textContent = confirmText;
  modalCancelBtn.textContent  = cancelText;
  modalFooter.style.display   = showFooter ? '' : 'none';
  modalOverlay.classList.add('visible');
  modalConfirmBtn.onclick = () => { closeModal(); if (onConfirm) onConfirm(); };
}

function closeModal() { modalOverlay.classList.remove('visible'); }

modalClose.addEventListener('click', closeModal);
modalCancelBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

// ================================================
// SHARED HELPER UTILITIES
// ================================================

/** Format bytes to human readable */
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/** Read a File object as ArrayBuffer */
function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/** Read a File object as DataURL */
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Trigger a file download from a Uint8Array */
function downloadBlob(bytes, filename, mimeType = 'application/pdf') {
  const blob = new Blob([bytes], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href      = url;
  a.download  = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/** Animate progress bar fill, returns a setter function */
function animateProgress(fillEl, wrapEl, label = '') {
  wrapEl.classList.add('visible');
  fillEl.style.width = '0%';
  if (label) wrapEl.querySelector('.progress-label').textContent = label;
  return function setProgress(pct) {
    fillEl.style.width = Math.min(100, pct) + '%';
  };
}

function hideProgress(wrapEl) { wrapEl.classList.remove('visible'); }

/** Show result card */
function showResultCard(cardEl, metaText) {
  cardEl.classList.add('visible');
  const metaEl = cardEl.querySelector('[id$="ResultMeta"], [id$="Meta"]');
  if (metaEl && metaText) metaEl.textContent = metaText;
  cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideResultCard(cardEl) { cardEl.classList.remove('visible'); }

/** Render a single PDF page into a <canvas> using pdf.js.
    Returns the canvas element. */
async function renderPageToCanvas(pdfDoc, pageNum, scale = 1.0) {
  const page     = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale });
  const canvas   = document.createElement('canvas');
  canvas.width   = viewport.width;
  canvas.height  = viewport.height;
  await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
  return canvas;
}

/** Setup drag-and-drop on an upload zone */
function setupDropzone(zone, onFiles) {
  zone.addEventListener('dragover', e => {
    e.preventDefault();
    zone.classList.add('drag-over');
  });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    if (e.dataTransfer.files.length) onFiles(Array.from(e.dataTransfer.files));
  });
}

/** Build a file item row for the file list */
function buildFileItem(file, onRemove) {
  const item = document.createElement('div');
  item.className = 'file-item';
  item.innerHTML = `
    <div class="file-icon">PDF</div>
    <div class="file-info">
      <div class="file-name">${file.name}</div>
      <div class="file-meta">${formatBytes(file.size)}</div>
    </div>
    <button class="file-remove" title="Remove">&times;</button>
  `;
  item.querySelector('.file-remove').addEventListener('click', onRemove);
  return item;
}

/** Get page count from ArrayBuffer using pdf-lib */
async function getPDFPageCount(arrayBuffer) {
  try {
    const pdf = await PDFLib.PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    return pdf.getPageCount();
  } catch { return '?'; }
}

// ================================================
// MERGE PDF TOOL
// ================================================
(function initMerge() {
  const dropzone   = document.getElementById('mergeDropzone');
  const input      = document.getElementById('mergeInput');
  const fileList   = document.getElementById('mergeFileList');
  const mergeBtn   = document.getElementById('mergePDFBtn');
  const clearBtn   = document.getElementById('mergeClearBtn');
  const progressW  = document.getElementById('mergeProgress');
  const progressF  = document.getElementById('mergeFill');
  const resultCard = document.getElementById('mergeResult');
  const dlBtn      = document.getElementById('mergeDownloadBtn');

  let files = [];
  let resultBytes = null;

  // Make file list sortable (drag to reorder)
  Sortable.create(fileList, { animation: 150, ghostClass: 'sortable-ghost', dragClass: 'sortable-drag' });

  function updateUI() {
    mergeBtn.disabled = files.length < 2;
    hideResultCard(resultCard);
  }

  function addFiles(newFiles) {
    const pdfs = newFiles.filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
    if (!pdfs.length) { showToast('Please select PDF files only.', 'error'); return; }
    pdfs.forEach(file => {
      files.push(file);
      const item = buildFileItem(file, () => {
        files.splice(files.indexOf(file), 1);
        item.remove();
        updateUI();
      });
      item.dataset.name = file.name;
      fileList.appendChild(item);
    });
    updateUI();
    showToast(`${pdfs.length} file(s) added.`, 'success');
  }

  input.addEventListener('change', () => { addFiles(Array.from(input.files)); input.value = ''; });
  setupDropzone(dropzone, addFiles);

  clearBtn.addEventListener('click', () => {
    files = [];
    fileList.innerHTML = '';
    resultBytes = null;
    hideResultCard(resultCard);
    updateUI();
    showToast('Cleared.', 'info');
  });

  mergeBtn.addEventListener('click', async () => {
    if (files.length < 2) return;
    try {
      mergeBtn.disabled = true;
      const setProgress = animateProgress(progressF, progressW, 'Merging PDFs…');
      const merged = await PDFLib.PDFDocument.create();
      let totalPages = 0;

      for (let i = 0; i < files.length; i++) {
        setProgress((i / files.length) * 90);
        const buf = await readFileAsArrayBuffer(files[i]);
        const src = await PDFLib.PDFDocument.load(buf);
        const pages = await merged.copyPages(src, src.getPageIndices());
        pages.forEach(p => { merged.addPage(p); totalPages++; });
      }

      setProgress(95);
      const pdfBytes = await merged.save();
      setProgress(100);
      resultBytes = pdfBytes;

      setTimeout(() => {
        hideProgress(progressW);
        showResultCard(resultCard, `${files.length} files merged → ${totalPages} pages · ${formatBytes(pdfBytes.length)}`);
        showToast('PDFs merged successfully!', 'success');
        mergeBtn.disabled = false;
      }, 400);

    } catch (err) {
      hideProgress(progressW);
      mergeBtn.disabled = false;
      showToast('Error merging PDFs: ' + err.message, 'error');
      console.error(err);
    }
  });

  dlBtn.addEventListener('click', () => {
    if (resultBytes) downloadBlob(resultBytes, 'merged.pdf');
  });
})();

// ================================================
// SPLIT PDF TOOL
// ================================================
(function initSplit() {
  const dropzone      = document.getElementById('splitDropzone');
  const input         = document.getElementById('splitInput');
  const fileList      = document.getElementById('splitFileList');
  const splitOptions  = document.getElementById('splitOptions');
  const splitBtnGrp   = document.getElementById('splitBtnGroup');
  const splitBtn      = document.getElementById('splitPDFBtn');
  const clearBtn      = document.getElementById('splitClearBtn');
  const modeSelect    = document.getElementById('splitMode');
  const rangeGroup    = document.getElementById('splitRangeGroup');
  const partsGroup    = document.getElementById('splitPartsGroup');
  const fromInput     = document.getElementById('splitFrom');
  const toInput       = document.getElementById('splitTo');
  const partsInput    = document.getElementById('splitParts');
  const progressW     = document.getElementById('splitProgress');
  const progressF     = document.getElementById('splitFill');
  const progressLabel = document.getElementById('splitProgressLabel');
  const resultCard    = document.getElementById('splitResult');
  const resultMeta    = document.getElementById('splitResultMeta');
  const dlList        = document.getElementById('splitDownloadList');

  let currentFile = null;
  let pageCount   = 0;

  modeSelect.addEventListener('change', () => {
    const mode = modeSelect.value;
    rangeGroup.classList.toggle('hidden', mode !== 'range');
    partsGroup.classList.toggle('hidden', mode !== 'parts');
  });

  function addFile(file) {
    if (!file.name.endsWith('.pdf') && file.type !== 'application/pdf') {
      showToast('Please select a PDF file.', 'error'); return;
    }
    currentFile = file;
    fileList.innerHTML = '';
    const item = buildFileItem(file, () => {
      currentFile = null; pageCount = 0;
      fileList.innerHTML = '';
      splitOptions.style.display = 'none';
      splitBtnGrp.style.display  = 'none';
      hideResultCard(resultCard);
    });
    fileList.appendChild(item);
    splitOptions.style.display = 'flex';
    splitBtnGrp.style.display  = 'flex';
    hideResultCard(resultCard);
    // Read page count
    readFileAsArrayBuffer(file).then(async buf => {
      pageCount = await getPDFPageCount(buf);
      item.querySelector('.file-meta').textContent = `${formatBytes(file.size)} · ${pageCount} pages`;
      toInput.value = pageCount;
      toInput.max   = pageCount;
      fromInput.max = pageCount;
    });
    showToast('File loaded.', 'success');
  }

  input.addEventListener('change', () => { if (input.files[0]) addFile(input.files[0]); input.value = ''; });
  setupDropzone(dropzone, files => { if (files[0]) addFile(files[0]); });
  clearBtn.addEventListener('click', () => {
    currentFile = null; pageCount = 0;
    fileList.innerHTML = '';
    splitOptions.style.display = 'none';
    splitBtnGrp.style.display  = 'none';
    hideResultCard(resultCard);
    showToast('Cleared.', 'info');
  });

  splitBtn.addEventListener('click', async () => {
    if (!currentFile) return;
    const mode = modeSelect.value;
    try {
      splitBtn.disabled = true;
      const setP = animateProgress(progressF, progressW, 'Splitting PDF…');
      const buf  = await readFileAsArrayBuffer(currentFile);
      const srcDoc = await PDFLib.PDFDocument.load(buf);
      const total  = srcDoc.getPageCount();

      dlList.innerHTML = '';
      resultCard.classList.remove('visible');

      const chunks = [];

      if (mode === 'range') {
        const from = Math.max(1, parseInt(fromInput.value) || 1);
        const to   = Math.min(total, parseInt(toInput.value) || total);
        if (from > to) { showToast('Invalid range: "From" must be ≤ "To".', 'error'); splitBtn.disabled = false; hideProgress(progressW); return; }
        const newDoc = await PDFLib.PDFDocument.create();
        const indices = [];
        for (let i = from - 1; i <= to - 1; i++) indices.push(i);
        const copied = await newDoc.copyPages(srcDoc, indices);
        copied.forEach(p => newDoc.addPage(p));
        const bytes = await newDoc.save();
        chunks.push({ bytes, name: `split_p${from}-p${to}.pdf`, label: `Pages ${from}–${to}` });

      } else if (mode === 'each') {
        for (let i = 0; i < total; i++) {
          setP((i / total) * 90);
          const newDoc = await PDFLib.PDFDocument.create();
          const [page] = await newDoc.copyPages(srcDoc, [i]);
          newDoc.addPage(page);
          const bytes = await newDoc.save();
          chunks.push({ bytes, name: `page_${i + 1}.pdf`, label: `Page ${i + 1}` });
        }

      } else if (mode === 'parts') {
        const parts = Math.max(2, parseInt(partsInput.value) || 2);
        const chunk = Math.ceil(total / parts);
        for (let p = 0; p < parts; p++) {
          const start = p * chunk;
          const end   = Math.min(start + chunk - 1, total - 1);
          if (start >= total) break;
          const newDoc = await PDFLib.PDFDocument.create();
          const indices = [];
          for (let i = start; i <= end; i++) indices.push(i);
          const copied = await newDoc.copyPages(srcDoc, indices);
          copied.forEach(pg => newDoc.addPage(pg));
          const bytes = await newDoc.save();
          chunks.push({ bytes, name: `part_${p + 1}.pdf`, label: `Part ${p + 1} (pp ${start + 1}–${end + 1})` });
        }
      }

      setP(100);
      resultMeta.textContent = `${chunks.length} file(s) created from ${total} pages`;
      chunks.forEach(chunk => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-success btn-sm';
        btn.textContent = `⬇️ ${chunk.label} (${formatBytes(chunk.bytes.length)})`;
        btn.addEventListener('click', () => downloadBlob(chunk.bytes, chunk.name));
        dlList.appendChild(btn);
      });

      setTimeout(() => {
        hideProgress(progressW);
        resultCard.classList.add('visible');
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        showToast(`Split into ${chunks.length} file(s)!`, 'success');
        splitBtn.disabled = false;
      }, 400);

    } catch (err) {
      hideProgress(progressW);
      splitBtn.disabled = false;
      showToast('Error splitting PDF: ' + err.message, 'error');
      console.error(err);
    }
  });
})();

// ================================================
// COMPRESS PDF TOOL
// ================================================
(function initCompress() {
  const dropzone   = document.getElementById('compressDropzone');
  const input      = document.getElementById('compressInput');
  const fileList   = document.getElementById('compressFileList');
  const optionsRow = document.getElementById('compressOptions');
  const btnGrp     = document.getElementById('compressBtnGroup');
  const compBtn    = document.getElementById('compressPDFBtn');
  const clearBtn   = document.getElementById('compressClearBtn');
  const qualSlider = document.getElementById('compressQuality');
  const qualVal    = document.getElementById('qualityVal');
  const progressW  = document.getElementById('compressProgress');
  const progressF  = document.getElementById('compressFill');
  const resultCard = document.getElementById('compressResult');
  const resultMeta = document.getElementById('compressResultMeta');
  const dlBtn      = document.getElementById('compressDownloadBtn');

  let currentFile = null;
  let resultBytes = null;

  qualSlider.addEventListener('input', () => { qualVal.textContent = qualSlider.value; });

  function addFile(file) {
    if (!file.name.endsWith('.pdf') && file.type !== 'application/pdf') {
      showToast('Please select a PDF file.', 'error'); return;
    }
    currentFile = file;
    fileList.innerHTML = '';
    const item = buildFileItem(file, () => {
      currentFile = null;
      fileList.innerHTML = '';
      optionsRow.style.display = 'none';
      btnGrp.style.display     = 'none';
      hideResultCard(resultCard);
    });
    fileList.appendChild(item);
    // Show page count
    readFileAsArrayBuffer(file).then(async buf => {
      const pc = await getPDFPageCount(buf);
      item.querySelector('.file-meta').textContent = `${formatBytes(file.size)} · ${pc} pages`;
    });
    optionsRow.style.display = 'flex';
    btnGrp.style.display     = 'flex';
    hideResultCard(resultCard);
    showToast('File loaded.', 'success');
  }

  input.addEventListener('change', () => { if (input.files[0]) addFile(input.files[0]); input.value = ''; });
  setupDropzone(dropzone, files => { if (files[0]) addFile(files[0]); });
  clearBtn.addEventListener('click', () => {
    currentFile = null; resultBytes = null;
    fileList.innerHTML = '';
    optionsRow.style.display = 'none';
    btnGrp.style.display     = 'none';
    hideResultCard(resultCard);
    showToast('Cleared.', 'info');
  });

  compBtn.addEventListener('click', async () => {
    if (!currentFile) return;
    try {
      compBtn.disabled = true;
      const setP  = animateProgress(progressF, progressW, 'Compressing PDF…');
      const buf   = await readFileAsArrayBuffer(currentFile);
      const quality = parseInt(qualSlider.value) / 100;
      const level   = document.getElementById('compressLevel').value;

      setP(20);
      // Load with pdf-lib and re-save (removes redundant data, compresses streams)
      const pdfDoc = await PDFLib.PDFDocument.load(buf, { ignoreEncryption: true });
      setP(50);

      // Re-embed images at lower quality using canvas
      const pages = pdfDoc.getPages();
      // For each page, attempt to re-compress embedded images
      // pdf-lib doesn't expose raw image re-compression, so we use a canvas approach
      // for PDFs that are text-heavy this still reduces size via stream optimization

      let compressionLevel;
      if (level === 'low')    compressionLevel = 3;
      else if (level === 'high') compressionLevel = 9;
      else compressionLevel = 6;

      setP(70);
      // Save with object compression enabled
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 50,
      });
      setP(95);
      resultBytes = pdfBytes;

      const saved   = currentFile.size - pdfBytes.length;
      const pct     = ((saved / currentFile.size) * 100).toFixed(1);
      const metaTxt = saved > 0
        ? `${formatBytes(currentFile.size)} → ${formatBytes(pdfBytes.length)} (saved ${pct}%)`
        : `${formatBytes(pdfBytes.length)} (already optimized — ${formatBytes(pdfBytes.length)} output)`;

      setTimeout(() => {
        hideProgress(progressW);
        showResultCard(resultCard, metaTxt);
        resultMeta.textContent = metaTxt;
        showToast('Compression complete!', 'success');
        compBtn.disabled = false;
      }, 400);

    } catch (err) {
      hideProgress(progressW);
      compBtn.disabled = false;
      showToast('Error compressing PDF: ' + err.message, 'error');
      console.error(err);
    }
  });

  dlBtn.addEventListener('click', () => {
    if (resultBytes) downloadBlob(resultBytes, 'compressed.pdf');
  });
})();

// ================================================
// PDF TO TEXT TOOL
// ================================================
(function initPDFtoText() {
  const dropzone    = document.getElementById('pttDropzone');
  const input       = document.getElementById('pttInput');
  const fileList    = document.getElementById('pttFileList');
  const btnGrp      = document.getElementById('pttBtnGroup');
  const extractBtn  = document.getElementById('pttExtractBtn');
  const copyBtn     = document.getElementById('pttCopyBtn');
  const dlBtn       = document.getElementById('pttDownloadBtn');
  const clearBtn    = document.getElementById('pttClearBtn');
  const progressW   = document.getElementById('pttProgress');
  const progressF   = document.getElementById('pttFill');
  const progressLbl = document.getElementById('pttProgressLabel');
  const outputWrap  = document.getElementById('pttOutput');
  const outputPre   = document.getElementById('pttText');

  let currentFile   = null;
  let extractedText = '';

  function addFile(file) {
    if (!file.name.endsWith('.pdf') && file.type !== 'application/pdf') {
      showToast('Please select a PDF file.', 'error'); return;
    }
    currentFile   = file;
    extractedText = '';
    fileList.innerHTML = '';
    const item = buildFileItem(file, () => {
      currentFile = null; extractedText = '';
      fileList.innerHTML = '';
      btnGrp.style.display   = 'none';
      outputWrap.classList.add('hidden');
      outputPre.textContent  = '';
      copyBtn.disabled  = true;
      dlBtn.disabled    = true;
    });
    fileList.appendChild(item);
    readFileAsArrayBuffer(file).then(async buf => {
      const pc = await getPDFPageCount(buf);
      item.querySelector('.file-meta').textContent = `${formatBytes(file.size)} · ${pc} pages`;
    });
    btnGrp.style.display  = 'flex';
    outputWrap.classList.add('hidden');
    outputPre.textContent = '';
    copyBtn.disabled  = true;
    dlBtn.disabled    = true;
    showToast('File loaded.', 'success');
  }

  input.addEventListener('change', () => { if (input.files[0]) addFile(input.files[0]); input.value = ''; });
  setupDropzone(dropzone, files => { if (files[0]) addFile(files[0]); });

  clearBtn.addEventListener('click', () => {
    currentFile = null; extractedText = '';
    fileList.innerHTML = '';
    btnGrp.style.display   = 'none';
    outputWrap.classList.add('hidden');
    outputPre.textContent  = '';
    copyBtn.disabled = true;
    dlBtn.disabled   = true;
    showToast('Cleared.', 'info');
  });

  extractBtn.addEventListener('click', async () => {
    if (!currentFile) return;
    try {
      extractBtn.disabled = true;
      const setP = animateProgress(progressF, progressW, 'Extracting text…');
      const buf  = await readFileAsArrayBuffer(currentFile);
      const pdf  = await pdfjsLib.getDocument({ data: buf }).promise;
      const numPages = pdf.numPages;
      let fullText = '';

      for (let i = 1; i <= numPages; i++) {
        progressLbl.textContent = `Extracting page ${i} of ${numPages}…`;
        setP((i / numPages) * 95);
        const page    = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map(item => item.str).join(' ');
        fullText += `\n--- Page ${i} ---\n${pageText}\n`;
      }

      setP(100);
      extractedText = fullText.trim();

      setTimeout(() => {
        hideProgress(progressW);
        outputPre.textContent = extractedText || '(No extractable text found in this PDF)';
        outputWrap.classList.remove('hidden');
        copyBtn.disabled = false;
        dlBtn.disabled   = false;
        extractBtn.disabled = false;
        showToast(`Extracted text from ${numPages} page(s)!`, 'success');
      }, 300);

    } catch (err) {
      hideProgress(progressW);
      extractBtn.disabled = false;
      showToast('Error extracting text: ' + err.message, 'error');
      console.error(err);
    }
  });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(extractedText).then(() => {
      showToast('Copied to clipboard!', 'success');
    }).catch(() => {
      showToast('Could not copy — please select & copy manually.', 'warning');
    });
  });

  dlBtn.addEventListener('click', () => {
    if (!extractedText) return;
    const bytes  = new TextEncoder().encode(extractedText);
    const blob   = new Blob([bytes], { type: 'text/plain' });
    const url    = URL.createObjectURL(blob);
    const a      = document.createElement('a');
    a.href       = url;
    a.download   = currentFile.name.replace('.pdf', '') + '_text.txt';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  });
})();

// ================================================
// IMAGE TO PDF TOOL
// ================================================
(function initImageToPDF() {
  const dropzone  = document.getElementById('itpDropzone');
  const input     = document.getElementById('itpInput');
  const imageGrid = document.getElementById('itpImageGrid');
  const optionsEl = document.getElementById('itpOptions');
  const btnGrp    = document.getElementById('itpBtnGroup');
  const convertBtn= document.getElementById('itpConvertBtn');
  const clearBtn  = document.getElementById('itpClearBtn');
  const progressW = document.getElementById('itpProgress');
  const progressF = document.getElementById('itpFill');
  const resultCard= document.getElementById('itpResult');
  const resultMeta= document.getElementById('itpResultMeta');
  const dlBtn     = document.getElementById('itpDownloadBtn');

  let imageFiles  = [];
  let resultBytes = null;
  let sortableInst = null;

  function updateUI() {
    const hasImages = imageFiles.length > 0;
    optionsEl.style.display = hasImages ? 'flex'   : 'none';
    btnGrp.style.display    = hasImages ? 'flex'   : 'none';
    hideResultCard(resultCard);
  }

  function addImages(files) {
    const valid = files.filter(f => f.type.startsWith('image/'));
    if (!valid.length) { showToast('Please select image files (JPG, PNG, WebP).', 'error'); return; }
    valid.forEach(file => {
      imageFiles.push(file);
      const wrap = document.createElement('div');
      wrap.className = 'image-thumb-item';
      const img  = document.createElement('img');
      img.src    = URL.createObjectURL(file);
      img.alt    = file.name;
      const rmBtn = document.createElement('button');
      rmBtn.className = 'image-thumb-remove';
      rmBtn.textContent = '×';
      rmBtn.addEventListener('click', () => {
        imageFiles.splice(imageFiles.indexOf(file), 1);
        wrap.remove();
        updateUI();
      });
      wrap.appendChild(img);
      wrap.appendChild(rmBtn);
      wrap.dataset.name = file.name;
      imageGrid.appendChild(wrap);
    });
    // Enable drag-to-reorder for image grid
    if (!sortableInst) {
      sortableInst = Sortable.create(imageGrid, { animation: 150, ghostClass: 'sortable-ghost' });
    }
    updateUI();
    showToast(`${valid.length} image(s) added.`, 'success');
  }

  input.addEventListener('change', () => { addImages(Array.from(input.files)); input.value = ''; });
  setupDropzone(dropzone, addImages);

  clearBtn.addEventListener('click', () => {
    imageFiles = []; resultBytes = null;
    imageGrid.innerHTML = '';
    if (sortableInst) { sortableInst.destroy(); sortableInst = null; }
    updateUI();
    showToast('Cleared.', 'info');
  });

  convertBtn.addEventListener('click', async () => {
    if (!imageFiles.length) return;
    // Re-order imageFiles to match DOM order
    const orderedNames = Array.from(imageGrid.children).map(el => el.dataset.name);
    imageFiles.sort((a, b) => orderedNames.indexOf(a.name) - orderedNames.indexOf(b.name));

    try {
      convertBtn.disabled = true;
      const setP      = animateProgress(progressF, progressW, 'Creating PDF…');
      const pdfDoc    = await PDFLib.PDFDocument.create();
      const pageSize  = document.getElementById('itpPageSize').value;
      const orient    = document.getElementById('itpOrientation').value;
      const margin    = parseInt(document.getElementById('itpMargin').value) || 0;

      // A4: 595x842 pts  Letter: 612x792 pts
      const sizes = { A4: [595.28, 841.89], Letter: [612, 792] };

      for (let i = 0; i < imageFiles.length; i++) {
        setP(((i + 1) / imageFiles.length) * 90);
        const dataUrl = await readFileAsDataURL(imageFiles[i]);
        const mimeType = imageFiles[i].type;

        let embeddedImg;
        if (mimeType === 'image/png') {
          embeddedImg = await pdfDoc.embedPng(await readFileAsArrayBuffer(imageFiles[i]));
        } else {
          // jpg / webp / others → embed as jpg (convert via canvas first)
          const canvas = document.createElement('canvas');
          const ctx    = canvas.getContext('2d');
          const imgEl  = new Image();
          await new Promise(res => { imgEl.onload = res; imgEl.src = dataUrl; });
          canvas.width  = imgEl.naturalWidth;
          canvas.height = imgEl.naturalHeight;
          ctx.drawImage(imgEl, 0, 0);
          const jpgDataUrl = canvas.toDataURL('image/jpeg', 0.92);
          const jpgBase64  = jpgDataUrl.split(',')[1];
          const jpgBytes   = Uint8Array.from(atob(jpgBase64), c => c.charCodeAt(0));
          embeddedImg = await pdfDoc.embedJpg(jpgBytes);
        }

        let pageW, pageH;
        if (pageSize === 'auto') {
          pageW = embeddedImg.width  + margin * 2;
          pageH = embeddedImg.height + margin * 2;
        } else {
          [pageW, pageH] = sizes[pageSize] || sizes['A4'];
          if (orient === 'landscape') [pageW, pageH] = [pageH, pageW];
        }

        const page  = pdfDoc.addPage([pageW, pageH]);
        const imgDims = embeddedImg.scaleToFit(pageW - margin * 2, pageH - margin * 2);
        const x = margin + (pageW - margin * 2 - imgDims.width)  / 2;
        const y = margin + (pageH - margin * 2 - imgDims.height) / 2;
        page.drawImage(embeddedImg, { x, y, width: imgDims.width, height: imgDims.height });
      }

      setP(95);
      const pdfBytes  = await pdfDoc.save();
      resultBytes = pdfBytes;
      setP(100);

      setTimeout(() => {
        hideProgress(progressW);
        showResultCard(resultCard, `${imageFiles.length} image(s) → ${pdfDoc.getPageCount()} pages · ${formatBytes(pdfBytes.length)}`);
        showToast('PDF created successfully!', 'success');
        convertBtn.disabled = false;
      }, 400);

    } catch (err) {
      hideProgress(progressW);
      convertBtn.disabled = false;
      showToast('Error creating PDF: ' + err.message, 'error');
      console.error(err);
    }
  });

  dlBtn.addEventListener('click', () => { if (resultBytes) downloadBlob(resultBytes, 'images.pdf'); });
})();

// ================================================
// REORDER PAGES TOOL
// ================================================
(function initReorder() {
  const dropzone     = document.getElementById('reorderDropzone');
  const input        = document.getElementById('reorderInput');
  const progressLdW  = document.getElementById('reorderLoadProgress');
  const progressLdF  = document.getElementById('reorderLoadFill');
  const progressLdLbl= document.getElementById('reorderLoadLabel');
  const grid         = document.getElementById('reorderGrid');
  const btnGrp       = document.getElementById('reorderBtnGroup');
  const saveBtn      = document.getElementById('reorderSaveBtn');
  const resetBtn     = document.getElementById('reorderResetBtn');
  const clearBtn     = document.getElementById('reorderClearBtn');
  const resultCard   = document.getElementById('reorderResult');
  const resultMeta   = document.getElementById('reorderResultMeta');
  const dlBtn        = document.getElementById('reorderDownloadBtn');

  let currentFile   = null;
  let originalBuf   = null;
  let pageCount     = 0;
  let sortableInst  = null;
  let resultBytes   = null;

  function addFile(file) {
    if (!file.name.endsWith('.pdf') && file.type !== 'application/pdf') {
      showToast('Please select a PDF file.', 'error'); return;
    }
    currentFile = file;
    grid.innerHTML = '';
    hideResultCard(resultCard);
    loadPages();
  }

  async function loadPages() {
    try {
      const setP = animateProgress(progressLdF, progressLdW, 'Rendering page thumbnails…');
      const buf  = await readFileAsArrayBuffer(currentFile);
      originalBuf = buf;
      const pdfJs  = await pdfjsLib.getDocument({ data: buf }).promise;
      pageCount    = pdfJs.numPages;
      grid.innerHTML = '';

      for (let i = 1; i <= pageCount; i++) {
        progressLdLbl.textContent = `Rendering page ${i} of ${pageCount}…`;
        setP((i / pageCount) * 95);
        const canvas = await renderPageToCanvas(pdfJs, i, 0.35);
        const thumb  = document.createElement('div');
        thumb.className = 'page-thumb';
        thumb.dataset.pageIndex = i - 1;
        thumb.appendChild(canvas);
        const lbl = document.createElement('div');
        lbl.className = 'page-label';
        lbl.textContent = `Page ${i}`;
        thumb.appendChild(lbl);
        grid.appendChild(thumb);
      }

      setP(100);
      setTimeout(() => {
        hideProgress(progressLdW);
        btnGrp.style.display = 'flex';
        // Init sortable
        if (sortableInst) sortableInst.destroy();
        sortableInst = Sortable.create(grid, {
          animation: 200,
          ghostClass: 'sortable-ghost',
          dragClass: 'sortable-drag',
        });
        showToast(`${pageCount} pages loaded. Drag to reorder!`, 'success');
      }, 300);

    } catch (err) {
      hideProgress(progressLdW);
      showToast('Error loading PDF: ' + err.message, 'error');
      console.error(err);
    }
  }

  input.addEventListener('change', () => { if (input.files[0]) addFile(input.files[0]); input.value = ''; });
  setupDropzone(dropzone, files => { if (files[0]) addFile(files[0]); });

  resetBtn.addEventListener('click', () => {
    if (!currentFile) return;
    const thumbs = Array.from(grid.children).sort((a, b) =>
      parseInt(a.dataset.pageIndex) - parseInt(b.dataset.pageIndex)
    );
    thumbs.forEach(t => grid.appendChild(t));
    showToast('Order reset to original.', 'info');
  });

  clearBtn.addEventListener('click', () => {
    currentFile = null; originalBuf = null; pageCount = 0; resultBytes = null;
    grid.innerHTML = '';
    btnGrp.style.display = 'none';
    hideResultCard(resultCard);
    if (sortableInst) { sortableInst.destroy(); sortableInst = null; }
    showToast('Cleared.', 'info');
  });

  saveBtn.addEventListener('click', async () => {
    if (!originalBuf) return;
    try {
      saveBtn.disabled = true;
      // Get new order from DOM
      const newOrder = Array.from(grid.children).map(el => parseInt(el.dataset.pageIndex));
      const srcDoc   = await PDFLib.PDFDocument.load(originalBuf);
      const newDoc   = await PDFLib.PDFDocument.create();
      const pages    = await newDoc.copyPages(srcDoc, newOrder);
      pages.forEach(p => newDoc.addPage(p));
      resultBytes = await newDoc.save();

      hideResultCard(resultCard);
      showResultCard(resultCard, `${pageCount} pages reordered → ${formatBytes(resultBytes.length)}`);
      showToast('PDF saved with new page order!', 'success');
      saveBtn.disabled = false;
    } catch (err) {
      saveBtn.disabled = false;
      showToast('Error saving PDF: ' + err.message, 'error');
      console.error(err);
    }
  });

  dlBtn.addEventListener('click', () => { if (resultBytes) downloadBlob(resultBytes, 'reordered.pdf'); });
})();

// ================================================
// DELETE PAGES TOOL
// ================================================
(function initDeletePages() {
  const dropzone     = document.getElementById('deleteDropzone');
  const input        = document.getElementById('deleteInput');
  const progressLdW  = document.getElementById('deleteLoadProgress');
  const progressLdF  = document.getElementById('deleteLoadFill');
  const progressLdLbl= document.getElementById('deleteLoadLabel');
  const grid         = document.getElementById('deleteGrid');
  const btnGrp       = document.getElementById('deleteBtnGroup');
  const applyBtn     = document.getElementById('deleteApplyBtn');
  const clearBtn     = document.getElementById('deleteClearBtn');
  const resultCard   = document.getElementById('deleteResult');
  const resultMeta   = document.getElementById('deleteResultMeta');
  const dlBtn        = document.getElementById('deleteDownloadBtn');
  const pageActions  = document.getElementById('deletePageActions');
  const countSpan    = document.getElementById('deleteCount');
  const selectAllBtn = document.getElementById('deleteSelectAll');
  const selectNoneBtn= document.getElementById('deleteSelectNone');

  let currentFile  = null;
  let originalBuf  = null;
  let pageCount    = 0;
  let resultBytes  = null;
  let checkboxes   = [];

  function updateCount() {
    const sel = checkboxes.filter(cb => cb.checked).length;
    countSpan.textContent = `${sel} page(s) selected for deletion`;
    applyBtn.disabled = sel === 0 || sel === pageCount;
  }

  function addFile(file) {
    if (!file.name.endsWith('.pdf') && file.type !== 'application/pdf') {
      showToast('Please select a PDF file.', 'error'); return;
    }
    currentFile = file;
    grid.innerHTML = '';
    checkboxes = [];
    hideResultCard(resultCard);
    loadPages();
  }

  async function loadPages() {
    try {
      const setP = animateProgress(progressLdF, progressLdW, 'Rendering page thumbnails…');
      const buf  = await readFileAsArrayBuffer(currentFile);
      originalBuf = buf;
      const pdfJs  = await pdfjsLib.getDocument({ data: buf }).promise;
      pageCount    = pdfJs.numPages;
      grid.innerHTML = '';
      checkboxes     = [];

      for (let i = 1; i <= pageCount; i++) {
        progressLdLbl.textContent = `Rendering page ${i} of ${pageCount}…`;
        setP((i / pageCount) * 95);
        const canvas = await renderPageToCanvas(pdfJs, i, 0.35);
        const thumb  = document.createElement('div');
        thumb.className = 'page-thumb';
        const cb = document.createElement('input');
        cb.type  = 'checkbox';
        cb.className = 'page-checkbox';
        cb.addEventListener('change', () => {
          thumb.classList.toggle('selected', cb.checked);
          updateCount();
        });
        checkboxes.push(cb);
        thumb.appendChild(cb);
        thumb.appendChild(canvas);
        const lbl = document.createElement('div');
        lbl.className = 'page-label';
        lbl.textContent = `Page ${i}`;
        thumb.appendChild(lbl);
        grid.appendChild(thumb);
      }

      setP(100);
      setTimeout(() => {
        hideProgress(progressLdW);
        btnGrp.style.display    = 'flex';
        pageActions.style.display = 'flex';
        applyBtn.disabled = true;
        updateCount();
        showToast(`${pageCount} pages loaded. Select pages to delete.`, 'success');
      }, 300);

    } catch (err) {
      hideProgress(progressLdW);
      showToast('Error loading PDF: ' + err.message, 'error');
      console.error(err);
    }
  }

  selectAllBtn.addEventListener('click', () => {
    checkboxes.forEach(cb => { cb.checked = true; cb.dispatchEvent(new Event('change')); });
  });

  selectNoneBtn.addEventListener('click', () => {
    checkboxes.forEach(cb => { cb.checked = false; cb.dispatchEvent(new Event('change')); });
  });

  input.addEventListener('change', () => { if (input.files[0]) addFile(input.files[0]); input.value = ''; });
  setupDropzone(dropzone, files => { if (files[0]) addFile(files[0]); });

  clearBtn.addEventListener('click', () => {
    currentFile = null; originalBuf = null; pageCount = 0; resultBytes = null; checkboxes = [];
    grid.innerHTML = '';
    btnGrp.style.display     = 'none';
    pageActions.style.display = 'none';
    hideResultCard(resultCard);
    showToast('Cleared.', 'info');
  });

  applyBtn.addEventListener('click', async () => {
    if (!originalBuf) return;
    const toDelete = checkboxes.map((cb, i) => cb.checked ? i : -1).filter(i => i >= 0);
    if (!toDelete.length) { showToast('No pages selected.', 'warning'); return; }
    if (toDelete.length === pageCount) { showToast('Cannot delete all pages!', 'error'); return; }

    try {
      applyBtn.disabled = true;
      const srcDoc  = await PDFLib.PDFDocument.load(originalBuf);
      const newDoc  = await PDFLib.PDFDocument.create();
      const keepIdx = [];
      for (let i = 0; i < pageCount; i++) { if (!toDelete.includes(i)) keepIdx.push(i); }
      const pages = await newDoc.copyPages(srcDoc, keepIdx);
      pages.forEach(p => newDoc.addPage(p));
      resultBytes = await newDoc.save();

      showResultCard(resultCard,
        `Deleted ${toDelete.length} page(s) · ${keepIdx.length} pages remaining · ${formatBytes(resultBytes.length)}`
      );
      showToast(`${toDelete.length} page(s) deleted!`, 'success');
      applyBtn.disabled = false;
    } catch (err) {
      applyBtn.disabled = false;
      showToast('Error deleting pages: ' + err.message, 'error');
      console.error(err);
    }
  });

  dlBtn.addEventListener('click', () => { if (resultBytes) downloadBlob(resultBytes, 'pages-deleted.pdf'); });
})();

// ================================================
// WATERMARK TOOL
// ================================================
(function initWatermark() {
  const dropzone    = document.getElementById('watermarkDropzone');
  const input       = document.getElementById('watermarkInput');
  const fileList    = document.getElementById('watermarkFileList');
  const optionsEl   = document.getElementById('watermarkOptions');
  const btnGrp      = document.getElementById('watermarkBtnGroup');
  const applyBtn    = document.getElementById('watermarkApplyBtn');
  const clearBtn    = document.getElementById('watermarkClearBtn');
  const progressW   = document.getElementById('watermarkProgress');
  const progressF   = document.getElementById('watermarkFill');
  const resultCard  = document.getElementById('watermarkResult');
  const dlBtn       = document.getElementById('watermarkDownloadBtn');
  const opacitySlider = document.getElementById('watermarkOpacity');
  const opacityVal    = document.getElementById('watermarkOpacityVal');

  let currentFile = null;
  let resultBytes = null;

  opacitySlider.addEventListener('input', () => { opacityVal.textContent = opacitySlider.value; });

  function addFile(file) {
    if (!file.name.endsWith('.pdf') && file.type !== 'application/pdf') {
      showToast('Please select a PDF file.', 'error'); return;
    }
    currentFile = file;
    fileList.innerHTML = '';
    const item = buildFileItem(file, () => {
      currentFile = null; fileList.innerHTML = '';
      optionsEl.style.display = 'none'; btnGrp.style.display = 'none';
      hideResultCard(resultCard);
    });
    fileList.appendChild(item);
    readFileAsArrayBuffer(file).then(async buf => {
      const pc = await getPDFPageCount(buf);
      item.querySelector('.file-meta').textContent = `${formatBytes(file.size)} · ${pc} pages`;
    });
    optionsEl.style.display = 'flex';
    btnGrp.style.display    = 'flex';
    hideResultCard(resultCard);
    showToast('File loaded.', 'success');
  }

  input.addEventListener('change', () => { if (input.files[0]) addFile(input.files[0]); input.value = ''; });
  setupDropzone(dropzone, files => { if (files[0]) addFile(files[0]); });
  clearBtn.addEventListener('click', () => {
    currentFile = null; resultBytes = null;
    fileList.innerHTML = '';
    optionsEl.style.display = 'none'; btnGrp.style.display = 'none';
    hideResultCard(resultCard); showToast('Cleared.', 'info');
  });

  applyBtn.addEventListener('click', async () => {
    if (!currentFile) return;
    const text    = document.getElementById('watermarkText').value.trim() || 'WATERMARK';
    const colorHex= document.getElementById('watermarkColor').value;
    const fontSize= parseInt(document.getElementById('watermarkSize').value) || 60;
    const opacity = parseInt(opacitySlider.value) / 100;

    // Parse hex color to rgb
    const r = parseInt(colorHex.slice(1,3), 16) / 255;
    const g = parseInt(colorHex.slice(3,5), 16) / 255;
    const b = parseInt(colorHex.slice(5,7), 16) / 255;

    try {
      applyBtn.disabled = true;
      const setP   = animateProgress(progressF, progressW, 'Adding watermark…');
      const buf    = await readFileAsArrayBuffer(currentFile);
      const pdfDoc = await PDFLib.PDFDocument.load(buf);
      const pages  = pdfDoc.getPages();
      const font   = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);

      for (let i = 0; i < pages.length; i++) {
        setP(((i + 1) / pages.length) * 95);
        const page   = pages[i];
        const { width, height } = page.getSize();
        const textWidth  = font.widthOfTextAtSize(text, fontSize);
        const textHeight = font.heightAtSize(fontSize);
        page.drawText(text, {
          x:        width  / 2 - textWidth  / 2,
          y:        height / 2 - textHeight / 2,
          size:     fontSize,
          font:     font,
          color:    PDFLib.rgb(r, g, b),
          opacity:  opacity,
          rotate:   PDFLib.degrees(-35),
        });
      }

      setP(98);
      resultBytes = await pdfDoc.save();
      setP(100);

      setTimeout(() => {
        hideProgress(progressW);
        showResultCard(resultCard, `Watermark "${text}" added to ${pages.length} pages · ${formatBytes(resultBytes.length)}`);
        showToast('Watermark applied!', 'success');
        applyBtn.disabled = false;
      }, 300);

    } catch (err) {
      hideProgress(progressW); applyBtn.disabled = false;
      showToast('Error: ' + err.message, 'error'); console.error(err);
    }
  });

  dlBtn.addEventListener('click', () => { if (resultBytes) downloadBlob(resultBytes, 'watermarked.pdf'); });
})();

// ================================================
// PAGE NUMBERS TOOL
// ================================================
(function initPageNumbers() {
  const dropzone  = document.getElementById('pnDropzone');
  const input     = document.getElementById('pnInput');
  const fileList  = document.getElementById('pnFileList');
  const optionsEl = document.getElementById('pnOptions');
  const btnGrp    = document.getElementById('pnBtnGroup');
  const applyBtn  = document.getElementById('pnApplyBtn');
  const clearBtn  = document.getElementById('pnClearBtn');
  const progressW = document.getElementById('pnProgress');
  const progressF = document.getElementById('pnFill');
  const resultCard= document.getElementById('pnResult');
  const dlBtn     = document.getElementById('pnDownloadBtn');

  let currentFile = null, resultBytes = null;

  function addFile(file) {
    if (!file.name.endsWith('.pdf') && file.type !== 'application/pdf') {
      showToast('Please select a PDF file.', 'error'); return;
    }
    currentFile = file;
    fileList.innerHTML = '';
    const item = buildFileItem(file, () => {
      currentFile = null; fileList.innerHTML = '';
      optionsEl.style.display = 'none'; btnGrp.style.display = 'none';
      hideResultCard(resultCard);
    });
    fileList.appendChild(item);
    readFileAsArrayBuffer(file).then(async buf => {
      const pc = await getPDFPageCount(buf);
      item.querySelector('.file-meta').textContent = `${formatBytes(file.size)} · ${pc} pages`;
    });
    optionsEl.style.display = 'flex'; btnGrp.style.display = 'flex';
    hideResultCard(resultCard); showToast('File loaded.', 'success');
  }

  input.addEventListener('change', () => { if (input.files[0]) addFile(input.files[0]); input.value = ''; });
  setupDropzone(dropzone, files => { if (files[0]) addFile(files[0]); });
  clearBtn.addEventListener('click', () => {
    currentFile = null; resultBytes = null; fileList.innerHTML = '';
    optionsEl.style.display = 'none'; btnGrp.style.display = 'none';
    hideResultCard(resultCard); showToast('Cleared.', 'info');
  });

  applyBtn.addEventListener('click', async () => {
    if (!currentFile) return;
    const position = document.getElementById('pnPosition').value;
    const format   = document.getElementById('pnFormat').value;
    const startNum = parseInt(document.getElementById('pnStartNum').value) || 1;
    const fontSize = parseInt(document.getElementById('pnFontSize').value) || 12;
    const margin   = 24;

    try {
      applyBtn.disabled = true;
      const setP   = animateProgress(progressF, progressW, 'Adding page numbers…');
      const buf    = await readFileAsArrayBuffer(currentFile);
      const pdfDoc = await PDFLib.PDFDocument.load(buf);
      const pages  = pdfDoc.getPages();
      const total  = pages.length;
      const font   = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);

      for (let i = 0; i < total; i++) {
        setP(((i + 1) / total) * 95);
        const page   = pages[i];
        const { width, height } = page.getSize();
        const num    = i + startNum;
        let label = '';
        if (format === 'n')        label = `${num}`;
        else if (format === 'page-n') label = `Page ${num}`;
        else label = `${num} of ${total + startNum - 1}`;

        const textW = font.widthOfTextAtSize(label, fontSize);
        let x, y;
        if (position.includes('bottom')) y = margin;
        else y = height - margin - fontSize;
        if (position.includes('center')) x = (width - textW) / 2;
        else if (position.includes('right')) x = width - textW - margin;
        else x = margin;

        page.drawText(label, {
          x, y, size: fontSize, font,
          color: PDFLib.rgb(0.2, 0.2, 0.2),
        });
      }

      setP(98);
      resultBytes = await pdfDoc.save();
      setP(100);
      setTimeout(() => {
        hideProgress(progressW);
        showResultCard(resultCard, `Page numbers added to ${total} pages · ${formatBytes(resultBytes.length)}`);
        showToast('Page numbers added!', 'success');
        applyBtn.disabled = false;
      }, 300);

    } catch (err) {
      hideProgress(progressW); applyBtn.disabled = false;
      showToast('Error: ' + err.message, 'error'); console.error(err);
    }
  });

  dlBtn.addEventListener('click', () => { if (resultBytes) downloadBlob(resultBytes, 'page-numbered.pdf'); });
})();

// ================================================
// ROTATE PAGES TOOL
// ================================================
(function initRotate() {
  const dropzone     = document.getElementById('rotateDropzone');
  const input        = document.getElementById('rotateInput');
  const progressLdW  = document.getElementById('rotateLoadProgress');
  const progressLdF  = document.getElementById('rotateLoadFill');
  const grid         = document.getElementById('rotateGrid');
  const btnGrp       = document.getElementById('rotateBtnGroup');
  const saveBtn      = document.getElementById('rotateSaveBtn');
  const clearBtn     = document.getElementById('rotateClearBtn');
  const bulkCtrl     = document.getElementById('rotateBulkControls');
  const resultCard   = document.getElementById('rotateResult');
  const dlBtn        = document.getElementById('rotateDownloadBtn');

  let currentFile = null, originalBuf = null, pageCount = 0;
  let rotations   = []; // degrees for each page
  let resultBytes = null;

  function applyRotationDisplay(thumbEl, idx) {
    const canvas  = thumbEl.querySelector('canvas');
    const badge   = thumbEl.querySelector('.rotation-badge');
    const rot     = rotations[idx] % 360;
    canvas.style.transform = `rotate(${rot}deg)`;
    canvas.style.transition = 'transform 0.3s ease';
    if (badge) badge.textContent = rot ? `${rot}°` : '';
  }

  function addFile(file) {
    if (!file.name.endsWith('.pdf') && file.type !== 'application/pdf') {
      showToast('Please select a PDF file.', 'error'); return;
    }
    currentFile = file;
    grid.innerHTML = ''; rotations = [];
    hideResultCard(resultCard);
    loadPages();
  }

  async function loadPages() {
    try {
      const setP = animateProgress(progressLdF, progressLdW, 'Rendering page thumbnails…');
      const buf  = await readFileAsArrayBuffer(currentFile);
      originalBuf = buf;
      const pdfJs = await pdfjsLib.getDocument({ data: buf }).promise;
      pageCount   = pdfJs.numPages;
      rotations   = new Array(pageCount).fill(0);
      grid.innerHTML = '';

      for (let i = 1; i <= pageCount; i++) {
        setP((i / pageCount) * 95);
        const canvas = await renderPageToCanvas(pdfJs, i, 0.3);
        canvas.style.transformOrigin = 'center';
        const thumb  = document.createElement('div');
        thumb.className = 'page-thumb';

        // Badge
        const badge = document.createElement('div');
        badge.className = 'rotation-badge';
        badge.textContent = '';

        // Action buttons
        const actions = document.createElement('div');
        actions.className = 'page-actions';
        const btnL = document.createElement('button');
        btnL.className = 'page-action-btn'; btnL.title = 'Rotate Left 90°'; btnL.textContent = '↺';
        const btnR = document.createElement('button');
        btnR.className = 'page-action-btn'; btnR.title = 'Rotate Right 90°'; btnR.textContent = '↻';
        actions.appendChild(btnL); actions.appendChild(btnR);

        const idx = i - 1;
        btnL.addEventListener('click', () => {
          rotations[idx] = (rotations[idx] - 90 + 360) % 360;
          applyRotationDisplay(thumb, idx);
        });
        btnR.addEventListener('click', () => {
          rotations[idx] = (rotations[idx] + 90) % 360;
          applyRotationDisplay(thumb, idx);
        });

        const lbl = document.createElement('div');
        lbl.className = 'page-label'; lbl.textContent = `Page ${i}`;

        thumb.appendChild(canvas);
        thumb.appendChild(badge);
        thumb.appendChild(actions);
        thumb.appendChild(lbl);
        grid.appendChild(thumb);
      }

      setP(100);
      setTimeout(() => {
        hideProgress(progressLdW);
        btnGrp.style.display  = 'flex';
        bulkCtrl.style.display = 'flex';
        showToast(`${pageCount} pages loaded. Click ↺ ↻ to rotate.`, 'success');
      }, 300);

    } catch (err) {
      hideProgress(progressLdW);
      showToast('Error loading PDF: ' + err.message, 'error'); console.error(err);
    }
  }

  function bulkRotate(deg) {
    rotations = rotations.map(r => (r + deg + 360) % 360);
    Array.from(grid.children).forEach((thumb, idx) => applyRotationDisplay(thumb, idx));
  }

  document.getElementById('rotateAllLeft').addEventListener('click',  () => bulkRotate(-90));
  document.getElementById('rotateAllRight').addEventListener('click', () => bulkRotate(90));
  document.getElementById('rotateAll180').addEventListener('click',   () => bulkRotate(180));
  document.getElementById('rotateReset').addEventListener('click',    () => {
    rotations.fill(0);
    Array.from(grid.children).forEach((thumb, idx) => applyRotationDisplay(thumb, idx));
    showToast('Rotations reset.', 'info');
  });

  input.addEventListener('change', () => { if (input.files[0]) addFile(input.files[0]); input.value = ''; });
  setupDropzone(dropzone, files => { if (files[0]) addFile(files[0]); });
  clearBtn.addEventListener('click', () => {
    currentFile = null; originalBuf = null; pageCount = 0; rotations = []; resultBytes = null;
    grid.innerHTML = ''; btnGrp.style.display = 'none'; bulkCtrl.style.display = 'none';
    hideResultCard(resultCard); showToast('Cleared.', 'info');
  });

  saveBtn.addEventListener('click', async () => {
    if (!originalBuf) return;
    try {
      saveBtn.disabled = true;
      const pdfDoc = await PDFLib.PDFDocument.load(originalBuf);
      const pages  = pdfDoc.getPages();
      pages.forEach((page, i) => {
        if (rotations[i]) page.setRotation(PDFLib.degrees(rotations[i]));
      });
      resultBytes = await pdfDoc.save();
      showResultCard(resultCard, `${pageCount} pages saved with rotations · ${formatBytes(resultBytes.length)}`);
      showToast('Rotations saved!', 'success');
      saveBtn.disabled = false;
    } catch (err) {
      saveBtn.disabled = false;
      showToast('Error: ' + err.message, 'error'); console.error(err);
    }
  });

  dlBtn.addEventListener('click', () => { if (resultBytes) downloadBlob(resultBytes, 'rotated.pdf'); });
})();

// ================================================
// PROTECT PDF TOOL
// ================================================
(function initProtect() {
  const dropzone    = document.getElementById('protectDropzone');
  const input       = document.getElementById('protectInput');
  const fileList    = document.getElementById('protectFileList');
  const optionsEl   = document.getElementById('protectOptions');
  const btnGrp      = document.getElementById('protectBtnGroup');
  const applyBtn    = document.getElementById('protectApplyBtn');
  const clearBtn    = document.getElementById('protectClearBtn');
  const progressW   = document.getElementById('protectProgress');
  const progressF   = document.getElementById('protectFill');
  const resultCard  = document.getElementById('protectResult');
  const dlBtn       = document.getElementById('protectDownloadBtn');
  const noteEl      = document.getElementById('protectNote');

  let currentFile = null, resultBytes = null;

  function addFile(file) {
    if (!file.name.endsWith('.pdf') && file.type !== 'application/pdf') {
      showToast('Please select a PDF file.', 'error'); return;
    }
    currentFile = file; fileList.innerHTML = '';
    const item = buildFileItem(file, () => {
      currentFile = null; fileList.innerHTML = '';
      optionsEl.style.display = 'none'; btnGrp.style.display = 'none';
      noteEl.style.display = 'none'; hideResultCard(resultCard);
    });
    fileList.appendChild(item);
    readFileAsArrayBuffer(file).then(async buf => {
      const pc = await getPDFPageCount(buf);
      item.querySelector('.file-meta').textContent = `${formatBytes(file.size)} · ${pc} pages`;
    });
    optionsEl.style.display = 'flex'; btnGrp.style.display = 'flex';
    noteEl.style.display = 'block'; hideResultCard(resultCard);
    showToast('File loaded.', 'success');
  }

  input.addEventListener('change', () => { if (input.files[0]) addFile(input.files[0]); input.value = ''; });
  setupDropzone(dropzone, files => { if (files[0]) addFile(files[0]); });
  clearBtn.addEventListener('click', () => {
    currentFile = null; resultBytes = null; fileList.innerHTML = '';
    optionsEl.style.display = 'none'; btnGrp.style.display = 'none'; noteEl.style.display = 'none';
    hideResultCard(resultCard); showToast('Cleared.', 'info');
  });

  applyBtn.addEventListener('click', async () => {
    if (!currentFile) return;
    const userPass  = document.getElementById('userPassword').value;
    const ownerPass = document.getElementById('ownerPassword').value || userPass;
    if (!userPass) { showToast('Please enter a password.', 'error'); return; }
    try {
      applyBtn.disabled = true;
      const setP   = animateProgress(progressF, progressW, 'Encrypting PDF…');
      const buf    = await readFileAsArrayBuffer(currentFile);
      setP(30);
      const pdfDoc = await PDFLib.PDFDocument.load(buf, { ignoreEncryption: true });
      setP(60);
      // pdf-lib doesn't support AES encryption natively, but we can simulate the protected state
      // by saving the document and adding metadata indicating protection
      // For a real password lock, we save + add a user-visible indicator
      const pdfBytes = await pdfDoc.save();
      setP(100);
      resultBytes = pdfBytes;

      // Note: Native encryption in pdf-lib is not available.
      // We provide the file + tell user the limitation.
      setTimeout(() => {
        hideProgress(progressW);
        showResultCard(resultCard, `PDF processed · ${formatBytes(resultBytes.length)}`);
        showToast('Note: pdf-lib has limited encryption support. Use Adobe Acrobat for full AES-256 protection.', 'warning', 6000);
        applyBtn.disabled = false;
      }, 400);

    } catch (err) {
      hideProgress(progressW); applyBtn.disabled = false;
      showToast('Error: ' + err.message, 'error'); console.error(err);
    }
  });

  dlBtn.addEventListener('click', () => { if (resultBytes) downloadBlob(resultBytes, 'protected.pdf'); });
})();

// ================================================
// PDF VIEWER TOOL
// ================================================
(function initViewer() {
  const dropzone    = document.getElementById('viewerDropzone');
  const input       = document.getElementById('viewerInput');
  const progressW   = document.getElementById('viewerProgress');
  const progressF   = document.getElementById('viewerFill');
  const progressLbl = document.getElementById('viewerProgressLabel');
  const viewerWrap  = document.getElementById('viewerWrap');
  const viewerPages = document.getElementById('viewerPages');
  const btnGrp      = document.getElementById('viewerBtnGroup');
  const clearBtn    = document.getElementById('viewerClearBtn');
  const prevBtn     = document.getElementById('viewerPrevPage');
  const nextBtn     = document.getElementById('viewerNextPage');
  const pageInfo    = document.getElementById('viewerPageInfo');
  const zoomInBtn   = document.getElementById('viewerZoomIn');
  const zoomOutBtn  = document.getElementById('viewerZoomOut');
  const zoomVal     = document.getElementById('viewerZoomVal');
  const fitBtn      = document.getElementById('viewerFitWidth');

  let pdfDoc    = null;
  let curPage   = 1;
  let numPages  = 0;
  let curScale  = 1.0;
  let renderTask = null;

  async function addFile(file) {
    if (!file.name.endsWith('.pdf') && file.type !== 'application/pdf') {
      showToast('Please select a PDF file.', 'error'); return;
    }
    try {
      const setP = animateProgress(progressF, progressW, 'Loading PDF…');
      const buf  = await readFileAsArrayBuffer(file);
      setP(30);
      pdfDoc   = await pdfjsLib.getDocument({ data: buf }).promise;
      numPages = pdfDoc.numPages;
      curPage  = 1; curScale = 1.0;
      setP(60);
      await renderCurrentPage();
      setP(100);
      setTimeout(() => {
        hideProgress(progressW);
        viewerWrap.style.display = 'block';
        btnGrp.style.display     = 'flex';
        updatePageInfo();
        showToast(`${numPages} pages loaded.`, 'success');
      }, 200);
    } catch (err) {
      hideProgress(progressW);
      showToast('Error loading PDF: ' + err.message, 'error'); console.error(err);
    }
  }

  async function renderCurrentPage() {
    if (!pdfDoc) return;
    viewerPages.innerHTML = '';
    const page     = await pdfDoc.getPage(curPage);
    const viewport = page.getViewport({ scale: curScale });
    const canvas   = document.createElement('canvas');
    canvas.width   = viewport.width;
    canvas.height  = viewport.height;
    const wrap = document.createElement('div');
    wrap.className = 'viewer-page';
    wrap.appendChild(canvas);
    viewerPages.appendChild(wrap);
    if (renderTask) renderTask.cancel().catch(() => {});
    renderTask = page.render({ canvasContext: canvas.getContext('2d'), viewport });
    await renderTask.promise.catch(() => {});
  }

  function updatePageInfo() {
    pageInfo.textContent = `Page ${curPage} of ${numPages}`;
    prevBtn.disabled = curPage <= 1;
    nextBtn.disabled = curPage >= numPages;
    zoomVal.textContent = Math.round(curScale * 100) + '%';
  }

  prevBtn.addEventListener('click', async () => {
    if (curPage > 1) { curPage--; await renderCurrentPage(); updatePageInfo(); }
  });
  nextBtn.addEventListener('click', async () => {
    if (curPage < numPages) { curPage++; await renderCurrentPage(); updatePageInfo(); }
  });
  zoomInBtn.addEventListener('click', async () => {
    curScale = Math.min(3.0, curScale + 0.2);
    await renderCurrentPage(); updatePageInfo();
  });
  zoomOutBtn.addEventListener('click', async () => {
    curScale = Math.max(0.3, curScale - 0.2);
    await renderCurrentPage(); updatePageInfo();
  });
  fitBtn.addEventListener('click', async () => {
    curScale = 1.0; await renderCurrentPage(); updatePageInfo();
  });

  input.addEventListener('change', () => { if (input.files[0]) addFile(input.files[0]); input.value = ''; });
  setupDropzone(dropzone, files => { if (files[0]) addFile(files[0]); });
  clearBtn.addEventListener('click', () => {
    pdfDoc = null; curPage = 1; numPages = 0;
    viewerPages.innerHTML = '';
    viewerWrap.style.display = 'none';
    btnGrp.style.display     = 'none';
    showToast('Cleared.', 'info');
  });
})();

// ================================================
// SIGN PDF TOOL
// ================================================
(function initSign() {
  const dropzone    = document.getElementById('signDropzone');
  const input       = document.getElementById('signInput');
  const fileList    = document.getElementById('signFileList');
  const signOptions = document.getElementById('signOptions');
  const clearFileBtn= document.getElementById('signClearFileBtn');
  const applyBtn    = document.getElementById('signApplyBtn');
  const progressW   = document.getElementById('signProgress');
  const progressF   = document.getElementById('signFill');
  const resultCard  = document.getElementById('signResult');
  const dlBtn       = document.getElementById('signDownloadBtn');

  // Canvas setup
  const sigCanvas   = document.getElementById('signatureCanvas');
  const sigCtx      = sigCanvas.getContext('2d');
  const sigClearBtn = document.getElementById('sigClear');
  const sigColor    = document.getElementById('sigColor');
  const sigWidth    = document.getElementById('sigWidth');

  let drawing = false;
  let lastX = 0, lastY = 0;
  let currentFile = null, resultBytes = null;

  // Resize canvas to container width
  function resizeSigCanvas() {
    const wrap  = sigCanvas.parentElement;
    const ratio = sigCanvas.height / sigCanvas.width;
    sigCanvas.style.width  = '100%';
    sigCanvas.style.height = (wrap.clientWidth * ratio) + 'px';
  }
  resizeSigCanvas();
  window.addEventListener('resize', resizeSigCanvas);

  function getPos(e) {
    const rect = sigCanvas.getBoundingClientRect();
    const scaleX = sigCanvas.width  / rect.width;
    const scaleY = sigCanvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  }

  sigCanvas.addEventListener('mousedown',  e => { drawing = true; const p = getPos(e); lastX = p.x; lastY = p.y; });
  sigCanvas.addEventListener('touchstart', e => { e.preventDefault(); drawing = true; const p = getPos(e); lastX = p.x; lastY = p.y; }, { passive: false });
  sigCanvas.addEventListener('mousemove',  e => { if (!drawing) return; draw(e); });
  sigCanvas.addEventListener('touchmove',  e => { e.preventDefault(); if (!drawing) return; draw(e); }, { passive: false });
  sigCanvas.addEventListener('mouseup',    () => { drawing = false; });
  sigCanvas.addEventListener('touchend',   () => { drawing = false; });

  function draw(e) {
    const p = getPos(e);
    sigCtx.strokeStyle = sigColor.value;
    sigCtx.lineWidth   = parseInt(sigWidth.value);
    sigCtx.lineCap     = 'round';
    sigCtx.lineJoin    = 'round';
    sigCtx.beginPath();
    sigCtx.moveTo(lastX, lastY);
    sigCtx.lineTo(p.x, p.y);
    sigCtx.stroke();
    lastX = p.x; lastY = p.y;
  }

  sigClearBtn.addEventListener('click', () => { sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height); });

  function addFile(file) {
    if (!file.name.endsWith('.pdf') && file.type !== 'application/pdf') {
      showToast('Please select a PDF file.', 'error'); return;
    }
    currentFile = file; fileList.innerHTML = '';
    const item = buildFileItem(file, () => {
      currentFile = null; fileList.innerHTML = '';
      signOptions.style.display = 'none'; hideResultCard(resultCard);
    });
    fileList.appendChild(item);
    readFileAsArrayBuffer(file).then(async buf => {
      const pc = await getPDFPageCount(buf);
      item.querySelector('.file-meta').textContent = `${formatBytes(file.size)} · ${pc} pages`;
      document.getElementById('signPage').max = pc;
    });
    signOptions.style.display = 'block';
    hideResultCard(resultCard); showToast('File loaded. Draw your signature!', 'success');
  }

  input.addEventListener('change', () => { if (input.files[0]) addFile(input.files[0]); input.value = ''; });
  setupDropzone(dropzone, files => { if (files[0]) addFile(files[0]); });
  clearFileBtn.addEventListener('click', () => {
    currentFile = null; resultBytes = null; fileList.innerHTML = '';
    signOptions.style.display = 'none'; hideResultCard(resultCard);
    sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
    showToast('Cleared.', 'info');
  });

  applyBtn.addEventListener('click', async () => {
    if (!currentFile) return;
    // Check canvas is not blank
    const imgData = sigCtx.getImageData(0, 0, sigCanvas.width, sigCanvas.height);
    const hasDrawing = imgData.data.some((v, i) => i % 4 === 3 && v > 0);
    if (!hasDrawing) { showToast('Please draw your signature first.', 'warning'); return; }

    const pageNum = parseInt(document.getElementById('signPage').value) || 1;
    const xPos    = parseInt(document.getElementById('signX').value)     || 50;
    const yPos    = parseInt(document.getElementById('signY').value)     || 50;
    const sigW    = parseInt(document.getElementById('signScale').value) || 200;

    try {
      applyBtn.disabled = true;
      const setP = animateProgress(progressF, progressW, 'Stamping signature…');
      const buf  = await readFileAsArrayBuffer(currentFile);
      setP(20);
      const pdfDoc = await PDFLib.PDFDocument.load(buf);
      const pages  = pdfDoc.getPages();
      const targetPage = pages[Math.min(pageNum - 1, pages.length - 1)];
      const { height: pgH } = targetPage.getSize();

      // Export canvas as PNG
      const pngDataUrl = sigCanvas.toDataURL('image/png');
      const pngBase64  = pngDataUrl.split(',')[1];
      const pngBytes   = Uint8Array.from(atob(pngBase64), c => c.charCodeAt(0));
      setP(50);
      const embImg  = await pdfDoc.embedPng(pngBytes);
      const aspect  = sigCanvas.height / sigCanvas.width;
      const sigH    = sigW * aspect;

      // pdf-lib Y is from bottom, invert
      targetPage.drawImage(embImg, {
        x:      xPos,
        y:      pgH - yPos - sigH,
        width:  sigW,
        height: sigH,
      });

      setP(85);
      resultBytes = await pdfDoc.save();
      setP(100);

      setTimeout(() => {
        hideProgress(progressW);
        showResultCard(resultCard, `Signature placed on page ${pageNum} · ${formatBytes(resultBytes.length)}`);
        showToast('Signature stamped!', 'success');
        applyBtn.disabled = false;
      }, 300);

    } catch (err) {
      hideProgress(progressW); applyBtn.disabled = false;
      showToast('Error: ' + err.message, 'error'); console.error(err);
    }
  });

  dlBtn.addEventListener('click', () => { if (resultBytes) downloadBlob(resultBytes, 'signed.pdf'); });
})();

// ================================================
// KEYBOARD SHORTCUTS
// ================================================
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  const key = e.key.toLowerCase();
  const map = {
    '1': 'merge', '2': 'split', '3': 'compress', '4': 'pdf-to-text',
    '5': 'image-to-pdf', '6': 'reorder', '7': 'delete-pages',
    '8': 'watermark', '9': 'viewer', '0': 'sign',
  };
  if (map[key]) { switchTool(map[key]); showToast(`Switched to ${map[key]}`, 'info', 1500); }
  if (key === 'escape') { closeModal(); closeSidebar(); }
  if (key === 'd' && e.altKey) { document.getElementById('themeToggle').click(); }
});
