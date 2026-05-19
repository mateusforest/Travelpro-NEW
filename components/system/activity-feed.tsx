import Link from "next/link"
import type { FeedBlock } from "@/lib/services/portal-types"
import { DashboardCard } from "@/components/system/dashboard-card"
import { cn } from "@/lib/utils"

const dotTone = {
  default: "bg-white/20",
  success: "bg-green-400",
  warning: "bg-amber-400",
  danger: "bg-red-400",
  info: "bg-sky-400",
}

export function ActivityFeed({ title, description, items }: FeedBlock) {
  return (
    <DashboardCard title={title} description={description}>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={`${item.title}-${index}`} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={cn("mt-1 h-2.5 w-2.5 rounded-full", dotTone[item.tone ?? "default"])} />
              {index < items.length - 1 ? <span className="mt-2 h-full w-px bg-white/10" /> : null}
            </div>
            <div className="pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-medium text-foreground">{item.title}</h3>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              {item.href ? (
                <Link href={item.href} className="mt-3 inline-flex text-xs font-medium text-primary transition-colors hover:text-primary/80">
                  Abrir origem
                </Link>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  )
}
