import { getSupabaseAdminClient } from "@/lib/supabase/admin"

type CreateAgencyInput = {
  agencyName: string
  ownerName: string
  ownerEmail: string
  phone?: string | null
}

export async function createAgencyForUser(input: CreateAgencyInput) {
  const supabase = getSupabaseAdminClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from("agencies")
    .insert({
      name: input.agencyName,
      slug: input.agencyName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
      owner_name: input.ownerName,
      owner_email: input.ownerEmail,
      phone: input.phone ?? null,
      status: "active",
      created_at: now,
      updated_at: now,
    })
    .select("id, name, slug")
    .single()

  if (error) throw error
  return data
}
