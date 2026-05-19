import type { UserProfile } from "@/lib/services/portal-types"

export function UserAvatar({ profile }: { profile: UserProfile }) {
  return (
    <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-2 transition-colors hover:border-primary/20 hover:bg-white/[0.06]">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-orange-300 text-sm font-semibold text-primary-foreground">
        {profile.initials}
      </div>
      <div className="hidden text-left md:block">
        <p className="text-sm font-medium text-foreground">{profile.name}</p>
        <p className="text-xs text-muted-foreground">{profile.role}</p>
      </div>
    </div>
  )
}
