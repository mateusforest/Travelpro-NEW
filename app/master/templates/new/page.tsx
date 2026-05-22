import { MasterTemplateWorkspace } from "@/components/master/master-template-workspace"

export default async function NewMasterTemplatePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; source?: string }>
}) {
  const { id, source } = await searchParams
  return <MasterTemplateWorkspace initialTemplateId={id ?? null} initialSourceId={source ?? null} />
}
