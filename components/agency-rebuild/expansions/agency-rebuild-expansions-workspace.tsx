"use client"

import { useMemo, useState } from "react"
import {
  Bot,
  BrainCircuit,
  MessageCircleMore,
  MessagesSquare,
  Sparkles,
  WandSparkles,
} from "lucide-react"
import { AgencyRebuildActionButton } from "@/components/agency-rebuild/actions/agency-rebuild-action-button"
import { BaseModalV3 } from "@/components/agency-rebuild/modals/base-modal-v3"
import { BaseCardV3 } from "@/components/agency-rebuild/shared/base-card-v3"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"

type ExpansionTab =
  | "overview"
  | "active"
  | "available"
  | "advisor"
  | "marketing"
  | "automation"
  | "history"

type ExpansionId = "go" | "agent" | "marketing" | "advisor" | "automations"

type ExpansionRecord = {
  id: ExpansionId
  name: string
  subtitle: string
  status: "Em preparacao" | "Ativacao futura" | "Disponivel para interesse"
  category: string
  description: string
  accent: string
  icon: typeof Bot
  previewTitle: string
  previewBody: string
  benefitTitle: string
  benefitBody: string
  benefits: string[]
  ctaLabel: string
  exploreLabel: string
  active: boolean
}

const expansionSeed: ExpansionRecord[] = [
  {
    id: "go",
    name: "TravelPro Go",
    subtitle: "Assistente interno operacional",
    status: "Disponivel para interesse",
    category: "Operacao conversacional",
    description: "Tudo comeca em uma mensagem: cria roteiros, contratos, cotacoes e sincroniza com o portal.",
    accent: "from-orange-400/20 via-orange-300/10 to-transparent",
    icon: MessageCircleMore,
    previewTitle: "Operacao por mensagem",
    previewBody: "Uma camada interna para a equipe resolver acao operacional, gerar conteudo e disparar tarefas sem sair da conversa.",
    benefitTitle: "Beneficio operacional",
    benefitBody: "Reduz atrito da equipe e transforma comandos em entregas registradas no ecossistema TravelPro.",
    benefits: [
      "Cria roteiros e contratos",
      "Gera cotacoes",
      "Sincroniza com portal",
      "Alertas inteligentes",
      "Tarefas operacionais",
      "Orienta sua equipe",
    ],
    ctaLabel: "Solicitar ativacao",
    exploreLabel: "Ver como funciona",
    active: true,
  },
  {
    id: "agent",
    name: "TravelPro Agent",
    subtitle: "Atendimento inteligente externo",
    status: "Em preparacao",
    category: "Relacionamento e conversao",
    description: "Atende, qualifica e conduz leads e clientes em uma trilha unica, com proximo passo sugerido.",
    accent: "from-sky-400/20 via-sky-300/10 to-transparent",
    icon: MessagesSquare,
    previewTitle: "Lead qualificado em fluxo continuo",
    previewBody: "O Agent responde 24/7, identifica interesse, registra contexto e entrega o lead pronto para conversao humana.",
    benefitTitle: "Beneficio operacional",
    benefitBody: "Mantem atendimento vivo mesmo fora do horario comercial e encurta o tempo entre contato e proposta.",
    benefits: [
      "Atendimento 24/7",
      "Qualificacao de leads",
      "Follow-up inteligente",
      "Conversa em andamento",
      "Proximo passo sugerido",
      "Trilha unica de atendimento",
    ],
    ctaLabel: "Solicitar ativacao",
    exploreLabel: "Conhecer modulo",
    active: false,
  },
  {
    id: "marketing",
    name: "Marketing IA",
    subtitle: "Campanhas aplicadas ao turismo",
    status: "Disponivel para interesse",
    category: "Conteudo e promocao",
    description: "Calendario vivo com posts, pecas, legendas e oportunidades prontas para publicar no contexto da agencia.",
    accent: "from-fuchsia-400/20 via-pink-300/10 to-transparent",
    icon: Sparkles,
    previewTitle: "Calendario promocional vivo",
    previewBody: "Uma central para transformar sazonalidade, destinos e campanhas em conteudo recorrente para Instagram e relacionamento.",
    benefitTitle: "Beneficio operacional",
    benefitBody: "Diminui o tempo de criacao de campanha e ajuda a manter frequencia com inteligencia aplicada ao turismo.",
    benefits: [
      "Posts para Instagram",
      "Calendario promocional",
      "Segmentacao de clientes",
      "Campanhas e ideias",
      "Legendas prontas",
      "Oportunidades prontas para publicar",
    ],
    ctaLabel: "Conhecer modulo",
    exploreLabel: "Explorar campanha",
    active: false,
  },
  {
    id: "advisor",
    name: "Atlas Advisor",
    subtitle: "Consultoria operacional e estrategica",
    status: "Ativacao futura",
    category: "Consultoria premium",
    description: "Leituras estrategicas, scripts prontos e apoio operacional em momentos criticos para organizar e escalar a agencia.",
    accent: "from-emerald-400/20 via-emerald-300/10 to-transparent",
    icon: BrainCircuit,
    previewTitle: "Advisor consultivo",
    previewBody: "Nao e o Atlas suporte do header. Aqui o foco e orientar comercialmente, estruturar processos e apoiar decisao em situacoes dificeis.",
    benefitTitle: "Beneficio operacional",
    benefitBody: "Ajuda a agencia a organizar crescimento, responder melhor em momentos sensiveis e padronizar atendimento.",
    benefits: [
      "Orientacao comercial",
      "Scripts de atendimento",
      "Apoio em situacoes dificeis",
      "Suporte estrategico",
      "Leituras estrategicas",
      "Organizacao e escala da agencia",
    ],
    ctaLabel: "Conhecer modulo",
    exploreLabel: "Ver diagnostico",
    active: false,
  },
  {
    id: "automations",
    name: "Automacoes Premium",
    subtitle: "Fluxos e gatilhos de alto valor",
    status: "Disponivel para interesse",
    category: "Automacao avancada",
    description: "Jornadas, follow-ups, alertas e tarefas recorrentes com processos avancados da operacao.",
    accent: "from-violet-400/20 via-violet-300/10 to-transparent",
    icon: WandSparkles,
    previewTitle: "Fluxos premium automatizados",
    previewBody: "A central de automacoes prepara jornadas, tarefas automaticas e alertas de alto valor para a rotina da agencia.",
    benefitTitle: "Beneficio operacional",
    benefitBody: "Tira peso de processos recorrentes e ajuda a padronizar follow-ups e execucao com menos friccao.",
    benefits: [
      "Automacao de processos",
      "Jornadas",
      "Gatilhos",
      "Follow-ups automaticos",
      "Alertas automaticos",
      "Tarefas recorrentes",
    ],
    ctaLabel: "Solicitar ativacao",
    exploreLabel: "Ver fluxo",
    active: false,
  },
]

function statusTone(status: ExpansionRecord["status"]) {
  if (status === "Disponivel para interesse") return "border-primary/18 bg-primary/[0.08] text-primary-foreground"
  if (status === "Ativacao futura") return "border-amber-400/18 bg-amber-400/[0.08] text-amber-100"
  return "border-white/10 bg-white/[0.03] text-muted-foreground"
}

function ExpansionPreview({ item }: { item: ExpansionRecord }) {
  if (item.id === "go") {
    return (
      <div className="space-y-3">
        {[
          ["Criar roteiro para Joao em Gramado", "Roteiro criado e salvo no sistema."],
          ["Gerar contrato da viagem da Ana", "Contrato criado com a identidade da agencia."],
          ["Criar pacote para Cancun e publicar no catalogo", "Pacote publicado e pronto para compartilhar."],
        ].map(([question, answer]) => (
          <div key={question} className="space-y-2">
            <div className="ml-auto max-w-[92%] rounded-[22px] border border-primary/18 bg-primary/[0.1] px-3.5 py-3 text-sm text-foreground">
              {question}
            </div>
            <div className="max-w-[92%] rounded-[22px] border border-white/8 bg-white/[0.04] px-3.5 py-3 text-sm text-muted-foreground">
              {answer}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (item.id === "agent") {
    return (
      <div className="space-y-3">
        <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4 text-sm text-muted-foreground">
          Lead: casal interessado em lua de mel no Caribe.
        </div>
        <div className="rounded-[22px] border border-white/8 bg-black/18 p-4 text-sm text-muted-foreground">
          Conversa ativa, orcamento estimado validado e proximo passo sugerido para o consultor.
        </div>
        <div className="rounded-[22px] border border-primary/18 bg-primary/[0.08] px-4 py-3 text-sm text-foreground">
          Resultado: lead qualificado, retorno agendado e contexto pronto no portal.
        </div>
      </div>
    )
  }

  if (item.id === "marketing") {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {[
          "Semana da lua de mel / post + legenda pronta",
          "Julho premium / campanha para clientes VIP",
          "Gramado inverno / oportunidade com CTA de WhatsApp",
          "Caribe em alta / ideia pronta para reels e stories",
        ].map((entry) => (
          <div key={entry} className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-muted-foreground">
            {entry}
          </div>
        ))}
      </div>
    )
  }

  if (item.id === "advisor") {
    return (
      <div className="space-y-3">
        <div className="rounded-[22px] border border-white/8 bg-black/18 p-4 text-sm text-muted-foreground">
          Diagnostico: leads quentes com retorno lento e fechamento concentrado em poucos consultores.
        </div>
        <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4 text-sm text-muted-foreground">
          Script sugerido: abordagem de retomada com prova social, CTA curto e prazo de resposta.
        </div>
        <div className="rounded-[22px] border border-emerald-400/16 bg-emerald-400/[0.07] p-4 text-sm text-emerald-100">
          Leitura estrategica: reorganizar follow-up, distribuir melhor atendimento e proteger margem.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {[
        "Lead novo entra e aciona follow-up automatico",
        "Cliente sem retorno gera alerta para equipe",
        "Pagamento confirmado dispara checklist documental",
      ].map((step, index) => (
        <div key={step} className="flex items-center gap-3 rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-muted-foreground">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/8 bg-black/16 text-[11px] text-foreground">
            {index + 1}
          </div>
          {step}
        </div>
      ))}
    </div>
  )
}

export function AgencyRebuildExpansionsWorkspace({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [tab, setTab] = useState<ExpansionTab>("overview")
  const [items, setItems] = useState(expansionSeed)
  const [detailId, setDetailId] = useState<ExpansionId | null>(null)

  const selected = useMemo(() => items.find((item) => item.id === detailId) ?? null, [detailId, items])
  const activeCount = items.filter((item) => item.active).length
  const availableCount = items.length - activeCount
  const betaCount = items.filter((item) => item.status === "Em preparacao").length
  const futureCount = items.filter((item) => item.status === "Ativacao futura").length

  const markInterest = (id: ExpansionId, label: string) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, active: true } : item)))
    toast({
      title: `${label} em interesse`,
      description: "A marcacao foi aplicada localmente no preview da V3.",
    })
  }

  const renderGrid = (list: ExpansionRecord[]) => (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {list.map((item) => {
        const Icon = item.icon

        return (
          <BaseCardV3
            key={item.id}
            eyebrow={item.category}
            title={item.name}
            description={item.subtitle}
            className="rounded-[28px]"
            actions={
              <Badge className={`rounded-full border px-2 py-0.5 text-[10px] ${statusTone(item.status)}`} variant="outline">
                {item.status}
              </Badge>
            }
            footer={
              <>
                <AgencyRebuildActionButton
                  actionType="modal"
                  label="Explorar"
                  className="h-8 rounded-full px-3 text-xs"
                  onAction={() => setDetailId(item.id)}
                />
                <AgencyRebuildActionButton
                  actionType="future"
                  label={item.ctaLabel}
                  variant="outline"
                  className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs"
                  futureMessage={`${item.name} ainda esta em preparacao para ativacao real.`}
                />
              </>
            }
          >
            <div className={`rounded-[22px] border border-white/8 bg-gradient-to-br ${item.accent} p-4`}>
              <div className="flex items-start justify-between gap-3">
                <div className="rounded-[16px] border border-white/8 bg-black/18 p-2.5 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-primary/72">Expansao real</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.status}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{item.description}</p>
            </div>
          </BaseCardV3>
        )
      })}
    </div>
  )

  return (
    <>
      <BaseModalV3
        open={open}
        onOpenChange={onOpenChange}
        title="Expanda sua operacao."
        description="Modulos avancados para levar sua agencia ao proximo nivel."
        contentClassName="sm:max-w-[1360px]"
      >
        <div className="space-y-5">
          <div className="grid gap-4 rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.018))] p-5 xl:grid-cols-[1fr_auto] xl:items-start">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Expansoes ativas", value: String(activeCount) },
                { label: "Disponiveis", value: String(availableCount) },
                { label: "Em preparacao", value: String(betaCount) },
                { label: "Ativacao futura", value: String(futureCount) },
              ].map((item) => (
                <div key={item.label} className="rounded-[22px] border border-white/8 bg-black/18 px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/70">{item.label}</div>
                  <div className="mt-2 text-2xl font-semibold text-zinc-50">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 xl:max-w-[480px] xl:justify-end">
              <AgencyRebuildActionButton actionType="modal" label="Ativar expansao" className="rounded-full" onAction={() => setTab("available")} />
              <AgencyRebuildActionButton actionType="modal" label="Explorar catalogo" className="rounded-full" onAction={() => setTab("overview")} />
              <AgencyRebuildActionButton
                actionType="future"
                label="Solicitar integracao"
                variant="outline"
                className="rounded-full border-white/10 bg-white/[0.03]"
                futureMessage="A solicitacao real de integracao sera conectada em uma proxima etapa."
              />
              <AgencyRebuildActionButton actionType="modal" label="Ver roadmap" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onAction={() => setTab("history")} />
            </div>
          </div>

          <Tabs value={tab} onValueChange={(value) => setTab(value as ExpansionTab)} className="space-y-5">
            <TabsList className="flex h-auto flex-wrap gap-2 rounded-[22px] border border-white/8 bg-black/16 p-1">
              <TabsTrigger value="overview">Visao geral</TabsTrigger>
              <TabsTrigger value="active">Ativas</TabsTrigger>
              <TabsTrigger value="available">Disponiveis</TabsTrigger>
              <TabsTrigger value="advisor">Atlas Advisor</TabsTrigger>
              <TabsTrigger value="marketing">Marketing IA</TabsTrigger>
              <TabsTrigger value="automation">Automacoes Premium</TabsTrigger>
              <TabsTrigger value="history">Historico</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {[
                  { label: "Expansoes reais", value: "5", note: "Go, Agent, Marketing IA, Atlas Advisor e Automacoes Premium." },
                  { label: "Camadas premium", value: "3", note: "Advisor, Automacoes Premium e TravelPro Go como frentes de alto valor." },
                  { label: "Frentes conversacionais", value: "2", note: "Go para operacao interna e Agent para atendimento externo." },
                  { label: "Marketing aplicado", value: "1", note: "Calendario vivo, posts e oportunidades para turismo." },
                  { label: "Consultoria premium", value: "1", note: "Atlas Advisor para leitura estrategica e apoio operacional." },
                  { label: "Atlas suporte", value: "Header", note: "Separado do Advisor, segue como chat de ajuda da V3." },
                ].map((item) => (
                  <BaseCardV3 key={item.label} eyebrow={item.label} title={item.value} description={item.note} className="rounded-[24px] p-4" />
                ))}
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <BaseCardV3
                  eyebrow="Expansoes reais do ecossistema"
                  title="O que leva a agencia para o proximo nivel"
                  description="Cada frente conversa com operacao, atendimento, marketing ou escala sem perder a identidade premium do TravelPro."
                  className="rounded-[28px]"
                >
                  <div className="grid gap-3 md:grid-cols-2">
                    {[
                      "TravelPro Go transforma mensagens em tarefas, contratos, roteiros e cotacoes.",
                      "TravelPro Agent qualifica e conduz leads e clientes em uma trilha automatizada.",
                      "Marketing IA conecta calendario promocional, posts e campanhas aplicadas ao turismo.",
                      "Atlas Advisor atua como consultoria estrategica premium, sem confundir com o chat de suporte.",
                    ].map((item) => (
                      <div key={item} className="rounded-[18px] border border-white/8 bg-black/14 px-3 py-3 text-sm text-muted-foreground">
                        {item}
                      </div>
                    ))}
                  </div>
                </BaseCardV3>

                <BaseCardV3
                  eyebrow="Em destaque"
                  title="Catalogo premium"
                  description="As cinco expansoes reais ficam prontas para exploracao, interesse local e futura ativacao."
                  className="rounded-[28px]"
                >
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-zinc-100">{item.name}</p>
                          <Badge className={`rounded-full border px-2 py-0.5 text-[10px] ${statusTone(item.status)}`} variant="outline">
                            {item.status}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{item.subtitle}</p>
                      </div>
                    ))}
                  </div>
                </BaseCardV3>
              </div>

              {renderGrid(items)}
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              {renderGrid(items.filter((item) => item.active))}
            </TabsContent>

            <TabsContent value="available" className="space-y-4">
              {renderGrid(items.filter((item) => !item.active))}
            </TabsContent>

            <TabsContent value="advisor" className="space-y-4">
              {renderGrid(items.filter((item) => item.id === "advisor"))}
            </TabsContent>

            <TabsContent value="marketing" className="space-y-4">
              {renderGrid(items.filter((item) => item.id === "marketing"))}
            </TabsContent>

            <TabsContent value="automation" className="space-y-4">
              {renderGrid(items.filter((item) => item.id === "automations"))}
            </TabsContent>

            <TabsContent value="history" className="space-y-3">
              {[
                "TravelPro Go sinalizado como expansao principal para acelerar operacao por mensagem.",
                "Atlas Advisor reposicionado como consultoria premium, separado do Atlas suporte do header.",
                "Marketing IA preparado como frente de campanhas, calendario promocional e conteudo para turismo.",
                "TravelPro Agent registrado como camada 24/7 de qualificacao e atendimento externo.",
                "Automacoes Premium definidas como jornadas, gatilhos e follow-ups de alto valor.",
              ].map((item) => (
                <div key={item} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-muted-foreground">
                  {item}
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </BaseModalV3>

      <BaseModalV3
        open={Boolean(selected)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setDetailId(null)
        }}
        title={selected?.name ?? "Detalhes da expansao"}
        description={selected?.subtitle ?? "Expansao premium do ecossistema TravelPro."}
        contentClassName="sm:max-w-5xl"
        footer={
          selected ? (
            <>
              <AgencyRebuildActionButton
                actionType="api"
                label={selected.ctaLabel}
                className="rounded-full"
                onAction={() => markInterest(selected.id, selected.name)}
              />
              <AgencyRebuildActionButton
                actionType="future"
                label={selected.exploreLabel}
                variant="outline"
                className="rounded-full border-white/10 bg-white/[0.03]"
                futureMessage={`${selected.name} ainda sera conectado ao fluxo real depois.`}
              />
            </>
          ) : null
        }
      >
        {selected ? (
          <div className="space-y-5">
            <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
              <BaseCardV3
                eyebrow={selected.category}
                title={selected.name}
                description={selected.description}
                className="rounded-[28px]"
                actions={
                  <Badge className={`rounded-full border px-2.5 py-1 text-[10px] ${statusTone(selected.status)}`} variant="outline">
                    {selected.status}
                  </Badge>
                }
              >
                <div className={`rounded-[24px] border border-white/8 bg-gradient-to-br ${selected.accent} p-5`}>
                  <div className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-white/8 bg-black/20 text-primary">
                    <selected.icon className="h-7 w-7" />
                  </div>
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">{selected.previewBody}</p>
                </div>
              </BaseCardV3>

              <BaseCardV3
                eyebrow="Beneficios"
                title={selected.benefitTitle}
                description={selected.benefitBody}
                className="rounded-[28px]"
              >
                <div className="grid gap-3 md:grid-cols-2">
                  {selected.benefits.map((item) => (
                    <div key={item} className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-3 text-sm text-muted-foreground">
                      {item}
                    </div>
                  ))}
                </div>
              </BaseCardV3>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <BaseCardV3
                eyebrow="Preview"
                title={selected.previewTitle}
                description="Leitura visual local, sem backend fake."
                className="rounded-[28px]"
              >
                <ExpansionPreview item={selected} />
              </BaseCardV3>

              <div className="space-y-4">
                <BaseCardV3
                  eyebrow="Beneficio operacional"
                  title="O que muda na rotina"
                  description={selected.benefitBody}
                  className="rounded-[28px]"
                />

                <BaseCardV3
                  eyebrow="Status honesto"
                  title={selected.status}
                  description="Disponivel em preparacao / ativacao futura, sem simulacao de backend real nesta etapa."
                  className="rounded-[28px]"
                />
              </div>
            </div>
          </div>
        ) : null}
      </BaseModalV3>
    </>
  )
}
