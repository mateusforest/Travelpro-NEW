"use client"

import { DedicatedActionWorkspace } from "@/components/system/dedicated-action-workspace"

export default function NewQuoteWorkspacePage() {
  return (
    <DedicatedActionWorkspace
      title="Nova cotação"
      description="Crie uma proposta comercial com contexto, template, validade e leitura pronta para aprovação."
      backHref="/app/viagens/cotacoes"
      backLabel="Voltar para cotações"
      aiActionLabel="Gerar cotação com IA"
      aiActionDescription="A IA poderá organizar opções, argumentos e estrutura comercial da proposta."
      primaryActionLabel="Salvar cotação"
      primaryActionDescription="A nova cotação foi preparada em modo mockado."
      initialValues={{
        client: "Fabio Mello",
        trip: "Gramado • Julho",
        options: "Hotel, aéreo, seguro e experiência familiar.",
        values: "R$ 9.200",
        includes: "Aéreo, hotel, carro e parque",
        excludes: "Alimentação livre e upgrades extras",
        validity: "5 dias",
        template: "Proposta comercial premium",
      }}
      sections={[
        {
          title: "Base da proposta",
          description: "Cliente, viagem e estrutura comercial da cotação.",
          fields: [
            { key: "client", label: "Cliente" },
            { key: "trip", label: "Viagem" },
            { key: "values", label: "Valor" },
            { key: "validity", label: "Validade" },
            { key: "template", label: "Template" },
            { key: "options", label: "Opções", type: "textarea", rows: 4, colSpan: 2 },
            { key: "includes", label: "Inclusos", type: "textarea", rows: 4 },
            { key: "excludes", label: "Não inclusos", type: "textarea", rows: 4 },
          ],
        },
      ]}
      previewTitle="Preview comercial"
      previewDescription="Leitura da proposta como material de venda."
      renderPreview={(values) => (
        <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
          <h2 className="text-xl font-semibold text-foreground">{values.client}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{values.trip}</p>
          <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.04] p-4">
            <p className="text-lg font-semibold text-foreground">{values.values}</p>
            <p className="mt-2 text-sm text-muted-foreground">{values.includes}</p>
          </div>
        </div>
      )}
      sidebarInfo={{
        title: "Pronta para aprovação",
        description: "A cotação já nasce com clareza comercial e contexto para conversão.",
        items: [
          { label: "Valor", value: (values) => values.values },
          { label: "Template", value: (values) => values.template },
          { label: "Validade", value: (values) => values.validity },
        ],
      }}
    />
  )
}
