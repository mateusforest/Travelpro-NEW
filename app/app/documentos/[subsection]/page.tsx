import { notFound } from "next/navigation"
import { agencyDocumentPages } from "@/lib/services/agency-extra-pages"
import {
  AgencyContractsPage,
  AgencyReceiptsPage,
  AgencyTicketsPage,
  AgencyTemplatesPage,
  AgencyVouchersPage,
} from "@/components/agency/agency-pages"

export function generateStaticParams() {
  return Object.keys(agencyDocumentPages).map((subsection) => ({ subsection }))
}

export default async function AgencyDocumentSubsectionPage({ params }: { params: Promise<{ subsection: string }> }) {
  const { subsection } = await params
  const config = agencyDocumentPages[subsection]

  if (!config) notFound()

  if (subsection === "contratos") return <AgencyContractsPage />
  if (subsection === "vouchers") return <AgencyVouchersPage />
  if (subsection === "recibos") return <AgencyReceiptsPage />
  if (subsection === "passagens") return <AgencyTicketsPage />
  if (subsection === "templates") return <AgencyTemplatesPage />

  notFound()
}
