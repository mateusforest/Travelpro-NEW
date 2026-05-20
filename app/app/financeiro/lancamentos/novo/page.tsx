"use client"

import { DedicatedActionWorkspace } from "@/components/system/dedicated-action-workspace"

export default function NewFinancialRecordWorkspacePage() {
  return (
    <DedicatedActionWorkspace
      title="Novo lançamento financeiro"
      description="Registre receita ou despesa com contexto operacional, categoria e leitura pronta para relatórios."
      backHref="/app/financeiro"
      backLabel="Voltar para financeiro"
      aiActionLabel="Analisar com IA"
      aiActionDescription="A IA poderá sugerir categoria, observações e impactos operacionais do lançamento."
      primaryActionLabel="Salvar lançamento"
      primaryActionDescription="O lançamento financeiro foi preparado em modo mockado."
      initialValues={{
        type: "Receita",
        clientTrip: "Ana Martins • Cancún",
        category: "Pacote internacional",
        value: "R$ 12.780",
        dueDate: "20/07/2026",
        status: "A receber",
        notes: "Primeira parcela confirmada com saldo restante em 15 dias.",
      }}
      sections={[
        {
          title: "Dados do lançamento",
          description: "Campos centrais para manter o financeiro conectado à operação.",
          fields: [
            { key: "type", label: "Receita / despesa", type: "select", options: ["Receita", "Despesa"] },
            { key: "clientTrip", label: "Cliente / viagem" },
            { key: "category", label: "Categoria" },
            { key: "value", label: "Valor" },
            { key: "dueDate", label: "Vencimento" },
            { key: "status", label: "Status", type: "select", options: ["A receber", "Pago", "Pendente"] },
            { key: "notes", label: "Observações", type: "textarea", rows: 4, colSpan: 2 },
          ],
        },
      ]}
      previewTitle="Resumo financeiro"
      previewDescription="Leitura clara antes de salvar ou exportar."
      renderPreview={(values) => (
        <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-primary/75">{values.type}</p>
          <h2 className="mt-2 text-xl font-semibold text-foreground">{values.value}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{values.clientTrip}</p>
          <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-sm text-muted-foreground">
            {values.category} • {values.status}
          </div>
        </div>
      )}
      sidebarInfo={{
        title: "Leitura contábil",
        description: "Base preparada para relatórios, análises e alertas operacionais.",
        items: [
          { label: "Tipo", value: (values) => values.type },
          { label: "Categoria", value: (values) => values.category },
          { label: "Vencimento", value: (values) => values.dueDate },
        ],
      }}
    />
  )
}
