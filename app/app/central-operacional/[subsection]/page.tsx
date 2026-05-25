import { notFound } from "next/navigation"
import { agencyOperationalPages } from "@/lib/services/agency-extra-pages"
import {
  AgencyCreditsOperationalPage,
  AgencyInsightsPage,
  AgencyReportsOperationalPage,
  AgencyTasksOperationalPage,
} from "@/components/agency/agency-pages"

export function generateStaticParams() {
  return Object.keys(agencyOperationalPages).map((subsection) => ({ subsection }))
}

export default async function AgencyOperationalSubsectionPage({ params }: { params: Promise<{ subsection: string }> }) {
  const { subsection } = await params
  const config = agencyOperationalPages[subsection]

  if (!config) notFound()

  if (subsection === "creditos") return <AgencyCreditsOperationalPage />
  if (subsection === "insights") return <AgencyInsightsPage />
  if (subsection === "tarefas") return <AgencyTasksOperationalPage />
  if (subsection === "relatorios") return <AgencyReportsOperationalPage />

  notFound()
}
