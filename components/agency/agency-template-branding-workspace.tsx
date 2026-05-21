"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import type { ReactNode } from "react"
import { ArrowLeft, Globe, Save, Send, ShieldCheck, Sparkles } from "lucide-react"
import { LivePreviewPanel } from "@/components/system/live-preview-panel"
import { MediaUploadCard } from "@/components/system/media-upload-card"
import { OperationalWorkspaceLayout } from "@/components/system/operational-workspace-layout"
import { PageShell } from "@/components/system/page-shell"
import { PrimaryButton } from "@/components/system/primary-button"
import { SecondaryButton } from "@/components/system/secondary-button"
import { SectionHeader } from "@/components/system/section-header"
import { SetupGuideCard } from "@/components/system/setup-guide-card"
import { SmartActionButton } from "@/components/system/smart-action-button"
import { WorkspaceSectionCard } from "@/components/system/workspace-section-card"
import { WorkspaceSidebarInfo } from "@/components/system/workspace-sidebar-info"
import { toast } from "@/components/ui/use-toast"

type AgencyTemplateBrandingWorkspaceProps = {
  initialTemplate?: string | null
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <span className="text-xs uppercase tracking-[0.18em] text-primary/75">{children}</span>
}

function FieldInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
    />
  )
}

function FieldTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
    />
  )
}

export function AgencyTemplateBrandingWorkspace({
  initialTemplate,
}: AgencyTemplateBrandingWorkspaceProps) {
  const templateName = useMemo(() => {
    if (!initialTemplate) return "Contrato Signature TravelPro"
    return decodeURIComponent(initialTemplate).replace(/-/g, " ")
  }, [initialTemplate])

  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [brandColor, setBrandColor] = useState("#FF6A1A")
  const [signature, setSignature] = useState("Equipe TravelPro Atlântico Premium")
  const [whatsapp, setWhatsapp] = useState("+55 11 99876-4321")
  const [instagram, setInstagram] = useState("@atlantico.premium")
  const [site, setSite] = useState("www.atlanticopremium.com.br")
  const [slogan, setSlogan] = useState("Viagens com assinatura consultiva e execução impecável.")
  const [footer, setFooter] = useState("Documento emitido pela agência com suporte TravelPro.")

  const handlePreviewFile = (
    setter: (value: string | null) => void,
    file: File | null,
  ) => {
    if (!file) return
    setter(URL.createObjectURL(file))
  }

  return (
    <PageShell>
      <SectionHeader
        title="Personalizar modelo ativo"
        description="Aplique branding, canais oficiais e identidade institucional aos templates escolhidos pela agência."
        actions={
          <>
            <SecondaryButton asChild>
              <Link href="/app/documentos/templates">
                <ArrowLeft className="h-4 w-4" />
                Voltar para templates
              </Link>
            </SecondaryButton>
            <SmartActionButton
              label="Configurar com IA"
              description="A IA poderá sugerir branding, variações institucionais e ajustes de apresentação."
            />
            <SecondaryButton
              onClick={() =>
                toast({
                  title: "Rascunho salvo",
                  description: "A identidade do template foi salva localmente em modo mockado.",
                })
              }
            >
              <Save className="h-4 w-4" />
              Salvar rascunho
            </SecondaryButton>
            <PrimaryButton
              onClick={() =>
                toast({
                  title: "Personalização aplicada",
                  description: "O template ativo foi atualizado em modo mockado.",
                })
              }
            >
              <Send className="h-4 w-4" />
              Salvar personalização
            </PrimaryButton>
          </>
        }
      />

      <OperationalWorkspaceLayout
        sidebar={
          <>
            <LivePreviewPanel
              title="Preview da agência"
              description="Leitura rápida de como a identidade aparecerá nos documentos emitidos."
              footer={
                <SecondaryButton
                  onClick={() =>
                    toast({
                      title: "Preview preparado",
                      description: "A leitura pública do template foi preparada em modo mockado.",
                    })
                  }
                >
                  <Globe className="h-4 w-4" />
                  Abrir preview
                </SecondaryButton>
              }
            >
              <div className="overflow-hidden rounded-[24px] border border-white/8 bg-black/25">
                <div
                  className="relative border-b border-white/8 px-5 py-6"
                  style={{
                    background: `linear-gradient(135deg, ${brandColor}44 0%, rgba(255,255,255,0.02) 65%, rgba(0,0,0,0.2) 100%)`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05]">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo da agência" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-sm font-semibold text-primary">TP</span>
                      )}
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-primary/75">Template ativo</p>
                      <h2 className="mt-1 text-lg font-semibold text-foreground">{templateName}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">{slogan}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 px-5 py-5">
                  <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-primary/75">Canais institucionais</p>
                    <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                      <p>{whatsapp}</p>
                      <p>{instagram}</p>
                      <p>{site}</p>
                    </div>
                  </div>
                  <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      Assinatura e rodapé
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{signature}</p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">{footer}</p>
                  </div>
                  <div className="rounded-[22px] border border-primary/15 bg-primary/10 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Compatível com TravelPro Go
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Este modelo poderá ser utilizado automaticamente pelo Go para contratos, roteiros,
                      vouchers e documentos operacionais.
                    </p>
                  </div>
                </div>
              </div>
            </LivePreviewPanel>

            <WorkspaceSidebarInfo
              title="Leitura operacional"
              description="A identidade aplicada aqui poderá ser reutilizada por IA, Go, Agent e operação."
              items={[
                { label: "Template", value: templateName },
                { label: "Cor principal", value: brandColor.toUpperCase() },
                { label: "Canais ativos", value: "WhatsApp • Instagram • Site" },
              ]}
            />

            <SetupGuideCard
              title="Uso futuro dentro da plataforma"
              description="Estrutura pronta para a próxima camada inteligente do TravelPro."
              steps={[
                "Go poderá montar documentos e enviar variações da agência via WhatsApp.",
                "Agent poderá notificar leads e clientes com materiais consistentes.",
                "Marketing IA e Atlas poderão reutilizar esta assinatura institucional sem retrabalho.",
              ]}
            />
          </>
        }
      >
        <WorkspaceSectionCard
          title="Identidade visual da marca"
          description="Faça o ajuste fino da assinatura visual oficial sem criar templates estruturais do zero."
        >
          <div className="md:col-span-2">
            <MediaUploadCard
              title="Logo da agência"
              description="Logo principal para documentos, contratos, roteiros e materiais emitidos."
              preview={logoPreview}
              orientation="landscape"
              onSelect={(file) => handlePreviewFile(setLogoPreview, file)}
              onRemove={() => setLogoPreview(null)}
            />
          </div>
          <MediaUploadCard
            title="Favicon"
            description="Ícone compacto para experiências web, links públicos e atalhos."
            preview={faviconPreview}
            orientation="square"
            onSelect={(file) => handlePreviewFile(setFaviconPreview, file)}
            onRemove={() => setFaviconPreview(null)}
          />
          <MediaUploadCard
            title="Capa institucional"
            description="Imagem de apoio para contratos premium, propostas e documentos comerciais."
            preview={coverPreview}
            orientation="landscape"
            onSelect={(file) => handlePreviewFile(setCoverPreview, file)}
            onRemove={() => setCoverPreview(null)}
          />
          <label className="space-y-2">
            <FieldLabel>Cor principal</FieldLabel>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <input
                type="color"
                value={brandColor}
                onChange={(event) => setBrandColor(event.target.value)}
                className="h-10 w-10 cursor-pointer rounded-xl border border-white/10 bg-transparent"
              />
              <FieldInput value={brandColor} onChange={(event) => setBrandColor(event.target.value)} />
            </div>
          </label>
        </WorkspaceSectionCard>

        <WorkspaceSectionCard
          title="Canais e assinatura"
          description="Informações institucionais que ajudam a agência a manter consistência em todos os modelos ativos."
        >
          <label className="space-y-2">
            <FieldLabel>Assinatura padrão</FieldLabel>
            <FieldInput value={signature} onChange={(event) => setSignature(event.target.value)} />
          </label>
          <label className="space-y-2">
            <FieldLabel>WhatsApp</FieldLabel>
            <FieldInput value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} />
          </label>
          <label className="space-y-2">
            <FieldLabel>Instagram</FieldLabel>
            <FieldInput value={instagram} onChange={(event) => setInstagram(event.target.value)} />
          </label>
          <label className="space-y-2">
            <FieldLabel>Site</FieldLabel>
            <FieldInput value={site} onChange={(event) => setSite(event.target.value)} />
          </label>
          <label className="space-y-2">
            <FieldLabel>Slogan</FieldLabel>
            <FieldInput value={slogan} onChange={(event) => setSlogan(event.target.value)} />
          </label>
          <label className="space-y-2 md:col-span-2">
            <FieldLabel>Rodapé institucional</FieldLabel>
            <FieldTextarea rows={4} value={footer} onChange={(event) => setFooter(event.target.value)} />
          </label>
        </WorkspaceSectionCard>
      </OperationalWorkspaceLayout>
    </PageShell>
  )
}
