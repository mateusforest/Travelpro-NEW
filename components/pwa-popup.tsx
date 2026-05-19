"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Download, X, Smartphone } from "lucide-react"

export default function PWAPopup() {
  const [isVisible, setIsVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Show popup after 5 seconds of scrolling
    const timer = setTimeout(() => {
      if (!dismissed) {
        setIsVisible(true)
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [dismissed])

  const handleDismiss = () => {
    setDismissed(true)
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className="glass-card rounded-2xl p-4 max-w-[280px] border border-white/10 shadow-2xl shadow-black/20">
            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Content */}
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 pr-4">
                <h4 className="text-sm font-semibold text-foreground mb-1">
                  Instalar TravelPro
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Acesse sua agência de qualquer lugar com o app.
                </p>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-xs font-medium hover:bg-primary/90 transition-colors">
                  <Download className="w-3.5 h-3.5" />
                  Instalar
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
