import { notFound } from "next/navigation"
import { agencyTripPages } from "@/lib/services/agency-extra-pages"
import { AgencyCotacoesPage, AgencyRoteirosPage } from "@/components/agency/agency-pages"

export function generateStaticParams() {
  return Object.keys(agencyTripPages).map((subsection) => ({ subsection }))
}

export default async function AgencyTripSubsectionPage({ params }: { params: Promise<{ subsection: string }> }) {
  const { subsection } = await params
  const config = agencyTripPages[subsection]

  if (!config) notFound()

  if (subsection === "roteiros") return <AgencyRoteirosPage />
  if (subsection === "cotacoes") return <AgencyCotacoesPage />

  notFound()
}
