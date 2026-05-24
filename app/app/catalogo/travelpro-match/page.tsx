"use client"

import Link from "next/link"
import { BarChart3, ExternalLink, Sparkles, Target, Users } from "lucide-react"
import { PageShell } from "@/components/system/page-shell"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

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
  const fire = (title: string, description: string) => toast({ title, description })

  return (
    <PageShell>
      <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] px-5 py-4 shadow-[0_24px_70px_rgba(0,0,0,0.16)] backdrop-blur-2xl">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-primary/68">Marketplace em preparação</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h1 className="text-base font-semibold text-foreground">TravelPro Match</h1>
              <span className="text-sm text-muted-foreground">Disponível para ativação futura.</span>
            </div>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              O Match será a camada pública de distribuição e descoberta de pacotes, mas ainda não está ativo para operação real.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Desempenho em breve", "A leitura operacional do Match será conectada quando a camada pública do marketplace estiver ativa.")}>
              <BarChart3 className="h-4 w-4" />
              Ver desempenho
            </Button>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" asChild>
              <Link href="/marketplace">
                <ExternalLink className="h-4 w-4" />
                Ver marketplace
              </Link>
            </Button>
            <Button className="rounded-full" onClick={() => fire("Match em breve", "A ativação do TravelPro Match continua planejada para a fase pública do marketplace.")}>
              <Target className="h-4 w-4" />
              Quero ativar
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Estado", "Em breve", "A distribuição pública ainda não está liberada."],
          ["Pacotes elegíveis", "Catálogo ativo", "Seus pacotes publicados poderão alimentar o Match."],
          ["Leads qualificados", "Preparação", "O roteamento comercial será conectado na próxima fase."],
          ["Destaque premium", "Solicitável", "Impulsionamento e score continuam fora do escopo atual."],
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
          title="Distribuição orientada por catálogo"
          description="O Match vai usar o catálogo já publicado pela agência como base de visibilidade, score e geração de oportunidades."
        >
          <div className="grid gap-3 md:grid-cols-2">
            {[
              {
                icon: Sparkles,
                title: "Pacotes em destaque",
                body: "Pacotes publicados poderão ser impulsionados com leitura de aderência e priorização comercial.",
              },
              {
                icon: Users,
                title: "Leads mais qualificados",
                body: "A camada futura vai ajudar a entregar contexto mais útil antes do primeiro atendimento da agência.",
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
          title="O que já está pronto"
          description="Sem números fake: apenas o que o produto já preparou para a evolução do Match."
          actions={
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Destaque em breve", "O destaque do Match será liberado na próxima fase comercial.")}>
              Configurar destaque
            </Button>
          }
        >
          <div className="space-y-3">
            {[
              "Catálogo público já conectado como origem de pacotes.",
              "Vitrine pública pronta para alimentar descoberta futura.",
              "Expansão comercial ainda sem backend de score, impulso ou roteamento.",
              "Ativação seguirá com solicitação comercial, não com cobrança fake.",
            ].map((item) => (
              <div key={item} className="rounded-[24px] border border-white/8 bg-black/10 px-4 py-3.5 text-sm leading-6 text-muted-foreground">
                {item}
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button className="rounded-full" onClick={() => fire("Solicitação registrada", "Seu interesse no Match foi registrado para ativação futura.")}>
              Enviar interesse
            </Button>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fire("Envio em breve", "O envio de pacotes ao Match será liberado quando a distribuição pública estiver ativa.")}>
              Enviar pacotes ao Match
            </Button>
          </div>
        </MatchPanel>
      </div>
    </PageShell>
  )
}
