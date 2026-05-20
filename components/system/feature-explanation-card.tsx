import { DashboardCard } from "@/components/system/dashboard-card"

type FeatureExplanationCardProps = {
  title: string
  description: string
  items: Array<{ title: string; body: string }>
}

export function FeatureExplanationCard({ title, description, items }: FeatureExplanationCardProps) {
  return (
    <DashboardCard title={title} description={description}>
      <div className="grid gap-3">
        {items.map((item) => (
          <div key={item.title} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
            <p className="text-sm font-medium text-foreground">{item.title}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.body}</p>
          </div>
        ))}
      </div>
    </DashboardCard>
  )
}
