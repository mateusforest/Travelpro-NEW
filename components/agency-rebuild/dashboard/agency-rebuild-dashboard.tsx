"use client"

import { useEffect, useMemo, useState } from "react"
import {
  BadgeCheck,
  BriefcaseBusiness,
  ChevronDown,
  CreditCard,
  FileText,
  FolderKanban,
  GripHorizontal,
  HandCoins,
  LayoutTemplate,
  LucideIcon,
  Plus,
  Rocket,
  ScrollText,
  Settings2,
  Sparkles,
  Users,
  UserSquare2,
  Waypoints,
} from "lucide-react"
import { AgencyRebuildActionButton } from "@/components/agency-rebuild/actions/agency-rebuild-action-button"
import { AgencyRebuildCatalogWorkspace } from "@/components/agency-rebuild/catalog"
import { AgencyRebuildAiOperationsCenter } from "@/components/agency-rebuild/dashboard/agency-rebuild-ai-operations-center"
import { AgencyRebuildClientsWorkspace } from "@/components/agency-rebuild/clients"
import { AgencyRebuildCreditsWorkspace } from "@/components/agency-rebuild/credits"
import { BaseDrawerV3 } from "@/components/agency-rebuild/drawers/base-drawer-v3"
import { AgencyRebuildDocumentsWorkspace } from "@/components/agency-rebuild/documents"
import { AgencyRebuildExpansionsWorkspace } from "@/components/agency-rebuild/expansions"
import { AgencyRebuildFinanceWorkspace } from "@/components/agency-rebuild/finance"
import { AgencyRebuildItinerariesWorkspace } from "@/components/agency-rebuild/itineraries"
import { AgencyRebuildLeadsWorkspace } from "@/components/agency-rebuild/leads"
import { BaseModalV3 } from "@/components/agency-rebuild/modals/base-modal-v3"
import { AgencyRebuildOperationsWorkspace } from "@/components/agency-rebuild/operations"
import { AgencyRebuildReportsWorkspace } from "@/components/agency-rebuild/reports"
import { BaseCardV3 } from "@/components/agency-rebuild/shared/base-card-v3"
import { subscribeAgencyRebuildNavigation, type AgencyRebuildMenuTarget } from "@/components/agency-rebuild/shared"
import { AgencyRebuildTeamWorkspace } from "@/components/agency-rebuild/team"
import { AgencyRebuildTemplatesWorkspace } from "@/components/agency-rebuild/templates"
import { AgencyRebuildTravelBuilderWorkspace } from "@/components/agency-rebuild/travel-builder"
import { AgencyRebuildTripsWorkspace } from "@/components/agency-rebuild/trips"
import { AgencyOperationalChart } from "@/components/agency-rebuild/widgets"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

type Tone = "default" | "attention" | "positive" | "future"

type WorkspaceItem = {
  title: string
  subtitle: string
  status: string
  meta: string
}

type QuickAction = {
  label: string
  description: string
  futureMessage: string
}

type ModuleCard = {
  key: string
  title: string
  eyebrow: string
  status: string
  tone: Tone
  description: string
  reading: string[]
  icon: LucideIcon
  primaryLabel: string
  openLabel: string
  quickActions: QuickAction[]
  workspaceItems: WorkspaceItem[]
  workspaceDescription: string
  emptyTitle: string
  emptyBody: string
}

type DashboardGridKey = ModuleCard["key"] | "operational-chart"

type Intent = {
  key: string
  group: string
  label: string
  description: string
}

type IntentFieldKey =
  | "client"
  | "period"
  | "destination"
  | "budget"
  | "priority"
  | "owner"
  | "note"
  | "type"
  | "amount"
  | "account"
  | "installments"
  | "dueDate"
  | "source"
  | "tags"
  | "channel"
  | "deadline"
  | "status"

type OperationalContextState = Record<IntentFieldKey, string>

const operationSignals = [
  { label: "Alertas", value: "4 sinais vivos", note: "Viagens, financeiro e revisoes." },
  { label: "Embarques", value: "3 janelas proximas", note: "Roma, Buenos Aires e Recife." },
  { label: "Documentos", value: "2 revisoes hoje", note: "Contrato e voucher aguardando envio." },
  { label: "Financeiro", value: "1 recebimento sensivel", note: "Entrada prevista para 14h." },
]

const smartSuggestions = [
  "Criar viagem da Ana para Gramado em julho, casal, lua de mel, orcamento 12 mil.",
  "Registrar recebimento da Italia Signature com parcelamento em 3x.",
  "Gerar contrato e voucher da viagem do Roberto para Lisboa.",
  "Publicar pacote para Cancun e criar campanha com CTA de WhatsApp.",
]

const intents: Intent[] = [
  { key: "new-client", group: "Relacionamento", label: "Novo cliente", description: "Abre relacionamento e estrutura base da conta." },
  { key: "new-lead", group: "Relacionamento", label: "Novo lead", description: "Registra oportunidade e conecta ao pipeline." },
  { key: "follow-up", group: "Relacionamento", label: "Follow-up", description: "Organiza retorno, canal e proximo passo." },
  { key: "new-trip", group: "Viagens", label: "Nova viagem", description: "Inicia jornada, cliente, destino e prioridade." },
  { key: "new-quote", group: "Viagens", label: "Nova cotacao", description: "Prepara proposta, orcamento e margem inicial." },
  { key: "trip-status", group: "Viagens", label: "Atualizar status", description: "Move a viagem para a proxima etapa operacional." },
  { key: "new-contract", group: "Documentos", label: "Novo contrato", description: "Estrutura base documental com cliente e viagem." },
  { key: "new-voucher", group: "Documentos", label: "Novo voucher", description: "Prepara entrega e compartilhamento da viagem." },
  { key: "new-material", group: "Documentos", label: "Novo material", description: "Cria material de apoio ou entrega premium." },
  { key: "generate-itinerary", group: "Roteiros", label: "Gerar roteiro IA", description: "Monta a base do roteiro com contexto de viagem." },
  { key: "update-itinerary", group: "Roteiros", label: "Atualizar roteiro", description: "Ajusta roteiro, etapa e proxima entrega." },
  { key: "publish-itinerary", group: "Roteiros", label: "Publicar roteiro", description: "Prepara versao final e compartilhamento." },
  { key: "new-finance", group: "Financeiro", label: "Novo lancamento", description: "Registra caixa, categoria e vencimento." },
  { key: "register-income", group: "Financeiro", label: "Registrar recebimento", description: "Conecta entrada, conta e previsao." },
  { key: "split-payment", group: "Financeiro", label: "Parcelar pagamento", description: "Estrutura recorrencia e fluxo financeiro." },
  { key: "new-task", group: "Operacional", label: "Nova tarefa", description: "Cria um passo operacional com dono e prazo." },
  { key: "new-alert", group: "Operacional", label: "Alerta operacional", description: "Marca urgencia, modulo e proximo passo." },
  { key: "new-automation", group: "Operacional", label: "Criar automacao", description: "Inicia gatilho premium e jornada recorrente." },
  { key: "publish-package", group: "Catalogo", label: "Publicar pacote", description: "Leva oferta para vitrine e compartilhamento." },
  { key: "update-package", group: "Catalogo", label: "Atualizar pacote", description: "Ajusta preco, periodo e destaque comercial." },
  { key: "create-campaign", group: "Catalogo", label: "Criar campanha", description: "Abre campanha promocional ligada ao pacote." },
]

const modules: ModuleCard[] = [
  {
    key: "trips",
    title: "Viagens",
    eyebrow: "Jornadas",
    status: "18 no total",
    tone: "positive",
    description: "Carteira ativa e proximos embarques.",
    reading: ["18 viagens", "3 embarques proximos"],
    icon: BriefcaseBusiness,
    primaryLabel: "Nova viagem",
    openLabel: "Abrir",
    quickActions: [
      { label: "Compartilhar viagem", description: "Preparar link publico e contexto do cliente.", futureMessage: "Fluxo inteligente em preparação para compartilhamento da V3." },
      { label: "Alterar status", description: "Mover a viagem para a proxima etapa operacional.", futureMessage: "Disponivel na proxima etapa da V3." },
      { label: "Gerar roteiro", description: "Criar base de roteiro sem sair do dashboard.", futureMessage: "Integração operacional em andamento para roteiros da V3." },
    ],
    workspaceItems: [
      { title: "Italia Signature", subtitle: "Marina Alves • 14 a 22 jun", status: "Revisao final", meta: "Link ativo • 3 docs" },
      { title: "Buenos Aires Week", subtitle: "Equipe comercial • 04 jul", status: "Compartilhar", meta: "1 contrato • 2 tarefas" },
      { title: "Recife Escape", subtitle: "Cliente VIP • 18 jul", status: "Em montagem", meta: "Cotacao em andamento" },
    ],
    workspaceDescription: "Uma central viva para acompanhar proximas partidas, documentos e proximos passos.",
    emptyTitle: "Sem jornadas abertas neste recorte.",
    emptyBody: "A V3 mostrara viagens recentes, proximas partidas e sinais operacionais assim que a integracao estiver ativa.",
  },
  {
    key: "finance",
    title: "Financeiro",
    eyebrow: "Caixa",
    status: "Balanco vivo",
    tone: "attention",
    description: "Balanco, entradas e margem.",
    reading: ["R$ 128.400", "Balanco da empresa"],
    icon: HandCoins,
    primaryLabel: "Novo lancamento",
    openLabel: "Abrir",
    quickActions: [
      { label: "Marcar como pago", description: "Fechar rapidamente um recebimento ou despesa.", futureMessage: "Integração operacional em andamento para baixas da V3." },
      { label: "Gerar relatorio", description: "Preparar um recorte financeiro claro para a equipe.", futureMessage: "Relatorios vivos chegam na proxima etapa da V3." },
      { label: "Pendencias", description: "Ler vencimentos e recebimentos mais sensiveis.", futureMessage: "Fluxo inteligente em preparação para pendencias financeiras." },
    ],
    workspaceItems: [
      { title: "Recebimento - Italia Signature", subtitle: "Cliente final • hoje", status: "A receber", meta: "R$ 5.800" },
      { title: "Repasse fornecedor", subtitle: "Operadora parceira • amanha", status: "Programado", meta: "R$ 2.140" },
      { title: "Consultoria premium", subtitle: "Lead convertido • 28 mai", status: "Pago", meta: "R$ 980" },
    ],
    workspaceDescription: "Mais leitura operacional e menos planilha: caixa, vencimentos e proximas acoes no mesmo lugar.",
    emptyTitle: "Sem movimentacoes para mostrar.",
    emptyBody: "Quando a camada real entrar, este workspace exibira entradas, saidas e pontos de risco em tempo real.",
  },
  {
    key: "documents",
    title: "Documentos",
    eyebrow: "Central documental",
    status: "246 gerados",
    tone: "attention",
    description: "Contratos, vouchers e materiais.",
    reading: ["246 gerados", "12 aguardando revisao"],
    icon: FileText,
    primaryLabel: "Novo documento",
    openLabel: "Abrir",
    quickActions: [
      { label: "Gerar contrato", description: "Criar a base de contrato com contexto de cliente.", futureMessage: "Integração operacional em andamento para contratos da V3." },
      { label: "Revisar pendencias", description: "Organizar rascunhos, envio e documentos visualizados.", futureMessage: "Fluxo inteligente em preparação para a central documental." },
      { label: "Compartilhar", description: "Preparar envio seguro ao cliente final.", futureMessage: "Disponivel na proxima etapa da V3." },
    ],
    workspaceItems: [
      { title: "Contrato Italia Signature", subtitle: "Cliente VIP • v5", status: "Revisao", meta: "Ultima edicao hoje" },
      { title: "Voucher Lisboa Weekend", subtitle: "Embarque em 6 dias", status: "Enviar", meta: "Arquivo pronto" },
      { title: "Passagem corporativa", subtitle: "Trecho confirmado", status: "Arquivar", meta: "Check-in pendente" },
    ],
    workspaceDescription: "Um hub mais limpo para revisar, compartilhar e organizar os documentos certos na hora certa.",
    emptyTitle: "Nenhum documento neste recorte.",
    emptyBody: "A V3 exibira rascunhos, enviados e visualizados em uma central mais leve.",
  },
  {
    key: "clients",
    title: "Clientes",
    eyebrow: "Relacionamento",
    status: "184 ativos",
    tone: "attention",
    description: "Base ativa e proximos contatos.",
    reading: ["184 ativos", "3 retornos hoje"],
    icon: Users,
    primaryLabel: "Novo cliente",
    openLabel: "Abrir",
    quickActions: [
      { label: "Iniciar atendimento", description: "Preparar abertura de conversa com contexto.", futureMessage: "Fluxo inteligente em preparação para atendimento da V3." },
      { label: "Criar viagem", description: "Levar um cliente direto para a camada de jornadas.", futureMessage: "Disponivel na proxima etapa da V3." },
      { label: "Gerar cotacao", description: "Montar proposta sem trocar de ambiente.", futureMessage: "Integração operacional em andamento para cotacoes da V3." },
    ],
    workspaceItems: [
      { title: "Marina Alves", subtitle: "Horizonte premium", status: "Ativa", meta: "1 viagem • 2 docs" },
      { title: "Roberto Nunes", subtitle: "Corporativo", status: "Sem retorno", meta: "Ultimo contato ha 4 dias" },
      { title: "Juliana Costa", subtitle: "Lazer internacional", status: "Quente", meta: "Desejo de julho" },
    ],
    workspaceDescription: "Uma leitura mais humana e premium para clientes, follow-ups e proximas oportunidades.",
    emptyTitle: "Sem clientes neste filtro.",
    emptyBody: "A camada real da V3 mostrara recentes, ativos e relacionamentos que pedem acao.",
  },
  {
    key: "itineraries",
    title: "Roteiros",
    eyebrow: "Roteiros vivos",
    status: "38 gerados",
    tone: "default",
    description: "Roteiros gerados e entregas.",
    reading: ["38 gerados", "5 compartilhados"],
    icon: ScrollText,
    primaryLabel: "Novo roteiro",
    openLabel: "Abrir",
    quickActions: [
      { label: "Duplicar base", description: "Reaproveitar um roteiro existente com um clique.", futureMessage: "Disponivel na proxima etapa da V3." },
      { label: "Compartilhar", description: "Abrir uma versao publica premium para o cliente.", futureMessage: "Fluxo inteligente em preparação para compartilhamento da V3." },
      { label: "Exportar", description: "Gerar saida premium sem sair do dashboard.", futureMessage: "Integração operacional em andamento para exportacao da V3." },
    ],
    workspaceItems: [
      { title: "Roteiro Alpes 7D", subtitle: "Base assinavel", status: "Pronto", meta: "Atualizado ontem" },
      { title: "Italia Signature", subtitle: "Cliente VIP", status: "Compartilhado", meta: "Link em uso" },
      { title: "Verao Caribe", subtitle: "Biblioteca viva", status: "Duplicar", meta: "3 versoes" },
    ],
    workspaceDescription: "Uma biblioteca operacional viva para montar, compartilhar e refinar roteiros sem poluicao.",
    emptyTitle: "Sem roteiros para este recorte.",
    emptyBody: "Assim que a integracao chegar, a V3 exibira modelos recentes, compartilhados e duplicados.",
  },
  {
    key: "leads",
    title: "Leads",
    eyebrow: "Pipeline",
    status: "64 recebidos",
    tone: "positive",
    description: "Entradas, origem e prioridade.",
    reading: ["64 recebidos", "9 quentes"],
    icon: Waypoints,
    primaryLabel: "Novo lead",
    openLabel: "Abrir",
    quickActions: [
      { label: "Iniciar atendimento", description: "Preparar abordagem com contexto comercial.", futureMessage: "Fluxo inteligente em preparação para leads da V3." },
      { label: "Converter cliente", description: "Mover uma oportunidade para relacionamento ativo.", futureMessage: "Disponivel na proxima etapa da V3." },
      { label: "Criar cotacao", description: "Subir proposta sem quebrar o contexto do lead.", futureMessage: "Integração operacional em andamento para cotacoes da V3." },
    ],
    workspaceItems: [
      { title: "Casal Europa 2026", subtitle: "Origem Instagram", status: "Quente", meta: "Sem resposta ha 1 dia" },
      { title: "Grupo corporativo", subtitle: "Indicação", status: "Qualificado", meta: "Reuniao sugerida" },
      { title: "Lua de mel Caribe", subtitle: "Formulário premium", status: "Novo", meta: "Entrou hoje" },
    ],
    workspaceDescription: "Uma camada mais viva para qualificar, responder e acelerar as melhores oportunidades.",
    emptyTitle: "Sem leads neste estado.",
    emptyBody: "Os recortes da V3 mostrarao novos, quentes e qualificados sem parecer CRM pesado.",
  },
  {
    key: "templates",
    title: "Templates",
    eyebrow: "Biblioteca",
    status: "18 usados",
    tone: "default",
    description: "Modelos disponiveis e uso.",
    reading: ["18 usados", "42 no total"],
    icon: LayoutTemplate,
    primaryLabel: "Novo template",
    openLabel: "Abrir",
    quickActions: [
      { label: "Usar como base", description: "Selecionar um template e abrir uma nova versao.", futureMessage: "Disponivel na proxima etapa da V3." },
      { label: "Ativar ou pausar", description: "Controlar disponibilidade operacional da base.", futureMessage: "Fluxo inteligente em preparação para a biblioteca da V3." },
      { label: "Ver recentes", description: "Ler o que mais foi reutilizado pela equipe.", futureMessage: "Integração operacional em andamento para templates da V3." },
    ],
    workspaceItems: [
      { title: "Boas-vindas premium", subtitle: "Mensageria", status: "Ativo", meta: "Usado 16x" },
      { title: "Contrato internacional", subtitle: "Documentos", status: "Revisao", meta: "Variaveis ativas" },
      { title: "Roteiro base 7 dias", subtitle: "Roteiros", status: "Ativo", meta: "Duplicado ontem" },
    ],
    workspaceDescription: "Uma biblioteca elegante para acionar bases vivas e reduzir trabalho repetitivo.",
    emptyTitle: "Nenhum template neste recorte.",
    emptyBody: "A V3 mostrara suas bases ativas, mais usadas e recentes em uma biblioteca mais viva.",
  },
  {
    key: "quotes",
    title: "Cotacoes",
    eyebrow: "Propostas",
    status: "27 geradas",
    tone: "attention",
    description: "Propostas e negociacoes.",
    reading: ["27 geradas", "7 em follow-up"],
    icon: FolderKanban,
    primaryLabel: "Nova cotacao",
    openLabel: "Abrir",
    quickActions: [
      { label: "Converter em viagem", description: "Levar proposta para jornada com contexto preservado.", futureMessage: "Disponivel na proxima etapa da V3." },
      { label: "Compartilhar", description: "Preparar proposta para envio com visual premium.", futureMessage: "Integração operacional em andamento para compartilhamento da V3." },
      { label: "Registrar follow-up", description: "Criar um proximo passo comercial mais claro.", futureMessage: "Fluxo inteligente em preparação para follow-ups da V3." },
    ],
    workspaceItems: [
      { title: "Pacote Italia Signature", subtitle: "Cliente VIP", status: "Follow-up", meta: "R$ 18.400" },
      { title: "Lua de mel Grecia", subtitle: "Lead quente", status: "Quente", meta: "R$ 24.900" },
      { title: "Chile Express", subtitle: "Retorno recente", status: "Enviar", meta: "R$ 6.300" },
    ],
    workspaceDescription: "Uma mesa de propostas mais leve, visual e acionavel para acelerar conversao.",
    emptyTitle: "Sem cotacoes neste recorte.",
    emptyBody: "A V3 exibira status, valor e follow-up em um fluxo mais enxuto e premium.",
  },
  {
    key: "team",
    title: "Equipe",
    eyebrow: "Pessoas",
    status: "6 ativas",
    tone: "default",
    description: "Distribuicao de foco, responsabilidades e colaboracao viva.",
    reading: ["6 pessoas", "1 onboarding aberto"],
    icon: UserSquare2,
    primaryLabel: "Adicionar membro",
    openLabel: "Abrir",
    quickActions: [
      { label: "Criar tarefa", description: "Distribuir um passo operacional com mais clareza.", futureMessage: "Fluxo inteligente em preparação para tarefas da V3." },
      { label: "Ver onboarding", description: "Acompanhar entrada de novos membros.", futureMessage: "Disponivel na proxima etapa da V3." },
      { label: "Permissoes", description: "Ler niveis de acesso da equipe com calma.", futureMessage: "Integração operacional em andamento para permissoes da V3." },
    ],
    workspaceItems: [
      { title: "Marina Alves", subtitle: "Fundadora", status: "Liderando", meta: "4 frentes" },
      { title: "Time comercial", subtitle: "3 pessoas", status: "Ativo", meta: "9 leads quentes" },
      { title: "Operacao premium", subtitle: "2 pessoas", status: "Focado", meta: "3 embarques" },
    ],
    workspaceDescription: "Um hub mais delicado para olhar equipe, foco atual e distribuicao de energia.",
    emptyTitle: "Sem contexto de equipe neste recorte.",
    emptyBody: "Na fase conectada, a V3 exibira time, onboarding e distribuicao de responsabilidade.",
  },
  {
    key: "reports",
    title: "Relatorios",
    eyebrow: "Leitura executiva",
    status: "14 gerados",
    tone: "default",
    description: "Recortes prontos e historico.",
    reading: ["14 gerados", "2 snapshots recentes"],
    icon: BadgeCheck,
    primaryLabel: "Gerar relatorio",
    openLabel: "Abrir",
    quickActions: [
      { label: "Gerar snapshot", description: "Montar uma leitura curta para a diretoria.", futureMessage: "Fluxo inteligente em preparação para snapshots da V3." },
      { label: "Exportar", description: "Preparar saida premium sem recorrer a telas antigas.", futureMessage: "Integração operacional em andamento para exportacao da V3." },
      { label: "Favoritos", description: "Guardar os recortes mais usados pela equipe.", futureMessage: "Disponivel na proxima etapa da V3." },
    ],
    workspaceItems: [
      { title: "Operacao semanal", subtitle: "Ultimos 7 dias", status: "Pronto", meta: "Atualizado hoje" },
      { title: "Financeiro de maio", subtitle: "Receitas e despesas", status: "Atualizar", meta: "Filtro salvo" },
      { title: "Viagens em andamento", subtitle: "Status operacional", status: "Compartilhar", meta: "2 alertas" },
    ],
    workspaceDescription: "Relatorios que parecem uma mesa de leitura, nao um modulo frio de exportacao.",
    emptyTitle: "Nenhum relatorio neste recorte.",
    emptyBody: "Quando a conexao chegar, a V3 mostrara recortes salvos, recentes e compartilhados aqui.",
  },
  {
    key: "credits",
    title: "Creditos",
    eyebrow: "Uso",
    status: "Saldo saudavel",
    tone: "positive",
    description: "Saldo, uso e margem.",
    reading: ["2.140 disponiveis", "68% de uso"],
    icon: CreditCard,
    primaryLabel: "Comprar creditos",
    openLabel: "Abrir",
    quickActions: [
      { label: "Comprar pacote", description: "Abrir camada de solicitacao honesta.", futureMessage: "Integração operacional em andamento para creditos da V3." },
      { label: "Alertas de saldo", description: "Ajustar leitura de consumo e limites.", futureMessage: "Disponivel na proxima etapa da V3." },
      { label: "Consumo por modulo", description: "Detalhar onde a operacao mais utiliza creditos.", futureMessage: "Fluxo inteligente em preparação para leitura de consumo da V3." },
    ],
    workspaceItems: [
      { title: "Atlas", subtitle: "Ajuda guiada", status: "Consumo alto", meta: "38% do total" },
      { title: "TravelPro Go", subtitle: "Camada assistida", status: "Monitorar", meta: "24% do total" },
      { title: "Reservas de saldo", subtitle: "Janela segura", status: "Saudavel", meta: "2.140 creditos" },
    ],
    workspaceDescription: "Uma leitura mais transparente do saldo, origem e impacto operacional dos creditos.",
    emptyTitle: "Sem consumo neste recorte.",
    emptyBody: "A camada real da V3 mostrara saldo, historico e alertas sem virar pagina de billing.",
  },
  {
    key: "catalog",
    title: "Catalogo",
    eyebrow: "Pacotes",
    status: "7 publicados",
    tone: "default",
    description: "Pacotes ativos e publicados.",
    reading: ["7 publicados", "9 ativos"],
    icon: Rocket,
    primaryLabel: "Novo pacote",
    openLabel: "Abrir",
    quickActions: [
      { label: "Abrir vitrine", description: "Ler a experiencia publica com olhar de curadoria.", futureMessage: "Disponivel na proxima etapa da V3." },
      { label: "Copiar link", description: "Preparar vitrine publica para envio rapido.", futureMessage: "Fluxo inteligente em preparação para compartilhamento da vitrine." },
      { label: "Publicar", description: "Mover um pacote para estado vivo de distribuicao.", futureMessage: "Integração operacional em andamento para publicacao da V3." },
    ],
    workspaceItems: [
      { title: "Italia Signature", subtitle: "Publicado", status: "Vivo", meta: "Alta procura" },
      { title: "Nordeste Essencial", subtitle: "Rascunho", status: "Revisar", meta: "Imagem pendente" },
      { title: "Patagonia Curada", subtitle: "Publicado", status: "Atualizar", meta: "Preço recente" },
    ],
    workspaceDescription: "Um catalogo mais curado, com branding e leitura publica como parte da operacao.",
    emptyTitle: "Sem pacotes neste recorte.",
    emptyBody: "A V3 passara a mostrar ativos, publicados e rascunhos em uma central mais visual.",
  },
  {
    key: "operations",
    title: "Central Operacional",
    eyebrow: "Prioridades",
    status: "4 pontos",
    tone: "attention",
    description: "Prioridades e proximos passos.",
    reading: ["4 prioridades", "3 tarefas hoje"],
    icon: Settings2,
    primaryLabel: "Nova tarefa",
    openLabel: "Abrir",
    quickActions: [
      { label: "Abrir prioridade", description: "Entrar na frente mais sensivel do momento.", futureMessage: "Disponivel na proxima etapa da V3." },
      { label: "Criar checklist", description: "Organizar uma resolucao curta com passos visiveis.", futureMessage: "Fluxo inteligente em preparação para checklists da V3." },
      { label: "Gerar relatorio", description: "Fechar um snapshot do que pede atencao agora.", futureMessage: "Integração operacional em andamento para snapshots da V3." },
    ],
    workspaceItems: [
      { title: "Embarque Roma", subtitle: "Documento + financeiro", status: "Urgente", meta: "Hoje • 14h" },
      { title: "Follow-up VIP", subtitle: "Cliente sem retorno", status: "Resolver", meta: "1 dia" },
      { title: "Recibo pendente", subtitle: "Area financeira", status: "Revisar", meta: "Amanha" },
    ],
    workspaceDescription: "A mesa viva da operacao: prioridades, contexto e proximo passo no mesmo painel.",
    emptyTitle: "Sem prioridades neste recorte.",
    emptyBody: "Quando ligada ao core, a V3 listara tarefas, alertas e prioridades reais aqui.",
  },
  {
    key: "expansions",
    title: "Expansoes",
    eyebrow: "Ecossistema",
    status: "3 ativas",
    tone: "future",
    description: "Modulos ativos e em preparo.",
    reading: ["3 ativas", "2 em preparo"],
    icon: Sparkles,
    primaryLabel: "Ativar expansao",
    openLabel: "Abrir",
    quickActions: [
      { label: "TravelPro Go", description: "Camada assistida para operacao viva.", futureMessage: "Fluxo inteligente em preparação para ativacao do TravelPro Go." },
      { label: "TravelPro Agent", description: "Expansao comercial e operacional guiada.", futureMessage: "Disponivel na proxima etapa da V3." },
      { label: "Atlas Advisor", description: "Leitura consultiva premium da operacao.", futureMessage: "Integração operacional em andamento para o Atlas Advisor." },
    ],
    workspaceItems: [
      { title: "TravelPro Go", subtitle: "Expansao assistida", status: "Solicitavel", meta: "Sem IA real ainda" },
      { title: "TravelPro Agent", subtitle: "Camada comercial", status: "Em preparo", meta: "Backend futuro" },
      { title: "Atlas Advisor", subtitle: "Leitura consultiva", status: "Em preparo", meta: "Visao premium" },
    ],
    workspaceDescription: "Expansoes como parte real do ecossistema, sem placeholders vazios nem promessas falsas.",
    emptyTitle: "Nenhuma expansao aqui ainda.",
    emptyBody: "A V3 usara este painel para mostrar modulos futuros com muito mais contexto e clareza.",
  },
]

const toneClasses: Record<Tone, string> = {
  default: "border-white/10 bg-white/[0.04] text-foreground",
  attention: "border-amber-400/18 bg-amber-400/[0.08] text-amber-100",
  positive: "border-emerald-400/18 bg-emerald-400/[0.08] text-emerald-100",
  future: "border-primary/18 bg-primary/[0.08] text-primary-foreground",
}

function formatDate(date?: Date) {
  if (!date) return "Escolha uma data"
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

const initialOperationalContext: OperationalContextState = {
  client: "Marina Alves",
  period: "Julho 2026",
  destination: "Gramado",
  budget: "R$ 12.000",
  priority: "Alta",
  owner: "Marina",
  note: "Casal, lua de mel, janela premium.",
  type: "Receita",
  amount: "R$ 1.850",
  account: "Conta principal",
  installments: "3x",
  dueDate: "2026-07-10",
  source: "Instagram",
  tags: "premium, honeymoon",
  channel: "WhatsApp",
  deadline: "Hoje, 18h",
  status: "Em preparo",
}

function StatusTag({ label, tone }: { label: string; tone: Tone }) {
  return (
    <Badge className={cn("rounded-full border px-2.5 py-1 text-[10px] tracking-[0.18em]", toneClasses[tone])} variant="outline">
      {label}
    </Badge>
  )
}

function ModuleWorkspaceCard({
  module,
  onPrimary,
  onOpen,
  onArmDrag,
}: {
  module: ModuleCard
  onPrimary: () => void
  onOpen: () => void
  onArmDrag?: () => void
}) {
  const Icon = module.icon

  return (
    <BaseCardV3
      eyebrow={module.eyebrow}
      title={module.title}
      className="min-h-[176px]"
      actions={
        <div className="flex items-center gap-2">
          <StatusTag label={module.status} tone={module.tone} />
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                data-drag-handle="true"
                onMouseDown={onArmDrag}
                className="cursor-grab active:cursor-grabbing rounded-full border border-white/8 bg-black/20 p-2 text-muted-foreground opacity-70 transition-all group-hover:opacity-100 hover:border-white/12 hover:bg-white/[0.05]"
              >
                <GripHorizontal className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Arrastar</TooltipContent>
          </Tooltip>
        </div>
      }
      footerClassName="mt-5 flex-nowrap items-center gap-2"
      footer={
        <>
          <AgencyRebuildActionButton
            actionType="modal"
            label={module.primaryLabel}
            className="h-8 min-w-0 flex-1 truncate rounded-full px-3 text-[11px]"
            onAction={onPrimary}
          />
          <AgencyRebuildActionButton
            actionType="modal"
            label="+"
            variant="outline"
            className="h-8 w-8 shrink-0 rounded-full border-white/10 bg-black/20 p-0 text-sm font-medium"
            tooltip={`Abrir workspace de ${module.title}.`}
            onAction={onOpen}
          />
        </>
      }
    >
      <div className="flex h-full flex-col gap-2">
        <div className="flex items-center justify-between rounded-[22px] border border-white/8 bg-black/14 px-3 py-2.5">
          <div className="flex items-center gap-2.5">
            <div className="rounded-[14px] border border-white/8 bg-white/[0.04] p-2">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{module.reading[0]}</p>
              <p className="text-[12px] text-muted-foreground">{module.reading[1]}</p>
            </div>
          </div>
        </div>
      </div>
    </BaseCardV3>
  )
}

export function AgencyRebuildDashboard() {
  const [gridOrder, setGridOrder] = useState<DashboardGridKey[]>([
    ...modules.map((module) => module.key),
    "operational-chart",
  ])
  const [dragArmedKey, setDragArmedKey] = useState<DashboardGridKey | null>(null)
  const [draggingKey, setDraggingKey] = useState<DashboardGridKey | null>(null)
  const [dragOverKey, setDragOverKey] = useState<DashboardGridKey | null>(null)
  const [workspaceOpen, setWorkspaceOpen] = useState(false)
  const [creatorOpen, setCreatorOpen] = useState(false)
  const [composerOpen, setComposerOpen] = useState(false)
  const [creationOpen, setCreationOpen] = useState(false)
  const [operationsOpen, setOperationsOpen] = useState(false)
  const [workspaceKey, setWorkspaceKey] = useState<string | null>(null)
  const [creationModuleKey, setCreationModuleKey] = useState<string | null>(null)
  const [composerScopeKey, setComposerScopeKey] = useState<string | null>(null)
  const [composerIntentKey, setComposerIntentKey] = useState<string | null>("new-trip")
  const [selectedIntent, setSelectedIntent] = useState("new-trip")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date("2026-07-10"))
  const [composerClient, setComposerClient] = useState("marina")
  const [composerStatus, setComposerStatus] = useState("draft")
  const [workspaceTab, setWorkspaceTab] = useState("overview")
  const [workspaceFilter, setWorkspaceFilter] = useState("all")
  const [workspaceView, setWorkspaceView] = useState("live")
  const [workspaceQuery, setWorkspaceQuery] = useState("")
  const [operationalContext] = useState<OperationalContextState>(initialOperationalContext)

  const groupedIntents = useMemo(() => {
    return intents.reduce<Record<string, Intent[]>>((acc, item) => {
      acc[item.group] = [...(acc[item.group] ?? []), item]
      return acc
    }, {})
  }, [])

  const selectedModule = modules.find((item) => item.key === workspaceKey) ?? null
  const creationScope = modules.find((item) => item.key === creationModuleKey) ?? null
  const composerScope = modules.find((item) => item.key === composerScopeKey) ?? null
  const selectedIntentData = intents.find((item) => item.key === selectedIntent) ?? intents[0]

  const gridItems = useMemo(
    () =>
      gridOrder
        .map((key) =>
          key === "operational-chart"
            ? { key, type: "chart" as const }
            : { key, type: "module" as const, module: modules.find((item) => item.key === key) ?? null },
        )
        .filter((item) => item.type === "chart" || item.module),
    [gridOrder],
  )

  const filteredWorkspaceItems = useMemo(() => {
    if (!selectedModule) return []
    if (workspaceTab === "empty") return []

    return selectedModule.workspaceItems.filter((item) => {
      if (!workspaceQuery) return true
      const query = workspaceQuery.toLowerCase()
      return (
        item.title.toLowerCase().includes(query) ||
        item.subtitle.toLowerCase().includes(query) ||
        item.status.toLowerCase().includes(query)
      )
    })
  }, [selectedModule, workspaceQuery, workspaceTab])

  const openComposer = (moduleKey?: string, defaultIntent?: string) => {
    setComposerScopeKey(moduleKey ?? null)
    if (defaultIntent) {
      setComposerIntentKey(defaultIntent)
    }
    setComposerOpen(true)
  }

  const openCreationModal = (moduleKey: string) => {
    setCreationModuleKey(moduleKey)
    setCreationOpen(true)
  }

  const reorderGrid = (fromKey: DashboardGridKey, toKey: DashboardGridKey) => {
    if (fromKey === toKey) return

    setGridOrder((current) => {
      const next = [...current]
      const fromIndex = next.indexOf(fromKey)
      const toIndex = next.indexOf(toKey)
      if (fromIndex === -1 || toIndex === -1) return current

      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
  }

  useEffect(() => {
    const workspaceTargets = new Set<AgencyRebuildMenuTarget>([
      "trips",
      "finance",
      "documents",
      "clients",
      "itineraries",
      "leads",
      "templates",
      "quotes",
      "team",
      "reports",
      "credits",
      "catalog",
      "operations",
      "expansions",
    ])

    return subscribeAgencyRebuildNavigation((target) => {
      if (target === "dashboard") {
        setWorkspaceKey(null)
        setCreationOpen(false)
        setComposerOpen(false)
        setOperationsOpen(false)
        setWorkspaceTab("overview")
        return
      }

      if (workspaceTargets.has(target)) {
        setCreationOpen(false)
        setComposerOpen(false)
        setOperationsOpen(false)
        setWorkspaceKey(target)
        setWorkspaceTab("overview")
      }
    })
  }, [])

  const renderCreationFields = () => {
    switch (creationScope?.key) {
      case "trips":
        return (
          <div className="grid gap-3 md:grid-cols-2">
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Cliente" />
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Destino" />
            <Input type="date" className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" />
            <Input type="date" className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" />
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Origem" />
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Valor estimado em R$" />
          </div>
        )
      case "finance":
        return (
          <div className="grid gap-3 md:grid-cols-2">
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Descricao do lancamento" />
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Valor em R$" />
            <Input type="date" className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" />
            <Select defaultValue="expense">
              <SelectTrigger className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent className="rounded-[20px]">
                <SelectItem value="expense">Gasto</SelectItem>
                <SelectItem value="income">Ganho</SelectItem>
                <SelectItem value="transfer">Transferencia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )
      case "documents":
        return (
          <div className="grid gap-3 md:grid-cols-2">
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Titulo do documento" />
            <Select defaultValue="contract">
              <SelectTrigger className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent className="rounded-[20px]">
                <SelectItem value="contract">Contrato</SelectItem>
                <SelectItem value="voucher">Voucher</SelectItem>
                <SelectItem value="receipt">Recibo</SelectItem>
                <SelectItem value="proposal">Proposta</SelectItem>
              </SelectContent>
            </Select>
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Cliente" />
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Viagem vinculada" />
          </div>
        )
      case "clients":
        return (
          <div className="grid gap-3 md:grid-cols-2">
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Nome do cliente" />
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Email" />
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Telefone / WhatsApp" />
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Cidade / Estado" />
          </div>
        )
      case "itineraries":
        return (
          <div className="grid gap-3 md:grid-cols-2">
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Titulo do roteiro" />
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Destino" />
            <Input type="date" className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" />
            <Input type="date" className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" />
          </div>
        )
      case "leads":
        return (
          <div className="grid gap-3 md:grid-cols-2">
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Nome do lead" />
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="WhatsApp" />
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Destino desejado" />
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Orcamento estimado em R$" />
          </div>
        )
      case "templates":
        return (
          <div className="grid gap-3 md:grid-cols-2">
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Nome do template" />
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Categoria" />
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Uso principal" />
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Responsavel" />
          </div>
        )
      case "quotes":
        return (
          <div className="grid gap-3 md:grid-cols-2">
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Cliente" />
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Destino" />
            <Input type="date" className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" />
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Valor estimado em R$" />
          </div>
        )
      case "team":
        return (
          <div className="grid gap-3 md:grid-cols-2">
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Nome do membro" />
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Cargo / funcao" />
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Equipe / setor" />
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Nivel de acesso" />
          </div>
        )
      case "reports":
        return (
          <div className="grid gap-3 md:grid-cols-2">
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Titulo do relatorio" />
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Tipo do relatorio" />
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Periodo" />
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Formato" />
          </div>
        )
      case "credits":
        return (
          <div className="grid gap-3 md:grid-cols-2">
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Pacote selecionado" />
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Quantidade de creditos" />
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Valor em R$" />
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Responsavel" />
          </div>
        )
      case "catalog":
        return (
          <div className="grid gap-3 md:grid-cols-2">
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Nome do pacote" />
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Destino" />
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Categoria" />
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Preco inicial em R$" />
          </div>
        )
      case "operations":
        return (
          <div className="grid gap-3 md:grid-cols-2">
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Titulo da tarefa" />
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Modulo relacionado" />
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Responsavel" />
            <Input type="date" className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" />
          </div>
        )
      case "expansions":
        return (
          <div className="grid gap-3 md:grid-cols-2">
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Expansao / recurso" />
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Categoria" />
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Status" />
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Compatibilidade" />
          </div>
        )
      default:
        return (
          <div className="grid gap-3 md:grid-cols-2">
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Titulo" />
            <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Contexto" />
          </div>
        )
    }
  }

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <BaseCardV3
          eyebrow="Workspace operacional vivo"
          title="Resolva o que importa sem sair do dashboard."
          description="Alertas, embarques, documentos e financeiro em uma leitura compacta, viva e organizada."
          actions={
            <AgencyRebuildActionButton
              actionType="modal"
              label={
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
                    workspaceOpen ? "rotate-180" : "",
                  )}
                />
              }
              className="h-8 w-8 rounded-full border border-white/8 bg-white/[0.03] p-0"
              variant="outline"
              tooltip={workspaceOpen ? "Recolher" : "Expandir"}
              onAction={() => setWorkspaceOpen((current) => !current)}
            />
          }
          footer={
            workspaceOpen ? (
              <>
                <AgencyRebuildActionButton
                  actionType="modal"
                  label="Resolver agora"
                  className="rounded-full"
                  onAction={() => setOperationsOpen(true)}
                />
                <AgencyRebuildActionButton
                  actionType="modal"
                  label="Ver prioridades"
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/[0.03]"
                  onAction={() => {
                    setWorkspaceKey("operations")
                    setWorkspaceTab("overview")
                  }}
                />
              </>
            ) : undefined
          }
        >
          <div
            className={cn(
              "overflow-hidden transition-all duration-300 ease-out",
              workspaceOpen ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0",
            )}
          >
            <div className="grid gap-2 md:grid-cols-2">
              {operationSignals.map((signal) => (
                <div
                  key={signal.label}
                  className="rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.018))] px-3 py-2.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-primary/72">{signal.label}</p>
                    <Badge className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px]" variant="outline">
                      Vivo
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm font-medium text-foreground">{signal.value}</p>
                  <p className="mt-1 text-[12px] leading-5 text-muted-foreground">{signal.note}</p>
                </div>
              ))}
            </div>
          </div>
        </BaseCardV3>

        <BaseCardV3
          eyebrow="Criador inteligente"
          title="Criar com IA"
          description="Uma central assistida para iniciar acao, preencher contexto e preparar o proximo passo."
          actions={
            <AgencyRebuildActionButton
              actionType="modal"
              label={
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
                    creatorOpen ? "rotate-180" : "",
                  )}
                />
              }
              className="h-8 w-8 rounded-full border border-white/8 bg-white/[0.03] p-0"
              variant="outline"
              tooltip={creatorOpen ? "Recolher" : "Expandir"}
              onAction={() => setCreatorOpen((current) => !current)}
            />
          }
          footer={
            creatorOpen ? (
              <>
                <AgencyRebuildActionButton
                  actionType="modal"
                  label="Iniciar"
                  className="rounded-full"
                  onAction={() => openComposer()}
                />
                <AgencyRebuildActionButton
                  actionType="modal"
                  label="Ver sugestoes"
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/[0.03]"
                  onAction={() => setOperationsOpen(true)}
                />
                <AgencyRebuildActionButton
                  actionType="modal"
                  label={<Plus className="h-4 w-4" />}
                  className="h-9 w-9 rounded-full p-0"
                  variant="outline"
                  tooltip="Abrir o criador assistido da V3."
                  onAction={() => openComposer()}
                />
              </>
            ) : undefined
          }
        >
          <div
            className={cn(
              "overflow-hidden transition-all duration-300 ease-out",
              creatorOpen ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0",
            )}
          >
            <div className="rounded-[22px] border border-white/8 bg-black/16 px-3 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-primary/72">Comandos prontos</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {["Cliente", "Viagem", "Documento", "Financeiro", "Tarefa"].map((item) => (
                  <Badge key={item} className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px]" variant="outline">
                    {item}
                  </Badge>
                ))}
              </div>
              <div className="mt-3 space-y-2">
                {[
                  "Criar viagem da Ana para Gramado em julho. Casal. Lua de mel.",
                  "Registrar recebimento da Italia Signature com parcelamento em 3x.",
                  "Publicar pacote para Cancun com CTA de WhatsApp.",
                ].map((item) => (
                  <div key={item} className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2 text-[12px] leading-5 text-muted-foreground">
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-[18px] border border-primary/12 bg-primary/[0.08] px-3 py-2 text-[12px] leading-5 text-primary/85">
                Exemplo vivo: {operationalContext.client} • {operationalContext.destination} • prioridade {operationalContext.priority.toLowerCase()}.
              </div>
            </div>
          </div>
        </BaseCardV3>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {gridItems.map((item) => {
          const key = item.key
          const isDragging = draggingKey === key
          const isDragOver = dragOverKey === key && draggingKey !== key

          return (
            <div
              key={key}
              draggable={dragArmedKey === key}
              onDragStart={(event) => {
                if (dragArmedKey !== key) {
                  event.preventDefault()
                  return
                }

                setDraggingKey(key)
                setDragOverKey(null)
                event.dataTransfer.effectAllowed = "move"
                event.dataTransfer.setData("text/plain", key)
              }}
              onDragOver={(event) => {
                if (!draggingKey || draggingKey === key) return
                event.preventDefault()
                if (dragOverKey !== key) setDragOverKey(key)
              }}
              onDrop={(event) => {
                event.preventDefault()
                const fromKey = (event.dataTransfer.getData("text/plain") as DashboardGridKey) || draggingKey
                if (!fromKey) return
                reorderGrid(fromKey, key)
                setDragOverKey(null)
              }}
              onDragEnd={() => {
                setDraggingKey(null)
                setDragOverKey(null)
                setDragArmedKey(null)
              }}
              className={cn(
                "transition-all duration-200",
                key === "operational-chart" && "xl:col-span-2",
                isDragging && "scale-[0.985] opacity-70",
                isDragOver && "rounded-[30px] ring-1 ring-primary/30",
              )}
            >
              {item.type === "chart" ? (
                <AgencyOperationalChart onArmDrag={() => setDragArmedKey(key)} />
              ) : (
                <ModuleWorkspaceCard
                  module={item.module}
                  onArmDrag={() => setDragArmedKey(key)}
                  onPrimary={() => openCreationModal(item.module.key)}
                  onOpen={() => {
                    setWorkspaceKey(item.module.key)
                    setWorkspaceTab("overview")
                  }}
                />
              )}
            </div>
          )
        })}
      </div>

      <BaseModalV3
        open={creationOpen}
        onOpenChange={setCreationOpen}
        title={creationScope?.primaryLabel ?? "Criar item"}
        description={
          creationScope
            ? `Fluxo rapido de ${creationScope.title.toLowerCase()} no padrao V3, sem depender do Criar com IA.`
            : "Fluxo rapido local da V3."
        }
        contentClassName="sm:max-w-4xl"
        footer={
          <>
            <AgencyRebuildActionButton
              actionType="modal"
              label="Cancelar"
              variant="outline"
              className="rounded-full border-white/10 bg-white/[0.03]"
              onAction={() => setCreationOpen(false)}
            />
            <AgencyRebuildActionButton
              actionType="api"
              label={creationScope?.primaryLabel ?? "Salvar"}
              className="rounded-full"
              onAction={() => {
                toast({
                  title: creationScope?.primaryLabel ?? "Acao criada",
                  description: "Fluxo local concluido com sucesso na Agency Rebuild.",
                })
                setCreationOpen(false)
                setCreationModuleKey(null)
              }}
            />
          </>
        }
      >
        <div className="space-y-4">
          <BaseCardV3
            eyebrow="Criacao dedicada"
            title={creationScope?.title ?? "Novo item"}
            className="rounded-[28px]"
          >
            <div className="space-y-4">
              {renderCreationFields()}
              <Textarea
                className="min-h-[112px] rounded-[20px] border-white/10 bg-white/[0.03] px-4 py-3"
                placeholder="Observacoes, tags ou contexto curto para este fluxo."
              />
            </div>
          </BaseCardV3>
        </div>
      </BaseModalV3>

      <AgencyRebuildAiOperationsCenter
        open={composerOpen}
        onOpenChange={setComposerOpen}
        scopeTitle={composerScope?.title ?? null}
        defaultIntentKey={composerIntentKey}
      />

      {false ? (
      <BaseModalV3
        open={composerOpen}
        onOpenChange={setComposerOpen}
        title="Criar com IA"
        description={
          composerScope
            ? `Copiloto operacional para ${composerScope.title.toLowerCase()} com leitura viva da jornada.`
            : "Central operacional inteligente da V3 para entender intencao, preparar estrutura e iniciar jornadas."
        }
        contentClassName="sm:max-w-[1380px]"
        bodyClassName="pb-6"
        footer={
          <>
            <AgencyRebuildActionButton
              actionType="api"
              label="Salvar rascunho"
              variant="outline"
              className="rounded-full border-white/10 bg-white/[0.03]"
              onAction={async () => {
                await new Promise((resolve) => setTimeout(resolve, 500))
                toast({
                  title: "Rascunho salvo",
                  description: "A intencao ficou pronta para retomada na central operacional.",
                })
              }}
            />
            <AgencyRebuildActionButton
              actionType="future"
              label="Executar acao"
              className="rounded-full"
              futureMessage={`Fluxo inteligente em preparação para ${selectedIntentData.label.toLowerCase()}.`}
            />
          </>
        }
      >
        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <div className="rounded-[24px] border border-white/8 bg-black/14 p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-primary/72">Comandos</p>
              <div className="mt-3 space-y-4">
                {Object.entries(groupedIntents).map(([group, items]) => (
                  <div key={group} className="space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{group}</p>
                    <div className="grid gap-2">
                      {items.map((item) => (
                        <AgencyRebuildActionButton
                          key={item.key}
                          actionType="modal"
                          label={
                            <div className="w-full text-left">
                              <p className="text-sm font-medium text-foreground">{item.label}</p>
                              <p className="mt-1 text-[12px] leading-5 text-muted-foreground">{item.description}</p>
                            </div>
                          }
                          className={cn(
                            "h-auto w-full justify-start rounded-[20px] border px-4 py-3 text-left",
                            selectedIntent === item.key
                              ? "border-primary/22 bg-primary/[0.1]"
                              : "border-white/8 bg-white/[0.03]",
                          )}
                          variant="outline"
                          onAction={() => setSelectedIntent(item.key)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-primary/72">Atalhos sugeridos</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {smartSuggestions.map((item) => (
                  <Badge key={item} className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] leading-5 text-muted-foreground" variant="outline">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.018))] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-primary/72">Contexto minimo</p>
                  <p className="mt-1 text-sm text-muted-foreground">Campos ja nascem escuros, legiveis e prontos para a V3 real.</p>
                </div>
                <StatusTag label="Assistido" tone="future" />
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Cliente</label>
                  <Select value={composerClient} onValueChange={setComposerClient}>
                    <SelectTrigger className="w-full rounded-[18px] border-white/10 bg-white/[0.03]">
                      <SelectValue placeholder="Selecionar cliente" />
                    </SelectTrigger>
                    <SelectContent className="rounded-[20px]">
                      <SelectItem value="marina">Marina Alves • Horizonte Viagens</SelectItem>
                      <SelectItem value="vip">Cliente VIP • Italia Signature</SelectItem>
                      <SelectItem value="corp">Grupo corporativo • Julho</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Status inicial</label>
                  <Select value={composerStatus} onValueChange={setComposerStatus}>
                    <SelectTrigger className="w-full rounded-[18px] border-white/10 bg-white/[0.03]">
                      <SelectValue placeholder="Selecionar status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-[20px]">
                      <SelectItem value="draft">Em preparo</SelectItem>
                      <SelectItem value="review">Revisao</SelectItem>
                      <SelectItem value="ready">Pronto para envio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Contexto curto</label>
                <Input
                  className="h-11 rounded-[18px] border-white/10 bg-white/[0.03] px-4"
                  placeholder="Descreva o que precisa nascer primeiro."
                />
              </div>

              <div className="mt-3 space-y-2">
                <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Observacao</label>
                <Textarea
                  className="min-h-[104px] rounded-[20px] border-white/10 bg-white/[0.03] px-4 py-3"
                  placeholder="Adicione uma nota curta para orientar a acao assistida."
                />
              </div>
            </div>

            <div className="rounded-[24px] border border-white/8 bg-black/14 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-primary/72">Janela e calendario</p>
                  <p className="mt-1 text-sm text-muted-foreground">{formatDate(selectedDate)}</p>
                </div>
                <Badge className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px]" variant="outline">
                  Dark calendar
                </Badge>
              </div>
              <div className="mt-3 overflow-hidden rounded-[22px] border border-white/8 bg-white/[0.02] p-2">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-[18px] bg-transparent p-1"
                  classNames={{
                    month_caption: "text-foreground flex items-center justify-center h-8",
                    caption_label: "text-sm font-medium text-foreground",
                    dropdown_root: "border-white/10 bg-white/[0.03] shadow-none",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </BaseModalV3>
      ) : null}

      <BaseDrawerV3
        open={operationsOpen}
        onOpenChange={setOperationsOpen}
        title="Central operacional"
        description="Uma fila curta de sinais vivos para resolver sem trocar de contexto."
        footer={
          <>
            <AgencyRebuildActionButton
              actionType="modal"
              label="Abrir workspace"
              className="rounded-full"
              onAction={() => {
                setOperationsOpen(false)
                setWorkspaceKey("operations")
                setWorkspaceTab("overview")
              }}
            />
            <AgencyRebuildActionButton
              actionType="modal"
              label="Fechar"
              variant="outline"
              className="rounded-full border-white/10 bg-white/[0.03]"
              onAction={() => setOperationsOpen(false)}
            />
          </>
        }
      >
        <div className="space-y-3">
          {operationSignals.map((signal) => (
            <BaseCardV3
              key={signal.label}
              title={signal.value}
              description={signal.note}
              className="rounded-[24px] p-3"
              actions={<StatusTag label={signal.label} tone="attention" />}
            />
          ))}
        </div>
      </BaseDrawerV3>

      <BaseModalV3
        open={Boolean(selectedModule && !["finance", "trips", "clients", "documents", "itineraries", "leads", "templates", "reports", "credits", "catalog", "operations", "expansions", "team", "quotes"].includes(selectedModule.key))}
        onOpenChange={(open) => {
          if (!open) setWorkspaceKey(null)
        }}
        title={selectedModule ? selectedModule.title : "Workspace"}
        description={selectedModule?.workspaceDescription}
        contentClassName="sm:max-w-6xl"
        bodyClassName="pb-6"
        footer={
          selectedModule ? (
            <>
              <AgencyRebuildActionButton
                actionType="modal"
                label={selectedModule.primaryLabel}
                className="rounded-full"
                onAction={() => {
                  setWorkspaceKey(null)
                  openCreationModal(selectedModule.key)
                }}
              />
              <AgencyRebuildActionButton
                actionType="modal"
                label="Fechar"
                variant="outline"
                className="rounded-full border-white/10 bg-white/[0.03]"
                onAction={() => setWorkspaceKey(null)}
              />
            </>
          ) : null
        }
      >
        {selectedModule ? (
          <div className="space-y-5">
            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px_220px]">
              <Input
                value={workspaceQuery}
                onChange={(event) => setWorkspaceQuery(event.target.value)}
                className="h-11 rounded-[18px] border-white/10 bg-white/[0.03] px-4"
                placeholder={`Buscar em ${selectedModule.title.toLowerCase()}`}
              />

              <Select value={workspaceFilter} onValueChange={setWorkspaceFilter}>
                <SelectTrigger className="h-11 w-full rounded-[18px] border-white/10 bg-white/[0.03]">
                  <SelectValue placeholder="Filtrar" />
                </SelectTrigger>
                <SelectContent className="rounded-[20px]">
                  <SelectItem value="all">Tudo</SelectItem>
                  <SelectItem value="pending">Pendencias</SelectItem>
                  <SelectItem value="live">Ativos</SelectItem>
                </SelectContent>
              </Select>

              <Select value={workspaceView} onValueChange={setWorkspaceView}>
                <SelectTrigger className="h-11 w-full rounded-[18px] border-white/10 bg-white/[0.03]">
                  <SelectValue placeholder="Visao" />
                </SelectTrigger>
                <SelectContent className="rounded-[20px]">
                  <SelectItem value="live">Visao viva</SelectItem>
                  <SelectItem value="compact">Compacta</SelectItem>
                  <SelectItem value="focus">Foco</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Tabs value={workspaceTab} onValueChange={setWorkspaceTab} className="gap-4">
              <TabsList className="gap-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="recent">Recentes</TabsTrigger>
                <TabsTrigger value="actions">Acoes</TabsTrigger>
                <TabsTrigger value="empty">Vazio</TabsTrigger>
              </TabsList>

              {["overview", "recent", "actions", "empty"].map((tab) => (
                <TabsContent key={tab} value={tab}>
                  <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
                    <div className="space-y-3">
                      {filteredWorkspaceItems.length ? (
                        filteredWorkspaceItems.map((item) => (
                          <BaseCardV3
                            key={`${tab}-${item.title}`}
                            title={item.title}
                            description={item.subtitle}
                            className="rounded-[24px] p-3.5"
                            actions={<StatusTag label={item.status} tone={selectedModule.tone} />}
                            footer={
                              <>
                                <AgencyRebuildActionButton
                                  actionType="future"
                                  label="Editar"
                                  className="h-8 rounded-full px-3 text-xs"
                                  futureMessage={`Disponivel na proxima etapa da V3 para ${selectedModule.title.toLowerCase()}.`}
                                />
                                <AgencyRebuildActionButton
                                  actionType="future"
                                  label="Resolver"
                                  variant="outline"
                                  className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs"
                                  futureMessage={`Fluxo inteligente em preparação para ${item.title.toLowerCase()}.`}
                                />
                              </>
                            }
                          >
                            <div className="rounded-[18px] border border-white/8 bg-black/14 px-3 py-2 text-[12px] leading-5 text-muted-foreground">
                              {item.meta}
                            </div>
                          </BaseCardV3>
                        ))
                      ) : (
                        <BaseCardV3
                          title={selectedModule.emptyTitle}
                          description={selectedModule.emptyBody}
                          className="rounded-[26px] p-5"
                          actions={<StatusTag label="Silencioso" tone="future" />}
                        >
                          <div className="rounded-[20px] border border-dashed border-white/10 bg-white/[0.02] px-4 py-6 text-sm text-muted-foreground">
                            Nada precisa gritar aqui. Quando a camada real entrar, este workspace mostrara sinais, listas e proximos passos de forma viva.
                          </div>
                        </BaseCardV3>
                      )}
                    </div>

                    <div className="space-y-3">
                      <BaseCardV3
                        eyebrow="Painel lateral"
                        title="Leitura operacional"
                        description="Uma mesa auxiliar para filtros, sinais e proximo passo."
                        className="rounded-[26px]"
                        footer={
                          <>
                            <AgencyRebuildActionButton
                              actionType="modal"
                              label={selectedModule.primaryLabel}
                              className="h-8 rounded-full px-3 text-xs"
                              onAction={() => {
                                setWorkspaceKey(null)
                                openCreationModal(selectedModule.key)
                              }}
                            />
                          </>
                        }
                      >
                        <div className="space-y-2">
                          {selectedModule.reading.map((reading) => (
                            <div
                              key={reading}
                              className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2 text-[12px] leading-5 text-muted-foreground"
                            >
                              {reading}
                            </div>
                          ))}
                        </div>
                      </BaseCardV3>

                      <BaseCardV3
                        eyebrow="Estrutura da V3"
                        title="Campos e filtros"
                        description="Inputs escuros, select moderno, tabs premium e estado vazio elegante."
                        className="rounded-[26px]"
                      >
                        <div className="flex flex-wrap gap-2">
                          {[
                            "Busca inteligente",
                            "Select dark",
                            "Workspace expandido",
                            "Acoes rapidas",
                            "Calendario premium",
                          ].map((item) => (
                            <Badge
                              key={item}
                              className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-muted-foreground"
                              variant="outline"
                            >
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </BaseCardV3>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        ) : null}
      </BaseModalV3>

      <AgencyRebuildFinanceWorkspace
        open={workspaceKey === "finance"}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setWorkspaceKey(null)
        }}
      />

      <AgencyRebuildTripsWorkspace
        open={workspaceKey === "trips"}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setWorkspaceKey(null)
        }}
      />

      <AgencyRebuildClientsWorkspace
        open={workspaceKey === "clients"}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setWorkspaceKey(null)
        }}
      />

      <AgencyRebuildDocumentsWorkspace
        open={workspaceKey === "documents"}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setWorkspaceKey(null)
        }}
      />

      <AgencyRebuildItinerariesWorkspace
        open={workspaceKey === "itineraries"}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setWorkspaceKey(null)
        }}
      />

      <AgencyRebuildLeadsWorkspace
        open={workspaceKey === "leads"}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setWorkspaceKey(null)
        }}
      />

      <AgencyRebuildTemplatesWorkspace
        open={workspaceKey === "templates"}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setWorkspaceKey(null)
        }}
      />

      <AgencyRebuildReportsWorkspace
        open={workspaceKey === "reports"}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setWorkspaceKey(null)
        }}
      />

      <AgencyRebuildCreditsWorkspace
        open={workspaceKey === "credits"}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setWorkspaceKey(null)
        }}
      />

      <AgencyRebuildCatalogWorkspace
        open={workspaceKey === "catalog"}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setWorkspaceKey(null)
        }}
      />

      <AgencyRebuildTeamWorkspace
        open={workspaceKey === "team"}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setWorkspaceKey(null)
        }}
      />

      <AgencyRebuildTravelBuilderWorkspace
        open={workspaceKey === "quotes"}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setWorkspaceKey(null)
        }}
      />

      <AgencyRebuildOperationsWorkspace
        open={workspaceKey === "operations"}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setWorkspaceKey(null)
        }}
      />

      <AgencyRebuildExpansionsWorkspace
        open={workspaceKey === "expansions"}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setWorkspaceKey(null)
        }}
      />
    </>
  )
}
