"use client"

import { DedicatedActionWorkspace } from "@/components/system/dedicated-action-workspace"

export default function NewMasterTemplateWorkspacePage() {
  return (
    <DedicatedActionWorkspace
      title="Novo template oficial"
      description="Crie um template premium para documentos, roteiros, cotações e fluxos do ecossistema TravelPro."
      backHref="/master/templates"
      backLabel="Voltar para templates"
      aiActionLabel="Publicar template com IA"
      aiActionDescription="A IA poderá sugerir variáveis, estrutura editorial e compatibilidade com planos."
      primaryActionLabel="Publicar template"
      primaryActionDescription="O novo template oficial foi preparado em modo mockado."
      initialValues={{
        type: "Roteiro",
        category: "Premium",
        scope: "Agências Pro e Scale",
        variables: "cliente, destino, datas, estilo, experiências",
        permissions: "Disponível para Pro e Scale",
        status: "Rascunho",
      }}
      sections={[
        {
          title: "Base do template",
          description: "Contexto suficiente para governança, publicação e expansão futura.",
          fields: [
            { key: "type", label: "Tipo" },
            { key: "category", label: "Categoria" },
            { key: "scope", label: "Escopo" },
            { key: "status", label: "Status" },
            { key: "variables", label: "Variáveis", type: "textarea", rows: 4, colSpan: 2 },
            { key: "permissions", label: "Permissões / plano", type: "textarea", rows: 4, colSpan: 2 },
          ],
        },
      ]}
      previewTitle="Preview do template"
      previewDescription="Leitura rápida do material antes da publicação oficial."
      renderPreview={(values) => (
        <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-primary/75">{values.type}</p>
          <h2 className="mt-2 text-xl font-semibold text-foreground">{values.category}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{values.scope}</p>
          <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-sm text-muted-foreground">
            {values.variables}
          </div>
        </div>
      )}
      sidebarInfo={{
        title: "Leitura de publicação",
        description: "Pronto para biblioteca oficial, IA e distribuição por plano.",
        items: [
          { label: "Status", value: (values) => values.status },
          { label: "Escopo", value: (values) => values.scope },
          { label: "Permissões", value: (values) => values.permissions },
        ],
      }}
    />
  )
}
