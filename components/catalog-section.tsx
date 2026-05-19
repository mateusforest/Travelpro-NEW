"use client"

import { motion } from "framer-motion"
import { 
  Share2, 
  BarChart2, 
  Instagram,
  MessageCircle,
  Heart,
  Eye,
  ExternalLink
} from "lucide-react"

const catalogItems = [
  {
    title: "Cancún All Inclusive",
    price: "R$ 8.990",
    views: 234,
    leads: 12,
    image: "🏝️"
  },
  {
    title: "Europa 15 dias",
    price: "R$ 15.500",
    views: 189,
    leads: 8,
    image: "🗼"
  },
  {
    title: "Maldivas Premium",
    price: "R$ 32.000",
    views: 156,
    leads: 5,
    image: "🌊"
  }
]

export default function CatalogSection() {
  return (
    <section id="catalogo" className="relative py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1200 600">
          <defs>
            <linearGradient id="lineGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0" />
              <stop offset="50%" stopColor="#f97316" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,400 Q400,200 800,350 T1200,300"
            stroke="url(#lineGradient3)"
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
            className="relative"
          >
            <div className="relative mx-auto max-w-sm">
              {/* Phone Frame */}
              <div className="relative bg-[#1a1a1a] rounded-[3rem] p-3 border border-white/10 glow-orange-subtle">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#1a1a1a] rounded-b-xl" />
                <div className="bg-[#0a0a0a] rounded-[2.5rem] overflow-hidden">
                  <div className="p-4 min-h-[480px]">
                    {/* Catalog Header */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-orange-400" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">Viagens Premium</p>
                          <p className="text-xs text-muted-foreground">@viagenspremium</p>
                        </div>
                      </div>
                      <button className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                        WhatsApp
                      </button>
                    </div>

                    {/* Catalog Items */}
                    <div className="space-y-3">
                      {catalogItems.map((item, index) => (
                        <motion.div
                          key={item.title}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.15, duration: 0.5 }}
                          className="bg-secondary/50 rounded-xl p-3 border border-white/5"
                        >
                          <div className="flex gap-3">
                            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/20 to-orange-400/20 flex items-center justify-center text-xl">
                              {item.image}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-foreground mb-0.5">{item.title}</p>
                              <p className="text-primary font-bold text-sm">{item.price}</p>
                              <div className="flex items-center gap-3 mt-1.5">
                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <Eye className="w-3 h-3" /> {item.views}
                                </span>
                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <Heart className="w-3 h-3" /> {item.leads}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* URL Bar */}
                    <div className="mt-4 p-3 rounded-xl bg-secondary/30 border border-white/5">
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-primary" />
                        <span className="text-xs text-muted-foreground">travelpro.app/</span>
                        <span className="text-xs text-primary font-medium">viagenspremium</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Analytics Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="absolute -right-4 top-24 animate-float"
              >
                <div className="glass-card rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart2 className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground">Analytics</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">+47%</p>
                  <p className="text-[10px] text-muted-foreground">visitas</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right - Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Seu catálogo online.{" "}
              <span className="gradient-text">Sempre atualizado</span>.
            </h2>

            <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-lg">
              Pacotes publicados automaticamente, prontos para compartilhar via WhatsApp ou Instagram.
            </p>

            {/* Features - Grid clean */}
            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              <div className="p-4 rounded-xl bg-secondary/30 border border-white/5">
                <BarChart2 className="w-5 h-5 text-primary mb-3" />
                <h4 className="text-sm font-semibold text-foreground mb-1">Analytics</h4>
                <p className="text-sm text-muted-foreground">Acompanhe visitas e leads em tempo real</p>
              </div>

              <div className="p-4 rounded-xl bg-secondary/30 border border-white/5">
                <Share2 className="w-5 h-5 text-primary mb-3" />
                <h4 className="text-sm font-semibold text-foreground mb-1">Compartilhamento</h4>
                <p className="text-sm text-muted-foreground">Link único para bio e campanhas</p>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Integrado com:</span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Instagram className="w-5 h-5 text-white" />
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
