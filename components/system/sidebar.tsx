"use client"

import Link from "next/link"
import { ChevronDown, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { usePathname } from "next/navigation"
import type { Dispatch, SetStateAction } from "react"
import { useEffect, useMemo, useState } from "react"
import { TravelProLogo } from "@/components/branding/travelpro-logo"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { getNavigationByPortal } from "@/lib/services/navigation"
import type { NavItem, PortalKey } from "@/lib/services/portal-types"

type SidebarProps = {
  portal: PortalKey
  title: string
}

function hasActiveChild(item: NavItem, pathname: string) {
  return item.children?.some((child) => (child.href ? pathname === child.href || pathname.startsWith(`${child.href}/`) : false)) ?? false
}

function SidebarItem({
  item,
  pathname,
  expandedGroups,
  setExpandedGroups,
  collapsed,
  depth = 0,
}: {
  item: NavItem
  pathname: string
  expandedGroups: Record<string, boolean>
  setExpandedGroups: Dispatch<SetStateAction<Record<string, boolean>>>
  collapsed: boolean
  depth?: number
}) {
  const isDirectActive = item.href ? pathname === item.href || pathname.startsWith(`${item.href}/`) : false
  const isGroupActive = hasActiveChild(item, pathname)
  const isActive = isDirectActive || isGroupActive
  const hasChildren = Boolean(item.children?.length)
  const isExpanded = hasChildren ? expandedGroups[item.title] ?? isGroupActive : false
  const paddingClass = depth > 0 && !collapsed ? "pl-2.5" : ""

  const content = (
    <>
      <div
        className={cn(
          "rounded-xl border p-1.5 transition-colors",
          isActive ? "border-primary/18 bg-primary/10 text-primary" : "border-white/8 bg-white/[0.025] text-muted-foreground group-hover:text-primary",
        )}
      >
        <item.icon className="h-3.5 w-3.5" />
      </div>
      {!collapsed ? (
        <>
          <div className="min-w-0 flex-1">
            <span className="block truncate text-[12px] font-medium">{item.title}</span>
            {item.description ? <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">{item.description}</span> : null}
          </div>
          {hasChildren ? <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", isExpanded ? "rotate-180" : "rotate-0")} /> : null}
          {!hasChildren && item.badge ? (
            <span className="ml-auto rounded-full border border-primary/15 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              {item.badge}
            </span>
          ) : null}
        </>
      ) : null}
    </>
  )

  if (hasChildren) {
    return (
      <div className="space-y-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => setExpandedGroups((current) => ({ ...current, [item.title]: !isExpanded }))}
              className={cn(
                "group flex w-full items-center gap-1.5 rounded-2xl px-1.5 py-1.5 text-left transition-all duration-200",
                collapsed ? "justify-center" : "",
                isActive
                  ? "border border-primary/15 bg-primary/[0.08] text-foreground"
                  : "border border-transparent text-muted-foreground hover:border-white/8 hover:bg-white/[0.035] hover:text-foreground",
                paddingClass,
              )}
            >
              {content}
            </button>
          </TooltipTrigger>
          {collapsed ? (
            <TooltipContent side="right" sideOffset={10} className="rounded-xl border border-white/10 bg-black/90 px-2.5 py-1 text-[11px] text-foreground shadow-xl shadow-black/40">
              {item.title}
            </TooltipContent>
          ) : null}
        </Tooltip>

        {isExpanded && !collapsed ? (
          <div className="ml-2.5 space-y-0.5 border-l border-white/7 pl-2">
            {item.children?.map((child) => (
              <SidebarItem
                key={child.href ?? child.title}
                item={child}
                pathname={pathname}
                expandedGroups={expandedGroups}
                setExpandedGroups={setExpandedGroups}
                collapsed={collapsed}
                depth={depth + 1}
              />
            ))}
          </div>
        ) : null}
      </div>
    )
  }

  if (!item.href) return null

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={item.href}
          className={cn(
            "group flex items-center gap-1.5 rounded-2xl px-1.5 py-1.5 transition-all duration-200",
            collapsed ? "justify-center" : "",
            isActive
              ? "border border-primary/15 bg-primary/[0.08] text-foreground"
              : "border border-transparent text-muted-foreground hover:border-white/8 hover:bg-white/[0.035] hover:text-foreground",
            paddingClass,
          )}
        >
          {content}
        </Link>
      </TooltipTrigger>
      {collapsed ? (
        <TooltipContent side="right" sideOffset={10} className="rounded-xl border border-white/10 bg-black/90 px-2.5 py-1 text-[11px] text-foreground shadow-xl shadow-black/40">
          {item.title}
        </TooltipContent>
      ) : null}
    </Tooltip>
  )
}

export function Sidebar({ portal }: SidebarProps) {
  const pathname = usePathname()
  const items = getNavigationByPortal(portal)
  const storageKey = `travelpro:sidebar-collapsed:${portal}`
  const defaultExpanded = useMemo(
    () =>
      items.reduce<Record<string, boolean>>((acc, item) => {
        if (item.children?.length) {
          acc[item.title] = hasActiveChild(item, pathname)
        }
        return acc
      }, {}),
    [items, pathname],
  )
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(defaultExpanded)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    setExpandedGroups((current) => ({ ...defaultExpanded, ...current }))
  }, [defaultExpanded])

  useEffect(() => {
    const savedState = window.localStorage.getItem(storageKey)
    if (savedState === "true") setCollapsed(true)
  }, [storageKey])

  useEffect(() => {
    window.localStorage.setItem(storageKey, String(collapsed))
  }, [collapsed, storageKey])

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r border-white/7 bg-[linear-gradient(180deg,rgba(15,15,18,0.97),rgba(10,10,12,0.94))] px-2.5 py-2.5 shadow-[inset_-1px_0_0_rgba(255,255,255,0.04),16px_0_36px_rgba(0,0,0,0.14)] transition-[width,padding] duration-300 lg:flex",
        collapsed ? "w-[78px]" : "w-[212px]",
      )}
    >
      <div className={cn("mb-2.5 flex items-center", collapsed ? "justify-center" : "justify-between gap-1.5")}>
        <Link href={portal === "master" ? "/master/dashboard" : portal === "agency" ? "/app/dashboard" : "/cliente/dashboard"} className="flex min-w-fit items-center">
          <TravelProLogo variant={collapsed ? "compact" : "sidebar"} priority />
        </Link>
        {!collapsed ? (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="rounded-full border border-white/10 bg-white/[0.025] p-1.5 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Recolher menu"
          >
            <PanelLeftClose className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      {collapsed ? (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="mb-1.5 flex justify-center rounded-2xl border border-white/10 bg-white/[0.025] p-1.5 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Expandir menu"
        >
          <PanelLeftOpen className="h-3.5 w-3.5" />
        </button>
      ) : (
        <div className="mb-1.5 h-px bg-gradient-to-r from-white/0 via-white/8 to-primary/18" />
      )}

      <nav className="space-y-0.5">
        {items.map((item) => (
          <SidebarItem
            key={item.href ?? item.title}
            item={item}
            pathname={pathname}
            expandedGroups={expandedGroups}
            setExpandedGroups={setExpandedGroups}
            collapsed={collapsed}
          />
        ))}
      </nav>
    </aside>
  )
}
