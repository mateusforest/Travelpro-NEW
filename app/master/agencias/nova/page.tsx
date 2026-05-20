"use client"

import { DedicatedActionWorkspace } from "@/components/system/dedicated-action-workspace"

export default function NewAgencyWorkspacePage() {
  return (
    <DedicatedActionWorkspace
      title="Nova agência"
      description="Crie uma agência com estrutura mínima para operação, plano, branding e governança."
      backHref="/master/agencias"
      backLabel="Voltar para agências"
      aiActionLabel="Configurar com IA"
      aiActionDescription="A IA poderá sugerir plano, módulos iniciais e estrutura de ativação da agência."
      primaryActionLabel="Salvar agência"
      primaryActionDescription="A nova agência foi preparada em modo mockado."
      initialValues={{
        name: "Norte Premium Travel",
        owner: "Camila Duarte",
        email: "camila@nortepremium.com",
        city: "Manaus",
        plan: "Pro",
        modules: "Catálogo, documentos, Match e Agent",
        notes: "Agência focada em premium e internacional.",
      }}
      sections={[
        {
          title: "Base da agência",
          description: "Campos iniciais para ativação no ecossistema TravelPro.",
          fields: [
            { key: "name", label: "Nome da agência" },
            { key: "owner", label: "Responsável" },
            { key: "email", label: "E-mail" },
            { key: "city", label: "Cidade / região" },
            { key: "plan", label: "Plano" },
            { key: "modules", label: "Módulos ativos", type: "textarea", rows: 4, colSpan: 2 },
            { key: "notes", label: "Observações", type: "textarea", rows: 4, colSpan: 2 },
          ],
        },
      ]}
      previewTitle="Resumo da agência"
      previewDescription="Visão rápida de ativação e configuração inicial."
      renderPreview={(values) => (
        <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
          <h2 className="text-xl font-semibold text-foreground">{values.name}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{values.owner} • {values.city}</p>
          <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-sm text-muted-foreground">
            Plano {values.plan} • {values.modules}
          </div>
        </div>
      )}
      sidebarInfo={{
        title: "Leitura de onboarding",
        description: "Pronto para ativação de conta, módulos e governança inicial.",
        items: [
          { label: "Plano", value: (values) => values.plan },
          { label: "Cidade", value: (values) => values.city },
          { label: "Módulos", value: (values) => values.modules },
        ],
      }}
    />
  )
}
