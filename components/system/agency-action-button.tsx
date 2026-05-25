"use client"

import { useRouter } from "next/navigation"
import { useState, type ReactNode } from "react"
import type { VariantProps } from "class-variance-authority"
import type { LucideIcon } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

type CommonProps = {
  label: ReactNode
  icon?: LucideIcon
  className?: string
  variant?: VariantProps<typeof buttonVariants>["variant"]
  size?: VariantProps<typeof buttonVariants>["size"]
  loadingLabel?: ReactNode
  disabled?: boolean
}

type NavigateAction = CommonProps & {
  actionType: "navigate"
  href: string
  openInNewTab?: boolean
}

type InteractiveAction = CommonProps & {
  actionType: "modal" | "api"
  onClick: () => void | Promise<void>
}

type FutureAction = CommonProps & {
  actionType: "future"
  futureMessage: string
}

type DisabledAction = CommonProps & {
  actionType: "disabled"
  disabledReason: string
}

export type AgencyActionButtonProps = NavigateAction | InteractiveAction | FutureAction | DisabledAction

export function AgencyActionButton(props: AgencyActionButtonProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  const handleClick = async () => {
    if (isPending || props.disabled) return

    if (props.actionType === "disabled") {
      toast({
        title: "Acao indisponivel",
        description: props.disabledReason,
      })
      return
    }

    if (props.actionType === "future") {
      toast({
        title: "Em breve",
        description: props.futureMessage,
      })
      return
    }

    if (props.actionType === "navigate") {
      if (props.openInNewTab) {
        window.open(props.href, "_blank", "noopener,noreferrer")
        return
      }

      router.push(props.href)
      return
    }

    try {
      setIsPending(true)
      await props.onClick()
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[AgencyActionButton] action failed", error)
      }
      toast({
        title: "Nao foi possivel concluir a acao",
        description: error instanceof Error ? error.message : "Tente novamente em instantes.",
      })
    } finally {
      setIsPending(false)
    }
  }

  const Icon = props.icon
  const isVisuallyDisabled = props.actionType === "disabled"

  return (
    <Button
      type="button"
      variant={props.variant}
      size={props.size}
      className={props.className}
      onClick={() => void handleClick()}
      disabled={props.disabled || isPending}
      aria-disabled={isVisuallyDisabled || props.disabled}
      title={props.actionType === "disabled" ? props.disabledReason : undefined}
      data-action-type={props.actionType}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {isPending ? props.loadingLabel ?? "Carregando..." : props.label}
    </Button>
  )
}
