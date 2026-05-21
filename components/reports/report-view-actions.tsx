"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Download, FileDown, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

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
    throw new Error((payload as { error?: string } | null)?.error || "Não foi possível concluir a operação.")
  }

  return payload as T
}

export function ReportViewActions({ reportId }: { reportId: string }) {
  const router = useRouter()
  const [isDownloading, setIsDownloading] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)

  const downloadHtml = async () => {
    setIsDownloading(true)
    try {
      const response = await fetch(`/api/reports/${reportId}/download`)
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(payload?.error || "Não foi possível baixar o relatório.")
      }

      const blob = await response.blob()
      const href = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = href
      anchor.download = `relatorio-${reportId}.html`
      anchor.click()
      URL.revokeObjectURL(href)
    } catch (error) {
      toast({ title: "Falha no download", description: error instanceof Error ? error.message : "Não foi possível baixar o relatório." })
    } finally {
      setIsDownloading(false)
    }
  }

  const regenerate = async () => {
    setIsRegenerating(true)
    try {
      await requestJson(`/api/reports/${reportId}/regenerate`, { method: "POST" })
      toast({ title: "Relatório regenerado", description: "O relatório foi atualizado com os dados reais mais recentes." })
      router.refresh()
    } catch (error) {
      toast({ title: "Falha ao regenerar", description: error instanceof Error ? error.message : "Não foi possível regenerar o relatório." })
    } finally {
      setIsRegenerating(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => window.print()}>
        <FileDown className="h-4 w-4" />
        Exportar PDF
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
