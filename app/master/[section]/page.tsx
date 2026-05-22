import { notFound } from "next/navigation"
import { masterPages } from "@/lib/services/portal-pages"
import { PortalPage } from "@/components/system/portal-page"
import {
  MasterAgenciesPage as MasterAgenciesRealPage,
  MasterDashboardPremiumPage as MasterDashboardRealPage,
  MasterFinancePage as MasterFinanceRealPage,
  MasterUsersPage as MasterUsersRealPage,
} from "@/components/master/master-real-pages"
import { MasterWhatsAppRealPage } from "@/components/master/master-ai-whatsapp-pages"
import { MasterReportsRealPage, MasterTemplatesRealPage } from "@/components/master/master-report-template-pages"
import {
  MasterAtlasRealPage,
  MasterLogsRealPage,
  MasterMarketplaceStablePage,
  MasterPlansStablePage,
  MasterSettingsStablePage,
} from "@/components/master/master-stabilized-pages"

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
  if (section === "marketplace") return <MasterMarketplaceStablePage />
  if (section === "templates") return <MasterTemplatesRealPage />
  if (section === "planos") return <MasterPlansStablePage />
  if (section === "whatsapp") return <MasterWhatsAppRealPage />
  if (section === "atlas") return <MasterAtlasRealPage />
  if (section === "relatorios") return <MasterReportsRealPage />
  if (section === "logs") return <MasterLogsRealPage />
  if (section === "configuracoes") return <MasterSettingsStablePage />

  return <PortalPage config={config} />
}
