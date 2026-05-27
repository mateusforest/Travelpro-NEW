"use client"

import { useMemo, useState } from "react"
import { GripHorizontal } from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { BaseCardV3 } from "@/components/agency-rebuild/shared/base-card-v3"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip as RebuildTooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type SectionKey =
  | "trips"
  | "finance"
  | "documents"
  | "clients"
  | "itineraries"
  | "leads"
  | "templates"
  | "quotes"
  | "team"
  | "reports"
  | "credits"
  | "catalog"
  | "operations"
  | "expansions"

type PeriodKey = "today" | "7d" | "30d" | "90d" | "month" | "quarter" | "year"

type ChartSection = {
  key: SectionKey
  label: string
  subtitle: string
  metric: string
  trend: string
  valueLabel: string
  valueKind: "count" | "currency" | "credits"
  data: Array<{ label: string; value: number }>
}

const chartSections: ChartSection[] = [
  { key: "trips", label: "Viagens", subtitle: "Volume da carteira e ritmo de embarques nas ultimas semanas.", metric: "18 jornadas", trend: "+12%", valueLabel: "Viagens", valueKind: "count", data: [{ label: "Sem 1", value: 6 }, { label: "Sem 2", value: 8 }, { label: "Sem 3", value: 12 }, { label: "Sem 4", value: 10 }, { label: "Sem 5", value: 15 }, { label: "Sem 6", value: 18 }] },
  { key: "finance", label: "Financeiro", subtitle: "Leitura curta de caixa, entrada liquida e pressao de vencimentos.", metric: "R$ 128 mil", trend: "+8%", valueLabel: "Valor", valueKind: "currency", data: [{ label: "Sem 1", value: 42 }, { label: "Sem 2", value: 48 }, { label: "Sem 3", value: 46 }, { label: "Sem 4", value: 55 }, { label: "Sem 5", value: 61 }, { label: "Sem 6", value: 68 }] },
  { key: "documents", label: "Documentos", subtitle: "Contratos, vouchers e materiais gerados com foco em revisao.", metric: "246 itens", trend: "+5%", valueLabel: "Documentos", valueKind: "count", data: [{ label: "Sem 1", value: 18 }, { label: "Sem 2", value: 24 }, { label: "Sem 3", value: 28 }, { label: "Sem 4", value: 36 }, { label: "Sem 5", value: 39 }, { label: "Sem 6", value: 46 }] },
  { key: "clients", label: "Clientes", subtitle: "Base ativa, novos contatos e relacionamentos reabertos.", metric: "184 ativos", trend: "+3%", valueLabel: "Clientes", valueKind: "count", data: [{ label: "Sem 1", value: 96 }, { label: "Sem 2", value: 102 }, { label: "Sem 3", value: 108 }, { label: "Sem 4", value: 118 }, { label: "Sem 5", value: 126 }, { label: "Sem 6", value: 134 }] },
  { key: "itineraries", label: "Roteiros", subtitle: "Roteiros gerados, compartilhados e atualizados pela operacao.", metric: "38 gerados", trend: "+9%", valueLabel: "Roteiros", valueKind: "count", data: [{ label: "Sem 1", value: 8 }, { label: "Sem 2", value: 11 }, { label: "Sem 3", value: 15 }, { label: "Sem 4", value: 18 }, { label: "Sem 5", value: 25 }, { label: "Sem 6", value: 31 }] },
  { key: "leads", label: "Leads", subtitle: "Entradas recentes, qualificados e janelas de resposta.", metric: "64 entradas", trend: "+16%", valueLabel: "Leads", valueKind: "count", data: [{ label: "Sem 1", value: 12 }, { label: "Sem 2", value: 16 }, { label: "Sem 3", value: 14 }, { label: "Sem 4", value: 20 }, { label: "Sem 5", value: 26 }, { label: "Sem 6", value: 30 }] },
  { key: "templates", label: "Templates", subtitle: "Uso da biblioteca, duplicacoes e bases preferidas pela equipe.", metric: "18 usados", trend: "+6%", valueLabel: "Templates", valueKind: "count", data: [{ label: "Sem 1", value: 4 }, { label: "Sem 2", value: 8 }, { label: "Sem 3", value: 9 }, { label: "Sem 4", value: 11 }, { label: "Sem 5", value: 13 }, { label: "Sem 6", value: 18 }] },
  { key: "quotes", label: "Cotacoes", subtitle: "Propostas emitidas e ritmo de follow-up nas negociacoes.", metric: "27 propostas", trend: "+11%", valueLabel: "Cotacoes", valueKind: "count", data: [{ label: "Sem 1", value: 6 }, { label: "Sem 2", value: 8 }, { label: "Sem 3", value: 10 }, { label: "Sem 4", value: 15 }, { label: "Sem 5", value: 19 }, { label: "Sem 6", value: 27 }] },
  { key: "team", label: "Equipe", subtitle: "Capacidade viva, handoffs e carga operacional por frente.", metric: "6 pessoas", trend: "Estavel", valueLabel: "Equipe", valueKind: "count", data: [{ label: "Sem 1", value: 3 }, { label: "Sem 2", value: 4 }, { label: "Sem 3", value: 4 }, { label: "Sem 4", value: 5 }, { label: "Sem 5", value: 5 }, { label: "Sem 6", value: 6 }] },
  { key: "reports", label: "Relatorios", subtitle: "Snapshots gerados e leituras executivas mais consultadas.", metric: "14 relat.", trend: "+4%", valueLabel: "Relatorios", valueKind: "count", data: [{ label: "Sem 1", value: 3 }, { label: "Sem 2", value: 5 }, { label: "Sem 3", value: 6 }, { label: "Sem 4", value: 9 }, { label: "Sem 5", value: 11 }, { label: "Sem 6", value: 14 }] },
  { key: "credits", label: "Creditos", subtitle: "Saldo disponivel, ritmo de uso e janela segura para operacao.", metric: "2.140 saldo", trend: "68% uso", valueLabel: "Creditos", valueKind: "credits", data: [{ label: "Sem 1", value: 92 }, { label: "Sem 2", value: 86 }, { label: "Sem 3", value: 83 }, { label: "Sem 4", value: 78 }, { label: "Sem 5", value: 74 }, { label: "Sem 6", value: 68 }] },
  { key: "catalog", label: "Catalogo", subtitle: "Pacotes vivos, publicados e em janela de ajuste comercial.", metric: "7 publicados", trend: "+2", valueLabel: "Pacotes", valueKind: "count", data: [{ label: "Sem 1", value: 2 }, { label: "Sem 2", value: 3 }, { label: "Sem 3", value: 4 }, { label: "Sem 4", value: 4 }, { label: "Sem 5", value: 6 }, { label: "Sem 6", value: 7 }] },
  { key: "operations", label: "Central Operacional", subtitle: "Prioridades abertas, tarefas e pontos de atencao na jornada diaria.", metric: "4 sinais", trend: "-1", valueLabel: "Alertas", valueKind: "count", data: [{ label: "Sem 1", value: 8 }, { label: "Sem 2", value: 7 }, { label: "Sem 3", value: 6 }, { label: "Sem 4", value: 5 }, { label: "Sem 5", value: 4 }, { label: "Sem 6", value: 4 }] },
  { key: "expansions", label: "Expansoes", subtitle: "Modulos ativos, interesse da equipe e frentes em preparacao.", metric: "3 ativas", trend: "+1", valueLabel: "Expansoes", valueKind: "count", data: [{ label: "Sem 1", value: 1 }, { label: "Sem 2", value: 1 }, { label: "Sem 3", value: 2 }, { label: "Sem 4", value: 2 }, { label: "Sem 5", value: 3 }, { label: "Sem 6", value: 3 }] },
]

const periodOptions: Array<{ key: PeriodKey; label: string; labels: string[]; multiplier: number }> = [
  { key: "today", label: "Hoje", labels: ["08h", "10h", "12h", "14h", "16h", "18h"], multiplier: 0.42 },
  { key: "7d", label: "7 dias", labels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab"], multiplier: 0.72 },
  { key: "30d", label: "30 dias", labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Sem 6"], multiplier: 1 },
  { key: "90d", label: "90 dias", labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"], multiplier: 1.18 },
  { key: "month", label: "Este mes", labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Sem 6"], multiplier: 0.94 },
  { key: "quarter", label: "Este trimestre", labels: ["Mes 1", "Mes 2", "Mes 3", "Mes 4", "Mes 5", "Mes 6"], multiplier: 1.26 },
  { key: "year", label: "Este ano", labels: ["Jan", "Mar", "Mai", "Jul", "Set", "Nov"], multiplier: 1.6 },
]

function formatChartValue(value: number, kind: ChartSection["valueKind"]) {
  if (kind === "currency") {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(value * 1000)
  }

  if (kind === "credits") {
    return `${new Intl.NumberFormat("pt-BR").format(value)} creditos`
  }

  return new Intl.NumberFormat("pt-BR").format(value)
}

type AgencyOperationalChartProps = {
  onArmDrag?: () => void
}

export function AgencyOperationalChart({ onArmDrag }: AgencyOperationalChartProps) {
  const [activeKey, setActiveKey] = useState<SectionKey>("trips")
  const [periodKey, setPeriodKey] = useState<PeriodKey>("30d")

  const activeSection = useMemo(
    () => chartSections.find((section) => section.key === activeKey) ?? chartSections[0],
    [activeKey],
  )

  const activePeriod = useMemo(
    () => periodOptions.find((period) => period.key === periodKey) ?? periodOptions[2],
    [periodKey],
  )

  const chartData = useMemo(
    () =>
      activeSection.data.map((point, index) => ({
        label: activePeriod.labels[index] ?? point.label,
        value: Math.max(1, Math.round(point.value * activePeriod.multiplier)),
      })),
    [activePeriod, activeSection],
  )

  return (
    <BaseCardV3
      eyebrow="Leitura operacional"
      title={activeSection.label}
      description={`${activeSection.subtitle} Recorte: ${activePeriod.label.toLowerCase()}.`}
      className="min-h-[204px] h-full"
      actions={
        <div className="flex items-center gap-2">
          <Badge
            className="rounded-full border border-primary/18 bg-primary/[0.08] px-2.5 py-1 text-[10px] tracking-[0.18em] text-primary-foreground"
            variant="outline"
          >
            {activeSection.metric}
          </Badge>
          <Badge
            className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] tracking-[0.18em] text-muted-foreground"
            variant="outline"
          >
            {activeSection.trend}
          </Badge>
          <RebuildTooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                data-drag-handle="true"
                onMouseDown={onArmDrag}
                className="cursor-grab active:cursor-grabbing rounded-full border border-white/8 bg-black/20 p-2 text-muted-foreground opacity-70 transition-all hover:border-white/12 hover:bg-white/[0.05]"
                aria-label="Arrastar"
              >
                <GripHorizontal className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Arrastar</TooltipContent>
          </RebuildTooltip>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <Select value={activeKey} onValueChange={(value) => setActiveKey(value as SectionKey)}>
            <SelectTrigger className="h-10 w-full rounded-[18px] border-white/10 bg-white/[0.03]">
              <SelectValue placeholder="Sessoes" />
            </SelectTrigger>
            <SelectContent className="rounded-[20px]">
              {chartSections.map((section) => (
                <SelectItem key={section.key} value={section.key}>
                  {section.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={periodKey} onValueChange={(value) => setPeriodKey(value as PeriodKey)}>
            <SelectTrigger className="h-10 w-full rounded-[18px] border-white/10 bg-white/[0.03]">
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent className="rounded-[20px]">
              {periodOptions.map((period) => (
                <SelectItem key={period.key} value={period.key}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-[22px] border border-white/8 bg-black/14 px-3 py-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-primary/72">Pulso recente</p>
            <p className="text-[11px] text-muted-foreground">{activePeriod.label}</p>
          </div>

          <div className="h-[126px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 4, left: -14, bottom: 0 }}>
                <defs>
                  <linearGradient id="agencyOperationalChartFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(249,115,22,0.55)" />
                    <stop offset="55%" stopColor="rgba(249,115,22,0.18)" />
                    <stop offset="100%" stopColor="rgba(249,115,22,0.02)" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={28}
                  tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
                />
                <Tooltip
                  cursor={{ stroke: "rgba(249,115,22,0.32)", strokeWidth: 1 }}
                  contentStyle={{
                    borderRadius: 18,
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(14,11,12,0.96)",
                    boxShadow: "0 18px 60px rgba(0,0,0,0.28)",
                  }}
                  labelStyle={{ color: "rgba(255,255,255,0.62)", fontSize: 11 }}
                  itemStyle={{ color: "#f6f3f1", fontSize: 12 }}
                  formatter={(value: number) => [
                    formatChartValue(value, activeSection.valueKind),
                    activeSection.valueLabel,
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#f97316"
                  strokeWidth={2}
                  fill="url(#agencyOperationalChartFill)"
                  activeDot={{ r: 4, strokeWidth: 0, fill: "#fdba74" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </BaseCardV3>
  )
}
