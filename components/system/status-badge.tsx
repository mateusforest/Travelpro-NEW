import { cn } from "@/lib/utils"

const statusMap: Record<string, string> = {
  ativa: "bg-green-500/15 text-green-300 border-green-500/20",
  ativo: "bg-green-500/15 text-green-300 border-green-500/20",
  conectado: "bg-green-500/15 text-green-300 border-green-500/20",
  confirmado: "bg-green-500/15 text-green-300 border-green-500/20",
  confirmada: "bg-green-500/15 text-green-300 border-green-500/20",
  assinado: "bg-green-500/15 text-green-300 border-green-500/20",
  pronto: "bg-green-500/15 text-green-300 border-green-500/20",
  pago: "bg-green-500/15 text-green-300 border-green-500/20",
  concluído: "bg-green-500/15 text-green-300 border-green-500/20",
  concluido: "bg-green-500/15 text-green-300 border-green-500/20",
  inativa: "bg-zinc-500/15 text-zinc-300 border-zinc-500/20",
  pendente: "bg-amber-500/15 text-amber-300 border-amber-500/20",
  instável: "bg-amber-500/15 text-amber-300 border-amber-500/20",
  atrasado: "bg-red-500/15 text-red-300 border-red-500/20",
  urgente: "bg-red-500/15 text-red-300 border-red-500/20",
  perdido: "bg-red-500/15 text-red-300 border-red-500/20",
  pausado: "bg-zinc-500/15 text-zinc-300 border-zinc-500/20",
  "em andamento": "bg-sky-500/15 text-sky-300 border-sky-500/20",
  planejamento: "bg-violet-500/15 text-violet-300 border-violet-500/20",
}

export function StatusBadge({ status }: { status: string | number }) {
  const value = String(status)
  const tone = statusMap[value.toLowerCase()] ?? "bg-white/5 text-foreground border-white/10"

  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium", tone)}>
      {value}
    </span>
  )
}
