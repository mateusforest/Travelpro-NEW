import type { ComponentProps } from "react"
import { Button } from "@/components/ui/button"

export function PrimaryButton(props: ComponentProps<typeof Button>) {
  return <Button {...props} className={`h-9 rounded-full px-4 text-sm ${props.className ?? ""}`} />
}
