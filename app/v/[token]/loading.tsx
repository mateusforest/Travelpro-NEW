export default function PublicTripLoading() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.12),_transparent_35%),linear-gradient(180deg,#060606_0%,#0a0a0a_100%)] px-4 py-6 text-foreground md:px-6 md:py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="animate-pulse overflow-hidden rounded-[36px] border border-white/10 bg-black/60 p-5 shadow-2xl shadow-black/40 backdrop-blur-2xl md:p-8">
          <div className="h-5 w-48 rounded-full bg-white/10" />
          <div className="mt-5 h-12 w-3/4 rounded-[20px] bg-white/10" />
          <div className="mt-4 h-4 w-2/3 rounded-full bg-white/10" />
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`hero-skeleton-${index}`} className="h-24 rounded-[24px] bg-white/[0.04]" />
            ))}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={`left-skeleton-${index}`} className="animate-pulse rounded-[32px] border border-white/10 bg-black/50 p-5 shadow-xl shadow-black/30 backdrop-blur-xl md:p-6">
                <div className="h-4 w-40 rounded-full bg-white/10" />
                <div className="mt-4 h-24 rounded-[24px] bg-white/[0.04]" />
              </div>
            ))}
          </div>
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`right-skeleton-${index}`} className="animate-pulse rounded-[32px] border border-white/10 bg-black/50 p-5 shadow-xl shadow-black/30 backdrop-blur-xl md:p-6">
                <div className="h-4 w-32 rounded-full bg-white/10" />
                <div className="mt-4 h-20 rounded-[24px] bg-white/[0.04]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
