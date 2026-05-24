"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid } from "lucide-react"
import { TravelProLogo } from "@/components/branding/travelpro-logo"
import { ProfileMenu } from "@/components/system/profile-menu"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { getNavigationByPortal } from "@/lib/services/navigation"
import type { UserProfile } from "@/lib/services/portal-types"
import { cn } from "@/lib/utils"

type AgencyWorkspaceLayoutProps = {
  profile: UserProfile
  children: ReactNode
}

function isActiveRoute(pathname: string, href?: string) {
  if (!href) return false
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AgencyWorkspaceLayout({ profile, children }: AgencyWorkspaceLayoutProps) {
  const pathname = usePathname()
  const [navigationOpen, setNavigationOpen] = useState(false)
  const items = getNavigationByPortal("agency")
  const firstName = profile.name.split(" ")[0] || "Agencia"

  return (
    <div className="min-h-screen overflow-x-clip bg-[#090708] text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.14),transparent_32%),radial-gradient(circle_at_85%_18%,rgba(249,115,22,0.08),transparent_24%),linear-gradient(180deg,rgba(9,7,8,0.96),rgba(9,7,8,1))]" />
        <div className="absolute left-[-8%] top-20 h-[320px] w-[320px] rounded-full bg-orange-500/10 blur-[130px]" />
        <div className="absolute right-[-5%] top-24 h-[280px] w-[280px] rounded-full bg-amber-400/8 blur-[140px]" />
        <div className="absolute bottom-0 left-1/2 h-[360px] w-[540px] -translate-x-1/2 rounded-full bg-primary/6 blur-[150px]" />
      </div>

      <header className="sticky top-0 z-30 border-b border-white/6 bg-[#090708]/72 backdrop-blur-2xl">
        <div className="mx-auto flex w-full max-w-[1680px] px-4 py-3 sm:px-5 lg:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setNavigationOpen(true)}
                aria-label="Abrir modulos do portal"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] border border-white/8 bg-white/[0.04] text-foreground shadow-[0_12px_32px_rgba(0,0,0,0.2)] transition-all duration-300 hover:border-primary/20 hover:bg-white/[0.06]"
              >
                <LayoutGrid className="h-4 w-4 text-primary" />
              </button>

              <Link href="/app/dashboard" className="hidden shrink-0 sm:block">
                <TravelProLogo variant="header" priority className="h-[34px] sm:h-[38px]" />
              </Link>
              <Link href="/app/dashboard" className="shrink-0 sm:hidden">
                <TravelProLogo variant="compact" priority className="h-9" />
              </Link>

              <div className="min-w-0">
                <h1 className="truncate text-sm font-semibold text-foreground sm:text-[15px]">Ola, {firstName}.</h1>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="hidden rounded-full border border-white/8 bg-white/[0.035] px-2.5 py-1 text-[11px] text-muted-foreground md:flex md:items-center md:gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.65)]" />
                Online
              </div>
              <ProfileMenu portal="agency" profile={profile} />
            </div>
          </div>
        </div>
      </header>

      <Drawer open={navigationOpen} onOpenChange={setNavigationOpen} direction="left">
        <DrawerContent className="w-[min(320px,calc(100vw-1rem))] border-white/8 bg-[#0d0a0b]/96 shadow-[0_34px_100px_rgba(0,0,0,0.62)] backdrop-blur-3xl">
          <DrawerHeader>
            <DrawerTitle>Modulos</DrawerTitle>
            <DrawerDescription>Navegacao de apoio.</DrawerDescription>
          </DrawerHeader>

          <div className="space-y-2.5 overflow-y-auto px-4 py-4 md:px-5">
            {items.map((item) => {
              const active = isActiveRoute(pathname, item.href) || item.children?.some((child) => isActiveRoute(pathname, child.href))

              return (
                <div key={item.href ?? item.title} className="space-y-1.5">
                  {item.href ? (
                    <Link
                      href={item.href}
                      onClick={() => setNavigationOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-[18px] border px-3 py-2.5 transition-all duration-300",
                        active
                          ? "border-primary/20 bg-primary/[0.12] text-foreground"
                          : "border-white/8 bg-white/[0.03] text-muted-foreground hover:border-white/12 hover:bg-white/[0.05] hover:text-foreground",
                      )}
                    >
                      <div className={cn("rounded-[15px] border p-2", active ? "border-primary/20 bg-primary/10" : "border-white/8 bg-black/15")}>
                        <item.icon className={cn("h-3.5 w-3.5", active ? "text-primary" : "text-muted-foreground")} />
                      </div>
                      <p className="min-w-0 truncate text-sm font-medium text-foreground">{item.title}</p>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3 rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2.5">
                      <div className="rounded-[15px] border border-white/8 bg-black/15 p-2">
                        <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <p className="min-w-0 truncate text-sm font-medium text-foreground">{item.title}</p>
                    </div>
                  )}

                  {active && item.children?.length ? (
                    <div className="ml-4 space-y-1 border-l border-white/8 pl-3">
                      {item.children.map((child) =>
                        child.href ? (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setNavigationOpen(false)}
                            className={cn(
                              "block rounded-[14px] px-2.5 py-1.5 text-[13px] transition-all",
                              isActiveRoute(pathname, child.href)
                                ? "bg-primary/[0.1] text-primary"
                                : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground",
                            )}
                          >
                            <span className="block font-medium">{child.title}</span>
                          </Link>
                        ) : null,
                      )}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </DrawerContent>
      </Drawer>

      <main className="mx-auto w-full max-w-[1680px] px-4 py-5 pb-12 sm:px-5 lg:px-6">{children}</main>
    </div>
  )
}
