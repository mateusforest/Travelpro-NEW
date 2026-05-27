# Agency Rebuild V3

Camada isolada para a futura Agencia V3 do TravelPro.

Princípios:

- não depende estruturalmente de `components/agency/agency-pages.tsx`
- não depende de `components/system/portal-page.tsx`
- não depende de `components/system/portal-layout.tsx`
- não depende de `lib/services/portal-pages.ts`
- não depende de `lib/services/agency-extra-pages.ts`
- não está conectada às rotas atuais
- reaproveita apenas primitives de UI, branding e core real do projeto

Pastas:

- `shell/`
- `dashboard/`
- `clients/`
- `leads/`
- `trips/`
- `documents/`
- `finance/`
- `reports/`
- `team/`
- `settings/`
- `credits/`
- `expansions/`
- `atlas/`
- `shared/`
- `actions/`
- `modals/`
- `drawers/`
- `widgets/`
