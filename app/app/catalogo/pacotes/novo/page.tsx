"use client"

import Link from "next/link"
import { useMemo, useState, type ReactNode } from "react"
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

type GalleryItem = {
  id: string
  url: string
}

const initialDraft: PackageDraft = {
  title: "Lisboa Signature Escape",
  destination: "Lisboa, Portugal",
  price: "R$ 14.800",
  description: "Um pacote elegante para casais e pequenos grupos que buscam curadoria, conforto e experiências autorais na cidade.",
  highlights: "Hospedagem boutique, experiências gastronômicas, transfers privativos, concierge via WhatsApp.",
  included: "Hotel 5 noites, café da manhã, traslado, city experience, suporte da agência.",
  excluded: "Voos internacionais, seguro viagem, refeições livres e despesas pessoais.",
  tags: "Europa, romântico, premium, gastronômico",
  style: "Premium urbano",
  cta: "Falar com consultor",
  cover: "cover-lisboa-signature.jpg",
  status: "Rascunho",
  template: "Editorial Premium",
  slug: "lisboa-signature-escape",
  seo: "Pacote premium para Lisboa com roteiro elegante, hotel boutique e curadoria TravelPro.",
  internalNotes: "Priorizar abordagem para casais 30+ e campanhas de baixa temporada.",
  publication: "Catálogo público + Match desativado",
}

const initialGallery: GalleryItem[] = [
  {
    id: "gallery-1",
    url: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "gallery-2",
    url: "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "gallery-3",
    url: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=900&q=80",
  },
]

const defaultCover =
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80"
const defaultThumb =
  "https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?auto=format&fit=crop&w=720&q=80"
const defaultAgencyLogo =
  "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=320&q=80"

function fileToPreview(file: File | null) {
  if (!file) return null
  return URL.createObjectURL(file)
}

export default function NewCatalogPackagePage() {
  const [draft, setDraft] = useState<PackageDraft>(initialDraft)
  const [coverPreview, setCoverPreview] = useState<string | null>(defaultCover)
  const [matchThumbPreview, setMatchThumbPreview] = useState<string | null>(defaultThumb)
  const [gallery, setGallery] = useState<GalleryItem[]>(initialGallery)

  const previewTags = useMemo(
    () =>
      draft.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [draft.tags],
  )

  const updateField = <K extends keyof PackageDraft>(key: K, value: PackageDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }))

  const fire = (title: string, description: string) => toast({ title, description })

  const addGalleryImages = (files: FileList | null) => {
    if (!files?.length) return
    const additions = Array.from(files).map((file, index) => ({
      id: `gallery-new-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
    }))
    setGallery((current) => [...current, ...additions])
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

  return (
    <PageShell>
      <SectionHeader
        title="Novo pacote do catálogo"
        description="Monte um pacote com mais contexto, identidade e material pronto para a vitrine pública da agência."
        actions={
          <>
            <SecondaryButton asChild>
              <Link href="/app/catalogo">
                <ArrowLeft className="h-4 w-4" />
                Voltar ao catálogo
              </Link>
            </SecondaryButton>
            <SecondaryButton onClick={() => fire("Rascunho salvo", "O pacote foi salvo localmente como rascunho mockado.")}>
              <Save className="h-4 w-4" />
              Salvar rascunho
            </SecondaryButton>
            <PrimaryButton onClick={() => fire("Pacote preparado", "A publicação mockada do pacote foi preparada para o catálogo.")}>
              <Send className="h-4 w-4" />
              Publicar pacote
            </PrimaryButton>
          </>
        }
      />

      <OperationalWorkspaceLayout
        sidebar={
          <>
            <LivePreviewPanel
              title="Preview público"
              description="Uma mini landing page pronta para catálogo, Match e distribuição comercial."
              footer={
                <div className="flex flex-wrap gap-3">
                  <SecondaryButton onClick={() => fire("Preview aberto", "A visualização pública do pacote foi aberta em modo mockado.")}>
                    <Globe className="h-4 w-4" />
                    Abrir preview
                  </SecondaryButton>
                  <PrimaryButton onClick={() => fire("CTA preparado", "O CTA do pacote foi preparado com WhatsApp mockado.")}>
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
                        <img src={defaultAgencyLogo} alt="Logo da agência" className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-white">JT Viagens</p>
                        <div className="mt-1 flex items-center gap-1 text-sm text-white/75">
                          <MapPin className="h-3.5 w-3.5" />
                          São Paulo • Curadoria premium
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
                        <PrimaryButton onClick={() => fire("CTA comercial", "O CTA comercial foi preparado em modo mockado.")}>
                          <MessageSquareText className="h-4 w-4" />
                          {draft.cta}
                        </PrimaryButton>
                        <SecondaryButton onClick={() => fire("Preview Match", "A thumb e distribuição para Match foram simuladas.")}>
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
              description="Elementos que ajudam a IA e o catálogo a gerar uma apresentação mais forte."
              items={[
                { label: "Compatível com Match", value: "Sim • pronto para marketplace", hint: "Thumb dedicada e tags comerciais já alinhadas." },
                { label: "Score comercial", value: "84/100", hint: "Boa clareza de proposta, preço e diferenciais." },
                { label: "Potencial de conversão", value: "Alto", hint: "Ideal para campanhas de descoberta e remarketing." },
                { label: "Destaque premium", value: "Ativo", hint: "Pronto para usar em catálogo público, Agent e distribuição." },
              ]}
            />

            <DashboardCard title="Sugestões da IA" description="Placeholders visuais para a próxima fase inteligente do módulo.">
              <div className="space-y-3">
                {[
                  "IA sugere tornar a abertura mais emocional para elevar o Match score.",
                  "Adicionar prova social e um diferencial de concierge pode melhorar o CTA.",
                  "Slug e template já estão consistentes para SEO e distribuição pública.",
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
              description="O objetivo é transformar um pacote em material comercial pronto para operação e IA."
              steps={[
                "Descreva o destino com proposta comercial clara e sem depender de observações soltas.",
                "Use diferenciais e inclusos para orientar campanhas, vendedores e experiências geradas por IA.",
                "Defina slug, template e publicação para deixar a vitrine consistente com a identidade da agência.",
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
              description="Capa hero para catálogo público, proposta e distribuição comercial."
              orientation="landscape"
              preview={coverPreview}
              onSelect={(file) => {
                const preview = fileToPreview(file)
                if (preview) setCoverPreview(preview)
              }}
              onRemove={() => setCoverPreview(null)}
            />
            <MediaUploadCard
              title="Thumb para Match"
              description="Versão vertical pensada para feed, marketplace e distribuição em destaque."
              orientation="portrait"
              preview={matchThumbPreview}
              onSelect={(file) => {
                const preview = fileToPreview(file)
                if (preview) setMatchThumbPreview(preview)
              }}
              onRemove={() => setMatchThumbPreview(null)}
            />
          </div>

          <div className="mt-5 rounded-[26px] border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Galeria do pacote</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">Use imagens complementares para enriquecer o catálogo público e o material gerado pela IA.</p>
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
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-white/10 bg-white/[0.04]"
                      onClick={() => moveGalleryItem(item.id, -1)}
                    >
                      Subir
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-white/10 bg-white/[0.04]"
                      onClick={() => moveGalleryItem(item.id, 1)}
                    >
                      Descer
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-white/10 bg-white/[0.04]"
                      onClick={() => setGallery((current) => current.filter((entry) => entry.id !== item.id))}
                    >
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
                {draft.template} com identidade TravelPro e variações prontas para catálogo, proposta e futuras campanhas.
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-white/[0.05] via-white/[0.03] to-transparent p-4">
              <div className="flex items-center gap-3">
                <ImagePlus className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-foreground">Capa e mídia</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Estrutura pronta para receber upload real, curadoria visual e sincronização futura com o catálogo público.
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
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Preview salvo", "O pacote foi preparado para revisão interna em modo mockado.")}>
              Salvar para revisão
            </Button>
            <SecondaryButton onClick={() => fire("Canal preparado", "A distribuição do pacote para campanhas foi preparada em modo mockado.")}>
              <Globe className="h-4 w-4" />
              Preparar distribuição
            </SecondaryButton>
            <PrimaryButton onClick={() => fire("Pacote publicado", "A publicação mockada no catálogo foi concluída com sucesso.")}>
              <Send className="h-4 w-4" />
              Publicar no catálogo
            </PrimaryButton>
          </div>
        </DashboardCard>
      </OperationalWorkspaceLayout>
    </PageShell>
  )
}
