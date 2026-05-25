import { notFound, redirect } from "next/navigation"
import { agencyPages } from "@/lib/services/portal-pages"
import {
  AgencyAgentPage,
  AgencyAtlasAdvisorPage,
  AgencyAutomationsPage,
  AgencyClientsPage,
  AgencyContractsPage,
  AgencyCreditsPage,
  AgencyDashboardPage,
  AgencyDocumentsPage,
  AgencyFinancePage,
  AgencyInsightsPage,
  AgencyLeadsPage,
  AgencyMarketingPage,
  AgencyOperationalOverviewPage,
  AgencyCotacoesPage as AgencyCotacoesAliasPage,
  AgencyReceiptsPage as AgencyRecibosAliasPage,
  AgencyRoteirosPage as AgencyRoteirosAliasPage,
  AgencySettingsPage,
  AgencyTeamPage,
  AgencyTemplatesPage as AgencyTemplatesAliasPage,
  AgencyTicketsPage as AgencyPassagensAliasPage,
  AgencyTravelProGoPage,
  AgencyTripsPage,
  AgencyVouchersPage as AgencyVouchersAliasPage,
} from "@/components/agency/agency-pages"

export function generateStaticParams() {
  return Object.keys(agencyPages).map((section) => ({ section }))
}

export default async function AgencySectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params

  if (section === "dashboard") return <AgencyDashboardPage />
  if (section === "clientes") return <AgencyClientsPage />
  if (section === "leads") return <AgencyLeadsPage />
  if (section === "viagens") return <AgencyTripsPage />
  if (section === "roteiros") return <AgencyRoteirosAliasPage />
  if (section === "documentos") return <AgencyDocumentsPage />
  if (section === "cotacoes") return <AgencyCotacoesAliasPage />
  if (section === "contratos") return <AgencyContractsPage />
  if (section === "vouchers") return <AgencyVouchersAliasPage />
  if (section === "recibos") return <AgencyRecibosAliasPage />
  if (section === "passagens") return <AgencyPassagensAliasPage />
  if (section === "templates") return <AgencyTemplatesAliasPage />
  if (section === "travelpro-match") redirect("/app/catalogo/travelpro-match")
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
  if (section === "configuracoes") return <AgencySettingsPage />

  const config = agencyPages[section]

  if (!config) notFound()

  notFound()
}
