import {
  AlertTriangle,
  ArrowUpRight,
  BadgeDollarSign,
  Bot,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  ChartNoAxesCombined,
  CheckCheck,
  CreditCard,
  DollarSign,
  FilePenLine,
  FileStack,
  FileText,
  HandCoins,
  HeartHandshake,
  LineChart,
  MessageCircleMore,
  MessageSquareText,
  NotebookText,
  Palette,
  PlaneTakeoff,
  Receipt,
  ShieldCheck,
  Sparkles,
  Tags,
  Target,
  TrendingUp,
  UserRoundPlus,
  Users,
  Wallet,
  Waypoints,
} from "lucide-react"
import { agencies } from "@/mock/agencies"
import { clients } from "@/mock/clients"
import { leads } from "@/mock/leads"
import { trips } from "@/mock/trips"
import { documents } from "@/mock/documents"
import { tasks } from "@/mock/tasks"
import { notifications } from "@/mock/notifications"
import { financialSummary, payments } from "@/mock/financial"
import { templates } from "@/mock/templates"
import type { PortalPageConfig } from "@/lib/services/portal-types"

const growthSeries = [
  { label: "Jan", value: 18 },
  { label: "Fev", value: 26 },
  { label: "Mar", value: 32 },
  { label: "Abr", value: 44 },
  { label: "Mai", value: 51 },
  { label: "Jun", value: 63 },
]

const agencyPerformanceSeries = [
  { label: "Seg", value: 22 },
  { label: "Ter", value: 34 },
  { label: "Qua", value: 40 },
  { label: "Qui", value: 38 },
  { label: "Sex", value: 49 },
  { label: "Sáb", value: 27 },
]

const clientCountdownSeries = [
  { label: "Checklist", value: 88 },
  { label: "Docs", value: 100 },
  { label: "Roteiro", value: 76 },
  { label: "Mensagens", value: 42 },
]

export const masterPages: Record<string, PortalPageConfig> = {
  dashboard: {
    title: "Dashboard Master",
    description: "Visão executiva da plataforma TravelPro com saúde comercial, financeira e operacional.",
    primaryAction: "Nova campanha",
    secondaryAction: "Exportar relatório",
    primaryActionHref: "/master/marketplace",
    secondaryActionHref: "/master/financeiro",
    metrics: [
      { label: "Agências ativas", value: "128", change: "+12 este mês", tone: "success", icon: Building2 },
      { label: "Usuários registrados", value: "1.482", change: "+84 esta semana", tone: "info", icon: Users },
      { label: "MRR estimado", value: financialSummary.mrr, change: "+8,4%", tone: "success", icon: DollarSign },
      { label: "Uso IA", value: "74k exec.", change: "R$ 6.420 custo", tone: "warning", icon: Bot },
      { label: "Uso WhatsApp", value: "184k msgs", change: "+14%", tone: "info", icon: MessageSquareText },
      { label: "Créditos consumidos", value: "228k", change: "86% do previsto", tone: "warning", icon: CreditCard },
    ],
    blocks: [
      { type: "chart", title: "Crescimento da base", description: "Novas agências ativas por ciclo de cobrança.", span: "half", series: growthSeries },
      {
        type: "highlights",
        title: "Resumo financeiro",
        description: "Receita, custos e alertas rápidos do ciclo atual.",
        span: "half",
        columns: 2,
        items: [
          { title: "Receita acumulada", description: financialSummary.revenue, meta: "Mês corrente", tone: "success", icon: BadgeDollarSign },
          { title: "Custos operacionais", description: financialSummary.costs, meta: "IA + WhatsApp + infra", tone: "warning", icon: Wallet },
          { title: "Inadimplência", description: "3 agências", meta: financialSummary.pending, tone: "danger", icon: AlertTriangle },
          { title: "Ticket médio", description: "R$ 1.248", meta: "Planos + add-ons", tone: "info", icon: TrendingUp },
        ],
      },
      {
        type: "table",
        title: "Últimas agências cadastradas",
        description: "Acompanhamento de onboarding e expansão da base.",
        span: "full",
        columns: [
          { key: "name", label: "Agência" },
          { key: "owner", label: "Responsável" },
          { key: "plan", label: "Plano" },
          { key: "status", label: "Status" },
          { key: "city", label: "Cidade" },
        ],
        rows: agencies,
      },
      {
        type: "feed",
        title: "Alertas de custo e operação",
        description: "Sinais prioritários para ação do time Master.",
        span: "half",
        items: notifications.map((item) => ({ ...item, href: "/master/logs" })),
      },
      {
        type: "table",
        title: "Resumo financeiro mockado",
        description: "Pagamentos, próximos vencimentos e status das assinaturas.",
        span: "half",
        columns: [
          { key: "agency", label: "Agência" },
          { key: "plan", label: "Plano" },
          { key: "amount", label: "Valor" },
          { key: "status", label: "Status" },
          { key: "dueDate", label: "Vencimento" },
        ],
        rows: payments,
      },
    ],
  },
  agencias: {
    title: "Agências",
    description: "Gestão de contas, planos, consumo e controle operacional da base instalada.",
    searchPlaceholder: "Buscar agência, cidade ou responsável",
    filterTabs: ["Todas", "Ativas", "Inativas", "Elite", "Growth"],
    primaryAction: "Nova agência",
    secondaryAction: "Exportar base",
    primaryActionHref: "/master/agencias/nova",
    secondaryActionHref: "/master/financeiro",
    blocks: [
      {
        type: "table",
        title: "Listagem de agências",
        description: "Status ativo/inativo, plano, uso IA, uso WhatsApp e créditos.",
        span: "full",
        columns: [
          { key: "name", label: "Agência" },
          { key: "plan", label: "Plano" },
          { key: "status", label: "Status" },
          { key: "iaUsage", label: "Uso IA" },
          { key: "whatsappUsage", label: "Uso WhatsApp" },
          { key: "credits", label: "Créditos" },
        ],
        rows: agencies,
      },
      {
        type: "highlights",
        title: "Ações rápidas",
        description: "Fluxos mais comuns da operação Master sobre agências.",
        span: "half",
        items: [
          { title: "Ver detalhes da conta", description: "Abrir plano, uso e históricos completos.", icon: Building2, href: "/master/agencias" },
          { title: "Bloquear ou desbloquear", description: "Controle operacional com registro em auditoria.", tone: "warning", icon: ShieldCheck, href: "/master/logs" },
          { title: "Ajustar créditos", description: "Lançar bônus ou correções manuais.", tone: "info", icon: CreditCard, href: "/master/creditos" },
        ],
      },
      {
        type: "feed",
        title: "Movimentações recentes",
        description: "Eventos relevantes na base de agências.",
        span: "half",
        items: [
          { title: "Horizonte Viagens ativou o Agent", description: "Fluxo operacional liberado para o time comercial.", time: "há 15 min", tone: "success" },
          { title: "Serra Azul bloqueada por inadimplência", description: "Aguardando regularização automática via cobrança.", time: "há 42 min", tone: "warning" },
          { title: "Destino Certo migrou para Growth", description: "Novo limite de IA e WhatsApp já aplicado.", time: "há 1h", tone: "info" },
        ],
      },
    ],
  },
  financeiro: {
    title: "Financeiro",
    description: "Assinaturas, pagamentos, inadimplência, receita mensal e histórico da plataforma.",
    filterTabs: ["MRR", "Pagamentos", "Inadimplência", "Histórico"],
    primaryAction: "Gerar cobrança",
    secondaryAction: "Baixar relatório",
    metrics: [
      { label: "Receita mensal", value: financialSummary.revenue, change: "Fechamento parcial", tone: "success", icon: DollarSign },
      { label: "Inadimplência", value: financialSummary.pending, change: "3 contas em atraso", tone: "danger", icon: AlertTriangle },
      { label: "Assinaturas ativas", value: "124", change: "4 upgrades esta semana", tone: "info", icon: Wallet },
      { label: "Próximos vencimentos", value: "18", change: "7 dias", tone: "warning", icon: CalendarClock },
    ],
    blocks: [
      {
        type: "table",
        title: "Histórico de pagamentos",
        description: "Recebíveis, planos e próximos vencimentos.",
        span: "full",
        columns: [
          { key: "agency", label: "Agência" },
          { key: "plan", label: "Plano" },
          { key: "amount", label: "Valor" },
          { key: "status", label: "Status" },
          { key: "dueDate", label: "Vencimento" },
        ],
        rows: payments,
      },
      {
        type: "highlights",
        title: "Resumo operacional",
        span: "half",
        items: [
          { title: "Assinaturas em renovação", description: "14 contratos em janela de renegociação.", icon: Receipt },
          { title: "Pagamentos recuperados", description: "R$ 3.200 após régua manual.", tone: "success", icon: ArrowUpRight },
          { title: "Cobrança em risco", description: "2 webhooks precisarão de revisão futura.", tone: "warning", icon: AlertTriangle },
        ],
      },
      {
        type: "feed",
        title: "Linha do tempo financeira",
        span: "half",
        items: [
          { title: "Plano Elite renovado", description: "Atlântico Premium concluiu o ciclo anual.", time: "há 20 min", tone: "success" },
          { title: "Falha em pagamento", description: "Serra Azul Turismo caiu na régua de recuperação.", time: "há 54 min", tone: "danger" },
          { title: "Pacote extra de créditos", description: "Horizonte Viagens contratou add-on mensal.", time: "há 2h", tone: "info" },
        ],
      },
    ],
  },
  usuarios: {
    title: "Usuários",
    description: "Controle de usuários Master, permissões, funções e status de acesso.",
    searchPlaceholder: "Buscar usuário por nome ou role",
    primaryAction: "Convidar usuário",
    blocks: [
      {
        type: "table",
        title: "Usuários Master",
        description: "Permissões e funções administrativas da plataforma.",
        span: "full",
        columns: [
          { key: "name", label: "Nome" },
          { key: "email", label: "E-mail" },
          { key: "role", label: "Função" },
          { key: "status", label: "Status" },
        ],
        rows: [
          { name: "Mateus Nascimento", email: "master@travelpro.com", role: "MASTER", status: "Ativo" },
          { name: "Julia Prado", email: "ops@travelpro.com", role: "AGENCY_MANAGER", status: "Ativo" },
          { name: "Leonardo Maia", email: "finance@travelpro.com", role: "AGENCY_FINANCE", status: "Convite pendente" },
        ],
      },
      {
        type: "highlights",
        title: "Permissões base",
        span: "full",
        columns: 3,
        items: [
          { title: "MASTER", description: "Controle total da plataforma, billing, IA e auditoria.", icon: ShieldCheck },
          { title: "AGENCY_MANAGER", description: "Acompanha contas, onboarding e gestão operacional.", icon: Users },
          { title: "AGENCY_FINANCE", description: "Opera cobrança, ajustes e conciliação.", icon: Wallet },
        ],
      },
    ],
  },
  templates: {
    title: "Templates",
    description: "Roteiros, contratos, cotações, documentos e templates premium da operação.",
    filterTabs: ["Todos", "Roteiros", "Contratos", "Cotações", "Premium"],
    primaryAction: "Novo template",
    blocks: [
      {
        type: "table",
        title: "Biblioteca de templates",
        description: "Base visual para roteiros, contratos, cotações e documentos.",
        span: "full",
        columns: [
          { key: "name", label: "Template" },
          { key: "type", label: "Tipo" },
          { key: "category", label: "Categoria" },
          { key: "status", label: "Status" },
        ],
        rows: templates,
      },
      {
        type: "empty",
        title: "Templates premium futuros",
        description: "Esta área já está preparada para planos premium, versionamento e publicação por agência.",
        span: "half",
        actionLabel: "Planejar catálogo premium",
      },
      {
        type: "feed",
        title: "Atualizações recentes",
        span: "half",
        items: [
          { title: "Roteiro Premium Europa atualizado", description: "Nova versão com blocos modulares e CTA de upsell.", time: "hoje", tone: "info" },
          { title: "Contrato padrão revisado", description: "Texto institucional alinhado ao novo branding TravelPro.", time: "ontem", tone: "success" },
        ],
      },
    ],
  },
  ia: {
    title: "IA",
    description: "Consumo por agência, logs, custo estimado, alertas de abuso e limites operacionais.",
    filterTabs: ["Uso", "Custos", "Logs", "Limites"],
    primaryAction: "Ajustar limites",
    blocks: [
      {
        type: "table",
        title: "Consumo por agência",
        description: "Volume estimado de prompts, respostas e custo distribuído.",
        span: "full",
        columns: [
          { key: "name", label: "Agência" },
          { key: "iaUsage", label: "Uso IA" },
          { key: "credits", label: "Créditos" },
          { key: "status", label: "Status" },
        ],
        rows: agencies.map((agency) => ({
          name: agency.name,
          iaUsage: agency.iaUsage,
          credits: agency.credits,
          status: agency.status,
        })),
      },
      {
        type: "feed",
        title: "Logs IA",
        span: "half",
        items: [
          { title: "Resumo semanal gerado", description: "Horizonte Viagens executou 142 insights automáticos.", time: "há 9 min", tone: "success" },
          { title: "Pico de consumo fora do padrão", description: "Atlântico Premium ultrapassou a janela média do plano.", time: "há 28 min", tone: "warning" },
          { title: "Nova política de limite", description: "Mock preparado para futuros thresholds por role.", time: "há 2h", tone: "info" },
        ],
      },
      {
        type: "chart",
        title: "Custo estimado de IA",
        description: "Leitura visual de consumo mockado por janela recente.",
        span: "half",
        series: growthSeries,
      },
    ],
  },
  whatsapp: {
    title: "WhatsApp",
    description: "Números conectados, TravelPro Go, Agent, status da conexão e consumo de mensagens.",
    primaryAction: "Adicionar número",
    blocks: [
      {
        type: "table",
        title: "Números conectados",
        description: "Status de conexão, volume de mensagens e módulos habilitados.",
        span: "full",
        columns: [
          { key: "agency", label: "Agência" },
          { key: "number", label: "Número" },
          { key: "status", label: "Status" },
          { key: "go", label: "TravelPro Go" },
          { key: "agent", label: "Agent" },
          { key: "messages", label: "Mensagens" },
        ],
        rows: [
          { agency: "Horizonte Viagens", number: "+55 11 99888-1111", status: "Conectado", go: "Ativo", agent: "Ativo", messages: "12.480" },
          { agency: "Atlântico Premium", number: "+55 21 99777-2222", status: "Conectado", go: "Ativo", agent: "Pausado", messages: "9.230" },
          { agency: "Destino Certo", number: "+55 31 99666-3333", status: "Instável", go: "Ativo", agent: "Ativo", messages: "7.540" },
        ],
      },
      {
        type: "highlights",
        title: "Módulos habilitados",
        span: "half",
        items: [
          { title: "TravelPro Go", description: "Execução operacional via WhatsApp com comandos auditáveis.", icon: MessageSquareText },
          { title: "TravelPro Agent", description: "Atendimento e qualificação com controle de autonomia.", icon: Bot },
        ],
      },
      {
        type: "feed",
        title: "Saúde da conexão",
        span: "half",
        items: [
          { title: "Números online", description: "93% da base conectada na última janela.", time: "agora", tone: "success" },
          { title: "Oscilação em um provedor", description: "Mock preparado para alerta por webhook e SLA.", time: "há 35 min", tone: "warning" },
        ],
      },
    ],
  },
  creditos: {
    title: "Créditos",
    description: "Histórico de créditos, pacotes, consumo e ajustes manuais da plataforma.",
    primaryAction: "Adicionar créditos",
    blocks: [
      {
        type: "table",
        title: "Ledger de créditos",
        description: "Pacotes contratados, consumo e ajustes manuais por agência.",
        span: "full",
        columns: [
          { key: "agency", label: "Agência" },
          { key: "package", label: "Pacote" },
          { key: "used", label: "Consumido" },
          { key: "remaining", label: "Saldo" },
          { key: "status", label: "Status" },
        ],
        rows: [
          { agency: "Horizonte Viagens", package: "5.000 créditos", used: "800", remaining: "4.200", status: "Saudável" },
          { agency: "Atlântico Premium", package: "4.000 créditos", used: "1.020", remaining: "2.980", status: "Saudável" },
          { agency: "Serra Azul Turismo", package: "500 créditos", used: "120", remaining: "380", status: "Baixo uso" },
        ],
      },
      {
        type: "feed",
        title: "Ajustes manuais",
        span: "half",
        items: [
          { title: "Bônus promocional", description: "Destino Certo recebeu +1.000 créditos para campanha de inverno.", time: "há 50 min", tone: "info" },
          { title: "Reversão operacional", description: "Crédito devolvido após erro de integração mockada.", time: "ontem", tone: "warning" },
        ],
      },
      {
        type: "empty",
        title: "Pacotes extras e billing",
        description: "Base preparada para conectar Stripe e regras automáticas de renovação de créditos.",
        span: "half",
        actionLabel: "Modelar pacotes extras",
      },
    ],
  },
  planos: {
    title: "Planos",
    description: "Planos SaaS, limites, pacotes extras e add-ons disponíveis na plataforma.",
    primaryAction: "Criar plano",
    blocks: [
      {
        type: "highlights",
        title: "Grade de planos",
        description: "Visão rápida dos limites e add-ons mockados.",
        span: "full",
        columns: 4,
        items: [
          { title: "Start", description: "Até 2 usuários, IA básica e 500 créditos.", meta: "R$ 490", icon: Wallet },
          { title: "Growth", description: "Equipe comercial completa, catálogo e 2.000 créditos.", meta: "R$ 990", tone: "info", icon: TrendingUp },
          { title: "Scale", description: "TravelPro Go + Agent + dashboard avançado.", meta: "R$ 1.490", tone: "success", icon: Sparkles },
          { title: "Elite", description: "Operação premium com add-ons e suporte estratégico.", meta: "R$ 2.390", tone: "warning", icon: ShieldCheck },
        ],
      },
      {
        type: "empty",
        title: "Add-ons futuros",
        description: "Mock preparado para billing recorrente de IA, WhatsApp, créditos extras e premium templates.",
        span: "full",
        actionLabel: "Desenhar add-ons",
      },
    ],
  },
  marketplace: {
    title: "Marketplace",
    description: "Ecossistema do TravelPro Match com crescimento, conversões e destaque premium.",
    primaryAction: "Ver destaques",
    secondaryAction: "Abrir agências",
    primaryActionHref: "/master/agencias",
    secondaryActionHref: "/master/marketplace",
    metrics: [
      { label: "Agências participantes", value: "62", change: "+9 este mês", tone: "success", icon: Building2 },
      { label: "Receita do Match", value: "R$ 18.420", change: "+14%", tone: "success", icon: DollarSign },
      { label: "Leads gerados", value: "428", change: "31 quentes", tone: "info", icon: Waypoints },
      { label: "Conversões", value: "17,8%", change: "acima da média", tone: "warning", icon: TrendingUp },
    ],
    blocks: [
      {
        type: "chart",
        title: "Crescimento do marketplace",
        description: "Visualizações e conversões em ritmo de expansão.",
        span: "half",
        series: growthSeries,
      },
      {
        type: "highlights",
        title: "Visão premium",
        span: "half",
        items: [
          { title: "Pacotes ativos", description: "148 anúncios em circulação com score ativo.", icon: Target, href: "/master/marketplace" },
          { title: "Match médio", description: "78% de aderência entre busca e oferta.", tone: "info", icon: Sparkles, href: "/master/marketplace" },
          { title: "Destaques ativos", description: "12 agências em impulsionamento premium.", tone: "warning", icon: BadgeDollarSign, href: "/master/agencias" },
        ],
      },
      {
        type: "table",
        title: "Agências participantes",
        description: "Operação ativa com receita, score e crescimento.",
        span: "full",
        columns: [
          { key: "name", label: "Agência" },
          { key: "plan", label: "Plano" },
          { key: "iaUsage", label: "Uso IA" },
          { key: "credits", label: "Créditos" },
          { key: "status", label: "Status" },
        ],
        rows: agencies,
      },
    ],
  },
  logs: {
    title: "Logs",
    description: "Eventos do sistema, ações administrativas, erros e trilha de auditoria.",
    filterTabs: ["Sistema", "Administração", "Erros", "Auditoria"],
    blocks: [
      {
        type: "feed",
        title: "Eventos recentes",
        description: "Leitura rápida da auditoria mockada da plataforma.",
        span: "full",
        items: [
          { title: "Role atualizada", description: "Julia Prado recebeu acesso financeiro temporário.", time: "há 10 min", tone: "info" },
          { title: "Ajuste manual de créditos", description: "Destino Certo +1.000 créditos com justificativa registrada.", time: "há 28 min", tone: "warning" },
          { title: "Conexão WhatsApp restabelecida", description: "Horizonte Viagens voltou ao estado conectado.", time: "há 1h", tone: "success" },
          { title: "Falha de cobrança mockada", description: "Serra Azul Turismo encaminhada para régua de recuperação.", time: "há 2h", tone: "danger" },
        ],
      },
    ],
  },
  configuracoes: {
    title: "Configurações da plataforma",
    description: "Dados globais, chaves futuras, parâmetros gerais e ajustes administrativos.",
    primaryAction: "Salvar parâmetros",
    blocks: [
      {
        type: "highlights",
        title: "Blocos preparados para integração",
        span: "full",
        columns: 3,
        items: [
          { title: "Supabase", description: "Ambiente, chaves públicas e service role futuras.", icon: Building2 },
          { title: "OpenAI", description: "Modelos, orçamento, prompts e limites por agência.", icon: Bot },
          { title: "Stripe + WhatsApp", description: "Billing, webhooks e provedores de mensagem.", icon: CreditCard },
        ],
      },
      {
        type: "empty",
        title: "Parâmetros gerais",
        description: "A estrutura visual já está pronta para receber formulários reais, secrets e toggles globais.",
        span: "full",
        actionLabel: "Mapear chaves futuras",
      },
    ],
  },
  atlas: {
    title: "Atlas",
    description: "Central de chamados, dúvidas e escalonamentos do ecossistema TravelPro.",
    primaryAction: "Criar artigo",
    blocks: [
      {
        type: "highlights",
        title: "Visão operacional",
        span: "full",
        columns: 3,
        items: [
          { title: "Chamados abertos", description: "Fila pronta para triagem, SLA e escalonamento humano.", icon: ShieldCheck },
          { title: "Causas prováveis", description: "Estrutura preparada para classificar billing, Match, WhatsApp e Atlas.", icon: AlertTriangle },
          { title: "Base de soluções", description: "Artigos, respostas e repertório para reduzir recorrência.", icon: FileStack },
        ],
      },
    ],
  },
  relatorios: {
    title: "Relatórios",
    description: "Agências, financeiro, usuários, marketplace, IA, WhatsApp, Atlas, planos e uso geral.",
    primaryAction: "Gerar relatório",
    secondaryAction: "Exportar PDF",
    blocks: [
      {
        type: "highlights",
        title: "Centro executivo",
        span: "full",
        columns: 3,
        items: [
          { title: "Leituras por período", description: "Janela pronta para filtros por data, plano, agência e status.", icon: LineChart },
          { title: "Exportações", description: "Fluxos mockados para PDF e CSV sem bloquear o layout atual.", icon: FileStack },
          { title: "Uso geral", description: "Base pronta para consolidar IA, créditos, billing e marketplace.", icon: ChartNoAxesCombined },
        ],
      },
    ],
  },
}

export const agencyPages: Record<string, PortalPageConfig> = {
  dashboard: {
    title: "Dashboard da agência",
    description: "Operação resumida com prioridades do dia, visão financeira e inteligência do TravelPro.",
    primaryAction: "Nova viagem",
    secondaryAction: "Abrir central",
    primaryActionHref: "/app/viagens/nova",
    secondaryActionHref: "/app/central-operacional",
    metrics: [
      { label: "Leads novos", value: "24", change: "+6 hoje", tone: "success", icon: Waypoints },
      { label: "Viagens em andamento", value: "12", change: "4 próximas partidas", tone: "info", icon: PlaneTakeoff },
      { label: "Documentos pendentes", value: "7", change: "2 urgentes", tone: "warning", icon: FileText },
      { label: "Follow-ups pendentes", value: "14", change: "3 quentes", tone: "warning", icon: HeartHandshake },
      { label: "Resumo financeiro", value: "R$ 84.200", change: "R$ 12.400 a receber", tone: "success", icon: DollarSign },
      { label: "TravelPro Go", value: "Ativo", change: "184 comandos", tone: "info", icon: MessageSquareText },
    ],
    blocks: [
      {
        type: "highlights",
        title: "Ações rápidas",
        description: "Atalhos para as tarefas mais frequentes da operação.",
        span: "half",
        columns: 2,
        items: [
          { title: "Novo cliente", description: "Cadastrar contato e iniciar funil.", icon: UserRoundPlus, href: "/app/clientes/novo" },
          { title: "Nova cotação", description: "Criar proposta comercial personalizada.", icon: Receipt, href: "/app/viagens/cotacoes/nova" },
          { title: "Novo contrato", description: "Gerar documento da viagem e assinatura.", icon: FilePenLine, href: "/app/documentos/novo" },
          { title: "Publicar pacote", description: "Enviar oferta para o catálogo.", icon: Tags, href: "/app/catalogo/pacotes/novo" },
        ],
      },
      {
        type: "feed",
        title: "Notificações inteligentes",
        description: "Sinais recentes do Agent, WhatsApp e operação.",
        span: "half",
        items: [
          { title: "Lead quente identificado", description: "Carla Dias abriu a cotação 3 vezes na última hora.", time: "há 5 min", tone: "success", href: "/app/leads" },
          { title: "Contrato da Ana pronto", description: "Documento já recebeu branding e pode ser enviado.", time: "há 20 min", tone: "info", href: "/app/documentos/contratos" },
          { title: "Pagamento pendente", description: "João Ribeiro precisa quitar a segunda parcela.", time: "há 45 min", tone: "warning", href: "/app/financeiro" },
        ],
      },
      {
        type: "kanban",
        title: "Central operacional resumida",
        description: "Hoje, urgentes, follow-ups e concluídos em uma leitura única.",
        span: "full",
        columns: [
          {
            title: "Hoje",
            tone: "info",
            cards: [
              { title: "Enviar voucher hotel", description: "João Ribeiro • Orlando", meta: "14:00", tags: ["Documentos"] },
              { title: "Confirmar pagamento", description: "Ana Martins • Cancún", meta: "15:30", tags: ["Financeiro"] },
            ],
          },
          {
            title: "Urgentes",
            tone: "danger",
            cards: [
              { title: "Ajustar contrato", description: "Mudança de acompanhante", meta: "Agora", tags: ["Contrato"] },
            ],
          },
          {
            title: "Follow-ups",
            tone: "warning",
            cards: [
              { title: "Retorno da Carla Dias", description: "Lead Paris", meta: "16:30", tags: ["Comercial"] },
              { title: "Upsell seguro viagem", description: "Marina Costa", meta: "17:00", tags: ["Revenue"] },
            ],
          },
          {
            title: "Concluídos",
            tone: "success",
            cards: [
              { title: "Catálogo de inverno publicado", description: "Landing pública atualizada", meta: "11:10", tags: ["Marketing"] },
            ],
          },
        ],
      },
      {
        type: "chart",
        title: "Insights da semana",
        description: "Leitura rápida de produtividade e conversão do time.",
        span: "half",
        series: agencyPerformanceSeries,
      },
      {
        type: "table",
        title: "Tarefas de hoje",
        description: "Resumo executivo de pendências e áreas responsáveis.",
        span: "half",
        columns: [
          { key: "title", label: "Tarefa" },
          { key: "status", label: "Status" },
          { key: "owner", label: "Área" },
          { key: "due", label: "Prazo" },
        ],
        rows: tasks,
      },
    ],
  },
  clientes: {
    title: "Clientes",
    description: "Lista de clientes, busca, filtros, tags, status e detalhes operacionais.",
    searchPlaceholder: "Buscar cliente por nome, destino ou tag",
    filterTabs: ["Todos", "Ativos", "Em viagem", "Premium", "Família"],
    primaryAction: "Novo cliente",
    secondaryAction: "Importar contatos",
    blocks: [
      {
        type: "table",
        title: "Base de clientes",
        description: "Status, tags e próximos contextos de viagem.",
        span: "full",
        columns: [
          { key: "name", label: "Cliente" },
          { key: "tag", label: "Tag" },
          { key: "status", label: "Status" },
          { key: "destination", label: "Destino" },
          { key: "email", label: "E-mail" },
        ],
        rows: clients,
      },
      {
        type: "highlights",
        title: "Detalhe mockado do cliente",
        span: "half",
        items: [
          { title: "Ana Martins", description: "Perfil premium com viagem confirmada para Cancún.", meta: "Pagamento em dia", icon: Users },
          { title: "Preferências", description: "Resort all inclusive, experiências românticas e transfer privado.", icon: Sparkles },
        ],
      },
      {
        type: "empty",
        title: "Automação futura de CRM",
        description: "Esta estrutura já está pronta para timeline, documentos vinculados e sync com WhatsApp.",
        span: "half",
        actionLabel: "Definir campos customizados",
      },
    ],
  },
  leads: {
    title: "Leads",
    description: "Kanban comercial com temperatura, origem e evolução da negociação.",
    searchPlaceholder: "Buscar lead ou destino",
    filterTabs: ["Todos", "Quentes", "Instagram", "Google", "Indicação"],
    primaryAction: "Novo lead",
    blocks: [
      {
        type: "kanban",
        title: "Pipeline comercial",
        description: "Novo lead, atendimento, cotação, retorno, fechado e perdido.",
        span: "full",
        columns: [
          { title: "Novo lead", tone: "info", cards: leads.filter((item) => item.stage === "Novo lead").map((item) => ({ title: item.name, description: item.destination, meta: item.origin, tags: [item.temperature] })) },
          { title: "Em atendimento", tone: "warning", cards: leads.filter((item) => item.stage === "Em atendimento").map((item) => ({ title: item.name, description: item.destination, meta: item.origin, tags: [item.temperature] })) },
          { title: "Cotação enviada", tone: "default", cards: leads.filter((item) => item.stage === "Cotação enviada").map((item) => ({ title: item.name, description: item.destination, meta: item.origin, tags: [item.temperature] })) },
          { title: "Aguardando retorno", tone: "warning", cards: leads.filter((item) => item.stage === "Aguardando retorno").map((item) => ({ title: item.name, description: item.destination, meta: item.origin, tags: [item.temperature] })) },
          { title: "Fechado", tone: "success", cards: [{ title: "Larissa Monteiro", description: "Cruzeiro Caribe", meta: "Indicação", tags: ["Quente"] }] },
          { title: "Perdido", tone: "danger", cards: [{ title: "Henrique Paiva", description: "Lisboa", meta: "Google", tags: ["Frio"] }] },
        ],
      },
    ],
  },
  viagens: {
    title: "Viagens",
    description: "Controle de viagens com status, destino, cliente, datas, documentos e financeiro.",
    searchPlaceholder: "Buscar viagem, cliente ou destino",
    filterTabs: ["Todas", "Planejamento", "Confirmadas", "Em andamento"],
    primaryAction: "Nova viagem",
    blocks: [
      {
        type: "table",
        title: "Operação de viagens",
        span: "full",
        columns: [
          { key: "client", label: "Cliente" },
          { key: "destination", label: "Destino" },
          { key: "status", label: "Status" },
          { key: "dates", label: "Datas" },
          { key: "documents", label: "Documentos" },
          { key: "finance", label: "Financeiro" },
          { key: "itinerary", label: "Roteiro" },
        ],
        rows: trips,
      },
    ],
  },
  roteiros: {
    title: "Roteiros",
    description: "Roteiros por cliente, templates reutilizáveis e geração futura com IA.",
    primaryAction: "Criar roteiro",
    secondaryAction: "Usar template",
    blocks: [
      {
        type: "table",
        title: "Lista de roteiros",
        span: "half",
        columns: [
          { key: "name", label: "Template" },
          { key: "type", label: "Tipo" },
          { key: "category", label: "Categoria" },
          { key: "status", label: "Status" },
        ],
        rows: templates.filter((item) => item.type === "Roteiro"),
      },
      {
        type: "empty",
        title: "Exportar PDF futuramente",
        description: "A camada visual já está pronta para exportações, IA e versões finais por viagem.",
        span: "half",
        actionLabel: "Planejar exportação",
      },
    ],
  },
  documentos: {
    title: "Documentos",
    description: "Contratos, vouchers, passagens, recibos e anexos organizados por cliente e viagem.",
    primaryAction: "Novo documento",
    blocks: [
      {
        type: "table",
        title: "Hub documental",
        span: "full",
        columns: [
          { key: "name", label: "Documento" },
          { key: "client", label: "Cliente" },
          { key: "trip", label: "Viagem" },
          { key: "type", label: "Tipo" },
          { key: "status", label: "Status" },
        ],
        rows: documents,
      },
    ],
  },
  cotacoes: {
    title: "Cotações",
    description: "Cotações personalizadas com status, estrutura manual e espaço para IA futura.",
    primaryAction: "Criar cotação",
    blocks: [
      {
        type: "table",
        title: "Pipeline de cotações",
        span: "half",
        columns: [
          { key: "client", label: "Cliente" },
          { key: "destination", label: "Destino" },
          { key: "status", label: "Status" },
        ],
        rows: [
          { client: "Carla Dias", destination: "Paris", status: "Enviada" },
          { client: "Fabio Mello", destination: "Gramado", status: "Aguardando aprovação" },
          { client: "Beatriz Lima", destination: "Maceió", status: "Aprovada" },
        ],
      },
      {
        type: "empty",
        title: "PDF e IA futura",
        description: "Mock pronto para orçamento inteligente, templates e exportação em PDF.",
        span: "half",
        actionLabel: "Modelar layout da cotação",
      },
    ],
  },
  contratos: {
    title: "Contratos",
    description: "Contratos por template, status de assinatura e histórico operacional.",
    primaryAction: "Criar contrato",
    blocks: [
      {
        type: "table",
        title: "Contratos ativos",
        span: "full",
        columns: [
          { key: "name", label: "Documento" },
          { key: "client", label: "Cliente" },
          { key: "trip", label: "Viagem" },
          { key: "status", label: "Status" },
        ],
        rows: documents.filter((item) => item.type === "Contrato"),
      },
    ],
  },
  catalogo: {
    title: "Catálogo",
    description: "Pacotes publicados, rascunhos, links públicos e estrutura pronta para match futuro.",
    primaryAction: "Criar pacote",
    primaryActionHref: "/app/catalogo/pacotes/novo",
    blocks: [
      {
        type: "table",
        title: "Pacotes publicados",
        span: "half",
        columns: [
          { key: "name", label: "Pacote" },
          { key: "status", label: "Status" },
          { key: "link", label: "Link público" },
        ],
        rows: [
          { name: "Inverno em Gramado", status: "Publicado", link: "travelpro.app/gramado-inverno" },
          { name: "Verão em Cancún", status: "Rascunho", link: "travelpro.app/cancun-verao" },
        ],
      },
      {
        type: "highlights",
        title: "Próxima integração",
        span: "half",
        items: [
          { title: "TravelPro Match", description: "Preparado para futuras recomendações automáticas de pacotes.", icon: Target },
          { title: "Link público", description: "Estrutura visual pronta para catálogo da agência.", icon: Sparkles },
        ],
      },
    ],
  },
  "travelpro-match": {
    title: "TravelPro Match",
    description: "Anúncios, leads recebidos, score e impulsionamento do ecossistema TravelPro.",
    primaryAction: "Criar anúncio",
    secondaryAction: "Ver leads",
    primaryActionHref: "/app/catalogo/pacotes/novo",
    secondaryActionHref: "/app/leads",
    metrics: [
      { label: "Leads recebidos", value: "84", change: "+11 hoje", tone: "success", icon: Waypoints },
      { label: "Visualizações", value: "2.480", change: "+18%", tone: "info", icon: Sparkles },
      { label: "Taxa de match", value: "78%", change: "score médio", tone: "warning", icon: Target },
      { label: "Anúncios ativos", value: "12", change: "3 destacados", tone: "success", icon: Tags },
    ],
    blocks: [
      {
        type: "highlights",
        title: "Painel do Match",
        description: "Performance do catálogo dentro do marketplace.",
        span: "half",
        items: [
          { title: "Meus anúncios", description: "12 ativos, 3 em destaque premium.", icon: Tags, href: "/app/catalogo" },
          { title: "Leads recebidos", description: "Fila viva com prioridade por score e intenção.", tone: "success", icon: Waypoints, href: "/app/leads" },
          { title: "Impulsionamento", description: "2 campanhas com clique acima da média.", tone: "warning", icon: Sparkles, href: "/app/marketing" },
        ],
      },
      {
        type: "chart",
        title: "Estatísticas do Match",
        description: "Cliques, conversões e visibilidade recente.",
        span: "half",
        series: agencyPerformanceSeries,
      },
      {
        type: "table",
        title: "Pacotes ativos",
        span: "full",
        columns: [
          { key: "name", label: "Pacote" },
          { key: "status", label: "Status" },
          { key: "score", label: "Match score" },
          { key: "clicks", label: "Cliques" },
          { key: "conversion", label: "Conversões" },
        ],
        rows: [
          { name: "Inverno em Gramado", status: "Publicado", score: "82%", clicks: "284", conversion: "18" },
          { name: "Verão em Cancún", status: "Publicado", score: "79%", clicks: "196", conversion: "12" },
          { name: "Lua de mel nas Maldivas", status: "Destaque", score: "91%", clicks: "340", conversion: "24" },
        ],
      },
    ],
  },
  "travelpro-go": {
    title: "TravelPro Go",
    description: "WhatsApp operacional da agência com status, histórico, comandos e governança de uso.",
    primaryAction: "Ativar / pausar",
    secondaryAction: "Gerenciar usuários",
    primaryActionHref: "/app/travelpro-go",
    secondaryActionHref: "/app/equipe",
    metrics: [
      { label: "Número conectado", value: "Online", change: "+55 11 99888-1111", tone: "success", icon: MessageSquareText },
      { label: "Comandos hoje", value: "184", change: "27 executados com sucesso", tone: "info", icon: Sparkles },
      { label: "Usuários autorizados", value: "5", change: "2 admins", tone: "default", icon: Users },
      { label: "Consumo", value: "2.840 msgs", change: "66% da meta", tone: "warning", icon: CreditCard },
    ],
    blocks: [
      {
        type: "feed",
        title: "Histórico operacional",
        span: "half",
        items: [
          { title: "Criar roteiro para João em Gramado", description: "Roteiro criado e salvo no sistema.", time: "há 8 min", tone: "success", href: "/app/viagens/roteiros" },
          { title: "Gerar contrato da viagem da Ana", description: "Contrato criado com a identidade da agência.", time: "há 22 min", tone: "info", href: "/app/documentos/contratos" },
          { title: "Criar pacote para Cancún", description: "Pacote publicado e pronto para compartilhar.", time: "há 1h", tone: "success", href: "/app/catalogo" },
        ],
      },
      {
        type: "highlights",
        title: "Comandos recentes e configurações futuras",
        span: "half",
        items: [
          { title: "Comandos autorizados", description: "Roteiros, contratos, catálogo e tarefas operacionais.", icon: NotebookText, href: "/app/viagens/roteiros" },
          { title: "Pausar ou ativar", description: "Mock pronto para toggles, logs e horários de operação.", tone: "warning", icon: CheckCheck, href: "/app/travelpro-go" },
          { title: "Governança", description: "Usuários liberados por perfil e auditoria futura.", tone: "info", icon: ShieldCheck, href: "/app/equipe" },
        ],
      },
    ],
  },
  agent: {
    title: "TravelPro Agent",
    description: "Atendimento automatizado com qualificação, follow-ups e controle de estilo de resposta.",
    primaryAction: "Pausar / ativar",
    metrics: [
      { label: "Leads atendidos", value: "312", change: "+24 hoje", tone: "success", icon: Waypoints },
      { label: "Conversas em andamento", value: "18", change: "5 quentes", tone: "info", icon: MessageCircleMore },
      { label: "Follow-ups automáticos", value: "46", change: "janela 7 dias", tone: "warning", icon: HeartHandshake },
      { label: "Qualificação média", value: "8.7/10", change: "modelo premium", tone: "success", icon: TrendingUp },
    ],
    blocks: [
      {
        type: "table",
        title: "Qualificação e histórico",
        span: "full",
        columns: [
          { key: "lead", label: "Lead" },
          { key: "destination", label: "Destino" },
          { key: "status", label: "Status" },
          { key: "score", label: "Score" },
          { key: "nextStep", label: "Próximo passo" },
        ],
        rows: [
          { lead: "Carla Dias", destination: "Paris", status: "Em follow-up", score: "9.1", nextStep: "Retorno amanhã" },
          { lead: "Fabio Mello", destination: "Gramado", status: "Qualificado", score: "7.8", nextStep: "Cotação manual" },
          { lead: "Beatriz Lima", destination: "Maceió", status: "Em atendimento", score: "8.4", nextStep: "Oferta premium" },
        ],
      },
      {
        type: "highlights",
        title: "Estilo de atendimento",
        span: "full",
        columns: 3,
        items: [
          { title: "Tom premium", description: "Respostas acolhedoras, consultivas e objetivas.", icon: Sparkles },
          { title: "Autonomia controlada", description: "Fluxo visual pronto para regras por estágio.", tone: "warning", icon: ShieldCheck },
          { title: "Histórico completo", description: "Estrutura preparada para timeline futura com IA.", tone: "info", icon: FileStack },
        ],
      },
    ],
  },
  "central-operacional": {
    title: "Central Operacional",
    description: "Kanban e calendário inteligente para tarefas, compromissos, lembretes e pendências.",
    primaryAction: "Nova tarefa",
    secondaryAction: "Adicionar rota rápida",
    primaryActionHref: "/app/central-operacional/tarefas/nova",
    secondaryActionHref: "/app/central-operacional",
    blocks: [
      {
        type: "kanban",
        title: "Operação do dia",
        description: "Hoje, urgentes, follow-ups, viagens próximas, pendências e concluídos.",
        span: "full",
        columns: [
          { title: "Hoje", tone: "info", cards: tasks.filter((item) => item.status === "Hoje").map((item) => ({ title: item.title, description: item.owner, meta: item.due, href: "/app/central-operacional" })) },
          { title: "Urgentes", tone: "danger", cards: tasks.filter((item) => item.status === "Urgente").map((item) => ({ title: item.title, description: item.owner, meta: item.due, href: "/app/documentos" })) },
          { title: "Follow-ups", tone: "warning", cards: tasks.filter((item) => item.status === "Follow-up").map((item) => ({ title: item.title, description: item.owner, meta: item.due, href: "/app/leads" })) },
          { title: "Viagens próximas", tone: "default", cards: [{ title: "João Ribeiro • Orlando", description: "Saída em 3 dias", meta: "Checklist final", href: "/app/viagens" }] },
          { title: "Pendências", tone: "warning", cards: [{ title: "Seguro da Marina", description: "Aguardando upload do parceiro", meta: "Hoje", href: "/app/documentos" }] },
          { title: "Concluídos", tone: "success", cards: [{ title: "Catálogo de inverno", description: "Pacote publicado com sucesso", meta: "11:10", href: "/app/catalogo" }] },
        ],
      },
      {
        type: "feed",
        title: "Timeline operacional",
        description: "Atividades recentes, prioridades e status ao longo do dia.",
        span: "full",
        items: [
          { title: "Urgência financeira sinalizada", description: "Parcela do João Ribeiro vence hoje às 18h.", time: "agora", tone: "warning", href: "/app/financeiro" },
          { title: "Contrato revisado", description: "Alteração de acompanhante validada pelo time.", time: "há 12 min", tone: "info", href: "/app/documentos/contratos" },
          { title: "Follow-up disparado", description: "Agent retomou conversa com lead de Paris.", time: "há 27 min", tone: "success", href: "/app/agent" },
        ],
      },
    ],
  },
  insights: {
    title: "Insights",
    description: "Financeiro, clientes, viagens, produtividade, IA, WhatsApp e relatório semanal.",
    primaryAction: "Exportar PDF futuro",
    secondaryAction: "Enviar via WhatsApp futuro",
    blocks: [
      {
        type: "chart",
        title: "Relatório semanal",
        description: "Consolidado visual de produtividade e vendas.",
        span: "half",
        series: agencyPerformanceSeries,
      },
      {
        type: "highlights",
        title: "Leituras inteligentes",
        span: "half",
        items: [
          { title: "Financeiro", description: "Lucro projetado acima da média da última quinzena.", tone: "success", icon: DollarSign },
          { title: "Clientes", description: "Clientes premium respondem melhor após 18h.", tone: "info", icon: Users },
          { title: "IA + WhatsApp", description: "Automação reduziu em 42% o tempo operacional.", tone: "success", icon: Bot },
        ],
      },
    ],
  },
  marketing: {
    title: "Marketing",
    description: "Campanhas, posts, legendas, calendário promocional, ideias e anúncios.",
    primaryAction: "Nova campanha",
    secondaryAction: "Abrir calendário",
    blocks: [
      {
        type: "highlights",
        title: "Campanhas ativas",
        span: "full",
        columns: 3,
        items: [
          { title: "Inverno em Gramado", description: "Campanha sazonal com foco em famílias.", meta: "12 peças", icon: ChartNoAxesCombined },
          { title: "Escapadas românticas", description: "Calendário premium para fins de semana.", meta: "8 legendas", tone: "info", icon: HeartHandshake },
          { title: "Férias de julho", description: "Ideias e anúncios preparados para IA futura.", meta: "Planejamento", tone: "warning", icon: Sparkles },
        ],
      },
    ],
  },
  financeiro: {
    title: "Financeiro",
    description: "Receitas, despesas, comissões, lucro e pagamentos pendentes da agência.",
    primaryAction: "Nova receita",
    secondaryAction: "Nova despesa",
    extraActions: [{ label: "Exportar relatório" }],
    metrics: [
      { label: "Receitas", value: "R$ 84.200", change: "+18%", tone: "success", icon: DollarSign },
      { label: "Despesas", value: "R$ 18.400", change: "hotelaria + mídia", tone: "warning", icon: Receipt },
      { label: "Comissões", value: "R$ 9.840", change: "equipe comercial", tone: "info", icon: Users },
      { label: "Lucro", value: "R$ 55.960", change: "margem 66%", tone: "success", icon: TrendingUp },
      { label: "Saldo do mês", value: "R$ 65.800", change: "caixa operacional", tone: "success", icon: HandCoins },
    ],
    blocks: [
      {
        type: "chart",
        title: "Receitas, despesas e lucro",
        description: "Leitura visual do período com comparação de caixa e margem.",
        span: "full",
        filters: ["7 dias", "30 dias", "90 dias"],
        series: [
          { label: "Sem 1", value: 18400, expenses: 6200, profit: 12200 },
          { label: "Sem 2", value: 22100, expenses: 7100, profit: 15000 },
          { label: "Sem 3", value: 19800, expenses: 5300, profit: 14500 },
          { label: "Sem 4", value: 23900, expenses: 6800, profit: 17100 },
        ],
      },
      {
        type: "table",
        title: "Pagamentos pendentes",
        span: "half",
        columns: [
          { key: "client", label: "Cliente" },
          { key: "destination", label: "Destino" },
          { key: "amount", label: "Valor" },
          { key: "status", label: "Status" },
        ],
        rows: [
          { client: "João Ribeiro", destination: "Orlando", amount: "R$ 4.200", status: "A receber" },
          { client: "Marina Costa", destination: "Maldivas", amount: "R$ 12.800", status: "Entrada paga" },
        ],
      },
      {
        type: "highlights",
        title: "Resumo financeiro",
        span: "half",
        items: [
          { title: "Nova receita", description: "Fluxo pronto para registrar entradas de pacote, serviços e upsell.", icon: DollarSign },
          { title: "Nova despesa", description: "Cadastre saídas com categoria e reflexo na margem.", tone: "warning", icon: Receipt },
          { title: "Exportar relatório", description: "Prepara PDF, CSV ou envio futuro pelo WhatsApp.", tone: "info", icon: FileStack },
        ],
      },
    ],
  },
  equipe: {
    title: "Equipe",
    description: "Funcionários, cargos, permissões, usuários inclusos e limites por área.",
    primaryAction: "Adicionar funcionário",
    blocks: [
      {
        type: "table",
        title: "Equipe da agência",
        span: "full",
        columns: [
          { key: "name", label: "Nome" },
          { key: "role", label: "Cargo" },
          { key: "scope", label: "Acesso" },
          { key: "status", label: "Status" },
        ],
        rows: [
          { name: "Marina Alves", role: "AGENCY_ADMIN", scope: "Total", status: "Ativo" },
          { name: "Lucas Prado", role: "AGENCY_SALES", scope: "Leads + cotações", status: "Ativo" },
          { name: "Renata Moura", role: "AGENCY_FINANCE", scope: "Financeiro + contratos", status: "Ativo" },
          { name: "Caio Vieira", role: "AGENCY_OPERATIONAL", scope: "Viagens + documentos", status: "Convite pendente" },
        ],
      },
      {
        type: "highlights",
        title: "Limites por perfil",
        span: "full",
        columns: 3,
        items: [
          { title: "Financeiro protegido", description: "Restringe dados de receita, comissão e margem.", tone: "warning", icon: ShieldCheck },
          { title: "IA e WhatsApp por papel", description: "Fluxos prontos para toggles finos por role.", tone: "info", icon: Bot },
          { title: "Auditoria futura", description: "Estrutura pronta para rastrear ações por usuário.", icon: FileStack },
        ],
      },
    ],
  },
  configuracoes: {
    title: "Configurações da agência",
    description: "Dados da agência, logo, cores, perfil público, preferências e integrações futuras.",
    primaryAction: "Salvar preferências",
    blocks: [
      {
        type: "highlights",
        title: "Base visual configurável",
        span: "full",
        columns: 3,
        items: [
          { title: "Branding da agência", description: "Logo, cores e identidade para contratos e roteiros.", icon: Palette },
          { title: "Perfil público", description: "Catálogo, WhatsApp e preferências de atendimento.", icon: Users },
          { title: "Integrações futuras", description: "Supabase, OpenAI, Stripe e provedores de mensagem.", tone: "info", icon: Sparkles },
        ],
      },
      {
        type: "empty",
        title: "Campos reais futuros",
        description: "A interface já comporta formulários completos, upload de logo e toggles avançados.",
        span: "full",
        actionLabel: "Mapear integrações",
      },
    ],
  },
}

export const clientPages: Record<string, PortalPageConfig> = {
  dashboard: {
    title: "Sua viagem",
    description: "Experiência premium da viagem com contagem regressiva, documentos, roteiro e mensagens.",
    primaryAction: "Ver roteiro",
    secondaryAction: "Abrir documentos",
    metrics: [
      { label: "Próxima viagem", value: "Cancún", change: "15 mai - 22 mai", tone: "success", icon: PlaneTakeoff },
      { label: "Contagem regressiva", value: "12 dias", change: "Preparativos finais", tone: "info", icon: CalendarClock },
      { label: "Documentos", value: "4 prontos", change: "1 pendente", tone: "warning", icon: FileText },
      { label: "Checklist", value: "88%", change: "Quase tudo pronto", tone: "success", icon: CheckCheck },
    ],
    blocks: [
      {
        type: "chart",
        title: "Preparação da viagem",
        description: "Checklist, documentos, roteiro e mensagens da viagem.",
        span: "half",
        series: clientCountdownSeries,
      },
      {
        type: "feed",
        title: "Notificações do viajante",
        span: "half",
        items: [
          { title: "Voucher hotel disponível", description: "Seu voucher já está pronto para download.", time: "agora", tone: "success" },
          { title: "Mensagem da agência", description: "Seu transfer foi confirmado para o aeroporto.", time: "há 14 min", tone: "info" },
          { title: "Checklist pendente", description: "Complete a preferência alimentar do hotel.", time: "há 1h", tone: "warning" },
        ],
      },
    ],
  },
  viagem: {
    title: "Detalhes da viagem",
    description: "Datas, destino, status e informações gerais da viagem.",
    blocks: [
      {
        type: "highlights",
        title: "Resumo premium",
        span: "full",
        columns: 3,
        items: [
          { title: "Destino", description: "Cancún • México", icon: PlaneTakeoff },
          { title: "Período", description: "15 mai 2026 até 22 mai 2026", icon: CalendarClock },
          { title: "Agência responsável", description: "Horizonte Viagens", icon: Users },
        ],
      },
    ],
  },
  documentos: {
    title: "Documentos",
    description: "Vouchers, contrato, passagem, seguro e recibos do viajante.",
    blocks: [
      {
        type: "table",
        title: "Arquivos da viagem",
        span: "full",
        columns: [
          { key: "name", label: "Documento" },
          { key: "type", label: "Tipo" },
          { key: "status", label: "Status" },
        ],
        rows: [
          { name: "Voucher do resort", type: "Voucher", status: "Pronto" },
          { name: "Contrato de viagem", type: "Contrato", status: "Assinado" },
          { name: "Seguro viagem", type: "Seguro", status: "Pronto" },
          { name: "Passagem aérea", type: "Passagem", status: "Pendente" },
        ],
      },
    ],
  },
  roteiro: {
    title: "Roteiro da viagem",
    description: "Planejamento dia a dia com atividades, horários e observações importantes.",
    blocks: [
      {
        type: "kanban",
        title: "Dia a dia",
        span: "full",
        columns: [
          { title: "Dia 1", cards: [{ title: "Check-in no resort", description: "14:00 • Hyatt Zilara", meta: "Transfer incluído" }] },
          { title: "Dia 2", cards: [{ title: "Passeio de catamarã", description: "09:00 • Saída da marina", meta: "Levar documento" }] },
          { title: "Dia 3", cards: [{ title: "Jantar especial", description: "20:00 • Restaurante frente mar", meta: "Reserva confirmada" }] },
        ],
      },
    ],
  },
  mensagens: {
    title: "Mensagens",
    description: "Canal simples de comunicação entre viajante e agência.",
    blocks: [
      {
        type: "feed",
        title: "Histórico recente",
        span: "full",
        items: [
          { title: "Agência", description: "Seu transfer está confirmado para as 08:30.", time: "hoje, 09:15", tone: "info" },
          { title: "Você", description: "Perfeito, obrigado! Preciso levar impresso?", time: "hoje, 09:21", tone: "default" },
          { title: "Agência", description: "Pode apresentar pelo celular. Já deixamos no portal também.", time: "hoje, 09:24", tone: "success" },
        ],
      },
    ],
  },
  perfil: {
    title: "Perfil do viajante",
    description: "Dados do viajante, preferências, acompanhantes e informações gerais.",
    blocks: [
      {
        type: "highlights",
        title: "Dados principais",
        span: "full",
        columns: 3,
        items: [
          { title: "Viajante", description: "Ana Martins", meta: "Passaporte válido", icon: Users },
          { title: "Preferências", description: "Suíte premium, transfer privado e refeições sem glúten.", icon: Sparkles },
          { title: "Acompanhantes", description: "1 acompanhante confirmado", icon: HeartHandshake },
        ],
      },
    ],
  },
}
