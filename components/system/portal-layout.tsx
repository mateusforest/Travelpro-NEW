import type { ReactNode } from "react"
import type { PortalKey } from "@/lib/services/portal-types"
import { portalProfiles, portalTitles } from "@/lib/services/navigation"
import { Sidebar } from "@/components/system/sidebar"
import { PortalHeader } from "@/components/system/portal-header"
import { BottomMobileNav } from "@/components/system/bottom-mobile-nav"

type PortalLayoutProps = {
  portal: PortalKey
  children: ReactNode
}

export function PortalLayout({ portal, children }: PortalLayoutProps) {
  const profile = portalProfiles[portal]
  const title = portalTitles[portal]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-primary/5 blur-[140px]" />
      </div>
      <div className="flex min-h-screen">
        <Sidebar portal={portal} title={title} />
        <div className="flex min-w-0 flex-1 flex-col">
          <PortalHeader portal={portal} title={title} profile={profile} />
          <main className="flex-1 px-3.5 py-[18px] pb-24 md:px-4 md:py-5 lg:pb-8">{children}</main>
        </div>
      </div>
      <BottomMobileNav portal={portal} />
    </div>
  )
}
