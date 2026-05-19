"use client"

import Link from "next/link"
import { useState } from "react"
import { PrimaryButton } from "@/components/system/primary-button"
import { SecondaryButton } from "@/components/system/secondary-button"
import { ActionWorkbench } from "@/components/system/action-workbench"

type PortalActionsProps = {
  primaryAction?: string
  secondaryAction?: string
  primaryActionHref?: string
  secondaryActionHref?: string
  extraActions?: { label: string; href?: string }[]
}

function shouldUseModalAction(label?: string) {
  if (!label) return false
  return [
    "Nova receita",
    "Nova despesa",
    "Adicionar funcionário",
    "Nova tarefa",
    "Adicionar rota rápida",
    "Exportar relatório",
    "Exportar PDF futuro",
    "Enviar via WhatsApp futuro",
    "Gerar relatório",
    "Comprar créditos futuro",
    "Comprar créditos",
  ].includes(label)
}

function normalizeActionLabel(label: string) {
  if (label === "Exportar PDF futuro" || label === "Enviar via WhatsApp futuro" || label === "Exportar futuro") return "Exportar relatório"
  if (label === "Comprar créditos futuro") return "Comprar créditos"
  return label
}

export function PortalActions({ primaryAction, secondaryAction, primaryActionHref, secondaryActionHref, extraActions = [] }: PortalActionsProps) {
  const [activeAction, setActiveAction] = useState<string | null>(null)

  const renderSecondary = (label?: string, href?: string, keySuffix = "secondary") => {
    if (!label) return null
    const normalized = normalizeActionLabel(label)
    const uniqueKey = `${normalized}-${keySuffix}`
    if (shouldUseModalAction(label) || !href) {
      return (
        <SecondaryButton key={uniqueKey} onClick={() => setActiveAction(normalized)}>
          {normalized}
        </SecondaryButton>
      )
    }

    return (
      <SecondaryButton key={uniqueKey} asChild>
        <Link href={href}>{normalized}</Link>
      </SecondaryButton>
    )
  }

  const renderPrimary = (label?: string, href?: string, keySuffix = "primary") => {
    if (!label) return null
    const normalized = normalizeActionLabel(label)
    const uniqueKey = `${normalized}-${keySuffix}`
    if (shouldUseModalAction(label) || !href) {
      return (
        <PrimaryButton key={uniqueKey} onClick={() => setActiveAction(normalized)}>
          {normalized}
        </PrimaryButton>
      )
    }

    return (
      <PrimaryButton key={uniqueKey} asChild>
        <Link href={href}>{normalized}</Link>
      </PrimaryButton>
    )
  }

  return (
    <>
      {renderSecondary(secondaryAction, secondaryActionHref, "secondary-main")}
      {extraActions.map((action, index) => renderSecondary(action.label, action.href, `secondary-extra-${index}`))}
      {renderPrimary(primaryAction, primaryActionHref, "primary-main")}
      <ActionWorkbench action={activeAction} onClose={() => setActiveAction(null)} />
    </>
  )
}
