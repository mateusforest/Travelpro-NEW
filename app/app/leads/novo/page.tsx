"use client"

import { useRouter } from "next/navigation"
import { DedicatedActionWorkspace } from "@/components/system/dedicated-action-workspace"
import { toast } from "@/components/ui/use-toast"

export default function NewLeadWorkspacePage() {
  const router = useRouter()

  return (
    <DedicatedActionWorkspace
      title="Novo lead"
      description="Cadastre uma nova oportunidade com contexto comercial suficiente para follow-up e qualificação."
      backHref="/app/leads"
      backLabel="Voltar para leads"
      aiActionLabel="Qualificar com IA"
      aiActionDescription="O assistente poderá estruturar intenção, temperatura e próximos passos automaticamente."
      primaryActionLabel="Salvar lead"
      draftActionDescription="Rascunhos de leads serão ativados em uma próxima etapa."
      previewActionDescription="O preview completo da oportunidade será expandido em uma próxima etapa."
      initialValues={{
        name: "",
        email: "",
        phone: "",
        origin: "Instagram",
        destination: "",
        temperature: "Morno",
        status: "Novo lead",
        notes: "",
      }}
      sections={[
        {
          title: "Dados comerciais",
          description: "Base do lead e contexto inicial da oportunidade.",
          fields: [
            { key: "name", label: "Nome do lead" },
            { key: "email", label: "E-mail" },
            { key: "phone", label: "Telefone" },
            { key: "origin", label: "Origem" },
            { key: "destination", label: "Destino" },
            { key: "temperature", label: "Temperatura", type: "select", options: ["Frio", "Morno", "Quente"] },
            { key: "status", label: "Status", type: "select", options: ["Novo lead", "Em qualificação", "Cotação enviada", "Aguardando retorno", "Fechado"] },
            { key: "notes", label: "Observações", type: "textarea", rows: 4, colSpan: 2 },
          ],
        },
      ]}
      previewTitle="Score comercial"
      previewDescription="Leitura rápida da oportunidade para operação e IA."
      renderPreview={(values) => (
        <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-primary/75">{values.temperature || "Morno"}</p>
          <h2 className="mt-2 text-xl font-semibold text-foreground">{values.name || "Novo lead"}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{values.destination || "Destino em definição"} • {values.origin || "Origem não informada"}</p>
          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-sm text-muted-foreground">
              Status: {values.status || "Novo lead"}
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-sm text-muted-foreground">
              {values.notes || "Sem observações adicionais registradas."}
            </div>
          </div>
        </div>
      )}
      sidebarInfo={{
        title: "Qualificação sugerida",
        description: "Base pronta para funil, Agent e futuras automações.",
        items: [
          { label: "Temperatura", value: (values) => values.temperature || "Morno" },
          { label: "Origem", value: (values) => values.origin || "Não informada" },
          { label: "Status", value: (values) => values.status || "Novo lead" },
        ],
      }}
      helpCard={{
        title: "Checklist comercial",
        description: "Campos simples, mas com contexto suficiente para o próximo passo da equipe.",
        steps: [
          "Defina a origem corretamente para medir aquisição.",
          "Use destino e temperatura como base para o primeiro contato.",
          "Registre observações que ajudem a proposta e o follow-up.",
        ],
      }}
      onPrimaryAction={async (values) => {
        try {
          if (!values.name.trim() || values.name.trim().length < 2) {
            throw new Error("Informe um nome válido para o lead antes de salvar.")
          }

          const response = await fetch("/api/leads", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: values.name.trim(),
              email: values.email || null,
              phone: values.phone || null,
              origin: values.origin || null,
              destination: values.destination || null,
              status: values.status || "Novo lead",
              temperature: values.temperature || "Morno",
              notes: values.notes || null,
            }),
          })

          const payload = (await response.json().catch(() => null)) as { error?: string } | null

          if (!response.ok) {
            throw new Error(payload?.error || "Não foi possível salvar o lead.")
          }

          toast({
            title: "Lead salvo",
            description: "O lead foi criado no Supabase e já está disponível na operação.",
          })

          router.replace("/app/leads")
          router.refresh()
        } catch (error) {
          if (process.env.NODE_ENV !== "production") {
            console.error("[NewLeadWorkspacePage] failed to create lead", error)
          }
          throw error
        }
      }}
    />
  )
}
