"use client"

type FilterTabsProps = {
  items: string[]
  activeItem?: string
  onChange?: (item: string) => void
}

export function FilterTabs({ items, activeItem, onChange }: FilterTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <button
          key={`${item}-${index}`}
          onClick={() => onChange?.(item)}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
            (activeItem ? activeItem === item : index === 0)
              ? "border-primary/25 bg-primary/12 text-primary"
              : "border-white/10 bg-white/[0.025] text-muted-foreground hover:border-white/14 hover:text-foreground"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  )
}
