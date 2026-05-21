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
  MoreHorizontal,
  Save,
  Sparkles,
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
import type { CatalogAgencyProfile } from "@/types/catalog"
import type { CatalogItemRow } from "@/types/database"

type CatalogListItem = {
  id: string
  title: string
  status: string
  description: string
  priceLabel: string
  priceValue: number | null
  publicSlug: string | null
  coverUrl: string | null
  tags: string[]
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

function CatalogField({
  label,
  value,
  onChange,
  readOnly = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
}) {
  return (
    <label className="space-y-2">
      <span className="text-xs uppercase tracking-[0.18em] text-primary/75">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        readOnly={readOnly}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none"
      />
    </label>
  )
}

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

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function isPublished(status: string) {
  const normalized = status.toLowerCase()
  return normalized.includes("public") || normalized.includes("publicad") || normalized.includes("ativo")
}

function formatMoney(value: number | null, currency = "BRL") {
  if (value === null) return "Sob consulta"
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(value)
}

function parseMetadata(value: CatalogItemRow["metadata"]) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

function mapCatalogRow(item: CatalogItemRow): CatalogListItem {
  const metadata = parseMetadata(item.metadata)
  const tags = Array.isArray(metadata.tags)
    ? metadata.tags.filter((tag): tag is string => typeof tag === "string")
    : typeof metadata.tags === "string"
      ? metadata.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      : []

  return {
    id: item.id,
    title: item.title,
    status: item.status,
    description: item.description || "Pacote pronto para o catálogo público.",
    priceLabel: formatMoney(item.price, item.currency || "BRL"),
    priceValue: item.price,
    publicSlug: item.public_slug,
    coverUrl: typeof metadata.cover_url === "string" ? metadata.cover_url : null,
    tags,
  }
}

function fileToPreview(file: File | null) {
  if (!file) return null
  return URL.createObjectURL(file)
}

export default function AgencyCatalogPage() {
  const [items, setItems] = useState<CatalogListItem[]>([])
  const [agencyProfile, setAgencyProfile] = useState<CatalogAgencyProfile | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("Todos")
  const [displayName, setDisplayName] = useState("")
  const [phone, setPhone] = useState("")
  const [city, setCity] = useState("")
  const [primaryColor, setPrimaryColor] = useState("")
  const [visualStyle, setVisualStyle] = useState("Premium clássico")
  const [catalogDescription, setCatalogDescription] = useState("")
  const [logoPreview, setLogoPreview] = useState<string | null>(defaultLogo)
  const [bannerPreview, setBannerPreview] = useState<string | null>(defaultBanner)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const fire = (title: string, description: string) => toast({ title, description })

  useEffect(() => {
    let active = true

    const loadCatalog = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const [profileData, itemsData] = await Promise.all([
          requestJson<CatalogAgencyProfile>("/api/catalog/agency"),
          requestJson<CatalogItemRow[]>(`/api/catalog/packages?search=${encodeURIComponent(searchTerm)}&status=${encodeURIComponent(statusFilter)}`),
        ])

        if (!active) return

        setAgencyProfile(profileData)
        setDisplayName(profileData.display_name || "")
        setPhone(profileData.phone || "")
        setCity(profileData.city || "")
        setPrimaryColor(profileData.primary_color || "Laranja TravelPro")
        setVisualStyle(profileData.visual_style || "Premium clássico")
        setCatalogDescription(profileData.description || "Especialistas em viagens premium, escapadas românticas e experiências com curadoria.")
        setLogoPreview(profileData.logo_url || defaultLogo)
        setBannerPreview(profileData.banner_url || defaultBanner)
        setItems(itemsData.map(mapCatalogRow))
      } catch (error) {
        if (!active) return
        setItems([])
        setLoadError(error instanceof Error ? error.message : "Não foi possível carregar o catálogo.")
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void loadCatalog()
    return () => {
      active = false
    }
  }, [searchTerm, statusFilter])

  const publicHref = useMemo(() => {
    if (agencyProfile?.public_url) return agencyProfile.public_url
    const fallbackSlug = slugify(displayName || "agencia-travelpro")
    return `/catalogo/${fallbackSlug || "agencia-travelpro"}`
  }, [agencyProfile, displayName])

  const featuredPackage = useMemo(
    () => items.find((item) => isPublished(item.status)) ?? items[0] ?? null,
    [items],
  )

  const copyPublicLink = async () => {
    const absoluteUrl = typeof window !== "undefined" ? `${window.location.origin}${publicHref}` : publicHref

    try {
      await navigator.clipboard.writeText(absoluteUrl)
      fire("Link copiado", "O link público real da vitrine foi copiado.")
    } catch {
      fire("Link da vitrine", absoluteUrl)
    }
  }

  const refreshItems = async () => {
    const data = await requestJson<CatalogItemRow[]>(`/api/catalog/packages?search=${encodeURIComponent(searchTerm)}&status=${encodeURIComponent(statusFilter)}`)
    setItems(data.map(mapCatalogRow))
  }

  const saveProfile = async () => {
    setIsSavingProfile(true)
    try {
      if ((logoPreview || "").startsWith("blob:") || (bannerPreview || "").startsWith("blob:")) {
        fire("Mídia local mantida só no preview", "O upload persistente de logo e banner ainda será conectado. O restante do catálogo foi salvo normalmente.")
      }

      const profile = await requestJson<CatalogAgencyProfile>("/api/catalog/agency", {
        method: "PATCH",
        body: JSON.stringify({
          display_name: displayName.trim() || null,
          phone: phone.trim() || null,
          city: city.trim() || null,
          primary_color: primaryColor.trim() || null,
          visual_style: visualStyle.trim() || null,
          description: catalogDescription.trim() || null,
          logo_url: logoPreview && !logoPreview.startsWith("blob:") ? logoPreview : agencyProfile?.logo_url || null,
          banner_url: bannerPreview && !bannerPreview.startsWith("blob:") ? bannerPreview : agencyProfile?.banner_url || null,
          cta_label: "Falar com consultor",
        }),
      })

      setAgencyProfile(profile)
      fire("Catálogo salvo", "As configurações públicas da agência foram atualizadas.")
    } catch (error) {
      fire("Falha ao salvar", error instanceof Error ? error.message : "Não foi possível salvar o catálogo.")
    } finally {
      setIsSavingProfile(false)
    }
  }

  const togglePublication = async (item: CatalogListItem) => {
    try {
      await requestJson(`/api/catalog/packages/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: isPublished(item.status) ? "Rascunho" : "Publicado",
        }),
      })
      await refreshItems()
      fire("Publicação atualizada", isPublished(item.status) ? `${item.title} saiu da vitrine pública.` : `${item.title} já está visível na vitrine pública.`)
    } catch (error) {
      fire("Falha ao publicar", error instanceof Error ? error.message : "Não foi possível atualizar a publicação.")
    }
  }

  return (
    <PageShell>
      <SectionHeader
        title="Catálogo da agência"
        description="Configure sua vitrine pública, publique pacotes e acompanhe oportunidades."
        actions={
          <>
            <SecondaryButton asChild>
              <Link href={publicHref}>
                <Globe className="h-4 w-4" />
                Abrir catálogo
              </Link>
            </SecondaryButton>
            <SecondaryButton onClick={() => void copyPublicLink()}>
              <Copy className="h-4 w-4" />
              Copiar link
            </SecondaryButton>
            <SecondaryButton asChild>
              <Link href={publicHref}>
                <ExternalLink className="h-4 w-4" />
                Abrir link público
              </Link>
            </SecondaryButton>
            <PrimaryButton onClick={() => void saveProfile()} disabled={isSavingProfile}>
              <Save className="h-4 w-4" />
              {isSavingProfile ? "Salvando..." : "Salvar alterações"}
            </PrimaryButton>
          </>
        }
      />

      {loadError ? (
        <div className="rounded-[28px] border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
          <p className="font-medium">Não foi possível carregar o catálogo agora.</p>
          <p className="mt-1 text-amber-100/80">{loadError}</p>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <DashboardCard title="Configuração pública" description="Campos principais da vitrine da agência.">
          <div className="grid gap-4 md:grid-cols-2">
            <CatalogField label="Nome público do catálogo" value={displayName} onChange={setDisplayName} />
            <CatalogField label="Slug personalizado" value={publicHref.replace("/catalogo/", "")} onChange={() => {}} readOnly />
            <CatalogField label="WhatsApp de contato" value={phone} onChange={setPhone} />
            <CatalogField label="Cidade / região" value={city} onChange={setCity} />
            <CatalogField label="Cor principal" value={primaryColor} onChange={setPrimaryColor} />
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
                value={catalogDescription}
                onChange={(event) => setCatalogDescription(event.target.value)}
                className="min-h-[112px] w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none"
              />
            </label>
          </div>

          <div className="mt-6 rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent p-4 md:p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Identidade visual</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">Prepare o catálogo para a vitrine pública da agência sem bloquear o futuro Match.</p>
              </div>
              <span className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
                Branding ativo
              </span>
            </div>

            <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
              <MediaUploadCard
                title="Logo da agência"
                description="Preview local preservado. O upload persistente será conectado em uma próxima etapa."
                orientation="square"
                preview={logoPreview}
                onSelect={(file) => {
                  const preview = fileToPreview(file)
                  if (preview) {
                    setLogoPreview(preview)
                    fire("Preview local atualizado", "A persistência de mídia da agência ainda será conectada sem mudar este layout.")
                  }
                }}
                onRemove={() => setLogoPreview(defaultLogo)}
              />
              <MediaUploadCard
                title="Banner ou capa da agência"
                description="Preview local preservado. O upload persistente será conectado em uma próxima etapa."
                orientation="landscape"
                preview={bannerPreview}
                onSelect={(file) => {
                  const preview = fileToPreview(file)
                  if (preview) {
                    setBannerPreview(preview)
                    fire("Preview local atualizado", "A persistência de mídia da agência ainda será conectada sem mudar este layout.")
                  }
                }}
                onRemove={() => setBannerPreview(defaultBanner)}
              />
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Preview público" description="Leitura visual da vitrine da agência em um formato aspiracional.">
          <div className="overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent shadow-[0_28px_60px_rgba(0,0,0,0.24)]">
            <div className="relative aspect-[16/12] overflow-hidden">
              {bannerPreview ? <img src={bannerPreview} alt="Banner da agência" className="h-full w-full object-cover" /> : null}
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/90" />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 py-5">
                <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/80 backdrop-blur">
                  {visualStyle}
                </div>
                <div className="rounded-full border border-primary/20 bg-primary/12 px-3 py-1 text-[11px] font-medium text-primary backdrop-blur">
                  Vitrine ativa
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 overflow-hidden rounded-2xl border border-white/15 bg-white/10 shadow-lg shadow-black/20">
                    {logoPreview ? <img src={logoPreview} alt="Logo da agência" className="h-full w-full object-cover" /> : null}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white">{displayName || agencyProfile?.display_name || "Agência TravelPro"}</p>
                    <div className="mt-1 flex items-center gap-1 text-sm text-white/75">
                      <MapPin className="h-3.5 w-3.5" />
                      {city || "Curadoria premium"}
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-[26px] border border-white/10 bg-black/35 p-4 backdrop-blur-xl">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-primary/85">Pacote em destaque</p>
                      <h3 className="mt-2 text-xl font-semibold text-white">{featuredPackage?.title || "Sua vitrine pública está pronta"}</h3>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-sm font-medium text-white">
                      {featuredPackage?.priceLabel || "Sob consulta"}
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-white/72">
                    {featuredPackage?.description || catalogDescription || "Publique o primeiro pacote para alimentar a vitrine pública da agência."}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(featuredPackage?.tags.length ? featuredPackage.tags : ["Premium", "Curadoria", "Em breve"]).map((tag) => (
                      <span key={tag} className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[11px] text-white/78">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <PrimaryButton onClick={() => fire("CTA comercial em breve", "O CTA comercial público seguirá simples até a integração de canais futuros.")}>
                      <Sparkles className="h-4 w-4" />
                      Falar com consultor
                    </PrimaryButton>
                    <SecondaryButton asChild>
                      <Link href={publicHref}>
                        <Globe className="h-4 w-4" />
                        Abrir vitrine
                      </Link>
                    </SecondaryButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>

      <DashboardCard title="Pacotes do catálogo" description="Pacotes reais da agência com busca, publicação e ações seguras.">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row">
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar pacote por nome"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none"
            >
              {["Todos", "Publicado", "Rascunho", "Inativo"].map((status) => (
                <option key={status} value={status} className="bg-background">
                  {status}
                </option>
              ))}
            </select>
          </div>
          <Button asChild className="rounded-full">
            <Link href="/app/catalogo/pacotes/novo">Criar pacote</Link>
          </Button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {[
            "Vitrine pública ativa",
            "Match em breve",
            "Impulsionamento em breve",
            "IA em breve",
          ].map((badge) => (
            <span key={badge} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-muted-foreground">
              {badge}
            </span>
          ))}
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={`catalog-skeleton-${index}`} className="animate-pulse rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                <div className="h-4 w-32 rounded-full bg-white/10" />
                <div className="mt-3 h-3 w-full rounded-full bg-white/10" />
                <div className="mt-3 h-3 w-24 rounded-full bg-white/10" />
              </div>
            ))}
          </div>
        ) : null}

        {!isLoading && items.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
            <p className="text-lg font-medium text-foreground">Nenhum pacote encontrado</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Crie o primeiro pacote real da agência para liberar a vitrine pública e começar a distribuir o catálogo.
            </p>
            <Button asChild className="mt-4 rounded-full">
              <Link href="/app/catalogo/pacotes/novo">Criar pacote agora</Link>
            </Button>
          </div>
        ) : null}

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
                    {item.priceLabel}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full border-white/10 bg-white/[0.03]">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={10} className="w-56 rounded-3xl border-white/10 bg-black/85 p-2 text-foreground shadow-2xl shadow-black/40 backdrop-blur-xl">
                    <DropdownMenuItem
                      className="rounded-2xl px-3 py-2.5"
                      onSelect={() => {
                        if (isPublished(item.status)) {
                          window.location.href = publicHref
                          return
                        }
                        fire("Pacote ainda não público", `${item.title} precisa estar publicado para aparecer na vitrine.`)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                      Visualizar
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-2xl px-3 py-2.5" asChild>
                      <Link href={`/app/catalogo/pacotes/novo?id=${item.id}`}>
                        <FilePenLine className="h-4 w-4" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-2xl px-3 py-2.5" onSelect={() => void togglePublication(item)}>
                      <Globe className="h-4 w-4" />
                      {isPublished(item.status) ? "Despublicar" : "Publicar pacote"}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-2xl px-3 py-2.5" onSelect={() => fire("Match em breve", "A distribuição no Match continua como próxima etapa do ecossistema.")}>
                      <Sparkles className="h-4 w-4" />
                      Impulsionar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="rounded-2xl px-3 py-2.5 text-red-200 focus:text-red-200"
                      onSelect={() =>
                        setConfirmAction({
                          title: "Excluir pacote",
                          description: `Deseja confirmar a exclusão de ${item.title}?`,
                          confirmLabel: "Excluir pacote",
                          onConfirm: async () => {
                            try {
                              await requestJson(`/api/catalog/packages/${item.id}`, { method: "DELETE" })
                              setItems((current) => current.filter((entry) => entry.id !== item.id))
                              fire("Pacote excluído", `${item.title} foi removido do catálogo.`)
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
                {(item.tags.length ? item.tags : ["Catálogo", "Vitrine", "Em breve"]).map((badge) => (
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
