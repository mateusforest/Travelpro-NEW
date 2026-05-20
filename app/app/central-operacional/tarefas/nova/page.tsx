"use client"

import { DedicatedActionWorkspace } from "@/components/system/dedicated-action-workspace"

export default function NewTaskWorkspacePage() {
  return (
    <DedicatedActionWorkspace
      title="Nova tarefa operacional"
      description="Lance uma tarefa com responsável, prazo, prioridade e contexto da viagem ou cliente."
      backHref="/app/central-operacional/tarefas"
      backLabel="Voltar para tarefas"
      aiActionLabel="Lançar com IA"
      aiActionDescription="A IA poderá sugerir prioridade, responsável e checklist ideal da tarefa."
      primaryActionLabel="Salvar tarefa"
      primaryActionDescription="A nova tarefa foi preparada em modo mockado."
      initialValues={{
        type: "Pré-embarque",
        owner: "Operacional",
        deadline: "Hoje, 18:00",
        priority: "Alta",
        related: "Ana Martins • Cancún",
        reminder: "Reforçar em 2h se continuar pendente.",
      }}
      sections={[
        {
          title: "Configuração da tarefa",
          description: "Base simples, mas pronta para operação, alertas e futuras automações.",
          fields: [
            { key: "type", label: "Tipo de tarefa" },
            { key: "owner", label: "Responsável" },
            { key: "deadline", label: "Prazo" },
            { key: "priority", label: "Prioridade", type: "select", options: ["Baixa", "Média", "Alta"] },
            { key: "related", label: "Cliente / viagem relacionada" },
            { key: "reminder", label: "Lembrete", type: "textarea", rows: 4, colSpan: 2 },
          ],
        },
      ]}
      previewTitle="Resumo da tarefa"
      previewDescription="Leitura rápida antes de lançar na central operacional."
      renderPreview={(values) => (
        <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
          <h2 className="text-xl font-semibold text-foreground">{values.type}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{values.related}</p>
          <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-sm text-muted-foreground">
            {values.deadline} • {values.priority}
          </div>
        </div>
      )}
      sidebarInfo={{
        title: "Leitura operacional",
        description: "Pronto para central, notificações e futuras automações.",
        items: [
          { label: "Prioridade", value: (values) => values.priority },
          { label: "Responsável", value: (values) => values.owner },
          { label: "Prazo", value: (values) => values.deadline },
        ],
      }}
    />
  )
}
