"use client"

import { useRouter } from "next/navigation"
import { DedicatedActionWorkspace } from "@/components/system/dedicated-action-workspace"
import { toast } from "@/components/ui/use-toast"

async function requestJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })

  const payload = (await response.json().catch(() => null)) as { error?: string } | T | null
  if (!response.ok) {
    throw new Error((payload as { error?: string } | null)?.error || "Nao foi possivel concluir a operacao.")
  }

  return payload as T
}

export default function NewAgencyWorkspacePage() {
  const router = useRouter()

  return (
    <DedicatedActionWorkspace
      title="Nova agência"
      description="Crie uma agência real com estrutura mínima, responsável e contexto operacional básico."
      backHref="/master/agencias"
      backLabel="Voltar para agências"
      aiActionLabel="Configurar com IA"
      aiActionDescription="A configuração assistida com IA continua futura no Master e não será implementada nesta etapa."
      primaryActionLabel="Salvar agência"
      hideDraftAction
      initialValues={{
        name: "",
        owner: "",
        email: "",
        phone: "",
        city: "",
        plan: "Pro",
        modules: "Catálogo, documentos, relatórios",
        notes: "",
      }}
      sections={[
        {
          title: "Base da agência",
          description: "Campos realmente persistidos ou guardados com segurança no metadata da agência.",
          fields: [
            { key: "name", label: "Nome da agência" },
            { key: "owner", label: "Responsável" },
            { key: "email", label: "E-mail" },
            { key: "phone", label: "Telefone" },
            { key: "city", label: "Cidade / região" },
            { key: "plan", label: "Plano desejado", type: "select", options: ["Start", "Pro", "Scale", "Enterprise"] },
            { key: "modules", label: "Módulos previstos", type: "textarea", rows: 4, colSpan: 2 },
            { key: "notes", label: "Observações internas", type: "textarea", rows: 4, colSpan: 2 },
          ],
        },
      ]}
      previewTitle="Resumo da agência"
      previewDescription="Visão rápida da ativação antes de salvar na base real."
      renderPreview={(values) => (
        <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
          <h2 className="text-xl font-semibold text-foreground">{values.name || "Agência sem nome"}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{values.owner || "Sem responsável"} • {values.city || "Sem cidade"}</p>
          <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-sm text-muted-foreground">
            Plano {values.plan || "Pro"} • {values.modules || "Sem módulos descritos"}
          </div>
        </div>
      )}
      sidebarInfo={{
        title: "Leitura de onboarding",
        description: "A assinatura real pode entrar depois; nesta etapa a agência já nasce persistida e disponível no Master.",
        items: [
          { label: "Plano desejado", value: (values) => values.plan || "Pro" },
          { label: "Cidade", value: (values) => values.city || "Não informada" },
          { label: "Contato", value: (values) => values.email || "Sem e-mail" },
        ],
      }}
      onPrimaryAction={async (values) => {
        if (!values.name.trim() || values.name.trim().length < 2) {
          throw new Error("Informe um nome válido para a agência.")
        }

        await requestJson("/api/master/agencies", {
          method: "POST",
          body: JSON.stringify({
            name: values.name.trim(),
            owner_name: values.owner.trim() || null,
            owner_email: values.email.trim() || null,
            phone: values.phone.trim() || null,
            city: values.city.trim() || null,
            requested_plan: values.plan.trim() || null,
            modules: values.modules.trim() || null,
            notes: values.notes.trim() || null,
            status: "active",
          }),
        })

        toast({
          title: "Agência criada",
          description: "A nova agência foi salva no Supabase e já aparece na base do Master.",
        })

        router.replace("/master/agencias")
        router.refresh()
      }}
    />
  )
}
