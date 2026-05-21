"use client"

import { Suspense } from "react"
import { DocumentWorkspace } from "@/components/agency/document-workspace"

export default function NewQuoteWorkspacePage() {
  return (
    <Suspense fallback={null}>
      <DocumentWorkspace mode="cotacao" />
    </Suspense>
  )
}
