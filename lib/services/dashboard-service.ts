import type { AgencyAccessContext, ClientRow, DocumentRow, FinancialRecordRow, LeadRow, TripRow } from "@/types/database"
import type { AgencyDashboardData, DashboardFeedItem, DashboardPriorityItem } from "@/types/dashboard"
import { listClients } from "@/lib/services/client-service"
import { listDocuments } from "@/lib/services/document-service"
import { listFinancialRecords } from "@/lib/services/finance-service"
import { listLeads } from "@/lib/services/lead-service"
import { listTrips } from "@/lib/services/trip-service"

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

function formatRelativeTime(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "agora"

  const diffMs = Date.now() - parsed.getTime()
  const diffMinutes = Math.max(0, Math.round(diffMs / 60000))

  if (diffMinutes < 1) return "agora"
  if (diffMinutes < 60) return `há ${diffMinutes} min`

  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `há ${diffHours} h`

  const diffDays = Math.round(diffHours / 24)
  return `há ${diffDays} d`
}

function formatDateLabel(value?: string | null) {
  if (!value) return "sem data"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "sem data"
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(parsed)
}

function isDocumentPending(status: string) {
  const normalized = status.toLowerCase()
  return normalized.includes("rascunho") || normalized.includes("pend") || normalized.includes("revis")
}

function isDocumentEmitted(status: string) {
  const normalized = status.toLowerCase()
  return normalized.includes("pronto") || normalized.includes("emit") || normalized.includes("enviado")
}

function isTripActive(status: string) {
  const normalized = status.toLowerCase()
  return normalized.includes("confirm") || normalized.includes("andamento") || normalized.includes("planej")
}

function isLeadNew(status: string) {
  return status.toLowerCase().includes("novo")
}

function isPendingFinancialStatus(status: string) {
  const normalized = status.toLowerCase()
  return normalized.includes("pend") || normalized.includes("receber") || normalized.includes("aberto")
}

function isExpense(type: string) {
  return type.toLowerCase().includes("desp")
}

function isRevenue(type: string) {
  return type.toLowerCase().includes("receit")
}

function sortByCreatedAtDesc<T extends { created_at: string }>(rows: T[]) {
  return [...rows].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

function buildFeed(
  clients: ClientRow[],
  leads: LeadRow[],
  trips: TripRow[],
  documents: DocumentRow[],
  financialRecords: FinancialRecordRow[],
): DashboardFeedItem[] {
  const feed = [
    ...clients.map((client) => ({
      id: `client-${client.id}`,
      title: "Cliente criado",
      detail: `${client.name} entrou na base da agência.`,
      time: formatRelativeTime(client.created_at),
      tone: "success" as const,
      href: "/app/clientes",
      created_at: client.created_at,
    })),
    ...leads.map((lead) => ({
      id: `lead-${lead.id}`,
      title: "Lead criado",
      detail: `${lead.name} • ${lead.destination || "Destino em definição"} • ${lead.status}`,
      time: formatRelativeTime(lead.created_at),
      tone: "info" as const,
      href: "/app/leads",
      created_at: lead.created_at,
    })),
    ...trips.map((trip) => ({
      id: `trip-${trip.id}`,
      title: "Viagem criada",
      detail: `${trip.destination} • ${trip.status}${trip.starts_at ? ` • embarque ${formatDateLabel(trip.starts_at)}` : ""}`,
      time: formatRelativeTime(trip.created_at),
      tone: "info" as const,
      href: "/app/viagens",
      created_at: trip.created_at,
    })),
    ...documents.map((document) => ({
      id: `document-${document.id}`,
      title: "Documento criado",
      detail: `${document.title} • ${document.type} • ${document.status}`,
      time: formatRelativeTime(document.created_at),
      tone: isDocumentPending(document.status) ? ("warning" as const) : ("success" as const),
      href: "/app/documentos",
      created_at: document.created_at,
    })),
    ...financialRecords.map((record) => ({
      id: `finance-${record.id}`,
      title: "Lançamento financeiro criado",
      detail: `${record.category || record.type} • ${formatMoney(Number(record.amount || 0))} • ${record.status}`,
      time: formatRelativeTime(record.created_at),
      tone: isPendingFinancialStatus(record.status) ? ("warning" as const) : ("success" as const),
      href: "/app/financeiro",
      created_at: record.created_at,
    })),
  ]

  return feed
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8)
    .map((entry) => {
      const { created_at, ...item } = entry
      void created_at
      return item
    })
}

function buildPriorities(leads: LeadRow[], trips: TripRow[], documents: DocumentRow[], financialRecords: FinancialRecordRow[]): DashboardPriorityItem[] {
  const now = Date.now()
  const sevenDays = now + 7 * 24 * 60 * 60 * 1000

  const newLeads = leads.filter((lead) => isLeadNew(lead.status))
  const upcomingTrips = trips.filter((trip) => {
    if (!trip.starts_at) return false
    const startsAt = new Date(trip.starts_at).getTime()
    return !Number.isNaN(startsAt) && startsAt >= now && startsAt <= sevenDays
  })
  const pendingDocuments = documents.filter((document) => isDocumentPending(document.status))
  const pendingRevenue = financialRecords.filter((record) => isRevenue(record.type) && isPendingFinancialStatus(record.status))
  const pendingExpenses = financialRecords.filter((record) => isExpense(record.type) && isPendingFinancialStatus(record.status))

  return [
    {
      label: "Leads novos",
      value: `${newLeads.length}`,
      hint: newLeads.length ? `${newLeads[0].name} e outros aguardando qualificação.` : "Nenhum lead novo aguardando contato.",
      href: "/app/leads",
      tone: newLeads.length ? "warning" : "success",
    },
    {
      label: "Viagens próximas",
      value: `${upcomingTrips.length}`,
      hint: upcomingTrips.length ? `${upcomingTrips[0].destination} embarca em ${formatDateLabel(upcomingTrips[0].starts_at)}.` : "Nenhum embarque próximo nos próximos 7 dias.",
      href: "/app/viagens",
      tone: upcomingTrips.length ? "info" : "default",
    },
    {
      label: "Documentos pendentes",
      value: `${pendingDocuments.length}`,
      hint: pendingDocuments.length ? `${pendingDocuments[0].title} ainda está em ${pendingDocuments[0].status}.` : "Nenhuma pendência documental crítica agora.",
      href: "/app/documentos",
      tone: pendingDocuments.length ? "warning" : "success",
    },
    {
      label: "Receitas pendentes",
      value: formatMoney(pendingRevenue.reduce((sum, item) => sum + Number(item.amount || 0), 0)),
      hint: pendingRevenue.length ? `${pendingRevenue.length} registros com status pendente ou a receber.` : "Nenhuma receita pendente compatível.",
      href: "/app/financeiro",
      tone: pendingRevenue.length ? "warning" : "success",
    },
    {
      label: "Despesas abertas",
      value: formatMoney(pendingExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0)),
      hint: pendingExpenses.length ? `${pendingExpenses.length} despesas pedem acompanhamento.` : "Nenhuma despesa pendente compatível.",
      href: "/app/financeiro",
      tone: pendingExpenses.length ? "info" : "default",
    },
  ]
}

export async function getAgencyDashboardData(context: AgencyAccessContext): Promise<AgencyDashboardData> {
  const [clients, leads, trips, documents, financialRecords] = await Promise.all([
    listClients(context),
    listLeads(context),
    listTrips(context),
    listDocuments(context),
    listFinancialRecords(context),
  ])

  const sortedClients = sortByCreatedAtDesc(clients)
  const sortedLeads = sortByCreatedAtDesc(leads)
  const sortedTrips = sortByCreatedAtDesc(trips)
  const sortedDocuments = sortByCreatedAtDesc(documents)
  const sortedFinancialRecords = sortByCreatedAtDesc(financialRecords)

  const leadsByStatus = leads.reduce<Record<string, number>>((acc, lead) => {
    acc[lead.status] = (acc[lead.status] ?? 0) + 1
    return acc
  }, {})

  const activeTrips = trips.filter((trip) => isTripActive(trip.status))
  const upcomingTrips = trips.filter((trip) => {
    if (!trip.starts_at) return false
    const startsAt = new Date(trip.starts_at).getTime()
    return !Number.isNaN(startsAt) && startsAt >= Date.now()
  })

  const emittedDocuments = documents.filter((document) => isDocumentEmitted(document.status))
  const pendingDocuments = documents.filter((document) => isDocumentPending(document.status))

  const totalRevenue = financialRecords.filter((item) => isRevenue(item.type)).reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const totalExpenses = financialRecords.filter((item) => isExpense(item.type)).reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const pendingRevenue = financialRecords
    .filter((item) => isRevenue(item.type) && isPendingFinancialStatus(item.status))
    .reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const balance = totalRevenue - totalExpenses

  const qualifiedLeads = leads.filter((lead) => lead.status.toLowerCase().includes("qual") || lead.temperature?.toLowerCase().includes("quent"))

  const healthTone = pendingDocuments.length > 0 || pendingRevenue > 0 ? "warning" : "success"

  return {
    generated_at: new Date().toISOString(),
    summary_cards: [
      {
        label: "Viagens em andamento",
        value: `${activeTrips.length} ativas`,
        hint: upcomingTrips.length ? `${upcomingTrips.slice(0, 2).length} embarques próximos.` : "Sem embarques próximos cadastrados.",
      },
      {
        label: "Clientes na base",
        value: `${clients.length} clientes`,
        hint: sortedClients[0] ? `Último cadastro: ${sortedClients[0].name}.` : "Base vazia, pronto para o primeiro cadastro.",
      },
      {
        label: "Leads por trabalhar",
        value: `${leads.filter((lead) => isLeadNew(lead.status)).length} novos`,
        hint: qualifiedLeads.length ? `${qualifiedLeads.length} com maior chance de avanço.` : "Nenhum lead quente detectado agora.",
      },
      {
        label: "Saldo financeiro",
        value: formatMoney(balance),
        hint: `${formatMoney(pendingRevenue)} em receitas pendentes compatíveis.`,
      },
      {
        label: "Status do GO",
        value: "Em breve",
        hint: "WhatsApp ainda não está integrado ao dashboard operacional real.",
      },
    ],
    metrics: [
      {
        label: "Clientes",
        value: `${clients.length} clientes`,
        change: sortedClients[0] ? `${sortedClients.length >= 2 ? sortedClients.slice(0, 2).length : sortedClients.length} cadastros recentes` : "Nenhum cliente cadastrado ainda",
        tone: "info",
      },
      {
        label: "Leads",
        value: `${leads.length} leads`,
        change: `${leads.filter((lead) => isLeadNew(lead.status)).length} novos • ${qualifiedLeads.length} qualificados/quentes`,
        tone: "success",
      },
      {
        label: "Viagens ativas",
        value: `${activeTrips.length} viagens`,
        change: upcomingTrips.length ? `${upcomingTrips.slice(0, 3).length} embarques próximos` : "Nenhum embarque próximo",
        tone: "info",
      },
      {
        label: "Documentos",
        value: `${emittedDocuments.length} emitidos`,
        change: `${pendingDocuments.length} pendentes ou em rascunho`,
        tone: pendingDocuments.length ? "warning" : "success",
      },
      {
        label: "Financeiro",
        value: formatMoney(balance),
        change: `${formatMoney(totalRevenue)} receitas • ${formatMoney(totalExpenses)} despesas`,
        tone: balance >= 0 ? "success" : "danger",
      },
      {
        label: "Próximos embarques",
        value: `${upcomingTrips.length}`,
        change: upcomingTrips[0]?.starts_at ? `${upcomingTrips[0].destination} em ${formatDateLabel(upcomingTrips[0].starts_at)}` : "Nenhuma viagem próxima cadastrada",
        tone: upcomingTrips.length ? "info" : "default",
      },
    ],
    system_items: [
      {
        label: "GO ativo",
        status: "Em breve",
        detail: "WhatsApp ainda não está conectado a este dashboard. O CTA deve orientar com clareza.",
        tone: "bg-amber-400",
        action: "future",
      },
      {
        label: "Agent monitorando leads",
        status: leads.length ? "Contextualizado" : "Sem base",
        detail: leads.length ? `${qualifiedLeads.length} leads quentes/qualificados e ${leads.filter((lead) => isLeadNew(lead.status)).length} novos para priorizar.` : "Cadastre leads para alimentar a leitura operacional do Agent.",
        tone: "bg-sky-400",
        action: "none",
      },
      {
        label: "Advisor analisando performance",
        status: "Atualizado",
        detail: `Clientes ${clients.length} • viagens ativas ${activeTrips.length} • saldo ${formatMoney(balance)}.`,
        tone: "bg-primary",
        action: "none",
      },
      {
        label: "Match sincronizando oportunidades",
        status: "Em breve",
        detail: "O Match ainda não está integrado a dados reais neste dashboard.",
        tone: "bg-violet-400",
        action: "future",
      },
      {
        label: "Marketing IA preparando campanha",
        status: "Em breve",
        detail: "O Marketing IA ainda não está integrado a dados reais neste dashboard.",
        tone: "bg-amber-400",
        action: "future",
      },
    ],
    advisor_recommendations: [
      leads.filter((lead) => isLeadNew(lead.status)).length
        ? `Existem ${leads.filter((lead) => isLeadNew(lead.status)).length} leads novos aguardando qualificação ou primeiro contato.`
        : "Não há leads novos aguardando contato neste momento.",
      pendingDocuments.length
        ? `${pendingDocuments.length} documentos estão pendentes ou em rascunho e merecem revisão operacional.`
        : "A documentação atual não apresenta pendências críticas.",
      upcomingTrips.length
        ? `${upcomingTrips.slice(0, 2).length} viagens têm embarque próximo e pedem checklist final.`
        : "Nenhuma viagem próxima exige ação imediata agora.",
    ],
    operational_feed: buildFeed(sortedClients.slice(0, 4), sortedLeads.slice(0, 4), sortedTrips.slice(0, 4), sortedDocuments.slice(0, 4), sortedFinancialRecords.slice(0, 4)),
    priorities: buildPriorities(leads, trips, documents, financialRecords),
    finance_snapshot: {
      total_revenue: totalRevenue,
      total_expenses: totalExpenses,
      balance,
      pending_revenue: pendingRevenue,
      recent_records: sortedFinancialRecords.slice(0, 5),
      note:
        sortedFinancialRecords.length > 0
          ? `${sortedFinancialRecords.slice(0, 3).length} lançamentos recentes já alimentam a leitura financeira do dashboard.`
          : "Ainda não há lançamentos financeiros para montar tendência.",
    },
    operation_notes: [
      sortedDocuments[0] ? `${sortedDocuments[0].title} foi o documento mais recente salvo na operação.` : "Nenhum documento foi criado ainda.",
      sortedTrips[0] ? `${sortedTrips[0].destination} é a viagem mais recente na base.` : "Nenhuma viagem foi criada ainda.",
      sortedLeads[0] ? `${sortedLeads[0].name} é o lead mais recente capturado no funil.` : "Nenhum lead entrou no funil ainda.",
      sortedFinancialRecords[0] ? `${sortedFinancialRecords[0].category || sortedFinancialRecords[0].type} foi o lançamento financeiro mais recente.` : "Nenhum lançamento financeiro foi criado ainda.",
    ],
    health: {
      tone: healthTone,
      label: healthTone === "success" ? "Saudável" : "Atenção",
      title: healthTone === "success" ? "Operação estável e responsiva" : "Operação pede atenção em pendências reais",
      description:
        healthTone === "success"
          ? "A base real indica operação equilibrada, sem pendências documentais ou financeiras críticas dominando o dia."
          : `Há ${pendingDocuments.length} pendências documentais e ${formatMoney(pendingRevenue)} em receitas pendentes compatíveis com acompanhamento.`,
    },
    counts: {
      clients: clients.length,
      leads: leads.length,
      leads_by_status: leadsByStatus,
      active_trips: activeTrips.length,
      upcoming_trips: upcomingTrips.length,
      emitted_documents: emittedDocuments.length,
      pending_documents: pendingDocuments.length,
      total_revenue: totalRevenue,
      total_expenses: totalExpenses,
      balance,
    },
    recent_entities: {
      clients: sortedClients.slice(0, 3),
      leads: sortedLeads.slice(0, 3),
      trips: sortedTrips.slice(0, 3),
      documents: sortedDocuments.slice(0, 3),
      financial_records: sortedFinancialRecords.slice(0, 3),
    },
  }
}
