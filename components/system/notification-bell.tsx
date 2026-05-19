import { Bell } from "lucide-react"

export function NotificationBell({ count = 3 }: { count?: number }) {
  return (
    <button className="relative rounded-full border border-white/10 bg-white/[0.03] p-3 text-foreground transition-colors hover:bg-white/[0.06]">
      <Bell className="h-4 w-4" />
      <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
        {count}
      </span>
    </button>
  )
}
