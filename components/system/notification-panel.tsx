"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Bell, CheckCheck, Circle, Sparkles, Trash2 } from "lucide-react"
import { Drawer } from "@/components/system/drawer"
import { cn } from "@/lib/utils"

export type NotificationItem = {
  id: string
  title: string
  description: string
  time: string
  tone?: "default" | "success" | "warning" | "danger" | "info"
  href?: string
  read?: boolean
}

type NotificationPanelProps = {
  items: NotificationItem[]
  title?: string
  description?: string
  emptyTitle?: string
  emptyDescription?: string
}

const toneClasses = {
  default: "bg-white/30",
  success: "bg-green-400",
  warning: "bg-amber-400",
  danger: "bg-red-400",
  info: "bg-sky-400",
}

function normalizeNotifications(items: NotificationItem[]) {
  return items.map((item) => ({
    ...item,
    read: item.read ?? false,
  }))
}

function NotificationTrigger({ unreadCount }: { unreadCount: number }) {
  return (
    <button
      type="button"
      className="relative rounded-full border border-white/10 bg-white/[0.03] p-3 text-foreground transition-all hover:border-primary/20 hover:bg-white/[0.06]"
    >
      <Bell className="h-4 w-4" />
      <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
        {unreadCount}
      </span>
    </button>
  )
}

export function NotificationPanel({
  items,
  title = "Notificações",
  description = "Leads, operações e sinais importantes do TravelPro.",
  emptyTitle = "Tudo em dia.",
  emptyDescription = "Nenhuma notificação pendente no momento.",
}: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => normalizeNotifications(items))

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications])

  const markAsRead = (id: string) => {
    setNotifications((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)))
  }

  return (
    <Drawer title={title} description={description} trigger={<NotificationTrigger unreadCount={unreadCount} />}>
      <div className="flex items-center justify-between gap-3 pb-4">
        <div className="rounded-2xl border border-primary/15 bg-primary/10 px-3 py-2 text-xs text-primary">{unreadCount} novas</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setNotifications((current) => current.map((item) => ({ ...item, read: true })))}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Marcar tudo
          </button>
          <button
            type="button"
            onClick={() => setNotifications([])}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Limpar
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.length ? (
          notifications.map((item) => (
            <div
              key={item.id}
              className={cn(
                "rounded-[26px] border p-4 transition-all",
                item.read ? "border-white/8 bg-white/[0.02]" : "border-primary/15 bg-primary/[0.06] shadow-[0_0_28px_rgba(255,122,0,0.05)]",
              )}
            >
              <div className="flex items-start gap-3">
                <span className={cn("mt-1 h-2.5 w-2.5 rounded-full", toneClasses[item.tone ?? "default"])} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">{item.title}</p>
                    {!item.read ? <Circle className="h-2.5 w-2.5 fill-primary text-primary" /> : null}
                  </div>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => markAsRead(item.id)}
                        className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                      >
                        Marcar como lida
                      </button>
                      <Link
                        href={item.href ?? "#"}
                        className="inline-flex items-center gap-1 rounded-full border border-primary/15 bg-primary/10 px-3 py-1.5 text-xs text-primary transition-colors hover:bg-primary/15"
                      >
                        Abrir origem
                        <Sparkles className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[26px] border border-dashed border-white/10 bg-black/10 p-8 text-center">
            <p className="font-medium text-foreground">{emptyTitle}</p>
            <p className="mt-2 text-sm text-muted-foreground">{emptyDescription}</p>
          </div>
        )}
      </div>
    </Drawer>
  )
}
