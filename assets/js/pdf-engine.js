window.PdfEngine = {
  initPdfJs() {
    if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }
  },

  async loadPdfDocument(arrayBuffer) {
    this.initPdfJs();
    const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer.slice(0) });
    return loadingTask.promise;
  },

  async renderPageToCanvas(pdfDoc, pageNumber, canvas, scale = 1.35) {
    const page = await pdfDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale });
    const context = canvas.getContext("2d");

    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    await page.render({ canvasContext: context, viewport }).promise;
    return {
      width: canvas.width,
      height: canvas.height,
      pdfWidth: page.getViewport({ scale: 1 }).width,
      pdfHeight: page.getViewport({ scale: 1 }).height
    };
  },

  hexToRgbNormalized(hex) {
    const clean = (hex || "#000000").replace("#", "");
    const num = parseInt(clean.length === 3 ? clean.replace(/(.)/g, "$1$1") : clean, 16);
    return {
      r: ((num >> 16) & 255) / 255,
      g: ((num >> 8) & 255) / 255,
      b: (num & 255) / 255
    };
  },

  downloadBytes(bytes, filename, mime = "application/pdf") {
    const blob = new Blob([bytes], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
};
