"use client"

import { useEffect, useMemo, useState } from "react"
import { Bot, History, SendHorizonal, Sparkles } from "lucide-react"
import { AgencyRebuildActionButton } from "@/components/agency-rebuild/actions/agency-rebuild-action-button"
import { BaseDrawerV3 } from "@/components/agency-rebuild/drawers/base-drawer-v3"
import { BaseCardV3 } from "@/components/agency-rebuild/shared/base-card-v3"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type AtlasMessage = {
  id: string
  role: "atlas" | "user"
  content: string
  timestamp: string
}

type AtlasHistoryItem = {
  id: string
  title: string
  note: string
  time: string
}

type AgencyRebuildAtlasProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const quickPrompts = [
  "Como criar uma viagem?",
  "Onde vejo documentos pendentes?",
  "Como registrar um recebimento?",
  "Como montar uma cotacao?",
]

const promptTags = ["Viagens", "Financeiro", "Documentos", "Clientes", "Leads"]

const baseMessage =
  "Atlas ainda esta em modo guia. A integracao inteligente sera conectada depois."

function buildAtlasResponse(prompt: string) {
  const normalized = prompt.toLowerCase()

  if (normalized.includes("viagem")) {
    return `${baseMessage} Para iniciar agora, use o card de Viagens ou o bloco Criar com IA no topo do dashboard.`
  }

  if (normalized.includes("document")) {
    return `${baseMessage} A central de Documentos da V3 vai reunir contratos, vouchers e envios em um fluxo unico.`
  }

  if (normalized.includes("receb") || normalized.includes("finance")) {
    return `${baseMessage} O Financeiro ja tem workspace proprio para lancamentos, contas e relatorios locais.`
  }

  if (normalized.includes("cot")) {
    return `${baseMessage} O Travel Builder concentra cotacao, pacote, margem e proposta em uma central unica.`
  }

  return `${baseMessage} Nesta etapa, eu consigo orientar o caminho da V3 e apontar o melhor workspace para cada acao.`
}

function formatTimeLabel() {
  const now = new Date()
  return now.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function AgencyRebuildAtlas({
  open: controlledOpen,
  onOpenChange,
}: AgencyRebuildAtlasProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"chat" | "history">("chat")
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<AtlasMessage[]>([
    {
      id: "atlas-welcome",
      role: "atlas",
      content: "Ola, Marina. Posso orientar seus proximos passos na V3, sem simular automacao real por enquanto.",
      timestamp: "Agora",
    },
  ])
  const [history, setHistory] = useState<AtlasHistoryItem[]>([
    {
      id: "h-1",
      title: "Criacao de viagem",
      note: "Atlas apontou o workspace de Viagens como melhor inicio.",
      time: "Hoje, 10:12",
    },
    {
      id: "h-2",
      title: "Fluxo documental",
      note: "Guia sugeriu revisar contratos e vouchers no hub de Documentos.",
      time: "Hoje, 09:34",
    },
  ])

  const open = controlledOpen ?? internalOpen

  const setOpen = (nextOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(nextOpen)
    }
    onOpenChange?.(nextOpen)
  }

  const canSend = input.trim().length > 0

  const renderedMessages = useMemo(() => messages.slice(-8), [messages])

  useEffect(() => {
    if (!open) {
      setActiveTab("chat")
    }
  }, [open])

  const sendMessage = (prompt?: string) => {
    const content = (prompt ?? input).trim()
    if (!content) return

    const userMessage: AtlasMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: formatTimeLabel(),
    }

    const atlasMessage: AtlasMessage = {
      id: `atlas-${Date.now() + 1}`,
      role: "atlas",
      content: buildAtlasResponse(content),
      timestamp: formatTimeLabel(),
    }

    const historyItem: AtlasHistoryItem = {
      id: `history-${Date.now()}`,
      title: content,
      note: "Consulta registrada no historico local do Atlas.",
      time: "Agora",
    }

    setMessages((current) => [...current, userMessage, atlasMessage])
    setHistory((current) => [historyItem, ...current].slice(0, 8))
    setInput("")
  }

  return (
    <BaseDrawerV3
      open={open}
      onOpenChange={setOpen}
      direction="right"
      title="Atlas"
      description="Guia operacional da V3. Sem IA real conectada nesta etapa."
      contentClassName="data-[vaul-drawer-direction=right]:w-[min(390px,calc(100vw-1rem))]"
      hideHeader
    >
      <div className="flex h-full min-h-[70vh] flex-col">
        <div className="border-b border-white/8 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/18 bg-primary/[0.12] text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Atlas</p>
                  <p className="text-xs text-muted-foreground">Modo guia</p>
                </div>
              </div>
              <p className="mt-4 text-[22px] font-semibold leading-tight text-foreground">Ola, Marina.</p>
              <p className="mt-1 text-sm text-muted-foreground">Como posso orientar sua operacao hoje?</p>
            </div>

            <AgencyRebuildActionButton
              actionType="modal"
              label={<History className="h-4 w-4" />}
              className="h-9 w-9 rounded-full border border-white/8 bg-white/[0.03] p-0"
              variant="outline"
              tooltip="Abrir historico"
              onAction={() => setActiveTab("history")}
            />
          </div>

          <div className="mt-4 inline-flex rounded-full border border-white/8 bg-white/[0.03] p-1">
            <AgencyRebuildActionButton
              actionType="modal"
              label="Chat"
              className={cn(
                "h-8 rounded-full px-4 text-xs",
                activeTab === "chat" ? "bg-white text-black" : "bg-transparent text-muted-foreground",
              )}
              onAction={() => setActiveTab("chat")}
            />
            <AgencyRebuildActionButton
              actionType="modal"
              label="Historico"
              className={cn(
                "h-8 rounded-full px-4 text-xs",
                activeTab === "history" ? "bg-white text-black" : "bg-transparent text-muted-foreground",
              )}
              onAction={() => setActiveTab("history")}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {activeTab === "chat" ? (
            <div className="space-y-4">
              <BaseCardV3
                eyebrow="Sugestoes"
                title="Comece por um atalho"
                className="rounded-[26px]"
              >
                <div className="space-y-2">
                  {quickPrompts.map((prompt) => (
                    <AgencyRebuildActionButton
                      key={prompt}
                      actionType="modal"
                      label={prompt}
                      className="h-auto w-full justify-start rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2.5 text-left text-sm"
                      variant="outline"
                      onAction={() => sendMessage(prompt)}
                    />
                  ))}
                </div>
              </BaseCardV3>

              <div className="flex flex-wrap gap-2">
                {promptTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[11px] text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="space-y-3">
                {renderedMessages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "max-w-[92%] rounded-[24px] border px-3.5 py-3",
                      message.role === "atlas"
                        ? "border-white/8 bg-white/[0.04] text-muted-foreground"
                        : "ml-auto border-primary/18 bg-primary/[0.1] text-foreground",
                    )}
                  >
                    <p className="text-[13px] leading-6">{message.content}</p>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
                      {message.timestamp}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <BaseCardV3
                  key={item.id}
                  eyebrow="Historico local"
                  title={item.title}
                  description={item.note}
                  className="rounded-[24px] p-3.5"
                >
                  <div className="rounded-[18px] border border-white/8 bg-black/14 px-3 py-2 text-[12px] text-muted-foreground">
                    {item.time}
                  </div>
                </BaseCardV3>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-white/8 pt-4">
          <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-end gap-2">
              <div className="relative flex-1">
                <Bot className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey && canSend) {
                      event.preventDefault()
                      sendMessage()
                    }
                  }}
                  placeholder="Pergunte qualquer coisa ao Atlas..."
                  className="h-12 rounded-[20px] border-white/10 bg-black/18 pl-9 pr-4"
                />
              </div>
              <AgencyRebuildActionButton
                actionType={canSend ? "modal" : "disabled"}
                label={<SendHorizonal className="h-4 w-4" />}
                className="h-12 w-12 rounded-full p-0"
                disabledReason="Digite uma pergunta para falar com o Atlas."
                tooltip="Enviar pergunta"
                onAction={canSend ? () => sendMessage() : undefined}
              />
            </div>
          </div>
        </div>
      </div>
    </BaseDrawerV3>
  )
}
