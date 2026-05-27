import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type BaseCardV3Props = {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
  footer?: ReactNode
  children?: ReactNode
  className?: string
  bodyClassName?: string
  footerClassName?: string
}

export function BaseCardV3({
  eyebrow,
  title,
  description,
  actions,
  footer,
  children,
  className,
  bodyClassName,
  footerClassName,
}: BaseCardV3Props) {
  return (
    <section
      className={cn(
        "group relative overflow-hidden rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.018))] p-3.5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-2xl transition-all duration-200 hover:border-white/10 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.024))]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent opacity-70" />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {eyebrow ? (
            <p className="text-[10px] uppercase tracking-[0.22em] text-primary/72">{eyebrow}</p>
          ) : null}
          <h3 className="mt-1 text-[15px] font-semibold tracking-tight text-foreground">{title}</h3>
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-1.5">{actions}</div> : null}
      </div>

      {description ? (
        <p className="mt-1 w-full min-w-0 text-[12px] leading-[1.15rem] text-muted-foreground [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
          {description}
        </p>
      ) : null}

      {children ? <div className={cn("mt-2.5", bodyClassName)}>{children}</div> : null}
      {footer ? (
        <div className={cn("mt-3 flex flex-wrap gap-2", footerClassName)}>{footer}</div>
      ) : null}
    </section>
  )
}
