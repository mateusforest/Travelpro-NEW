"use client"

import { DedicatedActionWorkspace } from "@/components/system/dedicated-action-workspace"

export default function NewTripWorkspacePage() {
  return (
    <DedicatedActionWorkspace
      title="Nova viagem"
      description="Abra uma nova jornada operacional com cliente, orçamento, status e checklist inicial."
      backHref="/app/viagens"
      backLabel="Voltar para viagens"
      aiActionLabel="Montar viagem com IA"
      aiActionDescription="A IA poderá sugerir estrutura inicial, blocos de jornada e próximos documentos."
      primaryActionLabel="Salvar viagem"
      primaryActionDescription="A nova viagem foi preparada em modo mockado."
      initialValues={{
        client: "Carla Dias",
        destination: "Paris",
        dates: "12 jun • 20 jun 2026",
        travelers: "2 viajantes",
        budget: "R$ 18.400",
        status: "Planejamento",
        notes: "Cliente pediu foco em experiência romântica e hotel boutique.",
        checklist: "Contrato, pagamento inicial, roteiro base e documentos.",
      }}
      sections={[
        {
          title: "Base da jornada",
          description: "Elementos centrais para abrir a viagem dentro da operação.",
          fields: [
            { key: "client", label: "Cliente" },
            { key: "destination", label: "Destino" },
            { key: "dates", label: "Datas" },
            { key: "travelers", label: "Viajantes" },
          ],
        },
        {
          title: "Operação inicial",
          description: "Orçamento, status e notas para orientar a equipe.",
          fields: [
            { key: "budget", label: "Orçamento" },
            { key: "status", label: "Status", type: "select", options: ["Planejamento", "Confirmada", "Em andamento", "Finalizada"] },
            { key: "notes", label: "Observações", type: "textarea", rows: 4, colSpan: 2 },
            { key: "checklist", label: "Checklist inicial", type: "textarea", rows: 4, colSpan: 2 },
          ],
        },
      ]}
      previewTitle="Resumo da jornada"
      previewDescription="Uma leitura rápida da viagem antes de abrir o fluxo completo."
      renderPreview={(values) => (
        <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-primary/75">{values.status}</p>
          <h2 className="mt-2 text-xl font-semibold text-foreground">{values.client}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{values.destination} • {values.dates}</p>
          <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-sm text-muted-foreground">
            {values.checklist}
          </div>
        </div>
      )}
      sidebarInfo={{
        title: "Leitura operacional",
        description: "Abertura clara para roteiros, documentos, financeiro e notificações.",
        items: [
          { label: "Status", value: (values) => values.status },
          { label: "Orçamento", value: (values) => values.budget },
          { label: "Viajantes", value: (values) => values.travelers },
        ],
      }}
    />
  )
}
