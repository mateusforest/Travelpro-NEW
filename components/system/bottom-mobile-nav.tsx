"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { getNavigationByPortal } from "@/lib/services/navigation"
import type { PortalKey } from "@/lib/services/portal-types"
import { cn } from "@/lib/utils"

export function BottomMobileNav({ portal }: { portal: PortalKey }) {
  const pathname = usePathname()
  const items = getNavigationByPortal(portal).slice(0, 4)

  return (
    <div className="fixed inset-x-3 bottom-3 z-40 lg:hidden">
      <div className="grid grid-cols-4 gap-2 rounded-[28px] border border-white/10 bg-black/75 p-2 shadow-2xl shadow-black/40 backdrop-blur-2xl">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-[20px] px-2 py-2 text-[11px] transition-all",
                isActive ? "bg-primary/12 text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="truncate">{item.title}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
