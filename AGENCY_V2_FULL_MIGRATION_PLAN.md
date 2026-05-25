# Agency V2 Full Migration Plan

Date: 2026-05-24

## Objective

Complete the frontend migration of the TravelPro Agency portal into the V2 workspace language without changing backend, Auth, Supabase schema, RLS or real APIs.

## Current Migration Rule

Every Agency session must end in one of these outcomes:

1. V2 page
2. V2 modal or drawer
3. Real backend action
4. Honest future-state toast
5. Disabled state with a clear reason

No visible path should fall back to a generic legacy `PortalPage` in the primary Agency runtime.

## Route Map

| Route | Module | Current File | Visual Before This Pass | Visible Broken / Legacy Point | Expected Destination | Migration Plan | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/app/dashboard` | Dashboard | `components/agency/agency-pages.tsx` | V2 | None critical | V2 workspace hub | Keep and refine through V2 cards/modals only | Already V2 |
| `/app/clientes` | Clientes | `components/agency/agency-pages.tsx` | V2 | None critical | V2 client workspace | Keep in V2 and continue polishing inline actions | Already V2 |
| `/app/leads` | Leads | `components/agency/agency-pages.tsx` | V2 | None critical | V2 pipeline workspace | Keep in V2 and continue polishing quick conversion flows | Already V2 |
| `/app/viagens` | Viagens | `components/agency/agency-pages.tsx` | V2 | None critical | V2 trip workspace | Keep in V2 and continue polishing shared-trip flows | Already V2 |
| `/app/viagens/roteiros` | Roteiros | `components/agency/agency-pages.tsx` via `app/app/viagens/[subsection]/page.tsx` | V2 + legacy fallback code path | Route file still imported `PortalPage` as fallback | V2 itinerary workspace | Remove visible fallback and keep direct V2 rendering only | Migrated in this pass |
| `/app/viagens/cotacoes` | Cotações | `components/agency/agency-pages.tsx` via `app/app/viagens/[subsection]/page.tsx` | V2 + legacy fallback code path | Route file still imported `PortalPage` as fallback | V2 quote workspace | Remove visible fallback and keep direct V2 rendering only | Migrated in this pass |
| `/app/documentos` | Documentos | `components/agency/agency-pages.tsx` | V2 | None critical | V2 document hub | Keep in V2 and continue polishing | Already V2 |
| `/app/documentos/contratos` | Contratos | `components/agency/agency-pages.tsx` via `app/app/documentos/[subsection]/page.tsx` | V2 + legacy fallback code path | Route file still imported `PortalPage` as fallback | V2 contract workspace | Remove visible fallback and keep direct V2 rendering only | Migrated in this pass |
| `/app/documentos/vouchers` | Vouchers | `components/agency/agency-pages.tsx` via `app/app/documentos/[subsection]/page.tsx` | V2 + legacy fallback code path | Route file still imported `PortalPage` as fallback | V2 voucher workspace | Remove visible fallback and keep direct V2 rendering only | Migrated in this pass |
| `/app/documentos/recibos` | Recibos | `components/agency/agency-pages.tsx` via `app/app/documentos/[subsection]/page.tsx` | V2 + legacy fallback code path | Route file still imported `PortalPage` as fallback | V2 receipt workspace | Remove visible fallback and keep direct V2 rendering only | Migrated in this pass |
| `/app/documentos/passagens` | Passagens | `components/agency/agency-pages.tsx` via `app/app/documentos/[subsection]/page.tsx` | V2 + legacy fallback code path | Route file still imported `PortalPage` as fallback | V2 tickets workspace | Remove visible fallback and keep direct V2 rendering only | Migrated in this pass |
| `/app/documentos/templates` | Templates | `components/agency/agency-pages.tsx` via `app/app/documentos/[subsection]/page.tsx` | V2 + legacy fallback code path | Route file still imported `PortalPage` as fallback | V2 template library | Remove visible fallback and keep direct V2 rendering only | Migrated in this pass |
| `/app/financeiro` | Financeiro | `components/agency/agency-pages.tsx` | V2 | None critical | V2 finance workspace | Keep in V2 and continue polishing | Already V2 |
| `/app/relatorios` | Relatórios | `components/agency/agency-pages.tsx` | V2 | None critical | V2 reports workspace | Keep in V2 and continue polishing | Already V2 |
| `/app/creditos` | Créditos | `app/app/creditos/page.tsx` -> `components/agency/agency-pages.tsx` | V2 | None critical | V2 credits workspace | Keep in V2 | Already V2 |
| `/app/central-operacional` | Central Operacional | `components/agency/agency-pages.tsx` | V2 | None critical | V2 operational hub | Keep in V2 | Already V2 |
| `/app/central-operacional/insights` | Insights | `components/agency/agency-pages.tsx` via `app/app/central-operacional/[subsection]/page.tsx` | V2 + legacy fallback code path | Route file still imported `PortalPage` as fallback | V2 insights screen | Remove visible fallback and keep direct V2 rendering only | Migrated in this pass |
| `/app/central-operacional/creditos` | Créditos operacionais | `components/agency/agency-pages.tsx` via `app/app/central-operacional/[subsection]/page.tsx` | V2 + legacy fallback code path | Route file still imported `PortalPage` as fallback | V2 credits screen | Remove visible fallback and keep direct V2 rendering only | Migrated in this pass |
| `/app/central-operacional/tarefas` | Tarefas | `components/agency/agency-pages.tsx` via `app/app/central-operacional/[subsection]/page.tsx` | V2 + legacy fallback code path | Route file still imported `PortalPage` as fallback | V2 task workspace | Remove visible fallback and keep direct V2 rendering only | Migrated in this pass |
| `/app/central-operacional/relatorios` | Relatórios operacionais | `components/agency/agency-pages.tsx` via `app/app/central-operacional/[subsection]/page.tsx` | V2 + legacy fallback code path | Route file still imported `PortalPage` as fallback | V2 report workspace | Remove visible fallback and keep direct V2 rendering only | Migrated in this pass |
| `/app/catalogo` | Catálogo | `app/app/catalogo/page.tsx` | V2 | None critical | V2 catalog workspace | Keep in V2 and continue polishing | Already V2 |
| `/catalogo/[slug]` | Vitrine pública | `app/catalogo/[slug]/page.tsx` | V2 | None critical | Public premium showcase | Keep and polish only when needed | Already V2 |
| `/app/equipe` | Equipe | `components/agency/agency-pages.tsx` | V2 | None critical | V2 team workspace | Keep in V2 | Already V2 |
| `/app/planos` | Planos / Billing | `app/app/planos/page.tsx` | V2 | None critical | V2 plans and billing reading | Keep in V2 | Already V2 |
| `/app/travelpro-go` | TravelPro Go | `components/agency/agency-pages.tsx` | V2 | None critical | V2 expansion screen | Keep in V2 with honest states | Already V2 |
| `/app/agent` | TravelPro Agent | `components/agency/agency-pages.tsx` | V2 | None critical | V2 expansion screen | Keep in V2 with honest states | Already V2 |
| `/app/marketing` | Marketing | `components/agency/agency-pages.tsx` via dynamic route | V2 | None critical | V2 expansion screen | Keep in V2 with honest states | Already V2 |
| `/app/automacoes` | Automações | `app/app/automacoes/page.tsx` | V1 visible fallback | Static route overrode the existing V2 page and rendered `PortalPage` | V2 automation workspace | Replace static page with `AgencyAutomationsPage` | Migrated in this pass |
| `/app/atlas-advisor` | Atlas Advisor | `app/app/atlas-advisor/page.tsx` | V1 visible fallback | Static route overrode the existing V2 page and rendered `PortalPage` | V2 Advisor workspace | Replace static page with `AgencyAtlasAdvisorPage` | Migrated in this pass |
| `/app/catalogo/travelpro-match` | Match | `app/app/catalogo/travelpro-match/page.tsx` | V2 | None critical | V2 expansion screen | Keep in V2 with honest states | Already V2 |
| `/app/configuracoes` | Configurações | `app/app/[section]/page.tsx` + `portal-pages.ts` | V1 visible fallback | Dynamic route still landed on generic `PortalPage` | V2 agency settings center | Create `AgencySettingsPage` and wire route directly | Migrated in this pass |
| `/app/roteiros` | Legacy alias route | `app/app/[section]/page.tsx` + `portal-pages.ts` | V1 visible fallback | Old route existed but landed on generic legacy shell | V2 itinerary workspace | Wire alias directly to `AgencyRoteirosPage` | Migrated in this pass |
| `/app/cotacoes` | Legacy alias route | `app/app/[section]/page.tsx` + `portal-pages.ts` | V1 visible fallback | Old route existed but landed on generic legacy shell | V2 quote workspace | Wire alias directly to `AgencyCotacoesPage` | Migrated in this pass |
| `/app/contratos` | Legacy alias route | `app/app/[section]/page.tsx` + `portal-pages.ts` | V1 visible fallback | Old route existed but landed on generic legacy shell | V2 contract workspace | Wire alias directly to `AgencyContractsPage` | Migrated in this pass |
| `/app/travelpro-match` | Legacy alias route | `app/app/[section]/page.tsx` + `portal-pages.ts` | V1 visible fallback | Old route could still appear through dynamic section | Correct Match route | Redirect to `/app/catalogo/travelpro-match` | Migrated in this pass |
| Profile menu dialogs | Minha Conta / Preferências / Billing entrypoints | `components/system/profile-menu.tsx` | V2 | None critical | V2 dialog or route push | Keep dialogs and route push pattern | Already V2 |

## Legacy Dependencies Still Present Internally

These files can remain for now, but they should no longer be visible as the primary Agency experience:

- `components/system/portal-page.tsx`
- `lib/services/portal-pages.ts`
- `lib/services/agency-extra-pages.ts`

Current position:
- still useful for static params and legacy compatibility
- no longer desirable as the visible Agency shell

## Migration Phases

### Phase A — Mapping
- Identify all Agency routes still using `PortalPage`
- Identify all static route overrides still pointing to legacy surfaces
- Record V1, V2 or mixed state

Status: completed in this pass

### Phase B — Route Migration
- Wire all visible Agency routes to explicit V2 pages
- Replace static legacy overrides with V2 components
- Remove visible `PortalPage` fallback from active Agency subroutes

Status: completed for the visible Agency runtime in this pass

### Phase C — Modal / Drawer Standardization
- Keep V2 modals and drawers as the only visible pattern in critical flows
- Preserve controlled state, explicit button type and honest feedback

Status: already largely in place; continue polishing by module as needed

### Phase D — CTA Hardening
- Confirm no visible Agency CTA remains silent
- Route future features to honest toasts
- Keep destructive actions confirmed

Status: ongoing; latest runtime audit already recorded in `CTA_RUNTIME_FULL_AUDIT.md`

### Phase E — Validation
- `npm run lint`
- `npm run build`
- commit and push

Status: to run after this migration pass

## Remaining Non-Blocking Pendencies

- `portal-pages.ts` and `agency-extra-pages.ts` still exist as compatibility/config layers
- Some future-state routes still intentionally use honest toasts instead of real backend actions
- `Minha conta` remains dialog-first rather than a dedicated full page, which is acceptable under the V2 rule because it is a functional V2 dialog
