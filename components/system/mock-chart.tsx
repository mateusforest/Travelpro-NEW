"use client"

import { useMemo, useState } from "react"
import { Area, AreaChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import type { ChartBlock } from "@/lib/services/portal-types"
import { DashboardCard } from "@/components/system/dashboard-card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

const financeChartConfig = {
  revenue: { label: "Receitas", color: "var(--color-primary, #f97316)" },
  expenses: { label: "Despesas", color: "#f87171" },
  profit: { label: "Lucro", color: "#34d399" },
}

const singleChartConfig = {
  performance: { label: "Performance", color: "var(--color-primary, #f97316)" },
}

export function MockChart({ title, description, series, filters }: ChartBlock) {
  const [activeFilter, setActiveFilter] = useState(filters?.[0] ?? "30 dias")

  const isFinanceChart = useMemo(() => series.some((item) => typeof item.expenses === "number" || typeof item.profit === "number"), [series])

  return (
    <DashboardCard title={title} description={description}>
      <div className="space-y-5">
        {filters?.length ? (
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  activeFilter === filter ? "border-primary/20 bg-primary/10 text-primary" : "border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground",
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        ) : null}

        {isFinanceChart ? (
          <div className="space-y-4">
            <ChartContainer config={financeChartConfig} className="h-[280px] w-full">
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-profit)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--color-profit)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <Area type="monotone" dataKey="value" name="Receitas" stroke="var(--color-revenue)" fill="url(#revenueFill)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="profit" name="Lucro" stroke="var(--color-profit)" fill="url(#profitFill)" strokeWidth={2.5} />
                <Line type="monotone" dataKey="expenses" name="Despesas" stroke="var(--color-expenses)" strokeWidth={2.5} dot={false} />
              </AreaChart>
            </ChartContainer>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm">
                <p className="text-muted-foreground">Receitas</p>
                <p className="mt-1 font-medium text-foreground">Linha principal do período</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm">
                <p className="text-muted-foreground">Despesas</p>
                <p className="mt-1 font-medium text-foreground">Comparativo direto em tooltip</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm">
                <p className="text-muted-foreground">Lucro</p>
                <p className="mt-1 font-medium text-foreground">Evolução do saldo operacional</p>
              </div>
            </div>
          </div>
        ) : (
          <ChartContainer config={singleChartConfig} className="h-[260px] w-full">
            <LineChart data={series}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
              <Line type="monotone" dataKey="value" name="Performance" stroke="var(--color-performance)" strokeWidth={3} dot={{ fill: "var(--color-performance)", r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ChartContainer>
        )}
      </div>
    </DashboardCard>
  )
}
