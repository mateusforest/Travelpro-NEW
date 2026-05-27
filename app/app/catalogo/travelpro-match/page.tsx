"use client"

import Link from "next/link"
import { BarChart3, ExternalLink, Sparkles, Target, Users } from "lucide-react"
import { AgencyActionButton } from "@/components/system/agency-action-button"
import { PageShell } from "@/components/system/page-shell"
import { Button } from "@/components/ui/button"

function MatchPanel({
  eyebrow,
  title,
  description,
  children,
  actions,
}: {
  eyebrow: string
  title: string
  description: string
  children: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <section className="rounded-[30px] border border-white/8 bg-white/[0.03] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.16)] backdrop-blur-2xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-primary/70">{eyebrow}</p>
          <h2 className="mt-1.5 text-lg font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

export default function AgencyCatalogMatchPage() {
  return (
    <PageShell>
      <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] px-5 py-4 shadow-[0_24px_70px_rgba(0,0,0,0.16)] backdrop-blur-2xl">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-primary/68">Marketplace em preparacao</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h1 className="text-base font-semibold text-foreground">TravelPro Match</h1>
              <span className="text-sm text-muted-foreground">Disponivel para ativacao futura.</span>
            </div>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              O Match sera a camada publica de distribuicao e descoberta de pacotes, mas ainda nao esta ativo para operacao real.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <AgencyActionButton
              actionType="future"
              variant="outline"
              className="rounded-full border-white/10 bg-white/[0.03]"
              futureMessage="A leitura operacional do Match sera conectada quando a camada publica do marketplace estiver ativa."
              icon={<BarChart3 className="h-4 w-4" />}
            >
              Ver desempenho
            </AgencyActionButton>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" asChild>
              <Link href="/marketplace">
                <ExternalLink className="h-4 w-4" />
                Ver marketplace
              </Link>
            </Button>
            <AgencyActionButton
              actionType="future"
              className="rounded-full"
              futureMessage="A ativacao do TravelPro Match continua planejada para a fase publica do marketplace."
              icon={<Target className="h-4 w-4" />}
            >
              Quero ativar
            </AgencyActionButton>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Estado", "Em breve", "A distribuicao publica ainda nao esta liberada."],
          ["Pacotes elegiveis", "Catalogo ativo", "Seus pacotes publicados poderao alimentar o Match."],
          ["Leads qualificados", "Preparacao", "O roteamento comercial sera conectado na proxima fase."],
          ["Destaque premium", "Solicitavel", "Impulsionamento e score continuam fora do escopo atual."],
        ].map(([label, value, hint]) => (
          <div key={label} className="rounded-[24px] border border-white/8 bg-white/[0.03] px-4 py-3 shadow-[0_14px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl">
            <p className="text-[11px] uppercase tracking-[0.18em] text-primary/70">{label}</p>
            <p className="mt-2 text-xl font-semibold text-foreground">{value}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.02fr_0.98fr]">
        <MatchPanel
          eyebrow="Como vai funcionar"
          title="Distribuicao orientada por catalogo"
          description="O Match vai usar o catalogo ja publicado pela agencia como base de visibilidade, score e geracao de oportunidades."
        >
          <div className="grid gap-3 md:grid-cols-2">
            {[
              {
                icon: Sparkles,
                title: "Pacotes em destaque",
                body: "Pacotes publicados poderao ser impulsionados com leitura de aderencia e priorizacao comercial.",
              },
              {
                icon: Users,
                title: "Leads mais qualificados",
                body: "A camada futura vai ajudar a entregar contexto mais util antes do primeiro atendimento da agencia.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-[24px] border border-white/8 bg-black/10 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-2">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </MatchPanel>

        <MatchPanel
          eyebrow="Estado honesto"
          title="O que ja esta pronto"
          description="Sem numeros fake: apenas o que o produto ja preparou para a evolucao do Match."
          actions={
            <AgencyActionButton
              actionType="future"
              variant="outline"
              className="rounded-full border-white/10 bg-white/[0.03]"
              futureMessage="O destaque do Match sera liberado na proxima fase comercial."
            >
              Configurar destaque
            </AgencyActionButton>
          }
        >
          <div className="space-y-3">
            {[
              "Catalogo publico ja conectado como origem de pacotes.",
              "Vitrine publica pronta para alimentar descoberta futura.",
              "Expansao comercial ainda sem backend de score, impulso ou roteamento.",
              "Ativacao seguira com solicitacao comercial, nao com cobranca fake.",
            ].map((item) => (
              <div key={item} className="rounded-[24px] border border-white/8 bg-black/10 px-4 py-3.5 text-sm leading-6 text-muted-foreground">
                {item}
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <AgencyActionButton
              actionType="future"
              className="rounded-full"
              futureMessage="Seu interesse no Match foi registrado para ativacao futura."
            >
              Enviar interesse
            </AgencyActionButton>
            <AgencyActionButton
              actionType="future"
              variant="outline"
              className="rounded-full border-white/10 bg-white/[0.03]"
              futureMessage="O envio de pacotes ao Match sera liberado quando a distribuicao publica estiver ativa."
            >
              Enviar pacotes ao Match
            </AgencyActionButton>
          </div>
        </MatchPanel>
      </div>
    </PageShell>
  )
}
