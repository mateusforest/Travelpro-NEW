"use client"

import { motion } from "framer-motion"
import { 
  FileText, 
  Bell,
  Clock,
  Plane,
  MapPin,
  Calendar
} from "lucide-react"

export default function PortalSection() {
  return (
    <section id="portal" className="relative py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />
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
              Experiência{" "}
              <span className="gradient-text">premium</span>
              <br />para seus clientes.
            </h2>

            <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-lg">
              Portal exclusivo onde seus clientes acompanham a viagem e acessam documentos.
            </p>

            {/* Features - Grid clean */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-secondary/30 border border-white/5">
                <Clock className="w-5 h-5 text-primary mb-3" />
                <h4 className="text-sm font-semibold text-foreground mb-1">Countdown</h4>
                <p className="text-sm text-muted-foreground">Contagem para a viagem</p>
              </div>

              <div className="p-4 rounded-xl bg-secondary/30 border border-white/5">
                <FileText className="w-5 h-5 text-primary mb-3" />
                <h4 className="text-sm font-semibold text-foreground mb-1">Documentos</h4>
                <p className="text-sm text-muted-foreground">Roteiros e vouchers</p>
              </div>

              <div className="p-4 rounded-xl bg-secondary/30 border border-white/5">
                <Bell className="w-5 h-5 text-primary mb-3" />
                <h4 className="text-sm font-semibold text-foreground mb-1">Notificações</h4>
                <p className="text-sm text-muted-foreground">Alertas em tempo real</p>
              </div>

              <div className="p-4 rounded-xl bg-secondary/30 border border-white/5">
                <MapPin className="w-5 h-5 text-primary mb-3" />
                <h4 className="text-sm font-semibold text-foreground mb-1">Detalhes</h4>
                <p className="text-sm text-muted-foreground">Hotéis e transfers</p>
              </div>
            </div>
          </motion.div>

          {/* Right - Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative mx-auto max-w-xs">
              {/* Phone Frame */}
              <div className="relative bg-[#1a1a1a] rounded-[3rem] p-3 border border-white/10 glow-orange-subtle">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#1a1a1a] rounded-b-xl" />
                <div className="bg-[#0a0a0a] rounded-[2.5rem] overflow-hidden">
                  <div className="p-4 min-h-[480px]">
                    {/* Portal Header */}
                    <div className="text-center mb-6">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center mx-auto mb-3">
                        <Plane className="w-7 h-7 text-primary-foreground" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">Cancún</h3>
                      <p className="text-xs text-muted-foreground">Sua próxima aventura</p>
                    </div>

                    {/* Countdown */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="bg-secondary/50 rounded-xl p-4 mb-4 text-center"
                    >
                      <p className="text-xs text-muted-foreground mb-2">Faltam</p>
                      <div className="flex justify-center gap-4">
                        <div>
                          <p className="text-2xl font-bold text-primary">12</p>
                          <p className="text-[10px] text-muted-foreground">dias</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-primary">08</p>
                          <p className="text-[10px] text-muted-foreground">horas</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-primary">42</p>
                          <p className="text-[10px] text-muted-foreground">min</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Quick Info */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-secondary/50 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Calendar className="w-3 h-3 text-primary" />
                          <span className="text-[10px] text-muted-foreground">Check-in</span>
                        </div>
                        <p className="text-xs font-semibold text-foreground">15 Fev, 14h</p>
                      </div>
                      <div className="bg-secondary/50 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <MapPin className="w-3 h-3 text-primary" />
                          <span className="text-[10px] text-muted-foreground">Hotel</span>
                        </div>
                        <p className="text-xs font-semibold text-foreground">Hyatt Zilara</p>
                      </div>
                    </div>

                    {/* Documents */}
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground mb-2">Documentos</p>
                      {["Roteiro", "Voucher hotel", "Seguro"].map((doc) => (
                        <div key={doc} className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg border border-white/5">
                          <div className="flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-primary" />
                            <span className="text-xs text-foreground">{doc}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">PDF</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Notification */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="absolute -left-4 top-28 animate-float"
              >
                <div className="glass-card rounded-xl px-4 py-3 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  <span className="text-xs text-foreground">Docs prontos!</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
