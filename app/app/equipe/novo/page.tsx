"use client"

import { Suspense } from "react"
import { TeamWorkspace } from "@/components/agency/team-workspace"

export default function NewTeamMemberWorkspacePage() {
  return (
    <Suspense fallback={null}>
      <TeamWorkspace />
    </Suspense>
  )
}
