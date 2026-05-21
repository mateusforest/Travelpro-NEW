type DownloadHtmlOptions = {
  filename?: string
}

type DownloadPdfOptions = {
  element: HTMLElement
  filename: string
}

function safeFilename(value: string) {
  const normalized = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return normalized || "relatorio-travelpro"
}

export async function downloadReportHtml(reportId: string, options: DownloadHtmlOptions = {}) {
  const response = await fetch(`/api/reports/${reportId}/download`)
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(payload?.error || "Nao foi possivel baixar o relatorio.")
  }

  const blob = await response.blob()
  const href = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = href
  anchor.download = options.filename || `relatorio-${reportId}.html`
  anchor.click()
  URL.revokeObjectURL(href)
}

export async function downloadReportPdf({ element, filename }: DownloadPdfOptions) {
  const html2pdfModule = await import("html2pdf.js")
  const html2pdf = html2pdfModule.default
  const targetFilename = `${safeFilename(filename)}.pdf`

  await html2pdf()
    .set({
      filename: targetFilename,
      margin: 0,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: "#f8fafc",
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: {
        mode: ["css", "legacy"],
      },
    })
    .from(element)
    .save()
}
