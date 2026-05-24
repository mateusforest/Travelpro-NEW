"use client"

import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { CreditCard, HelpCircle, Layers3, ShieldCheck, Sparkles } from "lucide-react"
import { PageShell } from "@/components/system/page-shell"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

function PlanSection({
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  actions?: ReactNode
  children: ReactNode
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

function MetricStrip({
  items,
}: {
  items: { label: string; value: string; hint: string; tone?: "default" | "success" | "warning" }[]
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className={`rounded-[24px] border px-4 py-3 shadow-[0_14px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl ${
            item.tone === "success"
              ? "border-emerald-400/15 bg-emerald-400/[0.07]"
              : item.tone === "warning"
                ? "border-amber-400/15 bg-amber-400/[0.07]"
                : "border-white/8 bg-white/[0.03]"
          }`}
        >
          <p className="text-[11px] uppercase tracking-[0.18em] text-primary/70">{item.label}</p>
          <p className="mt-2 text-xl font-semibold tracking-tight text-foreground">{item.value}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.hint}</p>
        </div>
      ))}
    </div>
  )
}

export default function AgencyPlansWorkspacePage() {
  const router = useRouter()
  const fire = (title: string, description: string) => toast({ title, description })

  const plans = [
    {
      name: "Start",
      price: "R$ 497/mês",
      limits: "3 usuários • 1.500 créditos",
      features: ["Catálogo público", "Central operacional", "WhatsApp essencial"],
    },
    {
      name: "Pro",
      price: "R$ 997/mês",
      limits: "6 usuários • 3.500 créditos",
      features: ["Roteiros premium", "Documentos inteligentes", "Atlas assistido"],
    },
    {
      name: "Scale",
      price: "R$ 1.490/mês",
      limits: "8 usuários • 6.000 créditos",
      features: ["TravelPro Go completo", "Automações premium", "Equipe e financeiro"],
      current: true,
    },
  ]

  const extras = [
    { title: "Créditos IA", description: "+2.000 créditos com ativação imediata", cta: "Solicitar pacote" },
    { title: "Usuários extras", description: "+2 licenças para comercial ou operação", cta: "Solicitar expansão" },
    { title: "TravelPro Match e Agent", description: "Mais distribuição, qualificação e jornada comercial assistida.", cta: "Quero ativar" },
    { title: "WhatsApp / Go", description: "Expansão operacional e de comunicação sem depender de workarounds.", cta: "Liberar módulo" },
  ]

  return (
    <PageShell>
      <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] px-5 py-4 shadow-[0_24px_70px_rgba(0,0,0,0.16)] backdrop-blur-2xl">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-primary/68">Plano e billing</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h1 className="text-base font-semibold text-foreground">Planos, pacotes e expansões</h1>
              <span className="text-sm text-muted-foreground">Scale ativo hoje.</span>
            </div>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Leitura clara do plano atual, limites, créditos e caminhos de ativação sem criar cobrança fake.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="rounded-full border-white/10 bg-white/[0.03]"
              onClick={() =>
                fire("FAQ em breve", "A central de perguntas frequentes desta área será publicada em uma próxima etapa.")
              }
            >
              <HelpCircle className="h-4 w-4" />
              Ver perguntas frequentes
            </Button>
            <Button className="rounded-full" onClick={() => router.push("/app/creditos")}>
              <CreditCard className="h-4 w-4" />
              Comprar créditos
            </Button>
          </div>
        </div>
      </div>

      <MetricStrip
        items={[
          { label: "Plano atual", value: "Scale", hint: "Cobertura completa para operação, equipe e expansões.", tone: "success" },
          { label: "Uso atual", value: "68%", hint: "Boa margem para campanhas e operação da semana." },
          { label: "Créditos", value: "2.140", hint: "Consumo mais alto em Agent e TravelPro Go." },
          { label: "Renovação", value: "28 mai 2026", hint: "Cobrança automática ainda em preparação.", tone: "warning" },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <PlanSection
          eyebrow="Comparativo premium"
          title="Escolha e evolução do plano"
          description="Uma visão simples do que cada faixa destrava no ecossistema TravelPro."
        >
          <div className="grid gap-3 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-[26px] border p-4 ${
                  plan.current
                    ? "border-primary/20 bg-primary/[0.07] shadow-[0_0_28px_rgba(255,122,0,0.08)]"
                    : "border-white/8 bg-black/10"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-foreground">{plan.name}</p>
                    <p className="mt-1 text-sm text-primary">{plan.price}</p>
                  </div>
                  {plan.current ? (
                    <span className="rounded-full border border-primary/15 bg-primary/10 px-2.5 py-1 text-[10px] font-medium tracking-[0.18em] text-primary">
                      Atual
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm leading-5 text-muted-foreground">{plan.limits}</p>
                <div className="mt-4 space-y-2">
                  {plan.features.map((feature) => (
                    <div key={feature} className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2 text-[13px] text-foreground">
                      {feature}
                    </div>
                  ))}
                </div>
                <Button
                  className="mt-4 w-full rounded-full"
                  variant={plan.current ? "outline" : "default"}
                  onClick={() =>
                    fire(
                      plan.current ? "Plano atual ativo" : `Solicitação de ${plan.name}`,
                      plan.current
                        ? "Este é o plano hoje vinculado à sua agência."
                        : "A solicitação de upgrade será tratada pelo time comercial enquanto o billing oficial é conectado."
                    )
                  }
                >
                  {plan.current ? "Ver detalhes" : "Solicitar upgrade"}
                </Button>
              </div>
            ))}
          </div>
        </PlanSection>

        <div className="space-y-4">
          <PlanSection
            eyebrow="Leitura atual"
            title="Capacidade e expansões"
            description="Resumo rápido do que já está disponível e do que pode ser ativado a seguir."
          >
            <div className="space-y-3">
              {[
                { icon: ShieldCheck, title: "Plano protegido", body: "Assinatura ativa e saudável para a operação atual." },
                { icon: Sparkles, title: "Expansões incluídas", body: "TravelPro Go, Agent e automações seguem mapeados por disponibilidade." },
                { icon: Layers3, title: "Próximas ativações", body: "Billing, WhatsApp oficial e upgrades instantâneos entram na próxima fase." },
              ].map((item) => (
                <div key={item.title} className="rounded-[24px] border border-white/8 bg-black/10 px-4 py-3.5">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-2xl border border-white/10 bg-white/[0.04] p-2">
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
          </PlanSection>

          <PlanSection
            eyebrow="Pacotes extras"
            title="Ativações adicionais"
            description="Recursos extras para crescimento, distribuição e inteligência operacional."
          >
            <div className="space-y-3">
              {extras.map((item) => (
                <div key={item.title} className="rounded-[24px] border border-white/8 bg-black/10 px-4 py-3.5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
                    </div>
                    <Button className="rounded-full" onClick={() => fire(item.title, "A ativação segura desse extra será tratada pelo suporte enquanto o billing oficial entra na próxima etapa.")}>
                      {item.cta}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </PlanSection>
        </div>
      </div>
    </PageShell>
  )
}
