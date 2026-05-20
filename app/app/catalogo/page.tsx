"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  Copy,
  ExternalLink,
  Eye,
  FilePenLine,
  Globe,
  MapPin,
  MessageSquareText,
  MoreHorizontal,
  Save,
  Sparkles,
  Tag,
  Trash2,
} from "lucide-react"
import { DashboardCard } from "@/components/system/dashboard-card"
import { MediaUploadCard } from "@/components/system/media-upload-card"
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

const defaultLogo =
  "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=320&q=80"
const defaultBanner =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"

const packages = [
  { id: "pkg-1", title: "Maldivas Signature", status: "Publicado", description: "Premium • destaque da semana", price: "R$ 24.500" },
  { id: "pkg-2", title: "Inverno em Gramado", status: "Publicado", description: "Campanha de famílias", price: "R$ 8.900" },
  { id: "pkg-3", title: "Cancún Family Escape", status: "Rascunho", description: "Aguardando revisão final", price: "R$ 12.700" },
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
    price: item.price ? `R$ ${Intl.NumberFormat("pt-BR").format(item.price)}` : packages[index % packages.length]?.price || "Sob consulta",
    description: item.description || packages[index % packages.length]?.description || "Pacote pronto para o catálogo público.",
  }
}

function fileToPreview(file: File | null) {
  if (!file) return null
  return URL.createObjectURL(file)
}

export default function AgencyCatalogPage() {
  const [items, setItems] = useState(packages)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(defaultLogo)
  const [bannerPreview, setBannerPreview] = useState<string | null>(defaultBanner)
  const [visualStyle, setVisualStyle] = useState("Premium clássico")
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

  const featuredPackage = useMemo(() => items[0] ?? packages[0], [items])

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
            <CatalogField label="WhatsApp de contato" value="+55 11 99888-2211" />
            <CatalogField label="Cidade / região" value="São Paulo • SP" />
            <CatalogField label="Cor principal" value="Laranja TravelPro" />
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.18em] text-primary/75">Estilo visual</span>
              <select
                value={visualStyle}
                onChange={(event) => setVisualStyle(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none"
              >
                {["Premium clássico", "Minimalista", "Luxo moderno", "Tropical", "Executivo"].map((style) => (
                  <option key={style} value={style} className="bg-background">
                    {style}
                  </option>
                ))}
              </select>
            </label>
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

          <div className="mt-6 rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent p-4 md:p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Identidade visual</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">Prepare o catálogo para Match, marketplace, campanhas e distribuição pública da agência.</p>
              </div>
              <span className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
                Branding ativo
              </span>
            </div>

            <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
              <MediaUploadCard
                title="Logo da agência"
                description="Use uma marca nítida para catálogo, Match e materiais gerados por IA."
                orientation="square"
                preview={logoPreview}
                onSelect={(file) => {
                  const preview = fileToPreview(file)
                  if (preview) setLogoPreview(preview)
                }}
                onRemove={() => setLogoPreview(null)}
              />
              <MediaUploadCard
                title="Banner ou capa da agência"
                description="Imagem horizontal para dar personalidade à vitrine pública e às páginas promocionais."
                orientation="landscape"
                preview={bannerPreview}
                onSelect={(file) => {
                  const preview = fileToPreview(file)
                  if (preview) setBannerPreview(preview)
                }}
                onRemove={() => setBannerPreview(null)}
              />
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Preview público" description="Leitura visual da vitrine da agência em um formato mais aspiracional.">
          <div className="overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent shadow-[0_28px_60px_rgba(0,0,0,0.24)]">
            <div className="relative aspect-[16/12] overflow-hidden">
              {bannerPreview ? <img src={bannerPreview} alt="Banner da agência" className="h-full w-full object-cover" /> : null}
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/90" />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 py-5">
                <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/80 backdrop-blur">
                  {visualStyle}
                </div>
                <div className="rounded-full border border-primary/20 bg-primary/12 px-3 py-1 text-[11px] font-medium text-primary backdrop-blur">
                  Match ready
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 overflow-hidden rounded-2xl border border-white/15 bg-white/10 shadow-lg shadow-black/20">
                    {logoPreview ? <img src={logoPreview} alt="Logo da agência" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-white">JT</div>}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white">JT Viagens</p>
                    <div className="mt-1 flex items-center gap-1 text-sm text-white/75">
                      <MapPin className="h-3.5 w-3.5" />
                      São Paulo • Curadoria premium
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-[26px] border border-white/10 bg-black/35 p-4 backdrop-blur-xl">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-primary/85">Pacote em destaque</p>
                      <h3 className="mt-2 text-xl font-semibold text-white">{featuredPackage?.title || "Maldivas Signature"}</h3>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-sm font-medium text-white">
                      {featuredPackage?.price || "R$ 24.500"}
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-white/72">
                    {featuredPackage?.description || "Pacote pronto para catálogo público, distribuição comercial e campanhas do ecossistema."}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {["Premium", "Romântico", "Match", "Curadoria"].map((tag) => (
                      <span key={tag} className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[11px] text-white/78">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {[
                      "Identidade da agência aplicada",
                      "Pronto para marketplace e Match",
                      "CTA comercial otimizado",
                      "Estrutura preparada para IA",
                    ].map((item) => (
                      <div key={item} className="rounded-2xl border border-white/8 bg-white/6 px-3 py-2 text-xs text-white/74">
                        {item}
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <PrimaryButton onClick={() => fire("WhatsApp preparado", "O contato comercial da agência foi preparado em modo mockado.")}>
                      <MessageSquareText className="h-4 w-4" />
                      Falar com consultor
                    </PrimaryButton>
                    <SecondaryButton onClick={() => fire("Vitrine aberta", "A vitrine pública foi aberta em modo mockado.")}>
                      <Globe className="h-4 w-4" />
                      Abrir vitrine
                    </SecondaryButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>

      <DashboardCard title="Pacotes publicados" description="Resumo rápido dos pacotes já preparados para a vitrine pública.">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {[
              "Compatível com Match",
              "Score comercial alto",
              "Destaque premium ativo",
              "IA sugere melhorar descrição",
            ].map((badge) => (
              <span key={badge} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-muted-foreground">
                {badge}
              </span>
            ))}
          </div>
          <Button asChild className="rounded-full">
            <Link href="/app/catalogo/pacotes/novo">Criar pacote</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-[24px] border border-white/10 bg-gradient-to-br from-white/[0.05] via-white/[0.03] to-transparent p-4 shadow-[0_18px_40px_rgba(0,0,0,0.14)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <span className="rounded-full border border-primary/15 bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary">{item.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    Potencial de conversão acima da média
                  </div>
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

              <div className="mt-4 flex flex-wrap gap-2">
                {["Match", "Marketplace", "Agent"].map((badge) => (
                  <span key={`${item.id}-${badge}`} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-muted-foreground">
                    {badge}
                  </span>
                ))}
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
