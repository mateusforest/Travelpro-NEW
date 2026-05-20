"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ArrowRight, Plane, MapPin, BarChart3, Bell, Users } from "lucide-react"
import { TravelProLogo } from "@/components/branding/travelpro-logo"
import { toast } from "@/components/ui/use-toast"
import { AUTH_ROLES } from "@/lib/permissions/roles"
import { getSupabaseBrowserClient, getSupabasePublicEnvStatus } from "@/lib/supabase/client"

const rotatingPhrases = [
  "Sua agência conectada em tempo real.",
  "Tudo sincronizado. Tudo organizado.",
  "Transformando operações em experiências.",
  "O futuro operacional das agências.",
]

function getSafeAuthRedirectUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!appUrl) return undefined

  try {
    return new URL("/login", appUrl).toString()
  } catch {
    throw new Error("NEXT_PUBLIC_APP_URL está inválida. Use a URL base completa, por exemplo https://app.exemplo.com.")
  }
}

export default function CadastroPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [agencyName, setAgencyName] = useState("")
  const [ownerName, setOwnerName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [envError, setEnvError] = useState<string | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % rotatingPhrases.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const envStatus = getSupabasePublicEnvStatus()
    if (!envStatus.ok) {
      setEnvError(envStatus.message)
      console.error("[signup] supabase env invalid", {
        hasPublicUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
        hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        message: envStatus.message,
      })
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (password !== confirmPassword) {
      toast({
        title: "Senhas diferentes",
        description: "Confirme a mesma senha nos dois campos.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const envStatus = getSupabasePublicEnvStatus()
      if (!envStatus.ok) {
        setEnvError(envStatus.message)
        throw new Error(envStatus.message)
      }

      const supabase = getSupabaseBrowserClient()
      const emailRedirectTo = getSafeAuthRedirectUrl()

      console.info("[signup] attempting signUp", {
        email,
        role: AUTH_ROLES.AGENCY_ADMIN,
        hasAgencyName: Boolean(agencyName),
        hasRedirectTo: Boolean(emailRedirectTo),
      })

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo,
          data: {
            full_name: ownerName,
            phone,
            agency_name: agencyName,
            role: AUTH_ROLES.AGENCY_ADMIN,
          },
        },
      })

      if (error) throw error
      if (!data.user) {
        throw new Error("O Supabase não retornou o usuário criado. Revise as configurações de Auth.")
      }

      console.info("[signup] signUp result", {
        hasUser: Boolean(data.user),
        hasSession: Boolean(data.session),
        userId: data.user.id,
      })

      if (data.session) {
        const bootstrapResponse = await fetch("/api/auth/bootstrap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            fullName: ownerName,
            phone,
            agencyName,
            role: AUTH_ROLES.AGENCY_ADMIN,
          }),
        })

        const bootstrapPayload = (await bootstrapResponse.json().catch(() => null)) as
          | { error?: string }
          | { bootstrapped?: boolean }
          | null

        if (!bootstrapResponse.ok) {
          throw new Error(bootstrapPayload && "error" in bootstrapPayload ? bootstrapPayload.error || "Não foi possível preparar a conta inicial." : "Não foi possível preparar a conta inicial.")
        }

        const meResponse = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        })

        const mePayload = (await meResponse.json().catch(() => null)) as { redirectTo?: string; error?: string } | null

        if (!meResponse.ok) {
          throw new Error(mePayload?.error || "A conta foi criada, mas o perfil ainda não ficou disponível.")
        }

        toast({
          title: "Conta criada",
          description: "Sua agência foi preparada e a sessão já está ativa.",
        })
        router.push(mePayload?.redirectTo || "/app")
        return
      }

      toast({
        title: "Conta criada",
        description: "Verifique seu e-mail para concluir o acesso antes do primeiro login.",
      })
      router.push("/login")
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Falha ao criar conta."
      console.error("[signup] failed", {
        email,
        hasAgencyName: Boolean(agencyName),
        message,
      })
      toast({
        title: "Não foi possível criar a conta",
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
              <linearGradient id="registerLineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0" />
                <stop offset="50%" stopColor="#f97316" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M-50,200 Q150,400 300,200 T650,300"
              stroke="url(#registerLineGradient)"
              strokeWidth="2"
              fill="none"
              className="flow-line"
            />
            <path
              d="M-50,400 Q200,200 350,400 T700,350"
              stroke="url(#registerLineGradient)"
              strokeWidth="1.5"
              fill="none"
              className="flow-line"
              style={{ animationDelay: "1s" }}
            />
            <path
              d="M-50,600 Q250,500 400,600 T700,550"
              stroke="url(#registerLineGradient)"
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
                  <p className="text-xs font-medium text-foreground">Pacote publicado</p>
                  <p className="text-[10px] text-muted-foreground">Catálogo pronto para compartilhar</p>
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
                  <p className="text-xs font-medium text-foreground">TravelPro Go ativo</p>
                  <p className="text-[10px] text-muted-foreground">Operação em tempo real</p>
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
                  <p className="text-xs font-medium text-foreground">Dashboard pronto</p>
                  <p className="text-[10px] text-muted-foreground">Tudo centralizado</p>
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
                  <p className="text-xs font-medium text-foreground">Equipe conectada</p>
                  <p className="text-[10px] text-muted-foreground">Fluxos organizados</p>
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

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg"
        >
          <div className="mb-8 lg:hidden">
            <Link href="/" className="inline-flex min-w-fit">
              <TravelProLogo variant="auth" priority className="h-[52px] sm:h-[56px]" />
            </Link>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-secondary/20 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Criar conta no TravelPro</h1>
            <p className="text-muted-foreground mb-8">
              Deixe sua interface pronta para começar a operar com mais velocidade.
            </p>

            {envError ? <p className="mb-6 text-sm text-destructive">{envError}</p> : null}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="agency-name" className="block text-sm font-medium text-foreground mb-2">
                  Nome da agência
                </label>
                <input
                  id="agency-name"
                  type="text"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  placeholder="TravelPro Viagens"
                  className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  required
                />
              </div>

              <div>
                <label htmlFor="owner-name" className="block text-sm font-medium text-foreground mb-2">
                  Nome do responsável
                </label>
                <input
                  id="owner-name"
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  required
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
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

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                    Telefone / WhatsApp
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="********"
                      className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
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

                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-foreground mb-2">
                    Confirmar senha
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="********"
                      className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showConfirmPassword ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
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
                    Criar minha conta
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Já tenho conta.{" "}
              <Link href="/login" className="text-primary hover:underline">
                Entrar
              </Link>
            </p>
          </div>

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
