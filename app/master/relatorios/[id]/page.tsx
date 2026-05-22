import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ReportAutoExport } from "@/components/reports/report-auto-export"
import { TravelProReportDocument } from "@/components/reports/report-document"
import { ReportViewActions } from "@/components/reports/report-view-actions"
import { getAccessContext } from "@/lib/auth"
import { resolveReportDocument } from "@/lib/services"

type ExportMode = "pdf" | "html" | "pdf-html" | null

function parseExportMode(value?: string): ExportMode {
  if (value === "pdf" || value === "html" || value === "pdf-html") return value
  return null
}

export default async function MasterReportDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ export?: string }>
}) {
  const context = await getAccessContext(["master"])
  const { id } = await params
  const { export: exportModeParam } = await searchParams
  const { report, document } = await resolveReportDocument(context, id)
  const exportMode = parseExportMode(exportModeParam)

  return (
    <main className="min-h-screen bg-[#050816] px-4 py-6 text-foreground md:px-6">
      <ReportAutoExport reportId={report.id} reportName={report.name} mode={exportMode} />

      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col gap-4 rounded-[28px] border border-white/8 bg-white/[0.03] p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/master/relatorios" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Voltar para relatorios
            </Link>
            <h1 className="mt-3 text-2xl font-semibold text-foreground">{report.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {report.type} • salvo em{" "}
              {new Intl.DateTimeFormat("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(report.created_at))}
            </p>
          </div>
          <ReportViewActions reportId={report.id} reportName={report.name} />
        </div>

        <div id="travelpro-report-export-root">
          <TravelProReportDocument report={document} />
        </div>
      </div>
    </main>
  )
}
