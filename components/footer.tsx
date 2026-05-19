"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Instagram, MessageCircle } from "lucide-react"
import { TravelProLogo } from "@/components/branding/travelpro-logo"

const footerLinks = [
  { label: "WhatsApp Operacional", href: "#whatsapp" },
  { label: "Documentos Inteligentes", href: "#documentos" },
  { label: "Catálogo", href: "#catalogo" },
  { label: "Expansões", href: "#expansoes" },
  { label: "Central Operacional", href: "#central" },
  { label: "Insights", href: "#insights" },
  { label: "Portal Cliente", href: "#portal" },
]

const legalLinks = [
  { label: "Termos", href: "/termos" },
  { label: "Privacidade", href: "/privacidade" },
]

export default function Footer() {
  return (
    <footer className="relative py-16 border-t border-white/5 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-primary/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:col-span-2"
          >
            <TravelProLogo variant="footer" className="mb-4" />
            <p className="text-sm text-muted-foreground max-w-xs">
              Transformando agências de viagens em operações inteligentes.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <h4 className="text-sm font-semibold text-foreground mb-4">Navegação</h4>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h4 className="text-sm font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} TravelPro</p>

          <div className="flex items-center gap-3">
            <Link
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </Link>
            <Link
              href="https://wa.me"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors"
              aria-label="WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
