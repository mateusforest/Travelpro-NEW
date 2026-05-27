"use client"

import type { ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type BaseModalV3Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  contentClassName?: string
  bodyClassName?: string
  footerClassName?: string
}

export function BaseModalV3({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  contentClassName,
  bodyClassName,
  footerClassName,
}: BaseModalV3Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,13,14,0.97),rgba(10,8,9,0.98))] p-0 shadow-[0_48px_160px_rgba(0,0,0,0.62)] backdrop-blur-3xl sm:max-w-4xl",
          contentClassName,
        )}
      >
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <DialogHeader className="border-b border-white/8 px-6 py-5 sm:px-7">
          <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
            {title}
          </DialogTitle>
          {description ? (
            <DialogDescription className="mt-1 max-w-[68ch] text-sm leading-6 text-muted-foreground">
              {description}
            </DialogDescription>
          ) : null}
        </DialogHeader>

        <div className={cn("max-h-[74vh] overflow-y-auto px-6 py-5 sm:px-7", bodyClassName)}>
          {children}
        </div>

        {footer ? (
          <DialogFooter
            className={cn("border-t border-white/8 px-6 py-5 sm:px-7", footerClassName)}
          >
            {footer}
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
