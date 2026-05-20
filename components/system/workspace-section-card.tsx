import type { ReactNode } from "react"
import { DashboardCard } from "@/components/system/dashboard-card"

type WorkspaceSectionCardProps = {
  title: string
  description: string
  children: ReactNode
}

export function WorkspaceSectionCard({ title, description, children }: WorkspaceSectionCardProps) {
  return (
    <DashboardCard title={title} description={description}>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </DashboardCard>
  )
}
