"use client"

import Link from "next/link"
import { useState } from "react"
import type { ReactNode } from "react"
import {
  ArrowLeft,
  BadgeCheck,
  Bot,
  FileCode2,
  Globe,
  Plus,
  Save,
  Send,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react"
import { LivePreviewPanel } from "@/components/system/live-preview-panel"
import { OperationalWorkspaceLayout } from "@/components/system/operational-workspace-layout"
import { PageShell } from "@/components/system/page-shell"
import { PrimaryButton } from "@/components/system/primary-button"
import { SecondaryButton } from "@/components/system/secondary-button"
import { SectionHeader } from "@/components/system/section-header"
import { SetupGuideCard } from "@/components/system/setup-guide-card"
import { WorkspaceSectionCard } from "@/components/system/workspace-section-card"
import { WorkspaceSidebarInfo } from "@/components/system/workspace-sidebar-info"
import { SmartActionButton } from "@/components/system/smart-action-button"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

const initialVariables = [
  "{{cliente_nome}}",
  "{{destino}}",
  "{{embarque}}",
  "{{retorno}}",
  "{{valor_total}}",
]

const agencyCustomizationOptions = [
  "logo",
  "cor principal",
  "rodapé",
  "assinatura",
  "whatsapp",
  "instagram",
  "observações",
  "capa",
  "fontes",
]

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

function FieldSelect({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (value: string) => void
  options: string[]
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none"
    >
      {options.map((option) => (
        <option key={option} value={option} className="bg-background">
          {option}
        </option>
      ))}
    </select>
  )
}

function TemplateUploadCard({
  fileName,
  onChange,
}: {
  fileName: string
  onChange: (fileName: string) => void
}) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-4 shadow-[0_16px_36px_rgba(0,0,0,0.12)] md:col-span-2">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Upload do template</p>
          <p className="text-xs leading-5 text-muted-foreground">
            Estrutura preparada para receber DOCX, PDF ou HTML no fluxo real.
          </p>
        </div>
        <div className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-primary">
          IA Ready
        </div>
      </div>

      <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[24px] border border-dashed border-white/15 bg-gradient-to-br from-white/[0.06] via-white/[0.03] to-transparent px-6 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-primary">
          <UploadCloud className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Arraste o arquivo oficial ou clique para anexar</p>
          <p className="text-xs leading-5 text-muted-foreground">
            O upload real será conectado depois sem alterar esta experiência.
          </p>
        </div>
        <input
          type="file"
          accept=".doc,.docx,.pdf,.html,.htm"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) onChange(file.name)
            event.target.value = ""
          }}
        />
      </label>

      <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.04] text-primary">
            <FileCode2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{fileName}</p>
            <p className="text-xs text-muted-foreground">Estrutura base pronta para variáveis, branding e IA.</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full border-white/10 bg-white/[0.04]"
          onClick={() => onChange("Template institucional TravelPro.docx")}
        >
          Alterar
        </Button>
      </div>
    </div>
  )
}

export function MasterTemplateWorkspace() {
  const [name, setName] = useState("Template Contrato Premium Signature")
  const [category, setCategory] = useState("Contrato")
  const [destinationSection, setDestinationSection] = useState("Documentos")
  const [description, setDescription] = useState(
    "Modelo oficial para contratos premium com leitura clara, branding adaptável e campos preparados para automação.",
  )
  const [version, setVersion] = useState("v3.4")
  const [pricingTier, setPricingTier] = useState("Premium")
  const [fileName, setFileName] = useState("Template institucional TravelPro.docx")
  const [variables, setVariables] = useState(initialVariables)
  const [nextVariable, setNextVariable] = useState("")
  const [enabledCompatibilities, setEnabledCompatibilities] = useState<string[]>(["IA", "Go", "Agent"])
  const [customizableFields, setCustomizableFields] = useState<string[]>([
    "logo",
    "cor principal",
    "rodapé",
    "assinatura",
    "whatsapp",
    "capa",
  ])

  const toggleCompatibility = (item: string) => {
    setEnabledCompatibilities((current) =>
      current.includes(item) ? current.filter((value) => value !== item) : [...current, item],
    )
  }

  const toggleCustomField = (item: string) => {
    setCustomizableFields((current) =>
      current.includes(item) ? current.filter((value) => value !== item) : [...current, item],
    )
  }

  const addVariable = () => {
    const normalized = nextVariable.trim()
    if (!normalized) return
    const wrapped = normalized.startsWith("{{") ? normalized : `{{${normalized.replace(/[{}]/g, "")}}}`
    if (!variables.includes(wrapped)) {
      setVariables((current) => [...current, wrapped])
    }
    setNextVariable("")
  }

  return (
    <PageShell>
      <SectionHeader
        title="Novo template oficial"
        description="Crie um modelo TravelPro pronto para IA, Go, Agent, Atlas e operação estruturada das agências."
        actions={
          <>
            <SecondaryButton asChild>
              <Link href="/master/templates">
                <ArrowLeft className="h-4 w-4" />
                Voltar para templates
              </Link>
            </SecondaryButton>
            <SmartActionButton
              label="Publicar template com IA"
              description="A IA poderá sugerir variáveis, consistência editorial e compatibilidade operacional."
            />
            <SecondaryButton
              onClick={() =>
                toast({
                  title: "Rascunho salvo",
                  description: "O template oficial foi salvo localmente em modo mockado.",
                })
              }
            >
              <Save className="h-4 w-4" />
              Salvar rascunho
            </SecondaryButton>
            <PrimaryButton
              onClick={() =>
                toast({
                  title: "Template publicado",
                  description: "O novo template oficial foi preparado em modo mockado para distribuição.",
                })
              }
            >
              <Send className="h-4 w-4" />
              Publicar template
            </PrimaryButton>
          </>
        }
      />

      <OperationalWorkspaceLayout
        sidebar={
          <>
            <LivePreviewPanel
              title="Preview oficial"
              description="Leitura lateral do documento com branding aplicado e sinalização de compatibilidade."
              footer={
                <SecondaryButton
                  onClick={() =>
                    toast({
                      title: "Preview expandido",
                      description: "O preview oficial foi preparado em modo mockado.",
                    })
                  }
                >
                  <Globe className="h-4 w-4" />
                  Abrir preview
                </SecondaryButton>
              }
            >
              <div className="overflow-hidden rounded-[24px] border border-white/8 bg-black/25">
                <div className="border-b border-white/8 bg-gradient-to-r from-primary/25 via-primary/10 to-transparent px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-primary/75">TravelPro template</p>
                      <h2 className="mt-1 text-lg font-semibold text-foreground">{name}</h2>
                    </div>
                    <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-primary">
                      IA Ready
                    </div>
                  </div>
                </div>
                <div className="space-y-4 px-5 py-5">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-muted-foreground">
                      {category}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-muted-foreground">
                      {destinationSection}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-muted-foreground">
                      {version}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">{description}</p>
                  <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <BadgeCheck className="h-4 w-4 text-primary" />
                      Variáveis dinâmicas
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {variables.slice(0, 5).map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] text-muted-foreground"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Branding personalizável
                    </div>
                    <div className="mt-3 grid gap-2">
                      {customizableFields.slice(0, 4).map((item) => (
                        <div key={item} className="rounded-2xl border border-white/8 bg-black/20 px-3 py-2 text-xs text-muted-foreground">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </LivePreviewPanel>

            <WorkspaceSidebarInfo
              title="Distribuição planejada"
              description="Leitura rápida do escopo do template dentro do ecossistema TravelPro."
              items={[
                { label: "Plano", value: pricingTier },
                { label: "Compatibilidade", value: enabledCompatibilities.join(" • ") || "Definir" },
                { label: "Campos da agência", value: `${customizableFields.length} ativos` },
              ]}
            />

            <SetupGuideCard
              title="Como este template será usado"
              description="Estrutura preparada para escalar sem virar um formulário isolado."
              steps={[
                "O Master publica o modelo oficial com variáveis, branding e compatibilidade definida.",
                "A agência ativa o template, aplica identidade e escolhe quando ele vira padrão.",
                "Go, Agent, Atlas e IA podem reaproveitar a estrutura sem recriar o documento do zero.",
              ]}
            />
          </>
        }
      >
        <WorkspaceSectionCard
          title="Informações principais"
          description="Base editorial, categoria, escopo e leitura comercial do template oficial."
        >
          <label className="space-y-2">
            <FieldLabel>Nome do template</FieldLabel>
            <FieldInput value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label className="space-y-2">
            <FieldLabel>Categoria</FieldLabel>
            <FieldSelect
              value={category}
              onChange={setCategory}
              options={["Contrato", "Roteiro", "Cotação", "Voucher", "Documento operacional"]}
            />
          </label>
          <label className="space-y-2">
            <FieldLabel>Sessão destino</FieldLabel>
            <FieldSelect
              value={destinationSection}
              onChange={setDestinationSection}
              options={["Documentos", "Viagens", "Comercial", "Marketplace", "Operação"]}
            />
          </label>
          <label className="space-y-2">
            <FieldLabel>Versão</FieldLabel>
            <FieldInput value={version} onChange={(event) => setVersion(event.target.value)} />
          </label>
          <label className="space-y-2 md:col-span-2">
            <FieldLabel>Descrição</FieldLabel>
            <FieldTextarea rows={4} value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
          <label className="space-y-2">
            <FieldLabel>Modelo comercial</FieldLabel>
            <FieldSelect value={pricingTier} onChange={setPricingTier} options={["Free", "Premium"]} />
          </label>
          <div className="space-y-3">
            <FieldLabel>Compatibilidade</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {["IA", "Go", "Agent", "Atlas"].map((item) => {
                const active = enabledCompatibilities.includes(item)
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleCompatibility(item)}
                    className={`rounded-full border px-3 py-2 text-xs transition-all ${
                      active
                        ? "border-primary/20 bg-primary/10 text-primary"
                        : "border-white/10 bg-white/[0.03] text-muted-foreground"
                    }`}
                  >
                    {item}
                  </button>
                )
              })}
            </div>
          </div>
        </WorkspaceSectionCard>

        <WorkspaceSectionCard
          title="Estrutura do arquivo"
          description="Upload elegante do template base e leitura do material que será distribuído às agências."
        >
          <TemplateUploadCard fileName={fileName} onChange={setFileName} />
        </WorkspaceSectionCard>

        <WorkspaceSectionCard
          title="Variáveis dinâmicas"
          description="Defina os campos que a operação, a IA e o Go poderão preencher automaticamente."
        >
          <div className="space-y-2 md:col-span-2">
            <FieldLabel>Adicionar variável</FieldLabel>
            <div className="flex flex-col gap-3 md:flex-row">
              <FieldInput
                value={nextVariable}
                onChange={(event) => setNextVariable(event.target.value)}
                placeholder="cliente_nome"
              />
              <Button className="rounded-full" onClick={addVariable}>
                <Plus className="h-4 w-4" />
                Adicionar variável
              </Button>
            </div>
          </div>
          <div className="space-y-3 md:col-span-2">
            <FieldLabel>Variáveis ativas</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {variables.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setVariables((current) => current.filter((value) => value !== item))}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-muted-foreground transition-all hover:border-primary/15 hover:text-foreground"
                >
                  {item}
                  <X className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
          </div>
        </WorkspaceSectionCard>

        <WorkspaceSectionCard
          title="Campos personalizáveis da agência"
          description="Escolha o que cada agência poderá adaptar sem quebrar a estrutura oficial do template."
        >
          <div className="grid gap-3 md:col-span-2 md:grid-cols-2">
            {agencyCustomizationOptions.map((item) => {
              const active = customizableFields.includes(item)
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleCustomField(item)}
                  className={`flex items-center justify-between rounded-[22px] border px-4 py-3 text-left transition-all ${
                    active
                      ? "border-primary/20 bg-primary/10 text-foreground"
                      : "border-white/10 bg-white/[0.03] text-muted-foreground"
                  }`}
                >
                  <span className="text-sm capitalize">{item}</span>
                  {active ? <BadgeCheck className="h-4 w-4 text-primary" /> : <Bot className="h-4 w-4" />}
                </button>
              )
            })}
          </div>
        </WorkspaceSectionCard>
      </OperationalWorkspaceLayout>
    </PageShell>
  )
}
