"use client"

import { useMemo, useState } from "react"
import {
  ArrowUpRight,
  CircleDollarSign,
  Landmark,
  PiggyBank,
  ReceiptText,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react"
import { AgencyRebuildActionButton } from "@/components/agency-rebuild/actions/agency-rebuild-action-button"
import { BaseModalV3 } from "@/components/agency-rebuild/modals/base-modal-v3"
import { BaseCardV3 } from "@/components/agency-rebuild/shared/base-card-v3"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

type FinanceTab =
  | "overview"
  | "entries"
  | "payables"
  | "receivables"
  | "reports"
  | "planning"
  | "accounts"
  | "contacts"

type EntryMode = "expense" | "income" | "transfer"
type EntryStatus = "paid" | "received" | "payable" | "receivable"
type RepeatMode = "none" | "multi" | "always"
type PeriodFilter = "today" | "7d" | "30d" | "90d" | "month" | "quarter" | "year"
type ReportView = "competence" | "cashflow"
type CounterpartyKind = "client" | "supplier"

type BankAccount = {
  id: string
  name: string
  type: string
  balance: number
  status: "Ativa" | "Monitorar"
}

type Counterparty = {
  id: string
  name: string
  kind: CounterpartyKind
  note: string
}

type FinanceEntry = {
  id: string
  mode: EntryMode
  status: EntryStatus
  accountId: string
  date: string
  description: string
  amount: number
  category: string
  costCenter: string
  counterpartyId?: string
  method: string
  tags: string[]
  notes: string
  installments?: { index: number; total: number }
  sourceAccountId?: string
  destinationAccountId?: string
}

type EntryFormState = {
  status: EntryStatus
  accountId: string
  date: string
  repeatMode: RepeatMode
  installments: string
  description: string
  amount: string
  category: string
  costCenter: string
  counterpartyId: string
  method: string
  tags: string
  attachments: string[]
  notes: string
  sourceAccountId: string
  destinationAccountId: string
}

const accountSeed: BankAccount[] = [
  { id: "sicredi", name: "Banco Cooperativo Sicredi", type: "Conta corrente", balance: 3553.57, status: "Ativa" },
  { id: "cef", name: "Caixa Economica Federal", type: "Conta operacional", balance: -1982.02, status: "Monitorar" },
  { id: "credit", name: "Credito cliente", type: "Conta virtual", balance: 0, status: "Ativa" },
]

const counterpartySeed: Counterparty[] = [
  { id: "marina", name: "Marina Alves", kind: "client", note: "Cliente premium" },
  { id: "giulia", name: "Giulia e Dante", kind: "client", note: "Viagem internacional" },
  { id: "vanessa", name: "Assessoria Vanessa", kind: "supplier", note: "Consultoria" },
  { id: "shekinah", name: "Contabilidade Shekinah", kind: "supplier", note: "Fiscal e contabil" },
  { id: "duo", name: "Marketing Duo Vacaria", kind: "supplier", note: "Performance" },
]

const entrySeed: FinanceEntry[] = [
  {
    id: "fin-1",
    mode: "expense",
    status: "paid",
    accountId: "sicredi",
    date: "2026-05-04",
    description: "Assessoria Vanessa",
    amount: 1500,
    category: "Salarios",
    costCenter: "Operacao premium",
    counterpartyId: "vanessa",
    method: "Pix",
    tags: ["mensal"],
    notes: "Suporte operacional da equipe.",
  },
  {
    id: "fin-2",
    mode: "expense",
    status: "payable",
    accountId: "cef",
    date: "2026-06-05",
    description: "Contabilidade Shekinah",
    amount: 320,
    category: "Fiscal",
    costCenter: "Backoffice",
    counterpartyId: "shekinah",
    method: "Boleto",
    tags: ["recorrente"],
    notes: "Competencia do mes.",
  },
  {
    id: "fin-3",
    mode: "income",
    status: "received",
    accountId: "sicredi",
    date: "2026-05-12",
    description: "Entrada total viagem",
    amount: 4500,
    category: "Receitas / Consultoria",
    costCenter: "Comercial",
    counterpartyId: "marina",
    method: "Transferencia",
    tags: ["vip"],
    notes: "Pagamento integral de reserva.",
  },
  {
    id: "fin-4",
    mode: "income",
    status: "receivable",
    accountId: "credit",
    date: "2026-06-12",
    description: "Restante consultoria Giulia e Dante",
    amount: 520,
    category: "Receitas / Comissoes",
    costCenter: "Relacionamento",
    counterpartyId: "giulia",
    method: "Cartao",
    tags: ["follow-up"],
    notes: "Recebimento programado.",
  },
  {
    id: "fin-5",
    mode: "transfer",
    status: "paid",
    accountId: "sicredi",
    sourceAccountId: "sicredi",
    destinationAccountId: "credit",
    date: "2026-05-25",
    description: "Ajuste de credito cliente",
    amount: 380,
    category: "Transferencia interna",
    costCenter: "Caixa",
    method: "Interna",
    tags: ["ajuste"],
    notes: "Reserva operacional.",
  },
]

const categoryOptions = [
  "Receitas / Consultoria",
  "Receitas / Comissoes",
  "Salarios",
  "Fiscal",
  "Marketing",
  "Operacao premium",
  "Transferencia interna",
]

const costCenterOptions = [
  "Operacao premium",
  "Comercial",
  "Relacionamento",
  "Backoffice",
  "Caixa",
]

const paymentMethods = ["Pix", "Transferencia", "Cartao", "Boleto", "Dinheiro", "Interna"]

const reportRows = [
  { label: "Receitas por categoria", values: ["37.372", "15.826", "15.209", "13.398", "11.163", "1.928"] },
  { label: "Despesas por categoria", values: ["-29.819", "-23.367", "-13.821", "-13.784", "-5.894", "-3.845"] },
  { label: "Saldo inicial", values: ["1.000", "8.553", "1.012", "2.400", "2.014", "7.284"] },
  { label: "Saldo final", values: ["7.553", "-7.541", "1.388", "-385", "5.269", "-1.917"] },
]

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(value)
}

function parseCurrencyInput(value: string) {
  const numeric = value.replace(/[^\d,-.]/g, "").replace(/\./g, "").replace(",", ".")
  const parsed = Number.parseFloat(numeric)
  return Number.isFinite(parsed) ? parsed : 0
}

function buildEmptyForm(mode: EntryMode): EntryFormState {
  return {
    status: mode === "income" ? "receivable" : mode === "expense" ? "payable" : "paid",
    accountId: accountSeed[0]?.id ?? "",
    date: "2026-05-25",
    repeatMode: "none",
    installments: "1",
    description: "",
    amount: "",
    category: mode === "transfer" ? "Transferencia interna" : "",
    costCenter: "",
    counterpartyId: "",
    method: mode === "transfer" ? "Interna" : "",
    tags: "",
    attachments: [],
    notes: "",
    sourceAccountId: accountSeed[0]?.id ?? "",
    destinationAccountId: accountSeed[1]?.id ?? "",
  }
}

function addMonths(date: string, monthsToAdd: number) {
  const base = new Date(`${date}T12:00:00`)
  base.setMonth(base.getMonth() + monthsToAdd)
  return base.toISOString().slice(0, 10)
}

function statusLabel(status: EntryStatus) {
  switch (status) {
    case "paid":
      return "Pago"
    case "received":
      return "Recebido"
    case "payable":
      return "A pagar"
    case "receivable":
      return "A receber"
  }
}

function statusTone(status: EntryStatus) {
  switch (status) {
    case "paid":
    case "received":
      return "border-emerald-400/18 bg-emerald-400/[0.08] text-emerald-100"
    case "payable":
      return "border-rose-400/18 bg-rose-400/[0.08] text-rose-100"
    case "receivable":
      return "border-amber-400/18 bg-amber-400/[0.08] text-amber-100"
  }
}

function MetricCard({
  title,
  value,
  note,
  icon: Icon,
}: {
  title: string
  value: string
  note: string
  icon: typeof Wallet
}) {
  return (
    <BaseCardV3
      title={value}
      description={note}
      className="rounded-[24px] p-3.5"
      actions={
        <div className="rounded-[14px] border border-white/8 bg-white/[0.04] p-2 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      }
    >
      <p className="text-[11px] uppercase tracking-[0.18em] text-primary/72">{title}</p>
    </BaseCardV3>
  )
}

export function AgencyRebuildFinanceWorkspace({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [tab, setTab] = useState<FinanceTab>("overview")
  const [reportView, setReportView] = useState<ReportView>("competence")
  const [entries, setEntries] = useState<FinanceEntry[]>(entrySeed)
  const [accounts, setAccounts] = useState<BankAccount[]>(accountSeed)
  const [entryModalMode, setEntryModalMode] = useState<EntryMode | null>(null)
  const [entryForm, setEntryForm] = useState<EntryFormState>(buildEmptyForm("expense"))
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
  const [accountModalOpen, setAccountModalOpen] = useState(false)
  const [newAccount, setNewAccount] = useState({ name: "", type: "", balance: "", status: "Ativa" as BankAccount["status"] })
  const [filters, setFilters] = useState({
    period: "month" as PeriodFilter,
    accountId: "all",
    type: "all",
    category: "all",
    counterpartyId: "all",
    costCenter: "all",
    status: "all",
  })

  const balance = useMemo(() => accounts.reduce((sum, account) => sum + account.balance, 0), [accounts])
  const payableEntries = useMemo(() => entries.filter((entry) => entry.status === "payable"), [entries])
  const receivableEntries = useMemo(() => entries.filter((entry) => entry.status === "receivable"), [entries])
  const payableTotal = useMemo(
    () => payableEntries.reduce((sum, entry) => sum + entry.amount, 0),
    [payableEntries],
  )
  const receivableTotal = useMemo(
    () => receivableEntries.reduce((sum, entry) => sum + entry.amount, 0),
    [receivableEntries],
  )
  const monthlyIncome = useMemo(
    () => entries.filter((entry) => entry.mode === "income").reduce((sum, entry) => sum + entry.amount, 0),
    [entries],
  )
  const monthlyExpense = useMemo(
    () => entries.filter((entry) => entry.mode === "expense").reduce((sum, entry) => sum + entry.amount, 0),
    [entries],
  )
  const projectedResult = balance - payableTotal + receivableTotal
  const marginEstimate = monthlyIncome ? ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100 : 0

  const filteredEntries = useMemo(
    () =>
      entries.filter((entry) => {
        if (filters.accountId !== "all" && entry.accountId !== filters.accountId) return false
        if (filters.type !== "all" && entry.mode !== filters.type) return false
        if (filters.category !== "all" && entry.category !== filters.category) return false
        if (filters.counterpartyId !== "all" && entry.counterpartyId !== filters.counterpartyId) return false
        if (filters.costCenter !== "all" && entry.costCenter !== filters.costCenter) return false
        if (filters.status !== "all" && entry.status !== filters.status) return false
        return true
      }),
    [entries, filters],
  )

  const installmentPreview = useMemo(() => {
    if (!entryModalMode) return []

    const amount = parseCurrencyInput(entryForm.amount)
    const totalInstallments =
      entryForm.repeatMode === "always" ? 6 : Math.max(1, Number.parseInt(entryForm.installments || "1", 10))

    return Array.from({ length: totalInstallments }).map((_, index) => ({
      index: index + 1,
      total: totalInstallments,
      date: addMonths(entryForm.date, index),
      amount: amount / totalInstallments,
    }))
  }, [entryForm.amount, entryForm.date, entryForm.installments, entryForm.repeatMode, entryModalMode])

  const openEntryModal = (mode: EntryMode, entry?: FinanceEntry) => {
    setEntryModalMode(mode)
    setEditingEntryId(entry?.id ?? null)

    if (entry) {
      setEntryForm({
        status: entry.status,
        accountId: entry.accountId,
        date: entry.date,
        repeatMode: entry.installments?.total && entry.installments.total > 1 ? "multi" : "none",
        installments: String(entry.installments?.total ?? 1),
        description: entry.description,
        amount: formatCurrency(entry.amount),
        category: entry.category,
        costCenter: entry.costCenter,
        counterpartyId: entry.counterpartyId ?? "",
        method: entry.method,
        tags: entry.tags.join(", "),
        attachments: [],
        notes: entry.notes,
        sourceAccountId: entry.sourceAccountId ?? entry.accountId,
        destinationAccountId: entry.destinationAccountId ?? "",
      })
      return
    }

    setEntryForm(buildEmptyForm(mode))
  }

  const closeEntryModal = () => {
    setEntryModalMode(null)
    setEditingEntryId(null)
  }

  const submitEntry = () => {
    if (!entryModalMode) return

    const amount = parseCurrencyInput(entryForm.amount)
    if (!entryForm.description || !amount) {
      toast({
        title: "Preencha os campos principais",
        description: "Descricao e valor precisam estar definidos antes de salvar.",
      })
      return
    }

    if (entryModalMode === "transfer" && (!entryForm.sourceAccountId || !entryForm.destinationAccountId)) {
      toast({
        title: "Defina as contas da transferencia",
        description: "Origem e destino precisam estar preenchidos para a movimentacao interna.",
      })
      return
    }

    const baseStatus =
      entryModalMode === "expense"
        ? entryForm.status === "paid"
          ? "paid"
          : "payable"
        : entryModalMode === "income"
          ? entryForm.status === "received"
            ? "received"
            : "receivable"
          : "paid"

    const previewRows = entryModalMode === "transfer" ? [{ index: 1, total: 1, date: entryForm.date, amount }] : installmentPreview
    const tags = entryForm.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)

    const createdEntries = previewRows.map((preview, index) => ({
      id: editingEntryId && index === 0 ? editingEntryId : `fin-${Date.now()}-${index}`,
      mode: entryModalMode,
      status: baseStatus,
      accountId: entryModalMode === "transfer" ? entryForm.sourceAccountId : entryForm.accountId,
      sourceAccountId: entryModalMode === "transfer" ? entryForm.sourceAccountId : undefined,
      destinationAccountId: entryModalMode === "transfer" ? entryForm.destinationAccountId : undefined,
      date: preview.date,
      description:
        previewRows.length > 1
          ? `${entryForm.description} ${preview.index}/${preview.total}`
          : entryForm.description,
      amount: Number(preview.amount.toFixed(2)),
      category: entryForm.category || (entryModalMode === "transfer" ? "Transferencia interna" : "Sem categoria"),
      costCenter: entryForm.costCenter || "Nao classificado",
      counterpartyId: entryForm.counterpartyId || undefined,
      method: entryForm.method || (entryModalMode === "transfer" ? "Interna" : "A definir"),
      tags,
      notes: entryForm.notes,
      installments:
        previewRows.length > 1
          ? { index: preview.index, total: preview.total }
          : undefined,
    }))

    setEntries((current) => {
      const withoutEditing = editingEntryId ? current.filter((entry) => entry.id !== editingEntryId) : current
      return [ ...createdEntries, ...withoutEditing ]
    })

    toast({
      title: "Lancamento preparado localmente",
      description:
        previewRows.length > 1
          ? `${previewRows.length} previsoes foram adicionadas ao workspace financeiro.`
          : "O registro foi salvo localmente no preview da V3.",
    })

    closeEntryModal()
  }

  const markEntryResolved = (id: string) => {
    setEntries((current) =>
      current.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              status:
                entry.status === "payable"
                  ? "paid"
                  : entry.status === "receivable"
                    ? "received"
                    : entry.status,
            }
          : entry,
      ),
    )
  }

  const removeEntry = (id: string) => {
    setEntries((current) => current.filter((entry) => entry.id !== id))
  }

  const contactLookup = useMemo(
    () => Object.fromEntries(counterpartySeed.map((item) => [item.id, item])),
    [],
  )

  return (
    <>
      <BaseModalV3
        open={open}
        onOpenChange={onOpenChange}
        title="Financeiro"
        description="Caixa, contas, lancamentos e relatorios da agencia"
        contentClassName="sm:max-w-[min(1320px,96vw)]"
        bodyClassName="pb-6"
        footer={
          <>
            <AgencyRebuildActionButton
              actionType="modal"
              label="Fechar"
              variant="outline"
              className="rounded-full border-white/10 bg-white/[0.03]"
              onAction={() => onOpenChange(false)}
            />
          </>
        }
      >
        <div className="space-y-5">
          <div className="grid gap-4 rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.018))] p-4 xl:grid-cols-[1fr_auto]">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-primary/72">Caixa e balanço</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{formatCurrency(balance)}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Caixa, contas, lancamentos e relatorios da agencia
              </p>
            </div>

            <div className="flex flex-wrap items-start justify-end gap-2">
              <AgencyRebuildActionButton
                actionType="modal"
                label="Registrar gasto"
                className="rounded-full"
                onAction={() => openEntryModal("expense")}
              />
              <AgencyRebuildActionButton
                actionType="modal"
                label="Registrar ganho"
                className="rounded-full bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/25"
                onAction={() => openEntryModal("income")}
              />
              <AgencyRebuildActionButton
                actionType="modal"
                label="Registrar transferencia"
                className="rounded-full bg-sky-500/20 text-sky-100 hover:bg-sky-500/25"
                onAction={() => openEntryModal("transfer")}
              />
              <AgencyRebuildActionButton
                actionType="future"
                label="Importar registros"
                variant="outline"
                className="rounded-full border-white/10 bg-white/[0.03]"
                futureMessage="Importacao automatica de registros sera conectada depois."
              />
              <AgencyRebuildActionButton
                actionType="future"
                label="Conciliacao"
                variant="outline"
                className="rounded-full border-white/10 bg-white/[0.03]"
                futureMessage="Conciliacao inteligente continua em preparacao para a V3."
              />
            </div>
          </div>

          <Tabs value={tab} onValueChange={(value) => setTab(value as FinanceTab)} className="gap-4">
            <TabsList className="flex w-full flex-wrap gap-2 rounded-[22px] border border-white/8 bg-black/18 p-1">
              <TabsTrigger value="overview">Visao geral</TabsTrigger>
              <TabsTrigger value="entries">Lancamentos</TabsTrigger>
              <TabsTrigger value="payables">Contas a pagar</TabsTrigger>
              <TabsTrigger value="receivables">Contas a receber</TabsTrigger>
              <TabsTrigger value="reports">Relatorios</TabsTrigger>
              <TabsTrigger value="planning">Planejamento</TabsTrigger>
              <TabsTrigger value="accounts">Contas bancarias</TabsTrigger>
              <TabsTrigger value="contacts">Clientes/Fornecedores</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <MetricCard title="Saldo atual das contas" value={formatCurrency(balance)} note="Leitura consolidada das contas bancarias." icon={Wallet} />
                  <MetricCard title="Total a pagar" value={formatCurrency(payableTotal)} note="Compromissos que ainda pedem baixa." icon={TrendingDown} />
                  <MetricCard title="Total a receber" value={formatCurrency(receivableTotal)} note="Entradas previstas para os proximos ciclos." icon={TrendingUp} />
                  <MetricCard title="Resultado previsto" value={formatCurrency(projectedResult)} note="Saldo final considerando caixa, pagar e receber." icon={CircleDollarSign} />
                  <MetricCard title="Receitas do mes" value={formatCurrency(monthlyIncome)} note="Ganhos ja registrados ou previstos." icon={ArrowUpRight} />
                  <MetricCard title="Despesas do mes" value={formatCurrency(monthlyExpense)} note="Saidas operacionais e custos atuais." icon={ReceiptText} />
                  <MetricCard title="Margem estimada" value={`${marginEstimate.toFixed(1)}%`} note="Ritmo atual entre receitas e despesas." icon={PiggyBank} />
                </div>

                <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                  <BaseCardV3
                    eyebrow="Resumo financeiro do mes"
                    title="Maio operando com previsao positiva"
                    description="Caixa atual, compromissos e entradas programadas resumidos em uma mesa executiva."
                    className="rounded-[28px]"
                  >
                    <div className="space-y-2">
                      {[
                        ["Saldo atual das contas", formatCurrency(balance)],
                        ["Total de contas a pagar", formatCurrency(payableTotal)],
                        ["Total de contas a receber", formatCurrency(receivableTotal)],
                        ["Resultado previsto", formatCurrency(projectedResult)],
                      ].map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between rounded-[18px] border border-white/8 bg-black/14 px-3 py-2 text-sm">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-medium text-foreground">{value}</span>
                        </div>
                      ))}
                    </div>
                  </BaseCardV3>

                  <BaseCardV3
                    eyebrow="Contas e sinais"
                    title="Saldos das contas"
                    description="Leitura local das principais contas bancarias e operacionais usadas pela agencia."
                    className="rounded-[28px]"
                  >
                    <div className="space-y-2">
                      {accounts.map((account) => (
                        <div key={account.id} className="flex items-center justify-between rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2">
                          <div>
                            <p className="text-sm font-medium text-foreground">{account.name}</p>
                            <p className="text-[12px] text-muted-foreground">{account.type}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-foreground">{formatCurrency(account.balance)}</p>
                            <p className="text-[12px] text-muted-foreground">{account.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </BaseCardV3>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="entries">
              <div className="space-y-4">
                <div className="grid gap-3 xl:grid-cols-7">
                  <Select value={filters.period} onValueChange={(value) => setFilters((current) => ({ ...current, period: value as PeriodFilter }))}>
                    <SelectTrigger className="h-10 rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Periodo" /></SelectTrigger>
                    <SelectContent className="rounded-[20px]">
                      <SelectItem value="today">Hoje</SelectItem>
                      <SelectItem value="7d">7 dias</SelectItem>
                      <SelectItem value="30d">30 dias</SelectItem>
                      <SelectItem value="90d">90 dias</SelectItem>
                      <SelectItem value="month">Este mes</SelectItem>
                      <SelectItem value="quarter">Este trimestre</SelectItem>
                      <SelectItem value="year">Este ano</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filters.accountId} onValueChange={(value) => setFilters((current) => ({ ...current, accountId: value }))}>
                    <SelectTrigger className="h-10 rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Conta" /></SelectTrigger>
                    <SelectContent className="rounded-[20px]">
                      <SelectItem value="all">Todas as contas</SelectItem>
                      {accounts.map((account) => <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filters.type} onValueChange={(value) => setFilters((current) => ({ ...current, type: value }))}>
                    <SelectTrigger className="h-10 rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Tipo" /></SelectTrigger>
                    <SelectContent className="rounded-[20px]">
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="expense">Gastos</SelectItem>
                      <SelectItem value="income">Ganhos</SelectItem>
                      <SelectItem value="transfer">Transferencias</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filters.category} onValueChange={(value) => setFilters((current) => ({ ...current, category: value }))}>
                    <SelectTrigger className="h-10 rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Categoria" /></SelectTrigger>
                    <SelectContent className="rounded-[20px]">
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {categoryOptions.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filters.counterpartyId} onValueChange={(value) => setFilters((current) => ({ ...current, counterpartyId: value }))}>
                    <SelectTrigger className="h-10 rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Cliente / fornecedor" /></SelectTrigger>
                    <SelectContent className="rounded-[20px]">
                      <SelectItem value="all">Todos</SelectItem>
                      {counterpartySeed.map((contact) => <SelectItem key={contact.id} value={contact.id}>{contact.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filters.costCenter} onValueChange={(value) => setFilters((current) => ({ ...current, costCenter: value }))}>
                    <SelectTrigger className="h-10 rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Centro de custo" /></SelectTrigger>
                    <SelectContent className="rounded-[20px]">
                      <SelectItem value="all">Todos os centros</SelectItem>
                      {costCenterOptions.map((center) => <SelectItem key={center} value={center}>{center}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filters.status} onValueChange={(value) => setFilters((current) => ({ ...current, status: value }))}>
                    <SelectTrigger className="h-10 rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent className="rounded-[20px]">
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="paid">Pago</SelectItem>
                      <SelectItem value="received">Recebido</SelectItem>
                      <SelectItem value="payable">A pagar</SelectItem>
                      <SelectItem value="receivable">A receber</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  {filteredEntries.map((entry) => (
                    <BaseCardV3
                      key={entry.id}
                      title={entry.description}
                      description={`${entry.category} • ${contactLookup[entry.counterpartyId ?? ""]?.name ?? "Sem vinculo"} • ${entry.costCenter}`}
                      className="rounded-[24px] p-3"
                      actions={
                        <Badge className={`rounded-full border px-2.5 py-1 text-[10px] tracking-[0.16em] ${statusTone(entry.status)}`} variant="outline">
                          {statusLabel(entry.status)}
                        </Badge>
                      }
                      footer={
                        <>
                          <AgencyRebuildActionButton
                            actionType="modal"
                            label="Editar"
                            className="h-7 rounded-full px-2.5 text-[11px]"
                            onAction={() => openEntryModal(entry.mode, entry)}
                          />
                          {(entry.status === "payable" || entry.status === "receivable") ? (
                            <AgencyRebuildActionButton
                              actionType="modal"
                              label={entry.status === "payable" ? "Marcar pago" : "Marcar recebido"}
                              variant="outline"
                              className="h-7 rounded-full border-white/10 bg-white/[0.03] px-2.5 text-[11px]"
                              onAction={() => markEntryResolved(entry.id)}
                            />
                          ) : null}
                          <AgencyRebuildActionButton
                            actionType="modal"
                            label="Excluir"
                            variant="outline"
                            className="h-7 rounded-full border-white/10 bg-black/20 px-2.5 text-[11px]"
                            onAction={() => removeEntry(entry.id)}
                          />
                        </>
                      }
                    >
                      <div className="grid gap-2 rounded-[18px] border border-white/8 bg-black/14 px-3 py-2 text-[12px] text-muted-foreground md:grid-cols-6">
                        <span>{entry.date}</span>
                        <span>{entry.category}</span>
                        <span>{entry.description}</span>
                        <span>{contactLookup[entry.counterpartyId ?? ""]?.name ?? "--"}</span>
                        <span className="font-medium text-foreground">{formatCurrency(entry.amount)}</span>
                        <span>{entry.method}</span>
                      </div>
                    </BaseCardV3>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="payables">
              <div className="space-y-3">
                {payableEntries.map((entry) => (
                  <BaseCardV3
                    key={entry.id}
                    title={entry.description}
                    description={`${contactLookup[entry.counterpartyId ?? ""]?.name ?? "Fornecedor"} • ${entry.category}`}
                    className="rounded-[24px] p-3"
                    footer={
                      <>
                        <AgencyRebuildActionButton actionType="modal" label="Pagar" className="h-7 rounded-full px-2.5 text-[11px]" onAction={() => markEntryResolved(entry.id)} />
                        <AgencyRebuildActionButton actionType="modal" label="Editar" variant="outline" className="h-7 rounded-full border-white/10 bg-white/[0.03] px-2.5 text-[11px]" onAction={() => openEntryModal("expense", entry)} />
                        <AgencyRebuildActionButton actionType="modal" label="Excluir" variant="outline" className="h-7 rounded-full border-white/10 bg-black/20 px-2.5 text-[11px]" onAction={() => removeEntry(entry.id)} />
                      </>
                    }
                  >
                    <div className="grid gap-2 rounded-[18px] border border-white/8 bg-black/14 px-3 py-2 text-[12px] text-muted-foreground md:grid-cols-5">
                      <span>{entry.date}</span>
                      <span>{contactLookup[entry.counterpartyId ?? ""]?.name ?? "--"}</span>
                      <span>{entry.category}</span>
                      <span className="font-medium text-foreground">{formatCurrency(entry.amount)}</span>
                      <span>{statusLabel(entry.status)}</span>
                    </div>
                  </BaseCardV3>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="receivables">
              <div className="space-y-3">
                {receivableEntries.map((entry) => (
                  <BaseCardV3
                    key={entry.id}
                    title={entry.description}
                    description={`${contactLookup[entry.counterpartyId ?? ""]?.name ?? "Cliente"} • ${entry.category}`}
                    className="rounded-[24px] p-3"
                    footer={
                      <>
                        <AgencyRebuildActionButton actionType="modal" label="Receber" className="h-7 rounded-full px-2.5 text-[11px]" onAction={() => markEntryResolved(entry.id)} />
                        <AgencyRebuildActionButton actionType="modal" label="Editar" variant="outline" className="h-7 rounded-full border-white/10 bg-white/[0.03] px-2.5 text-[11px]" onAction={() => openEntryModal("income", entry)} />
                        <AgencyRebuildActionButton actionType="modal" label="Excluir" variant="outline" className="h-7 rounded-full border-white/10 bg-black/20 px-2.5 text-[11px]" onAction={() => removeEntry(entry.id)} />
                      </>
                    }
                  >
                    <div className="grid gap-2 rounded-[18px] border border-white/8 bg-black/14 px-3 py-2 text-[12px] text-muted-foreground md:grid-cols-5">
                      <span>{entry.date}</span>
                      <span>{contactLookup[entry.counterpartyId ?? ""]?.name ?? "--"}</span>
                      <span>{entry.category}</span>
                      <span className="font-medium text-foreground">{formatCurrency(entry.amount)}</span>
                      <span>{statusLabel(entry.status)}</span>
                    </div>
                  </BaseCardV3>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reports">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <AgencyRebuildActionButton
                    actionType="modal"
                    label="Competencia"
                    className={cn("h-8 rounded-full px-3 text-xs", reportView === "competence" ? "" : "border-white/10 bg-white/[0.03]")}
                    variant={reportView === "competence" ? "default" : "outline"}
                    onAction={() => setReportView("competence")}
                  />
                  <AgencyRebuildActionButton
                    actionType="modal"
                    label="Fluxo de caixa"
                    className={cn("h-8 rounded-full px-3 text-xs", reportView === "cashflow" ? "" : "border-white/10 bg-white/[0.03]")}
                    variant={reportView === "cashflow" ? "default" : "outline"}
                    onAction={() => setReportView("cashflow")}
                  />
                  <AgencyRebuildActionButton
                    actionType="future"
                    label="Exportar"
                    variant="outline"
                    className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs"
                    futureMessage="Exportacao premium entra na proxima etapa da V3."
                  />
                  <AgencyRebuildActionButton
                    actionType="modal"
                    label="Ver grafico"
                    className="h-8 rounded-full px-3 text-xs"
                    onAction={() =>
                      toast({
                        title: "Grafico preparado",
                        description: "A leitura grafica sera refinada na proxima camada visual da V3.",
                      })
                    }
                  />
                </div>

                <BaseCardV3
                  eyebrow={reportView === "competence" ? "DRE por competencia" : "Fluxo de caixa"}
                  title={reportView === "competence" ? "Receitas, despesas e resultado previsto" : "Entradas, saidas e saldo final"}
                  description="Uma mesa financeira premium para comparar categorias e acompanhar o comportamento mensal."
                  className="rounded-[28px]"
                >
                  <div className="overflow-x-auto rounded-[20px] border border-white/8 bg-black/14">
                    <table className="min-w-full text-left text-sm">
                      <thead className="border-b border-white/8 bg-white/[0.03] text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 font-medium">Linha</th>
                          <th className="px-4 py-3 font-medium">Jan</th>
                          <th className="px-4 py-3 font-medium">Fev</th>
                          <th className="px-4 py-3 font-medium">Mar</th>
                          <th className="px-4 py-3 font-medium">Abr</th>
                          <th className="px-4 py-3 font-medium">Mai</th>
                          <th className="px-4 py-3 font-medium">Jun</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportRows.map((row) => (
                          <tr key={row.label} className="border-b border-white/6">
                            <td className="px-4 py-3 text-foreground">{row.label}</td>
                            {row.values.map((value, index) => (
                              <td key={`${row.label}-${index}`} className="px-4 py-3 text-muted-foreground">
                                {value}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </BaseCardV3>
              </div>
            </TabsContent>

            <TabsContent value="planning">
              <div className="grid gap-4 xl:grid-cols-2">
                <BaseCardV3
                  eyebrow="Planejamento"
                  title="Metas mensais e previsao de caixa"
                  description="Estado preparado para metas, alertas, despesas recorrentes e margem minima."
                  className="rounded-[28px]"
                >
                  <div className="space-y-2">
                    {[
                      "Meta de caixa minima: R$ 35.000",
                      "Previsao de caixa para 30 dias: positiva",
                      "Despesas recorrentes monitoradas: 6",
                      "Margem minima alvo: 18%",
                    ].map((item) => (
                      <div key={item} className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground">
                        {item}
                      </div>
                    ))}
                  </div>
                </BaseCardV3>

                <BaseCardV3
                  eyebrow="Alertas"
                  title="Planejamento em preparacao"
                  description="Sem backend real ainda, mas a camada ja nasce pronta para metas e previsoes."
                  className="rounded-[28px]"
                >
                  <div className="rounded-[20px] border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-sm text-muted-foreground">
                    O proximo passo da V3 vai conectar metas mensais, previsao de caixa e leituras mais consultivas aqui.
                  </div>
                </BaseCardV3>
              </div>
            </TabsContent>

            <TabsContent value="accounts">
              <div className="space-y-4">
                <div className="flex justify-end">
                  <AgencyRebuildActionButton
                    actionType="modal"
                    label="Nova conta"
                    className="rounded-full"
                    onAction={() => setAccountModalOpen(true)}
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {accounts.map((account) => (
                    <BaseCardV3
                      key={account.id}
                      title={account.name}
                      description={`${account.type} • ${account.status}`}
                      className="rounded-[26px] p-3.5"
                      actions={
                        <div className="rounded-[14px] border border-white/8 bg-white/[0.04] p-2 text-primary">
                          <Landmark className="h-4 w-4" />
                        </div>
                      }
                    >
                      <p className="text-lg font-semibold text-foreground">{formatCurrency(account.balance)}</p>
                    </BaseCardV3>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contacts">
              <div className="grid gap-4 xl:grid-cols-2">
                <BaseCardV3
                  eyebrow="Clientes"
                  title="Relacionamentos financeiros"
                  description="Clientes conectados a ganhos, parcelas e previsoes locais."
                  className="rounded-[28px]"
                >
                  <div className="space-y-2">
                    {counterpartySeed.filter((item) => item.kind === "client").map((item) => (
                      <div key={item.id} className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2">
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        <p className="text-[12px] text-muted-foreground">{item.note}</p>
                      </div>
                    ))}
                  </div>
                </BaseCardV3>

                <BaseCardV3
                  eyebrow="Fornecedores"
                  title="Parceiros e custos"
                  description="Fornecedores ligados a contas a pagar, categorias e centros de custo."
                  className="rounded-[28px]"
                >
                  <div className="space-y-2">
                    {counterpartySeed.filter((item) => item.kind === "supplier").map((item) => (
                      <div key={item.id} className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2">
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        <p className="text-[12px] text-muted-foreground">{item.note}</p>
                      </div>
                    ))}
                  </div>
                </BaseCardV3>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </BaseModalV3>

      <BaseModalV3
        open={Boolean(entryModalMode)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) closeEntryModal()
        }}
        title={
          entryModalMode === "expense"
            ? "Registrar gasto"
            : entryModalMode === "income"
              ? "Registrar ganho"
              : "Registrar transferencia"
        }
        description="Fluxo local da V3 com campos escuros, leitura premium e previsao visual de parcelas."
        contentClassName="sm:max-w-5xl"
        bodyClassName="pb-6"
        footer={
          <>
            <AgencyRebuildActionButton
              actionType="modal"
              label="Cancelar"
              variant="outline"
              className="rounded-full border-white/10 bg-white/[0.03]"
              onAction={closeEntryModal}
            />
            <AgencyRebuildActionButton
              actionType="modal"
              label={editingEntryId ? "Atualizar localmente" : "Salvar localmente"}
              className="rounded-full"
              onAction={submitEntry}
            />
          </>
        }
      >
        {entryModalMode ? (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              {entryModalMode === "transfer" ? (
                <>
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Conta origem</label>
                    <Select value={entryForm.sourceAccountId} onValueChange={(value) => setEntryForm((current) => ({ ...current, sourceAccountId: value }))}>
                      <SelectTrigger className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Conta origem" /></SelectTrigger>
                      <SelectContent className="rounded-[20px]">
                        {accounts.map((account) => <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Conta destino</label>
                    <Select value={entryForm.destinationAccountId} onValueChange={(value) => setEntryForm((current) => ({ ...current, destinationAccountId: value }))}>
                      <SelectTrigger className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Conta destino" /></SelectTrigger>
                      <SelectContent className="rounded-[20px]">
                        {accounts.map((account) => <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Status</label>
                    <Select
                      value={entryForm.status}
                      onValueChange={(value) => setEntryForm((current) => ({ ...current, status: value as EntryStatus }))}
                    >
                      <SelectTrigger className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Status" /></SelectTrigger>
                      <SelectContent className="rounded-[20px]">
                        {entryModalMode === "expense" ? (
                          <>
                            <SelectItem value="paid">Pago</SelectItem>
                            <SelectItem value="payable">A pagar</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="received">Recebido</SelectItem>
                            <SelectItem value="receivable">A receber</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Conta bancaria</label>
                    <Select value={entryForm.accountId} onValueChange={(value) => setEntryForm((current) => ({ ...current, accountId: value }))}>
                      <SelectTrigger className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Conta" /></SelectTrigger>
                      <SelectContent className="rounded-[20px]">
                        {accounts.map((account) => <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Data</label>
                <Input type="date" value={entryForm.date} onChange={(event) => setEntryForm((current) => ({ ...current, date: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" />
              </div>
              {entryModalMode !== "transfer" ? (
                <>
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Repetir</label>
                    <Select value={entryForm.repeatMode} onValueChange={(value) => setEntryForm((current) => ({ ...current, repeatMode: value as RepeatMode }))}>
                      <SelectTrigger className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Repetir" /></SelectTrigger>
                      <SelectContent className="rounded-[20px]">
                        <SelectItem value="none">Nao se repete</SelectItem>
                        <SelectItem value="multi">Mais de uma vez</SelectItem>
                        <SelectItem value="always">Sempre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Parcelas</label>
                    <Input value={entryForm.installments} onChange={(event) => setEntryForm((current) => ({ ...current, installments: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" />
                  </div>
                </>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_220px]">
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Descricao</label>
                <Input value={entryForm.description} onChange={(event) => setEntryForm((current) => ({ ...current, description: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Descreva o lancamento" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Valor em R$</label>
                <Input value={entryForm.amount} onChange={(event) => setEntryForm((current) => ({ ...current, amount: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="0,00" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Categoria</label>
                <Select value={entryForm.category} onValueChange={(value) => setEntryForm((current) => ({ ...current, category: value }))}>
                  <SelectTrigger className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Categoria" /></SelectTrigger>
                  <SelectContent className="rounded-[20px]">
                    {categoryOptions.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Centro de custo/lucro</label>
                <Select value={entryForm.costCenter} onValueChange={(value) => setEntryForm((current) => ({ ...current, costCenter: value }))}>
                  <SelectTrigger className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Centro" /></SelectTrigger>
                  <SelectContent className="rounded-[20px]">
                    {costCenterOptions.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {entryModalMode !== "transfer" ? (
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{entryModalMode === "income" ? "Cliente" : "Fornecedor"}</label>
                  <Select value={entryForm.counterpartyId} onValueChange={(value) => setEntryForm((current) => ({ ...current, counterpartyId: value }))}>
                    <SelectTrigger className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                    <SelectContent className="rounded-[20px]">
                      {counterpartySeed
                        .filter((item) => item.kind === (entryModalMode === "income" ? "client" : "supplier"))
                        .map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Forma de pagamento</label>
                <Select value={entryForm.method} onValueChange={(value) => setEntryForm((current) => ({ ...current, method: value }))}>
                  <SelectTrigger className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Forma" /></SelectTrigger>
                  <SelectContent className="rounded-[20px]">
                    {paymentMethods.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Tags</label>
                <Input value={entryForm.tags} onChange={(event) => setEntryForm((current) => ({ ...current, tags: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="vip, mensal, urgente" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Anexos</label>
                <div className="flex items-center gap-2">
                  <AgencyRebuildActionButton
                    actionType="modal"
                    label="Adicionar anexo"
                    variant="outline"
                    className="h-11 rounded-[18px] border-white/10 bg-white/[0.03] px-4"
                    onAction={() =>
                      setEntryForm((current) => ({
                        ...current,
                        attachments: [...current.attachments, `Comprovante-${current.attachments.length + 1}.pdf`],
                      }))
                    }
                  />
                  <div className="flex min-h-11 flex-1 flex-wrap items-center gap-2 rounded-[18px] border border-white/8 bg-black/14 px-3 py-2 text-[12px] text-muted-foreground">
                    {entryForm.attachments.length ? entryForm.attachments.join(" • ") : "Sem anexos locais"}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Observacoes</label>
              <Textarea value={entryForm.notes} onChange={(event) => setEntryForm((current) => ({ ...current, notes: event.target.value }))} className="min-h-[110px] rounded-[20px] border-white/10 bg-white/[0.03]" placeholder="Observacoes internas, contexto da parcela ou detalhes do repasse." />
            </div>

            {entryModalMode !== "transfer" ? (
              <BaseCardV3
                eyebrow="Previsao de lancamentos"
                title="Parcelas geradas localmente"
                description="A V3 ainda nao escreve no backend, mas ja mostra como as parcelas serao criadas."
                className="rounded-[26px]"
              >
                <div className="space-y-2">
                  {installmentPreview.map((preview) => (
                    <div key={`${preview.index}-${preview.date}`} className="flex items-center justify-between rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2 text-sm">
                      <span className="text-muted-foreground">Parcela {preview.index}/{preview.total} • {preview.date}</span>
                      <span className="font-medium text-foreground">{formatCurrency(preview.amount)}</span>
                    </div>
                  ))}
                </div>
              </BaseCardV3>
            ) : null}
          </div>
        ) : null}
      </BaseModalV3>

      <BaseModalV3
        open={accountModalOpen}
        onOpenChange={setAccountModalOpen}
        title="Nova conta bancaria"
        description="Estrutura local da V3 para adicionar novas contas sem conectar backend ainda."
        contentClassName="sm:max-w-2xl"
        footer={
          <>
            <AgencyRebuildActionButton
              actionType="modal"
              label="Cancelar"
              variant="outline"
              className="rounded-full border-white/10 bg-white/[0.03]"
              onAction={() => setAccountModalOpen(false)}
            />
            <AgencyRebuildActionButton
              actionType="modal"
              label="Salvar localmente"
              className="rounded-full"
              onAction={() => {
                if (!newAccount.name || !newAccount.type) {
                  toast({
                    title: "Complete os dados da conta",
                    description: "Nome e tipo da conta precisam estar preenchidos.",
                  })
                  return
                }

                setAccounts((current) => [
                  {
                    id: `account-${Date.now()}`,
                    name: newAccount.name,
                    type: newAccount.type,
                    balance: parseCurrencyInput(newAccount.balance),
                    status: newAccount.status,
                  },
                  ...current,
                ])
                setNewAccount({ name: "", type: "", balance: "", status: "Ativa" })
                setAccountModalOpen(false)
              }}
            />
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input value={newAccount.name} onChange={(event) => setNewAccount((current) => ({ ...current, name: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Nome da conta" />
          <Input value={newAccount.type} onChange={(event) => setNewAccount((current) => ({ ...current, type: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Tipo da conta" />
          <Input value={newAccount.balance} onChange={(event) => setNewAccount((current) => ({ ...current, balance: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Saldo inicial" />
          <Select value={newAccount.status} onValueChange={(value) => setNewAccount((current) => ({ ...current, status: value as BankAccount["status"] }))}>
            <SelectTrigger className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent className="rounded-[20px]">
              <SelectItem value="Ativa">Ativa</SelectItem>
              <SelectItem value="Monitorar">Monitorar</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </BaseModalV3>
    </>
  )
}
