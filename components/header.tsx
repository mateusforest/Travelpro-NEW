"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { TravelProLogo } from "@/components/branding/travelpro-logo"

const navItems = [
  { label: "WhatsApp Operacional", href: "#whatsapp" },
  { label: "Documentos Inteligentes", href: "#documentos" },
  { label: "Catálogo", href: "#catalogo" },
  { label: "Expansões", href: "#expansoes" },
  { label: "Central Operacional", href: "#central" },
  { label: "Insights", href: "#insights" },
  { label: "Portal Cliente", href: "#portal" },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "border-b border-white/5 bg-background/60 shadow-lg shadow-black/5 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          <Link href="/" className="group flex min-w-fit shrink-0 items-center">
            <TravelProLogo variant="header" priority className="transition-transform duration-300 group-hover:scale-[1.02]" />
          </Link>

          <nav className="hidden items-center gap-6 xl:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm text-muted-foreground/80 transition-colors duration-300 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden shrink-0 items-center gap-4 md:flex">
            <Link href="/login" className="text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground">
              Entrar
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all duration-300 hover:bg-primary/90"
            >
              Quero conhecer
            </Link>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-foreground md:hidden" aria-label="Toggle menu">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="border-t border-white/5 bg-background/95 backdrop-blur-xl md:hidden"
        >
          <nav className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-4 py-3 text-foreground transition-colors hover:bg-primary/5 hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-full border border-border px-5 py-3 text-center text-sm font-medium text-foreground hover:border-primary/50"
              >
                Entrar
              </Link>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="rounded-full bg-primary px-5 py-3 text-center text-sm font-medium text-primary-foreground">
                Quero conhecer
              </Link>
            </div>
          </nav>
        </motion.div>
      )}
    </motion.header>
  )
}
