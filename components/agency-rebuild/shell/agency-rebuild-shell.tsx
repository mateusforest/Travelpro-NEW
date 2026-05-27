"use client"

import { useState, type ReactNode } from "react"
import {
  BadgeCheck,
  Bot,
  Box,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  CreditCard,
  FileText,
  HandCoins,
  LayoutGrid,
  LogOut,
  Package2,
  ReceiptText,
  Rocket,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
  Waypoints,
} from "lucide-react"
import { AgencyRebuildActionButton } from "@/components/agency-rebuild/actions/agency-rebuild-action-button"
import { AgencyRebuildAtlas } from "@/components/agency-rebuild/atlas"
import { BaseDrawerV3 } from "@/components/agency-rebuild/drawers/base-drawer-v3"
import { BaseModalV3 } from "@/components/agency-rebuild/modals/base-modal-v3"
import { BaseCardV3 } from "@/components/agency-rebuild/shared/base-card-v3"
import { dispatchAgencyRebuildNavigation, type AgencyRebuildMenuTarget } from "@/components/agency-rebuild/shared"
import { AgencyRebuildNotifications } from "@/components/agency-rebuild/widgets"
import { TravelProLogo } from "@/components/branding/travelpro-logo"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

type RebuildNavItem = {
  key: string
  label: string
  hint: string
  icon: ReactNode
}

type ProfileSection =
  | "account"
  | "security"
  | "plans"
  | "packages"
  | "billing"
  | "settings"
  | "signout"

type AgencyRebuildShellProps = {
  title?: string
  subtitle?: string
  children: ReactNode
}

const navItems: RebuildNavItem[] = [
  { key: "dashboard", label: "Dashboard", hint: "Visao viva", icon: <LayoutGrid className="h-4 w-4" /> },
  { key: "clients", label: "Clientes", hint: "Relacionamento", icon: <Users className="h-4 w-4" /> },
  { key: "leads", label: "Leads", hint: "Pipeline", icon: <Waypoints className="h-4 w-4" /> },
  { key: "trips", label: "Viagens", hint: "Jornadas", icon: <BriefcaseBusiness className="h-4 w-4" /> },
  { key: "documents", label: "Documentos", hint: "Hub premium", icon: <FileText className="h-4 w-4" /> },
  { key: "finance", label: "Financeiro", hint: "Caixa e margem", icon: <HandCoins className="h-4 w-4" /> },
  { key: "credits", label: "Creditos", hint: "Uso e saldo", icon: <CreditCard className="h-4 w-4" /> },
  { key: "catalog", label: "Catalogo", hint: "Pacotes vivos", icon: <Rocket className="h-4 w-4" /> },
  { key: "itineraries", label: "Roteiros", hint: "Entregas", icon: <FileText className="h-4 w-4" /> },
  { key: "quotes", label: "Cotacoes", hint: "Travel Builder", icon: <Box className="h-4 w-4" /> },
  { key: "operations", label: "Central Operacional", hint: "Comando vivo", icon: <HandCoins className="h-4 w-4" /> },
  { key: "plans", label: "Planos", hint: "Pacotes e limites", icon: <Box className="h-4 w-4" /> },
  { key: "billing", label: "Cobranca", hint: "Assinatura e recibos", icon: <ReceiptText className="h-4 w-4" /> },
  { key: "settings", label: "Configuracoes", hint: "Identidade", icon: <Settings className="h-4 w-4" /> },
  { key: "reports", label: "Relatorios", hint: "Leitura executiva", icon: <ChartNoAxesCombined className="h-4 w-4" /> },
  { key: "team", label: "Equipe", hint: "Pessoas e foco", icon: <Users className="h-4 w-4" /> },
  { key: "expansions", label: "Expansoes", hint: "Ecossistema premium", icon: <Bot className="h-4 w-4" /> },
  { key: "atlas", label: "Atlas", hint: "Pergunte", icon: <Bot className="h-4 w-4" /> },
  { key: "signout", label: "Sair", hint: "Estado honesto", icon: <LogOut className="h-4 w-4" /> },
]

const profileRoutes: Array<{ key: ProfileSection; label: string; icon: ReactNode; description: string }> = [
  { key: "account", label: "Minha conta", icon: <UserRound className="h-4 w-4" />, description: "Dados pessoais e da agencia" },
  { key: "security", label: "Seguranca", icon: <ShieldCheck className="h-4 w-4" />, description: "Senha, sessoes e acesso" },
  { key: "plans", label: "Planos", icon: <BadgeCheck className="h-4 w-4" />, description: "Plano atual, limites e comparacao" },
  { key: "packages", label: "Pacotes", icon: <Package2 className="h-4 w-4" />, description: "Pacotes ativos e uso recente" },
  { key: "billing", label: "Cobranca", icon: <ReceiptText className="h-4 w-4" />, description: "Assinatura, faturas e cobranca" },
  { key: "settings", label: "Configuracao", icon: <Settings className="h-4 w-4" />, description: "Branding, WhatsApp e preferencias" },
  { key: "signout", label: "Sair", icon: <LogOut className="h-4 w-4" />, description: "Confirmacao de saida da conta" },
]

const profileRouteGroups: ProfileSection[][] = [
  ["account", "security"],
  ["plans", "packages", "billing"],
  ["settings", "signout"],
]

function profileModalMeta(section: ProfileSection) {
  switch (section) {
    case "account":
      return {
        title: "Minha conta",
        description: "Dados pessoais, agencia, preferencias basicas e contexto da conta na V3.",
      }
    case "security":
      return {
        title: "Seguranca",
        description: "Troca de senha, sessoes visuais e autenticacao futura em uma central premium.",
      }
    case "plans":
      return {
        title: "Planos",
        description: "Plano atual, limites, comparacao e historico visual da conta.",
      }
    case "packages":
      return {
        title: "Pacotes",
        description: "Pacotes ativos, creditos incluidos, uso recente e capacidade adicional.",
      }
    case "billing":
      return {
        title: "Cobranca",
        description: "Assinatura, faturas, cobrancas recentes e billing em preparacao.",
      }
    case "settings":
      return {
        title: "Configuracao",
        description: "Dados da agencia, branding, WhatsApp, notificacoes e preferencias operacionais.",
      }
    case "signout":
      return {
        title: "Sair da conta",
        description: "Confirmacao premium e estado honesto para futura integracao com autenticacao real.",
      }
  }
}

export function AgencyRebuildShell({
  title = "Ola, Marina.",
  subtitle = "Preview isolado da nova camada operacional.",
  children,
}: AgencyRebuildShellProps) {
  const [navigationOpen, setNavigationOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [atlasOpen, setAtlasOpen] = useState(false)
  const [activeKey, setActiveKey] = useState("dashboard")
  const [activeProfileSection, setActiveProfileSection] = useState<ProfileSection>("account")
  const [accountForm, setAccountForm] = useState({
    name: "Marina Alves",
    email: "marina@horizonteviagens.com",
    phone: "+55 54 99999-1001",
    role: "Fundadora / Administradora",
    agency: "Horizonte Viagens",
    whatsapp: "+55 54 99999-1001",
    locale: "pt-BR / America-Sao_Paulo",
  })
  const [settingsForm, setSettingsForm] = useState({
    agencyName: "Horizonte Viagens",
    branding: "Glow laranja delicado / assinatura V3",
    whatsapp: "+55 54 99999-1001",
    notifications: "Alertas operacionais, leads, documentos e financeiro sensivel.",
    preferences: "Central viva, alertas compactos e operacao premium.",
    security: "Autenticacao real sera conectada depois.",
  })
  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const openProfileModal = (section: ProfileSection) => {
    setActiveProfileSection(section)
    setProfileModalOpen(true)
  }

  const renderProfileModalContent = () => {
    switch (activeProfileSection) {
      case "account":
        return (
          <div className="space-y-5">
            <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
              <BaseCardV3 eyebrow="Dados pessoais" title="Conta principal" className="rounded-[28px]">
                <div className="grid gap-3">
                  <Input value={accountForm.name} onChange={(event) => setAccountForm((current) => ({ ...current, name: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Nome" />
                  <Input value={accountForm.email} onChange={(event) => setAccountForm((current) => ({ ...current, email: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Email" />
                  <Input value={accountForm.phone} onChange={(event) => setAccountForm((current) => ({ ...current, phone: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Telefone" />
                  <Input value={accountForm.role} onChange={(event) => setAccountForm((current) => ({ ...current, role: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Cargo / funcao" />
                </div>
              </BaseCardV3>

              <BaseCardV3 eyebrow="Agencia e preferencias" title="Contexto operacional" className="rounded-[28px]">
                <div className="grid gap-3">
                  <Input value={accountForm.agency} onChange={(event) => setAccountForm((current) => ({ ...current, agency: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Nome da agencia" />
                  <Input value={accountForm.whatsapp} onChange={(event) => setAccountForm((current) => ({ ...current, whatsapp: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="WhatsApp" />
                  <Input value={accountForm.locale} onChange={(event) => setAccountForm((current) => ({ ...current, locale: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Idioma / timezone" />
                  <div className="rounded-[18px] border border-white/8 bg-black/14 px-4 py-3 text-sm text-muted-foreground">
                    A foto, sessoes e autenticacao real entram em uma etapa posterior, sem mexer em auth agora.
                  </div>
                </div>
              </BaseCardV3>
            </div>

            <div className="flex flex-wrap gap-2">
              <AgencyRebuildActionButton actionType="future" label="Alterar foto" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" futureMessage="A troca real da foto sera conectada depois." />
              <AgencyRebuildActionButton
                actionType="api"
                label="Salvar alteracoes"
                className="rounded-full"
                onAction={() =>
                  toast({
                    title: "Minha conta atualizada",
                    description: "As alteracoes foram salvas localmente na central V3.",
                  })
                }
              />
            </div>
          </div>
        )
      case "security":
        return (
          <div className="space-y-5">
            <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
              <BaseCardV3 eyebrow="Alterar senha" title="Seguranca da conta" className="rounded-[28px]">
                <div className="grid gap-3">
                  <Input type="password" value={securityForm.currentPassword} onChange={(event) => setSecurityForm((current) => ({ ...current, currentPassword: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Senha atual" />
                  <Input type="password" value={securityForm.newPassword} onChange={(event) => setSecurityForm((current) => ({ ...current, newPassword: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Nova senha" />
                  <Input type="password" value={securityForm.confirmPassword} onChange={(event) => setSecurityForm((current) => ({ ...current, confirmPassword: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Confirmar senha" />
                </div>
              </BaseCardV3>

              <BaseCardV3 eyebrow="Sessoes e acesso" title="Camada visual" className="rounded-[28px]">
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3">Sessao principal ativa no desktop da agencia.</div>
                  <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3">Autenticacao em duas etapas entra depois com conexao real.</div>
                  <div className="rounded-[18px] border border-white/8 bg-black/14 px-4 py-3">Fluxo de redefinicao e historico de acessos ainda estao em preparacao.</div>
                </div>
              </BaseCardV3>
            </div>

            <div className="flex flex-wrap gap-2">
              <AgencyRebuildActionButton
                actionType="future"
                label="Atualizar senha"
                className="rounded-full"
                futureMessage="A troca real de senha sera conectada ao fluxo de autenticacao depois."
              />
              <AgencyRebuildActionButton
                actionType="future"
                label="Autenticacao em duas etapas"
                variant="outline"
                className="rounded-full border-white/10 bg-white/[0.03]"
                futureMessage="A autenticacao adicional sera ativada em uma proxima etapa."
              />
            </div>
          </div>
        )
      case "plans":
        return (
          <div className="space-y-5">
            <div className="grid gap-4 xl:grid-cols-3">
              <BaseCardV3 eyebrow="Plano atual" title="Scale" className="rounded-[28px]" />
              <BaseCardV3 eyebrow="Recursos incluidos" title="Workspaces V3" className="rounded-[28px]" />
              <BaseCardV3 eyebrow="Limites" title="6 usuarios ativos" className="rounded-[28px]" />
            </div>
            <BaseCardV3 eyebrow="Historico visual" title="Comparacao premium" className="rounded-[28px]">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>Upgrade registrado em abr/2026.</div>
                <div>Analytics avancado e multiunidade entram em uma camada futura.</div>
                <div>Growth, Scale e Agency Pro aparecerao aqui em leitura comparativa.</div>
              </div>
            </BaseCardV3>
            <div className="flex flex-wrap gap-2">
              <AgencyRebuildActionButton actionType="future" label="Ver planos" className="rounded-full" futureMessage="A leitura real de planos sera conectada depois." />
              <AgencyRebuildActionButton actionType="future" label="Solicitar upgrade" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" futureMessage="O upgrade real sera tratado na camada comercial depois." />
              <AgencyRebuildActionButton actionType="future" label="Comparar planos" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" futureMessage="A comparacao detalhada de planos sera ativada depois." />
            </div>
          </div>
        )
      case "packages":
        return (
          <div className="space-y-5">
            <div className="grid gap-4 xl:grid-cols-3">
              <BaseCardV3 eyebrow="Pacote ativo" title="Pacote Operacional" className="rounded-[28px]" />
              <BaseCardV3 eyebrow="Uso recente" title="Roteiros, documentos e builder" className="rounded-[28px]" />
              <BaseCardV3 eyebrow="Validade" title="Ate 14 jun" className="rounded-[28px]" />
            </div>
            <BaseCardV3 eyebrow="Pacotes disponiveis" title="Capacidade extra da agencia" className="rounded-[28px]">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>Pacote Inicial / 500 creditos.</div>
                <div>Pacote Operacional / 1.500 creditos.</div>
                <div>Pacote Agencia Pro / 4.000 creditos.</div>
              </div>
            </BaseCardV3>
            <AgencyRebuildActionButton actionType="future" label="Comprar pacote" className="rounded-full" futureMessage="A compra real de pacotes sera conectada ao billing depois." />
          </div>
        )
      case "billing":
        return (
          <div className="space-y-5">
            <div className="grid gap-4 xl:grid-cols-4">
              <BaseCardV3 eyebrow="Assinatura" title="Ativa" className="rounded-[28px]" />
              <BaseCardV3 eyebrow="Forma de pagamento" title="Em preparacao" className="rounded-[28px]" />
              <BaseCardV3 eyebrow="Faturas" title="3 recentes" className="rounded-[28px]" />
              <BaseCardV3 eyebrow="Status de cobranca" title="Estavel" className="rounded-[28px]" />
            </div>
            <BaseCardV3 eyebrow="Historico de cobrancas" title="Leitura executiva" className="rounded-[28px]">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>05/2026 / Renovacao visual processada.</div>
                <div>04/2026 / Ajuste de plano registrado.</div>
                <div>03/2026 / Assinatura principal estabilizada.</div>
              </div>
            </BaseCardV3>
            <AgencyRebuildActionButton actionType="future" label="Atualizar pagamento" className="rounded-full" futureMessage="A atualizacao real do pagamento sera conectada ao billing depois." />
          </div>
        )
      case "settings":
        return (
          <div className="space-y-5">
            <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
              <BaseCardV3 eyebrow="Dados da agencia" title="Identidade e contato" className="rounded-[28px]">
                <div className="grid gap-3">
                  <Input value={settingsForm.agencyName} onChange={(event) => setSettingsForm((current) => ({ ...current, agencyName: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Dados da agencia" />
                  <Input value={settingsForm.branding} onChange={(event) => setSettingsForm((current) => ({ ...current, branding: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Branding" />
                  <Input value={settingsForm.whatsapp} onChange={(event) => setSettingsForm((current) => ({ ...current, whatsapp: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="WhatsApp" />
                </div>
              </BaseCardV3>

              <BaseCardV3 eyebrow="Preferencias operacionais" title="Notificacoes e seguranca" className="rounded-[28px]">
                <div className="grid gap-3">
                  <Input value={settingsForm.notifications} onChange={(event) => setSettingsForm((current) => ({ ...current, notifications: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Notificacoes" />
                  <Input value={settingsForm.preferences} onChange={(event) => setSettingsForm((current) => ({ ...current, preferences: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Preferencias operacionais" />
                  <Input value={settingsForm.security} onChange={(event) => setSettingsForm((current) => ({ ...current, security: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Seguranca visual" />
                </div>
              </BaseCardV3>
            </div>
            <AgencyRebuildActionButton
              actionType="api"
              label="Salvar configuracoes"
              className="rounded-full"
              onAction={() =>
                toast({
                  title: "Configuracoes salvas",
                  description: "As preferencias da central V3 foram atualizadas localmente.",
                })
              }
            />
          </div>
        )
      case "signout":
        return (
          <div className="space-y-5">
            <BaseCardV3 eyebrow="Confirmacao V3" title="Sair da conta" className="rounded-[28px]">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>Use este fluxo apenas como experiencia premium do preview isolado.</div>
                <div>A saida real sera conectada ao fluxo de autenticacao depois.</div>
              </div>
            </BaseCardV3>
            <div className="flex flex-wrap gap-2">
              <AgencyRebuildActionButton actionType="modal" label="Cancelar" variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onAction={() => setProfileModalOpen(false)} />
              <AgencyRebuildActionButton actionType="future" label="Confirmar saida" className="rounded-full" futureMessage="Saida real sera conectada ao fluxo de autenticacao depois." />
            </div>
          </div>
        )
    }
  }

  const modalMeta = profileModalMeta(activeProfileSection)

  return (
    <div className="min-h-screen overflow-x-clip bg-[#080607] text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.12),transparent_30%),radial-gradient(circle_at_86%_16%,rgba(249,115,22,0.08),transparent_24%),linear-gradient(180deg,rgba(8,6,7,0.96),rgba(8,6,7,1))]" />
        <div className="absolute left-[-8%] top-16 h-[320px] w-[320px] rounded-full bg-orange-500/8 blur-[130px]" />
        <div className="absolute right-[-5%] top-24 h-[280px] w-[280px] rounded-full bg-amber-400/8 blur-[140px]" />
      </div>

      <header className="sticky top-0 z-30 border-b border-white/6 bg-[#080607]/72 backdrop-blur-2xl">
        <div className="mx-auto flex w-full max-w-[1680px] items-center gap-3 px-4 py-3 sm:px-5 lg:px-6">
          <AgencyRebuildActionButton
            actionType="modal"
            label={<LayoutGrid className="h-4 w-4 text-primary" />}
            className="h-10 w-10 rounded-[16px] border border-white/8 bg-white/[0.04] p-0 shadow-[0_12px_32px_rgba(0,0,0,0.2)]"
            variant="outline"
            tooltip="Abrir mapa de modulos da V3."
            onAction={() => setNavigationOpen(true)}
          />

          <TravelProLogo variant="header" priority className="hidden h-[38px] sm:block" />
          <TravelProLogo variant="compact" priority className="h-9 sm:hidden" />

          <div className="min-w-0 flex-1 pl-1">
            <h1 className="truncate text-sm font-semibold text-foreground sm:text-[15px]">{title}</h1>
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          </div>

          <div className="ml-auto flex items-center gap-2.5">
            <div className="hidden rounded-full border border-white/8 bg-white/[0.035] px-2.5 py-1 text-[11px] text-muted-foreground md:flex md:items-center md:gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.65)]" />
              Online
            </div>

            <AgencyRebuildActionButton
              actionType="modal"
              label={
                <span className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  Pergunte
                </span>
              }
              className="rounded-full border border-white/8 bg-white/[0.035] px-3.5 py-1.5 text-sm transition-all hover:border-primary/18 hover:bg-white/[0.05]"
              variant="outline"
              tooltip="Abrir Atlas"
              onAction={() => setAtlasOpen(true)}
            />

            <AgencyRebuildNotifications />

            <AgencyRebuildActionButton
              actionType="modal"
              label={
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/12 text-sm font-semibold text-primary">
                  MA
                </div>
              }
              className="h-10 w-10 rounded-full border border-white/8 bg-white/[0.035] p-0 transition-all hover:border-primary/18 hover:bg-white/[0.05]"
              variant="outline"
              tooltip="Abrir perfil e preferencias da V3."
              onAction={() => setProfileOpen(true)}
            />
          </div>
        </div>
      </header>

      <BaseDrawerV3
        open={navigationOpen}
        onOpenChange={setNavigationOpen}
        direction="left"
        title="Navegacao V3"
        description="Mapa isolado da futura Agencia Rebuild."
        contentClassName="data-[vaul-drawer-direction=left]:w-[min(276px,calc(100vw-1rem))] data-[vaul-drawer-direction=left]:border-white/10 data-[vaul-drawer-direction=left]:bg-[linear-gradient(180deg,rgba(14,11,12,0.96),rgba(8,6,7,0.98))]"
        footer={
          <AgencyRebuildActionButton
            actionType="future"
            label="Conectar rotas reais depois"
            variant="outline"
            className="rounded-full border-white/10 bg-white/[0.03]"
            futureMessage="Disponivel na proxima etapa da V3."
          />
        }
      >
        <div className="space-y-2">
          {navItems.map((item) => {
            const active = item.key === activeKey

            return (
              <AgencyRebuildActionButton
                key={item.key}
                actionType="modal"
                label={
                  <div className="flex w-full items-center gap-3">
                    <div className="rounded-[12px] border border-white/8 bg-black/18 p-1.5 text-primary">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-foreground">{item.label}</p>
                      <p className="truncate text-[11px] text-muted-foreground/80">{item.hint}</p>
                    </div>
                  </div>
                }
                className={cn(
                  "h-auto w-full justify-start rounded-[16px] border px-3 py-2 text-left transition-all",
                  active
                    ? "border-primary/22 bg-primary/[0.12]"
                    : "border-white/8 bg-white/[0.025] hover:border-primary/14 hover:bg-white/[0.045]",
                )}
                variant="outline"
                tooltip={`Selecionar sessao ${item.label} na preview.`}
                onAction={() => {
                  const target = item.key as AgencyRebuildMenuTarget
                  setNavigationOpen(false)
                  setActiveKey(item.key)

                  if (target === "signout") {
                    setActiveProfileSection("signout")
                    setProfileModalOpen(true)
                    return
                  }

                  if (target === "atlas") {
                    setAtlasOpen(true)
                    return
                  }

                  if (target === "plans") {
                    setActiveProfileSection("plans")
                    setProfileModalOpen(true)
                    return
                  }

                  if (target === "billing") {
                    setActiveProfileSection("billing")
                    setProfileModalOpen(true)
                    return
                  }

                  if (target === "settings") {
                    setActiveProfileSection("settings")
                    setProfileModalOpen(true)
                    return
                  }

                  dispatchAgencyRebuildNavigation(target)
                }}
              />
            )
          })}
        </div>
      </BaseDrawerV3>

      <main className="mx-auto w-full max-w-[1680px] px-4 py-5 pb-12 sm:px-5 lg:px-6">
        {children}
      </main>

      <BaseDrawerV3
        open={profileOpen}
        onOpenChange={setProfileOpen}
        title="Perfil"
        hideHeader
        contentClassName="data-[vaul-drawer-direction=right]:w-[min(292px,calc(100vw-1rem))] data-[vaul-drawer-direction=right]:border-white/10 data-[vaul-drawer-direction=right]:bg-[linear-gradient(180deg,rgba(14,11,12,0.96),rgba(8,6,7,0.985))]"
      >
        <div className="space-y-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/8 bg-primary/[0.12] text-xs font-semibold text-primary">
              MA
            </div>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-foreground">Marina Alves</p>
              <p className="truncate text-[12px] text-muted-foreground">marina@horizonteviagens.com</p>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/12 to-transparent" />

          <div className="space-y-3">
            {profileRouteGroups.map((group, groupIndex) => (
              <div key={`profile-group-${groupIndex}`} className="space-y-1.5">
                {group.map((routeKey) => {
                  const route = profileRoutes.find((item) => item.key === routeKey)
                  if (!route) return null

                  return (
                    <AgencyRebuildActionButton
                      key={route.key}
                      actionType="modal"
                      label={
                        <div className="flex w-full items-start gap-3 text-left">
                          <div className="mt-0.5 text-muted-foreground">{route.icon}</div>
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-medium text-foreground">{route.label}</p>
                            <p className="mt-0.5 truncate text-[11px] leading-4 text-muted-foreground/80">{route.description}</p>
                          </div>
                        </div>
                      }
                      className="h-auto justify-start rounded-[14px] border border-transparent bg-transparent px-2.5 py-2 transition-all hover:border-white/8 hover:bg-white/[0.035]"
                      variant="outline"
                      onAction={() => {
                        setProfileOpen(false)
                        openProfileModal(route.key)
                      }}
                    />
                  )
                })}

                {groupIndex < profileRouteGroups.length - 1 ? (
                  <div className="pt-1">
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </BaseDrawerV3>

      <BaseModalV3
        open={profileModalOpen}
        onOpenChange={setProfileModalOpen}
        title={modalMeta.title}
        description={modalMeta.description}
        contentClassName="sm:max-w-5xl"
      >
        {renderProfileModalContent()}
      </BaseModalV3>

      <AgencyRebuildAtlas open={atlasOpen} onOpenChange={setAtlasOpen} />
    </div>
  )
}
