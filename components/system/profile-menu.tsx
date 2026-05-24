"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, CreditCard, LockKeyhole, LogOut, Save, Settings, Settings2, Shield, UserRound, Wallet } from "lucide-react"
import type { PortalKey, UserProfile } from "@/lib/services/portal-types"
import { UserAvatar } from "@/components/system/user-avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

type ProfilePanel = "account" | "preferences" | "subscription" | "settings" | "security" | "logout" | "payment-update" | null
type SubscriptionTab = "current-plan" | "plans" | "extras" | "credits" | "billing"

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="space-y-2">
      <span className="text-xs uppercase tracking-[0.18em] text-primary/75">{label}</span>
      <input
        defaultValue={value}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />
    </label>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-primary/75">{label}</p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}

export function ProfileMenu({ portal, profile }: { portal: PortalKey; profile: UserProfile }) {
  const router = useRouter()
  const isClientPortal = portal === "client"
  const isMasterPortal = portal === "master"
  const isAgencyPortal = portal === "agency"
  const [activePanel, setActivePanel] = useState<ProfilePanel>(null)
  const [subscriptionTab, setSubscriptionTab] = useState<SubscriptionTab>("current-plan")

  const closePanel = () => setActivePanel(null)

  const fireMockFeedback = (title: string, description = "A ação foi registrada. O fluxo completo será liberado em breve.") => {
    toast({ title, description })
  }

  const handleLogout = async () => {
    try {
      const supabase = getSupabaseBrowserClient()
      await supabase.auth.signOut()
    } finally {
      closePanel()
      router.push("/login")
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="rounded-full outline-none">
            <div className="flex items-center gap-2">
              <UserAvatar profile={profile} />
              <span className="hidden rounded-full border border-white/10 bg-white/[0.03] p-2 text-muted-foreground md:inline-flex">
                <ChevronDown className="h-4 w-4" />
              </span>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={10}
          className="w-[300px] rounded-3xl border-white/10 bg-black/85 p-2 text-foreground shadow-2xl shadow-black/40 backdrop-blur-xl"
        >
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
            <p className="text-sm font-semibold">{profile.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{profile.email}</p>
            <p className="mt-3 inline-flex rounded-full border border-primary/15 bg-primary/10 px-2 py-1 text-[10px] font-medium tracking-[0.18em] text-primary">
              {profile.role}
            </p>
          </div>

          <DropdownMenuGroup className="mt-2 space-y-1">
            <DropdownMenuItem onSelect={() => setActivePanel("account")} className="rounded-2xl px-3 py-2.5">
              <UserRound className="h-4 w-4" />
              Minha conta
            </DropdownMenuItem>

            {isClientPortal ? (
              <DropdownMenuItem onSelect={() => setActivePanel("settings")} className="rounded-2xl px-3 py-2.5">
                <Settings className="h-4 w-4" />
                Configurações
              </DropdownMenuItem>
            ) : null}

            {isMasterPortal ? (
              <>
                <DropdownMenuItem onSelect={() => setActivePanel("settings")} className="rounded-2xl px-3 py-2.5">
                  <Settings className="h-4 w-4" />
                  Configurações da plataforma
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setActivePanel("security")} className="rounded-2xl px-3 py-2.5">
                  <LockKeyhole className="h-4 w-4" />
                  Segurança
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setActivePanel("preferences")} className="rounded-2xl px-3 py-2.5">
                  <Settings2 className="h-4 w-4" />
                  Preferências
                </DropdownMenuItem>
              </>
            ) : null}

            {isAgencyPortal ? (
              <>
                <DropdownMenuItem onSelect={() => setActivePanel("preferences")} className="rounded-2xl px-3 py-2.5">
                  <Settings2 className="h-4 w-4" />
                  Preferências
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push("/app/planos")} className="rounded-2xl px-3 py-2.5">
                  <Shield className="h-4 w-4" />
                  Plano atual
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push("/app/planos")} className="rounded-2xl px-3 py-2.5">
                  <Wallet className="h-4 w-4" />
                  Cobrança
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setActivePanel("settings")} className="rounded-2xl px-3 py-2.5">
                  <Settings className="h-4 w-4" />
                  Configurações
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="bg-white/8" />

          <DropdownMenuItem onSelect={() => setActivePanel("logout")} className="rounded-2xl px-3 py-2.5 text-red-200 focus:text-red-200">
            <LogOut className="h-4 w-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={activePanel === "account"} onOpenChange={(open) => !open && closePanel()}>
        <DialogContent className="max-w-2xl rounded-[32px] border border-white/10 bg-black/88 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
          <DialogHeader className="border-b border-white/8 px-6 py-5">
            <DialogTitle>Minha conta</DialogTitle>
            <DialogDescription>
              {isClientPortal
                ? "Atualize seus dados de contato e informações da viagem."
                : isMasterPortal
                  ? "Gerencie seus dados de acesso, identidade e perfil executivo."
                  : "Atualize seus dados principais de acesso e operação."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 px-6 py-5 md:grid-cols-[240px_1fr]">
            <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-orange-300 text-xl font-semibold text-primary-foreground">
                {profile.initials}
              </div>
              <p className="mt-4 text-sm font-medium">{profile.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{profile.role}</p>
              <Button variant="outline" className="mt-5 w-full rounded-full border-white/10 bg-white/[0.03]" onClick={() => fireMockFeedback("Foto preparada")}>
                Alterar foto
              </Button>
            </div>
            <div className="grid gap-4">
              <Field label="Nome" value={profile.name} />
              <Field label="E-mail" value={profile.email} />
              <Field label="Telefone" value="+55 11 99888-1122" />
              <Field
                label={isClientPortal ? "Documento" : isMasterPortal ? "Cargo" : "Cargo"}
                value={isClientPortal ? "Passaporte BR1234567" : isMasterPortal ? "Diretor do ecossistema TravelPro" : "Diretora operacional"}
              />
            </div>
          </div>
          <DialogFooter className="border-t border-white/8 px-6 py-5">
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={closePanel}>
              Fechar
            </Button>
            <Button className="rounded-full" onClick={() => fireMockFeedback("Dados salvos")}>
              <Save className="h-4 w-4" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {(isAgencyPortal || isMasterPortal) && (
        <Dialog open={activePanel === "preferences"} onOpenChange={(open) => !open && closePanel()}>
          <DialogContent className="max-w-2xl rounded-[32px] border border-white/10 bg-black/88 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
            <DialogHeader className="border-b border-white/8 px-6 py-5">
              <DialogTitle>Preferências</DialogTitle>
              <DialogDescription>
                {isMasterPortal
                  ? "Defina alertas, idioma, visão executiva e cadência de notificações da plataforma."
                  : "Defina tema, notificações e preferências de operação da agência."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
              <InfoCard label="Tema" value="Dark premium" />
              <InfoCard label="Idioma" value="Português (Brasil)" />
              <InfoCard label="Notificações" value={isMasterPortal ? "Alertas críticos, Atlas e billing" : "Ativas para leads, cobranças e operação"} />
              <InfoCard label={isMasterPortal ? "Painel inicial" : "Operação"} value={isMasterPortal ? "Resumo executivo com ranking e alertas" : "Follow-up inteligente e alertas prioritários"} />
            </div>
            <DialogFooter className="border-t border-white/8 px-6 py-5">
              <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={closePanel}>
                Fechar
              </Button>
              <Button className="rounded-full" onClick={() => fireMockFeedback("Preferências atualizadas")}>
                <Save className="h-4 w-4" />
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {isMasterPortal && (
        <Dialog open={activePanel === "security"} onOpenChange={(open) => !open && closePanel()}>
          <DialogContent className="max-w-2xl rounded-[32px] border border-white/10 bg-black/88 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
            <DialogHeader className="border-b border-white/8 px-6 py-5">
              <DialogTitle>Segurança</DialogTitle>
              <DialogDescription>Gerencie proteção da conta, sessão, acessos críticos e trilhas administrativas.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
              <InfoCard label="Autenticação em dois fatores" value="Ativa para o usuário Master" />
              <InfoCard label="Último acesso" value="Hoje, 08:42 • São Paulo" />
              <InfoCard label="Sessões abertas" value="2 dispositivos monitorados" />
              <InfoCard label="Alertas de segurança" value="Nenhum incidente crítico no momento" />
            </div>
            <div className="grid gap-4 px-6 pb-5 md:grid-cols-2">
              <Field label="E-mail de recuperação" value="seguranca@travelpro.com" />
              <Field label="Canal crítico" value="SMS + e-mail" />
            </div>
            <DialogFooter className="border-t border-white/8 px-6 py-5">
              <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={closePanel}>
                Fechar
              </Button>
              <Button className="rounded-full" onClick={() => fireMockFeedback("Segurança atualizada")}>
                <Save className="h-4 w-4" />
                Aplicar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {isAgencyPortal && (
        <>
          <Dialog open={activePanel === "subscription"} onOpenChange={(open) => !open && closePanel()}>
            <DialogContent className="flex max-h-[88vh] max-w-5xl flex-col overflow-hidden rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
              <DialogHeader className="border-b border-white/8 px-6 py-5">
                <DialogTitle>Plano, pacotes e créditos</DialogTitle>
                <DialogDescription>Uma visão única para plano, extras, consumo e cobrança da agência.</DialogDescription>
              </DialogHeader>

              <Tabs value={subscriptionTab} onValueChange={(value) => setSubscriptionTab(value as SubscriptionTab)} className="flex min-h-0 flex-1 flex-col">
                <div className="border-b border-white/8 px-5 py-4">
                  <TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-3xl bg-transparent p-0">
                    <TabsTrigger value="current-plan" className="h-9 rounded-full border border-white/10 bg-white/[0.03] px-3.5 text-xs data-[state=active]:border-primary/20 data-[state=active]:bg-primary/10">Plano atual</TabsTrigger>
                    <TabsTrigger value="plans" className="h-9 rounded-full border border-white/10 bg-white/[0.03] px-3.5 text-xs data-[state=active]:border-primary/20 data-[state=active]:bg-primary/10">Planos</TabsTrigger>
                    <TabsTrigger value="extras" className="h-9 rounded-full border border-white/10 bg-white/[0.03] px-3.5 text-xs data-[state=active]:border-primary/20 data-[state=active]:bg-primary/10">Pacotes extras</TabsTrigger>
                    <TabsTrigger value="credits" className="h-9 rounded-full border border-white/10 bg-white/[0.03] px-3.5 text-xs data-[state=active]:border-primary/20 data-[state=active]:bg-primary/10">Comprar créditos</TabsTrigger>
                    <TabsTrigger value="billing" className="h-9 rounded-full border border-white/10 bg-white/[0.03] px-3.5 text-xs data-[state=active]:border-primary/20 data-[state=active]:bg-primary/10">Cobrança</TabsTrigger>
                  </TabsList>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                  <TabsContent value="current-plan" className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      <InfoCard label="Plano contratado" value="Scale" />
                      <InfoCard label="Status" value="Ativo e saudável" />
                      <InfoCard label="Valor mensal" value="R$ 1.490/mês" />
                      <InfoCard label="Usuários inclusos / usados" value="8 inclusos • 6 usados" />
                      <InfoCard label="Créditos inclusos / usados" value="6.000 • 3.480 no ciclo" />
                      <InfoCard label="Próxima renovação" value="24 de maio de 2026" />
                      <InfoCard label="Limite IA" value="2.500 execuções assistidas" />
                      <InfoCard label="TravelPro Go" value="Número principal ativo" />
                      <InfoCard label="Agent e Match" value="3 jornadas • 12 pacotes impulsionados" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button className="rounded-full" onClick={() => setSubscriptionTab("plans")}>Alterar plano</Button>
                      <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => setSubscriptionTab("credits")}>Comprar créditos</Button>
                      <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => setSubscriptionTab("extras")}>Ver pacotes extras</Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="plans" className="space-y-4">
                    <div className="grid gap-3 lg:grid-cols-3">
                      {[
                        {
                          name: "Start",
                          price: "R$ 497/mês",
                          limits: "3 usuários • 1.500 créditos",
                          features: ["Catálogo público", "Central operacional", "WhatsApp essencial"],
                        },
                        {
                          name: "Pro",
                          price: "R$ 997/mês",
                          limits: "6 usuários • 3.500 créditos",
                          features: ["Roteiros premium", "Documentos inteligentes", "Atlas assistido"],
                        },
                        {
                          name: "Scale",
                          price: "R$ 1.490/mês",
                          limits: "8 usuários • 6.000 créditos",
                          features: ["TravelPro Go completo", "Automações premium", "Equipe e financeiro"],
                        },
                      ].map((plan) => (
                        <div key={plan.name} className={plan.name === "Scale" ? "rounded-[26px] border border-primary/20 bg-primary/[0.07] p-4 shadow-[0_0_28px_rgba(255,122,0,0.08)]" : "rounded-[26px] border border-white/8 bg-white/[0.03] p-4"}>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-base font-semibold text-foreground">{plan.name}</p>
                              <p className="mt-1 text-sm text-primary">{plan.price}</p>
                            </div>
                            {plan.name === "Scale" ? <span className="rounded-full border border-primary/15 bg-primary/10 px-2.5 py-1 text-[10px] font-medium tracking-[0.18em] text-primary">Atual</span> : null}
                          </div>
                          <p className="mt-3 text-sm leading-5 text-muted-foreground">{plan.limits}</p>
                          <div className="mt-4 space-y-2">
                            {plan.features.map((feature) => (
                              <div key={feature} className="rounded-2xl border border-white/8 bg-black/10 px-3 py-2 text-[13px] text-foreground">{feature}</div>
                            ))}
                          </div>
                          <Button className="mt-4 w-full rounded-full" variant={plan.name === "Scale" ? "outline" : "default"} onClick={() => fireMockFeedback("Plano " + plan.name + " selecionado")}>Selecionar plano</Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="extras" className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {[
                        { title: "Usuário adicional", description: "+2 licenças para comercial ou operação", cta: "Adicionar usuários" },
                        { title: "Créditos IA", description: "+2.000 créditos com ativação imediata", cta: "Contratar pacote" },
                        { title: "TravelPro Match", description: "Mais destaques e impulsionamento no marketplace", cta: "Expandir Match" },
                        { title: "Agent", description: "Mais jornadas simultâneas e follow-ups", cta: "Expandir Agent" },
                        { title: "Marketing IA", description: "Campanhas, posts e calendário promocional", cta: "Ativar Marketing IA" },
                        { title: "WhatsApp / Go", description: "Janela extra para mensagens e automações", cta: "Liberar WhatsApp" },
                      ].map((item) => (
                        <div key={item.title} className="rounded-[26px] border border-white/8 bg-white/[0.03] p-4">
                          <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                          <p className="mt-2 text-sm leading-5 text-muted-foreground">{item.description}</p>
                          <Button className="mt-4 w-full rounded-full" onClick={() => fireMockFeedback(item.title)}>{item.cta}</Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="credits" className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-3">
                      {[
                        { title: "2.000 créditos", price: "R$ 190", usage: "Ideal para roteiros e PDFs" },
                        { title: "5.000 créditos", price: "R$ 420", usage: "Operação completa com Agent e Go" },
                        { title: "10.000 créditos", price: "R$ 790", usage: "Escala comercial com campanhas e Match" },
                      ].map((item) => (
                        <div key={item.title} className="rounded-[26px] border border-white/8 bg-white/[0.03] p-4">
                          <p className="text-base font-semibold text-foreground">{item.title}</p>
                          <p className="mt-1 text-sm text-primary">{item.price}</p>
                          <p className="mt-3 text-sm leading-5 text-muted-foreground">{item.usage}</p>
                          <Button className="mt-4 w-full rounded-full" onClick={() => fireMockFeedback("Compra em breve: " + item.title, "A compra segura desse pacote será conectada quando o billing oficial estiver ativo.")}>Comprar pacote</Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="billing" className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <InfoCard label="Assinatura" value="Scale • ativa e saudável" />
                      <InfoCard label="Último pagamento" value="R$ 1.490 • 24/04/2026" />
                      <InfoCard label="Próxima cobrança" value="24/05/2026" />
                      <InfoCard label="Forma de pagamento" value="Cartão empresarial final 4821" />
                    </div>
                    <div className="rounded-[26px] border border-white/8 bg-white/[0.03] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-primary/75">Histórico</p>
                      <div className="mt-3 space-y-2.5">
                        <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/10 px-4 py-3 text-sm"><span>Plano Scale</span><span className="text-muted-foreground">24/04/2026 • pago</span></div>
                        <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/10 px-4 py-3 text-sm"><span>Pacote extra de créditos</span><span className="text-muted-foreground">11/04/2026 • pago</span></div>
                        <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/10 px-4 py-3 text-sm"><span>Destaque Match</span><span className="text-muted-foreground">17/03/2026 • pago</span></div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fireMockFeedback("Faturas em breve", "A listagem operacional de faturas será liberada quando o portal de cobrança oficial estiver ativo.")}>Ver faturas</Button>
                      <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fireMockFeedback("Portal de cobrança preparado", "O portal seguro será conectado futuramente ao Stripe.")}>Abrir portal de cobrança</Button>
                      <Button className="rounded-full" onClick={() => setActivePanel("payment-update")}>
                        <CreditCard className="h-4 w-4" />
                        Atualizar forma de pagamento
                      </Button>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>

              <DialogFooter className="border-t border-white/8 px-6 py-5">
                <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={closePanel}>Fechar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={activePanel === "payment-update"} onOpenChange={(open) => !open && setActivePanel("subscription")}>
            <DialogContent className="max-w-md rounded-[32px] border border-white/10 bg-black/90 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
              <DialogHeader className="border-b border-white/8 px-6 py-5">
                <DialogTitle>Portal de cobrança</DialogTitle>
                <DialogDescription>Em breve você será direcionado ao portal seguro de cobrança.</DialogDescription>
              </DialogHeader>
              <div className="px-6 py-5 text-sm leading-6 text-muted-foreground">
                {/* Futuramente este botão deve chamar o Stripe Customer Portal. */}
                A integração com o portal seguro de cobrança será conectada quando o fluxo Stripe estiver ativo no sistema.
              </div>
              <DialogFooter className="border-t border-white/8 px-6 py-5">
                <Button className="rounded-full" onClick={() => setActivePanel("subscription")}>
                  Entendi
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}

      <Dialog open={activePanel === "settings"} onOpenChange={(open) => !open && closePanel()}>
        <DialogContent className="max-w-3xl rounded-[32px] border border-white/10 bg-black/88 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
          <DialogHeader className="border-b border-white/8 px-6 py-5">
            <DialogTitle>{isMasterPortal ? "Configurações da plataforma" : "Configurações"}</DialogTitle>
            <DialogDescription>
              {isClientPortal
                ? "Ajuste idioma, privacidade e como deseja receber atualizações da sua viagem."
                : isMasterPortal
                  ? "Centralize parâmetros do TravelPro, branding global, políticas e integrações futuras."
                  : "Centralize dados públicos, preferências operacionais e futuras integrações da agência."}
            </DialogDescription>
          </DialogHeader>

          {isClientPortal ? (
            <>
              <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
                <InfoCard label="Notificações" value="Documentos, mensagens e alertas da viagem" />
                <InfoCard label="Idioma" value="Português (Brasil)" />
                <InfoCard label="Privacidade" value="Dados visíveis apenas para você e sua agência" />
                <InfoCard label="Comunicação" value="WhatsApp e e-mail habilitados" />
              </div>
              <div className="grid gap-4 px-6 pb-5 md:grid-cols-2">
                <Field label="Canal preferido" value="WhatsApp" />
                <Field label="Resumo de viagem" value="Receber atualizações importantes" />
              </div>
            </>
          ) : isMasterPortal ? (
            <>
              <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
                <Field label="Nome da plataforma" value="TravelPro" />
                <Field label="Domínio principal" value="app.travelpro.com" />
                <Field label="Canal executivo" value="operacoes@travelpro.com" />
                <Field label="Branding global" value="Dark premium + laranja TravelPro" />
                <Field label="Política de créditos" value="Renovação mensal com bônus controlados" />
                <Field label="Integrações futuras" value="Stripe, Supabase, OpenAI, WhatsApp oficial e observabilidade" />
              </div>
              <div className="grid gap-4 px-6 pb-5 md:grid-cols-2">
                <InfoCard label="Alertas críticos" value="Inadimplência, Atlas, WhatsApp, abuse IA e marketplace" />
                <InfoCard label="Parâmetros executivos" value="MRR, churn, risco por agência, consumo por feature" />
              </div>
            </>
          ) : (
            <>
              <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
                <Field label="Nome da agência" value="JT Viagens Premium" />
                <Field label="Logo" value="travelpro.app/assets/jt-viagens-logo.png" />
                <Field label="Cor principal" value="Laranja TravelPro + Grafite" />
                <Field label="WhatsApp principal" value="+55 11 97777-2100" />
                <Field label="Cidade / região" value="São Paulo • Atendimento Brasil e América do Sul" />
                <Field label="Dados públicos" value="Especialista em roteiros personalizados e operação premium." />
              </div>
              <div className="grid gap-4 px-6 pb-5 md:grid-cols-2">
                <InfoCard label="Preferências de operação" value="Alertas urgentes, tarefas por prioridade, follow-ups assistidos" />
                <InfoCard label="Integrações futuras" value="Stripe, Supabase, WhatsApp oficial, OpenAI e automações" />
              </div>
            </>
          )}

          <DialogFooter className="border-t border-white/8 px-6 py-5">
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={closePanel}>
              Fechar
            </Button>
            {isMasterPortal ? (
              <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={() => fireMockFeedback("Chaves futuras mapeadas", "A preparação das chaves e integrações futuras foi registrada sem criar configuração fake nesta etapa.")}>
                Mapear chaves futuras
              </Button>
            ) : null}
            <Button className="rounded-full" onClick={() => fireMockFeedback(isClientPortal ? "Configurações salvas" : isMasterPortal ? "Configurações da plataforma salvas" : "Configurações da agência salvas")}>
              <Save className="h-4 w-4" />
              {isClientPortal ? "Salvar" : isMasterPortal ? "Salvar parâmetros" : "Salvar configurações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={activePanel === "logout"} onOpenChange={(open) => !open && closePanel()}>
        <DialogContent className="max-w-md rounded-[32px] border border-white/10 bg-black/88 p-0 text-foreground shadow-2xl shadow-black/50 backdrop-blur-2xl">
          <DialogHeader className="border-b border-white/8 px-6 py-5">
            <DialogTitle>Confirmar saída</DialogTitle>
            <DialogDescription>Você quer encerrar a sessão agora?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="px-6 py-5">
            <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.03]" onClick={closePanel}>
              Cancelar
            </Button>
            <Button className="rounded-full" onClick={handleLogout}>
              Sair
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}


