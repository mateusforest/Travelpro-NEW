"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Compass, X, Send, Sparkles } from "lucide-react"

const suggestions = [
  "Como funciona o portal do cliente?",
  "Como criar um roteiro?",
  "Como gerar contratos?",
  "Configurar automações",
]

export default function AtlasAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2, duration: 0.4 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 transition-transform"
        aria-label="Abrir Atlas"
      >
        <Compass className="w-6 h-6 text-primary-foreground" />
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-6 left-6 z-50 w-[360px] max-h-[500px]"
            >
              <div className="glass-card rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/30">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-gradient-to-r from-primary/10 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center">
                      <Compass className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Atlas</h3>
                      <p className="text-xs text-muted-foreground">Assistente TravelPro</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    aria-label="Fechar"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 max-h-[350px] overflow-y-auto">
                  {/* Welcome Message */}
                  <div className="flex gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div className="bg-secondary/50 rounded-xl rounded-bl-sm px-4 py-3 flex-1">
                      <p className="text-sm text-foreground">
                        Oi! Sou o Atlas, seu assistente TravelPro. Como posso ajudar?
                      </p>
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground mb-2">Perguntas frequentes:</p>
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setMessage(suggestion)}
                        className="w-full text-left px-3 py-2.5 rounded-lg bg-secondary/30 border border-white/5 hover:border-primary/20 hover:bg-primary/5 transition-all text-sm text-foreground"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/5">
                  <div className="flex items-center gap-2 bg-secondary/50 rounded-xl px-4 py-3">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Digite sua dúvida..."
                      className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                    <button className="p-2 rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors">
                      <Send className="w-4 h-4 text-primary" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
