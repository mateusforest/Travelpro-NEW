import type { ReactNode } from "react"

type SectionHeaderProps = {
  title: string
  description?: string
  actions?: ReactNode
}

export function SectionHeader({ title, description, actions }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-2.5 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-1">
        <h1 className="text-[1.45rem] font-semibold tracking-tight text-foreground md:text-[1.7rem]">{title}</h1>
        {description ? <p className="max-w-3xl text-[13px] leading-5 text-muted-foreground md:text-sm">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  )
}
