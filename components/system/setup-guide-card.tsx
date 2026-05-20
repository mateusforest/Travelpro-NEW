import { DashboardCard } from "@/components/system/dashboard-card"

type SetupGuideCardProps = {
  title: string
  description: string
  steps: string[]
}

export function SetupGuideCard({ title, description, steps }: SetupGuideCardProps) {
  return (
    <DashboardCard title={title} description={description}>
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={`${step}-${index}`} className="flex gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-[11px] font-semibold text-primary">
              {index + 1}
            </span>
            <p className="text-sm leading-6 text-muted-foreground">{step}</p>
          </div>
        ))}
      </div>
    </DashboardCard>
  )
}
