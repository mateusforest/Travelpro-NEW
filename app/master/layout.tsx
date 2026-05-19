import type { ReactNode } from "react"
import { PortalLayout } from "@/components/system/portal-layout"

export default function MasterLayout({ children }: { children: ReactNode }) {
  return <PortalLayout portal="master">{children}</PortalLayout>
}
