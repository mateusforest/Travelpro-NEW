"use client"

import type { ReactNode } from "react"
import { useMemo, useState } from "react"
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
  const currentItem = useMemo(() => {
    const directMatch = items.find((item) => isActiveRoute(pathname, item.href))
    if (directMatch) return directMatch

    for (const item of items) {
      const activeChild = item.children?.find((child) => isActiveRoute(pathname, child.href))
      if (activeChild) return activeChild
    }

    return items[0]
  }, [items, pathname])

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
        <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-2 px-4 py-3 sm:px-5 lg:px-6">
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
                  Ola, {firstName}. Sua operacao esta ativa hoje.
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-muted-foreground md:flex md:items-center md:gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.65)]" />
                Operacao online
              </div>
              <ProfileMenu portal="agency" profile={profile} />
            </div>
          </div>

          <div className="flex min-h-[44px] items-center justify-between gap-3 rounded-[22px] border border-white/7 bg-white/[0.028] px-4 py-2.5 shadow-[0_14px_48px_rgba(0,0,0,0.14)]">
            <p className="min-w-0 truncate text-sm text-muted-foreground">
              {currentItem?.description || "Abra modulos, acompanhe sinais reais e mova a operacao com mais leveza."}
            </p>
            <span className="shrink-0 rounded-full border border-white/8 bg-black/18 px-3 py-1 text-[11px] text-muted-foreground">
              Personalizacao chegando em breve
            </span>
          </div>
        </div>
      </header>

      <Drawer open={navigationOpen} onOpenChange={setNavigationOpen} direction="left">
        <DrawerContent className="w-[min(380px,calc(100vw-0.75rem))] border-white/10 bg-[#0d0a0b]/96 shadow-[0_40px_120px_rgba(0,0,0,0.65)] backdrop-blur-3xl">
          <DrawerHeader>
            <DrawerTitle>Central de modulos</DrawerTitle>
            <DrawerDescription>
              Navegacao de apoio para acessar areas operacionais sem ocupar o workspace o tempo todo.
            </DrawerDescription>
          </DrawerHeader>

          <div className="space-y-4 overflow-y-auto px-5 py-5 md:px-6">
            {items.map((item) => {
              const active = isActiveRoute(pathname, item.href) || item.children?.some((child) => isActiveRoute(pathname, child.href))

              return (
                <div key={item.href ?? item.title} className="space-y-2">
                  {item.href ? (
                    <Link
                      href={item.href}
                      onClick={() => setNavigationOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-[22px] border px-4 py-3 transition-all",
                        active
                          ? "border-primary/20 bg-primary/[0.12] text-foreground"
                          : "border-white/8 bg-white/[0.03] text-muted-foreground hover:border-white/12 hover:bg-white/[0.05] hover:text-foreground",
                      )}
                    >
                      <div className={cn("rounded-2xl border p-2.5", active ? "border-primary/20 bg-primary/10" : "border-white/8 bg-black/15")}>
                        <item.icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</p>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3 rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3">
                      <div className="rounded-2xl border border-white/8 bg-black/15 p-2.5">
                        <item.icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  )}

                  {item.children?.length ? (
                    <div className="ml-5 space-y-1 border-l border-white/8 pl-4">
                      {item.children.map((child) =>
                        child.href ? (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setNavigationOpen(false)}
                            className={cn(
                              "block rounded-[18px] px-3 py-2 text-sm transition-all",
                              isActiveRoute(pathname, child.href)
                                ? "bg-primary/[0.1] text-primary"
                                : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground",
                            )}
                          >
                            <span className="block font-medium">{child.title}</span>
                            {child.description ? <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{child.description}</span> : null}
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
