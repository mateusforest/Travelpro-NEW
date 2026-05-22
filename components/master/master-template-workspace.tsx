"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Bot, Copy, Save, Send, Sparkles, X } from "lucide-react"
import { DashboardCard } from "@/components/system/dashboard-card"
import { PageShell } from "@/components/system/page-shell"
import { SectionHeader } from "@/components/system/section-header"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import type { MasterAgencyOverview, MasterTemplateAttachment, MasterTemplateDetail, MasterTemplateInput } from "@/types/master"

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

async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "")
    reader.onerror = () => reject(reader.error ?? new Error("Nao foi possivel ler o arquivo."))
    reader.readAsDataURL(file)
  })
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
  const [previewImageUrl, setPreviewImageUrl] = useState("")
  const [coverImageUrl, setCoverImageUrl] = useState("")
  const [brandingAssets, setBrandingAssets] = useState<string[]>([])
  const [attachments, setAttachments] = useState<MasterTemplateAttachment[]>([])
  const [nextBrandingAsset, setNextBrandingAsset] = useState("")
  const [attachmentName, setAttachmentName] = useState("")
  const [attachmentUrl, setAttachmentUrl] = useState("")

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
          setPreviewImageUrl(template.preview_image_url || "")
          setCoverImageUrl(template.cover_image_url || "")
          setBrandingAssets(template.branding_assets)
          setAttachments(template.attachments)
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

  const addBrandingAsset = () => {
    const normalized = nextBrandingAsset.trim()
    if (!normalized) return
    if (!brandingAssets.includes(normalized)) {
      setBrandingAssets((current) => [...current, normalized])
    }
    setNextBrandingAsset("")
  }

  const addAttachment = () => {
    if (!attachmentName.trim() || !attachmentUrl.trim()) return
    setAttachments((current) => [
      ...current,
      {
        name: attachmentName.trim(),
        url: attachmentUrl.trim(),
      },
    ])
    setAttachmentName("")
    setAttachmentUrl("")
  }

  const importAssetFile = async (file: File, mode: "preview" | "cover" | "branding" | "attachment") => {
    try {
      const dataUrl = await fileToDataUrl(file)
      if (!dataUrl) throw new Error("Arquivo vazio.")
      if (mode === "preview") setPreviewImageUrl(dataUrl)
      if (mode === "cover") setCoverImageUrl(dataUrl)
      if (mode === "branding") setBrandingAssets((current) => [...current, dataUrl].slice(0, 8))
      if (mode === "attachment") {
        setAttachments((current) => [
          ...current,
          {
            name: file.name,
            url: dataUrl,
            content_type: file.type || null,
          },
        ])
      }
      toast({ title: "Asset carregado", description: "O arquivo foi incorporado ao template e sera salvo junto com o metadata atual." })
    } catch (error) {
      toast({ title: "Falha ao ler arquivo", description: error instanceof Error ? error.message : "Nao foi possivel importar o arquivo." })
    }
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
        preview_image_url: previewImageUrl.trim() || null,
        cover_image_url: coverImageUrl.trim() || null,
        branding_assets: brandingAssets,
        attachments,
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

          <DashboardCard title="Assets, anexos e branding" description="Restaure uploads e apoios visuais do template sem depender de uma engine externa nesta etapa.">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <FieldLabel>Imagem de preview</FieldLabel>
                <FieldInput value={previewImageUrl} onChange={(event) => setPreviewImageUrl(event.target.value)} placeholder="https://... ou data url" />
                <input type="file" accept="image/*" className="text-xs text-muted-foreground" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importAssetFile(file, "preview") }} />
              </label>
              <label className="space-y-2">
                <FieldLabel>Imagem de capa</FieldLabel>
                <FieldInput value={coverImageUrl} onChange={(event) => setCoverImageUrl(event.target.value)} placeholder="https://... ou data url" />
                <input type="file" accept="image/*" className="text-xs text-muted-foreground" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importAssetFile(file, "cover") }} />
              </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <FieldLabel>Branding assets</FieldLabel>
                <div className="flex gap-2">
                  <FieldInput value={nextBrandingAsset} onChange={(event) => setNextBrandingAsset(event.target.value)} placeholder="URL de logo, imagem ou asset visual" />
                  <Button className="rounded-full" onClick={addBrandingAsset}>Adicionar</Button>
                </div>
                <input type="file" accept="image/*,.pdf" multiple className="text-xs text-muted-foreground" onChange={(event) => { const files = Array.from(event.target.files ?? []); files.forEach((file) => { void importAssetFile(file, "branding") }) }} />
                <div className="flex flex-wrap gap-2">
                  {brandingAssets.map((item, index) => (
                    <button key={`${item}-${index}`} type="button" onClick={() => setBrandingAssets((current) => current.filter((entry) => entry !== item))} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-muted-foreground">
                      Asset {index + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <FieldLabel>Anexos e arquivos auxiliares</FieldLabel>
                <FieldInput value={attachmentName} onChange={(event) => setAttachmentName(event.target.value)} placeholder="Nome do anexo" />
                <FieldInput value={attachmentUrl} onChange={(event) => setAttachmentUrl(event.target.value)} placeholder="URL ou data url do arquivo" />
                <div className="flex flex-wrap gap-2">
                  <Button className="rounded-full" onClick={addAttachment}>Adicionar anexo</Button>
                  <input type="file" accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xlsx,.zip" multiple className="text-xs text-muted-foreground" onChange={(event) => { const files = Array.from(event.target.files ?? []); files.forEach((file) => { void importAssetFile(file, "attachment") }) }} />
                </div>
                <div className="space-y-2">
                  {attachments.map((item, index) => (
                    <div key={`${item.name}-${index}`} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{item.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{item.content_type || item.url.slice(0, 80)}</p>
                      </div>
                      <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => setAttachments((current) => current.filter((_, currentIndex) => currentIndex !== index))}>
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
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
              {attachments.length > 0 ? (
                <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-primary/70">Anexos</p>
                  <p className="mt-2 text-sm text-muted-foreground">{attachments.length} arquivos auxiliares persistidos no template.</p>
                </div>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
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
