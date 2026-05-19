"use client"

import type { ReactNode } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

type ModalProps = {
  trigger: ReactNode
  title: string
  description?: string
  children: ReactNode
}

export function Modal({ trigger, title, description, children }: ModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="glass-card max-w-3xl rounded-[32px] border-white/10 bg-card text-foreground">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <div className="px-1 pb-1">{children}</div>
      </DialogContent>
    </Dialog>
  )
}
