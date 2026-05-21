"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { DedicatedActionWorkspace, type WorkspaceSectionConfig } from "@/components/system/dedicated-action-workspace"
import { toast } from "@/components/ui/use-toast"
import type { ClientRow } from "@/types/database"

export default function NewTripWorkspacePage() {
  const router = useRouter()
  const [clients, setClients] = useState<ClientRow[]>([])

  useEffect(() => {
    let active = true
    fetch("/api/clients")
      .then(async (response) => {
        const payload = (await response.json().catch(() => null)) as { error?: string } | ClientRow[] | null
        if (!response.ok) {
          throw new Error((payload as { error?: string } | null)?.error || "Não foi possível carregar os clientes.")
        }
        return payload as ClientRow[]
      })
      .then((data) => {
        if (!active) return
        setClients(data)
      })
      .catch((error) => {
        if (!active) return
        if (process.env.NODE_ENV !== "production") {
          console.error("[NewTripWorkspacePage] failed to load clients", error)
        }
        setClients([])
      })

    return () => {
      active = false
    }
  }, [])

  const clientOptions = useMemo(() => ["Sem cliente vinculado", ...clients.map((client) => `${client.id}::${client.name}`)], [clients])

  const sections: WorkspaceSectionConfig[] = [
    {
      title: "Base da jornada",
      description: "Elementos centrais para abrir a viagem dentro da operação.",
      fields: [
        { key: "clientId", label: "Cliente", type: "select", options: clientOptions },
        { key: "destination", label: "Destino" },
        { key: "origin", label: "Origem" },
        { key: "status", label: "Status", type: "select", options: ["Planejamento", "Confirmada", "Em andamento", "Finalizada"] },
      ],
    },
    {
      title: "Datas e contexto",
      description: "Defina janelas e o resumo operacional da viagem.",
      fields: [
        { key: "startDate", label: "Data de início" },
        { key: "endDate", label: "Data de fim" },
        { key: "summary", label: "Resumo da viagem", type: "textarea", rows: 5, colSpan: 2 },
      ],
    },
  ]

  const toIsoOrNull = (value: string) => {
    if (!value.trim()) return null
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
      throw new Error("Use datas válidas para início e fim da viagem.")
    }
    return parsed.toISOString()
  }

  return (
    <DedicatedActionWorkspace
      title="Nova viagem"
      description="Abra uma nova jornada operacional com cliente, destino, status e resumo inicial."
      backHref="/app/viagens"
      backLabel="Voltar para viagens"
      aiActionLabel="Montar viagem com IA"
      aiActionDescription="A IA poderá sugerir estrutura inicial, blocos de jornada e próximos documentos."
      primaryActionLabel="Salvar viagem"
      draftActionDescription="Rascunhos de viagens serão ativados em uma próxima etapa."
      previewActionDescription="O preview completo da jornada será expandido em uma próxima etapa."
      initialValues={{
        clientId: "Sem cliente vinculado",
        destination: "",
        origin: "",
        startDate: "",
        endDate: "",
        status: "Planejamento",
        summary: "",
      }}
      sections={sections}
      previewTitle="Resumo da jornada"
      previewDescription="Uma leitura rápida da viagem antes de abrir o fluxo completo."
      renderPreview={(values) => {
        const selectedClient = clients.find((client) => `${client.id}::${client.name}` === values.clientId)
        return (
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-primary/75">{values.status || "Planejamento"}</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">{selectedClient?.name || "Viagem sem cliente vinculado"}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {values.destination || "Destino em definição"} • {values.startDate || "Início a definir"} {values.endDate ? `- ${values.endDate}` : ""}
            </p>
            <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-sm text-muted-foreground">
              {values.summary || "Resumo operacional ainda não preenchido."}
            </div>
          </div>
        )
      }}
      sidebarInfo={{
        title: "Leitura operacional",
        description: "Abertura clara para roteiros, documentos, financeiro e notificações.",
        items: [
          { label: "Status", value: (values) => values.status || "Planejamento" },
          { label: "Origem", value: (values) => values.origin || "Não informada" },
          {
            label: "Cliente",
            value: (values) => clients.find((client) => `${client.id}::${client.name}` === values.clientId)?.name || "Sem vínculo",
          },
        ],
      }}
      onPrimaryAction={async (values) => {
        try {
          const selectedClientId = values.clientId && values.clientId !== "Sem cliente vinculado" ? values.clientId.split("::")[0] : null

          const response = await fetch("/api/trips", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              client_id: selectedClientId,
              destination: values.destination,
              origin: values.origin || null,
              status: values.status || "Planejamento",
              starts_at: toIsoOrNull(values.startDate),
              ends_at: toIsoOrNull(values.endDate),
              summary: values.summary || null,
            }),
          })

          const payload = (await response.json().catch(() => null)) as { error?: string } | null

          if (!response.ok) {
            throw new Error(payload?.error || "Não foi possível salvar a viagem.")
          }

          toast({
            title: "Viagem salva",
            description: "A viagem foi criada no Supabase e já está disponível na operação.",
          })

          router.replace("/app/viagens")
          router.refresh()
        } catch (error) {
          if (process.env.NODE_ENV !== "production") {
            console.error("[NewTripWorkspacePage] failed to create trip", error)
          }
          throw error
        }
      }}
    />
  )
}
