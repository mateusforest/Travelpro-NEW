"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Bot, Check, Compass, Megaphone, Sparkles, Workflow, X } from "lucide-react"

const modules = [
  {
    id: "agent",
    title: "TravelPro Agent",
    subtitle: "Atendimento Inteligente",
    icon: Bot,
    description: "IA que atende, qualifica e agenda automaticamente.",
    features: ["Atendimento 24/7", "Qualificação de leads", "Follow-up inteligente"],
    preview: "Lead qualificado, conversa em andamento e próximo passo sugerido em uma única trilha.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "marketing",
    title: "Marketing IA",
    subtitle: "Campanhas Automatizadas",
    icon: Megaphone,
    description: "Crie campanhas, posts e ideias com inteligência aplicada ao turismo.",
    features: ["Posts para Instagram", "Calendário promocional", "Segmentação de clientes"],
    preview: "Calendário vivo com peças, legendas e oportunidades prontas para publicar.",
    color: "from-fuchsia-500 to-pink-500",
  },
  {
    id: "atlas",
    title: "Atlas Advisor",
    subtitle: "Consultoria Operacional",
    icon: Compass,
    description: "Orientação inteligente para vendas, operação e crescimento da agência.",
    features: ["Orientação comercial", "Scripts de atendimento", "Apoio em situações difíceis", "Suporte estratégico", "Ajuda para organizar e escalar a agência"],
    preview: "Leituras estratégicas, scripts prontos e apoio operacional em momentos críticos.",
    color: "from-amber-500 to-orange-500",
  },
  {
    id: "automations",
    title: "Automações Premium",
    subtitle: "Fluxos Avançados",
    icon: Workflow,
    description: "Automatize processos com jornadas e gatilhos de alto valor.",
    features: ["Fluxos multi-etapas", "Gatilhos condicionais", "Integração com CRM"],
    preview: "Rotinas conectadas com o operacional para economizar tempo sem perder controle.",
    color: "from-green-500 to-emerald-500",
  },
]

export default function ExpansionsSection() {
  const [expandedModule, setExpandedModule] = useState<string | null>(null)

  return (
    <section id="expansoes" className="relative overflow-hidden py-28">
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-[180px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-6 text-3xl font-bold md:text-4xl lg:text-5xl">
            Expanda sua <span className="gradient-text">operação</span>.
          </h2>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Módulos avançados para levar sua agência ao próximo nível.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {modules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <button onClick={() => setExpandedModule(module.id)} className="group w-full text-left">
                <div className="glass-card h-full rounded-2xl border border-white/5 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${module.color}`}>
                    <module.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mb-1 text-lg font-bold text-foreground">{module.title}</h3>
                  <p className="mb-3 text-sm text-primary">{module.subtitle}</p>
                  <p className="mb-4 text-sm text-muted-foreground">{module.description}</p>
                  <div className="flex items-center text-sm text-muted-foreground transition-colors group-hover:text-primary">
                    <span>Explorar</span>
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {expandedModule ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => setExpandedModule(null)}
            >
              <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 280 }}
                onClick={(event) => event.stopPropagation()}
                className="relative w-full max-w-3xl rounded-[32px] border border-white/10 bg-black/85 p-8 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl"
              >
                {(() => {
                  const module = modules.find((item) => item.id === expandedModule)!

                  return (
                    <>
                      <button onClick={() => setExpandedModule(null)} className="absolute right-4 top-4 rounded-full p-2 transition-colors hover:bg-white/10">
                        <X className="h-5 w-5 text-muted-foreground" />
                      </button>

                      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                        <div>
                          <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${module.color}`}>
                            <module.icon className="h-7 w-7 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold">{module.title}</h3>
                          <p className="mt-1 font-medium text-primary">{module.subtitle}</p>
                          <p className="mt-4 text-sm leading-7 text-muted-foreground">{module.description}</p>

                          <div className="mt-6 space-y-3">
                            {module.features.map((feature) => (
                              <div key={feature} className="flex items-center gap-3">
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20">
                                  <Check className="h-3 w-3 text-primary" />
                                </div>
                                <span className="text-sm text-foreground">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                          <div className="mb-4 flex items-center justify-between">
                            <p className="text-xs uppercase tracking-[0.24em] text-primary/80">Preview</p>
                            <Sparkles className="h-4 w-4 text-primary" />
                          </div>
                          <div className="rounded-[24px] border border-white/8 bg-gradient-to-br from-white/[0.06] to-transparent p-5">
                            <p className="text-sm font-medium text-foreground">Benefício operacional</p>
                            <p className="mt-3 text-sm leading-7 text-muted-foreground">{module.preview}</p>
                          </div>
                          <button className="mt-5 w-full rounded-full border border-primary/30 bg-primary/10 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/20">
                            Conhecer módulo
                          </button>
                        </div>
                      </div>
                    </>
                  )
                })()}
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  )
}
