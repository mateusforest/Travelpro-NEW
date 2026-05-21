"use client"

import { useRouter } from "next/navigation"
import { DedicatedActionWorkspace } from "@/components/system/dedicated-action-workspace"
import { FeatureExplanationCard } from "@/components/system/feature-explanation-card"
import { toast } from "@/components/ui/use-toast"

export default function NewClientWorkspacePage() {
  const router = useRouter()

  return (
    <DedicatedActionWorkspace
      title="Novo cliente"
      description="Crie um perfil mais completo para relacionamento, operação, IA e futuras jornadas de viagem."
      backHref="/app/clientes"
      backLabel="Voltar para clientes"
      aiActionLabel="Cadastrar com IA"
      aiActionDescription="O assistente IA poderá transformar briefing e mensagens em cadastro estruturado."
      primaryActionLabel="Salvar cliente"
      draftActionDescription="Rascunhos de clientes ainda não são persistidos. Use “Salvar cliente” para criar o registro real no Supabase."
      initialValues={{
        name: "Marina Costa",
        email: "marina@cliente.com",
        phone: "+55 11 97777-0001",
        origin: "Instagram",
        destination: "Santorini",
        tag: "Premium",
        documentNumber: "Passaporte BR4455667",
        companions: "1 acompanhante",
        preferences: "Hotel boutique, ritmo equilibrado e experiências gastronômicas.",
        notes: "Cliente responde melhor no WhatsApp à noite.",
        nextStep: "Agendar primeira call consultiva",
        travelerProfile: "Casal premium com interesse em Europa e viagens autorais.",
        recommendations: "Santorini Honeymoon, Paris Signature, Toscana Private",
      }}
      sections={[
        {
          title: "Dados principais",
          description: "Base do contato e leitura inicial do relacionamento.",
          fields: [
            { key: "name", label: "Nome do cliente" },
            { key: "email", label: "E-mail" },
            { key: "phone", label: "Telefone" },
            { key: "origin", label: "Origem" },
            { key: "destination", label: "Destino em foco" },
            { key: "tag", label: "Segmento" },
            { key: "documentNumber", label: "Documento principal" },
            { key: "companions", label: "Acompanhantes" },
          ],
        },
        {
          title: "Preferências e contexto",
          description: "Informações que ajudam a operação e a IA a personalizar a jornada.",
          fields: [
            { key: "preferences", label: "Preferências de viagem", type: "textarea", rows: 4, colSpan: 2 },
            { key: "travelerProfile", label: "Perfil do viajante", type: "textarea", rows: 4, colSpan: 2 },
            { key: "recommendations", label: "Recomendações iniciais", type: "textarea", rows: 4, colSpan: 2 },
          ],
        },
        {
          title: "Próximo passo",
          description: "Defina o que acontece após o cadastro.",
          fields: [
            { key: "nextStep", label: "Próximo passo" },
            { key: "notes", label: "Observações", type: "textarea", rows: 4 },
          ],
        },
      ]}
      previewTitle="Resumo do cliente"
      previewDescription="Preview rápido do perfil comercial e operacional."
      renderPreview={(values) => (
        <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-primary/75">{values.tag || "Cliente premium"}</p>
          <h2 className="mt-2 text-xl font-semibold text-foreground">{values.name}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{values.email} • {values.phone}</p>
          <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.04] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-primary/75">Origem e próximo passo</p>
            <p className="mt-2 text-sm text-muted-foreground">{values.origin}</p>
            <p className="mt-2 text-sm text-foreground">{values.nextStep}</p>
          </div>
        </div>
      )}
      sidebarInfo={{
        title: "Leitura rápida",
        description: "Esse cadastro já prepara CRM, viagens e futuras automações.",
        items: [
          { label: "Origem", value: (values) => values.origin, hint: "Ajuda a medir aquisição e campanhas." },
          { label: "Perfil", value: (values) => values.tag || "Premium consultivo", hint: "Bom para catálogo e ofertas personalizadas." },
          { label: "Próximo passo", value: (values) => values.nextStep, hint: "Mantém a operação previsível." },
        ],
      }}
      extraSidebar={
        <FeatureExplanationCard
          title="O que este workspace resolve"
          description="O cliente deixa de ser só um contato e passa a ser base de relacionamento inteligente."
          items={[
            { title: "Operação mais rica", body: "Preferências e observações ficam prontas para roteiros, cotações e follow-ups." },
            { title: "Base para IA", body: "O perfil do viajante pode orientar recomendações, mensagens e campanhas futuras." },
          ]}
        />
      }
      helpCard={{
        title: "Como usar melhor",
        description: "Quanto melhor o contexto, melhor a personalização do TravelPro.",
        steps: [
          "Registre origem e preferências para orientar ofertas e priorização comercial.",
          "Use o próximo passo para deixar claro o movimento seguinte da operação.",
          "Descreva o perfil do viajante de forma simples e acionável.",
        ],
      }}
      onPrimaryAction={async (values) => {
        try {
          const response = await fetch("/api/clients", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: values.name,
              email: values.email || null,
              phone: values.phone || null,
              document_number: values.documentNumber || null,
              status: "Ativo",
              traveler_profile: {
                origin: values.origin,
                destination: values.destination,
                tag: values.tag,
                companions: values.companions,
                preferences: values.preferences,
                travelerProfile: values.travelerProfile,
                nextStep: values.nextStep,
                notes: values.notes,
                recommendations: values.recommendations
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean),
              },
            }),
          })

          const payload = (await response.json().catch(() => null)) as { error?: string } | null

          if (!response.ok) {
            throw new Error(payload?.error || "Não foi possível salvar o cliente.")
          }

          toast({
            title: "Cliente salvo",
            description: "O cliente foi criado no Supabase e já está disponível na base da agência.",
          })

          router.replace("/app/clientes")
          router.refresh()
        } catch (error) {
          if (process.env.NODE_ENV !== "production") {
            console.error("[NewClientWorkspacePage] failed to create client", error)
          }
          throw error
        }
      }}
    />
  )
}
