import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type OperationalWorkspaceLayoutProps = {
  children: ReactNode
  sidebar?: ReactNode
  className?: string
}

export function OperationalWorkspaceLayout({
  children,
  sidebar,
  className,
}: OperationalWorkspaceLayoutProps) {
  return (
    <div className={cn("grid gap-6 xl:grid-cols-[minmax(0,1.28fr)_360px]", className)}>
      <div className="min-w-0 space-y-6">{children}</div>
      {sidebar ? <aside className="min-w-0 space-y-6 xl:sticky xl:top-24 xl:self-start">{sidebar}</aside> : null}
    </div>
  )
}
