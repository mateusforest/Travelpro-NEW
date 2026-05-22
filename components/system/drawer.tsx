"use client"

import { useState, type ReactNode } from "react"
import {
  Drawer as DrawerRoot,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

type AppDrawerProps = {
  trigger: ReactNode
  title: string
  description?: string
  children: ReactNode
}

export function Drawer({ trigger, title, description, children }: AppDrawerProps) {
  const [open, setOpen] = useState(false)

  return (
    <DrawerRoot direction="right" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild onClick={() => setOpen(true)}>
        {trigger}
      </DrawerTrigger>
      <DrawerContent className="glass-card border-white/10 bg-card text-foreground">
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          {description ? <DrawerDescription>{description}</DrawerDescription> : null}
        </DrawerHeader>
        <div className="overflow-y-auto px-5 py-5 md:px-6">{children}</div>
      </DrawerContent>
    </DrawerRoot>
  )
}
