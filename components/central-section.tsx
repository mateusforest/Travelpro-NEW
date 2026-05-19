"use client"

import { motion } from "framer-motion"
import { 
  Clock, 
  AlertCircle, 
  CheckCircle2,
  Calendar,
  Plane,
  Users
} from "lucide-react"

const kanbanColumns = [
  {
    title: "Pendências",
    color: "border-yellow-500/50",
    items: [
      { icon: AlertCircle, text: "Contrato - Lucas", type: "urgent" },
      { icon: Clock, text: "Retorno - Maria", type: "normal" },
    ]
  },
  {
    title: "Em Andamento",
    color: "border-blue-500/50",
    items: [
      { icon: Plane, text: "Viagem Cancún", type: "normal" },
      { icon: Users, text: "Grupo Europa", type: "normal" },
    ]
  },
  {
    title: "Concluído",
    color: "border-green-500/50",
    items: [
      { icon: CheckCircle2, text: "Voucher enviado", type: "done" },
      { icon: CheckCircle2, text: "Pagamento ok", type: "done" },
    ]
  }
]

export default function CentralSection() {
  return (
    <section id="central" className="relative py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Operação organizada em{" "}
              <span className="gradient-text">tempo real</span>.
            </h2>

            <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-lg">
              Central operacional que organiza follow-ups, viagens, tarefas e pendências. Tudo sincronizado.
            </p>

            {/* Features - Clean */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-white/5">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Gestão Visual</h4>
                  <p className="text-sm text-muted-foreground">Kanban moderno para sua operação</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-white/5">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Alertas Inteligentes</h4>
                  <p className="text-sm text-muted-foreground">Notificações sobre prazos</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right - Kanban Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="glass-card rounded-2xl p-6 glow-orange-subtle">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Central Operacional</h3>
                  <p className="text-xs text-muted-foreground">Semana atual</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-muted-foreground">Sincronizado</span>
                </div>
              </div>

              {/* Kanban Columns */}
              <div className="grid grid-cols-3 gap-4">
                {kanbanColumns.map((column, colIndex) => (
                  <motion.div
                    key={column.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: colIndex * 0.1, duration: 0.5 }}
                    className={`rounded-xl border-t-2 ${column.color} bg-secondary/30 p-3`}
                  >
                    <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center justify-between">
                      {column.title}
                      <span className="text-muted-foreground">{column.items.length}</span>
                    </h4>
                    <div className="space-y-2">
                      {column.items.map((item, itemIndex) => (
                        <motion.div
                          key={item.text}
                          initial={{ opacity: 0, scale: 0.9 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + itemIndex * 0.1, duration: 0.4 }}
                          className={`p-2 rounded-lg bg-[#0d0d0d] border border-white/5 ${
                            item.type === "urgent" ? "border-l-2 border-l-yellow-500" : ""
                          } ${
                            item.type === "done" ? "opacity-60" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <item.icon className={`w-3 h-3 ${
                              item.type === "urgent" ? "text-yellow-500" :
                              item.type === "done" ? "text-green-500" :
                              "text-muted-foreground"
                            }`} />
                            <span className="text-[10px] text-foreground truncate">{item.text}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
