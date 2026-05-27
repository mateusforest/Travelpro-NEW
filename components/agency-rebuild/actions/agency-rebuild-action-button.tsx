"use client"

import { useRouter } from "next/navigation"
import { useState, type ReactNode } from "react"
import type { VariantProps } from "class-variance-authority"
import { Button, buttonVariants } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

type BaseProps = {
  label: ReactNode
  icon?: ReactNode
  className?: string
  variant?: VariantProps<typeof buttonVariants>["variant"]
  size?: VariantProps<typeof buttonVariants>["size"]
  loadingLabel?: ReactNode
  disabled?: boolean
  successMessage?: string
  errorMessage?: string
  tooltip?: string
}

type NavigateAction = BaseProps & {
  actionType: "navigate"
  href: string
  openInNewTab?: boolean
}

type ModalAction = BaseProps & {
  actionType: "modal"
  onAction: () => void | Promise<void>
}

type ApiAction = BaseProps & {
  actionType: "api"
  onAction: () => void | Promise<void>
}

type FutureAction = BaseProps & {
  actionType: "future"
  futureMessage: string
}

type DisabledAction = BaseProps & {
  actionType: "disabled"
  disabledReason: string
}

export type AgencyRebuildActionButtonProps =
  | NavigateAction
  | ModalAction
  | ApiAction
  | FutureAction
  | DisabledAction

export function AgencyRebuildActionButton(props: AgencyRebuildActionButtonProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  const handleClick = async () => {
    if (props.disabled || isPending) return

    if (props.actionType === "disabled") {
      toast({
        title: "Acao indisponivel",
        description: props.disabledReason,
      })
      return
    }

    if (props.actionType === "future") {
      toast({
        title: "Em preparacao",
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
      await props.onAction()

      if (props.successMessage) {
        toast({
          title: "Acao concluida",
          description: props.successMessage,
        })
      }
    } catch (error) {
      toast({
        title: "Nao foi possivel concluir a acao",
        description:
          props.errorMessage ??
          (error instanceof Error ? error.message : "Tente novamente em instantes."),
      })
    } finally {
      setIsPending(false)
    }
  }

  const visualDisabled = props.actionType === "disabled"

  return (
    <Button
      type="button"
      variant={props.variant}
      size={props.size}
      className={props.className}
      onClick={() => void handleClick()}
      disabled={props.disabled || isPending}
      aria-disabled={visualDisabled || props.disabled}
      title={
        props.tooltip ??
        (props.actionType === "disabled"
          ? props.disabledReason
          : props.actionType === "future"
            ? props.futureMessage
            : undefined)
      }
      data-rebuild-action-type={props.actionType}
    >
      {props.icon}
      {isPending ? props.loadingLabel ?? "Carregando..." : props.label}
    </Button>
  )
}
