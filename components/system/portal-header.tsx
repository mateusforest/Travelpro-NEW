"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import type { PortalKey, UserProfile } from "@/lib/services/portal-types"
import { MobileNav } from "@/components/system/mobile-nav"
import { CommandPalette } from "@/components/system/command-palette"
import { NotificationPanel, type NotificationItem } from "@/components/system/notification-panel"
import { ProfileMenu } from "@/components/system/profile-menu"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type PortalHeaderProps = {
  portal: PortalKey
  title: string
  profile: UserProfile
}

const masterNotifications: NotificationItem[] = [
  { id: "m-1", title: "Inadimplência crítica", description: "Serra Azul Turismo está com cobrança em atraso há 3 dias.", time: "há 6 min", tone: "danger", href: "/master/financeiro" },
  { id: "m-2", title: "Uso excessivo de IA", description: "Horizonte Viagens passou 28% da média esperada do plano.", time: "há 14 min", tone: "warning", href: "/master/ia" },
  { id: "m-3", title: "Chamado Atlas escalado", description: "Atlas não resolveu uma dúvida operacional da Atlântico Premium.", time: "há 22 min", tone: "info", href: "/master/atlas" },
  { id: "m-4", title: "Falha no WhatsApp", description: "Um número de agência perdeu conexão no último ciclo.", time: "há 31 min", tone: "warning", href: "/master/whatsapp" },
  { id: "m-5", title: "Marketplace em moderação", description: "Pacote denunciado no Match aguarda revisão humana.", time: "hoje", tone: "danger", href: "/master/marketplace" },
  { id: "m-6", title: "Novo cadastro aprovado", description: "Uma nova agência concluiu onboarding e entrou em período ativo.", time: "hoje", tone: "success", href: "/master/agencias" },
]

const agencyNotifications: NotificationItem[] = [
  { id: "a-1", title: "Lead quente recebido", description: "Camila pediu cotação premium para Maldivas.", time: "há 3 min", tone: "success", href: "/app/leads" },
  { id: "a-2", title: "Contrato assinado", description: "Ana Martins concluiu a assinatura da viagem.", time: "há 18 min", tone: "info", href: "/app/documentos/contratos" },
  { id: "a-3", title: "Viagem próxima", description: "João Ribeiro embarca em 3 dias.", time: "há 41 min", tone: "warning", href: "/app/viagens" },
  { id: "a-4", title: "Cobrança pendente", description: "Uma assinatura entrou em alerta financeiro.", time: "há 58 min", tone: "danger", href: "/master/financeiro" },
  { id: "a-5", title: "Atlas sugeriu ajuste", description: "Novo script de atendimento para leads frios.", time: "hoje", tone: "default", href: "/app/atlas-advisor" },
  { id: "a-6", title: "TravelPro Go executado", description: "Pacote publicado e pronto para compartilhar.", time: "hoje", tone: "success", href: "/app/travelpro-go" },
]

const clientNotifications: NotificationItem[] = [
  { id: "c-1", title: "Novo documento disponível", description: "Seu voucher do hotel já pode ser aberto e baixado.", time: "agora", tone: "success", href: "/cliente/documentos" },
  { id: "c-2", title: "Roteiro atualizado", description: "A agência ajustou o horário do passeio do segundo dia.", time: "há 14 min", tone: "info", href: "/cliente/roteiro" },
  { id: "c-3", title: "Mensagem da agência", description: "Seu transfer para o aeroporto foi confirmado.", time: "há 28 min", tone: "default", href: "/cliente/mensagens" },
  { id: "c-4", title: "Pagamento pendente", description: "Há uma etapa do pagamento aguardando confirmação.", time: "há 1 h", tone: "warning", href: "/cliente/viagem" },
  { id: "c-5", title: "Viagem próxima", description: "Faltam 12 dias para o embarque para Cancún.", time: "hoje", tone: "info", href: "/cliente/dashboard" },
  { id: "c-6", title: "Voucher enviado", description: "O voucher do transfer foi anexado à sua viagem.", time: "hoje", tone: "success", href: "/cliente/documentos" },
]

function getWelcomeTitle(portal: PortalKey, profile: UserProfile) {
  if (portal === "master") return "Bem-vindo, Master"
  if (portal === "agency") return "Bem-vindo"
  if (portal === "client") return "Bem-vindo"
  return profile.name ? `Bem-vindo, ${profile.name}` : "Bem-vindo"
}

export function PortalHeader({ portal, title, profile }: PortalHeaderProps) {
  const isClientPortal = portal === "client"
  const isMasterPortal = portal === "master"
  const notificationItems = isClientPortal ? clientNotifications : isMasterPortal ? masterNotifications : agencyNotifications
  const welcomeTitle = getWelcomeTitle(portal, profile)

  return (
    <header className="sticky top-0 z-30 border-b border-white/6 bg-background/78 backdrop-blur-xl">
      <div className="flex flex-col gap-1.5 px-3 py-1.5 md:px-3.5 md:py-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <MobileNav portal={portal} title={title} />
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold text-foreground md:text-lg">{welcomeTitle}</h2>
            </div>
          </div>

          <div className="hidden min-w-0 flex-1 justify-center xl:flex">
            <div className="w-full max-w-[320px]">
              <CommandPalette portal={portal} />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {!isClientPortal ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="Ações rápidas"
                    className="hidden h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.025] text-foreground transition-all hover:border-primary/20 hover:bg-white/[0.05] md:inline-flex"
                  >
                    <Plus className="h-3.5 w-3.5 text-primary" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={10}
                  className="w-60 rounded-3xl border-white/10 bg-black/85 p-2 text-foreground shadow-2xl shadow-black/40 backdrop-blur-xl"
                >
                  <DropdownMenuItem asChild className="rounded-2xl px-3 py-2.5">
                    <Link href={portal === "master" ? "/master/agencias" : "/app/viagens"}>Abrir fluxo principal</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-2xl px-3 py-2.5">
                    <Link href={portal === "master" ? "/master/atlas" : "/app/atlas-advisor"}>Abrir módulo premium</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-2xl px-3 py-2.5">
                    <Link href={portal === "master" ? "/master/relatorios" : "/app/central-operacional"}>Ver prioridade do dia</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}

            <NotificationPanel
              items={notificationItems}
              title={isClientPortal ? "Notificações da viagem" : isMasterPortal ? "Alertas Master" : "Notificações"}
              description={
                isClientPortal
                  ? "Atualizações importantes da sua viagem, documentos e mensagens da agência."
                  : isMasterPortal
                    ? "Inadimplência, IA, Atlas, WhatsApp, marketplace e novos eventos da plataforma."
                    : "Leads, operações e sinais importantes do TravelPro."
              }
              emptyTitle={isClientPortal ? "Sua viagem está em dia." : isMasterPortal ? "Sem alertas críticos." : "Tudo em dia."}
              emptyDescription={
                isClientPortal
                  ? "Quando a agência enviar novidades, elas aparecerão aqui."
                  : isMasterPortal
                    ? "Nenhum evento prioritário exige ação imediata no momento."
                    : "Nenhuma notificação pendente no momento."
              }
            />
            <ProfileMenu portal={portal} profile={profile} />
          </div>
        </div>

        <div className="xl:hidden">
          <CommandPalette portal={portal} />
        </div>
      </div>
    </header>
  )
}
