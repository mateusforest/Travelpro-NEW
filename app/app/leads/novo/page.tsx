"use client"

import { DedicatedActionWorkspace } from "@/components/system/dedicated-action-workspace"

export default function NewLeadWorkspacePage() {
  return (
    <DedicatedActionWorkspace
      title="Novo lead"
      description="Cadastre uma nova oportunidade com contexto comercial suficiente para follow-up e qualificação."
      backHref="/app/leads"
      backLabel="Voltar para leads"
      aiActionLabel="Qualificar com IA"
      aiActionDescription="O assistente poderá estruturar intenção, temperatura e próximos passos automaticamente."
      primaryActionLabel="Salvar lead"
      primaryActionDescription="O novo lead foi preparado em modo mockado."
      initialValues={{
        name: "Isabela Monteiro",
        origin: "Instagram",
        interest: "Lua de mel premium",
        temperature: "Quente",
        budget: "R$ 22.000",
        destination: "Tailândia",
        date: "Novembro 2026",
        owner: "Marina Alves",
        followUp: "Retomar em 24h com proposta inicial",
      }}
      sections={[
        {
          title: "Dados comerciais",
          description: "Base do lead e contexto inicial da oportunidade.",
          fields: [
            { key: "name", label: "Nome do lead" },
            { key: "origin", label: "Origem" },
            { key: "interest", label: "Interesse principal" },
            { key: "temperature", label: "Temperatura", type: "select", options: ["Frio", "Morno", "Quente"] },
          ],
        },
        {
          title: "Viagem e orçamento",
          description: "Detalhes que ajudam a montar a próxima proposta.",
          fields: [
            { key: "destination", label: "Destino" },
            { key: "date", label: "Período desejado" },
            { key: "budget", label: "Orçamento" },
            { key: "owner", label: "Responsável" },
          ],
        },
        {
          title: "Próximo follow-up",
          description: "Próxima ação estruturada para não perder tração.",
          fields: [{ key: "followUp", label: "Próximo passo", type: "textarea", rows: 4, colSpan: 2 }],
        },
      ]}
      previewTitle="Score comercial"
      previewDescription="Leitura rápida da oportunidade para operação e IA."
      renderPreview={(values) => (
        <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-primary/75">{values.temperature}</p>
          <h2 className="mt-2 text-xl font-semibold text-foreground">{values.name}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{values.destination} • {values.budget}</p>
          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-sm text-muted-foreground">
              Origem: {values.origin}
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-sm text-muted-foreground">
              Próximo follow-up: {values.followUp}
            </div>
          </div>
        </div>
      )}
      sidebarInfo={{
        title: "Qualificação sugerida",
        description: "Base pronta para funil, Agent e futuras automações.",
        items: [
          { label: "Temperatura", value: (values) => values.temperature },
          { label: "Origem", value: (values) => values.origin },
          { label: "Responsável", value: (values) => values.owner },
        ],
      }}
      helpCard={{
        title: "Checklist comercial",
        description: "Campos simples, mas com contexto suficiente para o próximo passo da equipe.",
        steps: [
          "Defina a origem corretamente para medir aquisição.",
          "Use interesse e orçamento como base para a primeira proposta.",
          "Deixe o follow-up claro para evitar lead parado.",
        ],
      }}
    />
  )
}
