import Link from "next/link"
import { ArrowLeft, ExternalLink, Globe, MapPin, MessageSquareText, Sparkles } from "lucide-react"
import { getPublicCatalogBySlug } from "@/lib/services"
import type { CatalogItemRow } from "@/types/database"

const defaultBanner =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
const defaultLogo =
  "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=320&q=80"

function parseMetadata(value: CatalogItemRow["metadata"]) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

function formatMoney(value: number | null, currency = "BRL") {
  if (value === null) return "Sob consulta"
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(value)
}

export default async function PublicCatalogPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await getPublicCatalogBySlug(slug)
  const featuredPackage = data.packages[0] ?? null
  const featuredMetadata = featuredPackage ? parseMetadata(featuredPackage.metadata) : {}
  const agencyBanner = data.agency.banner_url || defaultBanner
  const agencyLogo = data.agency.logo_url || defaultLogo
  const whatsappHref = data.agency.phone ? `https://wa.me/${data.agency.phone.replace(/\D/g, "")}` : null

  return (
    <main id="top" className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.03] shadow-[0_24px_60px_rgba(0,0,0,0.22)]">
          <div className="relative min-h-[300px] border-b border-white/8 px-6 py-8 md:px-8 md:py-10">
            <img src={agencyBanner} alt={`Banner de ${data.agency.display_name}`} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/45 to-black/80" />

            <div className="relative z-10 flex flex-wrap items-center gap-3">
              <Link
                href="#pacotes"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/75 transition-colors hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Link>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/80">
                Catálogo público
              </span>
              <span className="rounded-full border border-primary/20 bg-primary/15 px-3 py-1 text-[11px] font-medium text-primary">
                Vitrine da agência
              </span>
            </div>

            <div className="relative z-10 mt-10 max-w-3xl">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-3xl border border-white/15 bg-white/10 shadow-lg shadow-black/20">
                  <img src={agencyLogo} alt={`Logo de ${data.agency.display_name}`} className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-primary-foreground/80">Vitrine da agência</p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">{data.agency.display_name}</h1>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/75">
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {data.agency.city || "Curadoria premium"}
                </span>
                {data.agency.visual_style ? <span>{data.agency.visual_style}</span> : null}
              </div>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/75 md:text-base">
                {data.agency.description || "Pacotes publicados da agência, organizados em uma vitrine limpa, pública e pronta para compartilhamento."}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                {whatsappHref ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/15 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                  >
                    <MessageSquareText className="h-4 w-4" />
                    Falar com a agência
                  </a>
                ) : null}
                <Link
                  href="#pacotes"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/75 transition-colors hover:text-white"
                >
                  <Globe className="h-4 w-4" />
                  Ver pacotes
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-6 px-6 py-8 md:px-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-5">
              {featuredPackage ? (
                <div className="overflow-hidden rounded-[28px] border border-white/8 bg-black/20">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                      src={typeof featuredMetadata.cover_url === "string" ? featuredMetadata.cover_url : agencyBanner}
                      alt={featuredPackage.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.18em] text-primary/85">Pacote em destaque</p>
                          <h2 className="mt-2 text-xl font-semibold text-white">{featuredPackage.title}</h2>
                        </div>
                        <div className="rounded-full border border-white/10 bg-white/[0.12] px-4 py-2 text-sm font-medium text-white">
                          {formatMoney(featuredPackage.price, featuredPackage.currency || "BRL")}
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-white/72">{featuredPackage.description || "Pacote publicado e pronto para atendimento comercial."}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-[28px] border border-dashed border-white/10 bg-black/20 p-6">
                  <p className="text-lg font-medium text-foreground">Vitrine em preparação</p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Esta agência ainda não publicou nenhum pacote. Assim que o primeiro pacote for publicado no painel interno, ele aparecerá aqui automaticamente.
                  </p>
                </div>
              )}

              <div id="pacotes" className="grid gap-4 md:grid-cols-2">
                {data.packages.length === 0 ? (
                  <>
                    {[
                      "Nenhum pacote público ainda",
                      "A vitrine abrirá automaticamente quando houver publicação",
                      "Rascunhos e inativos seguem visíveis só no painel interno",
                      "Match continua em breve, sem fake backend",
                    ].map((item) => (
                      <div key={item} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4 text-sm leading-6 text-muted-foreground">
                        {item}
                      </div>
                    ))}
                  </>
                ) : (
                  data.packages.map((item) => {
                    const metadata = parseMetadata(item.metadata)
                    const tags = Array.isArray(metadata.tags) ? metadata.tags.filter((entry): entry is string => typeof entry === "string") : []

                    return (
                      <article key={item.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description || "Pacote publicado na vitrine pública da agência."}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {(tags.length ? tags : ["Curadoria", "Publicado"]).slice(0, 4).map((tag) => (
                            <span key={`${item.id}-${tag}`} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-muted-foreground">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <span className="text-sm font-medium text-primary">{formatMoney(item.price, item.currency || "BRL")}</span>
                          <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                            <ExternalLink className="h-4 w-4" />
                            Publicado
                          </span>
                        </div>
                      </article>
                    )
                  })
                )}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/8 bg-gradient-to-br from-white/[0.05] via-white/[0.03] to-transparent p-5">
              <p className="text-sm font-medium text-foreground">Atendimento comercial</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                A vitrine pública já carrega só pacotes publicados. Match, recomendação inteligente e impulsionamento continuam planejados para a próxima fase.
              </p>
              <div className="mt-6 space-y-3">
                <div className="rounded-[22px] border border-white/8 bg-black/20 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Globe className="h-4 w-4 text-primary" />
                    Vitrine real
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Esta página já é a origem pública da agência e mostra apenas o que foi efetivamente publicado.
                  </p>
                </div>
                <div className="rounded-[22px] border border-white/8 bg-black/20 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <MessageSquareText className="h-4 w-4 text-primary" />
                    Contato
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {data.agency.phone ? `Canal principal disponível: ${data.agency.phone}.` : "O contato comercial será enriquecido quando a agência completar os dados públicos."}
                  </p>
                </div>
                <div className="rounded-[22px] border border-white/8 bg-black/20 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Próximas fases
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Match, IA, recomendação inteligente e impulsionamento permanecem em breve, sem backend fake nesta vitrine.
                  </p>
                </div>
              </div>

              <Link
                href="#top"
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
