export default function MasterSectionLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="h-5 w-40 animate-pulse rounded-full bg-white/10" />
        <div className="h-10 w-64 animate-pulse rounded-full bg-white/10" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-36 animate-pulse rounded-3xl border border-white/8 bg-white/[0.03]" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className={`animate-pulse rounded-3xl border border-white/8 bg-white/[0.03] ${index === 2 ? "xl:col-span-2 h-72" : "h-64"}`} />
        ))}
      </div>
    </div>
  )
}
