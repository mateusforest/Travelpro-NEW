import { Suspense } from "react"
import { FinancialRecordWorkspace } from "@/components/agency/financial-record-workspace"

export default function NewFinancialRecordPage() {
  return (
    <Suspense fallback={null}>
      <FinancialRecordWorkspace />
    </Suspense>
  )
}
