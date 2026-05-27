"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Bell,
  CircleAlert,
  CreditCard,
  FileText,
  HandCoins,
  PlaneTakeoff,
  ShieldAlert,
  Users,
} from "lucide-react"
import { AgencyRebuildActionButton } from "@/components/agency-rebuild/actions/agency-rebuild-action-button"
import { BaseModalV3 } from "@/components/agency-rebuild/modals/base-modal-v3"
import { BaseCardV3 } from "@/components/agency-rebuild/shared/base-card-v3"
import { Badge } from "@/components/ui/badge"

type NotificationType =
  | "financial"
  | "documents"
  | "trips"
  | "leads"
  | "tasks"
  | "credits"
  | "operations"

type NotificationStatus = "unread" | "read" | "important" | "archived"

type NotificationItem = {
  id: string
  title: string
  body: string
  type: NotificationType
  status: NotificationStatus
  time: string
}

const notificationSeed: NotificationItem[] = [
  {
    id: "n-1",
    title: "Pagamento recebido",
    body: "Italia Signature recebeu entrada parcial e pede conciliacao no Financeiro.",
    type: "financial",
    status: "unread",
    time: "Ha 12 min",
  },
  {
    id: "n-2",
    title: "Documento pendente",
    body: "Contrato de Buenos Aires segue aguardando revisao final antes do envio.",
    type: "documents",
    status: "important",
    time: "Ha 28 min",
  },
  {
    id: "n-3",
    title: "Viagem proxima",
    body: "Embarque para Roma entra em janela curta e exige conferencias finais.",
    type: "trips",
    status: "unread",
    time: "Hoje, 10:20",
  },
  {
    id: "n-4",
    title: "Lead novo",
    body: "Chegou um lead com interesse em lua de mel no Caribe pelo formulario premium.",
    type: "leads",
    status: "read",
    time: "Hoje, 09:05",
  },
  {
    id: "n-5",
    title: "Tarefa vencida",
    body: "Follow-up com cliente VIP passou da janela e pede novo passo operacional.",
    type: "tasks",
    status: "important",
    time: "Ontem",
  },
  {
    id: "n-6",
    title: "Creditos em alerta",
    body: "O saldo segue saudavel, mas a camada Atlas consumiu acima do ritmo esperado.",
    type: "credits",
    status: "read",
    time: "Ontem",
  },
  {
    id: "n-7",
    title: "Alteracao operacional",
    body: "O workspace de Documentos recebeu nova prioridade na operacao da semana.",
    type: "operations",
    status: "archived",
    time: "2 dias",
  },
]

const statusFilters: Array<{ key: "all" | NotificationStatus; label: string }> = [
  { key: "all", label: "Todas" },
  { key: "unread", label: "Nao lidas" },
  { key: "important", label: "Importantes" },
  { key: "read", label: "Lidas" },
  { key: "archived", label: "Arquivadas" },
]

const typeFilters: Array<{ key: "all" | NotificationType; label: string }> = [
  { key: "all", label: "Tudo" },
  { key: "financial", label: "Financeiro" },
  { key: "documents", label: "Documentos" },
  { key: "trips", label: "Viagens" },
  { key: "leads", label: "Leads" },
  { key: "tasks", label: "Tarefas" },
  { key: "credits", label: "Creditos" },
  { key: "operations", label: "Operacao" },
]

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "financial":
      return HandCoins
    case "documents":
      return FileText
    case "trips":
      return PlaneTakeoff
    case "leads":
      return Users
    case "tasks":
      return CircleAlert
    case "credits":
      return CreditCard
    case "operations":
      return ShieldAlert
  }
}

function getStatusTone(status: NotificationStatus) {
  switch (status) {
    case "unread":
      return "border-primary/18 bg-primary/[0.08] text-primary-foreground"
    case "important":
      return "border-amber-400/18 bg-amber-400/[0.08] text-amber-100"
    case "archived":
      return "border-white/8 bg-white/[0.03] text-muted-foreground"
    case "read":
      return "border-emerald-400/18 bg-emerald-400/[0.08] text-emerald-100"
  }
}

function getStatusLabel(status: NotificationStatus) {
  switch (status) {
    case "unread":
      return "Nao lida"
    case "important":
      return "Importante"
    case "read":
      return "Lida"
    case "archived":
      return "Arquivada"
  }
}

export function AgencyRebuildNotifications() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState(notificationSeed)
  const [statusFilter, setStatusFilter] = useState<"all" | NotificationStatus>("all")
  const [typeFilter, setTypeFilter] = useState<"all" | NotificationType>("all")
  const [selectedId, setSelectedId] = useState<string | null>(notificationSeed[0]?.id ?? null)

  const unreadCount = useMemo(
    () => notifications.filter((item) => item.status === "unread" || item.status === "important").length,
    [notifications],
  )

  const filteredNotifications = useMemo(
    () =>
      notifications.filter((item) => {
        const matchesStatus = statusFilter === "all" ? true : item.status === statusFilter
        const matchesType = typeFilter === "all" ? true : item.type === typeFilter
        return matchesStatus && matchesType
      }),
    [notifications, statusFilter, typeFilter],
  )

  const selectedNotification = useMemo(
    () =>
      filteredNotifications.find((item) => item.id === selectedId) ??
      notifications.find((item) => item.id === selectedId) ??
      filteredNotifications[0] ??
      null,
    [filteredNotifications, notifications, selectedId],
  )

  useEffect(() => {
    if (!selectedNotification) {
      setSelectedId(filteredNotifications[0]?.id ?? null)
    }
  }, [filteredNotifications, selectedNotification])

  const updateNotification = (id: string, updater: (item: NotificationItem) => NotificationItem) => {
    setNotifications((current) => current.map((item) => (item.id === id ? updater(item) : item)))
  }

  const deleteNotification = (id: string) => {
    setNotifications((current) => current.filter((item) => item.id !== id))
    setSelectedId((current) => (current === id ? null : current))
  }

  return (
    <>
      <AgencyRebuildActionButton
        actionType="modal"
        label={
          <span className="relative flex items-center justify-center">
            <Bell className="h-4 w-4 text-foreground" />
            {unreadCount ? (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full border border-[#130e0d] bg-primary px-1 text-[10px] font-semibold text-black">
                {unreadCount}
              </span>
            ) : null}
          </span>
        }
        className="h-10 w-10 rounded-full border border-white/8 bg-white/[0.035] p-0 transition-all hover:border-primary/18 hover:bg-white/[0.05]"
        variant="outline"
        tooltip="Abrir notificacoes"
        onAction={() => setOpen(true)}
      />

      <BaseModalV3
        open={open}
        onOpenChange={setOpen}
        title="Notificacoes"
        description="Central local da V3 para acompanhar sinais operacionais, alertas e eventos importantes."
        contentClassName="sm:max-w-6xl"
        bodyClassName="pb-6"
        footer={
          <>
            <AgencyRebuildActionButton
              actionType="modal"
              label="Marcar todas como lidas"
              className="rounded-full"
              onAction={() =>
                setNotifications((current) =>
                  current.map((item) =>
                    item.status === "archived" ? item : { ...item, status: "read" },
                  ),
                )
              }
            />
            <AgencyRebuildActionButton
              actionType="modal"
              label="Fechar"
              variant="outline"
              className="rounded-full border-white/10 bg-white/[0.03]"
              onAction={() => setOpen(false)}
            />
          </>
        }
      >
        <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-4">
            <BaseCardV3
              eyebrow="Filtros"
              title="Leitura viva"
              description="Combine status e origem para reduzir ruido e focar no que pede atencao agora."
              className="rounded-[26px]"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {statusFilters.map((filter) => (
                    <AgencyRebuildActionButton
                      key={filter.key}
                      actionType="modal"
                      label={filter.label}
                      className={`h-7 rounded-full border px-2.5 text-[11px] ${
                        statusFilter === filter.key
                          ? "border-primary/18 bg-primary/[0.12] text-foreground"
                          : "border-white/8 bg-white/[0.03] text-muted-foreground"
                      }`}
                      variant="outline"
                      tooltip={`Filtrar por ${filter.label.toLowerCase()}`}
                      onAction={() => setStatusFilter(filter.key)}
                    />
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {typeFilters.map((filter) => (
                    <AgencyRebuildActionButton
                      key={filter.key}
                      actionType="modal"
                      label={filter.label}
                      className={`h-7 rounded-full border px-2.5 text-[11px] ${
                        typeFilter === filter.key
                          ? "border-white/12 bg-white/[0.08] text-foreground"
                          : "border-white/8 bg-black/18 text-muted-foreground"
                      }`}
                      variant="outline"
                      tooltip={`Filtrar origem ${filter.label.toLowerCase()}`}
                      onAction={() => setTypeFilter(filter.key)}
                    />
                  ))}
                </div>
              </div>
            </BaseCardV3>

            <div className="space-y-3">
              {filteredNotifications.length ? (
                filteredNotifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type)
                  const isSelected = selectedNotification?.id === notification.id

                  return (
                    <BaseCardV3
                      key={notification.id}
                      title={notification.title}
                      description={notification.body}
                      className={`rounded-[26px] p-3 ${
                        isSelected ? "border-primary/16 bg-primary/[0.05]" : ""
                      }`}
                      actions={
                        <Badge
                          className={`rounded-full border px-2.5 py-1 text-[10px] tracking-[0.16em] ${getStatusTone(notification.status)}`}
                          variant="outline"
                        >
                          {getStatusLabel(notification.status)}
                        </Badge>
                      }
                      footer={
                        <>
                          <AgencyRebuildActionButton
                            actionType="modal"
                            label="Detalhes"
                            className="h-7 rounded-full px-2.5 text-[11px]"
                            onAction={() => setSelectedId(notification.id)}
                          />
                          <AgencyRebuildActionButton
                            actionType="modal"
                            label={notification.status === "read" ? "Nao lida" : "Marcar lida"}
                            variant="outline"
                            className="h-7 rounded-full border-white/10 bg-white/[0.03] px-2.5 text-[11px]"
                            onAction={() =>
                              updateNotification(notification.id, (item) => ({
                                ...item,
                                status: item.status === "read" ? "unread" : "read",
                              }))
                            }
                          />
                          <AgencyRebuildActionButton
                            actionType="modal"
                            label="Excluir"
                            variant="outline"
                            className="h-7 rounded-full border-white/10 bg-black/20 px-2.5 text-[11px]"
                            onAction={() => deleteNotification(notification.id)}
                          />
                        </>
                      }
                    >
                      <div className="flex items-center justify-between gap-3 rounded-[20px] border border-white/8 bg-black/14 px-3 py-2 text-[12px] text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <div className="rounded-[12px] border border-white/8 bg-white/[0.04] p-1.5">
                            <Icon className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <span>{notification.time}</span>
                        </div>
                        <span className="uppercase tracking-[0.18em] text-[10px] text-muted-foreground/80">
                          {notification.type}
                        </span>
                      </div>
                    </BaseCardV3>
                  )
                })
              ) : (
                <BaseCardV3
                  title="Nada neste recorte"
                  description="Ajuste os filtros para ver outros sinais ou aguarde novas notificacoes locais da V3."
                  className="rounded-[26px] p-4"
                >
                  <div className="rounded-[20px] border border-dashed border-white/10 bg-white/[0.02] px-4 py-6 text-sm text-muted-foreground">
                    Sem backend conectado por enquanto. Esta central vive apenas no preview local da Agency Rebuild.
                  </div>
                </BaseCardV3>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {selectedNotification ? (
              <BaseCardV3
                eyebrow="Detalhes"
                title={selectedNotification.title}
                description={selectedNotification.body}
                className="rounded-[28px]"
                actions={
                  <Badge
                    className={`rounded-full border px-2.5 py-1 text-[10px] tracking-[0.16em] ${getStatusTone(selectedNotification.status)}`}
                    variant="outline"
                  >
                    {getStatusLabel(selectedNotification.status)}
                  </Badge>
                }
                footer={
                  <>
                    <AgencyRebuildActionButton
                      actionType="modal"
                      label={selectedNotification.status === "archived" ? "Restaurar" : "Arquivar"}
                      className="h-8 rounded-full px-3 text-xs"
                      onAction={() =>
                        updateNotification(selectedNotification.id, (item) => ({
                          ...item,
                          status: item.status === "archived" ? "read" : "archived",
                        }))
                      }
                    />
                    <AgencyRebuildActionButton
                      actionType="future"
                      label="Ver origem"
                      variant="outline"
                      className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs"
                      futureMessage="Conexao com modulo real sera ativada depois."
                    />
                  </>
                }
              >
                <div className="space-y-3">
                  <div className="rounded-[22px] border border-white/8 bg-black/14 px-3.5 py-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-primary/72">Origem</p>
                    <p className="mt-2 text-sm text-foreground">{selectedNotification.time}</p>
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      Tipo: {selectedNotification.type}
                    </p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <AgencyRebuildActionButton
                      actionType="modal"
                      label="Marcar lida"
                      className="h-8 rounded-full px-3 text-xs"
                      onAction={() =>
                        updateNotification(selectedNotification.id, (item) => ({
                          ...item,
                          status: "read",
                        }))
                      }
                    />
                    <AgencyRebuildActionButton
                      actionType="modal"
                      label="Excluir"
                      variant="outline"
                      className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs"
                      onAction={() => deleteNotification(selectedNotification.id)}
                    />
                  </div>
                </div>
              </BaseCardV3>
            ) : (
              <BaseCardV3
                eyebrow="Detalhes"
                title="Selecione uma notificacao"
                description="Clique em um item da fila para abrir o contexto local da V3."
                className="rounded-[28px]"
              >
                <div className="rounded-[22px] border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-sm text-muted-foreground">
                  O painel lateral fica pronto para explicar melhor cada alerta, sem depender do modulo real ainda.
                </div>
              </BaseCardV3>
            )}

            <BaseCardV3
              eyebrow="Atalhos"
              title="Acoes locais"
              description="Tudo aqui funciona apenas no estado local do preview."
              className="rounded-[28px]"
              footer={
                <>
                  <AgencyRebuildActionButton
                    actionType="modal"
                    label="Marcar todas"
                    className="h-8 rounded-full px-3 text-xs"
                    onAction={() =>
                      setNotifications((current) =>
                        current.map((item) =>
                          item.status === "archived" ? item : { ...item, status: "read" },
                        ),
                      )
                    }
                  />
                  <AgencyRebuildActionButton
                    actionType="future"
                    label="Sincronizar modulo"
                    variant="outline"
                    className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs"
                    futureMessage="Conexao com modulo real sera ativada depois."
                  />
                </>
              }
            >
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Marcar como lida atualiza o estado local imediatamente.</p>
                <p>Excluir remove a notificacao do preview sem tocar em backend.</p>
              </div>
            </BaseCardV3>
          </div>
        </div>
      </BaseModalV3>
    </>
  )
}
