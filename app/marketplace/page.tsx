import Link from "next/link"
import { ArrowLeft, ExternalLink, Sparkles, Target, TrendingUp } from "lucide-react"

export default function MarketplacePlaceholderPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.22)] md:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/app/catalogo/travelpro-match"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
            <span className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-primary">
              Em preparação
            </span>
          </div>

          <div className="mt-8 grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-primary/75">Marketplace TravelPro</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                Ecossistema público de pacotes e oportunidades
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                Esta rota já foi preparada para receber o marketplace público do TravelPro, com vitrine premium,
                distribuição do Match, descoberta de pacotes e captura de leads qualificados.
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {[
                  { title: "Pacotes em destaque", body: "Vitrine aspiracional com campanhas, impulsionamento e score comercial.", icon: Sparkles },
                  { title: "Oportunidades do Match", body: "Pacotes com aderência alta à demanda e maior chance de conversão.", icon: Target },
                  { title: "Tendências em tempo real", body: "Destinos em alta, procura crescente e performance de cliques.", icon: TrendingUp },
                ].map((item) => (
                  <div key={item.title} className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                    <item.icon className="h-5 w-5 text-primary" />
                    <p className="mt-3 text-sm font-medium text-foreground">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/8 bg-gradient-to-br from-white/[0.05] via-white/[0.03] to-transparent p-5">
              <p className="text-sm font-medium text-foreground">Módulo em estruturação</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                O marketplace público será conectado nas próximas fases com catálogo, Match, ranking, filtros,
                páginas de destino e distribuição real.
              </p>
              <div className="mt-6 rounded-[22px] border border-primary/15 bg-primary/10 p-4 text-sm leading-6 text-muted-foreground">
                Esta etapa prepara a navegação pública sem deixar CTAs principais mortos ou quebrados.
              </div>
              <Link
                href="/app/catalogo/travelpro-match"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                Voltar para o painel do Match
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
