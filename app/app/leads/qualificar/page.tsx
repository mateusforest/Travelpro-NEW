"use client"

import { DedicatedActionWorkspace } from "@/components/system/dedicated-action-workspace"

export default function QualifyLeadWorkspacePage() {
  return (
    <DedicatedActionWorkspace
      title="Qualificar lead"
      description="Organize intenção, timing e score comercial antes de transformar o lead em proposta real."
      backHref="/app/leads"
      backLabel="Voltar para leads"
      aiActionLabel="Qualificar com IA"
      aiActionDescription="Aqui a IA poderá sugerir score, argumentos e follow-up ideal."
      primaryActionLabel="Salvar qualificação"
      primaryActionDescription="A qualificação do lead foi preparada em modo mockado."
      initialValues={{
        lead: "Isabela Monteiro",
        status: "Em qualificação",
        score: "84",
        timing: "Médio prazo",
        objections: "Comparando opções de luxo e custo-benefício.",
        nextStep: "Enviar proposta inicial e validar orçamento final.",
      }}
      sections={[
        {
          title: "Qualificação",
          description: "Transforme interesse em oportunidade clara para a agência.",
          fields: [
            { key: "lead", label: "Lead" },
            { key: "status", label: "Status", type: "select", options: ["Novo lead", "Em qualificação", "Cotação enviada"] },
            { key: "score", label: "Score comercial" },
            { key: "timing", label: "Timing" },
            { key: "objections", label: "Objeções e contexto", type: "textarea", rows: 4, colSpan: 2 },
            { key: "nextStep", label: "Próximo passo", type: "textarea", rows: 4, colSpan: 2 },
          ],
        },
      ]}
      previewTitle="Painel de qualificação"
      previewDescription="Leitura direta do estado do lead."
      renderPreview={(values) => (
        <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
          <h2 className="text-xl font-semibold text-foreground">{values.lead}</h2>
          <p className="mt-2 text-sm text-muted-foreground">Score {values.score} • {values.status}</p>
          <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-sm text-muted-foreground">
            {values.nextStep}
          </div>
        </div>
      )}
      sidebarInfo={{
        title: "Sinais de avanço",
        description: "A qualificação prepara a transição para cotação, Agent e automações.",
        items: [
          { label: "Score", value: (values) => values.score },
          { label: "Timing", value: (values) => values.timing },
          { label: "Status", value: (values) => values.status },
        ],
      }}
    />
  )
}
