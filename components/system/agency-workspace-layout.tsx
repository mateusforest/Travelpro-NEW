"use client"

import type { ReactNode } from "react"
import { useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowUpRight, LayoutGrid, Sparkles } from "lucide-react"
import { TravelProLogo } from "@/components/branding/travelpro-logo"
import { ProfileMenu } from "@/components/system/profile-menu"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
  const currentItem = useMemo(() => {
    const directMatch = items.find((item) => isActiveRoute(pathname, item.href))
    if (directMatch) return directMatch

    for (const item of items) {
      const activeChild = item.children?.find((child) => isActiveRoute(pathname, child.href))
      if (activeChild) return activeChild
    }

    return items[0]
  }, [items, pathname])

  const firstName = profile.name.split(" ")[0] || "Agência"

  return (
    <div className="min-h-screen overflow-x-clip bg-[#090708] text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.14),transparent_32%),radial-gradient(circle_at_85%_18%,rgba(249,115,22,0.08),transparent_24%),linear-gradient(180deg,rgba(9,7,8,0.96),rgba(9,7,8,1))]" />
        <div className="absolute left-[-8%] top-20 h-[320px] w-[320px] rounded-full bg-orange-500/10 blur-[130px]" />
        <div className="absolute right-[-5%] top-24 h-[280px] w-[280px] rounded-full bg-amber-400/8 blur-[140px]" />
        <div className="absolute bottom-0 left-1/2 h-[360px] w-[540px] -translate-x-1/2 rounded-full bg-primary/6 blur-[150px]" />
      </div>

      <header className="sticky top-0 z-30 border-b border-white/6 bg-[#090708]/72 backdrop-blur-2xl">
        <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-3 px-4 py-3 sm:px-5 lg:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setNavigationOpen(true)}
                aria-label="Abrir modulos do portal"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.045] text-foreground shadow-[0_14px_40px_rgba(0,0,0,0.22)] transition-all hover:border-primary/25 hover:bg-white/[0.07]"
              >
                <LayoutGrid className="h-4.5 w-4.5 text-primary" />
              </button>

              <Link href="/app/dashboard" className="hidden shrink-0 sm:block">
                <TravelProLogo variant="header" priority className="h-[34px] sm:h-[38px]" />
              </Link>
              <Link href="/app/dashboard" className="shrink-0 sm:hidden">
                <TravelProLogo variant="compact" priority className="h-9" />
              </Link>

              <div className="min-w-0">
                <p className="truncate text-xs uppercase tracking-[0.24em] text-primary/65">Ecossistema TravelPro</p>
                <h1 className="truncate text-sm font-semibold text-foreground sm:text-base">
                  Olá, {firstName}. Sua operação está ativa hoje.
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-muted-foreground md:flex md:items-center md:gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.65)]" />
                Workspace operacional online
              </div>
              <ProfileMenu portal="agency" profile={profile} />
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-[26px] border border-white/7 bg-white/[0.03] px-4 py-3 shadow-[0_14px_48px_rgba(0,0,0,0.2)] sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.22em] text-primary/70">Workspace vivo</p>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {currentItem?.description || "Abra módulos, acompanhe sinais reais e mova a operação sem peso visual."}
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-black/20 px-3 py-1.5 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Organize sua operação como preferir. Arraste e personalize seus cards.
            </div>
          </div>
        </div>
      </header>

      <Dialog open={navigationOpen} onOpenChange={setNavigationOpen}>
        <DialogContent className="max-w-[980px] border-white/10 bg-[#0d0a0b]/96 p-0 shadow-[0_40px_120px_rgba(0,0,0,0.65)] backdrop-blur-3xl">
          <div className="grid gap-0 lg:grid-cols-[300px_minmax(0,1fr)]">
            <div className="border-b border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-6 lg:border-b-0 lg:border-r">
              <DialogHeader className="text-left">
                <DialogTitle>Central de módulos</DialogTitle>
                <DialogDescription>
                  Abra áreas operacionais sem manter a navegação ocupando a tela o tempo todo.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6 space-y-2">
                {items.map((item) => {
                  const active = isActiveRoute(pathname, item.href) || item.children?.some((child) => isActiveRoute(pathname, child.href))
                  const itemClasses = cn(
                    "flex w-full items-center gap-3 rounded-[22px] border px-4 py-3 text-left transition-all",
                    active
                      ? "border-primary/20 bg-primary/[0.12] text-foreground"
                      : "border-white/8 bg-white/[0.03] text-muted-foreground hover:border-white/12 hover:bg-white/[0.05] hover:text-foreground",
                  )

                  const itemContent = (
                    <>
                      <div className={cn("rounded-2xl border p-2.5", active ? "border-primary/20 bg-primary/10" : "border-white/8 bg-black/15")}>
                        <item.icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</p>
                      </div>
                    </>
                  )

                  return item.href ? (
                    <Link key={item.href} href={item.href} onClick={() => setNavigationOpen(false)} className={itemClasses}>
                      {itemContent}
                    </Link>
                  ) : (
                    <button key={item.title} type="button" onClick={() => setNavigationOpen(false)} className={itemClasses}>
                      {itemContent}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-2">
                {items.map((item) => (
                  <div key={`workspace-nav-detail-${item.href ?? item.title}`} className="rounded-[26px] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">{item.title}</p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
                      </div>
                      {item.href ? (
                        <Button asChild size="sm" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]">
                          <Link href={item.href} onClick={() => setNavigationOpen(false)}>
                            Abrir
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      ) : null}
                    </div>

                    {item.children?.length ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.children.map((child) =>
                          child.href ? (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setNavigationOpen(false)}
                              className={cn(
                                "rounded-full border px-3 py-1.5 text-xs transition-all",
                                isActiveRoute(pathname, child.href)
                                  ? "border-primary/20 bg-primary/[0.12] text-primary"
                                  : "border-white/8 bg-black/20 text-muted-foreground hover:border-white/12 hover:text-foreground",
                              )}
                            >
                              {child.title}
                            </Link>
                          ) : null,
                        )}
                      </div>
                    ) : (
                      <div className="mt-4 rounded-[22px] border border-dashed border-white/8 bg-black/15 px-4 py-3 text-xs leading-5 text-muted-foreground">
                        Este módulo abre sua visão principal e concentra as ações rápidas da sessão.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <main className="mx-auto w-full max-w-[1680px] px-4 py-5 pb-12 sm:px-5 lg:px-6">{children}</main>
    </div>
  )
}
