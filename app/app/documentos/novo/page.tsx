import { Suspense } from "react"
import { DocumentWorkspace } from "@/components/agency/document-workspace"

export default function NewDocumentWorkspacePage() {
  return (
    <Suspense fallback={null}>
      <DocumentWorkspace />
    </Suspense>
  )
}
