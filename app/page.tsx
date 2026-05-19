import Header from "@/components/header"
import HeroSection from "@/components/hero-section"
import WhatsAppSection from "@/components/whatsapp-section"
import DashboardSection from "@/components/dashboard-section"
import DocumentsSection from "@/components/documents-section"
import CatalogSection from "@/components/catalog-section"
import ExpansionsSection from "@/components/expansions-section"
import CentralSection from "@/components/central-section"
import InsightsSection from "@/components/insights-section"
import PortalSection from "@/components/portal-section"
import CTASection from "@/components/cta-section"
import Footer from "@/components/footer"
import PWAPopup from "@/components/pwa-popup"
import AtlasAssistant from "@/components/atlas-assistant"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <WhatsAppSection />
      <DashboardSection />
      <DocumentsSection />
      <CatalogSection />
      <ExpansionsSection />
      <CentralSection />
      <InsightsSection />
      <PortalSection />
      <CTASection />
      <Footer />
      <PWAPopup />
      <AtlasAssistant />
    </main>
  )
}
