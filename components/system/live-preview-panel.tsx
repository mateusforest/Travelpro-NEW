import type { ReactNode } from "react"
import { DashboardCard } from "@/components/system/dashboard-card"

type LivePreviewPanelProps = {
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
}

export function LivePreviewPanel({ title, description, children, footer }: LivePreviewPanelProps) {
  return (
    <DashboardCard title={title} description={description}>
      <div className="rounded-[26px] border border-white/8 bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent p-4">
        {children}
      </div>
      {footer ? <div className="mt-4">{footer}</div> : null}
    </DashboardCard>
  )
}
