# CTA Runtime Full Audit

Date: 2026-05-24

## Scope

Audited in this pass:
- Portal Agencia
  - Dashboard
  - Clientes
  - Leads
  - Viagens
  - Documentos
  - Contratos
  - Vouchers
  - Recibos
  - Passagens
  - Templates
  - Financeiro
  - Relatorios
  - Creditos
  - Central Operacional
  - Catalogo
  - Vitrine publica
  - Equipe
  - Planos
  - Expansoes
  - TravelPro Go
  - TravelPro Agent
  - Marketing
  - Automacoes
  - Atlas Advisor
  - Match
  - Minha conta / menu de perfil
- Rotas publicas
  - `/v/[token]`
  - `/catalogo/[slug]`
- Portal Master
  - Dashboard
  - Agencias
  - Usuarios
  - Financeiro
  - IA e Creditos
  - Relatorios
  - Templates
  - Logs
  - Marketplace
  - Planos
  - WhatsApp
  - Configuracoes

## Method

- Checked the real route switchers:
  - `app/app/[section]/page.tsx`
  - `app/app/viagens/[subsection]/page.tsx`
  - `app/app/documentos/[subsection]/page.tsx`
  - `app/app/central-operacional/[subsection]/page.tsx`
  - `app/master/[section]/page.tsx`
- Confirmed which screens render the V2 Agency pages directly from `components/agency/agency-pages.tsx`
- Confirmed which Master screens render the real/stable pages:
  - `components/master/master-real-pages.tsx`
  - `components/master/master-ai-whatsapp-pages.tsx`
  - `components/master/master-report-template-pages.tsx`
  - `components/master/master-stabilized-pages.tsx`
- Cross-checked visible actions, dropdown items, drawers, dialogs, copy/open link flows and report exports
- Searched for fragile patterns:
  - `href="#"` and `href=""`
  - `console.log()` and `alert()` as terminal actions
  - `window.open`, `window.location.href`, `navigator.clipboard.writeText`
  - `DropdownMenuItem`, `DrawerTrigger`, `DialogTrigger`

## Audit Result

- `href="#"` in active Agency/Master/public flows: `0` critical findings
- `href=""` in active Agency/Master/public flows: `0`
- `console.log()` as final CTA action: `0`
- `alert()` as final CTA action: `0`
- Confirmed critical drawer rule remains applied on active V2 flows:
  - local controlled state
  - `type="button"`
  - explicit `onClick`

## Active Route Notes

- Agency V2 is rendered primarily by `components/agency/agency-pages.tsx`
- Several deep Agency fallback routes still use `PortalPage` + `portal-pages` or `agency-extra-pages`
- Master active routes no longer use `components/master/master-pages.tsx`
- `components/master/master-pages.tsx` remains legacy and should not be treated as the active Master runtime surface

## Detailed Findings

| Route | File / Component | CTA / Action | Expected Type | Status Found | Problem | Correction Applied | Priority | Future Pendency |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/app/dashboard` | `components/system/agency-workspace-layout.tsx` | Module menu trigger | Drawer V2 | Healthy | Controlled drawer already in place | None needed | High | None |
| `/app/dashboard` | `components/system/profile-menu.tsx` | Profile trigger / panels | Dropdown + Dialog V2 | Healthy | Explicit button and controlled dialogs already present | None needed | High | Settings persistence still honest/local where no backend exists |
| `/app/dashboard` | `components/agency/agency-pages.tsx` | `Criar com IA` actions | Modal V2 + real flows | Healthy | Opens V2 actions or honest toast | None needed | High | Future AI execution remains intentionally deterministic |
| `/app/clientes` | `components/agency/agency-pages.tsx` | Novo cliente / abrir perfil / criar viagem / gerar cotacao | Modal V2 + navigation | Healthy | Real quick-create plus deep fallback routes exist | None needed | High | Full inline profile editing can stay deep route |
| `/app/leads` | `components/agency/agency-pages.tsx` | Novo lead / iniciar atendimento / converter / criar cotacao | Modal V2 + actions | Healthy | Quick-create works and unsupported actions use honest feedback | None needed | High | Automated qualification stays future |
| `/app/viagens` | `components/agency/agency-pages.tsx` | Compartilhar viagem / copiar link | API + feedback | Healthy | Real API flow with feedback already connected | None needed | High | None |
| `/app/viagens` | `components/agency/agency-pages.tsx` | Abrir link | API + new tab | Fixed in this pass | One active flow still opened the tab only after async work, risking popup blocking | Pre-open blank tab and hydrate URL after API success; close on failure | Critical | None |
| `/app/viagens` | `components/agency/agency-pages.tsx` | Desativar link | API + feedback | Healthy | Real PATCH flow and toast present | None needed | High | None |
| `/app/viagens` | `components/agency/agency-pages.tsx` | Alterar status | API + feedback | Healthy | Real PATCH flow and dashboard refresh present | None needed | High | None |
| `/app/documentos` | `components/agency/agency-pages.tsx` | Novo documento / revisar / enviar | Modal V2 + API | Healthy | Real create and update flows present | None needed | High | PDF/send automation still future where applicable |
| `/app/documentos/contratos` | `components/agency/agency-pages.tsx` | Visualizar / editar / usar template | Navigation + workspace | Healthy | V2 screen active, deep route fallback valid | None needed | High | None |
| `/app/viagens/roteiros` | `components/agency/agency-pages.tsx` | Novo roteiro / duplicar / compartilhar | Modal V2 + toast | Healthy | Real create path exists and future-sharing stays honest | None needed | High | Advanced export/share still future |
| `/app/viagens/cotacoes` | `components/agency/agency-pages.tsx` | Nova cotacao / follow-up / converter | Modal V2 + feedback | Healthy | Real create path exists and unsupported automation remains honest | None needed | High | Conversion automation can stay future |
| `/app/financeiro` | `components/agency/agency-pages.tsx` | Novo lancamento / marcar como pago / gerar relatorio | CRUD + export | Healthy | Real create/update flows and report links exist | None needed | High | None |
| `/app/relatorios` | `components/agency/agency-pages.tsx` | Baixar relatorio | API download | Fixed in this pass | Download still used `window.location.href`, causing abrupt navigation and no positive feedback | Switched to download helper and success toast | High | None |
| `/app/relatorios` | `components/agency/agency-pages.tsx` | Gerar novamente / abrir PDF | API + new tab | Healthy | Real actions with loading/toast already present | None needed | High | None |
| `/app/central-operacional` | `components/agency/agency-pages.tsx` | Criar tarefa / abrir prioridade / gerar relatorio | Modal V2 + navigation | Healthy | Visible CTAs respond and fall back correctly | None needed | High | None |
| `/app/creditos` | `components/agency/agency-pages.tsx` | Ver historico / entender consumo / comprar creditos | Navigation + honest toast | Healthy | Real reading is present; unsafe billing remains honest | None needed | Medium | Billing activation remains future |
| `/app/planos` | `app/app/planos/page.tsx` | Solicitar upgrade / ativar expansao / falar com suporte | Honest CTA | Healthy | No fake billing found | None needed | Medium | Billing real remains future |
| `/app/catalogo` | `app/app/catalogo/page.tsx` | Publicar / despublicar / copiar link / preview | API + feedback | Healthy | Copy and preview flows already guarded | None needed | High | Match distribution remains future |
| `/catalogo/[slug]` | `app/catalogo/[slug]/page.tsx` | Voltar / ver pacotes / CTA WhatsApp | Public navigation | Healthy | Uses public anchors and external CTA correctly | None needed | High | None |
| `/v/[token]` | `components/public/public-trip-experience.tsx` | Document links / WhatsApp CTA | Public navigation | Healthy | Public route remains login-free and constrained to safe data | None needed | High | None |
| `/app/atlas-advisor` | `app/app/atlas-advisor/page.tsx` + `PortalPage` | Nova consulta / ver historico | Legacy fallback | Honest but legacy | Route is functional, but still renders via `PortalPage` legacy shell rather than a true V2 micro-workspace | Documented only | Medium | Eligible for future V2 internal-screen migration |
| `/app/automacoes` | `app/app/automacoes/page.tsx` + `PortalPage` | Novo fluxo / ver historico | Legacy fallback | Honest but legacy | Functional fallback, not a silent CTA problem | Documented only | Medium | Eligible for future V2 migration |
| `/master/dashboard` | `components/master/master-real-pages.tsx` | Abrir agencias / abrir financeiro / IA e creditos | Navigation | Healthy | Active Master surface uses real routes | None needed | High | None |
| `/master/agencias` | `components/master/master-real-pages.tsx` | Nova agencia / editar / ativar-inativar | API + dialog | Healthy | Connected to real API and guarded with feedback | None needed | High | None |
| `/master/usuarios` | `components/master/master-real-pages.tsx` | Visualizar / editar / ativar | API + dialog | Healthy | Real flow and feedback present | None needed | High | None |
| `/master/financeiro` | `components/master/master-real-pages.tsx` | Exportar / gerar cobranca | Honest CTA | Healthy | No fake billing introduced | None needed | Medium | Billing real remains future |
| `/master/ia-creditos` | `components/master/master-ai-whatsapp-pages.tsx` | Configurar IA / ajustar creditos / filtros / abrir subrotas | Navigation + honest toast | Healthy | Active route family exists and actions respond | None needed | High | OpenAI real remains future |
| `/master/relatorios` | `components/master/master-report-template-pages.tsx` | Exportar | API download | Fixed in this pass | Export still used `window.location.href`, causing abrupt navigation and no positive feedback | Switched to download helper plus success toast | High | None |
| `/master/templates` | `components/master/master-report-template-pages.tsx` | Novo template / editar / duplicar / publicar | API + dialog | Healthy | Real actions and honest future states already present | None needed | High | None |
| `/master/logs` | `components/master/master-stabilized-pages.tsx` | Filtros / abrir origem | Real read + navigation | Healthy | No dead visible CTA found | None needed | Medium | None |
| `/master/marketplace` | `components/master/master-stabilized-pages.tsx` | Destacar / remover / editar comercial | Honest CTA | Healthy | No safe backend intended yet; feedback is honest | None needed | Medium | Full marketplace controls remain future |
| `/master/planos` | `components/master/master-stabilized-pages.tsx` | Editar plano / excluir / salvar pacote | Honest CTA | Healthy | No fake billing or destructive silent action found | None needed | Medium | Commercial backend remains future |
| `/master/configuracoes` | `components/master/master-stabilized-pages.tsx` | Salvar parametros / aplicar | Honest/local feedback | Healthy | Active Master section route exists through `[section]` switcher | None needed | Medium | Dedicated persistence can come later |
| legacy inactive Master surface | `components/master/master-pages.tsx` | Multiple dropdown actions marked `mockado` | Legacy component | Inactive | File still contains legacy/mock actions, but it is not used by active Master routes anymore | Left untouched; documented as inactive | Low | Remove or migrate only in a dedicated cleanup pass |

## Remaining Controlled Pendencies

These are not runtime breakages, but they still matter:

- Deep Agency fallback routes still rendered by `PortalPage`:
  - `/app/atlas-advisor`
  - `/app/automacoes`
  - some deep sections from `agency-extra-pages`
- They are navigable and their CTAs respond, but they do not yet match the full V2 internal workspace language
- Legacy `components/master/master-pages.tsx` still exists with mock copy and mock actions, but it is not in the active Master route switch anymore

## Summary

- Routes audited directly in active runtime shells: `30+`
- Critical/high fixes applied in this pass: `3`
  - Agency trip link open hardened against popup blocking
  - Agency report export changed to download helper + success toast
  - Master report export changed to download helper + success toast
- Confirmed healthy active flows without changes: `20+`
- Legacy-but-functional fallback surfaces documented: `4`
- Inactive legacy Master component documented instead of edited: `1`
