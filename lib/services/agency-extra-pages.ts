import {
  AlertTriangle,
  Bot,
  CheckCheck,
  CreditCard,
  FileStack,
  FileText,
  HandCoins,
  HeartHandshake,
  MessageSquareText,
  PlaneTakeoff,
  Receipt,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Waypoints,
  Workflow,
} from "lucide-react"
import type { PortalPageConfig } from "@/lib/services/portal-types"
import { documents } from "@/mock/documents"
import { templates } from "@/mock/templates"

export const agencyStandalonePages: Record<string, PortalPageConfig> = {
  "atlas-advisor": {
    title: "Atlas Advisor",
    description: "Consultoria operacional inteligente para vender melhor, organizar a agência e destravar situações delicadas.",
    primaryAction: "Nova consulta",
    secondaryAction: "Ver histórico",
    primaryActionHref: "/app/atlas-advisor",
    secondaryActionHref: "/app/atlas-advisor",
    metrics: [
      { label: "Orientações ativas", value: "12", change: "4 prioritárias", tone: "success", icon: Target },
      { label: "Scripts prontos", value: "28", change: "comercial + suporte", tone: "info", icon: FileText },
      { label: "Casos sensíveis", value: "3", change: "seguindo plano", tone: "warning", icon: AlertTriangle },
      { label: "Ganhos estimados", value: "+18%", change: "em conversão", tone: "success", icon: TrendingUp },
    ],
    blocks: [
      {
        type: "highlights",
        title: "Consultoria prática",
        description: "Leituras e ações guiadas pelo Atlas para a operação da agência.",
        span: "half",
        items: [
          { title: "Orientação comercial", description: "Abordagens para aumentar taxa de resposta e fechamento.", icon: Target },
          { title: "Scripts de atendimento", description: "Modelos rápidos para objeções, follow-up e upsell.", tone: "info", icon: FileText },
          { title: "Situações difíceis", description: "Apoio para reacomodação, atraso, crise e negociação sensível.", tone: "warning", icon: AlertTriangle },
        ],
      },
      {
        type: "highlights",
        title: "Organização e escala",
        span: "half",
        items: [
          { title: "Rotina operacional", description: "Checklist para organizar tarefas, pendências e prioridades.", icon: CheckCheck },
          { title: "Vender mais", description: "Sugestões de upsell, timing de contato e priorização de leads.", tone: "success", icon: TrendingUp },
          { title: "Escala da agência", description: "Estrutura de papéis, processos e sinais para crescer com controle.", tone: "info", icon: Users },
        ],
      },
      {
        type: "feed",
        title: "Histórico de consultas",
        description: "Consultas mockadas recentes da equipe com contexto operacional.",
        span: "full",
        items: [
          { title: "Lead frio sem retorno", description: "Atlas sugeriu nova abordagem com urgência leve e prova social.", time: "há 18 min", tone: "info", href: "/app/leads" },
          { title: "Cliente preocupado com alteração aérea", description: "Atlas indicou script de segurança e atualização por etapas.", time: "há 42 min", tone: "warning", href: "/app/viagens" },
          { title: "Pacote premium com baixa conversão", description: "Atlas recomendou simplificar a oferta e reforçar benefícios concretos.", time: "hoje", tone: "success", href: "/app/catalogo" },
        ],
      },
      {
        type: "highlights",
        title: "Sugestões rápidas",
        span: "full",
        columns: 4,
        items: [
          { title: "Rever script de follow-up", description: "Ajuste a cadência para leads mornos.", href: "/app/leads" },
          { title: "Criar resposta para atraso", description: "Padronize atendimento em crise de viagem.", href: "/app/viagens" },
          { title: "Refinar proposta premium", description: "Reforce valor percebido antes do preço.", href: "/app/cotacoes" },
          { title: "Organizar rotina diária", description: "Dê prioridade ao que move caixa e operação.", href: "/app/central-operacional" },
        ],
      },
    ],
  },
  automacoes: {
    title: "Automações Premium",
    description: "Fluxos automáticos para follow-up, reativação, alertas operacionais e tarefas inteligentes.",
    primaryAction: "Novo fluxo",
    secondaryAction: "Ver histórico",
    primaryActionHref: "/app/automacoes",
    secondaryActionHref: "/app/automacoes",
    metrics: [
      { label: "Fluxos ativos", value: "16", change: "11 em produção", tone: "success", icon: Workflow },
      { label: "Follow-ups", value: "84", change: "esta semana", tone: "info", icon: HeartHandshake },
      { label: "Reativações", value: "22", change: "leads recuperados", tone: "warning", icon: Waypoints },
      { label: "Tarefas automáticas", value: "146", change: "sem intervenção", tone: "success", icon: CheckCheck },
    ],
    blocks: [
      {
        type: "highlights",
        title: "Fluxos automáticos",
        span: "half",
        items: [
          { title: "Follow-up comercial", description: "Retoma leads sem resposta com cadência premium.", icon: HeartHandshake },
          { title: "Reativação de leads", description: "Aciona base parada com gatilhos e oportunidade sazonal.", tone: "info", icon: Waypoints },
          { title: "Alertas inteligentes", description: "Dispara avisos por atraso, documento e pagamento.", tone: "warning", icon: AlertTriangle },
        ],
      },
      {
        type: "highlights",
        title: "Automação operacional",
        span: "half",
        items: [
          { title: "Tarefas automáticas", description: "Cria ações na central conforme estágio da viagem.", icon: CheckCheck },
          { title: "Notificações", description: "Alimenta time com contexto prático e prioridade.", tone: "info", icon: Sparkles },
          { title: "Status ativo/inativo", description: "Controle fino por fluxo com histórico e governança.", tone: "success", icon: Workflow },
        ],
      },
      {
        type: "table",
        title: "Histórico mockado",
        span: "full",
        columns: [
          { key: "name", label: "Fluxo" },
          { key: "status", label: "Status" },
          { key: "trigger", label: "Gatilho" },
          { key: "result", label: "Resultado" },
        ],
        rows: [
          { name: "Recuperação de cotação", status: "Ativo", trigger: "48h sem resposta", result: "12 reativações" },
          { name: "Checklist pré-embarque", status: "Ativo", trigger: "3 dias antes", result: "34 avisos enviados" },
          { name: "Alerta de parcela", status: "Ativo", trigger: "vencimento próximo", result: "8 cobranças prevenidas" },
          { name: "Oferta de upsell", status: "Inativo", trigger: "viagem premium", result: "aguardando revisão" },
        ],
      },
    ],
  },
  creditos: {
    title: "Créditos e consumo",
    description: "Uso mensal de créditos, IA, PDFs, WhatsApp, Agent, TravelPro Go e automações da agência.",
    primaryAction: "Comprar créditos",
    secondaryAction: "Ver histórico",
    primaryActionHref: "/app/creditos",
    secondaryActionHref: "/app/creditos",
    metrics: [
      { label: "Créditos disponíveis", value: "4.280", change: "renovação em 9 dias", tone: "success", icon: CreditCard },
      { label: "Usados no mês", value: "1.720", change: "41% da cota", tone: "warning", icon: HandCoins },
      { label: "Uso IA", value: "640", change: "roteiros + cotações", tone: "info", icon: Bot },
      { label: "Alertas de consumo", value: "2", change: "acompanhar hoje", tone: "danger", icon: AlertTriangle },
    ],
    blocks: [
      {
        type: "highlights",
        title: "Consumo por tipo",
        span: "full",
        columns: 4,
        items: [
          { title: "Roteiros", description: "240 créditos em experiências e ajustes.", icon: Sparkles },
          { title: "Contratos", description: "180 créditos em geração e revisão.", icon: ShieldCheck },
          { title: "Cotações", description: "120 créditos em propostas personalizadas.", icon: Receipt },
          { title: "PDFs", description: "90 créditos em exportações e layouts.", icon: FileText },
          { title: "WhatsApp", description: "420 créditos em mensagens operacionais.", icon: MessageSquareText },
          { title: "Agent", description: "310 créditos em atendimento e follow-up.", icon: Bot },
          { title: "TravelPro Go", description: "220 créditos em comandos e automação.", icon: Waypoints },
          { title: "Automações", description: "140 créditos em fluxos ativos.", icon: Workflow },
        ],
      },
      {
        type: "table",
        title: "Histórico de uso",
        span: "half",
        columns: [
          { key: "type", label: "Tipo" },
          { key: "status", label: "Status" },
          { key: "credits", label: "Créditos" },
        ],
        rows: [
          { type: "Roteiro premium", status: "Concluído", credits: "48" },
          { type: "Contrato com branding", status: "Concluído", credits: "22" },
          { type: "TravelPro Go", status: "Concluído", credits: "14" },
          { type: "Follow-up do Agent", status: "Concluído", credits: "8" },
        ],
      },
      {
        type: "feed",
        title: "Próximos créditos e alertas",
        span: "half",
        items: [
          { title: "Renovação próxima", description: "A cota mensal renova em 9 dias.", time: "agora", tone: "info", href: "/app/creditos" },
          { title: "Uso alto em WhatsApp", description: "TravelPro Go ficou acima da média na última semana.", time: "há 1h", tone: "warning", href: "/app/travelpro-go" },
          { title: "Agent saudável", description: "Consumo dentro do esperado para o volume de leads.", time: "hoje", tone: "success", href: "/app/agent" },
        ],
      },
    ],
  },
}

export const agencyDocumentPages: Record<string, PortalPageConfig> = {
  contratos: {
    title: "Contratos",
    description: "Contratos organizados por viagem, cliente e status de assinatura.",
    primaryAction: "Criar contrato",
    primaryActionHref: "/app/documentos/contratos",
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
  vouchers: {
    title: "Vouchers",
    description: "Vouchers prontos para hospedagem, traslados e serviços vinculados à viagem.",
    primaryAction: "Novo voucher",
    primaryActionHref: "/app/documentos/vouchers",
    blocks: [
      {
        type: "table",
        title: "Vouchers emitidos",
        span: "full",
        columns: [
          { key: "name", label: "Documento" },
          { key: "client", label: "Cliente" },
          { key: "trip", label: "Viagem" },
          { key: "status", label: "Status" },
        ],
        rows: documents.filter((item) => item.type === "Voucher"),
      },
    ],
  },
  recibos: {
    title: "Recibos",
    description: "Comprovantes financeiros ligados a viagens, entradas e pagamentos finais.",
    primaryAction: "Novo recibo",
    primaryActionHref: "/app/documentos/recibos",
    blocks: [
      {
        type: "table",
        title: "Recibos registrados",
        span: "full",
        columns: [
          { key: "name", label: "Documento" },
          { key: "client", label: "Cliente" },
          { key: "trip", label: "Viagem" },
          { key: "status", label: "Status" },
        ],
        rows: documents.filter((item) => item.type === "Recibo"),
      },
    ],
  },
  passagens: {
    title: "Passagens",
    description: "Trechos e emissões organizados com status e vínculo com cada viagem.",
    primaryAction: "Nova passagem",
    primaryActionHref: "/app/documentos/passagens",
    blocks: [
      {
        type: "table",
        title: "Passagens vinculadas",
        span: "full",
        columns: [
          { key: "name", label: "Documento" },
          { key: "client", label: "Cliente" },
          { key: "trip", label: "Viagem" },
          { key: "status", label: "Status" },
        ],
        rows: documents.filter((item) => item.type === "Passagem"),
      },
    ],
  },
  templates: {
    title: "Templates",
    description: "Modelos prontos para contratos, roteiros, recibos e materiais operacionais.",
    primaryAction: "Novo template",
    primaryActionHref: "/app/documentos/templates",
    blocks: [
      {
        type: "table",
        title: "Biblioteca de templates",
        span: "half",
        columns: [
          { key: "name", label: "Template" },
          { key: "type", label: "Tipo" },
          { key: "category", label: "Categoria" },
          { key: "status", label: "Status" },
        ],
        rows: templates,
      },
      {
        type: "highlights",
        title: "Uso rápido",
        span: "half",
        items: [
          { title: "Contratos com branding", description: "Modelos consistentes com a identidade da agência.", icon: ShieldCheck },
          { title: "Roteiros modulares", description: "Blocos premium para acelerar personalização.", tone: "info", icon: Sparkles },
          { title: "Layouts operacionais", description: "Recibos, vouchers e suportes prontos para reutilizar.", tone: "success", icon: FileStack },
        ],
      },
    ],
  },
}

export const agencyTripPages: Record<string, PortalPageConfig> = {
  roteiros: {
    title: "Roteiros",
    description: "Roteiros por cliente, templates reutilizáveis e evolução operacional da viagem.",
    primaryAction: "Criar roteiro",
    secondaryAction: "Usar template",
    primaryActionHref: "/app/viagens/roteiros",
    secondaryActionHref: "/app/documentos/templates",
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
        title: "Experiência final do viajante",
        description: "A estrutura já está pronta para PDF, versão premium e personalização por cliente.",
        span: "half",
        actionLabel: "Planejar exportação",
        actionHref: "/app/viagens/roteiros",
      },
    ],
  },
  cotacoes: {
    title: "Cotações",
    description: "Propostas comerciais com status, estrutura manual e preparação para IA futura.",
    primaryAction: "Criar cotação",
    primaryActionHref: "/app/viagens/cotacoes",
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
        type: "highlights",
        title: "Ações comerciais",
        span: "half",
        items: [
          { title: "Follow-up rápido", description: "Retome cotações sem resposta com contexto do lead.", icon: HeartHandshake, href: "/app/leads" },
          { title: "Versão premium", description: "Refine apresentação, preço e percepção de valor.", tone: "info", icon: Sparkles, href: "/app/catalogo" },
          { title: "Aprovação facilitada", description: "Deixe a proposta pronta para virar contrato.", tone: "success", icon: Receipt, href: "/app/documentos/contratos" },
        ],
      },
    ],
  },
}

export const agencyOperationalPages: Record<string, PortalPageConfig> = {
  insights: {
    title: "Insights",
    description: "Leituras inteligentes sobre financeiro, clientes, produtividade e operação.",
    primaryAction: "Exportar relatório",
    secondaryAction: "Enviar via WhatsApp futuro",
    blocks: [
      {
        type: "chart",
        title: "Relatório semanal",
        description: "Consolidado visual de produtividade e vendas.",
        span: "half",
        series: [
          { label: "Seg", value: 22 },
          { label: "Ter", value: 34 },
          { label: "Qua", value: 40 },
          { label: "Qui", value: 38 },
          { label: "Sex", value: 49 },
          { label: "Sáb", value: 27 },
        ],
      },
      {
        type: "highlights",
        title: "Leituras inteligentes",
        span: "half",
        items: [
          { title: "Financeiro", description: "Lucro projetado acima da média da última quinzena.", tone: "success", icon: HandCoins },
          { title: "Clientes", description: "Clientes premium respondem melhor após 18h.", tone: "info", icon: Users },
          { title: "Operação", description: "Automações reduziram tempo manual nas rotinas críticas.", tone: "success", icon: Workflow },
        ],
      },
    ],
  },
  creditos: agencyStandalonePages.creditos,
  tarefas: {
    title: "Tarefas",
    description: "Fila operacional com urgências, entregas do dia e acompanhamento por responsável.",
    primaryAction: "Nova tarefa",
    extraActions: [{ label: "Adicionar rota rápida" }],
    primaryActionHref: "/app/central-operacional/tarefas",
    blocks: [
      {
        type: "table",
        title: "Backlog operacional",
        span: "full",
        columns: [
          { key: "title", label: "Tarefa" },
          { key: "status", label: "Status" },
          { key: "owner", label: "Área" },
          { key: "due", label: "Prazo" },
        ],
        rows: [
          { title: "Enviar voucher hotel", status: "Hoje", owner: "Operação", due: "14:00" },
          { title: "Confirmar segunda parcela", status: "Urgente", owner: "Financeiro", due: "16:00" },
          { title: "Revisar cotação Paris", status: "Follow-up", owner: "Comercial", due: "17:30" },
        ],
      },
    ],
  },
  relatorios: {
    title: "Relatórios",
    description: "Resumo premium da agência com vendas, documentos, conversão e eficiência operacional.",
    primaryAction: "Gerar relatório",
    primaryActionHref: "/app/central-operacional/relatorios",
    blocks: [
      {
        type: "highlights",
        title: "Resumo executivo",
        span: "full",
        columns: 4,
        items: [
          { title: "Leads convertidos", description: "18 fechamentos no ciclo atual.", icon: Waypoints },
          { title: "Pacotes publicados", description: "12 ativos no catálogo público.", tone: "info", icon: Sparkles },
          { title: "Documentos entregues", description: "94% das viagens com documentação completa.", tone: "success", icon: FileText },
          { title: "Alertas", description: "2 pontos de atenção em cobranças e embarques.", tone: "warning", icon: AlertTriangle },
        ],
      },
      {
        type: "feed",
        title: "Linhas recentes",
        span: "full",
        items: [
          { title: "Semana acima da meta", description: "A equipe fechou acima da média esperada.", time: "agora", tone: "success", href: "/app/financeiro" },
          { title: "Match ganhou tração", description: "Os pacotes em destaque receberam mais cliques.", time: "hoje", tone: "info", href: "/app/catalogo" },
          { title: "Ajuste em automações", description: "Fluxo de reativação precisa de nova régua.", time: "hoje", tone: "warning", href: "/app/automacoes" },
        ],
      },
    ],
  },
}
