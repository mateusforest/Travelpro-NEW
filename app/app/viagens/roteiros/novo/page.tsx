"use client"

import { DedicatedActionWorkspace } from "@/components/system/dedicated-action-workspace"

export default function NewItineraryWorkspacePage() {
  return (
    <DedicatedActionWorkspace
      title="Novo roteiro"
      description="Monte a experiência da viagem com dias, estilo, ritmo e estrutura pronta para cliente e operação."
      backHref="/app/viagens/roteiros"
      backLabel="Voltar para roteiros"
      aiActionLabel="Gerar roteiro com IA"
      aiActionDescription="A IA poderá montar dias, ritmo, experiências e textos do roteiro."
      primaryActionLabel="Salvar roteiro"
      primaryActionDescription="O novo roteiro foi preparado em modo mockado."
      initialValues={{
        clientTrip: "Ana Martins • Cancún",
        destination: "Cancún",
        days: "7 dias",
        style: "Premium família",
        pace: "Equilibrado",
        interests: "Praia, gastronomia e experiências leves.",
        template: "Roteiro editorial",
      }}
      sections={[
        {
          title: "Configuração do roteiro",
          description: "Base do roteiro antes da montagem detalhada.",
          fields: [
            { key: "clientTrip", label: "Cliente / viagem" },
            { key: "destination", label: "Destino" },
            { key: "days", label: "Duração" },
            { key: "style", label: "Estilo" },
            { key: "pace", label: "Ritmo" },
            { key: "template", label: "Template" },
            { key: "interests", label: "Interesses", type: "textarea", rows: 4, colSpan: 2 },
          ],
        },
      ]}
      previewTitle="Preview do roteiro"
      previewDescription="Estrutura inicial do material que será compartilhado com o cliente."
      renderPreview={(values) => (
        <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
          <h2 className="text-xl font-semibold text-foreground">{values.destination}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{values.days} • {values.style}</p>
          <div className="mt-4 grid gap-3">
            {["Dia 1 • Chegada e ambientação", "Dia 2 • Experiência principal", "Dia 3 • Momento livre com curadoria"].map((day) => (
              <div key={day} className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
        </div>
      )}
      sidebarInfo={{
        title: "Direção do roteiro",
        description: "A base aqui orienta IA, operação e experiência do cliente.",
        items: [
          { label: "Estilo", value: (values) => values.style },
          { label: "Ritmo", value: (values) => values.pace },
          { label: "Template", value: (values) => values.template },
        ],
      }}
    />
  )
}
