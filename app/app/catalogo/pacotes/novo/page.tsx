"use client"

import Link from "next/link"
import { useMemo, useState, type ReactNode } from "react"
import {
  ArrowLeft,
  Globe,
  ImagePlus,
  MessageSquareText,
  Save,
  Send,
  Sparkles,
  Tag,
} from "lucide-react"
import { DashboardCard } from "@/components/system/dashboard-card"
import { LivePreviewPanel } from "@/components/system/live-preview-panel"
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

export default function NewCatalogPackagePage() {
  const [draft, setDraft] = useState<PackageDraft>(initialDraft)

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
              description="Leitura viva do pacote como vitrine da agência."
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
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
                <div className="rounded-[22px] border border-dashed border-primary/25 bg-gradient-to-br from-primary/12 via-primary/5 to-transparent px-4 py-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-primary/75">{draft.status}</p>
                      <h2 className="mt-2 text-xl font-semibold text-foreground">{draft.title || "Seu novo pacote"}</h2>
                      <p className="mt-2 text-sm text-muted-foreground">{draft.destination || "Destino principal"}</p>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-sm font-medium text-foreground">
                      {draft.price || "Preço"}
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    {draft.description || "Descreva o pacote para começar a visualizar sua vitrine pública."}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {previewTags.length ? (
                      previewTags.map((tag) => (
                        <span key={tag} className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] text-muted-foreground">
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] text-muted-foreground">
                        Tags do pacote
                      </span>
                    )}
                  </div>
                  <div className="mt-5 grid gap-3">
                    <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-primary/75">Diferenciais</p>
                      <p className="mt-2 text-sm text-muted-foreground">{draft.highlights || "Adicione diferenciais claros para enriquecer o pacote."}</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-primary/75">Inclusos</p>
                      <p className="mt-2 text-sm text-muted-foreground">{draft.included || "Liste tudo o que já está coberto na proposta."}</p>
                    </div>
                  </div>
                </div>
              </div>
            </LivePreviewPanel>

            <WorkspaceSidebarInfo
              title="Leitura operacional"
              description="Elementos que ajudam a IA e o catálogo a gerar uma apresentação mais forte."
              items={[
                { label: "Template visual", value: draft.template || "Selecione um template", hint: "Define o estilo de apresentação pública." },
                { label: "Slug público", value: draft.slug || "slug-do-pacote", hint: "Usado em SEO, catálogo e campanhas." },
                { label: "Publicação", value: draft.publication || "Defina os canais", hint: "Controle catálogo, Match e distribuição." },
              ]}
            />

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
            <TextAreaField
              label="Descrição comercial"
              rows={5}
              value={draft.description}
              onChange={(value) => updateField("description", value)}
            />
          </div>
        </WorkspaceSection>

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
          <Field label="Imagem ou capa" value={draft.cover} onChange={(value) => updateField("cover", value)} />
          <Field label="Template visual" value={draft.template} onChange={(value) => updateField("template", value)} />
          <Field label="Publicação" value={draft.publication} onChange={(value) => updateField("publication", value)} />
          <Field label="Slug / SEO" value={draft.slug} onChange={(value) => updateField("slug", value)} />
          <div className="md:col-span-2">
            <TextAreaField label="Resumo SEO" rows={4} value={draft.seo} onChange={(value) => updateField("seo", value)} />
          </div>
        </WorkspaceSection>

        <DashboardCard title="Identidade da agência e observações" description="Conecte o pacote ao branding e ao contexto operacional da agência.">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-foreground">Template aplicado</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {draft.template} com identidade TravelPro e variações prontas para catálogo, proposta e futuras campanhas.
              </p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <div className="flex items-center gap-3">
                <ImagePlus className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-foreground">Capa e mídia</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Estrutura pronta para receber upload real, curadoria visual e sincronização futura com o catálogo público.
              </p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 md:col-span-2">
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
