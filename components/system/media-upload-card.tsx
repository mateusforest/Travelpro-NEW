"use client"

import { useId, type ChangeEvent } from "react"
import { ImagePlus, RefreshCcw, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

type MediaUploadCardProps = {
  title: string
  description: string
  preview?: string | null
  orientation?: "square" | "landscape" | "portrait"
  onSelect: (file: File | null) => void
  onRemove?: () => void
}

const orientationClasses = {
  square: "aspect-square",
  landscape: "aspect-[16/9]",
  portrait: "aspect-[4/5]",
}

export function MediaUploadCard({
  title,
  description,
  preview,
  orientation = "landscape",
  onSelect,
  onRemove,
}: MediaUploadCardProps) {
  const inputId = useId()

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    onSelect(file)
    event.target.value = ""
  }

  return (
    <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-4 shadow-[0_16px_36px_rgba(0,0,0,0.12)]">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs leading-5 text-muted-foreground">{description}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-full border-white/10 bg-white/[0.04]">
            <label htmlFor={inputId} className="cursor-pointer">
              <RefreshCcw className="h-3.5 w-3.5" />
              Alterar
            </label>
          </Button>
          {onRemove ? (
            <Button variant="outline" size="sm" className="rounded-full border-white/10 bg-white/[0.04]" onClick={onRemove}>
              <Trash2 className="h-3.5 w-3.5" />
              Remover
            </Button>
          ) : null}
        </div>
      </div>

      <label
        htmlFor={inputId}
        className={`mt-4 flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-[24px] border border-dashed border-white/15 bg-gradient-to-br from-white/[0.06] via-white/[0.03] to-transparent ${orientationClasses[orientation]}`}
      >
        {preview ? (
          <img src={preview} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-primary">
              <ImagePlus className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Arraste uma imagem ou clique para selecionar</p>
              <p className="text-xs leading-5 text-muted-foreground">Preview local mockado. A integração real pode entrar depois sem mudar a experiência.</p>
            </div>
          </div>
        )}
      </label>

      <input id={inputId} type="file" accept="image/*" className="hidden" onChange={handleChange} />
    </div>
  )
}
