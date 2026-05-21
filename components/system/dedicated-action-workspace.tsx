"use client"

import Link from "next/link"
import { useMemo, useState, type ReactNode } from "react"
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

export type WorkspaceFieldConfig = {
  key: string
  label: string
  type?: WorkspaceFieldType
  placeholder?: string
  options?: string[]
  colSpan?: 1 | 2
  rows?: number
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
  onPrimaryAction?: (values: Record<string, string>) => Promise<void> | void
}

function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: WorkspaceFieldConfig
  value: string
  onChange: (value: string) => void
}) {
  const wrapperClass = field.colSpan === 2 ? "space-y-2 md:col-span-2" : "space-y-2"

  return (
    <label className={wrapperClass}>
      <span className="text-xs uppercase tracking-[0.18em] text-primary/75">{field.label}</span>
      {field.type === "textarea" ? (
        <textarea
          rows={field.rows ?? 4}
          value={value}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
        />
      ) : field.type === "select" ? (
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none"
        >
          {(field.options ?? []).map((option) => (
            <option key={option} value={option} className="bg-background">
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          value={value}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
        />
      )}
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
  primaryActionDescription = "A ação principal foi preparada em modo mockado.",
  previewTitle,
  previewDescription,
  renderPreview,
  sidebarInfo,
  helpCard,
  extraSidebar,
  bottomContent,
  onPrimaryAction,
}: DedicatedActionWorkspaceProps) {
  const [values, setValues] = useState<Record<string, string>>(initialValues)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
            <SecondaryButton
              onClick={() =>
                toast({
                  title: "Rascunho salvo",
                  description: "O workspace foi salvo localmente em modo mockado.",
                })
              }
            >
              <Save className="h-4 w-4" />
              Salvar rascunho
            </SecondaryButton>
            <PrimaryButton
              onClick={async () => {
                if (isSubmitting) return

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
                } finally {
                  setIsSubmitting(false)
                }
              }}
              disabled={isSubmitting}
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
            <LivePreviewPanel title={previewTitle} description={previewDescription} footer={<SecondaryButton onClick={() => toast({ title: "Preview preparado", description: "A leitura pública ou operacional foi preparada em modo mockado." })}><Globe className="h-4 w-4" />Abrir preview</SecondaryButton>}>
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
            {section.fields.map((field) => (
              <FieldRenderer
                key={field.key}
                field={field}
                value={values[field.key] ?? ""}
                onChange={(nextValue) => setValues((current) => ({ ...current, [field.key]: nextValue }))}
              />
            ))}
          </WorkspaceSectionCard>
        ))}
        {bottomContent}
      </OperationalWorkspaceLayout>
    </PageShell>
  )
}
