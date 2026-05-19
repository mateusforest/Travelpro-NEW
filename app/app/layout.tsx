import type { ReactNode } from "react"
import { PortalLayout } from "@/components/system/portal-layout"
import { AgencyAtlasAssistant } from "@/components/system/agency-atlas-assistant"

export default function AgencyLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PortalLayout portal="agency">{children}</PortalLayout>
      <AgencyAtlasAssistant />
    </>
  )
}
