"use client"

import { useMemo, useState } from "react"
import { AgencyRebuildActionButton } from "@/components/agency-rebuild/actions/agency-rebuild-action-button"
import { BaseModalV3 } from "@/components/agency-rebuild/modals/base-modal-v3"
import { BaseCardV3 } from "@/components/agency-rebuild/shared/base-card-v3"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

type CreditsTab = "overview" | "consumption" | "history" | "packages" | "module-usage" | "alerts" | "requests"
type CreditStatus = "Processado" | "Em revisao" | "Contestacao" | "Ajustado"
type CreditModule = "Roteiros" | "Documentos" | "IA" | "Relatorios" | "Templates" | "Links compartilhaveis" | "Automacoes"
type AlertState = "Novo" | "Lido" | "Resolvido"

type CreditConsumption = {
  id: string
  date: string
  module: CreditModule
  action: string
  user: string
  credits: number
  status: CreditStatus
  notes: string
  origin: string
}

type CreditPackage = {
  id: string
  name: string
  credits: number
  price: number
  badge?: string
  note: string
}

type ModuleUsage = {
  module: CreditModule
  used: number
  percent: number
  lastUse: string
  trend: string
}

type CreditAlert = {
  id: string
  title: string
  body: string
  state: AlertState
}

type CreditRequest = {
  id: string
  title: string
  type: "Ajuste" | "Estorno" | "Revisao"
  status: "Aberta" | "Respondida" | "Em analise"
  createdAt: string
}

type BuyCreditsState = {
  packageId: string
  credits: string
  price: string
  owner: string
  notes: string
  paymentMethod: string
}

const consumptionSeed: CreditConsumption[] = [
  { id: "cons-1", date: "2026-05-26", module: "Roteiros", action: "Geracao premium", user: "Marina Alves", credits: 24, status: "Processado", notes: "Roteiro Italia Signature", origin: "Workspace Roteiros" },
  { id: "cons-2", date: "2026-05-25", module: "Documentos", action: "Contrato assistido", user: "Time Comercial", credits: 12, status: "Em revisao", notes: "Contrato premium internacional", origin: "Workspace Documentos" },
  { id: "cons-3", date: "2026-05-24", module: "Relatorios", action: "Resumo executivo", user: "Marina Alves", credits: 8, status: "Processado", notes: "Resumo do mes", origin: "Workspace Relatorios" },
  { id: "cons-4", date: "2026-05-23", module: "Templates", action: "Copia personalizada", user: "Operacao Premium", credits: 5, status: "Contestacao", notes: "Template VIP", origin: "Workspace Templates" },
]

const packageSeed: CreditPackage[] = [
  { id: "pkg-1", name: "Pacote Inicial", credits: 500, price: 149, note: "Base enxuta para operacao leve." },
  { id: "pkg-2", name: "Pacote Operacional", credits: 1500, price: 349, badge: "Mais escolhido", note: "Equilibrio para agencias em crescimento." },
  { id: "pkg-3", name: "Pacote Avancado", credits: 4000, price: 790, note: "Volume maior para jornadas premium." },
  { id: "pkg-4", name: "Pacote Agencia Pro", credits: 9000, price: 1590, badge: "Melhor custo", note: "Foco em escala e uso intenso de recursos premium." },
]

const moduleUsageSeed: ModuleUsage[] = [
  { module: "Roteiros", used: 420, percent: 32, lastUse: "Hoje, 10:42", trend: "Alta suave" },
  { module: "Documentos", used: 260, percent: 20, lastUse: "Hoje, 09:15", trend: "Estavel" },
  { module: "IA", used: 190, percent: 15, lastUse: "Ontem, 18:10", trend: "Subindo" },
  { module: "Relatorios", used: 145, percent: 11, lastUse: "Ontem, 16:30", trend: "Leve alta" },
  { module: "Templates", used: 110, percent: 9, lastUse: "2 dias", trend: "Estavel" },
  { module: "Links compartilhaveis", used: 85, percent: 7, lastUse: "2 dias", trend: "Baixa" },
  { module: "Automacoes", used: 42, percent: 3, lastUse: "Sem uso recente", trend: "Futuro" },
]

const alertSeed: CreditAlert[] = [
  { id: "alert-1", title: "Saldo baixo em 14 dias", body: "Mantendo o ritmo atual, o saldo de creditos entra em zona de atencao em duas semanas.", state: "Novo" },
  { id: "alert-2", title: "Consumo acima da media", body: "Roteiros premium consumiram 18% acima da media semanal.", state: "Novo" },
  { id: "alert-3", title: "Pacote proximo do fim", body: "O pacote operacional atual esta acima de 72% de uso.", state: "Lido" },
]

const requestSeed: CreditRequest[] = [
  { id: "req-1", title: "Revisao de consumo de template VIP", type: "Revisao", status: "Em analise", createdAt: "2026-05-25" },
  { id: "req-2", title: "Solicitacao de ajuste manual", type: "Ajuste", status: "Aberta", createdAt: "2026-05-23" },
]

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value)
}

function statusTone(status: CreditStatus | AlertState | CreditRequest["status"]) {
  if (status === "Processado" || status === "Resolvido" || status === "Respondida") return "border-emerald-400/18 bg-emerald-400/[0.08] text-emerald-100"
  if (status === "Em revisao" || status === "Lido" || status === "Em analise") return "border-primary/18 bg-primary/[0.08] text-primary-foreground"
  if (status === "Contestacao" || status === "Novo" || status === "Aberta") return "border-amber-400/18 bg-amber-400/[0.08] text-amber-100"
  return "border-white/10 bg-white/[0.03] text-muted-foreground"
}

function emptyBuyState(): BuyCreditsState {
  return {
    packageId: packageSeed[1]?.id ?? "",
    credits: String(packageSeed[1]?.credits ?? 1500),
    price: String(packageSeed[1]?.price ?? 349),
    owner: "Marina Alves",
    notes: "",
    paymentMethod: "Billing futuro",
  }
}

export function AgencyRebuildCreditsWorkspace({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [tab, setTab] = useState<CreditsTab>("overview")
  const [consumptions, setConsumptions] = useState<CreditConsumption[]>(consumptionSeed)
  const [alerts, setAlerts] = useState<CreditAlert[]>(alertSeed)
  const [requests, setRequests] = useState<CreditRequest[]>(requestSeed)
  const [buyOpen, setBuyOpen] = useState(false)
  const [buyState, setBuyState] = useState<BuyCreditsState>(emptyBuyState())
  const [detailId, setDetailId] = useState<string | null>(null)

  const selectedConsumption = useMemo(
    () => consumptions.find((item) => item.id === detailId) ?? null,
    [consumptions, detailId],
  )

  const availableCredits = 1280
  const usedCredits = 940
  const usagePercent = 42
  const forecast = "Saldo saudavel ate 14 jun"
  const averageConsumption = 138

  const markReviewed = (id: string) => {
    setConsumptions((items) => items.map((item) => (item.id === id ? { ...item, status: "Em revisao" } : item)))
    toast({ title: "Consumo revisado", description: "O item foi marcado localmente como revisado." })
  }

  const contestConsumption = (id: string) => {
    setConsumptions((items) => items.map((item) => (item.id === id ? { ...item, status: "Contestacao" } : item)))
    setRequests((items) => [
      { id: `req-${Date.now()}`, title: "Contestacao de consumo", type: "Revisao", status: "Aberta", createdAt: "2026-05-26" },
      ...items,
    ])
    toast({ title: "Contestacao criada", description: "A revisao do consumo foi aberta localmente na V3." })
  }

  const requestSupport = () => {
    setRequests((items) => [
      { id: `req-${Date.now()}`, title: "Solicitacao de suporte em creditos", type: "Ajuste", status: "Aberta", createdAt: "2026-05-26" },
      ...items,
    ])
    toast({ title: "Solicitacao enviada", description: "O pedido de suporte foi registrado localmente." })
  }

  const markAlertRead = (id: string) => {
    setAlerts((items) => items.map((item) => (item.id === id ? { ...item, state: "Lido" } : item)))
  }

  const submitPurchase = () => {
    setBuyOpen(false)
    toast({
      title: "Solicitacao de compra preparada",
      description: "Compra real de creditos sera conectada ao billing depois.",
    })
  }

  return (
    <>
      <BaseModalV3
        open={open}
        onOpenChange={onOpenChange}
        title="Creditos"
        description="Saldo, consumo, historico e uso inteligente dos creditos da agencia."
        contentClassName="sm:max-w-[1360px]"
      >
        <div className="space-y-5">
          <div className="flex flex-col gap-4 rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Creditos disponiveis", value: String(availableCredits) },
                  { label: "Creditos usados", value: String(usedCredits) },
                  { label: "Uso percentual", value: `${usagePercent}%` },
                  { label: "Previsao de consumo", value: forecast },
                ].map((item) => (
                  <div key={item.label} className="rounded-[22px] border border-white/8 bg-black/20 px-4 py-3">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/70">{item.label}</div>
                    <div className="mt-2 text-2xl font-semibold text-zinc-50">{item.value}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 xl:max-w-[520px] xl:justify-end">
                <AgencyRebuildActionButton actionType="modal" label="Comprar creditos" className="rounded-full" onAction={() => setBuyOpen(true)} />
                <AgencyRebuildActionButton actionType="modal" label="Ver consumo" className="rounded-full" onAction={() => setTab("consumption")} />
                <AgencyRebuildActionButton actionType="api" label="Solicitar ajuste" className="rounded-full" onAction={requestSupport} />
                <AgencyRebuildActionButton actionType="future" label="Exportar historico" className="rounded-full" futureMessage="A exportacao real do historico de creditos sera ligada depois." />
              </div>
            </div>

            <Tabs value={tab} onValueChange={(value) => setTab(value as CreditsTab)} className="space-y-5">
              <TabsList className="flex h-auto flex-wrap gap-2 rounded-[22px] border border-white/8 bg-black/16 p-1">
                <TabsTrigger value="overview">Visao geral</TabsTrigger>
                <TabsTrigger value="consumption">Consumo</TabsTrigger>
                <TabsTrigger value="history">Historico</TabsTrigger>
                <TabsTrigger value="packages">Pacotes</TabsTrigger>
                <TabsTrigger value="module-usage">Uso por modulo</TabsTrigger>
                <TabsTrigger value="alerts">Alertas</TabsTrigger>
                <TabsTrigger value="requests">Solicitacoes</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {[
                    { label: "Disponiveis", value: String(availableCredits), note: "Saldo pronto para sustentar a operacao." },
                    { label: "Consumidos no mes", value: String(usedCredits), note: "Leitura viva do gasto recente." },
                    { label: "Uso percentual", value: `${usagePercent}%`, note: "Quanto do pacote atual ja foi usado." },
                    { label: "Consumo medio", value: `${averageConsumption} / semana`, note: "Ritmo atual da agencia." },
                    { label: "Previsao de fim", value: "14 jun", note: "Janela estimada para renovacao." },
                    { label: "Ultimo pacote", value: "Pacote Operacional", note: "Base ativa no momento." },
                  ].map((item) => (
                    <BaseCardV3 key={item.label} eyebrow={item.label} title={item.value} description={item.note} className="rounded-[24px] p-4" />
                  ))}
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                  <BaseCardV3 eyebrow="Uso em foco" title="Onde o saldo mais gira" description="Modulos intensos, alertas vivos e acoes sugeridas." className="rounded-[28px]">
                    <div className="grid gap-3 md:grid-cols-2">
                      {[
                        "Roteiros seguem como principal consumidor de creditos premium.",
                        "Saldo baixo entra em atencao se a semana mantiver o mesmo ritmo.",
                        "Documentos crescem em dias de fechamento e embarque.",
                        "Vale abrir pacote novo antes do proximo pico operacional.",
                      ].map((item) => (
                        <div key={item} className="rounded-[18px] border border-white/8 bg-black/14 px-3 py-3 text-sm text-muted-foreground">
                          {item}
                        </div>
                      ))}
                    </div>
                  </BaseCardV3>

                  <BaseCardV3 eyebrow="Modulos intensos" title="Ultimo consumo por modulo" description="Sinais rapidos para ler a pressao sobre o saldo." className="rounded-[28px]">
                    <div className="space-y-2">
                      {moduleUsageSeed.slice(0, 4).map((item) => (
                        <div key={item.module} className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2">
                          <div className="text-sm font-medium text-zinc-100">{item.module}</div>
                          <div className="text-xs text-muted-foreground">{item.used} creditos • {item.lastUse}</div>
                        </div>
                      ))}
                    </div>
                  </BaseCardV3>
                </div>
              </TabsContent>

              <TabsContent value="consumption" className="space-y-3">
                {consumptions.map((item) => (
                  <div key={item.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-[0.8fr_1fr_1fr_0.8fr_0.8fr_0.9fr_1fr]">
                        <div className="text-sm text-muted-foreground"><div>Data</div><div className="mt-1 text-zinc-100">{item.date}</div></div>
                        <div className="text-sm text-muted-foreground"><div>Modulo</div><div className="mt-1 text-zinc-100">{item.module}</div></div>
                        <div className="text-sm text-muted-foreground"><div>Acao</div><div className="mt-1 text-zinc-100">{item.action}</div></div>
                        <div className="text-sm text-muted-foreground"><div>Usuario</div><div className="mt-1 text-zinc-100">{item.user}</div></div>
                        <div className="text-sm text-muted-foreground"><div>Creditos</div><div className="mt-1 text-zinc-100">{item.credits}</div></div>
                        <div className="text-sm text-muted-foreground"><div>Status</div><Badge className={`mt-1 rounded-full border px-2 py-0.5 text-[10px] ${statusTone(item.status)}`} variant="outline">{item.status}</Badge></div>
                        <div className="text-sm text-muted-foreground"><div>Observacao</div><div className="mt-1 text-zinc-100">{item.notes}</div></div>
                      </div>

                      <div className="flex flex-wrap gap-2 xl:justify-end">
                        <AgencyRebuildActionButton actionType="modal" label="Detalhe" className="h-8 rounded-full px-3 text-xs" onAction={() => setDetailId(item.id)} />
                        <AgencyRebuildActionButton actionType="api" label="Contestar" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => contestConsumption(item.id)} />
                        <AgencyRebuildActionButton actionType="api" label="Revisado" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => markReviewed(item.id)} />
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="history" className="space-y-3">
                {[
                  "Compra de creditos registrada para Pacote Operacional",
                  "Uso em roteiro premium Italia Signature",
                  "Uso em documento contratual internacional",
                  "Ajuste manual de saldo solicitado",
                  "Alerta de saldo baixo emitido",
                ].map((item) => (
                  <div key={item} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-muted-foreground">
                    {item}
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="packages" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {packageSeed.map((pkg) => (
                    <BaseCardV3
                      key={pkg.id}
                      eyebrow={pkg.badge ?? "Pacote"}
                      title={pkg.name}
                      description={`${pkg.credits} creditos • ${pkg.note}`}
                      className="rounded-[26px]"
                      footer={<AgencyRebuildActionButton actionType="modal" label="Comprar" className="h-8 rounded-full px-3 text-xs" onAction={() => {
                        setBuyState({
                          packageId: pkg.id,
                          credits: String(pkg.credits),
                          price: String(pkg.price),
                          owner: "Marina Alves",
                          notes: "",
                          paymentMethod: "Billing futuro",
                        })
                        setBuyOpen(true)
                      }} />}
                    >
                      <div className="text-2xl font-semibold text-zinc-50">{formatCurrency(pkg.price)}</div>
                    </BaseCardV3>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="module-usage" className="space-y-3">
                {moduleUsageSeed.map((item) => (
                  <div key={item.module} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_0.8fr_0.8fr_1fr]">
                      <div className="text-sm font-medium text-zinc-100">{item.module}</div>
                      <div className="text-sm text-muted-foreground">{item.used} creditos • {item.percent}%</div>
                      <div className="text-sm text-muted-foreground">{item.lastUse}</div>
                      <div className="text-sm text-muted-foreground">{item.trend}</div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="alerts" className="space-y-3">
                {alerts.map((item) => (
                  <div key={item.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                      <div>
                        <div className="text-sm font-medium text-zinc-100">{item.title}</div>
                        <div className="mt-1 text-sm text-muted-foreground">{item.body}</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={`rounded-full border px-2 py-0.5 text-[10px] ${statusTone(item.state)}`} variant="outline">{item.state}</Badge>
                        <AgencyRebuildActionButton actionType="api" label="Marcar lido" className="h-8 rounded-full px-3 text-xs" onAction={() => markAlertRead(item.id)} />
                        <AgencyRebuildActionButton actionType="api" label="Solicitar suporte" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={requestSupport} />
                        <AgencyRebuildActionButton actionType="modal" label="Abrir pacotes" variant="outline" className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs" onAction={() => setTab("packages")} />
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="requests" className="space-y-3">
                {requests.map((item) => (
                  <div key={item.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr]">
                      <div>
                        <div className="text-sm font-medium text-zinc-100">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.createdAt}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">{item.type}</div>
                      <div><Badge className={`rounded-full border px-2 py-0.5 text-[10px] ${statusTone(item.status)}`} variant="outline">{item.status}</Badge></div>
                      <div className="text-sm text-muted-foreground">Atendimento local</div>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </BaseModalV3>

      <BaseModalV3
        open={buyOpen}
        onOpenChange={setBuyOpen}
        title="Comprar creditos"
        description="Escolha um pacote, revise os dados e envie uma solicitacao honesta."
        contentClassName="sm:max-w-3xl"
        footer={
          <>
            <AgencyRebuildActionButton actionType="modal" label="Cancelar" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onAction={() => setBuyOpen(false)} />
            <AgencyRebuildActionButton actionType="modal" label="Solicitar compra" className="rounded-full" onAction={submitPurchase} />
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Select value={buyState.packageId} onValueChange={(value) => setBuyState((current) => ({ ...current, packageId: value }))}>
            <SelectTrigger className="rounded-[20px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Pacote selecionado" /></SelectTrigger>
            <SelectContent>{packageSeed.map((pkg) => <SelectItem key={pkg.id} value={pkg.id}>{pkg.name}</SelectItem>)}</SelectContent>
          </Select>
          <Input value={buyState.credits} onChange={(event) => setBuyState((current) => ({ ...current, credits: event.target.value }))} placeholder="Creditos" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Input value={buyState.price} onChange={(event) => setBuyState((current) => ({ ...current, price: event.target.value }))} placeholder="Valor em R$" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Input value={buyState.owner} onChange={(event) => setBuyState((current) => ({ ...current, owner: event.target.value }))} placeholder="Responsavel" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <Input value={buyState.paymentMethod} onChange={(event) => setBuyState((current) => ({ ...current, paymentMethod: event.target.value }))} placeholder="Forma de pagamento" className="rounded-[20px] border-white/10 bg-white/[0.03]" />
          <div className="md:col-span-2">
            <Textarea value={buyState.notes} onChange={(event) => setBuyState((current) => ({ ...current, notes: event.target.value }))} placeholder="Observacoes da solicitacao." className="min-h-[140px] rounded-[20px] border-white/10 bg-white/[0.03]" />
          </div>
        </div>
      </BaseModalV3>

      <BaseModalV3
        open={Boolean(selectedConsumption)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setDetailId(null)
        }}
        title="Detalhe de consumo"
        description="Modulo, acao, data, usuario, creditos, origem e status deste consumo."
        contentClassName="sm:max-w-3xl"
      >
        {selectedConsumption ? (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              {[
                `Modulo: ${selectedConsumption.module}`,
                `Acao: ${selectedConsumption.action}`,
                `Data: ${selectedConsumption.date}`,
                `Usuario: ${selectedConsumption.user}`,
                `Creditos: ${selectedConsumption.credits}`,
                `Origem: ${selectedConsumption.origin}`,
              ].map((item) => (
                <div key={item} className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground">
                  {item}
                </div>
              ))}
            </div>
            <div className="rounded-[18px] border border-white/8 bg-black/14 px-3 py-3 text-sm text-muted-foreground">
              {selectedConsumption.notes}
            </div>
            <div className="flex flex-wrap gap-2">
              <AgencyRebuildActionButton actionType="api" label="Contestar" className="rounded-full" onAction={() => contestConsumption(selectedConsumption.id)} />
              <AgencyRebuildActionButton actionType="api" label="Marcar revisado" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onAction={() => markReviewed(selectedConsumption.id)} />
              <AgencyRebuildActionButton actionType="future" label="Abrir origem" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" futureMessage="A conexao com a origem real sera ativada depois." />
            </div>
          </div>
        ) : null}
      </BaseModalV3>
    </>
  )
}
