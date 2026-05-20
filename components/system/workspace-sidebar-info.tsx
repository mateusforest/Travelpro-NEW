import { DashboardCard } from "@/components/system/dashboard-card"

type SidebarInfoItem = {
  label: string
  value: string
  hint?: string
}

type WorkspaceSidebarInfoProps = {
  title: string
  description: string
  items: SidebarInfoItem[]
}

export function WorkspaceSidebarInfo({ title, description, items }: WorkspaceSidebarInfoProps) {
  return (
    <DashboardCard title={title} description={description}>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={`${item.label}-${index}`} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-primary/70">{item.label}</p>
            <p className="mt-2 text-sm font-medium text-foreground">{item.value}</p>
            {item.hint ? <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.hint}</p> : null}
          </div>
        ))}
      </div>
    </DashboardCard>
  )
}
