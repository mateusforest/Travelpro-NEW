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
  const baseSlug = input.agencyName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${Date.now().toString().slice(-4)}-${attempt}`

    const { data, error } = await supabase
      .from("agencies")
      .insert({
        name: input.agencyName,
        slug,
        owner_name: input.ownerName,
        owner_email: input.ownerEmail,
        phone: input.phone ?? null,
        status: "active",
        created_at: now,
        updated_at: now,
      })
      .select("id, name, slug")
      .single()

    if (!error) return data

    if (!String(error.message ?? "").toLowerCase().includes("duplicate")) {
      throw error
    }
  }

  throw new Error("Não foi possível gerar um identificador único para a agência.")
}
