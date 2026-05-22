"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowUpRight, Compass, ExternalLink, Send, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { getAtlasContext, getAtlasQuickRoutes, getAtlasSuggestions, resolveAtlasResponse } from "@/lib/atlas/engine"
import type { AtlasAnalytics, AtlasPortal, AtlasResolvedResponse } from "@/lib/atlas/types"

const analyticsStorageKey = "travelpro-atlas-analytics-v1"

type AtlasMessage = {
  id: string
  role: "user" | "atlas"
  text?: string
  response?: AtlasResolvedResponse
}

const emptyAnalytics: AtlasAnalytics = {
  intents: {},
  modules: {},
  questions: {},
  lastUsedAt: null,
}

function normalizeQuestion(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

export function AgencyAtlasAssistant({ portal = "agency" }: { portal?: AtlasPortal }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [conversation, setConversation] = useState<AtlasMessage[]>([])
  const [analytics, setAnalytics] = useState<AtlasAnalytics>(emptyAnalytics)

  const context = useMemo(() => getAtlasContext(pathname, portal), [pathname, portal])
  const suggestions = useMemo(() => getAtlasSuggestions(pathname, portal), [pathname, portal])
  const quickRoutes = useMemo(() => getAtlasQuickRoutes(pathname, portal), [pathname, portal])

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = window.localStorage.getItem(analyticsStorageKey)
      if (!raw) return
      const parsed = JSON.parse(raw) as AtlasAnalytics
      setAnalytics({
        intents: parsed.intents ?? {},
        modules: parsed.modules ?? {},
        questions: parsed.questions ?? {},
        lastUsedAt: parsed.lastUsedAt ?? null,
      })
    } catch {
      setAnalytics(emptyAnalytics)
    }
  }, [])

  const topQuestions = useMemo(
    () =>
      Object.entries(analytics.questions)
        .sort((left, right) => right[1] - left[1])
        .slice(0, 3)
        .map(([question]) => question),
    [analytics.questions],
  )

  const recordAnalytics = (query: string, response: AtlasResolvedResponse) => {
    if (typeof window === "undefined") return

    const normalizedQuestion = normalizeQuestion(query)
    const nextAnalytics: AtlasAnalytics = {
      intents: {
        ...analytics.intents,
        [response.intentId]: (analytics.intents[response.intentId] ?? 0) + 1,
      },
      modules: {
        ...analytics.modules,
        [response.moduleKey]: (analytics.modules[response.moduleKey] ?? 0) + 1,
      },
      questions: normalizedQuestion
        ? {
            ...analytics.questions,
            [normalizedQuestion]: (analytics.questions[normalizedQuestion] ?? 0) + 1,
          }
        : analytics.questions,
      lastUsedAt: new Date().toISOString(),
    }

    setAnalytics(nextAnalytics)
    window.localStorage.setItem(analyticsStorageKey, JSON.stringify(nextAnalytics))
  }

  const submitQuestion = (rawQuestion: string) => {
    const trimmed = rawQuestion.trim()
    if (!trimmed) return

    const response = resolveAtlasResponse(trimmed, pathname, portal)
    const timestamp = Date.now()

    setConversation((current) => [
      ...current,
      { id: `u-${timestamp}`, role: "user", text: trimmed },
      { id: `a-${timestamp}-${response.intentId}`, role: "atlas", response },
    ])
    recordAnalytics(trimmed, response)
    toast({
      title: "Atlas atualizado",
      description: `Consulta registrada em ${context.label}.`,
    })
    setMessage("")
  }

  return (
    <>
      <div className="group fixed bottom-24 right-4 z-40 md:bottom-6 md:right-6">
        <button
          type="button"
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
              className="fixed bottom-24 right-4 z-50 w-[calc(100vw-2rem)] max-w-[400px] md:bottom-6 md:right-6"
            >
              <div className="overflow-hidden rounded-[28px] border border-white/10 bg-black/85 text-foreground shadow-2xl shadow-black/45 backdrop-blur-2xl">
                <div className="flex items-center justify-between border-b border-white/8 bg-gradient-to-r from-primary/12 via-primary/6 to-transparent p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-orange-400 text-primary-foreground shadow-[0_0_24px_rgba(255,122,0,0.25)]">
                      <Compass className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">Atlas</h3>
                      <p className="text-xs text-muted-foreground">Suporte operacional do TravelPro</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
                    aria-label="Fechar Atlas"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="max-h-[70vh] space-y-4 overflow-y-auto p-4">
                  <div className="flex gap-3">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/18 text-primary">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="flex-1 rounded-2xl rounded-tl-sm border border-white/8 bg-white/[0.04] px-4 py-3">
                      <p className="text-sm leading-6 text-foreground">
                        Oi! Sou o Atlas. Estou focado em {context.label} e posso te orientar pelos fluxos reais do TravelPro sem inventar integrações.
                      </p>
                    </div>
                  </div>

                  {conversation.map((entry) =>
                    entry.role === "user" ? (
                      <div key={entry.id} className="flex justify-end">
                        <div className="max-w-[85%] rounded-2xl rounded-br-sm border border-primary/20 bg-primary/12 px-4 py-3 text-sm text-foreground">
                          {entry.text}
                        </div>
                      </div>
                    ) : entry.response ? (
                      <div key={entry.id} className="flex gap-3">
                        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/18 text-primary">
                          <Compass className="h-4 w-4" />
                        </div>
                        <div className="flex-1 rounded-2xl rounded-tl-sm border border-white/8 bg-white/[0.04] px-4 py-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium text-foreground">{entry.response.title}</p>
                            <span
                              className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.16em] ${
                                entry.response.status === "future"
                                  ? "border-amber-400/20 bg-amber-400/10 text-amber-200"
                                  : entry.response.status === "context"
                                    ? "border-sky-400/20 bg-sky-400/10 text-sky-200"
                                    : "border-green-400/20 bg-green-400/10 text-green-200"
                              }`}
                            >
                              {entry.response.status === "future" ? "Em breve" : entry.response.status === "context" ? "Contexto" : "Operacional"}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">{entry.response.summary}</p>
                          <div className="mt-3 space-y-2">
                            {entry.response.bullets.slice(0, 3).map((bullet) => (
                              <p key={bullet} className="text-sm leading-6 text-muted-foreground">
                                • {bullet}
                              </p>
                            ))}
                          </div>
                          {entry.response.nextSteps.length > 0 ? (
                            <div className="mt-3 rounded-2xl border border-white/8 bg-black/20 px-3 py-2.5">
                              <p className="text-[11px] uppercase tracking-[0.16em] text-primary/75">Próximo passo</p>
                              <p className="mt-1 text-sm text-muted-foreground">{entry.response.nextSteps[0]}</p>
                            </div>
                          ) : null}
                          {entry.response.route ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Button
                                type="button"
                                size="sm"
                                className="rounded-full"
                                onClick={() => {
                                  router.push(entry.response?.route ?? context.route)
                                  setIsOpen(false)
                                }}
                              >
                                <ArrowUpRight className="h-3.5 w-3.5" />
                                {entry.response.routeLabel ?? "Abrir módulo"}
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ) : null,
                  )}

                  <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-primary/75">Leitura da tela atual</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{context.summary}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {quickRoutes.map((item) => (
                        <Button
                          key={item.href}
                          type="button"
                          size="sm"
                          variant="outline"
                          className="rounded-full border-white/10 bg-white/[0.03]"
                          onClick={() => {
                            router.push(item.href)
                            setIsOpen(false)
                          }}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          {item.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.18em] text-primary/75">Sugestões rápidas</p>
                    <div className="space-y-2">
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => submitQuestion(suggestion)}
                          className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-left text-sm text-foreground transition-all hover:border-primary/20 hover:bg-primary/[0.06]"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>

                  {topQuestions.length > 0 ? (
                    <div>
                      <p className="mb-2 text-xs uppercase tracking-[0.18em] text-primary/75">Mais consultadas</p>
                      <div className="flex flex-wrap gap-2">
                        {topQuestions.map((question) => (
                          <button
                            key={question}
                            type="button"
                            onClick={() => submitQuestion(question)}
                            className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-2 text-xs text-muted-foreground transition-all hover:border-primary/20 hover:text-foreground"
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="border-t border-white/8 p-4">
                  <div className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                    <input
                      type="text"
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder={`Pergunte sobre ${context.label.toLowerCase()}...`}
                      className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault()
                          submitQuestion(message)
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => submitQuestion(message)}
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

export function TravelProAtlasAssistant({ portal }: { portal: AtlasPortal }) {
  return <AgencyAtlasAssistant portal={portal} />
}
