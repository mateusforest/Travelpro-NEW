"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AgencyActionButton } from "@/components/system/agency-action-button"
import { Button } from "@/components/ui/button"
import { DedicatedActionWorkspace, type WorkspaceSectionConfig } from "@/components/system/dedicated-action-workspace"
import { DashboardCard } from "@/components/system/dashboard-card"
import { PageShell } from "@/components/system/page-shell"
import { toast } from "@/components/ui/use-toast"
import type { TeamMemberRow } from "@/types/database"

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
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

function buildTeamValues(member?: TeamMemberRow): Record<string, string> {
  return {
    name: member?.name ?? "",
    role: member?.role ?? "AGENCY_SALES",
    scope: member?.scope ?? "Operacional comercial",
    modules: member?.modules ?? "Leads, cotações e Agent",
    status: member?.status ?? "Ativo",
    email: "",
    limits: "Convites e autenticação avançada continuam como próxima etapa. Por enquanto, este registro organiza operação e permissões visuais.",
  }
}

function TeamWorkspaceInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const memberId = searchParams.get("id")
  const isEditing = Boolean(memberId)
  const [member, setMember] = useState<TeamMemberRow | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        setIsLoading(true)
        setLoadError(null)
        const data = memberId ? await fetchJson<TeamMemberRow>(`/api/team/${memberId}`) : null
        if (!active) return
        setMember(data)
      } catch (error) {
        if (!active) return
        setLoadError(error instanceof Error ? error.message : "Nao foi possivel carregar o membro da equipe.")
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [memberId])

  const sections: WorkspaceSectionConfig[] = useMemo(
    () => [
      {
        title: "Dados e acesso",
        description: "Organize o papel, escopo e status do membro dentro da operação da agência.",
        fields: [
          { key: "name", label: "Nome" },
          { key: "role", label: "Função", type: "select", options: ["AGENCY_ADMIN", "AGENCY_SALES", "AGENCY_FINANCE", "AGENCY_OPERATIONAL"] },
          { key: "scope", label: "Escopo visual" },
          { key: "status", label: "Status", type: "select", options: ["Ativo", "Inativo", "Convite pendente"] },
          { key: "modules", label: "Módulos acessíveis", type: "textarea", rows: 4, colSpan: 2 },
          {
            key: "email",
            label: "E-mail do convite",
            description: "O envio real de convite ainda não está integrado ao auth avançado. Este campo serve como contexto operacional.",
          },
          {
            key: "limits",
            label: "Limites e observações",
            type: "textarea",
            rows: 4,
            colSpan: 2,
          },
        ],
      },
    ],
    [],
  )

  if (isLoading) {
    return (
      <PageShell>
        <DashboardCard title="Carregando membro" description="Sincronizando dados reais da equipe.">
          <div className="space-y-3">
            <div className="h-4 w-48 animate-pulse rounded-full bg-white/10" />
            <div className="h-4 w-64 animate-pulse rounded-full bg-white/10" />
          </div>
        </DashboardCard>
      </PageShell>
    )
  }

  if (loadError) {
    return (
      <PageShell>
        <DashboardCard title="Nao foi possivel abrir a equipe" description={loadError}>
          <AgencyActionButton actionType="navigate" href="/app/equipe" className="rounded-full">
            Voltar para equipe
          </AgencyActionButton>
        </DashboardCard>
      </PageShell>
    )
  }

  return (
    <DedicatedActionWorkspace
      title={isEditing ? "Editar membro da equipe" : "Novo membro da equipe"}
      description="Cadastre um membro real para organizar a operação, status e permissões visuais da agência."
      backHref="/app/equipe"
      backLabel="Voltar para equipe"
      aiActionLabel="Configurar com IA"
      aiActionDescription="A sugestão automática de papéis e limites com IA continua como expansão futura."
      primaryActionLabel={isEditing ? "Salvar membro" : "Criar membro agora"}
      hideDraftAction
      hidePreviewAction
      initialValues={buildTeamValues(member ?? undefined)}
      sections={sections}
      previewTitle="Resumo do acesso"
      previewDescription="Leitura rápida da configuração antes de salvar."
      renderPreview={(values) => (
        <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
          <h2 className="text-xl font-semibold text-foreground">{values.name || "Novo membro"}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{values.role || "AGENCY_SALES"} • {values.status || "Ativo"}</p>
          <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-sm text-muted-foreground">
            {values.modules || "Sem módulos definidos"}
          </div>
        </div>
      )}
      sidebarInfo={{
        title: "Leitura de governanca",
        description: "O registro é salvo na base real da equipe. Convite e vínculo de login ficam preparados para depois.",
        items: [
          { label: "Função", value: (values) => values.role || "AGENCY_SALES" },
          { label: "Escopo", value: (values) => values.scope || "Operacional" },
          { label: "Status", value: (values) => values.status || "Ativo" },
        ],
      }}
      extraSidebar={
        <Button
          variant="outline"
          className="rounded-full border-white/10 bg-white/[0.03]"
          onClick={() =>
            toast({
              title: "Convite em breve",
              description: "O envio de convite real será conectado quando o fluxo avançado de auth da equipe for liberado.",
            })
          }
        >
          Enviar convite
        </Button>
      }
      onPrimaryAction={async (values) => {
        if (!values.name.trim() || values.name.trim().length < 2) {
          throw new Error("Informe um nome válido para o membro da equipe.")
        }

        await fetchJson<TeamMemberRow>(isEditing ? `/api/team/${memberId}` : "/api/team", {
          method: isEditing ? "PATCH" : "POST",
          body: JSON.stringify({
            name: values.name.trim(),
            role: values.role || "AGENCY_SALES",
            scope: values.scope.trim() || null,
            modules: values.modules.trim() || null,
            status: values.status || "Ativo",
          }),
        })

        toast({
          title: isEditing ? "Membro atualizado" : "Membro criado",
          description: isEditing
            ? "O membro foi atualizado na base real da equipe."
            : "O membro foi salvo na base real. O convite avançado continua como próxima etapa.",
        })

        router.replace("/app/equipe")
        router.refresh()
      }}
    />
  )
}

export function TeamWorkspace() {
  return (
    <Suspense fallback={null}>
      <TeamWorkspaceInner />
    </Suspense>
  )
}
