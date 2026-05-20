"use client"

import { DedicatedActionWorkspace } from "@/components/system/dedicated-action-workspace"

export default function NewTeamMemberWorkspacePage() {
  return (
    <DedicatedActionWorkspace
      title="Novo membro da equipe"
      description="Convide uma pessoa com contexto, papel, permissões e acesso preparados para a operação."
      backHref="/app/equipe"
      backLabel="Voltar para equipe"
      aiActionLabel="Configurar com IA"
      aiActionDescription="A IA poderá sugerir permissões, módulos e limites conforme o papel operacional."
      primaryActionLabel="Salvar membro"
      primaryActionDescription="O novo membro foi preparado em modo mockado."
      initialValues={{
        name: "Livia Martins",
        email: "livia@agencia.com",
        role: "AGENCY_SALES",
        permissions: "Leads, cotações e Agent",
        limits: "Sem acesso a billing e configurações críticas",
        access: "Operacional comercial",
      }}
      sections={[
        {
          title: "Dados e acessos",
          description: "Convite inicial e escopo da pessoa dentro da agência.",
          fields: [
            { key: "name", label: "Nome" },
            { key: "email", label: "E-mail" },
            { key: "role", label: "Função" },
            { key: "access", label: "Acesso" },
            { key: "permissions", label: "Permissões", type: "textarea", rows: 4, colSpan: 2 },
            { key: "limits", label: "Limites", type: "textarea", rows: 4, colSpan: 2 },
          ],
        },
      ]}
      previewTitle="Resumo do acesso"
      previewDescription="Leitura rápida do convite antes do envio."
      renderPreview={(values) => (
        <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
          <h2 className="text-xl font-semibold text-foreground">{values.name}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{values.role}</p>
          <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-sm text-muted-foreground">
            {values.permissions}
          </div>
        </div>
      )}
      sidebarInfo={{
        title: "Leitura de governança",
        description: "Convite preparado para operação, segurança e futura automação de acessos.",
        items: [
          { label: "Função", value: (values) => values.role },
          { label: "Acesso", value: (values) => values.access },
          { label: "Convite", value: "Pronto para envio" },
        ],
      }}
    />
  )
}
