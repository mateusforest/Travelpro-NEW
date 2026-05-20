"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Copy, ExternalLink, MessageSquareText, MoreHorizontal, Palette, Save, Trash2, Eye, FilePenLine } from "lucide-react"
import { DashboardCard } from "@/components/system/dashboard-card"
import { PageShell } from "@/components/system/page-shell"
import { PrimaryButton } from "@/components/system/primary-button"
import { SecondaryButton } from "@/components/system/secondary-button"
import { SectionHeader } from "@/components/system/section-header"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import type { CatalogItemRow } from "@/types/database"

function CatalogField({ label, value }: { label: string; value: string }) {
  return (
    <label className="space-y-2">
      <span className="text-xs uppercase tracking-[0.18em] text-primary/75">{label}</span>
      <input defaultValue={value} className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none" />
    </label>
  )
}

type ConfirmAction = {
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void
} | null

const packages = [
  { id: "pkg-1", title: "Maldivas Signature", status: "Publicado", description: "Premium • destaque da semana" },
  { id: "pkg-2", title: "Inverno em Gramado", status: "Publicado", description: "Campanha de famílias" },
  { id: "pkg-3", title: "Cancún Family Escape", status: "Rascunho", description: "Aguardando revisão final" },
]

async function requestJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(payload?.error || "Não foi possível concluir a operação.")
  }

  return (await response.json()) as T
}

function mapCatalogRow(item: CatalogItemRow, index: number) {
  return {
    id: item.id,
    title: item.title,
    status: item.status,
    description: item.description || packages[index % packages.length]?.description || "Pacote pronto para o catálogo público.",
  }
}

export default function AgencyCatalogPage() {
  const [items, setItems] = useState(packages)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const fire = (title: string, description: string) => toast({ title, description })

  useEffect(() => {
    let active = true
    requestJson<CatalogItemRow[]>("/api/catalog")
      .then((data) => {
        if (!active) return
        setItems(data.map(mapCatalogRow))
      })
      .catch(() => {
        if (!active) return
        setItems([])
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <PageShell>
      <SectionHeader
        title="Catálogo da agência"
        description="Configure sua vitrine pública, publique pacotes e acompanhe oportunidades."
        actions={
          <>
            <SecondaryButton onClick={() => fire("Link copiado", "O link público do catálogo foi copiado em modo mockado.")}>
              <Copy className="h-4 w-4" />
              Copiar link
            </SecondaryButton>
            <SecondaryButton onClick={() => fire("Link público aberto", "A vitrine pública foi preparada em modo mockado.")}>
              <ExternalLink className="h-4 w-4" />
              Abrir link público
            </SecondaryButton>
            <PrimaryButton onClick={() => fire("Catálogo salvo", "As alterações do catálogo foram salvas em modo mockado.")}>
              <Save className="h-4 w-4" />
              Salvar alterações
            </PrimaryButton>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <DashboardCard title="Configuração pública" description="Campos principais da vitrine da agência.">
          <div className="grid gap-4 md:grid-cols-2">
            <CatalogField label="Nome público do catálogo" value="JT Viagens" />
            <CatalogField label="Slug personalizado" value="travelpro.app/jtviagens" />
            <CatalogField label="Logo da empresa" value="travelpro-logo.png" />
            <CatalogField label="Cor principal" value="Laranja TravelPro" />
            <CatalogField label="WhatsApp de contato" value="+55 11 99888-2211" />
            <CatalogField label="Cidade / região" value="São Paulo • SP" />
          </div>
          <div className="mt-4">
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.18em] text-primary/75">Descrição curta da agência</span>
              <textarea
                defaultValue="Especialistas em viagens premium, escapadas românticas e experiências com curadoria."
                className="min-h-[112px] w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none"
              />
            </label>
          </div>
        </DashboardCard>

        <DashboardCard title="Preview público" description="Leitura visual do catálogo da agência.">
          <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-5">
            <div className="rounded-[24px] border border-white/8 bg-black/20 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-orange-300 text-primary-foreground">
                  <Palette className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-semibold">JT Viagens</p>
                  <p className="text-sm text-muted-foreground">Curadoria premium • São Paulo</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {items.slice(0, 3).map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Pacote em destaque com contato direto via catálogo público.</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <PrimaryButton onClick={() => fire("WhatsApp preparado", "O contato da agência foi preparado em modo mockado.")}>
                  <MessageSquareText className="h-4 w-4" />
                  WhatsApp
                </PrimaryButton>
                <SecondaryButton onClick={() => fire("Link público aberto", "A vitrine pública foi preparada em modo mockado.")}>
                  <ExternalLink className="h-4 w-4" />
                  Abrir link público
                </SecondaryButton>
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>

      <DashboardCard title="Pacotes publicados" description="Resumo rápido dos pacotes já preparados para a vitrine pública.">
        <div className="mb-4">
          <Button asChild className="rounded-full">
            <Link href="/app/catalogo/pacotes/novo">Criar pacote</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <span className="rounded-full border border-primary/15 bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary">{item.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full border-white/10 bg-white/[0.03]">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={10} className="w-52 rounded-3xl border-white/10 bg-black/85 p-2 text-foreground shadow-2xl shadow-black/40 backdrop-blur-xl">
                    <DropdownMenuItem className="rounded-2xl px-3 py-2.5" onSelect={() => fire("Pacote aberto", `${item.title} foi aberto em modo mockado.`)}>
                      <Eye className="h-4 w-4" />
                      Visualizar
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-2xl px-3 py-2.5" asChild>
                      <Link href="/app/catalogo/pacotes/novo">
                        <FilePenLine className="h-4 w-4" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="rounded-2xl px-3 py-2.5 text-red-200 focus:text-red-200"
                      onSelect={() =>
                        setConfirmAction({
                          title: "Excluir pacote",
                          description: `Deseja confirmar a exclusão mockada de ${item.title}?`,
                          confirmLabel: "Excluir pacote",
                          onConfirm: async () => {
                            try {
                              await requestJson(`/api/catalog/${item.id}`, { method: "DELETE" })
                              setItems((current) => current.filter((entry) => entry.id !== item.id))
                              fire("Pacote excluído", `${item.title} foi removido do Supabase.`)
                            } catch (error) {
                              fire("Falha ao excluir", error instanceof Error ? error.message : "Não foi possível excluir o pacote.")
                            }
                          },
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>

      <Dialog open={Boolean(confirmAction)} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <DialogContent className="max-w-lg rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
          <DialogHeader className="border-b border-white/8 px-6 py-5">
            <DialogTitle>{confirmAction?.title}</DialogTitle>
            <DialogDescription>{confirmAction?.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-t border-white/8 px-6 py-5">
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => setConfirmAction(null)}>
              Cancelar
            </Button>
            <Button className="rounded-full" onClick={() => { confirmAction?.onConfirm(); setConfirmAction(null) }}>
              {confirmAction?.confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
