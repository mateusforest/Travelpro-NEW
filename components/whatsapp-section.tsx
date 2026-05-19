"use client"

import { motion } from "framer-motion"
import {
  FileText,
  Calculator,
  CheckCircle2,
  Users,
  Clock,
  MessageSquare,
  Sparkles,
} from "lucide-react"

const conversation = [
  {
    user: "Criar roteiro para João em Gramado",
    reply: "Roteiro criado e salvo no sistema.",
    icon: FileText,
  },
  {
    user: "Gerar contrato da viagem da Ana",
    reply: "Contrato criado com a identidade da agência.",
    icon: CheckCircle2,
  },
  {
    user: "Criar pacote para Cancún e publicar no catálogo",
    reply: "Pacote publicado e pronto para compartilhar.",
    icon: Sparkles,
  },
]

const features = [
  { icon: FileText, text: "Cria roteiros e contratos" },
  { icon: Calculator, text: "Gera cotações" },
  { icon: Users, text: "Sincroniza com portal" },
  { icon: Clock, text: "Alertas inteligentes" },
  { icon: CheckCircle2, text: "Tarefas operacionais" },
  { icon: MessageSquare, text: "Orienta sua equipe" },
]

export default function WhatsAppSection() {
  return (
    <section id="whatsapp" className="relative py-28 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1200 600">
          <defs>
            <linearGradient id="lineGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0" />
              <stop offset="50%" stopColor="#f97316" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,300 Q300,100 600,300 T1200,250"
            stroke="url(#lineGradient2)"
            strokeWidth="1.5"
            fill="none"
            className="flow-line"
          />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative mx-auto max-w-xs">
              <div className="relative bg-[#1a1a1a] rounded-[3rem] p-3 border border-white/10 glow-orange-subtle">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#1a1a1a] rounded-b-xl" />
                <div className="bg-[#0a0a0a] rounded-[2.5rem] overflow-hidden">
                  <div className="p-4 min-h-[480px]">
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">TravelPro Go</p>
                        <p className="text-xs text-green-500">online</p>
                      </div>
                    </div>

                    <div className="space-y-3.5">
                      {conversation.map((item, index) => (
                        <motion.div
                          key={item.user}
                          initial={{ opacity: 0, y: 12 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.12 }}
                          className="space-y-2"
                        >
                          <div className="flex justify-end">
                            <div className="max-w-[82%] rounded-2xl rounded-br-sm bg-primary/20 px-3 py-2.5">
                              <p className="text-[11px] leading-relaxed text-foreground">{item.user}</p>
                            </div>
                          </div>
                          <div className="flex justify-start">
                            <div className="max-w-[84%] rounded-2xl rounded-bl-sm bg-secondary px-3 py-2.5">
                              <div className="flex items-start gap-2">
                                <item.icon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
                                <p className="text-[11px] leading-relaxed text-foreground">{item.reply}</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Tudo começa em uma <span className="gradient-text">mensagem</span>.
            </h2>

            <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-lg">
              O TravelPro Go conecta sua agência ao sistema inteiro via WhatsApp. Organize operações,
              execute tarefas e acompanhe tudo em tempo real.
            </p>

            <div className="grid sm:grid-cols-2 gap-3 mb-10">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-white/5 hover:border-primary/20 transition-colors"
                >
                  <feature.icon className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">{feature.text}</span>
                </motion.div>
              ))}
            </div>

            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
              <p className="text-sm text-foreground/90">
                Tudo sincronizado com dashboard, portal do cliente e{" "}
                <span className="text-primary font-medium">insights inteligentes</span>.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
