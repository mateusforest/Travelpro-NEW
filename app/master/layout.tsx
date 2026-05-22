import type { ReactNode } from "react"
import { PortalLayout } from "@/components/system/portal-layout"
import { TravelProAtlasAssistant } from "@/components/system/agency-atlas-assistant"

export default function MasterLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PortalLayout portal="master">{children}</PortalLayout>
      <TravelProAtlasAssistant portal="master" />
    </>
  )
}
