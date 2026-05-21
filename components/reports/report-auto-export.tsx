"use client"

import { useEffect, useRef } from "react"
import { toast } from "@/components/ui/use-toast"
import { downloadReportHtml, downloadReportPdf } from "@/lib/report-export"

type ReportAutoExportProps = {
  reportId: string
  reportName: string
  mode: "pdf" | "html" | "pdf-html" | null
}

export function ReportAutoExport({ reportId, reportName, mode }: ReportAutoExportProps) {
  const hasTriggeredRef = useRef(false)

  useEffect(() => {
    if (!mode || hasTriggeredRef.current) return

    hasTriggeredRef.current = true

    const run = async () => {
      try {
        if (mode === "html" || mode === "pdf-html") {
          await downloadReportHtml(reportId)
        }

        if (mode === "pdf" || mode === "pdf-html") {
          const element = document.getElementById("travelpro-report-export-root")
          if (!element) {
            throw new Error("Nao foi possivel localizar o documento do relatorio para exportacao.")
          }

          await downloadReportPdf({
            element,
            filename: reportName,
          })
        }
      } catch (error) {
        toast({
          title: "Falha na exportacao",
          description: error instanceof Error ? error.message : "Nao foi possivel concluir a exportacao do relatorio.",
        })
      }
    }

    void run()
  }, [mode, reportId, reportName])

  return null
}
