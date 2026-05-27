"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, CircleDot, Loader2, Sparkles, Wand2 } from "lucide-react"
import { AgencyRebuildActionButton } from "@/components/agency-rebuild/actions/agency-rebuild-action-button"
import { BaseModalV3 } from "@/components/agency-rebuild/modals/base-modal-v3"
import { BaseCardV3 } from "@/components/agency-rebuild/shared/base-card-v3"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

type Intent = {
  key: string
  group: string
  label: string
  description: string
}

type IntentFieldKey =
  | "client"
  | "period"
  | "destination"
  | "budget"
  | "priority"
  | "owner"
  | "note"
  | "type"
  | "amount"
  | "account"
  | "installments"
  | "dueDate"
  | "source"
  | "tags"
  | "channel"
  | "deadline"
  | "status"

type OperationalContextState = Record<IntentFieldKey, string>

type OperationalField = {
  key: IntentFieldKey
  label: string
  placeholder: string
  kind?: "select" | "textarea"
}

const smartSuggestions = [
  "Criar viagem da Ana para Gramado em julho. Casal. Lua de mel. Orcamento 12 mil.",
  "Registrar recebimento da Italia Signature com parcelamento em 3x.",
  "Gerar contrato e voucher da viagem do Roberto para Lisboa.",
  "Publicar pacote para Cancun e criar campanha com CTA de WhatsApp.",
]

const intents: Intent[] = [
  { key: "new-client", group: "Relacionamento", label: "Novo cliente", description: "Abre relacionamento e estrutura base da conta." },
  { key: "new-lead", group: "Relacionamento", label: "Novo lead", description: "Registra oportunidade e conecta ao pipeline." },
  { key: "follow-up", group: "Relacionamento", label: "Follow-up", description: "Organiza retorno, canal e proximo passo." },
  { key: "new-trip", group: "Viagens", label: "Nova viagem", description: "Inicia jornada, cliente, destino e prioridade." },
  { key: "new-quote", group: "Viagens", label: "Nova cotacao", description: "Prepara proposta, orcamento e margem inicial." },
  { key: "trip-status", group: "Viagens", label: "Atualizar status", description: "Move a viagem para a proxima etapa operacional." },
  { key: "new-contract", group: "Documentos", label: "Novo contrato", description: "Estrutura base documental com cliente e viagem." },
  { key: "new-voucher", group: "Documentos", label: "Novo voucher", description: "Prepara entrega e compartilhamento da viagem." },
  { key: "new-material", group: "Documentos", label: "Novo material", description: "Cria material de apoio ou entrega premium." },
  { key: "generate-itinerary", group: "Roteiros", label: "Gerar roteiro IA", description: "Monta a base do roteiro com contexto de viagem." },
  { key: "update-itinerary", group: "Roteiros", label: "Atualizar roteiro", description: "Ajusta roteiro, etapa e proxima entrega." },
  { key: "publish-itinerary", group: "Roteiros", label: "Publicar roteiro", description: "Prepara versao final e compartilhamento." },
  { key: "new-finance", group: "Financeiro", label: "Novo lancamento", description: "Registra caixa, categoria e vencimento." },
  { key: "register-income", group: "Financeiro", label: "Registrar recebimento", description: "Conecta entrada, conta e previsao." },
  { key: "split-payment", group: "Financeiro", label: "Parcelar pagamento", description: "Estrutura recorrencia e fluxo financeiro." },
  { key: "new-task", group: "Operacional", label: "Nova tarefa", description: "Cria um passo operacional com dono e prazo." },
  { key: "new-alert", group: "Operacional", label: "Alerta operacional", description: "Marca urgencia, modulo e proximo passo." },
  { key: "new-automation", group: "Operacional", label: "Criar automacao", description: "Inicia gatilho premium e jornada recorrente." },
  { key: "publish-package", group: "Catalogo", label: "Publicar pacote", description: "Leva oferta para vitrine e compartilhamento." },
  { key: "update-package", group: "Catalogo", label: "Atualizar pacote", description: "Ajusta preco, periodo e destaque comercial." },
  { key: "create-campaign", group: "Catalogo", label: "Criar campanha", description: "Abre campanha promocional ligada ao pacote." },
]

const initialOperationalContext: OperationalContextState = {
  client: "Ana Ribeiro",
  period: "Julho 2026",
  destination: "Gramado",
  budget: "R$ 12.000",
  priority: "Alta",
  owner: "Marina",
  note: "Casal, lua de mel, janela premium.",
  type: "Receita",
  amount: "R$ 1.850",
  account: "Conta principal",
  installments: "3x",
  dueDate: "2026-07-10",
  source: "Instagram",
  tags: "premium, honeymoon",
  channel: "WhatsApp",
  deadline: "Hoje, 18h",
  status: "Em preparo",
}

function getIntentFields(intentKey: string): OperationalField[] {
  switch (intentKey) {
    case "new-trip":
    case "new-quote":
      return [
        { key: "client", label: "Cliente", placeholder: "Selecionar cliente" },
        { key: "period", label: "Periodo", placeholder: "Julho 2026" },
        { key: "destination", label: "Destino", placeholder: "Destino principal" },
        { key: "budget", label: "Orcamento", placeholder: "R$ 12.000" },
        { key: "priority", label: "Prioridade", placeholder: "Alta", kind: "select" },
        { key: "owner", label: "Responsavel", placeholder: "Consultor responsavel" },
        { key: "status", label: "Status", placeholder: "Em preparo", kind: "select" },
        { key: "note", label: "Observacao", placeholder: "Contexto curto da jornada", kind: "textarea" },
      ]
    case "trip-status":
      return [
        { key: "client", label: "Cliente", placeholder: "Cliente da jornada" },
        { key: "destination", label: "Destino", placeholder: "Destino atual" },
        { key: "status", label: "Novo status", placeholder: "Confirmada", kind: "select" },
        { key: "owner", label: "Responsavel", placeholder: "Pessoa responsavel" },
        { key: "deadline", label: "Prazo", placeholder: "Hoje, 17h" },
        { key: "note", label: "Observacao", placeholder: "O que motivou a mudanca", kind: "textarea" },
      ]
    case "new-finance":
    case "register-income":
    case "split-payment":
      return [
        { key: "type", label: "Tipo", placeholder: "Receita", kind: "select" },
        { key: "amount", label: "Valor", placeholder: "R$ 1.850" },
        { key: "account", label: "Conta", placeholder: "Conta principal" },
        { key: "installments", label: "Parcelamento", placeholder: "3x" },
        { key: "dueDate", label: "Vencimento", placeholder: "2026-07-10" },
        { key: "owner", label: "Responsavel", placeholder: "Financeiro" },
        { key: "status", label: "Status", placeholder: "A receber", kind: "select" },
        { key: "note", label: "Observacao", placeholder: "Contexto do lancamento", kind: "textarea" },
      ]
    case "new-task":
    case "new-alert":
    case "new-automation":
      return [
        { key: "type", label: "Tipo", placeholder: "Operacional", kind: "select" },
        { key: "owner", label: "Responsavel", placeholder: "Pessoa responsavel" },
        { key: "priority", label: "Prioridade", placeholder: "Alta", kind: "select" },
        { key: "deadline", label: "Prazo", placeholder: "Hoje, 18h" },
        { key: "channel", label: "Canal", placeholder: "Painel interno", kind: "select" },
        { key: "status", label: "Status", placeholder: "Pronto para executar", kind: "select" },
        { key: "note", label: "Observacao", placeholder: "Descreva o gatilho ou alerta", kind: "textarea" },
      ]
    case "publish-package":
    case "update-package":
    case "create-campaign":
      return [
        { key: "destination", label: "Destino / pacote", placeholder: "Cancun premium" },
        { key: "period", label: "Periodo", placeholder: "Ago 2026" },
        { key: "budget", label: "Valor base", placeholder: "R$ 8.900" },
        { key: "channel", label: "Canal", placeholder: "Instagram", kind: "select" },
        { key: "source", label: "Origem", placeholder: "Catalogo" },
        { key: "tags", label: "Tags", placeholder: "verao, promocional" },
        { key: "status", label: "Status", placeholder: "Pronto para publicar", kind: "select" },
        { key: "note", label: "Observacao", placeholder: "Mensagem central da campanha", kind: "textarea" },
      ]
    default:
      return [
        { key: "client", label: "Cliente", placeholder: "Selecionar cliente" },
        { key: "source", label: "Origem", placeholder: "WhatsApp", kind: "select" },
        { key: "channel", label: "Canal", placeholder: "WhatsApp", kind: "select" },
        { key: "priority", label: "Prioridade", placeholder: "Alta", kind: "select" },
        { key: "owner", label: "Responsavel", placeholder: "Consultor responsavel" },
        { key: "status", label: "Status", placeholder: "Em preparo", kind: "select" },
        { key: "tags", label: "Tags", placeholder: "vip, follow-up" },
        { key: "note", label: "Observacao", placeholder: "Contexto curto da acao", kind: "textarea" },
      ]
  }
}

function buildOperationalSignals(intent: Intent, context: OperationalContextState) {
  const base = [
    `Cliente ${context.client ? "encontrado" : "a localizar"}`,
    `${intent.label} preparada para ${context.owner || "responsavel da operacao"}`,
  ]

  if (intent.group === "Viagens") {
    base.push("Jornada preparada com cliente, destino e prioridade")
    base.push("Pasta documental sera criada")
    base.push("Financeiro inicial sugerido")
    base.push("Proximo passo: gerar cotacao web")
  } else if (intent.group === "Financeiro") {
    base.push("Parcelamento detectado")
    base.push("Lancamentos recorrentes serao criados")
    base.push("Fluxo de caixa sera atualizado")
  } else if (intent.group === "Documentos") {
    base.push("Entrega documental sera preparada")
    base.push("Compartilhamento premium sera sugerido")
  } else if (intent.group === "Roteiros") {
    base.push("Base do roteiro sera iniciada")
    base.push("Checklist e timeline serao sincronizados")
  } else if (intent.group === "Catalogo") {
    base.push("Oferta sera preparada para vitrine")
    base.push("CTA e campanha poderao nascer na sequencia")
  } else {
    base.push("Pipeline e proximo passo serao conectados")
    base.push("Timeline operacional sera atualizada")
  }

  return base
}

function buildTimeline(intent: Intent, context: OperationalContextState) {
  return [
    { time: "10:42", label: `Cliente ${context.client ? "localizado" : "a localizar"}`, tone: "done" as const },
    { time: "10:42", label: `${intent.label} conectada ao fluxo de ${intent.group.toLowerCase()}`, tone: "done" as const },
    { time: "10:43", label: context.status ? `Status inicial: ${context.status}` : "Status inicial sera definido", tone: "live" as const },
    {
      time: "10:43",
      label:
        intent.group === "Viagens"
          ? "Proximo passo sugerido: gerar cotacao web"
          : intent.group === "Financeiro"
            ? "Proximo passo sugerido: refletir no fluxo de caixa"
            : intent.group === "Documentos"
              ? "Proximo passo sugerido: compartilhar entrega"
              : "Proximo passo sugerido: acionar modulo relacionado",
      tone: "next" as const,
    },
  ]
}

const selectOptions: Record<IntentFieldKey, string[]> = {
  client: ["Ana Ribeiro", "Marina Alves", "Roberto Nunes"],
  period: ["Julho 2026", "Agosto 2026", "Setembro 2026"],
  destination: ["Gramado", "Cancun", "Lisboa"],
  budget: ["R$ 8.900", "R$ 12.000", "R$ 24.500"],
  priority: ["Alta", "Media", "Baixa"],
  owner: ["Marina", "Equipe comercial", "Financeiro"],
  note: [],
  type: ["Receita", "Despesa", "Operacional"],
  amount: ["R$ 980", "R$ 1.850", "R$ 5.400"],
  account: ["Conta principal", "Caixa operacional", "Cartao corporativo"],
  installments: ["1x", "3x", "6x"],
  dueDate: ["2026-07-10", "2026-07-20", "2026-08-05"],
  source: ["Instagram", "WhatsApp", "Catalogo"],
  tags: ["premium, honeymoon", "vip, follow-up", "promocional, verao"],
  channel: ["WhatsApp", "Painel interno", "Instagram"],
  deadline: ["Hoje, 18h", "Amanha, 10h", "Sexta, 14h"],
  status: ["Em preparo", "Pronto para executar", "Em revisao", "A receber", "Confirmada"],
}

export function AgencyRebuildAiOperationsCenter({
  open,
  onOpenChange,
  scopeTitle,
  defaultIntentKey,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  scopeTitle?: string | null
  defaultIntentKey?: string | null
}) {
  const [selectedIntentKey, setSelectedIntentKey] = useState(defaultIntentKey ?? "new-trip")
  const [aiPrompt, setAiPrompt] = useState(smartSuggestions[0])
  const [operationalContext, setOperationalContext] = useState<OperationalContextState>(initialOperationalContext)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)

  useEffect(() => {
    if (!open) return
    setSelectedIntentKey(defaultIntentKey ?? "new-trip")
    setAiPrompt(defaultIntentKey === "new-finance" ? smartSuggestions[1] : smartSuggestions[0])
    setOperationalContext(initialOperationalContext)
  }, [defaultIntentKey, open])

  const groupedIntents = useMemo(() => {
    return intents.reduce<Record<string, Intent[]>>((acc, item) => {
      acc[item.group] = [...(acc[item.group] ?? []), item]
      return acc
    }, {})
  }, [])

  const selectedIntent = intents.find((item) => item.key === selectedIntentKey) ?? intents[0]
  const fields = useMemo(() => getIntentFields(selectedIntent.key), [selectedIntent.key])
  const operationalSignals = useMemo(
    () => buildOperationalSignals(selectedIntent, operationalContext),
    [selectedIntent, operationalContext],
  )
  const executionTimeline = useMemo(
    () => buildTimeline(selectedIntent, operationalContext),
    [selectedIntent, operationalContext],
  )

  const updateContext = (key: IntentFieldKey, value: string) => {
    setOperationalContext((current) => ({ ...current, [key]: value }))
  }

  const runGeneration = async () => {
    setIsGenerating(true)
    await new Promise((resolve) => setTimeout(resolve, 900))
    setIsGenerating(false)
    toast({
      title: "Leitura operacional atualizada",
      description: "A central preparou a jornada e sugeriu os proximos passos localmente.",
    })
  }

  const runExecution = async () => {
    setIsExecuting(true)
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setIsExecuting(false)
    toast({
      title: "Jornada iniciada",
      description: "A acao foi estruturada localmente como fluxo assistido da V3.",
    })
  }

  return (
    <BaseModalV3
      open={open}
      onOpenChange={onOpenChange}
      title="Criar com IA"
      description={
        scopeTitle
          ? `Copiloto operacional para ${scopeTitle.toLowerCase()} com leitura viva da jornada.`
          : "Central operacional inteligente da V3 para entender intencao, preparar estrutura e iniciar jornadas."
      }
      contentClassName="sm:max-w-[1480px]"
      bodyClassName="pb-4"
      footer={
        <>
          <AgencyRebuildActionButton
            actionType="api"
            label="Salvar rascunho"
            loading={false}
            variant="outline"
            className="rounded-full border-white/10 bg-white/[0.03]"
            onAction={async () => {
              await new Promise((resolve) => setTimeout(resolve, 450))
              toast({
                title: "Rascunho salvo",
                description: "A intencao ficou pronta para retomada na central operacional.",
              })
            }}
          />
          <AgencyRebuildActionButton
            actionType="api"
            label={isGenerating ? "Gerando leitura..." : "Gerar com IA"}
            loading={isGenerating}
            variant="outline"
            className="rounded-full border-primary/20 bg-primary/[0.08]"
            onAction={runGeneration}
          />
          <AgencyRebuildActionButton
            actionType="api"
            label={isExecuting ? "Executando jornada..." : "Executar jornada"}
            loading={isExecuting}
            className="rounded-full"
            onAction={runExecution}
          />
        </>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr_0.92fr]">
        <BaseCardV3
          eyebrow="Coluna de intencao"
          title="Escolha a jornada"
          description="Intencoes operacionais que mudam todo o contexto de execucao."
          className="rounded-[28px]"
        >
          <div className="space-y-4">
            {Object.entries(groupedIntents).map(([group, items]) => (
              <div key={group} className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-primary/72">{group}</p>
                <div className="grid gap-2">
                  {items.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setSelectedIntentKey(item.key)}
                      className={cn(
                        "rounded-[20px] border px-3.5 py-3 text-left transition-all",
                        selectedIntent.key === item.key
                          ? "border-primary/24 bg-primary/[0.1] shadow-[0_0_0_1px_rgba(251,146,60,0.08)]"
                          : "border-white/8 bg-white/[0.03] hover:border-white/12 hover:bg-white/[0.05]",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-full border border-white/10 bg-black/20 p-2">
                          <Sparkles className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">{item.label}</p>
                          <p className="mt-1 text-[12px] leading-5 text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </BaseCardV3>

        <div className="space-y-4">
          <BaseCardV3
            eyebrow="Contexto operacional"
            title="Minimo necessario para a IA agir"
            description="Campos IA-ready com preenchimento assistido e leitura pronta para os modulos."
            className="rounded-[28px]"
          >
            <div className="space-y-4">
              <div className="rounded-[24px] border border-primary/14 bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.14),transparent_58%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-primary/72">Comando vivo</p>
                    <p className="mt-1 text-sm text-muted-foreground">A IA entende a intencao e prepara a jornada operacional.</p>
                  </div>
                  <Badge className="rounded-full border border-primary/18 bg-primary/[0.1] px-2.5 py-1 text-[10px]" variant="outline">
                    Copiloto ativo
                  </Badge>
                </div>

                <Textarea
                  value={aiPrompt}
                  onChange={(event) => setAiPrompt(event.target.value)}
                  className="mt-4 min-h-[122px] rounded-[24px] border-white/10 bg-black/20 px-4 py-3 text-sm"
                  placeholder="Descreva a operacao que deseja iniciar."
                />

                <div className="mt-3 flex flex-wrap gap-2">
                  {smartSuggestions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setAiPrompt(item)}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-left text-[11px] leading-5 text-muted-foreground transition hover:border-primary/18 hover:bg-primary/[0.08] hover:text-foreground"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {fields.map((field) => (
                  <div key={field.key} className={cn("space-y-2", field.kind === "textarea" && "md:col-span-2")}>
                    <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{field.label}</label>
                    {field.kind === "textarea" ? (
                      <Textarea
                        value={operationalContext[field.key]}
                        onChange={(event) => updateContext(field.key, event.target.value)}
                        className="min-h-[116px] rounded-[22px] border-white/10 bg-white/[0.03] px-4 py-3"
                        placeholder={field.placeholder}
                      />
                    ) : field.kind === "select" ? (
                      <Select value={operationalContext[field.key]} onValueChange={(value) => updateContext(field.key, value)}>
                        <SelectTrigger className="h-12 rounded-[20px] border-white/10 bg-white/[0.03]">
                          <SelectValue placeholder={field.placeholder} />
                        </SelectTrigger>
                        <SelectContent className="rounded-[20px] border-white/10 bg-[#120d0b]">
                          {selectOptions[field.key].map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={operationalContext[field.key]}
                        onChange={(event) => updateContext(field.key, event.target.value)}
                        className="h-12 rounded-[20px] border-white/10 bg-white/[0.03] px-4"
                        placeholder={field.placeholder}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </BaseCardV3>

          <BaseCardV3
            eyebrow="Timeline / execucao"
            title="Orquestracao viva"
            description="Acoes geradas, logs e proximos passos sugeridos em tempo real."
            className="rounded-[28px]"
          >
            <div className="space-y-3">
              {executionTimeline.map((item) => (
                <div key={`${item.time}-${item.label}`} className="flex gap-3 rounded-[20px] border border-white/8 bg-white/[0.03] px-3.5 py-3">
                  <div className="flex flex-col items-center pt-0.5">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border",
                        item.tone === "done" && "border-emerald-400/18 bg-emerald-400/[0.08] text-emerald-200",
                        item.tone === "live" && "border-primary/20 bg-primary/[0.1] text-primary animate-pulse",
                        item.tone === "next" && "border-white/10 bg-black/20 text-muted-foreground",
                      )}
                    >
                      {item.tone === "done" ? <Check className="h-4 w-4" /> : <CircleDot className="h-4 w-4" />}
                    </div>
                    <div className="mt-2 h-full w-px bg-gradient-to-b from-white/12 to-transparent" />
                  </div>
                  <div className="pb-2">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-primary/72">{item.time}</p>
                    <p className="mt-1 text-sm leading-6 text-foreground">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </BaseCardV3>
        </div>

        <div className="space-y-4">
          <BaseCardV3
            eyebrow="IA operacional"
            title="Leitura viva da acao"
            description="Um painel objetivo que mostra o que a central entendeu e o que vai acontecer em seguida."
            className="rounded-[28px]"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-full border border-primary/18 bg-primary/[0.08] px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-primary">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                typing operacional
              </div>

              {operationalSignals.map((signal, index) => (
                <div
                  key={signal}
                  className="rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] px-3.5 py-3"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "mt-0.5 rounded-full border border-primary/18 bg-primary/[0.08] p-1.5 text-primary",
                        index === 0 && "animate-pulse",
                      )}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-sm leading-6 text-foreground">{signal}</p>
                  </div>
                </div>
              ))}
            </div>
          </BaseCardV3>

          <BaseCardV3
            eyebrow="Modulos que entram"
            title="Jornada preparada"
            description="A IA ja mostra quais frentes podem nascer conectadas a partir desta intencao."
            className="rounded-[28px]"
          >
            <div className="flex flex-wrap gap-2">
              {[
                "Cliente",
                "Lead / pipeline",
                "Viagem",
                "Documentos",
                "Financeiro",
                "Roteiro",
                "Agenda operacional",
              ].map((item) => (
                <Badge key={item} className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px]" variant="outline">
                  {item}
                </Badge>
              ))}
            </div>

            <div className="mt-4 rounded-[22px] border border-white/8 bg-black/16 p-4">
              <div className="flex items-center gap-2 text-primary">
                <Wand2 className="h-4 w-4" />
                <p className="text-sm font-medium">Proximo passo sugerido</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {selectedIntent.group === "Viagens"
                  ? "Gerar cotacao web e reservar o calendario operacional da viagem."
                  : selectedIntent.group === "Financeiro"
                    ? "Criar lancamentos e atualizar a previsao do fluxo de caixa."
                    : selectedIntent.group === "Documentos"
                      ? "Abrir a base documental e preparar o compartilhamento premium."
                      : "Conectar a acao ao modulo certo e distribuir responsabilidades."}
              </p>
            </div>
          </BaseCardV3>
        </div>
      </div>
    </BaseModalV3>
  )
}
