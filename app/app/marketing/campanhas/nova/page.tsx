"use client"

import { DedicatedActionWorkspace } from "@/components/system/dedicated-action-workspace"

export default function NewCampaignWorkspacePage() {
  return (
    <DedicatedActionWorkspace
      title="Nova campanha"
      description="Crie uma campanha com objetivo, público, canal e preview pronto para ativação."
      backHref="/app/marketing"
      backLabel="Voltar para marketing"
      aiActionLabel="Criar campanha com IA"
      aiActionDescription="A IA poderá montar texto, CTA e estrutura de campanha a partir do pacote selecionado."
      primaryActionLabel="Salvar campanha"
      primaryActionDescription="A nova campanha foi preparada em modo mockado."
      initialValues={{
        objective: "Gerar leads qualificados",
        audience: "Casais 30+ com interesse em viagens premium",
        package: "Lisboa Signature Escape",
        channel: "Instagram + WhatsApp",
        tone: "Consultivo elegante",
        cta: "Falar com consultor",
      }}
      sections={[
        {
          title: "Estratégia da campanha",
          description: "O suficiente para transformar um pacote em material promocional acionável.",
          fields: [
            { key: "objective", label: "Objetivo" },
            { key: "audience", label: "Público" },
            { key: "package", label: "Pacote / viagem relacionada" },
            { key: "channel", label: "Canal" },
            { key: "tone", label: "Tom" },
            { key: "cta", label: "CTA" },
          ],
        },
      ]}
      previewTitle="Preview da campanha"
      previewDescription="Como a campanha pode se apresentar comercialmente."
      renderPreview={(values) => (
        <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
          <h2 className="text-xl font-semibold text-foreground">{values.package}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{values.objective}</p>
          <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-sm text-muted-foreground">
            Canal: {values.channel} • CTA: {values.cta}
          </div>
        </div>
      )}
      sidebarInfo={{
        title: "Leitura promocional",
        description: "Base pronta para calendário, distribuição e IA futura.",
        items: [
          { label: "Público", value: (values) => values.audience },
          { label: "Canal", value: (values) => values.channel },
          { label: "Tom", value: (values) => values.tone },
        ],
      }}
    />
  )
}
