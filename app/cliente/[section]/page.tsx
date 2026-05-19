import { notFound } from "next/navigation"
import { clientPages } from "@/lib/services/portal-pages"
import { PortalPage } from "@/components/system/portal-page"
import { ClientDashboard } from "@/components/client/client-dashboard"
import { ClientDocuments } from "@/components/client/client-documents"
import { ClientItinerary } from "@/components/client/client-itinerary"
import { ClientMessages } from "@/components/client/client-messages"
import { ClientTripPage } from "@/components/client/client-trip"
import { ClientProfile } from "@/components/client/client-profile"

export function generateStaticParams() {
  return Object.keys(clientPages).map((section) => ({ section }))
}

export default async function ClientSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params
  const config = clientPages[section]

  if (!config) notFound()

  if (section === "dashboard") return <ClientDashboard />
  if (section === "viagem") return <ClientTripPage />
  if (section === "documentos") return <ClientDocuments />
  if (section === "roteiro") return <ClientItinerary />
  if (section === "mensagens") return <ClientMessages />
  if (section === "perfil") return <ClientProfile />

  return <PortalPage config={config} />
}
