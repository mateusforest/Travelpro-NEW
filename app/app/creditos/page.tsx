import { PortalPage } from "@/components/system/portal-page"
import { agencyStandalonePages } from "@/lib/services/agency-extra-pages"

export default function CreditosPage() {
  return <PortalPage config={agencyStandalonePages.creditos} />
}
