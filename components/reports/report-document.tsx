import type { ReportDocumentData, ReportMetricCard } from "@/types/reporting"

export const reportDocumentStyles = `
  .tp-report-root {
    background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
    color: #0f172a;
    min-height: 100vh;
    padding: 32px 20px;
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .tp-report-shell {
    max-width: 1100px;
    margin: 0 auto;
    background: rgba(255,255,255,0.92);
    border: 1px solid rgba(148,163,184,0.24);
    border-radius: 32px;
    box-shadow: 0 30px 80px rgba(15,23,42,0.12);
    overflow: hidden;
  }
  .tp-report-header {
    padding: 28px 32px;
    background: linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.94));
    color: #f8fafc;
    display: flex;
    justify-content: space-between;
    gap: 24px;
    flex-wrap: wrap;
  }
  .tp-report-brand-kicker {
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(251,146,60,0.82);
  }
  .tp-report-brand-title {
    font-size: 28px;
    font-weight: 700;
    margin-top: 10px;
  }
  .tp-report-brand-subtitle {
    margin-top: 10px;
    font-size: 14px;
    line-height: 1.7;
    color: rgba(226,232,240,0.8);
    max-width: 640px;
  }
  .tp-report-meta {
    min-width: 240px;
    text-align: right;
    font-size: 13px;
    color: rgba(226,232,240,0.84);
  }
  .tp-report-meta strong {
    color: #fb923c;
  }
  .tp-report-body {
    padding: 30px 32px 34px;
  }
  .tp-report-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 14px;
    margin-bottom: 22px;
  }
  .tp-report-metric {
    border-radius: 22px;
    border: 1px solid rgba(148,163,184,0.22);
    background: linear-gradient(180deg, rgba(255,255,255,0.95), rgba(248,250,252,0.92));
    padding: 18px;
  }
  .tp-report-metric-label {
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #64748b;
  }
  .tp-report-metric-value {
    margin-top: 10px;
    font-size: 24px;
    font-weight: 700;
    color: #0f172a;
  }
  .tp-report-metric-detail {
    margin-top: 8px;
    font-size: 13px;
    line-height: 1.6;
    color: #475569;
  }
  .tp-report-metric--success { border-color: rgba(34,197,94,0.24); background: linear-gradient(180deg, rgba(240,253,244,0.95), rgba(248,250,252,0.95)); }
  .tp-report-metric--warning { border-color: rgba(251,191,36,0.24); background: linear-gradient(180deg, rgba(255,251,235,0.95), rgba(248,250,252,0.95)); }
  .tp-report-metric--danger { border-color: rgba(248,113,113,0.24); background: linear-gradient(180deg, rgba(254,242,242,0.95), rgba(248,250,252,0.95)); }
  .tp-report-metric--info { border-color: rgba(56,189,248,0.24); background: linear-gradient(180deg, rgba(240,249,255,0.95), rgba(248,250,252,0.95)); }
  .tp-report-executive {
    border-radius: 26px;
    border: 1px solid rgba(251,146,60,0.18);
    background: linear-gradient(135deg, rgba(255,247,237,0.94), rgba(255,255,255,0.98));
    padding: 22px;
    margin-bottom: 20px;
  }
  .tp-report-section {
    border-radius: 26px;
    border: 1px solid rgba(148,163,184,0.2);
    background: rgba(255,255,255,0.9);
    padding: 22px;
    margin-top: 16px;
  }
  .tp-report-section-title {
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
  }
  .tp-report-section-description {
    margin-top: 8px;
    font-size: 14px;
    line-height: 1.7;
    color: #64748b;
  }
  .tp-report-table-wrap { overflow-x: auto; margin-top: 14px; }
  .tp-report-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }
  .tp-report-table th {
    text-align: left;
    padding: 12px 14px;
    color: #475569;
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    border-bottom: 1px solid rgba(148,163,184,0.22);
  }
  .tp-report-table td {
    padding: 13px 14px;
    color: #0f172a;
    border-bottom: 1px solid rgba(226,232,240,0.8);
    vertical-align: top;
  }
  .tp-report-table tr:last-child td { border-bottom: none; }
  .tp-report-note-list {
    margin-top: 14px;
    padding-left: 18px;
    color: #334155;
  }
  .tp-report-note-list li {
    margin-top: 8px;
    line-height: 1.7;
  }
  .tp-report-footer {
    border-top: 1px solid rgba(148,163,184,0.18);
    padding: 18px 32px 26px;
    color: #64748b;
    font-size: 12px;
    background: rgba(248,250,252,0.84);
  }
  @media print {
    .tp-report-root {
      background: white;
      padding: 0;
    }
    .tp-report-shell {
      border: none;
      box-shadow: none;
      border-radius: 0;
    }
    .tp-report-header,
    .tp-report-body,
    .tp-report-footer {
      padding-left: 0;
      padding-right: 0;
    }
  }
`

function metricToneClass(metric: ReportMetricCard) {
  if (metric.tone === "success") return "tp-report-metric tp-report-metric--success"
  if (metric.tone === "warning") return "tp-report-metric tp-report-metric--warning"
  if (metric.tone === "danger") return "tp-report-metric tp-report-metric--danger"
  if (metric.tone === "info") return "tp-report-metric tp-report-metric--info"
  return "tp-report-metric"
}

export function TravelProReportDocument({ report }: { report: ReportDocumentData }) {
  return (
    <div className="tp-report-root">
      <style>{reportDocumentStyles}</style>
      <article className="tp-report-shell">
        <header className="tp-report-header">
          <div>
            <p className="tp-report-brand-kicker">TravelPro Reports</p>
            <h1 className="tp-report-brand-title">{report.title}</h1>
            <p className="tp-report-brand-subtitle">{report.subtitle}</p>
          </div>
          <div className="tp-report-meta">
            <p><strong>Agência:</strong> {report.agencyName}</p>
            {report.agencyCity ? <p>{report.agencyCity}</p> : null}
            {report.agencyPhone ? <p>{report.agencyPhone}</p> : null}
            <p style={{ marginTop: "12px" }}><strong>Período:</strong> {report.period}</p>
            <p>Gerado em: {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(report.generatedAt))}</p>
          </div>
        </header>

        <div className="tp-report-body">
          <section className="tp-report-summary">
            {report.metrics.map((metric, index) => (
              <div key={`${metric.label}-${index}`} className={metricToneClass(metric)}>
                <p className="tp-report-metric-label">{metric.label}</p>
                <p className="tp-report-metric-value">{metric.value}</p>
                {metric.detail ? <p className="tp-report-metric-detail">{metric.detail}</p> : null}
              </div>
            ))}
          </section>

          <section className="tp-report-executive">
            <p className="tp-report-brand-kicker">{report.summary.title}</p>
            <ul className="tp-report-note-list">
              {report.summary.lines.map((line, index) => (
                <li key={`${line}-${index}`}>{line}</li>
              ))}
            </ul>
          </section>

          {report.sections.map((section, index) => (
            <section key={`${section.title}-${index}`} className="tp-report-section">
              <h2 className="tp-report-section-title">{section.title}</h2>
              {section.description ? <p className="tp-report-section-description">{section.description}</p> : null}
              {section.kind === "table" ? (
                <div className="tp-report-table-wrap">
                  <table className="tp-report-table">
                    <thead>
                      <tr>
                        {section.table.headers.map((header, headerIndex) => (
                          <th key={`${header}-${headerIndex}`}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row, rowIndex) => (
                        <tr key={`${section.title}-row-${rowIndex}`}>
                          {row.map((cell, cellIndex) => (
                            <td key={`${section.title}-${rowIndex}-${cellIndex}`}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
              {section.kind === "notes" ? (
                <ul className="tp-report-note-list">
                  {section.notes.map((note, noteIndex) => (
                    <li key={`${note}-${noteIndex}`}>{note}</li>
                  ))}
                </ul>
              ) : null}
              {section.kind === "metrics" ? (
                <div className="tp-report-summary" style={{ marginTop: "14px", marginBottom: "0" }}>
                  {section.metrics.map((metric, metricIndex) => (
                    <div key={`${metric.label}-${metricIndex}`} className={metricToneClass(metric)}>
                      <p className="tp-report-metric-label">{metric.label}</p>
                      <p className="tp-report-metric-value">{metric.value}</p>
                      {metric.detail ? <p className="tp-report-metric-detail">{metric.detail}</p> : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          ))}
        </div>

        <footer className="tp-report-footer">
          <p>TravelPro • padrão oficial de relatórios operacionais da agência.</p>
          <p style={{ marginTop: "6px" }}>{report.footerNote || "Relatório gerado com base em dados reais da operação integrados ao Supabase."}</p>
        </footer>
      </article>
    </div>
  )
}
