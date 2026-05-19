import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type DashboardCardProps = {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function DashboardCard({ title, description, children, className }: DashboardCardProps) {
  return (
    <section
      className={cn(
        "glass-card rounded-[28px] border border-white/8 p-4 shadow-2xl shadow-black/10 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/12 hover:shadow-[0_16px_48px_rgba(0,0,0,0.2)] md:p-[18px]",
        className,
      )}
    >
      <div className="mb-3.5 space-y-1">
        <h2 className="text-[15px] font-semibold text-foreground md:text-base">{title}</h2>
        {description ? <p className="text-xs leading-5 text-muted-foreground md:text-sm md:leading-5">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}
