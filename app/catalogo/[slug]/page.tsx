import Link from "next/link"
import { ArrowLeft, ExternalLink, MapPin, MessageSquareText, Sparkles } from "lucide-react"

export default async function PublicCatalogPlaceholderPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const agencyName = slug === "jtviagens" ? "JT Viagens" : slug.replace(/-/g, " ")

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.03] shadow-[0_24px_60px_rgba(0,0,0,0.22)]">
          <div className="relative min-h-[260px] border-b border-white/8 bg-gradient-to-br from-primary/30 via-primary/10 to-black/30 px-6 py-8 md:px-8 md:py-10">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/app/catalogo"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/75 transition-colors hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Link>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/80">
                Catálogo público
              </span>
            </div>

            <div className="mt-10 max-w-2xl">
              <p className="text-[11px] uppercase tracking-[0.22em] text-primary-foreground/80">Vitrine da agência</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">{agencyName}</h1>
              <div className="mt-3 flex items-center gap-2 text-sm text-white/75">
                <MapPin className="h-4 w-4" />
                São Paulo • curadoria premium • experiências sob medida
              </div>
              <p className="mt-5 text-sm leading-7 text-white/75 md:text-base">
                Esta rota pública já foi preparada para receber a vitrine oficial do catálogo da agência,
                com pacotes, branding, CTA comercial e distribuição futura no ecossistema TravelPro.
              </p>
            </div>
          </div>

          <div className="grid gap-6 px-6 py-8 md:px-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-4">
              <div className="rounded-[28px] border border-white/8 bg-black/20 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-primary/75">Pacote em destaque</p>
                    <h2 className="mt-2 text-xl font-semibold text-foreground">Maldivas Signature</h2>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-foreground">
                    R$ 24.500
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  Estrutura pública preparada para Match, marketplace, Agent e campanhas comerciais.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Premium", "Romântico", "Match", "Curadoria"].map((tag) => (
                    <span key={tag} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {[
                  "Catálogo público com branding aplicado",
                  "Pronto para distribuição em campanhas",
                  "Compatível com TravelPro Match",
                  "Base para IA e TravelPro Agent",
                ].map((item) => (
                  <div key={item} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4 text-sm leading-6 text-muted-foreground">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/8 bg-gradient-to-br from-white/[0.05] via-white/[0.03] to-transparent p-5">
              <p className="text-sm font-medium text-foreground">Página pública em estruturação</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                A próxima fase conectará listagem real de pacotes, mídia pública, Match, catálogo compartilhável
                e CTA comercial com identidade da agência.
              </p>
              <div className="mt-6 space-y-3">
                <div className="rounded-[22px] border border-white/8 bg-black/20 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Vitrine inteligente
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Preparada para funcionar como origem do marketplace, Match, IA e distribuição comercial.
                  </p>
                </div>
                <div className="rounded-[22px] border border-white/8 bg-black/20 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <MessageSquareText className="h-4 w-4 text-primary" />
                    CTA comercial
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    O contato com consultor e canais oficiais serão conectados sem alterar esta estrutura.
                  </p>
                </div>
              </div>

              <Link
                href="/app/catalogo"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                Voltar para o catálogo da agência
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
