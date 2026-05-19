"use client"

import { motion } from "framer-motion"
import { 
  FileText, 
  Palette, 
  Sparkles,
  Download,
  PenTool,
  Check
} from "lucide-react"

const documentTypes = [
  { name: "Contratos", icon: FileText },
  { name: "Roteiros", icon: PenTool },
  { name: "Vouchers", icon: Check },
  { name: "Cotações", icon: FileText },
]

export default function DocumentsSection() {
  return (
    <section id="documentos" className="relative py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />
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
              Documentos profissionais em{" "}
              <span className="gradient-text">segundos</span>.
            </h2>

            <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-lg">
              Templates inteligentes personalizados com sua identidade visual. IA gera textos, você aprova e envia.
            </p>

            {/* Document Types */}
            <div className="flex flex-wrap gap-3 mb-10">
              {documentTypes.map((doc, index) => (
                <motion.div
                  key={doc.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-white/5"
                >
                  <doc.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm text-foreground">{doc.name}</span>
                </motion.div>
              ))}
            </div>

            {/* Features - Mais clean */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-white/5">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">IA + Branding</h4>
                  <p className="text-sm text-muted-foreground">Geração automática com sua marca</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-white/5">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Palette className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Edição livre</h4>
                  <p className="text-sm text-muted-foreground">Personalize antes de enviar</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative">
              {/* Main Document Card */}
              <div className="glass-card rounded-2xl p-6 glow-orange-subtle">
                {/* Document Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Contrato de Viagem</p>
                      <p className="text-xs text-muted-foreground">Premium Template</p>
                    </div>
                  </div>
                  <button className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                    <Download className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Document Preview */}
                <div className="bg-white rounded-xl p-6 mb-4">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-24 h-8 bg-gradient-to-r from-primary to-orange-400 rounded" />
                    <div className="text-right">
                      <div className="w-32 h-3 bg-gray-200 rounded mb-1" />
                      <div className="w-24 h-2 bg-gray-100 rounded" />
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="w-full h-2 bg-gray-100 rounded" />
                    <div className="w-4/5 h-2 bg-gray-100 rounded" />
                    <div className="w-3/4 h-2 bg-gray-100 rounded" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="w-16 h-2 bg-gray-200 rounded mb-2" />
                      <div className="w-24 h-3 bg-gray-300 rounded" />
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="w-16 h-2 bg-gray-200 rounded mb-2" />
                      <div className="w-20 h-3 bg-gray-300 rounded" />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="w-32 h-8 bg-gradient-to-r from-primary/20 to-orange-400/20 rounded mx-auto" />
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-xs text-muted-foreground">Pronto para envio</span>
                  </div>
                  <span className="text-xs text-primary">Gerado com IA</span>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="absolute -left-4 top-20 animate-float"
              >
                <div className="glass-card rounded-xl px-4 py-3 flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-foreground">Branding aplicado</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
