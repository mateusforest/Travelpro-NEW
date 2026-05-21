import { AgencyTemplateBrandingWorkspace } from "@/components/agency/agency-template-branding-workspace"

export default async function AgencyTemplatePersonalizationPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>
}) {
  const { template } = await searchParams

  return <AgencyTemplateBrandingWorkspace initialTemplate={template} />
}
