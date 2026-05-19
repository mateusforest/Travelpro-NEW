import {
  BarChart3,
  Bot,
  BriefcaseBusiness,
  Building2,
  CheckCheck,
  ChevronRight,
  CreditCard,
  FileStack,
  FileText,
  HandCoins,
  LayoutDashboard,
  LineChart,
  Logs,
  MessageSquareText,
  MessagesSquare,
  Palette,
  Receipt,
  Route,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Store,
  Target,
  Users,
  Wallet,
  Waypoints,
  Workflow,
} from "lucide-react"
import type { NavItem, PortalKey, UserProfile } from "@/lib/services/portal-types"

export const masterNavigation: NavItem[] = [
  { title: "Dashboard", href: "/master/dashboard", icon: LayoutDashboard, description: "Visão executiva" },
  { title: "Agências", href: "/master/agencias", icon: Building2, description: "Base ativa" },
  { title: "Financeiro", href: "/master/financeiro", icon: HandCoins, description: "Receita e cobrança" },
  { title: "Usuários", href: "/master/usuarios", icon: Users, description: "Acessos e roles" },
  { title: "Marketplace", href: "/master/marketplace", icon: Store, badge: "Match", description: "Ecossistema ativo" },
  {
    title: "IA e Créditos",
    icon: Bot,
    description: "Uso, custos e limites",
    children: [
      { title: "Uso IA", href: "/master/ia", icon: Bot, description: "Consumo e alertas" },
      { title: "Créditos", href: "/master/creditos", icon: CreditCard, description: "Pacotes e ajustes" },
      { title: "Custos", href: "/master/financeiro", icon: HandCoins, description: "Impacto financeiro" },
      { title: "Logs IA", href: "/master/logs", icon: Logs, description: "Eventos e trilhas" },
    ],
  },
  { title: "WhatsApp", href: "/master/whatsapp", icon: MessageSquareText, description: "Números e consumo" },
  { title: "Atlas", href: "/master/atlas", icon: ShieldAlert, description: "Chamados e escalonamentos" },
  { title: "Relatórios", href: "/master/relatorios", icon: BarChart3, description: "Leituras executivas" },
  { title: "Templates", href: "/master/templates", icon: FileStack, description: "Biblioteca premium" },
  { title: "Planos", href: "/master/planos", icon: Wallet, description: "SaaS e add-ons" },
  { title: "Logs", href: "/master/logs", icon: Logs, description: "Auditoria" },
  { title: "Configurações", href: "/master/configuracoes", icon: Settings, description: "Parâmetros globais" },
]

export const agencyNavigation: NavItem[] = [
  { title: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard, description: "Operação do dia" },
  { title: "Clientes", href: "/app/clientes", icon: Users, description: "Base e relacionamento" },
  { title: "Leads", href: "/app/leads", icon: Waypoints, description: "Pipeline comercial" },
  {
    title: "Viagens",
    href: "/app/viagens",
    icon: BriefcaseBusiness,
    description: "Jornadas e propostas",
    children: [
      { title: "Todas as viagens", href: "/app/viagens", icon: BriefcaseBusiness, description: "Visão completa" },
      { title: "Roteiros", href: "/app/viagens/roteiros", icon: Route, description: "Experiência do cliente" },
      { title: "Cotações", href: "/app/viagens/cotacoes", icon: Receipt, description: "Propostas e aprovação" },
    ],
  },
  {
    title: "Documentos",
    href: "/app/documentos",
    icon: FileText,
    description: "Hub documental",
    children: [
      { title: "Todos os documentos", href: "/app/documentos", icon: FileText, description: "Visão consolidada" },
      { title: "Contratos", href: "/app/documentos/contratos", icon: ShieldCheck, description: "Assinaturas e histórico" },
      { title: "Vouchers", href: "/app/documentos/vouchers", icon: FileText, description: "Hospedagem e serviços" },
      { title: "Recibos", href: "/app/documentos/recibos", icon: Receipt, description: "Comprovantes" },
      { title: "Passagens", href: "/app/documentos/passagens", icon: BriefcaseBusiness, description: "Trechos e emissões" },
      { title: "Templates", href: "/app/documentos/templates", icon: FileStack, description: "Modelos e layouts" },
    ],
  },
  {
    title: "Catálogo",
    href: "/app/catalogo",
    icon: Palette,
    description: "Vitrine pública",
    children: [
      { title: "Catálogo da agência", href: "/app/catalogo", icon: Palette, description: "Gestão da vitrine" },
      { title: "TravelPro Match", href: "/app/catalogo/travelpro-match", icon: Target, description: "Marketplace e leads" },
    ],
  },
  { title: "TravelPro Go", href: "/app/travelpro-go", icon: MessageSquareText, description: "WhatsApp operacional" },
  {
    title: "Expansões",
    icon: ChevronRight,
    description: "Módulos premium",
    children: [
      { title: "TravelPro Agent", href: "/app/agent", icon: Bot, description: "Atendimento com IA" },
      { title: "Marketing IA", href: "/app/marketing", icon: BarChart3, description: "Campanhas e ideias" },
      { title: "Atlas Advisor", href: "/app/atlas-advisor", icon: Target, description: "Consultoria operacional" },
      { title: "Automações Premium", href: "/app/automacoes", icon: Workflow, description: "Fluxos automáticos" },
    ],
  },
  {
    title: "Central Operacional",
    href: "/app/central-operacional",
    icon: FileStack,
    description: "Rotina e inteligência",
    children: [
      { title: "Visão geral", href: "/app/central-operacional", icon: FileStack, description: "Prioridades do dia" },
      { title: "Insights", href: "/app/central-operacional/insights", icon: LineChart, description: "Leituras inteligentes" },
      { title: "Créditos e consumo", href: "/app/central-operacional/creditos", icon: CreditCard, description: "Uso e renovação" },
      { title: "Tarefas", href: "/app/central-operacional/tarefas", icon: CheckCheck, description: "Execução operacional" },
      { title: "Relatórios", href: "/app/central-operacional/relatorios", icon: BarChart3, description: "Resumo analítico" },
    ],
  },
  { title: "Financeiro", href: "/app/financeiro", icon: HandCoins, description: "Receita e margem" },
  { title: "Equipe", href: "/app/equipe", icon: Users, description: "Papéis e acessos" },
]

export const clientNavigation: NavItem[] = [
  { title: "Dashboard", href: "/cliente/dashboard", icon: LayoutDashboard, description: "Resumo da viagem" },
  { title: "Viagem", href: "/cliente/viagem", icon: BriefcaseBusiness, description: "Detalhes da jornada" },
  { title: "Documentos", href: "/cliente/documentos", icon: FileText, description: "Tudo pronto" },
  { title: "Roteiro", href: "/cliente/roteiro", icon: Route, description: "Dia a dia" },
  { title: "Mensagens", href: "/cliente/mensagens", icon: MessagesSquare, description: "Canal com a agência" },
  { title: "Perfil", href: "/cliente/perfil", icon: Users, description: "Preferências" },
]

export const portalProfiles: Record<PortalKey, UserProfile> = {
  master: {
    name: "Mateus Nascimento",
    email: "master@travelpro.com",
    role: "MASTER",
    initials: "MN",
  },
  agency: {
    name: "Marina Alves",
    email: "marina@horizonteviagens.com",
    role: "AGENCY_ADMIN",
    initials: "MA",
  },
  client: {
    name: "Ana Martins",
    email: "ana.martins@email.com",
    role: "CLIENT",
    initials: "AM",
  },
}

export const portalTitles: Record<PortalKey, string> = {
  master: "TravelPro Master",
  agency: "TravelPro Operacional",
  client: "TravelPro Cliente",
}

export function getNavigationByPortal(portal: PortalKey) {
  if (portal === "master") return masterNavigation
  if (portal === "client") return clientNavigation
  return agencyNavigation
}

export function flattenNavigation(items: NavItem[]): NavItem[] {
  return items
    .flatMap((item) => [item, ...(item.children ? flattenNavigation(item.children) : [])])
    .filter((item) => Boolean(item.href))
}
