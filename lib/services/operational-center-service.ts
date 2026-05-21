import type { AgencyAccessContext, AuditLogRow, ClientRow, CreditTransactionRow, DocumentRow, FinancialRecordRow, LeadRow, NotificationRow, ReportRow, TaskRow, TripRow } from "@/types/database"
import type { CentralOperationalData, OperationalFeedItem, OperationalPriorityItem, OperationalStatusItem } from "@/types/operational-center"
import { listAuditLogs } from "@/lib/services/audit-log-service"
import { listClients } from "@/lib/services/client-service"
import { listCreditTransactions } from "@/lib/services/credit-service"
import { listDocuments } from "@/lib/services/document-service"
import { listFinancialRecords } from "@/lib/services/finance-service"
import { listLeads } from "@/lib/services/lead-service"
import { listNotifications } from "@/lib/services/notification-service"
import { listReports } from "@/lib/services/report-service"
import { listTasks } from "@/lib/services/task-service"
import { listTrips } from "@/lib/services/trip-service"

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

function formatRelativeTime(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "agora"
  const diffMinutes = Math.max(0, Math.round((Date.now() - parsed.getTime()) / 60000))
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

function isLeadPending(status: string) {
  const normalized = status.toLowerCase()
  return normalized.includes("novo") || normalized.includes("aguard") || normalized.includes("qual")
}

function isDocumentPending(status: string) {
  const normalized = status.toLowerCase()
  return normalized.includes("rascunho") || normalized.includes("pend") || normalized.includes("revis")
}

function isPendingFinancialStatus(status: string) {
  const normalized = status.toLowerCase()
  return normalized.includes("pend") || normalized.includes("receber") || normalized.includes("aberto")
}

function isRevenue(type: string) {
  return type.toLowerCase().includes("receit")
}

function isExpense(type: string) {
  return type.toLowerCase().includes("desp")
}

function creditSignedAmount(row: CreditTransactionRow) {
  const normalized = row.type.toLowerCase()
  if (normalized.includes("grant") || normalized.includes("bonus") || normalized.includes("credit") || normalized.includes("entrada")) {
    return Number(row.amount || 0)
  }
  if (normalized.includes("consumo") || normalized.includes("debit") || normalized.includes("uso")) {
    return Number(row.amount || 0) * -1
  }
  return Number(row.amount || 0)
}

function buildFeedFromAudit(
  clients: ClientRow[],
  leads: LeadRow[],
  trips: TripRow[],
  documents: DocumentRow[],
  financialRecords: FinancialRecordRow[],
  credits: CreditTransactionRow[],
  auditLogs: AuditLogRow[],
  notifications: NotificationRow[],
): OperationalFeedItem[] {
  const auditItems = auditLogs.slice(0, 10).map((log) => ({
    id: `audit-${log.id}`,
    title: `${log.entity} ${log.action}`.replace(/_/g, " "),
    detail: log.metadata && typeof log.metadata === "object" ? JSON.stringify(log.metadata).slice(0, 120) : log.status,
    time: formatRelativeTime(log.created_at),
    tone: log.status === "error" ? ("danger" as const) : ("info" as const),
    href:
      log.entity === "clients" ? "/app/clientes"
        : log.entity === "leads" ? "/app/leads"
          : log.entity === "trips" ? "/app/viagens"
            : log.entity === "documents" ? "/app/documentos"
              : log.entity === "financial_records" ? "/app/financeiro"
                : log.entity === "tasks" ? "/app/central-operacional/tarefas"
                  : "/app/central-operacional",
    origin: "auditoria",
    created_at: log.created_at,
  }))

  const clientItems = clients.slice(0, 4).map((client) => ({
    id: `client-${client.id}`,
    title: "Cliente criado recentemente",
    detail: `${client.name} entrou na base da agência com status ${client.status || "Ativo"}.`,
    time: formatRelativeTime(client.created_at),
    tone: "info" as const,
    href: "/app/clientes",
    origin: "clientes",
    created_at: client.created_at,
  }))

  const leadItems = leads.slice(0, 4).map((lead) => ({
    id: `lead-${lead.id}`,
    title: "Lead criado recentemente",
    detail: `${lead.name} chegou em ${lead.origin || "origem não informada"} com status ${lead.status}.`,
    time: formatRelativeTime(lead.created_at),
    tone: isLeadPending(lead.status) ? ("warning" as const) : ("info" as const),
    href: "/app/leads",
    origin: "leads",
    created_at: lead.created_at,
  }))

  const tripItems = trips.slice(0, 4).map((trip) => ({
    id: `trip-${trip.id}`,
    title: "Viagem criada recentemente",
    detail: `${trip.destination} foi registrada com status ${trip.status || "Planejamento"}.`,
    time: formatRelativeTime(trip.created_at),
    tone: "info" as const,
    href: "/app/viagens",
    origin: "viagens",
    created_at: trip.created_at,
  }))

  const documentItems = documents.slice(0, 4).map((document) => ({
    id: `document-${document.id}`,
    title: "Documento atualizado",
    detail: `${document.title} está em ${document.status}.`,
    time: formatRelativeTime(document.created_at),
    tone: isDocumentPending(document.status) ? ("warning" as const) : ("success" as const),
    href: "/app/documentos",
    origin: "documentos",
    created_at: document.created_at,
  }))

  const financialItems = financialRecords.slice(0, 4).map((record) => ({
    id: `financial-${record.id}`,
    title: "Lançamento financeiro criado",
    detail: `${record.category || record.type} em ${formatMoney(Number(record.amount || 0))} com status ${record.status}.`,
    time: formatRelativeTime(record.created_at),
    tone: isPendingFinancialStatus(record.status) ? ("warning" as const) : ("success" as const),
    href: "/app/financeiro",
    origin: "financeiro",
    created_at: record.created_at,
  }))

  const creditItems = credits.slice(0, 3).map((credit) => ({
    id: `credit-${credit.id}`,
    title: "Movimento de crédito registrado",
    detail: `${credit.feature || credit.source || "Operação geral"} consumiu ou adicionou ${Math.abs(Number(credit.amount || 0))} créditos.`,
    time: formatRelativeTime(credit.created_at),
    tone: creditSignedAmount(credit) < 0 ? ("warning" as const) : ("info" as const),
    href: "/app/creditos",
    origin: "créditos",
    created_at: credit.created_at,
  }))

  const notificationItems = notifications.slice(0, 6).map((notification) => ({
    id: `notification-${notification.id}`,
    title: notification.title,
    detail: notification.body || notification.type,
    time: formatRelativeTime(notification.created_at),
    tone: notification.status.toLowerCase().includes("unread") ? ("warning" as const) : ("info" as const),
    href: notification.action_url || "/app/central-operacional",
    origin: "notificacao",
    created_at: notification.created_at,
  }))

  return [...auditItems, ...notificationItems, ...clientItems, ...leadItems, ...tripItems, ...documentItems, ...financialItems, ...creditItems]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)
    .map((entry) => {
      const { created_at, ...item } = entry
      void created_at
      return item
    })
}

function buildPriorities(
  leads: LeadRow[],
  trips: TripRow[],
  documents: DocumentRow[],
  financialRecords: FinancialRecordRow[],
  credits: CreditTransactionRow[],
): OperationalPriorityItem[] {
  const now = Date.now()
  const nextSevenDays = now + 7 * 24 * 60 * 60 * 1000

  const pendingLeads = leads.filter((lead) => isLeadPending(lead.status))
  const upcomingTrips = trips.filter((trip) => {
    if (!trip.starts_at) return false
    const startsAt = new Date(trip.starts_at).getTime()
    return !Number.isNaN(startsAt) && startsAt >= now && startsAt <= nextSevenDays
  })
  const pendingDocuments = documents.filter((document) => isDocumentPending(document.status))
  const pendingPayments = financialRecords.filter((record) => isRevenue(record.type) && isPendingFinancialStatus(record.status))
  const pendingExpenses = financialRecords.filter((record) => isExpense(record.type) && isPendingFinancialStatus(record.status))
  const creditBalance = credits.reduce((sum, item) => sum + creditSignedAmount(item), 0)
  const recentFinancial = financialRecords.slice(0, 5)

  return [
    {
      id: "leads-pending",
      label: "Leads sem resposta",
      value: `${pendingLeads.length}`,
      hint: pendingLeads.length ? `${pendingLeads[0].name} e outros aguardam próxima ação.` : "Nenhum lead pendente agora.",
      href: "/app/leads",
      tone: pendingLeads.length ? "warning" : "success",
    },
    {
      id: "trips-upcoming",
      label: "Viagens próximas",
      value: `${upcomingTrips.length}`,
      hint: upcomingTrips.length ? `${upcomingTrips[0].destination} embarca em ${formatDateLabel(upcomingTrips[0].starts_at)}.` : "Nenhum embarque próximo nos próximos 7 dias.",
      href: "/app/viagens",
      tone: upcomingTrips.length ? "info" : "default",
    },
    {
      id: "documents-pending",
      label: "Documentos pendentes",
      value: `${pendingDocuments.length}`,
      hint: pendingDocuments.length ? `${pendingDocuments[0].title} segue em ${pendingDocuments[0].status}.` : "Nenhuma pendência documental crítica agora.",
      href: "/app/documentos",
      tone: pendingDocuments.length ? "warning" : "success",
    },
    {
      id: "payments-pending",
      label: "Pagamentos pendentes",
      value: formatMoney(pendingPayments.reduce((sum, item) => sum + Number(item.amount || 0), 0)),
      hint: pendingPayments.length ? `${pendingPayments.length} receitas aguardam baixa.` : "Nenhuma receita pendente compatível.",
      href: "/app/financeiro",
      tone: pendingPayments.length ? "warning" : "success",
    },
    {
      id: "balance-critical",
      label: "Saldo de créditos",
      value: `${creditBalance}`,
      hint: creditBalance <= 0 ? "Saldo zerado ou crítico para novas operações." : `Consumo recente em ${credits[0]?.feature || "operações gerais"}.`,
      href: "/app/creditos",
      tone: creditBalance <= 0 ? "danger" : "info",
    },
    {
      id: "recent-financial",
      label: "Lançamentos recentes",
      value: `${recentFinancial.length}`,
      hint: recentFinancial[0] ? `${recentFinancial[0].category || recentFinancial[0].type} em ${formatDateLabel(recentFinancial[0].occurred_at)}.` : "Nenhum lançamento financeiro recente.",
      href: "/app/financeiro",
      tone: pendingExpenses.length ? "warning" : "default",
    },
  ]
}

function buildStatuses(tasks: TaskRow[], notifications: NotificationRow[], reports: ReportRow[], credits: CreditTransactionRow[]): OperationalStatusItem[] {
  const unreadNotifications = notifications.filter((item) => item.status.toLowerCase().includes("unread")).length
  const openTasks = tasks.filter((item) => !item.status.toLowerCase().includes("concl")).length
  const readyReports = reports.filter((item) => item.status.toLowerCase().includes("pronto") || item.status.toLowerCase().includes("ready")).length
  const creditBalance = credits.reduce((sum, item) => sum + creditSignedAmount(item), 0)

  return [
    {
      label: "Status operacional",
      value: openTasks ? "Em atenção" : "Estável",
      detail: openTasks ? `${openTasks} tarefas abertas na central.` : "Nenhuma tarefa aberta no momento.",
      tone: openTasks ? "warning" : "success",
    },
    {
      label: "Notificações",
      value: `${notifications.length}`,
      detail: unreadNotifications ? `${unreadNotifications} ainda não lidas.` : "Sem notificações pendentes.",
      tone: unreadNotifications ? "info" : "default",
    },
    {
      label: "Relatórios",
      value: `${readyReports} prontos`,
      detail: reports.length ? `${reports.length} registros salvos na base.` : "Nenhum relatório salvo ainda.",
      tone: readyReports ? "success" : "default",
    },
    {
      label: "Créditos",
      value: `${creditBalance}`,
      detail: credits.length ? `${credits.length} movimentos registrados.` : "Sem histórico de créditos ainda.",
      tone: creditBalance <= 0 ? "danger" : "info",
    },
  ]
}

export async function getOperationalCenterData(context: AgencyAccessContext): Promise<CentralOperationalData> {
  const [clients, leads, trips, documents, financialRecords, notifications, tasks, reports, credits, auditLogs] = await Promise.all([
    listClients(context),
    listLeads(context),
    listTrips(context),
    listDocuments(context),
    listFinancialRecords(context),
    listNotifications(context),
    listTasks(context),
    listReports(context),
    listCreditTransactions(context),
    listAuditLogs(context),
  ])

  return {
    generated_at: new Date().toISOString(),
    priorities: buildPriorities(leads, trips, documents, financialRecords, credits),
    feed: buildFeedFromAudit(clients, leads, trips, documents, financialRecords, credits, auditLogs, notifications),
    statuses: buildStatuses(tasks, notifications, reports, credits),
    notifications: notifications.slice(0, 8),
    tasks: tasks.slice(0, 8),
    reports: reports.slice(0, 8),
    recent_credits: credits.slice(0, 8),
    recent_audit_logs: auditLogs.slice(0, 12),
  }
}
