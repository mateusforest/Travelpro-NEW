"use client"

import { useMemo, useState } from "react"
import {
} from "lucide-react"
import { AgencyRebuildActionButton } from "@/components/agency-rebuild/actions/agency-rebuild-action-button"
import { BaseModalV3 } from "@/components/agency-rebuild/modals/base-modal-v3"
import { BaseCardV3 } from "@/components/agency-rebuild/shared/base-card-v3"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

type DocumentsTab =
  | "overview"
  | "documents"
  | "templates"
  | "pending"
  | "sent"
  | "signatures"
  | "files"
  | "history"

type DocumentType =
  | "Contrato"
  | "Voucher"
  | "Recibo"
  | "Passagem"
  | "Seguro"
  | "Autorizacao"
  | "Roteiro"
  | "Proposta"
  | "Outro"

type DocumentStatus = "Rascunho" | "Pendente" | "Gerado" | "Enviado" | "Assinado" | "Aprovado" | "Vencido"

type DocumentRecord = {
  id: string
  title: string
  type: DocumentType
  client: string
  trip: string
  status: DocumentStatus
  createdAt: string
  updatedAt: string
  dueDate: string
  owner: string
  templateId?: string
  notes: string
  tags: string[]
  fields: string[]
  timeline: string[]
  attachments: string[]
}

type TemplateRecord = {
  id: string
  name: string
  category: string
  status: "Ativo" | "Inativo"
  usage: number
  customized: boolean
  duplicated: boolean
}

type FileRecord = {
  id: string
  title: string
  type: string
  linkedTo: string
  status: "Ativo" | "Arquivado"
}

type DocumentFormState = {
  type: DocumentType
  client: string
  trip: string
  templateId: string
  title: string
  dueDate: string
  owner: string
  status: DocumentStatus
  notes: string
  tags: string
}

const types: DocumentType[] = ["Contrato", "Voucher", "Recibo", "Passagem", "Seguro", "Autorizacao", "Roteiro", "Proposta", "Outro"]
const statuses: DocumentStatus[] = ["Rascunho", "Pendente", "Gerado", "Enviado", "Assinado", "Aprovado", "Vencido"]

const templateSeed: TemplateRecord[] = [
  { id: "tpl-1", name: "Contrato viagem premium", category: "Contrato", status: "Ativo", usage: 12, customized: false, duplicated: false },
  { id: "tpl-2", name: "Voucher concierge", category: "Voucher", status: "Ativo", usage: 8, customized: true, duplicated: false },
  { id: "tpl-3", name: "Proposta internacional", category: "Proposta", status: "Ativo", usage: 5, customized: false, duplicated: true },
]

const documentSeed: DocumentRecord[] = [
  {
    id: "doc-1",
    title: "Contrato Italia Signature",
    type: "Contrato",
    client: "Marina Alves",
    trip: "Italia Signature",
    status: "Pendente",
    createdAt: "2026-05-20",
    updatedAt: "2026-05-26",
    dueDate: "2026-05-28",
    owner: "Marina Alves",
    templateId: "tpl-1",
    notes: "Aguardando revisao final antes de enviar ao cliente.",
    tags: ["vip", "juridico"],
    fields: ["Cliente", "Destino", "Valores", "Politica de cancelamento"],
    timeline: ["Documento criado", "Campos revisados", "Pendente de envio"],
    attachments: ["contrato-v1.pdf"],
  },
  {
    id: "doc-2",
    title: "Voucher Grecia Honeymoon",
    type: "Voucher",
    client: "Giulia e Dante",
    trip: "Lua de mel Grecia",
    status: "Enviado",
    createdAt: "2026-05-21",
    updatedAt: "2026-05-25",
    dueDate: "2026-06-01",
    owner: "Time Comercial",
    templateId: "tpl-2",
    notes: "Versao enviada com experiencia de barco incluida.",
    tags: ["lua de mel"],
    fields: ["Hotel", "Traslados", "Contato local"],
    timeline: ["Voucher gerado", "Enviado ao cliente"],
    attachments: ["voucher-grecia.pdf"],
  },
  {
    id: "doc-3",
    title: "Passagens Buenos Aires Week",
    type: "Passagem",
    client: "Grupo Aurora Tech",
    trip: "Buenos Aires Week",
    status: "Assinado",
    createdAt: "2026-05-10",
    updatedAt: "2026-05-18",
    dueDate: "2026-05-18",
    owner: "Operacao Premium",
    templateId: "",
    notes: "Tudo emitido e validado.",
    tags: ["corporativo"],
    fields: ["Trechos", "Bagagem", "Codigo da reserva"],
    timeline: ["Arquivo emitido", "Cliente aprovou", "Assinatura registrada"],
    attachments: ["passagens-buenos.pdf"],
  },
]

const fileSeed: FileRecord[] = [
  { id: "file-1", title: "passaporte-marina.pdf", type: "PDF", linkedTo: "Marina Alves / Italia Signature", status: "Ativo" },
  { id: "file-2", title: "voucher-grecia-v2.pdf", type: "PDF", linkedTo: "Giulia e Dante / Lua de mel Grecia", status: "Ativo" },
]

function emptyDocumentForm(): DocumentFormState {
  return {
    type: "Contrato",
    client: "Marina Alves",
    trip: "Italia Signature",
    templateId: "tpl-1",
    title: "",
    dueDate: "2026-05-30",
    owner: "Marina Alves",
    status: "Rascunho",
    notes: "",
    tags: "",
  }
}

function statusTone(status: DocumentStatus) {
  if (status === "Assinado" || status === "Aprovado") return "border-emerald-400/18 bg-emerald-400/[0.08] text-emerald-100"
  if (status === "Pendente" || status === "Rascunho") return "border-amber-400/18 bg-amber-400/[0.08] text-amber-100"
  if (status === "Enviado" || status === "Gerado") return "border-primary/18 bg-primary/[0.08] text-primary-foreground"
  if (status === "Vencido") return "border-rose-400/18 bg-rose-400/[0.08] text-rose-100"
  return "border-white/10 bg-white/[0.03] text-muted-foreground"
}

export function AgencyRebuildDocumentsWorkspace({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [tab, setTab] = useState<DocumentsTab>("overview")
  const [documents, setDocuments] = useState<DocumentRecord[]>(documentSeed)
  const [templates, setTemplates] = useState<TemplateRecord[]>(templateSeed)
  const [files, setFiles] = useState<FileRecord[]>(fileSeed)
  const [documentModalOpen, setDocumentModalOpen] = useState(false)
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null)
  const [documentForm, setDocumentForm] = useState<DocumentFormState>(emptyDocumentForm())
  const [templateFlowOpen, setTemplateFlowOpen] = useState(false)
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    client: "all",
    trip: "all",
    owner: "all",
    period: "all",
    template: "all",
    signature: "all",
  })
  const [templateFlow, setTemplateFlow] = useState({
    templateId: "tpl-1",
    client: "Marina Alves",
    trip: "Italia Signature",
    title: "Contrato Italia Signature",
  })
  const [newFileName, setNewFileName] = useState("")

  const selectedDocument = useMemo(
    () => documents.find((item) => item.id === selectedDocumentId) ?? null,
    [documents, selectedDocumentId],
  )

  const filteredDocuments = useMemo(
    () =>
      documents.filter((item) => {
        if (filters.type !== "all" && item.type !== filters.type) return false
        if (filters.status !== "all" && item.status !== filters.status) return false
        if (filters.client !== "all" && item.client !== filters.client) return false
        if (filters.trip !== "all" && item.trip !== filters.trip) return false
        if (filters.owner !== "all" && item.owner !== filters.owner) return false
        if (filters.template === "yes" && !item.templateId) return false
        if (filters.template === "no" && item.templateId) return false
        if (filters.signature === "yes" && !["Pendente", "Enviado"].includes(item.status)) return false
        return true
      }),
    [documents, filters],
  )

  const docCount = documents.length
  const pendingCount = documents.filter((item) => item.status === "Pendente").length
  const sentCount = documents.filter((item) => item.status === "Enviado").length
  const signedCount = documents.filter((item) => item.status === "Assinado" || item.status === "Aprovado").length

  const openNewDocument = () => {
    setEditingDocumentId(null)
    setDocumentForm(emptyDocumentForm())
    setDocumentModalOpen(true)
  }

  const openEditDocument = (item: DocumentRecord) => {
    setEditingDocumentId(item.id)
    setDocumentForm({
      type: item.type,
      client: item.client,
      trip: item.trip,
      templateId: item.templateId ?? "",
      title: item.title,
      dueDate: item.dueDate,
      owner: item.owner,
      status: item.status,
      notes: item.notes,
      tags: item.tags.join(", "),
    })
    setDocumentModalOpen(true)
  }

  const saveDocument = () => {
    if (!documentForm.title.trim()) {
      toast({
        title: "Defina um titulo",
        description: "O documento precisa de um nome claro para entrar na central documental.",
      })
      return
    }

    const payload: DocumentRecord = {
      id: editingDocumentId ?? `doc-${Date.now()}`,
      title: documentForm.title.trim(),
      type: documentForm.type,
      client: documentForm.client,
      trip: documentForm.trip,
      status: documentForm.status,
      createdAt: editingDocumentId ? documents.find((item) => item.id === editingDocumentId)?.createdAt ?? "2026-05-26" : "2026-05-26",
      updatedAt: "2026-05-26",
      dueDate: documentForm.dueDate,
      owner: documentForm.owner,
      templateId: documentForm.templateId,
      notes: documentForm.notes,
      tags: documentForm.tags.split(",").map((item) => item.trim()).filter(Boolean),
      fields: ["Cliente", "Viagem", "Clausulas", "Observacoes"],
      timeline: editingDocumentId ? documents.find((item) => item.id === editingDocumentId)?.timeline ?? [] : ["Documento criado na V3"],
      attachments: editingDocumentId ? documents.find((item) => item.id === editingDocumentId)?.attachments ?? [] : [],
    }

    setDocuments((current) =>
      editingDocumentId ? current.map((item) => (item.id === editingDocumentId ? payload : item)) : [payload, ...current],
    )
    setDocumentModalOpen(false)
    toast({
      title: editingDocumentId ? "Documento atualizado" : "Documento gerado",
      description: "A central documental local foi atualizada com sucesso.",
    })
  }

  const generateFromTemplate = () => {
    const template = templates.find((item) => item.id === templateFlow.templateId)
    const title = templateFlow.title.trim() || `${template?.name ?? "Documento"} - ${templateFlow.client}`
    const generated: DocumentRecord = {
      id: `doc-${Date.now()}`,
      title,
      type: (template?.category as DocumentType) || "Contrato",
      client: templateFlow.client,
      trip: templateFlow.trip,
      status: "Gerado",
      createdAt: "2026-05-26",
      updatedAt: "2026-05-26",
      dueDate: "2026-06-02",
      owner: "Marina Alves",
      templateId: template?.id,
      notes: "Gerado a partir do fluxo de template da V3.",
      tags: ["template"],
      fields: ["Cliente", "Viagem", "Template base"],
      timeline: ["Template escolhido", "Campos revisados", "Documento gerado"],
      attachments: [],
    }
    setDocuments((current) => [generated, ...current])
    setTemplateFlowOpen(false)
    toast({
      title: "Documento gerado",
      description: "O fluxo a partir de template foi concluido localmente no preview.",
    })
  }

  const duplicateDocument = (documentId: string) => {
    const current = documents.find((item) => item.id === documentId)
    if (!current) return
    const duplicated = {
      ...current,
      id: `doc-${Date.now()}`,
      title: `${current.title} • Copia`,
      createdAt: "2026-05-26",
      updatedAt: "2026-05-26",
      status: "Rascunho" as DocumentStatus,
      timeline: [...current.timeline, "Documento duplicado localmente"],
    }
    setDocuments((items) => [duplicated, ...items])
    toast({
      title: "Documento duplicado",
      description: "A copia local ja apareceu no topo da central documental.",
    })
  }

  const removeDocument = (documentId: string) => {
    setDocuments((items) => items.filter((item) => item.id !== documentId))
    if (selectedDocumentId === documentId) setSelectedDocumentId(null)
    toast({
      title: "Documento removido",
      description: "A remocao afetou apenas o estado local da V3.",
    })
  }

  const updateDocumentStatus = (documentId: string, status: DocumentStatus) => {
    setDocuments((items) => items.map((item) => (item.id === documentId ? { ...item, status, updatedAt: "2026-05-26" } : item)))
    toast({
      title: "Status atualizado",
      description: `Documento marcado como ${status.toLowerCase()}.`,
    })
  }

  const addLocalFile = () => {
    if (!newFileName.trim()) {
      toast({
        title: "Defina um nome para o arquivo",
        description: "O upload local precisa de um nome para aparecer na central.",
      })
      return
    }
    setFiles((current) => [
      { id: `file-${Date.now()}`, title: newFileName.trim(), type: "PDF", linkedTo: "Sem vinculo", status: "Ativo" },
      ...current,
    ])
    setNewFileName("")
    toast({
      title: "Arquivo adicionado",
      description: "O upload foi simulado localmente para a V3.",
    })
  }

  const removeLocalFile = (fileId: string) => {
    setFiles((current) => current.filter((item) => item.id !== fileId))
    toast({
      title: "Arquivo removido",
      description: "A lista local de anexos foi atualizada.",
    })
  }

  return (
    <>
      <BaseModalV3
        open={open}
        onOpenChange={onOpenChange}
        title="Documentos"
        description="Contratos, vouchers, recibos, autorizacoes, templates e materiais da agencia."
        contentClassName="sm:max-w-[1380px]"
      >
        <div className="space-y-5">
          <div className="flex flex-col gap-4 rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Documentos gerados", value: docCount.toString() },
                  { label: "Pendentes", value: pendingCount.toString() },
                  { label: "Enviados", value: sentCount.toString() },
                  { label: "Assinados / aprovados", value: signedCount.toString() },
                ].map((item) => (
                  <div key={item.label} className="rounded-[22px] border border-white/8 bg-black/20 px-4 py-3">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/70">{item.label}</div>
                    <div className="mt-2 text-2xl font-semibold text-zinc-50">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 xl:max-w-[500px] xl:justify-end">
                <AgencyRebuildActionButton actionType="modal" label="Novo documento" className="rounded-full" onAction={openNewDocument} />
                <AgencyRebuildActionButton actionType="modal" label="Usar template" className="rounded-full" onAction={() => setTemplateFlowOpen(true)} />
                <AgencyRebuildActionButton actionType="modal" label="Gerar contrato" className="rounded-full" onAction={() => {
                  setTemplateFlow((current) => ({ ...current, templateId: "tpl-1", title: "Contrato viagem premium" }))
                  setTemplateFlowOpen(true)
                }} />
                <AgencyRebuildActionButton actionType="future" label="Importar arquivo" className="rounded-full" futureMessage="A conexao com storage real sera ligada depois na V3." />
              </div>
            </div>

            <Tabs value={tab} onValueChange={(value) => setTab(value as DocumentsTab)} className="space-y-5">
              <TabsList className="flex h-auto flex-wrap gap-2 rounded-[22px] border border-white/8 bg-black/16 p-1">
                <TabsTrigger value="overview">Visao geral</TabsTrigger>
                <TabsTrigger value="documents">Documentos</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="pending">Pendentes</TabsTrigger>
                <TabsTrigger value="sent">Enviados</TabsTrigger>
                <TabsTrigger value="signatures">Assinaturas</TabsTrigger>
                <TabsTrigger value="files">Arquivos</TabsTrigger>
                <TabsTrigger value="history">Historico</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {[
                    { label: "Gerados", value: docCount.toString(), note: "Base viva da central documental." },
                    { label: "Pendentes hoje", value: pendingCount.toString(), note: "Itens que pedem revisao." },
                    { label: "Enviados", value: sentCount.toString(), note: "Materiais ja em contato com o cliente." },
                    { label: "Aguardando assinatura", value: documents.filter((item) => ["Pendente", "Enviado"].includes(item.status)).length.toString(), note: "Sinais de aprovacoes pendentes." },
                    { label: "Templates", value: templates.length.toString(), note: "Modelos prontos para reutilizar." },
                    { label: "Vinculados a viagens", value: documents.filter((item) => item.trip).length.toString(), note: "Contexto operacional conectado." },
                  ].map((item) => (
                    <BaseCardV3 key={item.label} title={item.value} description={item.note} eyebrow={item.label} className="rounded-[24px] p-4" />
                  ))}
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                  <BaseCardV3 eyebrow="Central documental" title="Pendencias que merecem cuidado" description="Revisao, envio, vencimento e materiais recentes." className="rounded-[28px]">
                    <div className="grid gap-3 md:grid-cols-2">
                      {[
                        "2 contratos aguardam revisao final.",
                        "1 voucher ainda nao foi enviado ao cliente.",
                        "1 documento vence em 48 horas.",
                        "3 materiais foram atualizados nesta semana.",
                      ].map((item) => (
                        <div key={item} className="rounded-[18px] border border-white/8 bg-black/14 px-3 py-3 text-sm text-muted-foreground">{item}</div>
                      ))}
                    </div>
                  </BaseCardV3>

                  <BaseCardV3 eyebrow="Historico recente" title="Ultimos movimentos documentais" description="Uma leitura rapida do que mudou no acervo." className="rounded-[28px]">
                    <div className="space-y-2">
                      {documents.slice(0, 4).map((item) => (
                        <div key={item.id} className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2">
                          <div className="text-sm font-medium text-zinc-100">{item.title}</div>
                          <div className="text-xs text-muted-foreground">{item.updatedAt} • {item.status}</div>
                        </div>
                      ))}
                    </div>
                  </BaseCardV3>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <Select value={filters.type} onValueChange={(value) => setFilters((current) => ({ ...current, type: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Tipo" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">Todos os tipos</SelectItem>{types.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={filters.status} onValueChange={(value) => setFilters((current) => ({ ...current, status: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">Todos os status</SelectItem>{statuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={filters.client} onValueChange={(value) => setFilters((current) => ({ ...current, client: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Cliente" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os clientes</SelectItem>
                      {Array.from(new Set(documents.map((item) => item.client))).map((client) => <SelectItem key={client} value={client}>{client}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filters.trip} onValueChange={(value) => setFilters((current) => ({ ...current, trip: value }))}>
                    <SelectTrigger className="rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Viagem" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as viagens</SelectItem>
                      {Array.from(new Set(documents.map((item) => item.trip))).map((trip) => <SelectItem key={trip} value={trip}>{trip}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  {filteredDocuments.map((item) => (
                    <div key={item.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-[1.4fr_0.8fr_1fr_0.9fr_0.9fr_1fr]">
                          <div>
                            <div className="text-sm font-semibold text-zinc-100">{item.title}</div>
                            <div className="text-xs text-muted-foreground">{item.client} • {item.trip}</div>
                          </div>
                          <div className="text-sm text-muted-foreground"><div>Tipo</div><div className="mt-1 text-zinc-100">{item.type}</div></div>
                          <div className="text-sm text-muted-foreground"><div>Status</div><Badge className={`mt-1 rounded-full border px-2 py-0.5 text-[10px] ${statusTone(item.status)}`} variant="outline">{item.status}</Badge></div>
                          <div className="text-sm text-muted-foreground"><div>Criado em</div><div className="mt-1 text-zinc-100">{item.createdAt}</div></div>
                          <div className="text-sm text-muted-foreground"><div>Atualizado</div><div className="mt-1 text-zinc-100">{item.updatedAt}</div></div>
                          <div className="text-sm text-muted-foreground"><div>Responsavel</div><div className="mt-1 text-zinc-100">{item.owner}</div></div>
                        </div>

                        <div className="flex flex-wrap gap-2 xl:justify-end">
                          <AgencyRebuildActionButton actionType="modal" label="Abrir" className="h-8 rounded-full px-3 text-xs" onAction={() => setSelectedDocumentId(item.id)} />
                          <AgencyRebuildActionButton actionType="modal" label="Editar" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => openEditDocument(item)} />
                          <AgencyRebuildActionButton actionType="api" label="Duplicar" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => duplicateDocument(item.id)} />
                          <AgencyRebuildActionButton actionType="api" label="Enviado" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => updateDocumentStatus(item.id, "Enviado")} />
                          <AgencyRebuildActionButton actionType="future" label="Compartilhar" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" futureMessage="O compartilhamento seguro sera ligado depois ao modulo real." />
                          <AgencyRebuildActionButton actionType="api" label="Excluir" variant="outline" className="h-8 rounded-full border-rose-400/20 bg-rose-400/[0.06] px-3 text-xs text-rose-100" onAction={() => removeDocument(item.id)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="templates" className="space-y-3">
                {templates.map((template) => (
                  <div key={template.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                      <div>
                        <div className="text-sm font-semibold text-zinc-100">{template.name}</div>
                        <div className="text-xs text-muted-foreground">{template.category} • {template.usage} usos • {template.status}</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <AgencyRebuildActionButton actionType="modal" label="Usar template" className="h-8 rounded-full px-3 text-xs" onAction={() => {
                          setTemplateFlow((current) => ({ ...current, templateId: template.id, title: template.name }))
                          setTemplateFlowOpen(true)
                        }} />
                        <AgencyRebuildActionButton actionType="future" label="Personalizar" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" futureMessage="A camada de personalizacao da agencia sera ativada depois." />
                        <AgencyRebuildActionButton actionType="api" label="Duplicar" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => {
                          setTemplates((current) => [{ ...template, id: `tpl-${Date.now()}`, name: `${template.name} • Copia`, duplicated: true }, ...current])
                          toast({ title: "Template duplicado", description: "A copia local ja esta disponivel para uso na V3." })
                        }} />
                        <AgencyRebuildActionButton actionType="future" label="Visualizar" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" futureMessage="A visualizacao rica de templates sera conectada depois." />
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="pending" className="space-y-3">
                {documents.filter((item) => item.status === "Pendente" || item.status === "Rascunho").map((item) => (
                  <BaseCardV3 key={item.id} eyebrow={item.status} title={item.title} description={`${item.client} • prazo ${item.dueDate}`} className="rounded-[24px]" />
                ))}
              </TabsContent>

              <TabsContent value="sent" className="space-y-3">
                {documents.filter((item) => item.status === "Enviado").map((item) => (
                  <BaseCardV3 key={item.id} eyebrow="Enviado" title={item.title} description={`${item.client} • ${item.trip}`} className="rounded-[24px]" />
                ))}
              </TabsContent>

              <TabsContent value="signatures" className="space-y-3">
                {documents.filter((item) => item.status === "Pendente" || item.status === "Enviado").map((item) => (
                  <div key={item.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                      <div>
                        <div className="text-sm font-semibold text-zinc-100">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.client} • {item.trip} • prazo {item.dueDate}</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <AgencyRebuildActionButton actionType="api" label="Marcar assinado" className="h-8 rounded-full px-3 text-xs" onAction={() => updateDocumentStatus(item.id, "Assinado")} />
                        <AgencyRebuildActionButton actionType="future" label="Reenviar" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" futureMessage="O reenvio automatico sera ligado quando a integracao real entrar." />
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="files" className="space-y-4">
                <div className="flex flex-col gap-3 rounded-[24px] border border-white/8 bg-white/[0.03] p-4 md:flex-row">
                  <Input value={newFileName} onChange={(event) => setNewFileName(event.target.value)} placeholder="Adicionar arquivo local simulado" className="rounded-[18px] border-white/10 bg-white/[0.03]" />
                  <AgencyRebuildActionButton actionType="api" label="Adicionar arquivo" className="rounded-full" onAction={addLocalFile} />
                </div>
                {files.map((file) => (
                  <div key={file.id} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-zinc-100">{file.title}</div>
                        <div className="text-xs text-muted-foreground">{file.type} • {file.linkedTo} • {file.status}</div>
                      </div>
                      <AgencyRebuildActionButton actionType="api" label="Remover" variant="outline" className="h-8 rounded-full border-rose-400/20 bg-rose-400/[0.06] px-3 text-xs text-rose-100" onAction={() => removeLocalFile(file.id)} />
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="history" className="space-y-3">
                {documents.flatMap((item) => item.timeline.map((entry, index) => ({ id: `${item.id}-${index}`, title: entry, doc: item.title, date: item.updatedAt }))).map((item) => (
                  <div key={item.id} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3">
                    <div className="text-sm font-medium text-zinc-100">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.doc} • {item.date}</div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </BaseModalV3>

      <BaseModalV3
        open={documentModalOpen}
        onOpenChange={setDocumentModalOpen}
        title={editingDocumentId ? "Editar documento" : "Novo documento"}
        description="Monte o documento com cliente, viagem, template e status sem sair do dashboard."
        contentClassName="sm:max-w-4xl"
        footer={
          <>
            <AgencyRebuildActionButton actionType="modal" label="Cancelar" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onAction={() => setDocumentModalOpen(false)} />
            <AgencyRebuildActionButton actionType="modal" label={editingDocumentId ? "Salvar documento" : "Gerar documento"} className="rounded-full" onAction={saveDocument} />
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Select value={documentForm.type} onValueChange={(value) => setDocumentForm((current) => ({ ...current, type: value as DocumentType }))}>
            <SelectTrigger className="rounded-[20px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Tipo do documento" /></SelectTrigger>
            <SelectContent>{types.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
          </Select>
          <Input value={documentForm.title} onChange={(event) => setDocumentForm((current) => ({ ...current, title: event.target.value }))} placeholder="Titulo" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Select value={documentForm.client} onValueChange={(value) => setDocumentForm((current) => ({ ...current, client: value }))}>
            <SelectTrigger className="rounded-[20px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Cliente" /></SelectTrigger>
            <SelectContent>{Array.from(new Set(documentSeed.map((item) => item.client))).map((client) => <SelectItem key={client} value={client}>{client}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={documentForm.trip} onValueChange={(value) => setDocumentForm((current) => ({ ...current, trip: value }))}>
            <SelectTrigger className="rounded-[20px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Viagem vinculada" /></SelectTrigger>
            <SelectContent>{Array.from(new Set(documentSeed.map((item) => item.trip))).map((trip) => <SelectItem key={trip} value={trip}>{trip}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={documentForm.templateId} onValueChange={(value) => setDocumentForm((current) => ({ ...current, templateId: value }))}>
            <SelectTrigger className="rounded-[20px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Template base" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sem template</SelectItem>
              {templates.map((template) => <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="date" value={documentForm.dueDate} onChange={(event) => setDocumentForm((current) => ({ ...current, dueDate: event.target.value }))} className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Input value={documentForm.owner} onChange={(event) => setDocumentForm((current) => ({ ...current, owner: event.target.value }))} placeholder="Responsavel" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Select value={documentForm.status} onValueChange={(value) => setDocumentForm((current) => ({ ...current, status: value as DocumentStatus }))}>
            <SelectTrigger className="rounded-[20px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>{statuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent>
          </Select>
          <Input value={documentForm.tags} onChange={(event) => setDocumentForm((current) => ({ ...current, tags: event.target.value }))} placeholder="Tags separadas por virgula" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <div className="md:col-span-2">
            <Textarea value={documentForm.notes} onChange={(event) => setDocumentForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Observacoes, validade e contexto deste documento." className="min-h-[140px] rounded-[20px] border-white/10 bg-white/[0.03]" />
          </div>
        </div>
      </BaseModalV3>

      <BaseModalV3
        open={templateFlowOpen}
        onOpenChange={setTemplateFlowOpen}
        title="Usar template / Gerar contrato"
        description="Escolha um modelo, revise o cliente e gere um documento localmente na V3."
        contentClassName="sm:max-w-3xl"
        footer={
          <>
            <AgencyRebuildActionButton actionType="modal" label="Cancelar" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onAction={() => setTemplateFlowOpen(false)} />
            <AgencyRebuildActionButton actionType="modal" label="Gerar documento" className="rounded-full" onAction={generateFromTemplate} />
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Select value={templateFlow.templateId} onValueChange={(value) => setTemplateFlow((current) => ({ ...current, templateId: value }))}>
            <SelectTrigger className="rounded-[20px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Template" /></SelectTrigger>
            <SelectContent>{templates.map((template) => <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>)}</SelectContent>
          </Select>
          <Input value={templateFlow.title} onChange={(event) => setTemplateFlow((current) => ({ ...current, title: event.target.value }))} placeholder="Titulo do documento" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Select value={templateFlow.client} onValueChange={(value) => setTemplateFlow((current) => ({ ...current, client: value }))}>
            <SelectTrigger className="rounded-[20px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Cliente" /></SelectTrigger>
            <SelectContent>{Array.from(new Set(documentSeed.map((item) => item.client))).map((client) => <SelectItem key={client} value={client}>{client}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={templateFlow.trip} onValueChange={(value) => setTemplateFlow((current) => ({ ...current, trip: value }))}>
            <SelectTrigger className="rounded-[20px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Viagem" /></SelectTrigger>
            <SelectContent>{Array.from(new Set(documentSeed.map((item) => item.trip))).map((trip) => <SelectItem key={trip} value={trip}>{trip}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </BaseModalV3>

      <BaseModalV3
        open={Boolean(selectedDocument)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setSelectedDocumentId(null)
        }}
        title={selectedDocument?.title ?? "Detalhes do documento"}
        description="Status, timeline, campos preenchidos, anexos e historico de acoes."
        contentClassName="sm:max-w-[1160px]"
      >
        {selectedDocument ? (
          <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4">
              <BaseCardV3 eyebrow={selectedDocument.type} title="Resumo documental" description={selectedDocument.notes} className="rounded-[26px]">
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    `Cliente: ${selectedDocument.client}`,
                    `Viagem: ${selectedDocument.trip}`,
                    `Status: ${selectedDocument.status}`,
                    `Prazo: ${selectedDocument.dueDate}`,
                    `Responsavel: ${selectedDocument.owner}`,
                    `Atualizado: ${selectedDocument.updatedAt}`,
                  ].map((item) => (
                    <div key={item} className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground">{item}</div>
                  ))}
                </div>
              </BaseCardV3>

              <BaseCardV3 eyebrow="Timeline" title="Linha do documento" description="Etapas e decisoes que compoem este material." className="rounded-[26px]">
                <div className="space-y-2">
                  {selectedDocument.timeline.map((item) => (
                    <div key={item} className="rounded-[18px] border border-white/8 bg-black/14 px-3 py-2 text-sm text-muted-foreground">{item}</div>
                  ))}
                </div>
              </BaseCardV3>
            </div>

            <div className="space-y-4">
              <BaseCardV3 eyebrow="Campos preenchidos" title="Estrutura do documento" description="Campos principais, anexos e historico rapido." className="rounded-[26px]">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {selectedDocument.fields.map((field) => (
                      <Badge key={field} className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-muted-foreground" variant="outline">{field}</Badge>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {selectedDocument.attachments.map((attachment) => (
                      <div key={attachment} className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground">{attachment}</div>
                    ))}
                  </div>
                </div>
              </BaseCardV3>

              <div className="flex flex-wrap gap-2">
                <AgencyRebuildActionButton actionType="modal" label="Editar" className="rounded-full" onAction={() => openEditDocument(selectedDocument)} />
                <AgencyRebuildActionButton actionType="api" label="Duplicar" className="rounded-full" onAction={() => duplicateDocument(selectedDocument.id)} />
                <AgencyRebuildActionButton actionType="api" label="Marcar enviado" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onAction={() => updateDocumentStatus(selectedDocument.id, "Enviado")} />
                <AgencyRebuildActionButton actionType="api" label="Marcar assinado" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onAction={() => updateDocumentStatus(selectedDocument.id, "Assinado")} />
                <AgencyRebuildActionButton actionType="future" label="Baixar PDF" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" futureMessage="A geracao de PDF sera conectada quando o motor documental real entrar." />
                <AgencyRebuildActionButton actionType="future" label="Compartilhar" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" futureMessage="O compartilhamento seguro sera ligado na proxima etapa." />
                <AgencyRebuildActionButton actionType="api" label="Excluir" variant="outline" className="rounded-full border-rose-400/20 bg-rose-400/[0.06] text-rose-100" onAction={() => removeDocument(selectedDocument.id)} />
              </div>
            </div>
          </div>
        ) : null}
      </BaseModalV3>
    </>
  )
}
