import { notFound } from "next/navigation"
import { agencyPages } from "@/lib/services/portal-pages"
import { PortalPage } from "@/components/system/portal-page"
import {
  AgencyAgentPage,
  AgencyAtlasAdvisorPage,
  AgencyAutomationsPage,
  AgencyClientsPage,
  AgencyCreditsPage,
  AgencyDashboardPage,
  AgencyDocumentsPage,
  AgencyFinancePage,
  AgencyInsightsPage,
  AgencyLeadsPage,
  AgencyMarketingPage,
  AgencyOperationalOverviewPage,
  AgencyTeamPage,
  AgencyTravelProGoPage,
  AgencyTripsPage,
} from "@/components/agency/agency-pages"

export function generateStaticParams() {
  return Object.keys(agencyPages).map((section) => ({ section }))
}

export default async function AgencySectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params
  const config = agencyPages[section]

  if (!config) notFound()

  if (section === "dashboard") return <AgencyDashboardPage />
  if (section === "clientes") return <AgencyClientsPage />
  if (section === "leads") return <AgencyLeadsPage />
  if (section === "viagens") return <AgencyTripsPage />
  if (section === "documentos") return <AgencyDocumentsPage />
  if (section === "travelpro-go") return <AgencyTravelProGoPage />
  if (section === "agent") return <AgencyAgentPage />
  if (section === "central-operacional") return <AgencyOperationalOverviewPage />
  if (section === "insights") return <AgencyInsightsPage />
  if (section === "marketing") return <AgencyMarketingPage />
  if (section === "financeiro") return <AgencyFinancePage />
  if (section === "creditos") return <AgencyCreditsPage />
  if (section === "equipe") return <AgencyTeamPage />
  if (section === "atlas-advisor") return <AgencyAtlasAdvisorPage />
  if (section === "automacoes") return <AgencyAutomationsPage />

  return <PortalPage config={config} />
}
