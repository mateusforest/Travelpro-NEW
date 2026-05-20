"use client"

import { DedicatedActionWorkspace } from "@/components/system/dedicated-action-workspace"

export default function NewDocumentWorkspacePage() {
  return (
    <DedicatedActionWorkspace
      title="Novo documento"
      description="Monte um documento com tipo, template, contexto da viagem e preview pronto para envio."
      backHref="/app/documentos"
      backLabel="Voltar para documentos"
      aiActionLabel="Gerar documento com IA"
      aiActionDescription="A IA poderá preencher variáveis e montar versões comerciais do documento."
      primaryActionLabel="Salvar documento"
      primaryActionDescription="O novo documento foi preparado em modo mockado."
      initialValues={{
        type: "Contrato",
        client: "Ana Martins",
        trip: "Cancún • Julho",
        template: "Contrato premium",
        variables: "Dados do cliente, destino, datas e condições da viagem.",
        attachments: "Voucher do hotel e comprovante inicial.",
      }}
      sections={[
        {
          title: "Base do documento",
          description: "Estruture o documento para operação, cliente e futuras automações.",
          fields: [
            { key: "type", label: "Tipo de documento", type: "select", options: ["Contrato", "Voucher", "Recibo", "Passagem", "Documento geral"] },
            { key: "client", label: "Cliente" },
            { key: "trip", label: "Viagem" },
            { key: "template", label: "Template" },
            { key: "variables", label: "Dados variáveis", type: "textarea", rows: 4, colSpan: 2 },
            { key: "attachments", label: "Anexos", type: "textarea", rows: 4, colSpan: 2 },
          ],
        },
      ]}
      previewTitle="Preview do documento"
      previewDescription="Uma leitura rápida do material antes de gerar ou enviar."
      renderPreview={(values) => (
        <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-primary/75">{values.type}</p>
          <h2 className="mt-2 text-xl font-semibold text-foreground">{values.client}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{values.trip}</p>
          <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-sm text-muted-foreground">
            Template: {values.template}
          </div>
        </div>
      )}
      sidebarInfo={{
        title: "Leitura de geração",
        description: "Documento preparado para branding, IA e compartilhamento.",
        items: [
          { label: "Tipo", value: (values) => values.type },
          { label: "Template", value: (values) => values.template },
          { label: "Viagem", value: (values) => values.trip },
        ],
      }}
    />
  )
}
