"use client"

import Link from "next/link"
import { Inbox } from "lucide-react"
import { PrimaryButton } from "@/components/system/primary-button"
import { toast } from "@/components/ui/use-toast"

type EmptyStateProps = {
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}

export function EmptyState({ title, description, actionLabel, actionHref, onAction }: EmptyStateProps) {
  const handleFallbackAction = () =>
    toast({
      title: actionLabel || "Módulo em estruturação",
      description: "Esta ação já foi preparada visualmente e será conectada na próxima etapa do TravelPro.",
    })

  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-black/10 px-6 py-10 text-center">
      <div className="mb-4 rounded-2xl border border-white/10 bg-primary/10 p-3">
        <Inbox className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {actionLabel ? (
        actionHref && !onAction ? (
          <PrimaryButton className="mt-5" asChild>
            <Link href={actionHref}>{actionLabel}</Link>
          </PrimaryButton>
        ) : (
          <PrimaryButton className="mt-5" onClick={onAction ?? handleFallbackAction}>
            {actionLabel}
          </PrimaryButton>
        )
      ) : null}
    </div>
  )
}
