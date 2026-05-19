import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/get-current-user"

export async function requireAuth() {
  const current = await getCurrentUser()

  if (!current.user) {
    redirect("/login")
  }

  return current
}
