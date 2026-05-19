import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type PageShellProps = {
  children: ReactNode
  className?: string
}

export function PageShell({ children, className }: PageShellProps) {
  return (
    <div className={cn("space-y-4 md:space-y-5", className)}>
      {children}
    </div>
  )
}
