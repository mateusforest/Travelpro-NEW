import { AgencyRebuildDashboard } from "@/components/agency-rebuild/dashboard"
import { AgencyRebuildShell } from "@/components/agency-rebuild/shell"

export default function AgencyRebuildPreviewPage() {
  return (
    <AgencyRebuildShell>
      <AgencyRebuildDashboard />
    </AgencyRebuildShell>
  )
}
