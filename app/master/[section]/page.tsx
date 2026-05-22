import { notFound } from "next/navigation"
import { masterPages } from "@/lib/services/portal-pages"
import { PortalPage } from "@/components/system/portal-page"
import {
  MasterAgenciesPage as MasterAgenciesRealPage,
  MasterDashboardPage as MasterDashboardRealPage,
  MasterFinancePage as MasterFinanceRealPage,
  MasterUsersPage as MasterUsersRealPage,
} from "@/components/master/master-real-pages"
import { MasterWhatsAppRealPage } from "@/components/master/master-ai-whatsapp-pages"
import {
  MasterAtlasPage,
  MasterLogsPage,
  MasterMarketplacePage,
  MasterPlansPage,
  MasterReportsPage,
  MasterSettingsPage,
  MasterTemplatesPage,
} from "@/components/master/master-pages"

export function generateStaticParams() {
  return Object.keys(masterPages).map((section) => ({ section }))
}

export default async function MasterSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params
  const config = masterPages[section]

  if (!config) notFound()

  if (section === "dashboard") return <MasterDashboardRealPage />
  if (section === "agencias") return <MasterAgenciesRealPage />
  if (section === "financeiro") return <MasterFinanceRealPage />
  if (section === "usuarios") return <MasterUsersRealPage />
  if (section === "marketplace") return <MasterMarketplacePage />
  if (section === "templates") return <MasterTemplatesPage />
  if (section === "planos") return <MasterPlansPage />
  if (section === "whatsapp") return <MasterWhatsAppRealPage />
  if (section === "atlas") return <MasterAtlasPage />
  if (section === "relatorios") return <MasterReportsPage />
  if (section === "logs") return <MasterLogsPage />
  if (section === "configuracoes") return <MasterSettingsPage />

  return <PortalPage config={config} />
}
