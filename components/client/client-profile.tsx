"use client"

import { useState } from "react"
import { Save, UserRound } from "lucide-react"
import { PageShell } from "@/components/system/page-shell"
import { SectionHeader } from "@/components/system/section-header"
import { DashboardCard } from "@/components/system/dashboard-card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"

type TravelerProfile = {
  name: string
  phone: string
  email: string
  document: string
  travelPreferences: string
  dietaryRestrictions: string
  notes: string
}

const initialProfile: TravelerProfile = {
  name: "Ana Martins",
  phone: "+55 11 99888-1122",
  email: "ana.martins@email.com",
  document: "Passaporte BR1234567",
  travelPreferences: "Hotéis boutique, voos diurnos e experiências gastronômicas.",
  dietaryRestrictions: "Sem frutos do mar.",
  notes: "Prefere check-in antecipado quando houver disponibilidade.",
}

function ProfileField({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  multiline?: boolean
}) {
  return (
    <label className="space-y-2">
      <span className="text-xs uppercase tracking-[0.18em] text-primary/75">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          className="w-full resize-none rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      )}
    </label>
  )
}

export function ClientProfile() {
  const [profile, setProfile] = useState(initialProfile)
  const [open, setOpen] = useState(false)

  const updateField = (field: keyof TravelerProfile, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }))
  }

  const saveProfile = () => {
    toast({ title: "Perfil do viajante salvo", description: "Os dados foram atualizados localmente em modo mockado." })
    setOpen(false)
  }

  return (
    <PageShell>
      <SectionHeader
        title="Perfil do viajante"
        description="Mantenha seus dados, preferências e observações importantes sempre atualizados."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full">Editar perfil</Button>
            </DialogTrigger>
            <DialogContent className="flex max-h-[88vh] max-w-4xl flex-col rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
              <DialogHeader className="border-b border-white/8 px-6 py-5">
                <DialogTitle>Editar perfil do viajante</DialogTitle>
                <DialogDescription>Atualize seus dados básicos, preferências e restrições antes da viagem.</DialogDescription>
              </DialogHeader>
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <ProfileField label="Nome" value={profile.name} onChange={(value) => updateField("name", value)} />
                  <ProfileField label="Telefone" value={profile.phone} onChange={(value) => updateField("phone", value)} />
                  <ProfileField label="E-mail" value={profile.email} onChange={(value) => updateField("email", value)} />
                  <ProfileField label="Documento" value={profile.document} onChange={(value) => updateField("document", value)} />
                  <div className="md:col-span-2">
                    <ProfileField
                      label="Preferências de viagem"
                      value={profile.travelPreferences}
                      onChange={(value) => updateField("travelPreferences", value)}
                      multiline
                    />
                  </div>
                  <div className="md:col-span-2">
                    <ProfileField
                      label="Restrições alimentares"
                      value={profile.dietaryRestrictions}
                      onChange={(value) => updateField("dietaryRestrictions", value)}
                      multiline
                    />
                  </div>
                  <div className="md:col-span-2">
                    <ProfileField label="Observações importantes" value={profile.notes} onChange={(value) => updateField("notes", value)} multiline />
                  </div>
                </div>
              </div>
              <DialogFooter className="border-t border-white/8 px-6 py-5">
                <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => setOpen(false)}>
                  Fechar
                </Button>
                <Button className="rounded-full" onClick={saveProfile}>
                  <Save className="h-4 w-4" />
                  Salvar perfil
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <DashboardCard title="Dados do viajante" description="Estas informações ajudam a agência a personalizar a sua experiência.">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-primary/15 bg-primary/10 p-3">
                <UserRound className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{profile.name}</p>
                <p className="text-xs text-muted-foreground">{profile.email}</p>
              </div>
            </div>
            <div className="mt-5 space-y-3 text-sm text-muted-foreground">
              <p>
                <span className="text-foreground">Telefone:</span> {profile.phone}
              </p>
              <p>
                <span className="text-foreground">Documento:</span> {profile.document}
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-primary/70">Preferências de viagem</p>
              <p className="mt-2 text-sm leading-6 text-foreground">{profile.travelPreferences}</p>
            </div>
            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-primary/70">Restrições alimentares</p>
              <p className="mt-2 text-sm leading-6 text-foreground">{profile.dietaryRestrictions}</p>
            </div>
            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-primary/70">Observações importantes</p>
              <p className="mt-2 text-sm leading-6 text-foreground">{profile.notes}</p>
            </div>
          </div>
        </div>
      </DashboardCard>
    </PageShell>
  )
}
