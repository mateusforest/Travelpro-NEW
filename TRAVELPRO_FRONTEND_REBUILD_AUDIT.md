# TravelPro Frontend Rebuild Audit

Data: 2026-05-25  
Escopo: auditoria para reconstrução controlada do frontend, preservando backend, Supabase, Auth, serviços e deploy atual.

## Resumo Executivo

O projeto já tem um core funcional valioso:

- backend em `app/api/**`
- integração Supabase em `lib/supabase/**`
- guarda de acesso em `proxy.ts`
- serviços reais em `lib/services/**`
- tipos fortes em `types/**`
- rota pública compartilhável em `/v/[token]`

O problema principal não está no core de dados. Está na camada de apresentação e orquestração visual:

- múltiplas gerações de frontend coexistem
- parte da Agência já foi migrada para V2, mas ainda convive com wrappers híbridos
- Master ainda mistura páginas estabilizadas, reais e legadas
- Portal Cliente com login continua baseado em estrutura antiga
- existe dependência forte de catálogos visuais/configs em `portal-pages.ts` e `agency-extra-pages.ts`
- alguns componentes globais ainda carregam responsabilidades demais

A recomendação é **não remendar mais a UI atual**.  
O caminho mais seguro é:

1. congelar e preservar o core
2. isolar o frontend legado
3. criar uma nova camada de portais limpa
4. migrar rota por rota para a nova shell
5. só depois remover o legado visual

## 1. CORE / PRESERVAR

Estes arquivos e diretórios são backend/core ou sustentam dados reais. Devem ser preservados.

### Backend HTTP

- `app/api/**`
- cobre auth, catálogo, clientes, leads, viagens, documentos, financeiro, relatórios, tarefas, equipe, créditos, share links, Master, Stripe, WhatsApp, OpenAI

Rotas backend atuais:

- `app/api/auth/bootstrap/route.ts`
- `app/api/auth/me/route.ts`
- `app/api/catalog/**`
- `app/api/clients/**`
- `app/api/credit-transactions/route.ts`
- `app/api/credits/overview/route.ts`
- `app/api/dashboard/agency/route.ts`
- `app/api/documents/**`
- `app/api/finance/**`
- `app/api/financial-records/**`
- `app/api/leads/**`
- `app/api/operational-center/route.ts`
- `app/api/public/trips/[token]/route.ts`
- `app/api/reports/**`
- `app/api/tasks/**`
- `app/api/team/**`
- `app/api/trips/**`
- `app/api/trips/[id]/share-link/route.ts`
- `app/api/master/**`
- `app/api/stripe/**`
- `app/api/openai/route.ts`
- `app/api/whatsapp/webhook/route.ts`

### Supabase / sessão / acesso

- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/supabase/middleware.ts`
- `lib/supabase/admin.ts`
- `lib/supabase/index.ts`
- `proxy.ts`
- `lib/auth/**`
- `lib/permissions/**`

### Serviços de domínio

- `lib/services/**`

Observação importante:
- `lib/services/portal-pages.ts`
- `lib/services/agency-extra-pages.ts`
- `lib/services/navigation.ts`

Esses três arquivos ficam em `lib/services`, mas **não são core de domínio**. São core de roteamento/configuração visual e devem ser tratados com cuidado especial durante a reconstrução.

### Regras, helpers e tipos

- `lib/atlas/**`
- `lib/finance/**`
- `lib/documents/**`
- `lib/credits/**`
- `lib/notifications/**`
- `lib/pdf/**`
- `lib/templates/**`
- `lib/utils.ts`
- `types/**`

### Variáveis de ambiente / runtime

- `.env.example`
- `.env.local`
- `next.config.mjs`
- `package.json`
- `tsconfig.json`

## 2. LANDING / PRESERVAR

A landing pública atual deve ser preservada como referência visual e de branding.

Arquivos principais:

- `app/page.tsx`
- `components/header.tsx`
- `components/hero-section.tsx`
- `components/whatsapp-section.tsx`
- `components/dashboard-section.tsx`
- `components/documents-section.tsx`
- `components/catalog-section.tsx`
- `components/expansions-section.tsx`
- `components/central-section.tsx`
- `components/insights-section.tsx`
- `components/portal-section.tsx`
- `components/cta-section.tsx`
- `components/footer.tsx`
- `components/atlas-assistant.tsx`
- `components/pwa-popup.tsx`
- `components/branding/travelpro-logo.tsx`
- `app/globals.css`
- `app/layout.tsx`
- `app/icon.png`

Esses arquivos concentram:

- identidade visual
- narrativa institucional
- tom de produto
- dark premium
- linguagem TravelPro

Eles não devem ser reescritos agora. Devem servir como base estética para os novos portais.

## 3. FRONT LEGADO / CANDIDATO A REMOÇÃO

Estes arquivos são os principais candidatos a descontinuação após a reconstrução.

### Camada híbrida V1 / V2

- `components/agency/agency-pages.tsx`
  - arquivo monolítico, concentra muitas páginas, modais, CTAs e micro workspaces
  - alto risco de regressão
  - difícil de manter

- `components/system/portal-page.tsx`
  - shell genérica de portal baseada em config
  - útil como ponte histórica, mas inadequada para a nova arquitetura

- `lib/services/portal-pages.ts`
  - mistura configs de Master, Agência e Cliente
  - ainda injeta mocks e estruturas genéricas

- `lib/services/agency-extra-pages.ts`
  - catálogo paralelo de páginas extras da Agência
  - reforça a fragmentação entre módulos

### Roteamento visual híbrido

- `app/app/[section]/page.tsx`
- `app/app/viagens/[subsection]/page.tsx`
- `app/app/documentos/[subsection]/page.tsx`
- `app/app/central-operacional/[subsection]/page.tsx`
- `app/cliente/[section]/page.tsx`
- `app/master/[section]/page.tsx`

Essas rotas hoje resolvem páginas por:

- map manual
- alias
- `notFound()`
- redirect
- catálogos de config

Isso funciona, mas cria acoplamento demais com o legado.

### Portal Cliente antigo com login

- `app/cliente/**`
- `components/client/**`

Deve ser mantido por compatibilidade por enquanto, mas é candidato claro a legado.
O produto já aponta para `/v/[token]` como experiência principal futura.

### Componentes genéricos de portal que tendem a sair do fluxo principal

- `components/system/portal-layout.tsx`
- `components/system/portal-header.tsx`
- `components/system/sidebar.tsx`
- `components/system/portal-actions.tsx`
- `components/system/metric-card.tsx`
- `components/system/data-table.tsx`
- `components/system/mock-chart.tsx`
- `components/system/filter-tabs.tsx`
- `components/system/search-input.tsx`
- `components/system/bottom-mobile-nav.tsx`

Observação:
- alguns podem ser reaproveitados parcialmente
- mas como conjunto representam a geração “portal genérico / ERP-like”

### Master legado visual

- `components/master/master-pages.tsx`

Também há coexistência em:

- `components/master/master-real-pages.tsx`
- `components/master/master-stabilized-pages.tsx`
- `components/master/master-report-template-pages.tsx`
- `components/master/master-ai-whatsapp-pages.tsx`

Isso indica que o Master também já passou por múltiplas fases de estabilização.

### Mock data

- `mock/**`

Arquivos de mock não devem ser apagados já.  
Mas são candidatos claros a remoção ou arquivamento quando o novo frontend deixar de depender deles.

## 4. ARQUIVOS PERIGOSOS / EXIGEM CUIDADO

Estes arquivos estão na fronteira entre core e visual. Não devem ser apagados sem migração planejada.

### Risco alto

- `proxy.ts`
- `lib/auth/**`
- `lib/supabase/**`
- `lib/services/profile-service.ts`
- `lib/services/dashboard-service.ts`
- `lib/services/document-service.ts`
- `lib/services/finance-service.ts`
- `lib/services/trip-service.ts`
- `lib/services/trip-share-service.ts`
- `lib/services/catalog-service.ts`
- `lib/services/report-service.ts`
- `lib/services/team-service.ts`

### Risco médio-alto

- `lib/services/navigation.ts`
- `lib/services/portal-pages.ts`
- `lib/services/agency-extra-pages.ts`
- `components/system/profile-menu.tsx`
- `components/system/agency-workspace-layout.tsx`
- `components/system/agency-atlas-assistant.tsx`
- `components/public/public-trip-experience.tsx`

### Situação local atual

Há arquivos já modificados localmente e ainda não consolidados:

- `app/app/catalogo/travelpro-match/page.tsx`
- `app/app/planos/page.tsx`
- `components/agency/agency-pages.tsx`
- `components/agency/document-workspace.tsx`
- `components/agency/financial-record-workspace.tsx`
- `components/agency/report-workspace.tsx`
- `components/agency/task-workspace.tsx`
- `components/agency/team-workspace.tsx`

Esses arquivos devem ser tratados como zona de cuidado durante a reconstrução:

- ou entram numa branch de transição
- ou são congelados antes de a nova arquitetura nascer

## 5. ROTAS FRONTEND ATUAIS

### Públicas

- `/`
- `/catalogo/[slug]`
- `/v/[token]`
- `/marketplace`
- `/login`
- `/cadastro`
- `/recuperar-senha`

### Agência

Shell:

- `/app`
- `/app/[section]`

Subrotas principais:

- `/app/viagens/[subsection]`
- `/app/documentos/[subsection]`
- `/app/central-operacional/[subsection]`

Workspaces e criação:

- `/app/clientes/novo`
- `/app/leads/novo`
- `/app/leads/qualificar`
- `/app/viagens/nova`
- `/app/viagens/roteiros/novo`
- `/app/viagens/cotacoes/nova`
- `/app/documentos/novo`
- `/app/documentos/templates/personalizar`
- `/app/financeiro/novo`
- `/app/financeiro/lancamentos/novo`
- `/app/central-operacional/tarefas/nova`
- `/app/central-operacional/relatorios/novo`
- `/app/equipe/novo`
- `/app/relatorios`
- `/app/relatorios/[id]`
- `/app/catalogo`
- `/app/catalogo/pacotes/novo`
- `/app/catalogo/travelpro-match`
- `/app/atlas-advisor`
- `/app/automacoes`
- `/app/creditos`
- `/app/planos`

### Cliente legado

- `/cliente`
- `/cliente/[section]`

### Master

- `/master`
- `/master/[section]`
- `/master/agencias/nova`
- `/master/ia-creditos`
- `/master/ia-creditos/[subsection]`
- `/master/relatorios/[id]`
- `/master/templates/new`
- `/master/templates/novo`
- `/master/whatsapp`

## 6. DEPENDÊNCIAS CRUZADAS IMPORTANTES

### Agência

- `app/app/layout.tsx`
  - usa `PortalLayout`
  - injeta `TravelProAtlasAssistant`

- `PortalLayout`
  - para Agência delega para `AgencyWorkspaceLayout`

- `AgencyWorkspaceLayout`
  - depende de `getNavigationByPortal("agency")`
  - depende de `ProfileMenu`
  - abre drawer de módulos

- `app/app/[section]/page.tsx`
  - depende de `agencyPages`
  - importa páginas diretamente de `components/agency/agency-pages.tsx`

- `app/app/viagens/[subsection]/page.tsx`
- `app/app/documentos/[subsection]/page.tsx`
- `app/app/central-operacional/[subsection]/page.tsx`
  - dependem de `agency-extra-pages.ts`
  - também dependem de exports específicas de `agency-pages.tsx`

### Cliente

- `app/cliente/[section]/page.tsx`
  - ainda cai em `PortalPage` para trechos não especializados

- `/v/[token]`
  - depende de `app/api/public/trips/[token]/route.ts`
  - depende de `lib/services/trip-share-service.ts`
  - renderiza `components/public/public-trip-experience.tsx`

### Master

- `app/master/[section]/page.tsx`
  - ainda depende de estruturas herdadas de configuração/seleção de páginas

### Landing

- `app/page.tsx`
  - orquestra a experiência pública institucional e deve permanecer intocada

## 7. PROBLEMAS ESTRUTURAIS ENCONTRADOS

### Visual / arquitetura

- coexistência de V1, V2 e shells genéricas
- páginas monolíticas grandes
- rotas resolvidas por mapas manuais e aliases
- componentes de portal genérico ainda visíveis
- duplicação de conceitos entre Agência, Master e Cliente

### Manutenibilidade

- `agency-pages.tsx` concentra muito estado e responsabilidade
- `portal-pages.ts` e `agency-extra-pages.ts` misturam mocks, navegação e configuração visual
- difícil separar claramente:
  - visual
  - dados
  - rotas
  - fallback

### Produto

- Portal Cliente antigo ainda existe e mantém custo cognitivo
- Master ainda não tem uma shell limpa equivalente à nova direção
- Agência já tem peças boas de V2, mas a base continua híbrida

## 8. PROPOSTA DE NOVA ESTRUTURA DE PASTAS

Proposta sem mexer no backend:

```text
app/
  (marketing)/
    page.tsx
    ...landing atual preservada

  (public-trip)/
    v/[token]/
      page.tsx
      loading.tsx

  (agency)/
    app/
      layout.tsx
      dashboard/page.tsx
      clientes/page.tsx
      clientes/[id]/page.tsx
      leads/page.tsx
      viagens/page.tsx
      viagens/[id]/page.tsx
      documentos/page.tsx
      financeiro/page.tsx
      relatorios/page.tsx
      equipe/page.tsx
      configuracoes/page.tsx
      creditos/page.tsx
      expansoes/page.tsx
      atlas/page.tsx
      ...

  (master)/
    master/
      layout.tsx
      dashboard/page.tsx
      agencias/page.tsx
      usuarios/page.tsx
      financeiro/page.tsx
      creditos/page.tsx
      logs/page.tsx
      templates/page.tsx
      configuracoes/page.tsx
      ...

components/
  brand/
  marketing/
  public-trip/
  agency-v3/
    shell/
    dashboard/
    clients/
    leads/
    trips/
    documents/
    finance/
    reports/
    team/
    settings/
    shared/
  master-v3/
    shell/
    dashboard/
    agencies/
    users/
    finance/
    logs/
    templates/
    settings/
    shared/
  ui/

lib/
  services/           # preservado
  supabase/           # preservado
  auth/               # preservado
  permissions/        # preservado
  finance/            # preservado
  documents/          # preservado
  atlas/              # preservado
  ...
```

## 9. ESTRATÉGIA DE RECONSTRUÇÃO SEGURA

### Fase 1

- congelar o core atual
- não apagar nada
- marcar oficialmente o frontend legado
- criar a nova shell Agência V3 em namespace próprio

### Fase 2

- criar a nova shell Master V3
- manter `/master` compatível via troca interna de renderização

### Fase 3

- consolidar `/v/[token]` como cliente principal
- manter `/cliente` apenas como legado compatível

### Fase 4

- migrar CTA por CTA para os novos componentes
- matar dependência de `PortalPage`
- matar dependência de `portal-pages.ts`
- matar dependência de `agency-extra-pages.ts`

### Fase 5

- remover o legado visual
- manter somente:
  - backend
  - serviços
  - auth
  - supabase
  - tipos
  - nova UI

## 10. DECISÕES RECOMENDADAS ANTES DE IMPLEMENTAR

1. Criar uma nova camada visual isolada em vez de continuar editando `agency-pages.tsx`.
2. Tratar `PortalPage` como legado de transição, não como base futura.
3. Manter `/cliente` vivo, mas fora da estratégia principal.
4. Fazer Agência primeiro, Master depois, público do cliente por último ou em paralelo controlado.
5. Evitar reaproveitar componentes genéricos de ERP que carregam muito ruído estrutural.

## 11. Checklist de Preservação

Antes de qualquer remoção futura:

- preservar `app/api/**`
- preservar `lib/supabase/**`
- preservar `lib/auth/**`
- preservar `lib/services/**` de domínio
- preservar `types/**`
- preservar `proxy.ts`
- preservar landing
- preservar `/v/[token]`
- preservar catálogo público

## 12. Conclusão

O TravelPro já tem um backend consistente.  
O custo atual está no frontend híbrido.

A reconstrução correta não é “consertar a V2 atual”.

É:

- separar core de visual
- congelar a camada antiga
- criar uma nova árvore de portais limpa
- migrar rotas de forma explícita
- só então remover o legado

Isso reduz risco, preserva o investimento no backend e evita nova rodada de remendos em cima de uma base já sobrecarregada.
