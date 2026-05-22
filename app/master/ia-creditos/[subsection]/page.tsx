import { notFound } from "next/navigation"
import { MasterAiCreditsPage } from "@/components/master/master-ai-whatsapp-pages"

const allowedSubsections = new Set(["uso-ia", "creditos", "custos", "logs-ia"])

export function generateStaticParams() {
  return Array.from(allowedSubsections).map((subsection) => ({ subsection }))
}

export default async function MasterAiCreditsSubsectionPage({
  params,
}: {
  params: Promise<{ subsection: string }>
}) {
  const { subsection } = await params
  if (!allowedSubsections.has(subsection)) notFound()

  return <MasterAiCreditsPage subsection={subsection as "uso-ia" | "creditos" | "custos" | "logs-ia"} />
}
