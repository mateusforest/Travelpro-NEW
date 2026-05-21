import { NextResponse } from "next/server"
import { AuthSessionError, AuthorizationError, getAccessContext } from "@/lib/auth"
import { getReportDownloadData } from "@/lib/services"
import type { ReportDocumentData, ReportSectionBlock } from "@/types/reporting"

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function renderSection(section: ReportSectionBlock) {
  const title = `<h2 class="tp-report-section-title">${escapeHtml(section.title)}</h2>`
  const description = section.description ? `<p class="tp-report-section-description">${escapeHtml(section.description)}</p>` : ""

  if (section.kind === "notes") {
    return `<section class="tp-report-section">${title}${description}<ul class="tp-report-note-list">${section.notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}</ul></section>`
  }

  if (section.kind === "metrics") {
    return `<section class="tp-report-section">${title}${description}<div class="tp-report-summary">${section.metrics
      .map(
        (metric) => `<div class="tp-report-metric">
          <p class="tp-report-metric-label">${escapeHtml(metric.label)}</p>
          <p class="tp-report-metric-value">${escapeHtml(metric.value)}</p>
          ${metric.detail ? `<p class="tp-report-metric-detail">${escapeHtml(metric.detail)}</p>` : ""}
        </div>`,
      )
      .join("")}</div></section>`
  }

  return `<section class="tp-report-section">${title}${description}<div class="tp-report-table-wrap"><table class="tp-report-table"><thead><tr>${section.table.headers
    .map((header) => `<th>${escapeHtml(header)}</th>`)
    .join("")}</tr></thead><tbody>${section.table.rows
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
    .join("")}</tbody></table></div></section>`
}

function renderHtmlDocument(document: ReportDocumentData) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(document.title)}</title>
    <style>
      body { margin: 0; }
      .tp-report-root {
        background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
        color: #0f172a; min-height: 100vh; padding: 32px 20px; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .tp-report-shell { max-width: 1100px; margin: 0 auto; background: rgba(255,255,255,0.92); border: 1px solid rgba(148,163,184,0.24); border-radius: 32px; box-shadow: 0 30px 80px rgba(15,23,42,0.12); overflow: hidden; }
      .tp-report-header { padding: 28px 32px; background: linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.94)); color: #f8fafc; display: flex; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
      .tp-report-brand-kicker { font-size: 11px; letter-spacing: .22em; text-transform: uppercase; color: rgba(251,146,60,.82); }
      .tp-report-brand-title { font-size: 28px; font-weight: 700; margin-top: 10px; }
      .tp-report-brand-subtitle { margin-top: 10px; font-size: 14px; line-height: 1.7; color: rgba(226,232,240,.8); max-width: 640px; }
      .tp-report-meta { min-width: 240px; text-align: right; font-size: 13px; color: rgba(226,232,240,.84); }
      .tp-report-meta strong { color: #fb923c; }
      .tp-report-body { padding: 30px 32px 34px; }
      .tp-report-summary { display: grid; grid-template-columns: repeat(auto-fit,minmax(200px,1fr)); gap: 14px; margin-bottom: 22px; }
      .tp-report-metric { border-radius: 22px; border: 1px solid rgba(148,163,184,.22); background: linear-gradient(180deg, rgba(255,255,255,.95), rgba(248,250,252,.92)); padding: 18px; }
      .tp-report-metric-label { font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: #64748b; }
      .tp-report-metric-value { margin-top: 10px; font-size: 24px; font-weight: 700; color: #0f172a; }
      .tp-report-metric-detail { margin-top: 8px; font-size: 13px; line-height: 1.6; color: #475569; }
      .tp-report-executive { border-radius: 26px; border: 1px solid rgba(251,146,60,.18); background: linear-gradient(135deg, rgba(255,247,237,.94), rgba(255,255,255,.98)); padding: 22px; margin-bottom: 20px; }
      .tp-report-section { border-radius: 26px; border: 1px solid rgba(148,163,184,.2); background: rgba(255,255,255,.9); padding: 22px; margin-top: 16px; }
      .tp-report-section-title { font-size: 18px; font-weight: 700; color: #0f172a; }
      .tp-report-section-description { margin-top: 8px; font-size: 14px; line-height: 1.7; color: #64748b; }
      .tp-report-table-wrap { overflow-x: auto; margin-top: 14px; }
      .tp-report-table { width: 100%; border-collapse: collapse; font-size: 13px; }
      .tp-report-table th { text-align: left; padding: 12px 14px; color: #475569; font-size: 11px; letter-spacing: .16em; text-transform: uppercase; border-bottom: 1px solid rgba(148,163,184,.22); }
      .tp-report-table td { padding: 13px 14px; color: #0f172a; border-bottom: 1px solid rgba(226,232,240,.8); vertical-align: top; }
      .tp-report-note-list { margin-top: 14px; padding-left: 18px; color: #334155; }
      .tp-report-note-list li { margin-top: 8px; line-height: 1.7; }
      .tp-report-footer { border-top: 1px solid rgba(148,163,184,.18); padding: 18px 32px 26px; color: #64748b; font-size: 12px; background: rgba(248,250,252,.84); }
    </style>
  </head>
  <body>
    <div class="tp-report-root">
      <article class="tp-report-shell">
        <header class="tp-report-header">
          <div>
            <p class="tp-report-brand-kicker">TravelPro Reports</p>
            <h1 class="tp-report-brand-title">${escapeHtml(document.title)}</h1>
            <p class="tp-report-brand-subtitle">${escapeHtml(document.subtitle)}</p>
          </div>
          <div class="tp-report-meta">
            <p><strong>Agência:</strong> ${escapeHtml(document.agencyName)}</p>
            ${document.agencyCity ? `<p>${escapeHtml(document.agencyCity)}</p>` : ""}
            ${document.agencyPhone ? `<p>${escapeHtml(document.agencyPhone)}</p>` : ""}
            <p style="margin-top:12px"><strong>Período:</strong> ${escapeHtml(document.period)}</p>
            <p>Gerado em: ${escapeHtml(new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(document.generatedAt)))}</p>
          </div>
        </header>
        <div class="tp-report-body">
          <section class="tp-report-summary">
            ${document.metrics
              .map(
                (metric) => `<div class="tp-report-metric">
                  <p class="tp-report-metric-label">${escapeHtml(metric.label)}</p>
                  <p class="tp-report-metric-value">${escapeHtml(metric.value)}</p>
                  ${metric.detail ? `<p class="tp-report-metric-detail">${escapeHtml(metric.detail)}</p>` : ""}
                </div>`,
              )
              .join("")}
          </section>
          <section class="tp-report-executive">
            <p class="tp-report-brand-kicker">${escapeHtml(document.summary.title)}</p>
            <ul class="tp-report-note-list">${document.summary.lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>
          </section>
          ${document.sections.map((section) => renderSection(section)).join("")}
        </div>
        <footer class="tp-report-footer">
          <p>TravelPro • padrão oficial de relatórios operacionais da agência.</p>
          <p style="margin-top:6px">${escapeHtml(document.footerNote || "Relatório gerado com base em dados reais da operação integrados ao Supabase.")}</p>
        </footer>
      </article>
    </div>
  </body>
</html>`
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await getAccessContext(["master", "agency_admin", "agency_user"])
    const { id } = await params
    const result = await getReportDownloadData(context, id)

    return new NextResponse(renderHtmlDocument(result.document), {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="${result.filename}"`,
      },
    })
  } catch (error) {
    const status = error instanceof AuthSessionError || error instanceof AuthorizationError ? error.status : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to download report" }, { status })
  }
}
