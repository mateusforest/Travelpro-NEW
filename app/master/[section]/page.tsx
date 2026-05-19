import { notFound } from "next/navigation"
import { masterPages } from "@/lib/services/portal-pages"
import { PortalPage } from "@/components/system/portal-page"
import {
  MasterAgenciesPage,
  MasterAtlasPage,
  MasterDashboardPage,
  MasterFinancePage,
  MasterLogsPage,
  MasterMarketplacePage,
  MasterPlansPage,
  MasterReportsPage,
  MasterSettingsPage,
  MasterTemplatesPage,
  MasterUsersPage,
  MasterWhatsAppPage,
} from "@/components/master/master-pages"

export function generateStaticParams() {
  return Object.keys(masterPages).map((section) => ({ section }))
}

export default async function MasterSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params
  const config = masterPages[section]

  if (!config) notFound()

  if (section === "dashboard") return <MasterDashboardPage />
  if (section === "agencias") return <MasterAgenciesPage />
  if (section === "financeiro") return <MasterFinancePage />
  if (section === "usuarios") return <MasterUsersPage />
  if (section === "marketplace") return <MasterMarketplacePage />
  if (section === "templates") return <MasterTemplatesPage />
  if (section === "planos") return <MasterPlansPage />
  if (section === "whatsapp") return <MasterWhatsAppPage />
  if (section === "atlas") return <MasterAtlasPage />
  if (section === "relatorios") return <MasterReportsPage />
  if (section === "logs") return <MasterLogsPage />
  if (section === "configuracoes") return <MasterSettingsPage />

  return <PortalPage config={config} />
}
