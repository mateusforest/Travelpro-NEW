"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { getNavigationByPortal, portalTitles } from "@/lib/services/navigation"
import type { PortalKey } from "@/lib/services/portal-types"

export function Breadcrumbs({ portal }: { portal: PortalKey }) {
  const pathname = usePathname()
  const items = getNavigationByPortal(portal)
  const current = items.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
  const homeHref = portal === "master" ? "/master/dashboard" : portal === "agency" ? "/app/dashboard" : "/cliente/dashboard"

  return (
    <nav className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
      <Link href={homeHref} className="transition-colors hover:text-foreground">
        {portalTitles[portal]}
      </Link>
      {current ? (
        <>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground/80">{current.title}</span>
        </>
      ) : null}
    </nav>
  )
}
