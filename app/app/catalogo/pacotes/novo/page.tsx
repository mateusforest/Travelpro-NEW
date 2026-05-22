"use client"

import Link from "next/link"
import { Suspense, useEffect, useMemo, useState, type ReactNode } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  Globe,
  GripVertical,
  ImagePlus,
  MapPin,
  MessageSquareText,
  Save,
  Send,
  Sparkles,
  Star,
  Tag,
  Trash2,
  WandSparkles,
} from "lucide-react"
import { DashboardCard } from "@/components/system/dashboard-card"
import { LivePreviewPanel } from "@/components/system/live-preview-panel"
import { MediaUploadCard } from "@/components/system/media-upload-card"
import { OperationalWorkspaceLayout } from "@/components/system/operational-workspace-layout"
import { PageShell } from "@/components/system/page-shell"
import { PrimaryButton } from "@/components/system/primary-button"
import { SecondaryButton } from "@/components/system/secondary-button"
import { SectionHeader } from "@/components/system/section-header"
import { SetupGuideCard } from "@/components/system/setup-guide-card"
import { WorkspaceSidebarInfo } from "@/components/system/workspace-sidebar-info"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import type { CatalogAgencyProfile } from "@/types/catalog"
import type { CatalogItemRow } from "@/types/database"

type PackageDraft = {
  title: string
  destination: string
  price: string
  description: string
  highlights: string
  included: string
  excluded: string
  tags: string
  style: string
  cta: string
  cover: string
  status: string
  template: string
  slug: string
  seo: string
  internalNotes: string
  publication: string
}

type GalleryItem = {
  id: string
  url: string
}

const initialDraft: PackageDraft = {
  title: "",
  destination: "",
  price: "R$ 0",
  description: "",
  highlights: "",
  included: "",
  excluded: "",
  tags: "",
  style: "Premium urbano",
  cta: "Falar com consultor",
  cover: "",
  status: "Rascunho",
  template: "Editorial Premium",
  slug: "",
  seo: "",
  internalNotes: "",
  publication: "Catálogo público",
}

const defaultCover =
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80"
const defaultThumb =
  "https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?auto=format&fit=crop&w=720&q=80"
const defaultAgencyLogo =
  "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=320&q=80"

function Field({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="space-y-2">
      <span className="text-xs uppercase tracking-[0.18em] text-primary/75">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
      />
    </label>
  )
}

function TextAreaField({
  label,
  placeholder,
  value,
  onChange,
  rows = 4,
}: {
  label: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  rows?: number
}) {
  return (
    <label className="space-y-2">
      <span className="text-xs uppercase tracking-[0.18em] text-primary/75">{label}</span>
      <textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
      />
    </label>
  )
}

function WorkspaceSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <DashboardCard title={title} description={description}>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </DashboardCard>
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

function parseMetadata(value: CatalogItemRow["metadata"]) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function parseCurrencyValue(value: string) {
  const normalized = value.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".")
  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

function fileToPreview(file: File | null) {
  if (!file) return null
  return URL.createObjectURL(file)
}

function mapRecordToDraft(item: CatalogItemRow): { draft: PackageDraft; coverUrl: string | null; thumbUrl: string | null; gallery: GalleryItem[] } {
  const metadata = parseMetadata(item.metadata)
  const galleryUrls = Array.isArray(metadata.gallery_urls) ? metadata.gallery_urls.filter((entry): entry is string => typeof entry === "string") : []

  return {
    draft: {
      title: item.title,
      destination: typeof metadata.destination === "string" ? metadata.destination : "",
      price: item.price !== null ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: item.currency || "BRL" }).format(item.price) : "Sob consulta",
      description: item.description || "",
      highlights: typeof metadata.highlights === "string" ? metadata.highlights : "",
      included: typeof metadata.included === "string" ? metadata.included : "",
      excluded: typeof metadata.excluded === "string" ? metadata.excluded : "",
      tags:
        Array.isArray(metadata.tags)
          ? metadata.tags.filter((entry): entry is string => typeof entry === "string").join(", ")
          : typeof metadata.tags === "string"
            ? metadata.tags
            : "",
      style: typeof metadata.style === "string" ? metadata.style : "Premium urbano",
      cta: typeof metadata.cta === "string" ? metadata.cta : "Falar com consultor",
      cover: typeof metadata.cover_url === "string" ? metadata.cover_url : "",
      status: item.status,
      template: typeof metadata.template === "string" ? metadata.template : "Editorial Premium",
      slug: item.public_slug || slugify(item.title),
      seo: typeof metadata.seo === "string" ? metadata.seo : "",
      internalNotes: typeof metadata.internal_notes === "string" ? metadata.internal_notes : "",
      publication: typeof metadata.publication === "string" ? metadata.publication : "Catálogo público",
    },
    coverUrl: typeof metadata.cover_url === "string" ? metadata.cover_url : null,
    thumbUrl: typeof metadata.match_thumb_url === "string" ? metadata.match_thumb_url : null,
    gallery: galleryUrls.map((url, index) => ({ id: `gallery-${index}-${url}`, url })),
  }
}

function CatalogPackageWorkspace() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const packageId = searchParams.get("id")
  const isEditing = Boolean(packageId)
  const [agencyProfile, setAgencyProfile] = useState<CatalogAgencyProfile | null>(null)
  const [draft, setDraft] = useState<PackageDraft>(initialDraft)
  const [coverPreview, setCoverPreview] = useState<string | null>(defaultCover)
  const [matchThumbPreview, setMatchThumbPreview] = useState<string | null>(defaultThumb)
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const previewTags = useMemo(
    () =>
      draft.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [draft.tags],
  )

  useEffect(() => {
    let active = true

    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const [profile, record] = await Promise.all([
          requestJson<CatalogAgencyProfile>("/api/catalog/agency"),
          packageId ? requestJson<CatalogItemRow>(`/api/catalog/packages/${packageId}`) : Promise.resolve(null),
        ])

        if (!active) return

        setAgencyProfile(profile)

        if (record) {
          const mapped = mapRecordToDraft(record)
          setDraft(mapped.draft)
          setCoverPreview(mapped.coverUrl || defaultCover)
          setMatchThumbPreview(mapped.thumbUrl || defaultThumb)
          setGallery(mapped.gallery)
        } else {
          setDraft((current) => ({
            ...current,
            cta: profile.cta_label || current.cta,
          }))
        }
      } catch (error) {
        if (!active) return
        setLoadError(error instanceof Error ? error.message : "Não foi possível carregar o pacote.")
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [packageId])

  const updateField = <K extends keyof PackageDraft>(key: K, value: PackageDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }))

  const fire = (title: string, description: string) => toast({ title, description })

  const publicHref = agencyProfile?.public_url || `/catalogo/${slugify(agencyProfile?.display_name || "agencia-travelpro")}`

  const handleOpenPreview = () => {
    if (draft.status !== "Publicado") {
      fire("Preview público após publicação", "Publique o pacote para abrir a vitrine pública com este item disponível.")
      return
    }

    router.push(publicHref)
  }

  const addGalleryImages = (files: FileList | null) => {
    if (!files?.length) return
    const additions = Array.from(files).map((file, index) => ({
      id: `gallery-new-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
    }))
    setGallery((current) => [...current, ...additions])
    fire("Preview local atualizado", "A persistência de mídia do pacote será conectada depois. O restante do pacote já salva normalmente.")
  }

  const moveGalleryItem = (id: string, direction: -1 | 1) => {
    setGallery((current) => {
      const index = current.findIndex((item) => item.id === id)
      const nextIndex = index + direction
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current
      const copy = [...current]
      const [item] = copy.splice(index, 1)
      copy.splice(nextIndex, 0, item)
      return copy
    })
  }

  const savePackage = async (nextStatus: string) => {
    if (!draft.title.trim() || draft.title.trim().length < 2) {
      fire("Título obrigatório", "Informe um nome válido para o pacote.")
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        title: draft.title.trim(),
        description: draft.description.trim() || null,
        status: nextStatus,
        price: parseCurrencyValue(draft.price),
        currency: "BRL",
        public_slug: slugify(draft.slug || draft.title),
        match_enabled: false,
        metadata: {
          destination: draft.destination.trim(),
          highlights: draft.highlights.trim(),
          included: draft.included.trim(),
          excluded: draft.excluded.trim(),
          tags: previewTags,
          style: draft.style.trim(),
          cta: draft.cta.trim(),
          cover_url: coverPreview && !coverPreview.startsWith("blob:") ? coverPreview : draft.cover || defaultCover,
          match_thumb_url: matchThumbPreview && !matchThumbPreview.startsWith("blob:") ? matchThumbPreview : defaultThumb,
          template: draft.template.trim(),
          seo: draft.seo.trim(),
          internal_notes: draft.internalNotes.trim(),
          publication: draft.publication.trim(),
          gallery_urls: gallery.filter((item) => !item.url.startsWith("blob:")).map((item) => item.url),
        },
      }

      await requestJson<CatalogItemRow>(isEditing ? `/api/catalog/packages/${packageId}` : "/api/catalog/packages", {
        method: isEditing ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      })

      if ((coverPreview || "").startsWith("blob:") || (matchThumbPreview || "").startsWith("blob:") || gallery.some((item) => item.url.startsWith("blob:"))) {
        fire("Pacote salvo com preview local", "Os dados principais foram salvos no Supabase. O upload persistente das imagens será conectado depois.")
      } else {
        fire(nextStatus === "Publicado" ? "Pacote publicado" : "Rascunho salvo", nextStatus === "Publicado" ? "O pacote já pode aparecer na vitrine pública da agência." : "O pacote foi salvo no Supabase como rascunho.")
      }

      router.replace("/app/catalogo")
      router.refresh()
    } catch (error) {
      fire("Falha ao salvar", error instanceof Error ? error.message : "Não foi possível salvar o pacote.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <PageShell>
        <DashboardCard title="Carregando pacote" description="Sincronizando os dados reais do catálogo.">
          <div className="space-y-3">
            <div className="h-4 w-48 animate-pulse rounded-full bg-white/10" />
            <div className="h-4 w-64 animate-pulse rounded-full bg-white/10" />
          </div>
        </DashboardCard>
      </PageShell>
    )
  }

  if (loadError) {
    return (
      <PageShell>
        <DashboardCard title="Não foi possível abrir o pacote" description={loadError}>
          <Button className="rounded-full" onClick={() => router.replace("/app/catalogo")}>
            Voltar ao catálogo
          </Button>
        </DashboardCard>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <SectionHeader
        title={isEditing ? "Editar pacote do catálogo" : "Novo pacote do catálogo"}
        description="Monte um pacote com mais contexto, identidade e material pronto para a vitrine pública da agência."
        actions={
          <>
            <SecondaryButton asChild>
              <Link href="/app/catalogo">
                <ArrowLeft className="h-4 w-4" />
                Voltar ao catálogo
              </Link>
            </SecondaryButton>
            <SecondaryButton onClick={() => void savePackage("Rascunho")} disabled={isSaving}>
              <Save className="h-4 w-4" />
              {isSaving ? "Salvando..." : "Salvar rascunho"}
            </SecondaryButton>
            <PrimaryButton onClick={() => void savePackage("Publicado")} disabled={isSaving}>
              <Send className="h-4 w-4" />
              {isSaving ? "Publicando..." : "Publicar pacote"}
            </PrimaryButton>
          </>
        }
      />

      <OperationalWorkspaceLayout
        sidebar={
          <>
            <LivePreviewPanel
              title="Preview público"
              description="Uma mini landing page pronta para catálogo e distribuição comercial da agência."
              footer={
                <div className="flex flex-wrap gap-3">
                  <SecondaryButton onClick={handleOpenPreview}>
                    <Globe className="h-4 w-4" />
                    Abrir preview
                  </SecondaryButton>
                  <PrimaryButton onClick={() => fire("CTA comercial em breve", "O CTA comercial público seguirá simples até a integração de canais futuros.")}>
                    <MessageSquareText className="h-4 w-4" />
                    CTA WhatsApp
                  </PrimaryButton>
                </div>
              }
            >
              <div className="overflow-hidden rounded-[26px] border border-white/10 bg-black/20 shadow-[0_28px_60px_rgba(0,0,0,0.24)]">
                <div className="relative aspect-[10/13] overflow-hidden">
                  {coverPreview ? <img src={coverPreview} alt="Capa do pacote" className="h-full w-full object-cover" /> : null}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/35 to-black/90" />

                  <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 py-5">
                    <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/80 backdrop-blur">
                      {draft.status}
                    </div>
                    <div className="rounded-full border border-primary/20 bg-primary/12 px-3 py-1 text-[11px] font-medium text-primary backdrop-blur">
                      {draft.template}
                    </div>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-2xl border border-white/15 bg-white/10">
                        <img src={agencyProfile?.logo_url || defaultAgencyLogo} alt="Logo da agência" className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-white">{agencyProfile?.display_name || "Agência TravelPro"}</p>
                        <div className="mt-1 flex items-center gap-1 text-sm text-white/75">
                          <MapPin className="h-3.5 w-3.5" />
                          {agencyProfile?.city || "Curadoria premium"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 rounded-[24px] border border-white/10 bg-black/35 p-4 backdrop-blur-xl">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-xl font-semibold text-white">{draft.title || "Seu novo pacote"}</h2>
                          <p className="mt-2 text-sm text-white/72">{draft.destination || "Destino principal"}</p>
                        </div>
                        <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-sm font-medium text-white">
                          {draft.price || "Preço"}
                        </div>
                      </div>

                      <p className="mt-4 text-sm leading-6 text-white/74">
                        {draft.description || "Descreva o pacote para começar a visualizar sua vitrine pública."}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {previewTags.length ? (
                          previewTags.map((tag) => (
                            <span key={tag} className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[11px] text-white/78">
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[11px] text-white/78">
                            Tags do pacote
                          </span>
                        )}
                      </div>

                      <div className="mt-4 grid gap-2">
                        {draft.highlights
                          .split(",")
                          .slice(0, 3)
                          .map((item) => item.trim())
                          .filter(Boolean)
                          .map((item) => (
                            <div key={item} className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/6 px-3 py-2 text-xs text-white/74">
                              <Star className="h-3.5 w-3.5 text-primary" />
                              {item}
                            </div>
                          ))}
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <PrimaryButton onClick={() => fire("CTA comercial em breve", "O CTA comercial público seguirá simples até a integração de canais futuros.")}>
                          <MessageSquareText className="h-4 w-4" />
                          {draft.cta || "Falar com consultor"}
                        </PrimaryButton>
                        <SecondaryButton onClick={() => fire("Match em breve", "O TravelPro Match continua fora deste escopo e será conectado em uma próxima fase.")}>
                          <Sparkles className="h-4 w-4" />
                          Preview Match
                        </SecondaryButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </LivePreviewPanel>

            <WorkspaceSidebarInfo
              title="Leitura operacional"
              description="Elementos que ajudam a vitrine pública da agência a ficar mais clara e vendável."
              items={[
                { label: "Vitrine pública", value: draft.status === "Publicado" ? "Ativa" : "Rascunho", hint: "Só pacotes publicados aparecem publicamente." },
                { label: "Match", value: "Em breve", hint: "A distribuição no Match continua fora deste escopo." },
                { label: "Slug público", value: slugify(draft.slug || draft.title || "pacote"), hint: "Usado para identificar o pacote internamente." },
                { label: "Publicação", value: draft.publication || "Catálogo público", hint: "A agência controla publicação sem afetar o futuro marketplace." },
              ]}
            />

            <DashboardCard title="Sugestões da IA" description="Placeholders premium, sem backend fake nesta fase.">
              <div className="space-y-3">
                {[
                  "IA em breve para melhorar descrição comercial e diferenciais do pacote.",
                  "Recomendação inteligente em breve para destacar oportunidades de publicação.",
                  "Impulsionamento e Match continuam planejados, sem fake backend neste fluxo.",
                ].map((item) => (
                  <div key={item} className="flex gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                    <WandSparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </DashboardCard>

            <SetupGuideCard
              title="Como estruturar melhor"
              description="O objetivo é transformar um pacote em material comercial pronto para a vitrine pública."
              steps={[
                "Descreva o destino com proposta comercial clara e sem depender de observações soltas.",
                "Use diferenciais e inclusos para orientar o valor percebido do pacote.",
                "Defina slug e publicação para deixar a vitrine consistente com a identidade da agência.",
              ]}
            />
          </>
        }
      >
        <WorkspaceSection title="Informações principais" description="Base comercial do pacote e posicionamento inicial.">
          <Field label="Nome do pacote" value={draft.title} onChange={(value) => updateField("title", value)} />
          <Field label="Destino" value={draft.destination} onChange={(value) => updateField("destination", value)} />
          <Field label="Preço" value={draft.price} onChange={(value) => updateField("price", value)} />
          <Field label="Status" value={draft.status} onChange={(value) => updateField("status", value)} />
          <div className="md:col-span-2">
            <TextAreaField label="Descrição comercial" rows={5} value={draft.description} onChange={(value) => updateField("description", value)} />
          </div>
        </WorkspaceSection>

        <DashboardCard title="Mídia do pacote" description="O catálogo deixa de ser só formulário e passa a operar como vitrine comercial pronta para distribuição.">
          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <MediaUploadCard
              title="Imagem principal do pacote"
              description="Preview local. O upload persistente será conectado depois."
              orientation="landscape"
              preview={coverPreview}
              onSelect={(file) => {
                const preview = fileToPreview(file)
                if (preview) setCoverPreview(preview)
              }}
              onRemove={() => setCoverPreview(defaultCover)}
            />
            <MediaUploadCard
              title="Thumb para Match"
              description="Mantido como preview local até a fase específica do Match."
              orientation="portrait"
              preview={matchThumbPreview}
              onSelect={(file) => {
                const preview = fileToPreview(file)
                if (preview) setMatchThumbPreview(preview)
              }}
              onRemove={() => setMatchThumbPreview(defaultThumb)}
            />
          </div>

          <div className="mt-5 rounded-[26px] border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Galeria do pacote</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">Use imagens complementares para enriquecer o catálogo público.</p>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-foreground">
                <ImagePlus className="h-4 w-4" />
                Adicionar imagens
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    addGalleryImages(event.target.files)
                    event.target.value = ""
                  }}
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {gallery.map((item, index) => (
                <div key={item.id} className="rounded-[24px] border border-white/10 bg-black/20 p-3 shadow-[0_16px_36px_rgba(0,0,0,0.16)]">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[20px]">
                    <img src={item.url} alt={`Galeria ${index + 1}`} className="h-full w-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/75 to-transparent p-3">
                      <div className="flex items-center gap-2 text-xs text-white/80">
                        <GripVertical className="h-3.5 w-3.5" />
                        Ordem {index + 1}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="rounded-full border-white/10 bg-white/[0.04]" onClick={() => moveGalleryItem(item.id, -1)}>
                      Subir
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-full border-white/10 bg-white/[0.04]" onClick={() => moveGalleryItem(item.id, 1)}>
                      Descer
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-full border-white/10 bg-white/[0.04]" onClick={() => setGallery((current) => current.filter((entry) => entry.id !== item.id))}>
                      <Trash2 className="h-3.5 w-3.5" />
                      Remover
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DashboardCard>

        <WorkspaceSection title="Proposta e experiência" description="O que faz o pacote parecer memorável e fácil de vender.">
          <div className="md:col-span-2">
            <TextAreaField label="Diferenciais" rows={4} value={draft.highlights} onChange={(value) => updateField("highlights", value)} />
          </div>
          <TextAreaField label="Inclusos" rows={4} value={draft.included} onChange={(value) => updateField("included", value)} />
          <TextAreaField label="Não inclusos" rows={4} value={draft.excluded} onChange={(value) => updateField("excluded", value)} />
          <Field label="Tags" value={draft.tags} onChange={(value) => updateField("tags", value)} />
          <Field label="Estilo da viagem" value={draft.style} onChange={(value) => updateField("style", value)} />
        </WorkspaceSection>

        <WorkspaceSection title="Distribuição e publicação" description="Como esse pacote será apresentado no catálogo e operado pela agência.">
          <Field label="CTA WhatsApp" value={draft.cta} onChange={(value) => updateField("cta", value)} />
          <Field label="Template visual" value={draft.template} onChange={(value) => updateField("template", value)} />
          <Field label="Publicação" value={draft.publication} onChange={(value) => updateField("publication", value)} />
          <Field label="Slug / SEO" value={draft.slug} onChange={(value) => updateField("slug", value)} />
          <div className="md:col-span-2">
            <TextAreaField label="Resumo SEO" rows={4} value={draft.seo} onChange={(value) => updateField("seo", value)} />
          </div>
        </WorkspaceSection>

        <DashboardCard title="Identidade da agência e observações" description="Conecte o pacote ao branding e ao contexto operacional da agência.">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-white/[0.05] via-white/[0.03] to-transparent p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-foreground">Template aplicado</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {draft.template} com identidade TravelPro e estrutura pronta para vitrine pública.
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-white/[0.05] via-white/[0.03] to-transparent p-4">
              <div className="flex items-center gap-3">
                <ImagePlus className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-foreground">Capa e mídia</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Estrutura pronta para sincronizar mídia persistente sem alterar esta experiência.
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-white/[0.05] via-white/[0.03] to-transparent p-4 md:col-span-2">
              <div className="mb-3 flex items-center gap-3">
                <Tag className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-foreground">Observações internas</p>
              </div>
              <textarea
                rows={5}
                value={draft.internalNotes}
                onChange={(event) => updateField("internalNotes", event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none"
              />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => void savePackage("Rascunho")} disabled={isSaving}>
              Salvar para revisão
            </Button>
            <SecondaryButton onClick={() => fire("Distribuição em breve", "Impulsionamento, Match e recomendação inteligente continuam como próximas etapas.")}>
              <Globe className="h-4 w-4" />
              Preparar distribuição
            </SecondaryButton>
            <PrimaryButton onClick={() => void savePackage("Publicado")} disabled={isSaving}>
              <Send className="h-4 w-4" />
              Publicar no catálogo
            </PrimaryButton>
          </div>
        </DashboardCard>
      </OperationalWorkspaceLayout>
    </PageShell>
  )
}

export default function NewCatalogPackagePage() {
  return (
    <Suspense fallback={null}>
      <CatalogPackageWorkspace />
    </Suspense>
  )
}
