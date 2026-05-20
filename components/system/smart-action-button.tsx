"use client"

import { Sparkles } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { PrimaryButton } from "@/components/system/primary-button"
import { SecondaryButton } from "@/components/system/secondary-button"

type SmartActionButtonProps = {
  label: string
  description?: string
  tone?: "primary" | "secondary"
}

export function SmartActionButton({
  label,
  description = "Assistente IA será conectado aqui na próxima fase do fluxo.",
  tone = "secondary",
}: SmartActionButtonProps) {
  const ButtonComponent = tone === "primary" ? PrimaryButton : SecondaryButton

  return (
    <ButtonComponent
      onClick={() =>
        toast({
          title: label,
          description,
        })
      }
    >
      <Sparkles className="h-4 w-4" />
      {label}
      <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-primary">
        Em breve
      </span>
    </ButtonComponent>
  )
}
