import type { MetricItem } from "@/lib/services/portal-types"
import { cn } from "@/lib/utils"

const toneClasses = {
  default: "text-foreground border-white/10 bg-secondary/40",
  success: "text-green-50 border-green-500/20 bg-green-500/10",
  warning: "text-amber-50 border-amber-500/20 bg-amber-500/10",
  danger: "text-red-50 border-red-500/20 bg-red-500/10",
  info: "text-sky-50 border-sky-500/20 bg-sky-500/10",
}

export function MetricCard({ label, value, change, icon: Icon, tone = "default" }: MetricItem) {
  return (
    <div className={cn("rounded-[24px] border p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,0,0,0.14)]", toneClasses[tone])}>
      <div className="mb-2.5 flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
          <p className="text-[1.15rem] font-semibold text-foreground xl:text-[1.32rem]">{value}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-2 shadow-[0_0_16px_rgba(255,122,0,0.04)]">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </div>
      </div>
      {change ? <p className="text-[11px] leading-4.5 text-muted-foreground">{change}</p> : null}
    </div>
  )
}
