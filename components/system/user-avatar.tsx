import type { UserProfile } from "@/lib/services/portal-types"

export function UserAvatar({ profile }: { profile: UserProfile }) {
  return (
    <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-2 py-1.5 transition-colors hover:border-primary/20 hover:bg-white/[0.06]">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-orange-300 text-sm font-semibold text-primary-foreground">
        {profile.initials}
      </div>
      <div className="hidden text-left md:block">
        <p className="text-[13px] font-medium text-foreground">{profile.name}</p>
        <p className="text-xs text-muted-foreground">{profile.role}</p>
      </div>
    </div>
  )
}
