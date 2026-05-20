import { DashboardCard } from "@/components/system/dashboard-card"
import { PrimaryButton } from "@/components/system/primary-button"
import { SecondaryButton } from "@/components/system/secondary-button"

type PlanComparisonProps = {
  plans: Array<{
    name: string
    price: string
    highlight?: boolean
    features: string[]
  }>
}

export function PlanComparison({ plans }: PlanComparisonProps) {
  return (
    <DashboardCard title="Comparação de planos" description="Leitura comercial mais clara para upgrades, limites e benefícios.">
      <div className="grid gap-4 xl:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-[26px] border p-5 ${plan.highlight ? "border-primary/25 bg-primary/[0.08]" : "border-white/10 bg-white/[0.03]"}`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-base font-semibold text-foreground">{plan.name}</p>
              {plan.highlight ? (
                <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-primary">
                  Recomendado
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-2xl font-semibold text-foreground">{plan.price}</p>
            <div className="mt-4 space-y-2">
              {plan.features.map((feature) => (
                <div key={feature} className="rounded-2xl border border-white/8 bg-black/15 px-3 py-2 text-sm text-muted-foreground">
                  {feature}
                </div>
              ))}
            </div>
            <div className="mt-5">
              {plan.highlight ? <PrimaryButton className="w-full">Escolher {plan.name}</PrimaryButton> : <SecondaryButton className="w-full">Ver {plan.name}</SecondaryButton>}
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  )
}
