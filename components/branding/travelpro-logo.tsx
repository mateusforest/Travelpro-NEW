import Image from "next/image"
import { cn } from "@/lib/utils"

type TravelProLogoVariant = "header" | "sidebar" | "auth" | "footer" | "compact" | "full"

type TravelProLogoProps = {
  variant?: TravelProLogoVariant
  className?: string
  priority?: boolean
}

const variantConfig: Record<
  TravelProLogoVariant,
  {
    src: string
    width: number
    height: number
    className: string
  }
> = {
  header: {
    src: "/travelpro-logo.png",
    width: 420,
    height: 104,
    className: "h-[44px] sm:h-[48px] lg:h-[56px]",
  },
  sidebar: {
    src: "/travelpro-logo.png",
    width: 420,
    height: 104,
    className: "h-[48px] xl:h-[52px]",
  },
  auth: {
    src: "/travelpro-logo.png",
    width: 520,
    height: 128,
    className: "h-[60px] sm:h-[66px] lg:h-[76px]",
  },
  footer: {
    src: "/travelpro-logo-icon.png",
    width: 220,
    height: 220,
    className: "h-[88px] sm:h-[110px]",
  },
  compact: {
    src: "/travelpro-logo-icon.png",
    width: 220,
    height: 220,
    className: "h-[34px] sm:h-[38px]",
  },
  full: {
    src: "/travelpro-logo.png",
    width: 420,
    height: 104,
    className: "h-[50px] sm:h-[56px]",
  },
}

export function TravelProLogo({ variant = "full", className, priority = false }: TravelProLogoProps) {
  const config = variantConfig[variant]

  return (
    <Image
      src={config.src}
      alt="TravelPro"
      width={config.width}
      height={config.height}
      priority={priority}
      sizes="(max-width: 768px) 220px, 320px"
      className={cn("block w-auto max-w-none shrink-0 overflow-visible object-contain", config.className, className)}
    />
  )
}
