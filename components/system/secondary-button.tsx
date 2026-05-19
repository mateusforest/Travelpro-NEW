import type { ComponentProps } from "react"
import { Button } from "@/components/ui/button"

export function SecondaryButton(props: ComponentProps<typeof Button>) {
  return <Button variant="outline" {...props} className={`h-9 rounded-full border-white/10 bg-white/[0.02] px-4 text-sm ${props.className ?? ""}`} />
}
