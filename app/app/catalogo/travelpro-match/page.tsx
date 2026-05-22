"use client"

import Link from "next/link"
import { BarChart3, MessageSquareText, Sparkles, Target, TrendingUp, Users, ExternalLink } from "lucide-react"
import { DashboardCard } from "@/components/system/dashboard-card"
import { FeatureExplanationCard } from "@/components/system/feature-explanation-card"
import { PageShell } from "@/components/system/page-shell"
import { PrimaryButton } from "@/components/system/primary-button"
import { SecondaryButton } from "@/components/system/secondary-button"
import { SectionHeader } from "@/components/system/section-header"
import { SmartActionButton } from "@/components/system/smart-action-button"
import { toast } from "@/components/ui/use-toast"

export default function AgencyCatalogMatchPage() {
  const fire = (title: string, description: string) => toast({ title, description })

  return (
    <PageShell>
      <SectionHeader
        title="TravelPro Match"
        description="Marketplace inteligente para divulgar pacotes e receber leads qualificados."
        actions={
          <>
            <SmartActionButton label="Configurar com IA" description="A IA poderá sugerir score, distribuição e melhorias para os pacotes do Match." />
            <SecondaryButton onClick={() => fire("Desempenho em breve", "A leitura operacional do Match será conectada quando a camada pública do marketplace estiver ativa.")}>
              <BarChart3 className="h-4 w-4" />
              Ver desempenho
            </SecondaryButton>
            <SecondaryButton onClick={() => fire("Destaque em breve", "O destaque do Match será liberado quando a distribuição comercial entrar na próxima fase.")}>
              <Sparkles className="h-4 w-4" />
              Configurar destaque
            </SecondaryButton>
            <SecondaryButton asChild>
              <Link href="/marketplace">
                <ExternalLink className="h-4 w-4" />
                Ver marketplace
              </Link>
            </SecondaryButton>
            <PrimaryButton onClick={() => fire("Match em breve", "A ativação do TravelPro Match continua planejada para a fase pública do marketplace.")}>
              <Target className="h-4 w-4" />
              Ativar no Match
            </PrimaryButton>
          </>
        }
      />

      <FeatureExplanationCard
        title="Como o Match se conecta ao ecossistema"
        description="O Match não é só vitrine: ele funciona como base de distribuição, score e geração de leads qualificados."
        items={[
          { title: "Marketplace inteligente", body: "Recebe pacotes do catálogo, distribui visibilidade e gera leads com prioridade comercial." },
          { title: "Base para IA e performance", body: "Os dados daqui orientam score, destaque, distribuição e futuras sugestões automáticas." },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[
          ["Status no Match", "Ativo"],
          ["Pacotes enviados", "12"],
          ["Leads recebidos", "84"],
          ["Visualizações", "2.480"],
          ["Score médio", "78%"],
          ["Cliques no WhatsApp", "214"],
          ["Conversões estimadas", "17,8%"],
        ].map(([label, value], index) => (
          <div key={`${label}-${index}`} className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-primary/75">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardCard title="Pacotes enviados ao Match" description="Catálogo publicado com distribuição para o marketplace.">
          <div className="space-y-3">
            {[
              "Maldivas Signature",
              "Inverno em Gramado",
              "Cancún Family Escape",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                <p className="text-sm font-medium text-foreground">{item}</p>
                <p className="mt-1 text-xs text-muted-foreground">Publicado no Match com score ativo e rastreio de leads.</p>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title="Desempenho dos pacotes" description="Leitura rápida do que está ganhando tração.">
          <div className="space-y-3">
            {[
              ["Maldivas Signature", "91% de score", "24 leads"],
              ["Inverno em Gramado", "82% de score", "18 leads"],
              ["Cancún Family Escape", "79% de score", "12 leads"],
            ].map(([name, score, leads], index) => (
              <div key={`${name}-${index}`} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">{name}</p>
                  <span className="rounded-full border border-primary/15 bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary">{score}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{leads}</p>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title="Leads recebidos" description="Fila mockada de oportunidades vindas do ecossistema.">
          <div className="space-y-3">
            {[
              ["Carla Dias", "Maldivas", "Lead quente"],
              ["Marcos Lima", "Gramado", "Em análise"],
              ["Bianca Costa", "Cancún", "Aguardando retorno"],
            ].map(([name, destination, status], index) => (
              <div key={`${name}-${index}`} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">{name}</p>
                  <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-muted-foreground">{status}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{destination}</p>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title="Destaque e configurações" description="Impulsionamento, vitrine e preferências do Match.">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-foreground">Destaque premium</p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">2 campanhas ativas com visibilidade acima da média.</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <div className="flex items-center gap-3">
                <MessageSquareText className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-foreground">Cliques no WhatsApp</p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">214 cliques gerados a partir da vitrine e do Match.</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-foreground">Lead score</p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Priorização automática para leads mais aderentes.</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-foreground">Conversão estimada</p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Curva saudável com espaço para impulsionamento adicional.</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <PrimaryButton onClick={() => fire("Envio em breve", "O envio de pacotes ao Match será liberado quando a distribuição pública estiver ativa.")}>
              <Sparkles className="h-4 w-4" />
              Enviar pacotes ao Match
            </PrimaryButton>
            <SecondaryButton onClick={() => fire("Destaque em breve", "O destaque dos pacotes no Match será liberado na próxima fase comercial.")}>
              <Target className="h-4 w-4" />
              Configurar destaque
            </SecondaryButton>
          </div>
        </DashboardCard>
      </div>
    </PageShell>
  )
}
