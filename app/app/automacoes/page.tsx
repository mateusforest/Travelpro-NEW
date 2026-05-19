import { PortalPage } from "@/components/system/portal-page"
import { agencyStandalonePages } from "@/lib/services/agency-extra-pages"

export default function AutomacoesPage() {
  return <PortalPage config={agencyStandalonePages.automacoes} />
}
