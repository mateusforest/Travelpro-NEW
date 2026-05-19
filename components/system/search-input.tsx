import { Search } from "lucide-react"

type SearchInputProps = {
  placeholder?: string
}

export function SearchInput({ placeholder = "Buscar..." }: SearchInputProps) {
  return (
    <label className="flex h-10 items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.025] px-3.5 text-sm text-muted-foreground transition-colors hover:border-white/14 hover:bg-white/[0.04]">
      <Search className="h-3.5 w-3.5" />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />
    </label>
  )
}
