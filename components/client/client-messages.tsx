"use client"

import { useMemo, useState } from "react"
import { Send, Sparkles } from "lucide-react"
import { PageShell } from "@/components/system/page-shell"
import { SectionHeader } from "@/components/system/section-header"
import { DashboardCard } from "@/components/system/dashboard-card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

type ChatMessage = {
  id: string
  sender: "agency" | "client"
  text: string
  time: string
  status?: "Enviado"
}

const initialMessages: ChatMessage[] = [
  { id: "m-1", sender: "agency", text: "Seu transfer está confirmado para as 08:30 no dia do embarque.", time: "09:15" },
  { id: "m-2", sender: "client", text: "Perfeito, obrigado! Preciso levar esse voucher impresso?", time: "09:21", status: "Enviado" },
  { id: "m-3", sender: "agency", text: "Pode apresentar pelo celular. Também deixamos o arquivo na área de documentos.", time: "09:24" },
]

export function ClientMessages() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [draft, setDraft] = useState("")

  const canSend = useMemo(() => draft.trim().length > 0, [draft])

  const handleSend = () => {
    if (!canSend) return

    setMessages((current) => [
      ...current,
      {
        id: `m-${current.length + 1}`,
        sender: "client",
        text: draft.trim(),
        time: "Agora",
        status: "Enviado",
      },
    ])
    setDraft("")
    toast({ title: "Mensagem enviada", description: "A conversa foi atualizada localmente em modo mockado." })
  }

  return (
    <PageShell>
      <SectionHeader title="Mensagens" description="Converse com a agência em um canal simples e direto sobre a sua viagem." />

      <DashboardCard title="Chat com a agência" description="As mensagens enviadas aqui ficam visíveis localmente enquanto o backend ainda não está conectado.">
        <div className="flex h-[62vh] min-h-[420px] flex-col rounded-[28px] border border-white/8 bg-black/10">
          <div className="border-b border-white/8 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-primary/15 bg-primary/10 p-2.5">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">JT Viagens</p>
                <p className="text-xs text-muted-foreground">Atendimento da sua viagem</p>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "client" ? "justify-end" : "justify-start"}`}>
                <div className={message.sender === "client" ? "max-w-[82%] rounded-[24px] rounded-br-md border border-primary/15 bg-primary/10 px-4 py-3 text-primary-foreground shadow-[0_0_24px_rgba(255,122,0,0.06)]" : "max-w-[82%] rounded-[24px] rounded-bl-md border border-white/8 bg-white/[0.04] px-4 py-3"}>
                  <p className="text-sm leading-6 text-foreground">{message.text}</p>
                  <div className="mt-2 flex items-center justify-end gap-2 text-[11px] text-muted-foreground">
                    <span>{message.time}</span>
                    {message.status ? <span>{message.status}</span> : null}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/8 px-4 py-4">
            <div className="flex items-end gap-3 rounded-[26px] border border-white/10 bg-white/[0.03] p-3">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Escreva uma mensagem para a agência..."
                rows={1}
                className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-1 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <Button className="rounded-full" onClick={handleSend} disabled={!canSend}>
                <Send className="h-4 w-4" />
                Enviar
              </Button>
            </div>
          </div>
        </div>
      </DashboardCard>
    </PageShell>
  )
}
