"use client"

import { Suspense } from "react"
import { DocumentWorkspace } from "@/components/agency/document-workspace"

export default function NewItineraryWorkspacePage() {
  return (
    <Suspense fallback={null}>
      <DocumentWorkspace mode="roteiro" />
    </Suspense>
  )
}
