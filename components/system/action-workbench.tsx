"use client"

import { useMemo, useState } from "react"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type ActionWorkbenchProps = {
  action: string | null
  onClose: () => void
}

type ActionConfig = {
  title: string
  description: string
  confirmLabel: string
  fields?: { label: string; placeholder: string }[]
  note?: string
}

const actionConfigs: Record<string, ActionConfig> = {
  "Adicionar funcionário": {
    title: "Adicionar funcionário",
    description: "Convide um novo membro para o portal com acesso controlado e pronto para a operação.",
    confirmLabel: "Salvar funcionário",
    fields: [
      { label: "Nome", placeholder: "Ex.: Julia Trevisan" },
      { label: "E-mail", placeholder: "time@agencia.com" },
      { label: "Cargo", placeholder: "AGENCY_SALES" },
    ],
  },
  "Nova despesa": {
    title: "Nova despesa",
    description: "Registre uma saída financeira com categoria, valor e contexto operacional.",
    confirmLabel: "Salvar despesa",
    fields: [
      { label: "Descrição", placeholder: "Ex.: mídia de campanha de inverno" },
      { label: "Valor", placeholder: "R$ 2.400" },
      { label: "Categoria", placeholder: "Marketing" },
    ],
  },
  "Nova receita": {
    title: "Nova receita",
    description: "Lance uma nova entrada para acompanhar caixa, comissão e lucro estimado.",
    confirmLabel: "Salvar receita",
    fields: [
      { label: "Descrição", placeholder: "Ex.: entrada pacote Maldivas" },
      { label: "Valor", placeholder: "R$ 8.900" },
      { label: "Origem", placeholder: "Viagem premium" },
    ],
  },
  "Nova tarefa": {
    title: "Nova tarefa",
    description: "Crie uma entrega rápida para a central operacional com responsável e prazo.",
    confirmLabel: "Salvar tarefa",
    fields: [
      { label: "Tarefa", placeholder: "Ex.: confirmar voucher do hotel" },
      { label: "Responsável", placeholder: "Operação" },
      { label: "Prazo", placeholder: "Hoje, 17:00" },
    ],
  },
  "Adicionar rota rápida": {
    title: "Adicionar rota rápida",
    description: "Monte um atalho operacional para a equipe acessar fluxos críticos com um clique.",
    confirmLabel: "Salvar atalho",
    fields: [
      { label: "Nome do atalho", placeholder: "Ex.: contratos pendentes" },
      { label: "Destino", placeholder: "/app/documentos/contratos" },
      { label: "Descrição", placeholder: "Atalho para operações do dia" },
    ],
  },
  "Exportar relatório": {
    title: "Exportar relatório",
    description: "A exportação real será conectada depois. Por enquanto, o sistema já entrega o fluxo visual e o feedback.",
    confirmLabel: "Gerar exportação",
    note: "Um arquivo mockado poderá ser ligado depois a PDF, CSV ou envio por WhatsApp.",
  },
  "Gerar relatório": {
    title: "Gerar relatório",
    description: "Monte uma visão executiva com os dados do período atual e prepare o envio futuro.",
    confirmLabel: "Gerar relatório",
    note: "O relatório ainda está mockado, mas o fluxo operacional já está pronto.",
  },
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="space-y-2">
      <span className="text-xs uppercase tracking-[0.18em] text-primary/75">{label}</span>
      <input
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />
    </label>
  )
}

export function ActionWorkbench({ action, onClose }: ActionWorkbenchProps) {
  const [confirming, setConfirming] = useState(false)

  const config = useMemo<ActionConfig | null>(() => {
    if (!action) return null
    return (
      actionConfigs[action] ?? {
        title: action,
        description: "Fluxo mockado preparado para integração futura sem deixar a ação vazia.",
        confirmLabel: "Continuar",
      }
    )
  }, [action])

  const handleSubmit = () => {
    if (!config || !action) return
    setConfirming(true)
    setTimeout(() => {
      toast({
        title: `${config.title} pronto`,
        description: "Fluxo mockado executado com sucesso.",
      })
      setConfirming(false)
      onClose()
    }, 300)
  }

  return (
    <Dialog open={Boolean(action)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[88vh] overflow-hidden rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl sm:max-w-xl">
        <DialogHeader className="border-b border-white/8 px-6 py-5">
          <DialogTitle>{config?.title}</DialogTitle>
          <DialogDescription>{config?.description}</DialogDescription>
        </DialogHeader>
        <div className="max-h-[58vh] space-y-4 overflow-y-auto px-6 py-5">
          {config?.fields?.map((field) => (
            <Field key={field.label} {...field} />
          ))}
          {config?.note ? <div className="rounded-2xl border border-primary/15 bg-primary/10 px-4 py-3 text-sm text-primary">{config.note}</div> : null}
        </div>
        <DialogFooter className="border-t border-white/8 px-6 py-5">
          <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={onClose}>
            Fechar
          </Button>
          <Button className="rounded-full" onClick={handleSubmit} disabled={confirming}>
            {config?.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
