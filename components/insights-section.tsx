"use client"

import { motion } from "framer-motion"
import { 
  TrendingUp, 
  Users, 
  Plane,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from "lucide-react"

const insights = [
  {
    title: "Leads internacionais",
    value: "+28%",
    trend: "up",
    icon: Users
  },
  {
    title: "Viagens premium",
    value: "+15%",
    trend: "up",
    icon: Plane
  },
  {
    title: "Tempo de resposta",
    value: "-42%",
    trend: "down",
    icon: Clock
  }
]

const alerts = [
  { text: "5 clientes aguardando retorno", type: "warning" },
  { text: "3 viagens confirmadas esta semana", type: "success" },
]

export default function InsightsSection() {
  return (
    <section id="insights" className="relative py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1200 600">
          <defs>
            <linearGradient id="lineGradient4" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0" />
              <stop offset="50%" stopColor="#f97316" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,200 Q300,400 600,200 T1200,300"
            stroke="url(#lineGradient4)"
            strokeWidth="1.5"
            fill="none"
            className="flow-line"
          />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Left - Visual */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative order-2 lg:order-1"
          >
            {/* Main Dashboard Card */}
            <div className="glass-card rounded-2xl p-6 glow-orange-subtle">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Insights Operacionais</h3>
                  <p className="text-xs text-muted-foreground">Análise da sua agência</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs text-primary font-medium">IA</span>
                </div>
              </div>

              {/* Insights Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {insights.map((insight, index) => (
                  <motion.div
                    key={insight.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="p-4 rounded-xl bg-secondary/50 border border-white/5"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <insight.icon className="w-4 h-4 text-muted-foreground" />
                      {insight.trend === "up" ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-2xl font-bold text-foreground mb-1">{insight.value}</p>
                    <p className="text-[10px] text-muted-foreground">{insight.title}</p>
                  </motion.div>
                ))}
              </div>

              {/* Alerts */}
              <div className="space-y-2">
                {alerts.map((alert, index) => (
                  <motion.div
                    key={alert.text}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      alert.type === "warning" ? "bg-yellow-500/10 border border-yellow-500/20" :
                      "bg-green-500/10 border border-green-500/20"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${
                      alert.type === "warning" ? "bg-yellow-500" : "bg-green-500"
                    }`} />
                    <span className="text-sm text-foreground">{alert.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Floating Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="absolute -right-4 -top-4 animate-float"
            >
              <div className="glass-card rounded-xl px-4 py-3 flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-xs font-medium text-foreground">Vendas +23%</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right - Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Insights{" "}
              <span className="gradient-text">inteligentes</span>
              <br />que guiam decisões.
            </h2>

            <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-lg">
              Análises vivas que identificam padrões, alertam oportunidades e orientam sua operação.
            </p>

            {/* Features - Mais clean */}
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 border border-white/5">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-1">Análise por IA</h4>
                  <p className="text-sm text-muted-foreground">Padrões identificados automaticamente</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 border border-white/5">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-1">Métricas operacionais</h4>
                  <p className="text-sm text-muted-foreground">Produtividade, vendas e follow-ups</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
