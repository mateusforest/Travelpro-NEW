import Link from "next/link"
import { CalendarClock, CheckCheck, FileText, MessageSquareText, PlaneTakeoff, ShieldCheck, Sparkles, Ticket } from "lucide-react"
import { PageShell } from "@/components/system/page-shell"
import { SectionHeader } from "@/components/system/section-header"
import { MetricCard } from "@/components/system/metric-card"
import { DashboardCard } from "@/components/system/dashboard-card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

const checklistItems = [
  { label: "Documentos recebidos", done: true },
  { label: "Contrato assinado", done: true },
  { label: "Pagamento confirmado", done: true },
  { label: "Roteiro disponível", done: true },
  { label: "Seguro viagem", done: false },
  { label: "Voucher do hotel", done: true },
  { label: "Passagens", done: false },
]

const tripUpdates = [
  { title: "Transfer confirmado", description: "A agência confirmou o motorista para o aeroporto às 08:30." },
  { title: "Resort com upgrade", description: "Seu quarto ganhou vista para o mar no check-in." },
  { title: "Passeio ajustado", description: "O catamarã foi reagendado para aproveitar melhor o clima." },
]

const doneCount = checklistItems.filter((item) => item.done).length
const progress = Math.round((doneCount / checklistItems.length) * 100)

export function ClientDashboard() {
  return (
    <PageShell>
      <SectionHeader
        title="Sua viagem"
        description="Acompanhe o que já está pronto e o que ainda falta para o embarque."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild className="rounded-full">
              <Link href="/cliente/roteiro">Ver roteiro</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-white/10 bg-white/[0.03]">
              <Link href="/cliente/documentos">Abrir documentos</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <MetricCard label="Próxima viagem" value="Cancún" change="15 mai - 22 mai" tone="success" icon={PlaneTakeoff} />
        <MetricCard label="Contagem regressiva" value="12 dias" change="Preparativos finais" tone="info" icon={CalendarClock} />
        <MetricCard label="Documentos" value="6 prontos" change="2 em revisão" tone="warning" icon={FileText} />
        <MetricCard label="Mensagens" value="3 novas" change="Agência disponível" tone="default" icon={MessageSquareText} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <DashboardCard title="Checklist da viagem" description="Tudo o que já foi preparado para você embarcar com tranquilidade.">
          <div className="rounded-[28px] border border-primary/15 bg-primary/[0.06] p-4 shadow-[0_0_30px_rgba(255,122,0,0.05)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-primary/75">Progresso atual</p>
                <p className="mt-2 text-3xl font-semibold text-foreground">{progress}%</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-right">
                <p className="text-xs text-muted-foreground">Concluídos</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {doneCount} de {checklistItems.length}
                </p>
              </div>
            </div>
            <Progress value={progress} className="mt-4 h-2.5" />
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {checklistItems.map((item) => (
              <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                <div className={item.done ? "rounded-full border border-green-400/20 bg-green-400/15 p-1.5 text-green-300" : "rounded-full border border-amber-400/20 bg-amber-400/15 p-1.5 text-amber-300"}>
                  {item.done ? <CheckCheck className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.done ? "Concluído" : "Pendente"}</p>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        <div className="space-y-6">
          <DashboardCard title="Sua viagem em resumo" description="Uma visão rápida do que importa agora.">
            <div className="space-y-3">
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-white/10 bg-primary/10 p-2.5">
                    <PlaneTakeoff className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Destino</p>
                    <p className="text-xs text-muted-foreground">Cancún, México</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-white/10 bg-primary/10 p-2.5">
                    <Ticket className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Próxima entrega</p>
                    <p className="text-xs text-muted-foreground">Passagens e seguro em revisão final</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-white/10 bg-primary/10 p-2.5">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Atendimento</p>
                    <p className="text-xs text-muted-foreground">Sua agência acompanha a viagem em tempo real</p>
                  </div>
                </div>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="Últimas atualizações" description="Mensagens úteis antes do embarque.">
            <div className="space-y-3">
              {tripUpdates.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>
      </div>
    </PageShell>
  )
}
