import type { ReactNode } from "react"
import { PortalLayout } from "@/components/system/portal-layout"

export default function ClientLayout({ children }: { children: ReactNode }) {
  return <PortalLayout portal="client">{children}</PortalLayout>
}
