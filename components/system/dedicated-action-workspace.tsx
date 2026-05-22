"use client"

import Link from "next/link"
import { useEffect, useMemo, useState, type ReactNode } from "react"
import { ArrowLeft, Globe, Save, Send } from "lucide-react"
import { LivePreviewPanel } from "@/components/system/live-preview-panel"
import { OperationalWorkspaceLayout } from "@/components/system/operational-workspace-layout"
import { PageShell } from "@/components/system/page-shell"
import { PrimaryButton } from "@/components/system/primary-button"
import { SecondaryButton } from "@/components/system/secondary-button"
import { SectionHeader } from "@/components/system/section-header"
import { SetupGuideCard } from "@/components/system/setup-guide-card"
import { SmartActionButton } from "@/components/system/smart-action-button"
import { WorkspaceSectionCard } from "@/components/system/workspace-section-card"
import { WorkspaceSidebarInfo } from "@/components/system/workspace-sidebar-info"
import { toast } from "@/components/ui/use-toast"

export type WorkspaceFieldType = "text" | "textarea" | "select"

export type WorkspaceSelectOption =
  | string
  | {
      label: string
      value: string
    }

export type WorkspaceFieldConfig = {
  key: string
  label: string
  type?: WorkspaceFieldType
  placeholder?: string
  options?: WorkspaceSelectOption[] | ((values: Record<string, string>) => WorkspaceSelectOption[])
  colSpan?: 1 | 2
  rows?: number
  description?: string
  readOnly?: boolean
  hidden?: (values: Record<string, string>) => boolean
}

export type WorkspaceSectionConfig = {
  title: string
  description: string
  fields: WorkspaceFieldConfig[]
}

type DedicatedActionWorkspaceProps = {
  title: string
  description: string
  backHref: string
  backLabel: string
  initialValues: Record<string, string>
  sections: WorkspaceSectionConfig[]
  aiActionLabel?: string
  aiActionDescription?: string
  primaryActionLabel?: string
  primaryActionDescription?: string
  draftActionDescription?: string
  hideDraftAction?: boolean
  hidePreviewAction?: boolean
  previewActionDescription?: string
  previewTitle: string
  previewDescription: string
  renderPreview: (values: Record<string, string>) => ReactNode
  sidebarInfo?: {
    title: string
    description: string
    items: Array<{ label: string; value: string | ((values: Record<string, string>) => string); hint?: string }>
  }
  helpCard?: {
    title: string
    description: string
    steps: string[]
  }
  extraSidebar?: ReactNode
  bottomContent?: ReactNode
  transformValues?: (nextValues: Record<string, string>, changedKey: string) => Record<string, string>
  onPrimaryAction?: (values: Record<string, string>) => Promise<void> | void
  onDraftAction?: (values: Record<string, string>) => Promise<void> | void
}

function FieldRenderer({
  field,
  value,
  values,
  onChange,
}: {
  field: WorkspaceFieldConfig
  value: string
  values: Record<string, string>
  onChange: (value: string) => void
}) {
  const wrapperClass = field.colSpan === 2 ? "space-y-2 md:col-span-2" : "space-y-2"
  const rawOptions = typeof field.options === "function" ? field.options(values) : (field.options ?? [])
  const selectOptions = rawOptions.map((option) =>
    typeof option === "string" ? { label: option, value: option } : option,
  )

  return (
    <label className={wrapperClass}>
      <span className="text-xs uppercase tracking-[0.18em] text-primary/75">{field.label}</span>
      {field.type === "textarea" ? (
        <textarea
          rows={field.rows ?? 4}
          value={value}
          placeholder={field.placeholder}
          readOnly={field.readOnly}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
        />
      ) : field.type === "select" ? (
        <select
          value={value}
          disabled={field.readOnly}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none"
        >
          {selectOptions.map((option, index) => (
            <option key={`${option.value}-${index}`} value={option.value} className="bg-background">
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          value={value}
          placeholder={field.placeholder}
          readOnly={field.readOnly}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
        />
      )}
      {field.description ? <p className="text-xs leading-6 text-muted-foreground">{field.description}</p> : null}
    </label>
  )
}

export function DedicatedActionWorkspace({
  title,
  description,
  backHref,
  backLabel,
  initialValues,
  sections,
  aiActionLabel,
  aiActionDescription,
  primaryActionLabel = "Salvar workspace",
  primaryActionDescription = "A acao principal foi registrada. O fluxo completo sera liberado em breve.",
  draftActionDescription = "Os rascunhos deste workspace serao habilitados em uma proxima etapa.",
  hideDraftAction = false,
  hidePreviewAction = false,
  previewActionDescription = "O preview completo deste workspace sera conectado em uma proxima etapa.",
  previewTitle,
  previewDescription,
  renderPreview,
  sidebarInfo,
  helpCard,
  extraSidebar,
  bottomContent,
  transformValues,
  onPrimaryAction,
  onDraftAction,
}: DedicatedActionWorkspaceProps) {
  const [values, setValues] = useState<Record<string, string>>(initialValues)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)

  useEffect(() => {
    setValues(initialValues)
  }, [initialValues])

  const sidebarItems = useMemo(
    () =>
      sidebarInfo?.items.map((item) => ({
        label: item.label,
        hint: item.hint,
        value: typeof item.value === "function" ? item.value(values) : item.value,
      })) ?? [],
    [sidebarInfo?.items, values],
  )

  return (
    <PageShell>
      <SectionHeader
        title={title}
        description={description}
        actions={
          <>
            <SecondaryButton asChild>
              <Link href={backHref}>
                <ArrowLeft className="h-4 w-4" />
                {backLabel}
              </Link>
            </SecondaryButton>
            {aiActionLabel ? <SmartActionButton label={aiActionLabel} description={aiActionDescription} /> : null}
            {hideDraftAction ? null : (
              <SecondaryButton
                onClick={async () => {
                  if (isSavingDraft || isSubmitting) return

                  if (!onDraftAction) {
                    toast({
                      title: "Rascunho em preparacao",
                      description: draftActionDescription,
                    })
                    return
                  }

                  try {
                    setIsSavingDraft(true)
                    await onDraftAction(values)
                  } catch (error) {
                    if (process.env.NODE_ENV !== "production") {
                      console.error("[DedicatedActionWorkspace] draft action failed", error)
                    }
                    toast({
                      title: "Nao foi possivel salvar o rascunho",
                      description: error instanceof Error ? error.message : "Revise os dados e tente novamente.",
                    })
                  } finally {
                    setIsSavingDraft(false)
                  }
                }}
                disabled={isSavingDraft || isSubmitting}
              >
                <Save className="h-4 w-4" />
                {isSavingDraft ? "Salvando rascunho..." : "Salvar rascunho"}
              </SecondaryButton>
            )}
            <PrimaryButton
              onClick={async () => {
                if (isSubmitting || isSavingDraft) return

                if (!onPrimaryAction) {
                  toast({
                    title: primaryActionLabel,
                    description: primaryActionDescription,
                  })
                  return
                }

                try {
                  setIsSubmitting(true)
                  await onPrimaryAction(values)
                } catch (error) {
                  if (process.env.NODE_ENV !== "production") {
                    console.error("[DedicatedActionWorkspace] primary action failed", error)
                  }
                  toast({
                    title: "Nao foi possivel concluir a acao",
                    description: error instanceof Error ? error.message : "Revise os dados e tente novamente.",
                  })
                } finally {
                  setIsSubmitting(false)
                }
              }}
              disabled={isSubmitting || isSavingDraft}
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "Salvando..." : primaryActionLabel}
            </PrimaryButton>
          </>
        }
      />

      <OperationalWorkspaceLayout
        sidebar={
          <>
            <LivePreviewPanel
              title={previewTitle}
              description={previewDescription}
              footer={hidePreviewAction ? null : (
                <SecondaryButton
                  onClick={() =>
                    toast({
                      title: "Preview em preparacao",
                      description: previewActionDescription,
                    })
                  }
                >
                  <Globe className="h-4 w-4" />
                  Abrir preview
                </SecondaryButton>
              )}
            >
              {renderPreview(values)}
            </LivePreviewPanel>
            {sidebarInfo ? <WorkspaceSidebarInfo title={sidebarInfo.title} description={sidebarInfo.description} items={sidebarItems} /> : null}
            {extraSidebar}
            {helpCard ? <SetupGuideCard title={helpCard.title} description={helpCard.description} steps={helpCard.steps} /> : null}
          </>
        }
      >
        {sections.map((section) => (
          <WorkspaceSectionCard key={section.title} title={section.title} description={section.description}>
            {section.fields
              .filter((field) => !field.hidden?.(values))
              .map((field) => (
              <FieldRenderer
                key={field.key}
                field={field}
                value={values[field.key] ?? ""}
                values={values}
                onChange={(nextValue) =>
                  setValues((current) => {
                    const nextValues = { ...current, [field.key]: nextValue }
                    return transformValues ? transformValues(nextValues, field.key) : nextValues
                  })
                }
              />
            ))}
          </WorkspaceSectionCard>
        ))}
        {bottomContent}
      </OperationalWorkspaceLayout>
    </PageShell>
  )
}
