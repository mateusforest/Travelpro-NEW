"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Mail } from "lucide-react"
import { TravelProLogo } from "@/components/branding/travelpro-logo"
import { toast } from "@/components/ui/use-toast"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const supabase = getSupabaseBrowserClient()
      const redirectTo = process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/login` : undefined

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      })

      if (error) throw error

      toast({
        title: "Instruções enviadas",
        description: "Se o e-mail existir, o fluxo de recuperação foi disparado com sucesso.",
      })
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Falha ao enviar instruções."
      toast({
        title: "Não foi possível enviar",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex min-w-fit">
            <TravelProLogo variant="auth" priority className="h-[50px] sm:h-[54px]" />
          </Link>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-secondary/20 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Recuperar senha</h1>
            <p className="text-muted-foreground">
              Informe seu e-mail para continuar o fluxo quando o backend for conectado.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all duration-300 glow-orange flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                />
              ) : (
                <>
                  Enviar instruções
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline">
              Voltar para o login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
