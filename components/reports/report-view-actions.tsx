"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Download, FileDown, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { downloadReportHtml, downloadReportPdf } from "@/lib/report-export"

async function requestJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })

  const payload = (await response.json().catch(() => null)) as { error?: string } | T | null
  if (!response.ok) {
    throw new Error((payload as { error?: string } | null)?.error || "Nao foi possivel concluir a operacao.")
  }

  return payload as T
}

export function ReportViewActions({ reportId, reportName }: { reportId: string; reportName: string }) {
  const router = useRouter()
  const [isDownloading, setIsDownloading] = useState(false)
  const [isExportingPdf, setIsExportingPdf] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)

  const downloadHtml = async () => {
    setIsDownloading(true)
    try {
      await downloadReportHtml(reportId)
    } catch (error) {
      toast({ title: "Falha no download", description: error instanceof Error ? error.message : "Nao foi possivel baixar o relatorio." })
    } finally {
      setIsDownloading(false)
    }
  }

  const exportPdf = async () => {
    setIsExportingPdf(true)
    try {
      const element = document.getElementById("travelpro-report-export-root")
      if (!element) {
        throw new Error("Nao foi possivel localizar o documento do relatorio para exportacao.")
      }

      await downloadReportPdf({
        element,
        filename: reportName,
      })
    } catch (error) {
      toast({ title: "Falha na exportacao", description: error instanceof Error ? error.message : "Nao foi possivel exportar o relatorio em PDF." })
    } finally {
      setIsExportingPdf(false)
    }
  }

  const regenerate = async () => {
    setIsRegenerating(true)
    try {
      await requestJson(`/api/reports/${reportId}/regenerate`, { method: "POST" })
      toast({ title: "Relatorio regenerado", description: "O relatorio foi atualizado com os dados reais mais recentes." })
      router.refresh()
    } catch (error) {
      toast({ title: "Falha ao regenerar", description: error instanceof Error ? error.message : "Nao foi possivel regenerar o relatorio." })
    } finally {
      setIsRegenerating(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => void exportPdf()} disabled={isExportingPdf}>
        <FileDown className="h-4 w-4" />
        {isExportingPdf ? "Exportando PDF..." : "Exportar PDF"}
      </Button>
      <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => void downloadHtml()} disabled={isDownloading}>
        <Download className="h-4 w-4" />
        {isDownloading ? "Baixando..." : "Baixar HTML"}
      </Button>
      <Button className="rounded-full" onClick={() => void regenerate()} disabled={isRegenerating}>
        <RefreshCcw className="h-4 w-4" />
        {isRegenerating ? "Regenerando..." : "Gerar novamente"}
      </Button>
    </div>
  )
}
