"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  FileText,
  Bell,
  CheckCircle2,
  Zap,
  BarChart3,
  MessageSquare,
  Send,
  Sparkles,
  Route,
  LayoutDashboard,
  Compass,
} from "lucide-react"

const interactiveChips = [
  {
    id: "roteiros",
    label: "Roteiros",
    icon: Route,
    messages: [
      { type: "user", text: "Criar roteiro para Gramado 5 dias" },
      { type: "bot", text: "Roteiro criado com hospedagem, passeios e restaurantes!" },
    ],
    notification: { text: "Roteiro salvo", icon: CheckCircle2, color: "green" },
  },
  {
    id: "contratos",
    label: "Contratos",
    icon: FileText,
    messages: [
      { type: "user", text: "Gerar contrato da viagem do Lucas" },
      { type: "bot", text: "Contrato gerado e enviado para assinatura digital." },
    ],
    notification: { text: "Contrato enviado", icon: FileText, color: "blue" },
  },
  {
    id: "catalogo",
    label: "Catálogo",
    icon: BarChart3,
    messages: [
      { type: "user", text: "Adicionar pacote Cancún ao catálogo" },
      { type: "bot", text: "Pacote publicado! 8 clientes interessados notificados." },
    ],
    notification: { text: "8 notificados", icon: Bell, color: "orange" },
  },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    messages: [
      { type: "user", text: "Resumo das vendas desta semana" },
      { type: "bot", text: "12 viagens fechadas, ticket médio R$ 8.500. +23% vs semana anterior." },
    ],
    notification: { text: "Vendas +23%", icon: Zap, color: "green" },
  },
  {
    id: "atlas",
    label: "Atlas",
    icon: Compass,
    messages: [
      { type: "user", text: "Como funciona o portal do cliente?" },
      { type: "bot", text: "O portal permite que seus clientes acompanhem a viagem em tempo real..." },
    ],
    notification: { text: "Atlas pronto", icon: Sparkles, color: "orange" },
  },
]

export default function HeroSection() {
  const [activeChip, setActiveChip] = useState("roteiros")
  const currentChip = interactiveChips.find((item) => item.id === activeChip) || interactiveChips[0]

  return (
    <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[150px] animate-pulse-glow" />
        <div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] animate-pulse-glow"
          style={{ animationDelay: "1.5s" }}
        />

        <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 1200 800">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0" />
              <stop offset="50%" stopColor="#f97316" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M-100,400 Q300,200 600,400 T1300,300"
            stroke="url(#lineGradient)"
            strokeWidth="1.5"
            fill="none"
            className="flow-line"
          />
          <path
            d="M-100,500 Q400,700 700,500 T1400,600"
            stroke="url(#lineGradient)"
            strokeWidth="1"
            fill="none"
            className="flow-line"
            style={{ animationDelay: "0.5s" }}
          />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-10"
            >
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              <span className="text-sm text-primary/90 font-medium">Plataforma para agências de viagens</span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-8">
              Transforme sua agência em uma{" "}
              <span className="gradient-text text-glow-orange">operação inteligente</span>.
            </h1>

            <p className="text-lg text-muted-foreground/90 leading-relaxed mb-12 max-w-lg mx-auto lg:mx-0">
              Gerencie clientes, viagens, documentos e automações em uma plataforma conectada ao
              WhatsApp e IA.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/cadastro"
                  className="block px-10 py-4 text-base font-semibold bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all duration-300 glow-orange text-center"
                >
                  Preciso disso
                </Link>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="relative mx-auto max-w-[380px]">
              <div className="relative bg-[#1a1a1a] rounded-[3.5rem] p-3.5 border border-white/10 glow-orange-subtle shadow-2xl shadow-primary/10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-7 bg-[#1a1a1a] rounded-b-2xl" />
                <div className="bg-[#0a0a0a] rounded-[3rem] overflow-hidden">
                  <div className="p-5 min-h-[540px] relative">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">TravelPro Go</p>
                        <p className="text-xs text-green-500">online</p>
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeChip}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                          className="flex justify-end"
                        >
                          <div className="bg-primary/20 rounded-2xl rounded-br-sm px-4 py-3 max-w-[85%]">
                            <p className="text-sm text-foreground">{currentChip.messages[0].text}</p>
                            <p className="text-[10px] text-muted-foreground mt-1.5 text-right">14:32</p>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                          className="flex justify-start"
                        >
                          <div className="bg-secondary rounded-2xl rounded-bl-sm px-4 py-3 max-w-[85%]">
                            <p className="text-sm text-foreground">{currentChip.messages[1].text}</p>
                            <p className="text-[10px] text-muted-foreground mt-1.5">14:32</p>
                          </div>
                        </motion.div>
                      </motion.div>
                    </AnimatePresence>

                    <div className="absolute bottom-5 left-5 right-5">
                      <div className="flex items-center gap-2 bg-secondary/80 rounded-full px-4 py-3.5">
                        <MessageSquare className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground flex-1">Digite um comando...</span>
                        <Send className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeChip}
                  initial={{ opacity: 0, scale: 0.8, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 20 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="absolute -right-4 top-24 animate-float"
                >
                  <div className="glass-card rounded-xl px-4 py-3 flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        currentChip.notification.color === "green"
                          ? "bg-green-500/20"
                          : currentChip.notification.color === "blue"
                            ? "bg-blue-500/20"
                            : "bg-primary/20"
                      }`}
                    >
                      <currentChip.notification.icon
                        className={`w-4 h-4 ${
                          currentChip.notification.color === "green"
                            ? "text-green-500"
                            : currentChip.notification.color === "blue"
                              ? "text-blue-500"
                              : "text-primary"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">{currentChip.notification.text}</p>
                      <p className="text-[10px] text-muted-foreground">Agora</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="flex flex-wrap justify-center gap-2 mt-8">
                {interactiveChips.map((chip) => (
                  <motion.button
                    key={chip.id}
                    onClick={() => setActiveChip(chip.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                      activeChip === chip.id
                        ? "bg-primary/20 border border-primary/40 text-primary"
                        : "bg-secondary/50 border border-white/5 text-muted-foreground hover:border-primary/20 hover:text-foreground"
                    }`}
                  >
                    <chip.icon className="w-3.5 h-3.5" />
                    <span>{chip.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
