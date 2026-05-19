"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Shield, Clock, Zap } from "lucide-react"

export default function CTASection() {
  return (
    <section id="comecar" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/8 rounded-full blur-[180px]" />

        <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 1200 600">
          <defs>
            <linearGradient id="lineGradientCTA" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0" />
              <stop offset="50%" stopColor="#f97316" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M-100,300 Q300,100 600,300 T1300,250"
            stroke="url(#lineGradientCTA)"
            strokeWidth="1.5"
            fill="none"
            className="flow-line"
          />
        </svg>
      </div>

      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Pronto para o <span className="gradient-text text-glow-orange">próximo nível</span>?
          </h2>

          <p className="text-xl text-muted-foreground mb-12 max-w-xl mx-auto">
            Menos operação manual. Mais velocidade e automação.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/cadastro"
                className="group flex items-center justify-center gap-2 rounded-full bg-primary px-10 py-4 text-lg font-semibold text-primary-foreground transition-all duration-300 glow-orange hover:bg-primary/90"
              >
                Preciso disso
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/login"
                className="block rounded-full border border-border px-10 py-4 text-lg font-semibold text-foreground transition-all duration-300 hover:border-primary/50 hover:bg-primary/5"
              >
                Quero conhecer
              </Link>
            </motion.div>
          </div>

          <div className="flex flex-wrap gap-8 justify-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm">Dados seguros</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm">Setup em 24h</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm">Suporte dedicado</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
