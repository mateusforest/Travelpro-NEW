"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Bot, Compass, FilePenLine, HandCoins, MessageSquareText, Search, Sparkles, Target, Waypoints } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { PortalKey } from "@/lib/services/portal-types"
import { flattenNavigation, getNavigationByPortal } from "@/lib/services/navigation"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "@/components/ui/command"

const premiumShortcuts: Record<PortalKey, { id: string; label: string; href: string; icon: LucideIcon }[]> = {
  master: [
    { id: "master-marketplace", label: "Abrir Marketplace", href: "/master/marketplace", icon: Target },
    { id: "master-financeiro", label: "Abrir financeiro", href: "/master/financeiro", icon: HandCoins },
    { id: "master-ia", label: "Abrir IA", href: "/master/ia", icon: Bot },
  ],
  agency: [
    { id: "agency-criar-viagem", label: "Criar viagem", href: "/app/viagens", icon: Sparkles },
    { id: "agency-nova-cotacao", label: "Nova cotação", href: "/app/viagens/cotacoes", icon: FilePenLine },
    { id: "agency-novo-contrato", label: "Novo contrato", href: "/app/documentos/contratos", icon: FilePenLine },
    { id: "agency-novo-lead", label: "Novo lead", href: "/app/leads", icon: Waypoints },
    { id: "agency-financeiro", label: "Abrir financeiro", href: "/app/financeiro", icon: HandCoins },
    { id: "agency-match", label: "Abrir Match", href: "/app/catalogo/travelpro-match", icon: Target },
    { id: "agency-agent", label: "Abrir Agent", href: "/app/agent", icon: Bot },
    { id: "agency-atlas", label: "Abrir Atlas", href: "/app/atlas-advisor", icon: Compass },
    { id: "agency-go", label: "Abrir TravelPro Go", href: "/app/travelpro-go", icon: MessageSquareText },
  ],
  client: [
    { id: "client-viagem", label: "Abrir viagem", href: "/cliente/viagem", icon: Sparkles },
    { id: "client-roteiro", label: "Abrir roteiro", href: "/cliente/roteiro", icon: FilePenLine },
    { id: "client-mensagens", label: "Abrir mensagens", href: "/cliente/mensagens", icon: MessageSquareText },
  ],
}

export function CommandPalette({ portal }: { portal: PortalKey }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const navigation = useMemo(() => {
    const flatItems = flattenNavigation(getNavigationByPortal(portal))
    const seen = new Set<string>()

    return flatItems.filter((item) => {
      if (!item.href) return false
      const duplicateKey = `${portal}-${item.href}`
      if (seen.has(duplicateKey)) return false
      seen.add(duplicateKey)
      return true
    })
  }, [portal])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((current) => !current)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const quickLinks = useMemo(() => premiumShortcuts[portal], [portal])

  const runCommand = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden h-9 min-w-[220px] items-center justify-between rounded-full border border-white/10 bg-white/[0.025] px-3 text-sm text-muted-foreground transition-all hover:border-primary/20 hover:bg-white/[0.05] md:flex"
      >
        <span className="inline-flex items-center gap-2">
          <Search className="h-3.5 w-3.5" />
          Buscar páginas e ações
        </span>
        <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] tracking-[0.16em]">Ctrl K</span>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="TravelPro Command"
        description="Busque páginas e atalhos rápidos do sistema."
        className="max-w-2xl rounded-[28px] border border-white/10 bg-black/88 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl"
      >
        <CommandInput placeholder="Buscar páginas, clientes ou ações rápidas..." />
        <CommandList className="max-h-[420px]">
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          <CommandGroup heading="Navegação">
            {navigation.map((item, index) =>
              item.href ? (
                <CommandItem
                  key={`${portal}-nav-${item.href}-${index}`}
                  onSelect={() => runCommand(item.href!)}
                  className="rounded-2xl px-3 py-2.5"
                >
                  <item.icon className="h-4 w-4 text-primary" />
                  <span>{item.title}</span>
                  <CommandShortcut>Ir</CommandShortcut>
                </CommandItem>
              ) : null,
            )}
          </CommandGroup>
          <CommandGroup heading="Ações rápidas">
            {quickLinks.map((item, index) => (
              <CommandItem key={`${portal}-quick-${item.id}-${item.href}-${index}`} onSelect={() => runCommand(item.href)} className="rounded-2xl px-3 py-2.5">
                <item.icon className="h-4 w-4 text-primary" />
                <span>{item.label}</span>
                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
