"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, BadgeCheck, Bot, Copy, Save, Send, Sparkles, X } from "lucide-react"
import { DashboardCard } from "@/components/system/dashboard-card"
import { PageShell } from "@/components/system/page-shell"
import { SectionHeader } from "@/components/system/section-header"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import type { MasterAgencyOverview, MasterTemplateDetail, MasterTemplateInput } from "@/types/master"

type AgencyOption = { id: string; name: string }

const compatibilityOptions = ["IA", "Go", "Agent", "Atlas", "Relatorios", "Catalogo"]
const customizableOptions = ["logo", "cor principal", "rodape", "assinatura", "whatsapp", "instagram", "capa", "fontes"]

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
    throw new Error((payload as { error?: string } | null)?.error || "Nao foi possivel concluir a operacao.")
  }

  return payload as T
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <span className="text-xs uppercase tracking-[0.18em] text-primary/75">{children}</span>
}

function FieldInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70" />
}

function FieldTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70" />
}

function ToggleChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-2 text-xs transition-all ${
        active ? "border-primary/20 bg-primary/10 text-primary" : "border-white/10 bg-white/[0.03] text-muted-foreground"
      }`}
    >
      {label}
    </button>
  )
}

export function MasterTemplateWorkspace({
  initialTemplateId,
  initialSourceId,
}: {
  initialTemplateId?: string | null
  initialSourceId?: string | null
}) {
  const router = useRouter()
  const templateId = initialTemplateId || null
  const sourceId = initialSourceId || null
  const isEditing = Boolean(templateId)

  const [agencyOptions, setAgencyOptions] = useState<AgencyOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [agencyId, setAgencyId] = useState("")
  const [title, setTitle] = useState("")
  const [templateType, setTemplateType] = useState<MasterTemplateInput["template_type"]>("Documento")
  const [status, setStatus] = useState("Rascunho")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [version, setVersion] = useState("v1.0")
  const [pricingTier, setPricingTier] = useState("Premium")
  const [fileName, setFileName] = useState("Template oficial TravelPro")
  const [isOfficial, setIsOfficial] = useState(true)
  const [compatibilities, setCompatibilities] = useState<string[]>(["Relatorios"])
  const [customizableFields, setCustomizableFields] = useState<string[]>(["logo", "cor principal", "rodape"])
  const [variables, setVariables] = useState<string[]>(["{{cliente_nome}}", "{{periodo}}"])
  const [nextVariable, setNextVariable] = useState("")

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        setIsLoading(true)
        const [agencies, template] = await Promise.all([
          requestJson<MasterAgencyOverview>("/api/master/agencies?status=Todos"),
          templateId || sourceId ? requestJson<MasterTemplateDetail>(`/api/master/templates/${templateId || sourceId}`) : Promise.resolve(null),
        ])
        if (!active) return

        setAgencyOptions((agencies.items ?? []).map((item) => ({ id: item.id, name: item.name })))

        if (template) {
          setAgencyId(template.agency_id)
          setTitle(sourceId && !templateId ? `${template.title} - copia` : template.title)
          setTemplateType(template.template_type)
          setStatus(templateId ? template.status : "Rascunho")
          setCategory(template.category || "")
          setDescription(template.description || "")
          setVersion(template.version || "v1.0")
          setPricingTier(template.pricing_tier || "Premium")
          setFileName(template.file_name || "Template oficial TravelPro")
          setIsOfficial(sourceId && !templateId ? false : template.is_official)
          setCompatibilities(template.compatibilities.length ? template.compatibilities : ["Relatorios"])
          setCustomizableFields(template.customizable_fields.length ? template.customizable_fields : ["logo", "cor principal", "rodape"])
          setVariables(template.variables.length ? template.variables : ["{{cliente_nome}}", "{{periodo}}"])
        } else if (agencies.items?.[0]) {
          setAgencyId(agencies.items[0].id)
          setTitle("Template oficial TravelPro")
          setDescription("Modelo oficial da plataforma pronto para distribuicao e uso operacional.")
          setCategory("Institucional")
        }
      } catch (error) {
        toast({ title: "Falha ao carregar", description: error instanceof Error ? error.message : "Nao foi possivel carregar o workspace de template." })
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [sourceId, templateId])

  const selectedAgencyName = useMemo(
    () => agencyOptions.find((item) => item.id === agencyId)?.name || "Selecione a agencia base",
    [agencyId, agencyOptions],
  )

  const toggleValue = (value: string, items: string[], setter: (items: string[]) => void) => {
    setter(items.includes(value) ? items.filter((entry) => entry !== value) : [...items, value])
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

  const saveTemplate = async (nextStatus: string) => {
    if (!agencyId) {
      toast({ title: "Agencia obrigatoria", description: "Selecione a agencia base para persistir o template com seguranca." })
      return
    }

    try {
      setIsSaving(true)
      const payload: MasterTemplateInput = {
        agency_id: agencyId,
        title: title.trim(),
        template_type: templateType,
        status: nextStatus,
        category: category.trim() || null,
        description: description.trim() || null,
        version: version.trim() || null,
        pricing_tier: pricingTier.trim() || null,
        file_name: fileName.trim() || null,
        is_official: isOfficial,
        compatibilities,
        customizable_fields: customizableFields,
        variables,
      }

      if (templateId) {
        await requestJson(`/api/master/templates/${templateId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        })
      } else {
        await requestJson("/api/master/templates", {
          method: "POST",
          body: JSON.stringify(payload),
        })
      }

      toast({
        title: templateId ? "Template atualizado" : "Template criado",
        description: nextStatus.toLowerCase().includes("public") ? "O template foi salvo e publicado na biblioteca oficial." : "O template foi salvo com os dados reais da plataforma.",
      })
      router.push("/master/templates")
      router.refresh()
    } catch (error) {
      toast({ title: "Falha ao salvar", description: error instanceof Error ? error.message : "Nao foi possivel salvar o template." })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <PageShell>
      <SectionHeader
        title={isEditing ? "Editar template" : sourceId ? "Duplicar template" : "Novo template oficial"}
        description="Biblioteca oficial do TravelPro com persistencia real, sem engine de IA ou marketplace de templates nesta etapa."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="rounded-full border-white/10 bg-white/[0.03]">
              <Link href="/master/templates">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para templates
              </Link>
            </Button>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => toast({ title: "IA em breve", description: "A geracao inteligente de templates continua futura e sem backend fake nesta etapa." })}>
              <Bot className="mr-2 h-4 w-4" />
              Publicar template com IA
            </Button>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => void saveTemplate("Rascunho")} disabled={isSaving || isLoading}>
              <Save className="mr-2 h-4 w-4" />
              Salvar rascunho
            </Button>
            <Button className="rounded-full" onClick={() => void saveTemplate("Publicado")} disabled={isSaving || isLoading}>
              <Send className="mr-2 h-4 w-4" />
              {isSaving ? "Salvando..." : "Publicar template"}
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <DashboardCard title="Base operacional" description="Defina a agencia base, o tipo, a categoria e o status do template oficial.">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <FieldLabel>Agencia base</FieldLabel>
                <select value={agencyId} onChange={(event) => setAgencyId(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none">
                  <option value="" className="bg-background">Selecione</option>
                  {agencyOptions.map((item) => (
                    <option key={item.id} value={item.id} className="bg-background">{item.name}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <FieldLabel>Status</FieldLabel>
                <select value={status} onChange={(event) => setStatus(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none">
                  {["Rascunho", "Ativo", "Publicado", "Inativo"].map((item) => (
                    <option key={item} value={item} className="bg-background">{item}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 md:col-span-2">
                <FieldLabel>Nome do template</FieldLabel>
                <FieldInput value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Template oficial TravelPro" />
              </label>
              <label className="space-y-2">
                <FieldLabel>Tipo</FieldLabel>
                <select value={templateType} onChange={(event) => setTemplateType(event.target.value as MasterTemplateInput["template_type"])} className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none">
                  {["Documento", "Relatorio", "Roteiro", "Cotacao", "Catalogo"].map((item) => (
                    <option key={item} value={item} className="bg-background">{item}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <FieldLabel>Categoria</FieldLabel>
                <FieldInput value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Institucional" />
              </label>
              <label className="space-y-2">
                <FieldLabel>Versao</FieldLabel>
                <FieldInput value={version} onChange={(event) => setVersion(event.target.value)} />
              </label>
              <label className="space-y-2">
                <FieldLabel>Modelo comercial</FieldLabel>
                <select value={pricingTier} onChange={(event) => setPricingTier(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none">
                  {["Free", "Premium", "Enterprise"].map((item) => (
                    <option key={item} value={item} className="bg-background">{item}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 md:col-span-2">
                <FieldLabel>Descricao</FieldLabel>
                <FieldTextarea rows={4} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Contexto editorial e operacional do template oficial." />
              </label>
              <label className="space-y-2 md:col-span-2">
                <FieldLabel>Nome do arquivo base</FieldLabel>
                <FieldInput value={fileName} onChange={(event) => setFileName(event.target.value)} placeholder="template-oficial-travelpro.docx" />
              </label>
            </div>
          </DashboardCard>

          <DashboardCard title="Compatibilidades e campos" description="Marque o que esse template conversa hoje e o que cada agencia pode personalizar.">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <FieldLabel>Compatibilidades</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {compatibilityOptions.map((item) => (
                    <ToggleChip key={item} label={item} active={compatibilities.includes(item)} onClick={() => toggleValue(item, compatibilities, setCompatibilities)} />
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <FieldLabel>Campos personalizaveis</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {customizableOptions.map((item) => (
                    <ToggleChip key={item} label={item} active={customizableFields.includes(item)} onClick={() => toggleValue(item, customizableFields, setCustomizableFields)} />
                  ))}
                </div>
              </div>
            </div>
            <label className="mt-4 flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <input type="checkbox" checked={isOfficial} onChange={(event) => setIsOfficial(event.target.checked)} className="h-4 w-4 rounded border-white/10 bg-white/[0.03]" />
              <div>
                <p className="text-sm font-medium text-foreground">Marcar como template oficial da plataforma</p>
                <p className="text-xs text-muted-foreground">Quando ativo, o template aparece como biblioteca homologada do TravelPro.</p>
              </div>
            </label>
          </DashboardCard>

          <DashboardCard title="Variaveis dinamicas" description="Base para documentos, relatorios, roteiros e outras automacoes futuras.">
            <div className="flex flex-col gap-3 md:flex-row">
              <FieldInput value={nextVariable} onChange={(event) => setNextVariable(event.target.value)} placeholder="cliente_nome" />
              <Button className="rounded-full" onClick={addVariable}>
                <Sparkles className="mr-2 h-4 w-4" />
                Adicionar variavel
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {variables.map((item) => (
                <button key={item} type="button" onClick={() => setVariables((current) => current.filter((entry) => entry !== item))} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-muted-foreground transition-all hover:border-primary/15 hover:text-foreground">
                  {item}
                  <X className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
          </DashboardCard>
        </div>

        <div className="space-y-6">
          <DashboardCard title="Preview oficial" description="Leitura lateral da estrutura que sera distribuida na biblioteca oficial.">
            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-base font-semibold text-foreground">{title || "Novo template"}</p>
                {isOfficial ? <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-primary">Oficial</span> : null}
                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{templateType}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{description || "Descreva o objetivo operacional do template."}</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-primary/70">Agencia base</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{selectedAgencyName}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-primary/70">Arquivo</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{fileName || "Sem arquivo"}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-primary/70">Compatibilidades</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{compatibilities.join(" • ") || "Sem marcacao"}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-primary/70">Personalizacao</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{customizableFields.join(" • ") || "Sem marcacao"}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {variables.slice(0, 8).map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-muted-foreground">{item}</span>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => toast({ title: "Preview em foco", description: "O preview oficial ja esta visivel nesta lateral do workspace." })}>
                <BadgeCheck className="mr-2 h-4 w-4" />
                Abrir preview
              </Button>
              <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => router.push("/master/templates")}>
                <Copy className="mr-2 h-4 w-4" />
                Voltar para biblioteca
              </Button>
            </div>
          </DashboardCard>
        </div>
      </div>
    </PageShell>
  )
}
