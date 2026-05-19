"use client"

import Link from "next/link"
import { ChevronDown, Menu } from "lucide-react"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { TravelProLogo } from "@/components/branding/travelpro-logo"
import type { NavItem, PortalKey } from "@/lib/services/portal-types"
import { getNavigationByPortal } from "@/lib/services/navigation"
import { Drawer } from "@/components/system/drawer"
import { cn } from "@/lib/utils"

type MobileNavProps = {
  portal: PortalKey
  title: string
}

function hasActiveChild(item: NavItem, pathname: string) {
  return item.children?.some((child) => (child.href ? pathname === child.href || pathname.startsWith(`${child.href}/`) : false)) ?? false
}

export function MobileNav({ portal, title }: MobileNavProps) {
  const items = getNavigationByPortal(portal)
  const pathname = usePathname()
  const defaultExpanded = useMemo(
    () =>
      items.reduce<Record<string, boolean>>((acc, item) => {
        if (item.children?.length) acc[item.title] = item.defaultExpanded ?? hasActiveChild(item, pathname)
        return acc
      }, {}),
    [items, pathname],
  )
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(defaultExpanded)

  useEffect(() => {
    setExpandedGroups((current) => ({ ...defaultExpanded, ...current }))
  }, [defaultExpanded])

  return (
    <div className="lg:hidden">
      <Drawer
        title={title}
        description="Navegação principal do portal."
        trigger={
          <button className="rounded-full border border-white/10 bg-white/[0.03] p-3 text-foreground transition-all hover:border-primary/20 hover:bg-white/[0.06]">
            <Menu className="h-4 w-4" />
          </button>
        }
      >
        <div className="mb-6">
          <TravelProLogo variant="compact" priority />
          <p className="mt-2 text-sm text-muted-foreground">
            {portal === "master" ? "Painel Master" : portal === "agency" ? "Painel da agência" : "Portal do cliente"}
          </p>
        </div>
        <div className="space-y-2">
          {items.map((item) => {
            const isActive = item.href ? pathname === item.href || pathname.startsWith(`${item.href}/`) : false
            const isGroupActive = hasActiveChild(item, pathname)
            const hasChildren = Boolean(item.children?.length)
            const isExpanded = expandedGroups[item.title] ?? isGroupActive

            if (hasChildren) {
              return (
                <div key={item.title} className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setExpandedGroups((current) => ({ ...current, [item.title]: !isExpanded }))}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-colors",
                      isGroupActive || isActive
                        ? "border-primary/20 bg-primary/10 text-foreground"
                        : "border-white/8 bg-white/[0.03] text-foreground hover:border-white/15 hover:bg-white/[0.05]",
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", isGroupActive || isActive ? "text-primary" : "text-muted-foreground")} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{item.title}</p>
                      {item.description ? <p className="truncate text-xs text-muted-foreground">{item.description}</p> : null}
                    </div>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isExpanded ? "rotate-180" : "")} />
                  </button>
                  {isExpanded ? (
                    <div className="ml-4 space-y-2 border-l border-white/8 pl-3">
                      {item.children?.map((child) => {
                        const childActive = child.href ? pathname === child.href || pathname.startsWith(`${child.href}/`) : false

                        return child.href ? (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-colors",
                              childActive
                                ? "border-primary/20 bg-primary/10 text-foreground"
                                : "border-white/8 bg-white/[0.03] text-foreground hover:border-white/15 hover:bg-white/[0.05]",
                            )}
                          >
                            <child.icon className={cn("h-4 w-4", childActive ? "text-primary" : "text-muted-foreground")} />
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium">{child.title}</p>
                              {child.description ? <p className="truncate text-xs text-muted-foreground">{child.description}</p> : null}
                            </div>
                          </Link>
                        ) : null
                      })}
                    </div>
                  ) : null}
                </div>
              )
            }

            return item.href ? (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-colors",
                  isActive ? "border-primary/20 bg-primary/10 text-foreground" : "border-white/8 bg-white/[0.03] text-foreground hover:border-white/15 hover:bg-white/[0.05]",
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.title}</p>
                  {item.description ? <p className="truncate text-xs text-muted-foreground">{item.description}</p> : null}
                </div>
              </Link>
            ) : null
          })}
        </div>
      </Drawer>
    </div>
  )
}
