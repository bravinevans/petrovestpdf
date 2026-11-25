window.SITE_CONFIG = {
  BRAND: {
    name: "Petrovest",
    accent: "PDF",
    fullName: "Petrovest PDF",
    tagline: "All-in-One Visual PDF Suite",
    domain: "petrovest.top",
    footerNote: "100% browser-based PDF tools. Your files stay private on your device — zero uploads, zero paywalls."
  },

  CATEGORIES: [
    { id: "all", label: "All Tools" },
    { id: "edit", label: "Edit & Sign" },
    { id: "organize", label: "Organize PDF" },
    { id: "optimize", label: "Optimize" },
    { id: "convert", label: "Convert" }
  ],

  TOOLS: [
    {
      key: "edit-pdf",
      title: "Edit PDF",
      category: "edit",
      badge: "Sejda-Style",
      icon: "bi-pencil-square",
      color: "bg-red-50 text-[#e5322d] border-red-200",
      description: "Add text, whiteout existing content, draw signatures, insert images, and highlight directly on your PDF pages.",
      url: "/tools/edit-pdf.html",
      accept: ".pdf"
    },
    {
      key: "merge-pdf",
      title: "Merge PDF",
      category: "organize",
      badge: "Organize",
      icon: "bi-files",
      color: "bg-red-50 text-[#e5322d] border-red-200",
      description: "Combine multiple PDF files in the exact visual order you want with live page previews.",
      url: "/tools/merge-pdf.html",
      accept: ".pdf"
    },
    {
      key: "split-pdf",
      title: "Split PDF",
      category: "organize",
      badge: "Organize",
      icon: "bi-layout-split",
      color: "bg-red-50 text-[#e5322d] border-red-200",
      description: "Visually click pages or enter page ranges to extract or split into separate PDF files.",
      url: "/tools/split-pdf.html",
      accept: ".pdf"
    },
    {
      key: "organize-pdf",
      title: "Organize PDF",
      category: "organize",
      badge: "Organize",
      icon: "bi-grid-1x2",
      color: "bg-red-50 text-[#e5322d] border-red-200",
      description: "Drag and drop page thumbnails to reorder, duplicate, rotate, or delete pages visually.",
      url: "/tools/organize-pdf.html",
      accept: ".pdf"
    },
    {
      key: "rotate-pdf",
      title: "Rotate PDF",
      category: "organize",
      badge: "Organize",
      icon: "bi-arrow-clockwise",
      color: "bg-red-50 text-[#e5322d] border-red-200",
      description: "Rotate individual pages or your entire PDF document permanently with instant visual preview.",
      url: "/tools/rotate-pdf.html",
      accept: ".pdf"
    },
    {
      key: "delete-pages",
      title: "Delete PDF Pages",
      category: "organize",
      badge: "Organize",
      icon: "bi-file-earmark-x",
      color: "bg-red-50 text-[#e5322d] border-red-200",
      description: "Click unwanted pages in the visual grid to remove them and save a clean PDF.",
      url: "/tools/delete-pages.html",
      accept: ".pdf"
    },
    {
      key: "page-numbers",
      title: "Add Page Numbers",
      category: "edit",
      badge: "Edit",
      icon: "bi-123",
      color: "bg-purple-50 text-purple-600 border-purple-200",
      description: "Stamp customizable page numbers onto your PDF with live position and format preview.",
      url: "/tools/page-numbers.html",
      accept: ".pdf"
    },
    {
      key: "watermark-pdf",
      title: "Watermark PDF",
      category: "edit",
      badge: "Edit",
      icon: "bi-stamp",
      color: "bg-purple-50 text-purple-600 border-purple-200",
      description: "Overlay custom text watermarks with live preview of angle, size, color, and opacity.",
      url: "/tools/watermark-pdf.html",
      accept: ".pdf"
    },
    {
      key: "compress-pdf",
      title: "Compress PDF",
      category: "optimize",
      badge: "Optimize",
      icon: "bi-arrows-angle-contract",
      color: "bg-emerald-50 text-emerald-600 border-emerald-200",
      description: "Optimize and shrink PDF file size right in your browser while preserving readability.",
      url: "/tools/compress-pdf.html",
      accept: ".pdf"
    },
    {
      key: "jpg-to-pdf",
      title: "JPG / PNG to PDF",
      category: "convert",
      badge: "To PDF",
      icon: "bi-file-earmark-image",
      color: "bg-amber-50 text-amber-600 border-amber-200",
      description: "Convert JPG, PNG, and WebP images to PDF with custom page size, orientation, and margins.",
      url: "/tools/jpg-to-pdf.html",
      accept: ".jpg,.jpeg,.png,.webp"
    },
    {
      key: "pdf-to-jpg",
      title: "PDF to JPG",
      category: "convert",
      badge: "From PDF",
      icon: "bi-file-image",
      color: "bg-blue-50 text-blue-600 border-blue-200",
      description: "Render each PDF page into high-resolution JPG images and download individually or as a ZIP.",
      url: "/tools/pdf-to-jpg.html",
      accept: ".pdf"
    },
    {
      key: "pdf-to-text",
      title: "PDF to Text",
      category: "convert",
      badge: "From PDF",
      icon: "bi-file-text",
      color: "bg-slate-100 text-slate-700 border-slate-200",
      description: "Extract readable text from any PDF document directly in your browser and save as TXT.",
      url: "/tools/pdf-to-text.html",
      accept: ".pdf"
    }
  ],

  mountChrome(activeKey = null) {
    const { BRAND, TOOLS } = this;
    document.title = document.title.replace(/Petrovest PDF/g, BRAND.fullName);

    const headerEl = document.getElementById("app-header");
    if (headerEl) {
      const quickLinks = ["edit-pdf", "merge-pdf", "split-pdf", "compress-pdf"]
        .map((k) => TOOLS.find((t) => t.key === k))
        .filter(Boolean);

      headerEl.innerHTML = `
        <header class="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <a href="/index.html" class="inline-flex items-center gap-2.5 text-decoration-none">
              <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e5322d] text-white shadow-sm">
                <i class="bi bi-file-earmark-pdf-fill text-lg"></i>
              </span>
              <span class="flex flex-col leading-none">
                <span class="text-lg font-extrabold tracking-tight text-slate-900">
                  ${BRAND.name}<span class="text-[#e5322d]">${BRAND.accent}</span>
                </span>
                <span class="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">${BRAND.tagline}</span>
              </span>
            </a>

            <nav class="hidden items-center gap-1 md:flex" aria-label="Main navigation">
              ${quickLinks
                .map(
                  (t) => `
                <a href="${t.url}" class="rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wide transition ${
                  activeKey === t.key ? "bg-red-50 text-[#e5322d]" : "text-slate-700 hover:bg-red-50 hover:text-[#e5322d]"
                }">${t.title}</a>`
                )
                .join("")}
              <a href="/index.html#tools" class="ml-1 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-[#e5322d]">
                <i class="bi bi-grid-3x3-gap-fill"></i> All Tools (${TOOLS.length})
              </a>
            </nav>

            <a href="/tools/edit-pdf.html" class="inline-flex items-center gap-1.5 rounded-lg bg-[#e5322d] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#c9221d]">
              <i class="bi bi-pencil-square"></i> Edit PDF
            </a>
          </div>
        </header>
      `;
    }

    const footerEl = document.getElementById("app-footer");
    if (footerEl) {
      footerEl.innerHTML = `
        <footer class="mt-auto border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
          <div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
            <div>
              <strong class="text-slate-800">${BRAND.fullName}</strong> (${BRAND.domain}) — ${BRAND.footerNote}
            </div>
            <div class="flex items-center gap-4 font-semibold">
              <a href="/index.html" class="hover:text-[#e5322d]">Home</a>
              <a href="/tools/edit-pdf.html" class="hover:text-[#e5322d]">Edit PDF</a>
              <a href="/tools/merge-pdf.html" class="hover:text-[#e5322d]">Merge</a>
              <a href="/tools/split-pdf.html" class="hover:text-[#e5322d]">Split</a>
            </div>
          </div>
        </footer>
      `;
    }
  }
};
