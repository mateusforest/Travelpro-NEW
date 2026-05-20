import { DashboardCard } from "@/components/system/dashboard-card"

type SetupStatusCardProps = {
  title: string
  description: string
  badges: string[]
}

export function SetupStatusCard({ title, description, badges }: SetupStatusCardProps) {
  return (
    <DashboardCard title={title} description={description}>
      <div className="flex flex-wrap gap-2">
        {badges.map((badge) => (
          <span key={badge} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-muted-foreground">
            {badge}
          </span>
        ))}
      </div>
    </DashboardCard>
  )
}
