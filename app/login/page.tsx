"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ArrowRight, Plane, MapPin, BarChart3, Bell, Users } from "lucide-react"
import { TravelProLogo } from "@/components/branding/travelpro-logo"
import { toast } from "@/components/ui/use-toast"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

const rotatingPhrases = [
  "Sua agência conectada em tempo real.",
  "Tudo sincronizado. Tudo organizado.",
  "Transformando operações em experiências.",
  "O futuro operacional das agências.",
]

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % rotatingPhrases.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
      })

      const authPayload = (await response.json().catch(() => null)) as { redirectTo?: string; error?: string } | null

      if (!response.ok) {
        throw new Error(authPayload?.error || "Não foi possível carregar a sessão atual.")
      }

      const nextPath =
        typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("next") : null

      toast({
        title: "Login concluído",
        description: "Sua sessão foi iniciada com sucesso.",
      })

      router.push(nextPath && nextPath.startsWith("/") ? nextPath : authPayload?.redirectTo || "/login")
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Falha ao entrar."
      console.error("[login] failed", {
        email,
        message,
      })
      toast({
        title: "Não foi possível entrar",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0a0a0a]">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[150px] animate-pulse-glow" />
          <div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-[120px] animate-pulse-glow"
            style={{ animationDelay: "1.5s" }}
          />

          <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 600 800">
            <defs>
              <linearGradient id="loginLineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0" />
                <stop offset="50%" stopColor="#f97316" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M-50,200 Q150,400 300,200 T650,300"
              stroke="url(#loginLineGradient)"
              strokeWidth="2"
              fill="none"
              className="flow-line"
            />
            <path
              d="M-50,400 Q200,200 350,400 T700,350"
              stroke="url(#loginLineGradient)"
              strokeWidth="1.5"
              fill="none"
              className="flow-line"
              style={{ animationDelay: "1s" }}
            />
            <path
              d="M-50,600 Q250,500 400,600 T700,550"
              stroke="url(#loginLineGradient)"
              strokeWidth="1"
              fill="none"
              className="flow-line"
              style={{ animationDelay: "2s" }}
            />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/" className="inline-flex min-w-fit">
            <TravelProLogo variant="auth" priority />
          </Link>

          <div className="flex-1 flex items-center justify-center relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="absolute top-20 left-8 animate-float"
            >
              <div className="glass-card rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Plane className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">Viagem confirmada</p>
                  <p className="text-[10px] text-muted-foreground">Cancún - 5 dias</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="absolute top-40 right-8 animate-float"
              style={{ animationDelay: "1s" }}
            >
              <div className="glass-card rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">Novo lead</p>
                  <p className="text-[10px] text-muted-foreground">Europa - Premium</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="absolute bottom-32 left-16 animate-float"
              style={{ animationDelay: "2s" }}
            >
              <div className="glass-card rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">Vendas +28%</p>
                  <p className="text-[10px] text-muted-foreground">Esta semana</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="absolute bottom-48 right-12 animate-float"
              style={{ animationDelay: "1.5s" }}
            >
              <div className="glass-card rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Users className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">12 clientes ativos</p>
                  <p className="text-[10px] text-muted-foreground">Em viagem</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="w-48 h-48 rounded-full border border-primary/20 flex items-center justify-center"
            >
              <div className="w-32 h-32 rounded-full border border-primary/30 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
              </div>
            </motion.div>
          </div>

          <div className="h-16">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentPhraseIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-xl text-muted-foreground font-light"
              >
                {rotatingPhrases[currentPhraseIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 lg:hidden">
            <Link href="/" className="inline-flex min-w-fit">
              <TravelProLogo variant="auth" priority className="h-[52px] sm:h-[56px]" />
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">Bem-vindo de volta</h1>
          <p className="text-muted-foreground mb-8">Entre na sua conta para acessar o TravelPro</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-between gap-4 text-sm">
              <Link href="/cadastro" className="text-muted-foreground hover:text-foreground transition-colors">
                Criar conta
              </Link>
              <Link href="/recuperar-senha" className="text-primary hover:underline">
                Esqueceu a senha?
              </Link>
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
                  Entrar no TravelPro
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-muted-foreground">Novo no TravelPro?</span>
            </div>
          </div>

          <Link
            href="/cadastro"
            className="block w-full py-4 border border-border text-foreground rounded-xl font-semibold hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 text-center"
          >
            Criar conta
          </Link>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            <Link href="/" className="text-primary hover:underline">
              Voltar para o site
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
