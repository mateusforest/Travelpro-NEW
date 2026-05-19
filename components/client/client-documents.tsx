"use client"

import { useMemo, useState } from "react"
import { Download, Eye, FileBadge, MoreHorizontal, Share2, TriangleAlert } from "lucide-react"
import { PageShell } from "@/components/system/page-shell"
import { SectionHeader } from "@/components/system/section-header"
import { DashboardCard } from "@/components/system/dashboard-card"
import { FilterTabs } from "@/components/system/filter-tabs"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"

type ClientDocument = {
  id: string
  title: string
  type: string
  status: string
  trip: string
  note: string
  issuedBy: string
  updatedAt: string
}

const clientDocuments: ClientDocument[] = [
  {
    id: "doc-1",
    title: "Contrato da viagem",
    type: "Contrato",
    status: "Assinado",
    trip: "Cancún",
    note: "Versão final validada pela agência e pronta para consulta.",
    issuedBy: "JT Viagens",
    updatedAt: "Hoje, 09:20",
  },
  {
    id: "doc-2",
    title: "Voucher do hotel",
    type: "Voucher",
    status: "Pronto",
    trip: "Cancún",
    note: "Check-in, benefícios e política de early check-in incluídos.",
    issuedBy: "JT Viagens",
    updatedAt: "Hoje, 10:05",
  },
  {
    id: "doc-3",
    title: "Passagens aéreas",
    type: "Passagem",
    status: "Em emissão",
    trip: "Orlando",
    note: "Emissão prevista para o fim do dia com envio automático.",
    issuedBy: "Companhia parceira",
    updatedAt: "Hoje, 11:40",
  },
  {
    id: "doc-4",
    title: "Seguro viagem",
    type: "Seguro",
    status: "Pronto",
    trip: "Maldivas",
    note: "Cobertura internacional ativa com assistência 24 horas.",
    issuedBy: "Seguradora parceira",
    updatedAt: "Ontem, 18:10",
  },
  {
    id: "doc-5",
    title: "Recibo do pagamento",
    type: "Recibo",
    status: "Pronto",
    trip: "Orlando",
    note: "Comprovante da última parcela já reconciliado no sistema.",
    issuedBy: "Financeiro JT Viagens",
    updatedAt: "Ontem, 16:32",
  },
]

const statusClasses: Record<string, string> = {
  Assinado: "border-green-400/15 bg-green-400/10 text-green-300",
  Pronto: "border-primary/15 bg-primary/10 text-primary",
  "Em emissão": "border-amber-400/15 bg-amber-400/10 text-amber-300",
}

const documentFilters = ["Todos os documentos", "Cancún", "Orlando", "Maldivas"]

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-primary/70">{label}</p>
      <p className="mt-2 text-sm leading-6 text-foreground">{value}</p>
    </div>
  )
}

export function ClientDocuments() {
  const [activeFilter, setActiveFilter] = useState(documentFilters[0])
  const [selectedDocument, setSelectedDocument] = useState<ClientDocument | null>(null)

  const visibleDocuments = useMemo(() => {
    if (activeFilter === "Todos os documentos") return clientDocuments
    return clientDocuments.filter((document) => document.trip === activeFilter)
  }, [activeFilter])

  const fireMock = (title: string, description: string) => toast({ title, description })

  const openDocument = (document: ClientDocument) => {
    setSelectedDocument(document)
    fireMock("Documento aberto", `${document.title} foi aberto em modo mockado.`)
  }

  return (
    <PageShell>
      <SectionHeader
        title="Documentos"
        description="Abra, baixe e acompanhe tudo o que a agência já preparou para a sua viagem."
        actions={<FilterTabs items={documentFilters} activeItem={activeFilter} onChange={setActiveFilter} />}
      />

      <DashboardCard
        title="Arquivos da viagem"
        description="Cada documento já vem com ações rápidas para facilitar o acesso."
      >
        <div className="space-y-3">
          {visibleDocuments.map((document) => (
            <div
              key={document.id}
              className="flex flex-col gap-4 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <button
                type="button"
                onClick={() => setSelectedDocument(document)}
                className="flex min-w-0 items-start gap-3 text-left"
              >
                <div className="rounded-2xl border border-white/10 bg-primary/10 p-3">
                  <FileBadge className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{document.title}</p>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-medium tracking-[0.18em] ${
                        statusClasses[document.status] ?? "border-white/10 bg-white/[0.06] text-muted-foreground"
                      }`}
                    >
                      {document.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-primary/70">
                    {document.type} • {document.trip}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{document.note}</p>
                </div>
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <Button className="rounded-full" onClick={() => openDocument(document)}>
                  <Eye className="h-4 w-4" />
                  Abrir
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/[0.03]"
                  onClick={() =>
                    fireMock("Download preparado", `O download de ${document.title} foi iniciado em modo mockado.`)
                  }
                >
                  <Download className="h-4 w-4" />
                  Baixar
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full border-white/10 bg-white/[0.03]">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    sideOffset={10}
                    className="w-52 rounded-3xl border-white/10 bg-black/85 p-2 text-foreground shadow-2xl shadow-black/40 backdrop-blur-xl"
                  >
                    <DropdownMenuItem className="rounded-2xl px-3 py-2.5" onSelect={() => setSelectedDocument(document)}>
                      <Eye className="h-4 w-4" />
                      Ver detalhes
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="rounded-2xl px-3 py-2.5"
                      onSelect={() =>
                        fireMock("Compartilhamento preparado", `O compartilhamento de ${document.title} será conectado depois.`)
                      }
                    >
                      <Share2 className="h-4 w-4" />
                      Compartilhar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="rounded-2xl px-3 py-2.5"
                      onSelect={() =>
                        fireMock("Problema reportado", `A agência foi avisada sobre ${document.title} em modo mockado.`)
                      }
                    >
                      <TriangleAlert className="h-4 w-4" />
                      Reportar problema
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>

      <Dialog open={Boolean(selectedDocument)} onOpenChange={(open) => !open && setSelectedDocument(null)}>
        <DialogContent className="flex max-h-[88vh] max-w-4xl flex-col rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
          {selectedDocument ? (
            <>
              <DialogHeader className="border-b border-white/8 px-6 py-5">
                <DialogTitle>{selectedDocument.title}</DialogTitle>
                <DialogDescription>
                  Visualize dados do documento, histórico da viagem e ações rápidas em um só lugar.
                </DialogDescription>
              </DialogHeader>
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <DetailCard label="Tipo" value={selectedDocument.type} />
                  <DetailCard label="Status" value={selectedDocument.status} />
                  <DetailCard label="Viagem" value={selectedDocument.trip} />
                  <DetailCard label="Atualizado em" value={selectedDocument.updatedAt} />
                  <DetailCard label="Emitido por" value={selectedDocument.issuedBy} />
                  <DetailCard label="Observação" value={selectedDocument.note} />
                </div>
              </div>
              <DialogFooter className="border-t border-white/8 px-6 py-5">
                <Button
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/[0.03]"
                  onClick={() =>
                    fireMock("Compartilhamento preparado", `O compartilhamento de ${selectedDocument.title} será conectado depois.`)
                  }
                >
                  Compartilhar
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/[0.03]"
                  onClick={() =>
                    fireMock("Download preparado", `O download de ${selectedDocument.title} foi iniciado em modo mockado.`)
                  }
                >
                  Baixar
                </Button>
                <Button className="rounded-full" onClick={() => openDocument(selectedDocument)}>
                  Abrir documento
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
