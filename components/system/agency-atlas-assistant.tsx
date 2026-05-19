"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Compass, Send, Sparkles, X } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

const suggestions = [
  "Como criar uma cotação?",
  "Como publicar um pacote?",
  "Como usar o TravelPro Go?",
  "Como ver meus leads?",
]

const mockReplies: Record<string, string> = {
  "Como criar uma cotação?": "Abra Cotações, clique em criar cotação e escolha o cliente ou destino para iniciar o fluxo.",
  "Como publicar um pacote?": "Vá em Catálogo, finalize os dados do pacote e publique para liberar o link e o Match.",
  "Como usar o TravelPro Go?": "No TravelPro Go você acompanha comandos recentes, usuários autorizados e pode pausar ou ativar o número.",
  "Como ver meus leads?": "Abra Leads para acessar o kanban, filtrar oportunidades e acompanhar temperatura e etapa comercial.",
}

export function AgencyAtlasAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null)

  const handleSuggestion = (suggestion: string) => {
    setMessage(suggestion)
    setSelectedSuggestion(suggestion)
  }

  const handleSend = () => {
    if (!message.trim()) return
    setSelectedSuggestion(message.trim())
    toast({
      title: "Mensagem enviada ao Atlas",
      description: "A consulta foi registrada localmente em modo mockado.",
    })
    setMessage("")
  }

  return (
    <>
      <div className="group fixed bottom-24 right-4 z-40 md:bottom-6 md:right-6">
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-orange-400 text-primary-foreground shadow-[0_0_32px_rgba(255,122,0,0.35)] transition-all duration-300 hover:scale-105"
          aria-label="Abrir Atlas"
        >
          <Compass className="h-6 w-6" />
        </button>
        <span className="pointer-events-none absolute right-16 top-1/2 hidden -translate-y-1/2 rounded-full border border-primary/15 bg-black/80 px-3 py-1.5 text-xs font-medium text-primary opacity-0 shadow-lg shadow-black/30 transition-all duration-200 group-hover:opacity-100 md:inline-flex">
          Atlas
        </span>
      </div>

      <AnimatePresence>
        {isOpen ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 24 }}
              transition={{ type: "spring", damping: 24, stiffness: 260 }}
              className="fixed bottom-24 right-4 z-50 w-[calc(100vw-2rem)] max-w-[380px] md:bottom-6 md:right-6"
            >
              <div className="overflow-hidden rounded-[28px] border border-white/10 bg-black/85 text-foreground shadow-2xl shadow-black/45 backdrop-blur-2xl">
                <div className="flex items-center justify-between border-b border-white/8 bg-gradient-to-r from-primary/12 via-primary/6 to-transparent p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-orange-400 text-primary-foreground shadow-[0_0_24px_rgba(255,122,0,0.25)]">
                      <Compass className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">Atlas</h3>
                      <p className="text-xs text-muted-foreground">Consultoria operacional</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
                    aria-label="Fechar Atlas"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4 p-4">
                  <div className="flex gap-3">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/18 text-primary">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="flex-1 rounded-2xl rounded-tl-sm border border-white/8 bg-white/[0.04] px-4 py-3">
                      <p className="text-sm leading-6 text-foreground">Oi! Sou o Atlas. Posso te orientar nos fluxos do TravelPro e nos atalhos da operação.</p>
                    </div>
                  </div>

                  {selectedSuggestion ? (
                    <>
                      <div className="flex justify-end">
                        <div className="max-w-[85%] rounded-2xl rounded-br-sm border border-primary/20 bg-primary/12 px-4 py-3 text-sm text-foreground">
                          {selectedSuggestion}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/18 text-primary">
                          <Compass className="h-4 w-4" />
                        </div>
                        <div className="flex-1 rounded-2xl rounded-tl-sm border border-white/8 bg-white/[0.04] px-4 py-3">
                          <p className="text-sm leading-6 text-muted-foreground">{mockReplies[selectedSuggestion] ?? "Recebi sua solicitação e preparei uma orientação inicial em modo mockado para a operação."}</p>
                        </div>
                      </div>
                    </>
                  ) : null}

                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.18em] text-primary/75">Sugestões rápidas</p>
                    <div className="space-y-2">
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => handleSuggestion(suggestion)}
                          className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-left text-sm text-foreground transition-all hover:border-primary/20 hover:bg-primary/[0.06]"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/8 p-4">
                  <div className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                    <input
                      type="text"
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder="Digite sua dúvida..."
                      className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    />
                    <button
                      type="button"
                      onClick={handleSend}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/16 text-primary transition-colors hover:bg-primary/22"
                      aria-label="Enviar mensagem"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  )
}
