# CTA Actions Runtime Audit

Date: 2026-05-22

Scope audited in this pass:
- Header
- Portal Agencia critical workspaces and primary CRUD flows
- Portal Master critical CRUD and reporting flows
- Critical drawers, dialogs, dropdown actions, and front/back requests tied to those flows

Method:
- Read the real rendered route switchers in `app/app/[section]/page.tsx` and `app/master/[section]/page.tsx`
- Inspected the active header stack: `portal-header`, `mobile-nav`, `notification-panel`, `profile-menu`, `command-palette`
- Inspected the main real action surfaces in:
  - `components/agency/agency-pages.tsx`
  - `components/master/master-real-pages.tsx`
  - `components/master/master-stabilized-pages.tsx`
  - `components/master/master-report-template-pages.tsx`
  - `components/master/master-template-workspace.tsx`
  - `components/agency/report-workspace.tsx`

Project rule confirmed in this pass:
- Critical drawers should not rely only on `DrawerTrigger` uncontrolled propagation.
- Use local controlled state with explicit button click:
  - `const [open, setOpen] = useState(false)`
  - `type="button"`
  - `onClick={() => setOpen(true)}`

## Critical and High Priority Items

| File | Component | CTA / Action | Expected Type | Current Status | Problem Found | Correction Applied / Recommended | Priority |
|---|---|---|---|---|---|---|---|
| `components/system/notification-panel.tsx` | `NotificationPanel` | Notification bell | Drawer | Fixed before this pass | `DrawerTrigger asChild` was not reliably opening with this flow | Already fixed with local controlled state and explicit `onClick` | Critical |
| `components/system/mobile-nav.tsx` | `MobileNav` | Mobile menu button | Drawer | Fixed in this pass | Critical header navigation still relied on global uncontrolled trigger path | Applied local controlled drawer state, explicit `type="button"` and `onClick={() => setOpen(true)}` | Critical |
| `components/system/portal-header.tsx` | `PortalHeader` | Quick actions button | Dropdown trigger | Fixed in this pass | Trigger button had no explicit `type="button"` | Added explicit `type="button"` to avoid form-side effects and brittle trigger behavior | High |
| `components/system/profile-menu.tsx` | `ProfileMenu` | Avatar / profile trigger | Dropdown trigger | Fixed in this pass | Trigger button had no explicit `type="button"` | Added explicit `type="button"` | High |
| `components/system/command-palette.tsx` | `CommandPalette` | Open command palette | Dialog trigger | Fixed in this pass | Critical open button had no explicit `type="button"` | Added explicit `type="button"` | High |
| `components/agency/agency-pages.tsx` | `AgencyTripsPage` | Compartilhar viagem / Copiar link / Abrir link / Desativar link | API + feedback | Healthy | Main share-link flow is connected to real API and guarded with toasts | Keep as is | High |
| `components/agency/agency-pages.tsx` | `AgencyFinancePage` | Novo lançamento / Editar / Excluir / Registrar pagamento / Gerar relatório | CRUD + API | Healthy | Uses real routes and feedback; no dead critical CTA found in this pass | Keep as is | High |
| `components/agency/report-workspace.tsx` | `ReportWorkspace` | Gerar relatório / Salvar relatório | API | Healthy | Validates input, uses real compose and save routes, shows feedback | Keep as is | High |
| `components/master/master-real-pages.tsx` | `MasterAgenciesPage` | Editar / Ativar-Inativar | API + Dialog | Healthy | Real routes, toast on error, no dead primary CTA found | Keep as is | High |
| `components/master/master-real-pages.tsx` | `MasterUsersPage` | Visualizar / Editar | API + Dialog | Healthy | Real routes and error feedback present | Keep as is | High |
| `components/master/master-report-template-pages.tsx` | `MasterReportsRealPage` | Gerar relatório / Abrir relatório / Visualizar / Gerar novamente | API + navigation | Healthy | Real routes and feedback present | Keep as is | High |
| `components/master/master-report-template-pages.tsx` | `MasterTemplatesRealPage` | Visualizar / Editar / Duplicar / Ativar-desativar / Publicar | API + navigation | Healthy | Real routes and feedback present | Keep as is | High |

## Medium and Low Priority Items

| File | Component | CTA / Action | Expected Type | Current Status | Problem Found | Correction Applied / Recommended | Priority |
|---|---|---|---|---|---|---|---|
| `components/system/modal.tsx` | `Modal` | Generic modal trigger | Dialog | Not used by active critical flows in this audit | Still relies on uncontrolled `DialogTrigger asChild` | Leave unchanged now; convert to controlled only if a real failing flow is confirmed | Medium |
| `components/system/profile-menu.tsx` | `ProfileMenu` | Settings and account save actions | Future / local feedback | Honest toast | No backend persistence by design in this phase | Leave as toast; avoid fake persistence | Medium |
| `components/master/master-stabilized-pages.tsx` | Marketplace / Plans / Settings stable pages | Exportar, editar comercial, aplicar parâmetros | Future | Honest toast | No safe backend intended yet | Leave as “Em breve” | Medium |
| `components/system/command-palette.tsx` | `CommandPalette` | Shortcut labels and descriptions | UI text | Functional | Some visible mojibake remains in copy | Fix later in a focused text-cleanup pass, not in this surgical runtime pass | Low |
| `components/system/notification-panel.tsx` | `NotificationPanel` | Default titles and descriptions | UI text | Functional | Some visible mojibake remains in default strings | Fix later in a focused text-cleanup pass | Low |

## API / Front-Back Notes

- Checked active front/back pairs in the audited critical flows:
  - `/api/master/agencies`
  - `/api/master/agencies/[id]`
  - `/api/master/users`
  - `/api/master/users/[id]`
  - `/api/master/reports`
  - `/api/master/reports/[id]`
  - `/api/master/templates`
  - `/api/master/templates/[id]`
  - `/api/reports`
  - `/api/reports/[id]/regenerate`
  - `/api/trips/[id]/share-link`
- No confirmed critical 400/500 contract break was found in the audited primary flows during static inspection.
- Existing request helpers in the real pages already normalize API errors into user-facing toasts in the main CRUD/reporting flows.

## Summary

- Critical runtime issues corrected in this pass: 4
- High-priority hardening fixes applied in this pass: 3
- Critical/high flows audited and kept as-is because they are already connected: 8
- Deferred medium/low items left intentionally unchanged: 5
