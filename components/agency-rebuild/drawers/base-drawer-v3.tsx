"use client"

import type { ReactNode } from "react"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"

type BaseDrawerV3Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  hideHeader?: boolean
  direction?: "left" | "right" | "top" | "bottom"
  children: ReactNode
  footer?: ReactNode
  contentClassName?: string
  bodyClassName?: string
  footerClassName?: string
}

export function BaseDrawerV3({
  open,
  onOpenChange,
  title,
  description,
  hideHeader = false,
  direction = "right",
  children,
  footer,
  contentClassName,
  bodyClassName,
  footerClassName,
}: BaseDrawerV3Props) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction={direction}>
      <DrawerContent
        className={cn(
          "overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(17,13,14,0.97),rgba(10,8,9,0.98))] shadow-[0_48px_160px_rgba(0,0,0,0.62)] backdrop-blur-3xl data-[vaul-drawer-direction=left]:w-[min(360px,calc(100vw-1rem))] data-[vaul-drawer-direction=right]:w-[min(460px,calc(100vw-1rem))]",
          contentClassName,
        )}
      >
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {hideHeader ? (
          <VisuallyHidden.Root>
            <DrawerTitle>{title || "Painel lateral"}</DrawerTitle>
            {description ? <DrawerDescription>{description}</DrawerDescription> : null}
          </VisuallyHidden.Root>
        ) : (
          <DrawerHeader className="border-b border-white/8 px-5 py-5 md:px-6">
            <DrawerTitle className="text-lg font-semibold tracking-tight text-foreground">
              {title}
            </DrawerTitle>
            {description ? (
              <DrawerDescription className="mt-1 text-sm leading-6 text-muted-foreground">
                {description}
              </DrawerDescription>
            ) : null}
          </DrawerHeader>
        )}

        <div className={cn("flex-1 overflow-y-auto px-5 py-5 md:px-6", bodyClassName)}>
          {children}
        </div>

        {footer ? (
          <DrawerFooter className={cn("border-t border-white/8 px-5 py-5 md:px-6", footerClassName)}>
            {footer}
          </DrawerFooter>
        ) : null}
      </DrawerContent>
    </Drawer>
  )
}
