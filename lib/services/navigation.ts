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
  { title: "Dashboard", href: "/master/dashboard", icon: LayoutDashboard, description: "Visao executiva" },
  { title: "Agencias", href: "/master/agencias", icon: Building2, description: "Base ativa" },
  { title: "Financeiro", href: "/master/financeiro", icon: HandCoins, description: "Receita e cobranca" },
  { title: "Usuarios", href: "/master/usuarios", icon: Users, description: "Acessos e roles" },
  { title: "Marketplace", href: "/master/marketplace", icon: Store, badge: "Match", description: "Ecossistema ativo" },
  {
    title: "IA e Creditos",
    href: "/master/ia-creditos",
    icon: Bot,
    description: "Uso, custos e limites",
    children: [
      { title: "Uso IA", href: "/master/ia-creditos/uso-ia", icon: Bot, description: "Consumo e alertas" },
      { title: "Creditos", href: "/master/ia-creditos/creditos", icon: CreditCard, description: "Pacotes e ajustes" },
      { title: "Custos", href: "/master/ia-creditos/custos", icon: HandCoins, description: "Impacto financeiro" },
      { title: "Logs IA", href: "/master/ia-creditos/logs-ia", icon: Logs, description: "Eventos e trilhas" },
    ],
  },
  { title: "WhatsApp", href: "/master/whatsapp", icon: MessageSquareText, description: "Numeros e consumo" },
  { title: "Atlas", href: "/master/atlas", icon: ShieldAlert, description: "Chamados e escalonamentos" },
  { title: "Relatorios", href: "/master/relatorios", icon: BarChart3, description: "Leituras executivas" },
  { title: "Templates", href: "/master/templates", icon: FileStack, description: "Biblioteca premium" },
  { title: "Planos", href: "/master/planos", icon: Wallet, description: "SaaS e add-ons" },
  { title: "Logs", href: "/master/logs", icon: Logs, description: "Auditoria" },
  { title: "Configuracoes", href: "/master/configuracoes", icon: Settings, description: "Parametros globais" },
]

export const agencyNavigation: NavItem[] = [
  { title: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard, description: "Operacao do dia" },
  { title: "Clientes", href: "/app/clientes", icon: Users, description: "Base e relacionamento" },
  { title: "Leads", href: "/app/leads", icon: Waypoints, description: "Pipeline comercial" },
  {
    title: "Viagens",
    href: "/app/viagens",
    icon: BriefcaseBusiness,
    description: "Jornadas e propostas",
    children: [
      { title: "Todas as viagens", href: "/app/viagens", icon: BriefcaseBusiness, description: "Visao completa" },
      { title: "Roteiros", href: "/app/viagens/roteiros", icon: Route, description: "Experiencia do cliente" },
      { title: "Cotacoes", href: "/app/viagens/cotacoes", icon: Receipt, description: "Propostas e aprovacao" },
    ],
  },
  {
    title: "Documentos",
    href: "/app/documentos",
    icon: FileText,
    description: "Hub documental",
    children: [
      { title: "Todos os documentos", href: "/app/documentos", icon: FileText, description: "Visao consolidada" },
      { title: "Contratos", href: "/app/documentos/contratos", icon: ShieldCheck, description: "Assinaturas e historico" },
      { title: "Vouchers", href: "/app/documentos/vouchers", icon: FileText, description: "Hospedagem e servicos" },
      { title: "Recibos", href: "/app/documentos/recibos", icon: Receipt, description: "Comprovantes" },
      { title: "Passagens", href: "/app/documentos/passagens", icon: BriefcaseBusiness, description: "Trechos e emissoes" },
      { title: "Templates", href: "/app/documentos/templates", icon: FileStack, description: "Modelos e layouts" },
    ],
  },
  {
    title: "Catalogo",
    href: "/app/catalogo",
    icon: Palette,
    description: "Vitrine publica",
    children: [
      { title: "Catalogo da agencia", href: "/app/catalogo", icon: Palette, description: "Gestao da vitrine" },
      { title: "TravelPro Match", href: "/app/catalogo/travelpro-match", icon: Target, description: "Marketplace e leads" },
    ],
  },
  { title: "TravelPro Go", href: "/app/travelpro-go", icon: MessageSquareText, description: "WhatsApp operacional" },
  {
    title: "Expansoes",
    icon: ChevronRight,
    description: "Modulos premium",
    children: [
      { title: "TravelPro Agent", href: "/app/agent", icon: Bot, description: "Atendimento com IA" },
      { title: "Marketing IA", href: "/app/marketing", icon: BarChart3, description: "Campanhas e ideias" },
      { title: "Atlas Advisor", href: "/app/atlas-advisor", icon: Target, description: "Consultoria operacional" },
      { title: "Automacoes Premium", href: "/app/automacoes", icon: Workflow, description: "Fluxos automaticos" },
    ],
  },
  {
    title: "Central Operacional",
    href: "/app/central-operacional",
    icon: FileStack,
    description: "Rotina e inteligencia",
    children: [
      { title: "Visao geral", href: "/app/central-operacional", icon: FileStack, description: "Prioridades do dia" },
      { title: "Insights", href: "/app/central-operacional/insights", icon: LineChart, description: "Leituras inteligentes" },
      { title: "Creditos e consumo", href: "/app/central-operacional/creditos", icon: CreditCard, description: "Uso e renovacao" },
      { title: "Tarefas", href: "/app/central-operacional/tarefas", icon: CheckCheck, description: "Execucao operacional" },
      { title: "Relatorios", href: "/app/central-operacional/relatorios", icon: BarChart3, description: "Resumo analitico" },
    ],
  },
  { title: "Financeiro", href: "/app/financeiro", icon: HandCoins, description: "Receita e margem" },
  { title: "Equipe", href: "/app/equipe", icon: Users, description: "Papeis e acessos" },
]

export const clientNavigation: NavItem[] = [
  { title: "Dashboard", href: "/cliente/dashboard", icon: LayoutDashboard, description: "Resumo da viagem" },
  { title: "Viagem", href: "/cliente/viagem", icon: BriefcaseBusiness, description: "Detalhes da jornada" },
  { title: "Documentos", href: "/cliente/documentos", icon: FileText, description: "Tudo pronto" },
  { title: "Roteiro", href: "/cliente/roteiro", icon: Route, description: "Dia a dia" },
  { title: "Mensagens", href: "/cliente/mensagens", icon: MessagesSquare, description: "Canal com a agencia" },
  { title: "Perfil", href: "/cliente/perfil", icon: Users, description: "Preferencias" },
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
