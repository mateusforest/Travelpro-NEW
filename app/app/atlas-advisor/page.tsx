import { PortalPage } from "@/components/system/portal-page"
import { agencyStandalonePages } from "@/lib/services/agency-extra-pages"

export default function AtlasAdvisorPage() {
  return <PortalPage config={agencyStandalonePages["atlas-advisor"]} />
}
