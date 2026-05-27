"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import {
  BadgeDollarSign,
  BadgeCheck,
  Bot,
  Box,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  ChevronDown,
  CreditCard,
  FileText,
  HandCoins,
  LayoutGrid,
  LogOut,
  Plane,
  Package2,
  ReceiptText,
  Rocket,
  Rows3,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  Waypoints,
} from "lucide-react"
import { AgencyRebuildActionButton } from "@/components/agency-rebuild/actions/agency-rebuild-action-button"
import { AgencyRebuildAtlas } from "@/components/agency-rebuild/atlas"
import { BaseDrawerV3 } from "@/components/agency-rebuild/drawers/base-drawer-v3"
import { BaseModalV3 } from "@/components/agency-rebuild/modals/base-modal-v3"
import { BaseCardV3 } from "@/components/agency-rebuild/shared/base-card-v3"
import {
  AgencyRebuildViewProvider,
  dispatchAgencyRebuildNavigation,
  type AgencyRebuildMenuTarget,
  type AgencyRebuildViewMode,
} from "@/components/agency-rebuild/shared"
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

type TraditionalMenuGroup = {
  key: string
  label: string
  icon: ReactNode
  target?: AgencyRebuildMenuTarget
  children?: Array<{ key: string; label: string; target: AgencyRebuildMenuTarget }>
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
  { key: "dashboard", label: "Dashboard", hint: "Visão viva", icon: <LayoutGrid className="h-4 w-4" /> },
  { key: "clients", label: "Clientes", hint: "Relacionamento", icon: <Users className="h-4 w-4" /> },
  { key: "leads", label: "Leads", hint: "Pipeline", icon: <Waypoints className="h-4 w-4" /> },
  { key: "trips", label: "Viagens", hint: "Jornadas", icon: <BriefcaseBusiness className="h-4 w-4" /> },
  { key: "documents", label: "Documentos", hint: "Hub premium", icon: <FileText className="h-4 w-4" /> },
  { key: "finance", label: "Financeiro", hint: "Caixa e margem", icon: <HandCoins className="h-4 w-4" /> },
  { key: "credits", label: "Créditos", hint: "Uso e saldo", icon: <CreditCard className="h-4 w-4" /> },
  { key: "catalog", label: "Catálogo", hint: "Pacotes vivos", icon: <Rocket className="h-4 w-4" /> },
  { key: "itineraries", label: "Roteiros", hint: "Entregas", icon: <FileText className="h-4 w-4" /> },
  { key: "quotes", label: "Cotações", hint: "Travel Builder", icon: <Box className="h-4 w-4" /> },
  { key: "operations", label: "Central Operacional", hint: "Comando vivo", icon: <HandCoins className="h-4 w-4" /> },
  { key: "plans", label: "Planos", hint: "Pacotes e limites", icon: <Box className="h-4 w-4" /> },
  { key: "billing", label: "Cobrança", hint: "Assinatura e recibos", icon: <ReceiptText className="h-4 w-4" /> },
  { key: "settings", label: "Configurações", hint: "Identidade", icon: <Settings className="h-4 w-4" /> },
  { key: "reports", label: "Relatórios", hint: "Leitura executiva", icon: <ChartNoAxesCombined className="h-4 w-4" /> },
  { key: "team", label: "Equipe", hint: "Pessoas e foco", icon: <Users className="h-4 w-4" /> },
  { key: "expansions", label: "Expansões", hint: "Ecossistema premium", icon: <Bot className="h-4 w-4" /> },
  { key: "atlas", label: "Atlas", hint: "Pergunte", icon: <Bot className="h-4 w-4" /> },
  { key: "signout", label: "Sair", hint: "Estado honesto", icon: <LogOut className="h-4 w-4" /> },
]

const traditionalMenu: TraditionalMenuGroup[] = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutGrid className="h-4 w-4" />, target: "dashboard" },
  { key: "clients", label: "Clientes", icon: <Users className="h-4 w-4" />, target: "clients" },
  { key: "leads", label: "Leads", icon: <Waypoints className="h-4 w-4" />, target: "leads" },
  {
    key: "trips",
    label: "Viagens",
    icon: <BriefcaseBusiness className="h-4 w-4" />,
    children: [
      { key: "trips-all", label: "Todas as viagens", target: "trips" },
      { key: "trips-itineraries", label: "Roteiros", target: "itineraries" },
      { key: "trips-quotes", label: "Cotações", target: "quotes" },
    ],
  },
  {
    key: "documents",
    label: "Documentos",
    icon: <FileText className="h-4 w-4" />,
    children: [
      { key: "documents-all", label: "Todos os documentos", target: "documents" },
      { key: "documents-contracts", label: "Contratos", target: "documents" },
      { key: "documents-vouchers", label: "Vouchers", target: "documents" },
      { key: "documents-receipts", label: "Recibos", target: "documents" },
      { key: "documents-flights", label: "Passagens", target: "documents" },
      { key: "documents-templates", label: "Templates", target: "templates" },
    ],
  },
  {
    key: "catalog",
    label: "Catálogo",
    icon: <Rocket className="h-4 w-4" />,
    children: [
      { key: "catalog-main", label: "Catálogo da agência", target: "catalog" },
      { key: "catalog-match", label: "Travel Match", target: "travelMatch" },
    ],
  },
  { key: "go", label: "Travel GO", icon: <Bot className="h-4 w-4" />, target: "expansions" },
  {
    key: "expansions",
    label: "Expansões",
    icon: <Sparkles className="h-4 w-4" />,
    children: [
      { key: "exp-agent", label: "Travel Agent", target: "expansions" },
      { key: "exp-marketing", label: "Marketing IA", target: "expansions" },
      { key: "exp-advisor", label: "Atlas Advisor", target: "expansions" },
    ],
  },
  {
    key: "operations",
    label: "Central Operacional",
    icon: <HandCoins className="h-4 w-4" />,
    children: [
      { key: "ops-overview", label: "Visão geral", target: "operations" },
      { key: "ops-insights", label: "Insights", target: "operations" },
      { key: "ops-credits", label: "Créditos e consumo", target: "credits" },
      { key: "ops-tasks", label: "Tarefas", target: "operations" },
      { key: "ops-reports", label: "Relatórios", target: "reports" },
    ],
  },
  { key: "finance", label: "Financeiro", icon: <BadgeDollarSign className="h-4 w-4" />, target: "finance" },
  { key: "team", label: "Equipe", icon: <Users className="h-4 w-4" />, target: "team" },
]

const profileRoutes: Array<{ key: ProfileSection; label: string; icon: ReactNode; description: string }> = [
  { key: "account", label: "Minha conta", icon: <UserRound className="h-4 w-4" />, description: "Dados pessoais e da agência" },
  { key: "security", label: "Segurança", icon: <ShieldCheck className="h-4 w-4" />, description: "Senha, sessões e acesso" },
  { key: "plans", label: "Planos", icon: <BadgeCheck className="h-4 w-4" />, description: "Plano atual, limites e comparação" },
  { key: "packages", label: "Pacotes", icon: <Package2 className="h-4 w-4" />, description: "Pacotes ativos e uso recente" },
  { key: "billing", label: "Cobrança", icon: <ReceiptText className="h-4 w-4" />, description: "Assinatura, faturas e cobrança" },
  { key: "settings", label: "Configuração", icon: <Settings className="h-4 w-4" />, description: "Branding, WhatsApp e preferências" },
  { key: "signout", label: "Sair", icon: <LogOut className="h-4 w-4" />, description: "Confirmação de saída da conta" },
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
        description: "Dados pessoais, agência, preferências básicas e contexto da conta na V3.",
      }
    case "security":
      return {
        title: "Segurança",
        description: "Troca de senha, sessões visuais e autenticação futura em uma central premium.",
      }
    case "plans":
      return {
        title: "Planos",
        description: "Plano atual, limites, comparação e histórico visual da conta.",
      }
    case "packages":
      return {
        title: "Pacotes",
        description: "Pacotes ativos, créditos incluídos, uso recente e capacidade adicional.",
      }
    case "billing":
      return {
        title: "Cobrança",
        description: "Assinatura, faturas, cobranças recentes e billing em preparação.",
      }
    case "settings":
      return {
        title: "Configuração",
        description: "Dados da agência, branding, WhatsApp, notificações e preferências operacionais.",
      }
    case "signout":
      return {
        title: "Sair da conta",
        description: "Confirmação premium e estado honesto para futura integração com autenticação real.",
      }
  }
}

export function AgencyRebuildShell({
  title = "Ola, Marina.",
  subtitle,
  children,
}: AgencyRebuildShellProps) {
  const [viewMode, setViewModeState] = useState<AgencyRebuildViewMode>("workspace")
  const [isSwitchingView, setIsSwitchingView] = useState(false)
  const [navigationOpen, setNavigationOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [atlasOpen, setAtlasOpen] = useState(false)
  const [activeKey, setActiveKey] = useState("dashboard")
  const [expandedTraditionalMenus, setExpandedTraditionalMenus] = useState<string[]>(["trips", "documents"])
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
              <BaseCardV3 eyebrow="Alterar senha" title="Segurança da conta" className="rounded-[28px]">
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
                  <Input value={settingsForm.security} onChange={(event) => setSettingsForm((current) => ({ ...current, security: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Segurança visual" />
                </div>
              </BaseCardV3>
            </div>
            <AgencyRebuildActionButton
              actionType="api"
              label="Salvar configuracoes"
              className="rounded-full"
              onAction={() =>
                toast({
                  title: "Configurações salvas",
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

  useEffect(() => {
    const stored = window.localStorage.getItem("travelpro:v3-view-mode")
    if (stored === "workspace" || stored === "traditional") {
      setViewModeState(stored)
    }
  }, [])

  const setViewMode = (mode: AgencyRebuildViewMode) => {
    if (mode === viewMode) return
    setIsSwitchingView(true)
    window.setTimeout(() => {
      setViewModeState(mode)
      window.localStorage.setItem("travelpro:v3-view-mode", mode)
    }, 260)
    window.setTimeout(() => {
      setIsSwitchingView(false)
    }, 620)
  }

  const toggleTraditionalMenu = (menuKey: string) => {
    setExpandedTraditionalMenus((current) =>
      current.includes(menuKey) ? current.filter((item) => item !== menuKey) : [...current, menuKey],
    )
  }

  const handleMenuNavigation = (target: AgencyRebuildMenuTarget, key: string) => {
    setActiveKey(key)

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
  }

  const traditionalSidebar = useMemo(
    () => (
      <aside
        className={cn(
          "hidden xl:block xl:w-[280px]",
          viewMode === "traditional" ? "xl:opacity-100" : "xl:pointer-events-none xl:opacity-0",
        )}
      >
        <div className="sticky top-[92px] rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,13,14,0.94),rgba(10,8,9,0.92))] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
          <div className="space-y-1.5">
            {traditionalMenu.map((item) => {
              const isExpanded = expandedTraditionalMenus.includes(item.key)
              const isDirectActive = item.target ? activeKey === item.target : item.children?.some((child) => activeKey === child.target)

              return (
                <div key={item.key} className="rounded-[22px]">
                  {item.children ? (
                    <>
                      <button
                        type="button"
                        onClick={() => toggleTraditionalMenu(item.key)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-[16px] border px-3 py-2.5 text-left transition-all",
                          isDirectActive
                            ? "border-primary/20 bg-primary/[0.1]"
                            : "border-white/6 bg-white/[0.025] hover:border-white/10 hover:bg-white/[0.04]",
                        )}
                      >
                        <div className="rounded-[12px] border border-white/8 bg-black/18 p-1.5 text-primary">{item.icon}</div>
                        <span className="flex-1 text-[13px] font-medium text-foreground">{item.label}</span>
                        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-300", isExpanded && "rotate-180")} />
                      </button>

                      <div className={cn("grid overflow-hidden transition-all duration-300", isExpanded ? "grid-rows-[1fr] pt-1.5" : "grid-rows-[0fr]")}>
                        <div className="min-h-0">
                          <div className="ml-5 space-y-1 border-l border-white/8 pl-3">
                            {item.children.map((child) => (
                              <button
                                key={child.key}
                                type="button"
                                onClick={() => handleMenuNavigation(child.target, child.target)}
                                className={cn(
                                  "flex w-full items-center rounded-[12px] px-3 py-2 text-left text-[12px] transition-all",
                                  activeKey === child.target
                                    ? "bg-orange-500/[0.12] text-orange-100 shadow-[inset_0_0_0_1px_rgba(251,146,60,0.12)]"
                                    : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
                                )}
                              >
                                {child.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => item.target && handleMenuNavigation(item.target, item.target)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-[16px] border px-3 py-2.5 text-left transition-all",
                        isDirectActive
                          ? "border-primary/20 bg-primary/[0.1]"
                          : "border-white/6 bg-white/[0.025] hover:border-white/10 hover:bg-white/[0.04]",
                      )}
                    >
                      <div className="rounded-[12px] border border-white/8 bg-black/18 p-1.5 text-primary">{item.icon}</div>
                      <span className="text-[13px] font-medium text-foreground">{item.label}</span>
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </aside>
    ),
    [activeKey, expandedTraditionalMenus, viewMode],
  )

  return (
    <AgencyRebuildViewProvider value={{ viewMode, isSwitchingView, setViewMode }}>
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
            className={cn(
              "h-10 w-10 rounded-[16px] border border-white/8 bg-white/[0.04] p-0 shadow-[0_12px_32px_rgba(0,0,0,0.2)] xl:hidden",
              viewMode === "workspace" && "xl:flex",
            )}
            variant="outline"
            tooltip="Abrir mapa de modulos da V3."
            onAction={() => setNavigationOpen(true)}
          />

          <TravelProLogo variant="header" priority className="hidden h-[38px] sm:block" />
          <TravelProLogo variant="compact" priority className="h-9 sm:hidden" />

          <div className="min-w-0 flex-1 pl-1">
            <h1 className="truncate text-sm font-semibold text-foreground sm:text-[15px]">{title}</h1>
            {subtitle ? <p className="truncate text-xs text-muted-foreground">{subtitle}</p> : null}
          </div>

          <div className="hidden lg:flex">
            <div className="relative flex overflow-visible rounded-full border border-white/8 bg-white/[0.035] p-1 shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
              <div
                className={cn(
                  "pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-primary/[0.12] shadow-[0_0_22px_rgba(251,146,60,0.18)] transition-transform duration-500",
                  viewMode === "workspace" ? "translate-x-0" : "translate-x-full",
                )}
              />
              <div
                className={cn(
                  "pointer-events-none absolute top-1/2 z-30 -translate-y-1/2 text-primary transition-all duration-500",
                  viewMode === "workspace" ? "left-[calc(25%-10px)]" : "left-[calc(75%-10px)] rotate-[10deg]",
                  isSwitchingView ? "scale-110 opacity-100 drop-shadow-[0_0_14px_rgba(251,146,60,0.8)]" : "opacity-90",
                )}
              >
                <div className={cn("absolute inset-0 rounded-full bg-primary/20 blur-md", isSwitchingView ? "opacity-100" : "opacity-0")} />
                <Plane className={cn("relative h-4 w-4", isSwitchingView && "animate-pulse")} />
              </div>
              {[
                { key: "workspace" as const, label: "Visão Workspace", icon: <LayoutGrid className="h-3.5 w-3.5" /> },
                { key: "traditional" as const, label: "Visão Tradicional", icon: <Rows3 className="h-3.5 w-3.5" /> },
              ].map((mode) => (
                <button
                  key={mode.key}
                  type="button"
                  onClick={() => setViewMode(mode.key)}
                  className={cn(
                    "relative z-20 flex h-10 items-center gap-2 rounded-full px-4 text-[12px] font-medium transition-colors",
                    viewMode === mode.key ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {mode.icon}
                  {mode.label}
                </button>
              ))}
            </div>
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
                  handleMenuNavigation(target, item.key)
                }}
              />
            )
          })}
        </div>
      </BaseDrawerV3>

      <main className="mx-auto w-full max-w-[1680px] px-4 py-5 pb-12 sm:px-5 lg:px-6">
        <div className={cn("transition-all duration-500", isSwitchingView && "opacity-80 blur-[1px]")}>
          {viewMode === "traditional" ? (
            <div className="flex gap-5">
              {traditionalSidebar}
              <div className="min-w-0 flex-1">{children}</div>
            </div>
          ) : (
            children
          )}
        </div>
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
    </AgencyRebuildViewProvider>
  )
}
