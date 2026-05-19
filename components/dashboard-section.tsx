"use client"

import { motion } from "framer-motion"
import { 
  Users, 
  Plane, 
  Clock,
  Bell,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Calendar,
  DollarSign,
  MessageSquare
} from "lucide-react"

const operations = [
  { client: "Lucas Silva", status: "Em viagem", destination: "Cancún", color: "green" },
  { client: "Ana Costa", status: "Aguardando", destination: "Paris", color: "yellow" },
  { client: "Maria Santos", status: "Confirmado", destination: "Orlando", color: "blue" },
]

const tasks = [
  { text: "Enviar contrato - João", priority: "high" },
  { text: "Follow-up - Marina", priority: "medium" },
  { text: "Confirmar voo - Pedro", priority: "low" },
]

const alerts = [
  { text: "5 clientes aguardando retorno", type: "warning" },
  { text: "2 viagens iniciam amanhã", type: "info" },
]

export default function DashboardSection() {
  return (
    <section id="dashboard" className="relative py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1200 600">
          <defs>
            <linearGradient id="dashGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0" />
              <stop offset="50%" stopColor="#f97316" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,350 Q400,150 800,350 T1200,300"
            stroke="url(#dashGradient)"
            strokeWidth="1.5"
            fill="none"
            className="flow-line"
          />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Sua agência funcionando em{" "}
            <span className="gradient-text">tempo real</span>.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Operações, tarefas, clientes, viagens e automações organizados em uma central inteligente.
          </p>
        </motion.div>

        {/* Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          {/* Browser Frame */}
          <div className="glass-card rounded-2xl p-1 glow-orange-subtle shadow-2xl shadow-black/20">
            {/* Browser Bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 bg-secondary/50 rounded-md text-xs text-muted-foreground">
                  app.travelpro.com/dashboard
                </div>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="p-6 bg-[#0a0a0a] rounded-b-xl min-h-[500px]">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Stats & Operations */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { label: "Viagens Ativas", value: "12", icon: Plane, color: "primary" },
                      { label: "Clientes", value: "48", icon: Users, color: "blue" },
                      { label: "Pendentes", value: "5", icon: Clock, color: "yellow" },
                      { label: "Receita", value: "R$ 85k", icon: DollarSign, color: "green" },
                    ].map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-xl bg-secondary/30 border border-white/5"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <stat.icon className={`w-4 h-4 ${
                            stat.color === "primary" ? "text-primary" :
                            stat.color === "blue" ? "text-blue-500" :
                            stat.color === "yellow" ? "text-yellow-500" :
                            "text-green-500"
                          }`} />
                          <TrendingUp className="w-3 h-3 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Operations Table */}
                  <div className="p-4 rounded-xl bg-secondary/20 border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-foreground">Operações em Andamento</h3>
                      <span className="text-xs text-muted-foreground">Última atualização: agora</span>
                    </div>
                    <div className="space-y-2">
                      {operations.map((op, index) => (
                        <motion.div
                          key={op.client}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-[#0d0d0d] border border-white/5"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-foreground">
                              {op.client.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{op.client}</p>
                              <p className="text-xs text-muted-foreground">{op.destination}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${
                            op.color === "green" ? "bg-green-500/20 text-green-500" :
                            op.color === "yellow" ? "bg-yellow-500/20 text-yellow-500" :
                            "bg-blue-500/20 text-blue-500"
                          }`}>
                            {op.status}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* IA Suggestion */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    className="p-4 rounded-xl bg-primary/5 border border-primary/20"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-primary mb-1">Sugestão da IA</p>
                        <p className="text-sm text-foreground/90">
                          5 clientes que viajaram para Europa no último ano ainda não foram contatados para renovação.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Right Column - Tasks & Alerts */}
                <div className="space-y-6">
                  {/* Tasks */}
                  <div className="p-4 rounded-xl bg-secondary/20 border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-foreground">Tarefas do Dia</h3>
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      {tasks.map((task, index) => (
                        <motion.div
                          key={task.text}
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer"
                        >
                          <div className={`w-2 h-2 rounded-full ${
                            task.priority === "high" ? "bg-red-500" :
                            task.priority === "medium" ? "bg-yellow-500" :
                            "bg-green-500"
                          }`} />
                          <span className="text-xs text-foreground flex-1">{task.text}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground hover:text-green-500 transition-colors" />
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Alerts */}
                  <div className="p-4 rounded-xl bg-secondary/20 border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-foreground">Alertas</h3>
                      <Bell className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      {alerts.map((alert, index) => (
                        <motion.div
                          key={alert.text}
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          className={`flex items-center gap-2 p-2 rounded-lg ${
                            alert.type === "warning" ? "bg-yellow-500/10" : "bg-blue-500/10"
                          }`}
                        >
                          <AlertCircle className={`w-3.5 h-3.5 ${
                            alert.type === "warning" ? "text-yellow-500" : "text-blue-500"
                          }`} />
                          <span className="text-xs text-foreground">{alert.text}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="p-4 rounded-xl bg-secondary/20 border border-white/5">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Ações Rápidas</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { icon: Users, label: "Novo Cliente" },
                        { icon: Plane, label: "Nova Viagem" },
                        { icon: MessageSquare, label: "Mensagem" },
                        { icon: Calendar, label: "Agendar" },
                      ].map((action) => (
                        <button
                          key={action.label}
                          className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-[#0d0d0d] hover:bg-primary/10 hover:border-primary/20 border border-white/5 transition-all"
                        >
                          <action.icon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="absolute -right-4 top-20 animate-float hidden lg:block"
          >
            <div className="glass-card rounded-xl px-4 py-3 flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-xs font-medium text-foreground">Vendas +23%</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
