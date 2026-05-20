"use client"

import { DedicatedActionWorkspace } from "@/components/system/dedicated-action-workspace"

export default function NewReportWorkspacePage() {
  return (
    <DedicatedActionWorkspace
      title="Novo relatório"
      description="Monte um relatório com filtros, módulos e formato de exportação sem depender de popup apertado."
      backHref="/app/central-operacional/relatorios"
      backLabel="Voltar para relatórios"
      aiActionLabel="Gerar relatório com IA"
      aiActionDescription="A IA poderá sugerir filtros, recortes e insights do relatório."
      primaryActionLabel="Gerar relatório"
      primaryActionDescription="O relatório foi preparado em modo mockado."
      initialValues={{
        type: "Financeiro",
        period: "Últimos 30 dias",
        filters: "Viagens premium, leads quentes e documentos emitidos.",
        modules: "Financeiro, viagens, central operacional",
        export: "PDF + CSV",
      }}
      sections={[
        {
          title: "Configuração do relatório",
          description: "Escolha o recorte e o formato de distribuição do material.",
          fields: [
            { key: "type", label: "Tipo de relatório", type: "select", options: ["Clientes", "Viagens", "Financeiro", "Documentos", "Equipe", "Central Operacional"] },
            { key: "period", label: "Período" },
            { key: "modules", label: "Módulos" },
            { key: "export", label: "Exportação" },
            { key: "filters", label: "Filtros", type: "textarea", rows: 4, colSpan: 2 },
          ],
        },
      ]}
      previewTitle="Resumo do relatório"
      previewDescription="Prévia do recorte antes da geração."
      renderPreview={(values) => (
        <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
          <h2 className="text-xl font-semibold text-foreground">{values.type}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{values.period}</p>
          <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-sm text-muted-foreground">
            {values.modules}
          </div>
        </div>
      )}
      sidebarInfo={{
        title: "Leitura analítica",
        description: "Pronto para exportação, revisão e futura camada de IA.",
        items: [
          { label: "Tipo", value: (values) => values.type },
          { label: "Período", value: (values) => values.period },
          { label: "Exportação", value: (values) => values.export },
        ],
      }}
    />
  )
}
