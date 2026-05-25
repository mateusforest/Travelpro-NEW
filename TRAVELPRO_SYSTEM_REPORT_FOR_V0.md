# TravelPro System Report For V0

Date: 2026-05-23
Purpose: current-state mapping of the TravelPro front-end to support visual redesign work in V0, without changing code.

## 1. Estrutura geral do sistema

### Stack e estrutura base
- Framework: Next.js App Router.
- UI: componentes próprios + Radix/shadcn-style primitives + `vaul` para drawers.
- Estilo visual dominante: dark premium, glow laranja, blur, bordas suaves, cards arredondados e alta densidade operacional.
- Layout raiz: [app/layout.tsx](/abs/path/c:/Users/mateu/Downloads/Travelpro%20NEW/app/layout.tsx)
  - injeta `Toaster`
  - carrega fontes globais
  - aplica `globals.css`

### Portais existentes
- Portal Agência: `/app/*`
- Portal Master: `/master/*`
- Portal Cliente legado: `/cliente/*`
- Experiência pública compartilhável de viagem: `/v/[token]`
- Landing pública: `/`
- Catálogo público da agência: `/catalogo/[slug]`

### Layout geral dos portais
- Layout compartilhado: [components/system/portal-layout.tsx](/abs/path/c:/Users/mateu/Downloads/Travelpro%20NEW/components/system/portal-layout.tsx)
  - sidebar desktop
  - header sticky
  - conteúdo central
  - mobile bottom nav
  - background com glow e blur
- Layout Agência: [app/app/layout.tsx](/abs/path/c:/Users/mateu/Downloads/Travelpro%20NEW/app/app/layout.tsx)
  - usa `PortalLayout portal="agency"`
  - injeta Atlas flutuante
- Layout Master: [app/master/layout.tsx](/abs/path/c:/Users/mateu/Downloads/Travelpro%20NEW/app/master/layout.tsx)
  - usa `PortalLayout portal="master"`
  - injeta Atlas flutuante

### Componentes globais principais
- Header: [components/system/portal-header.tsx](/abs/path/c:/Users/mateu/Downloads/Travelpro%20NEW/components/system/portal-header.tsx)
- Sidebar: [components/system/sidebar.tsx](/abs/path/c:/Users/mateu/Downloads/Travelpro%20NEW/components/system/sidebar.tsx)
- Mobile drawer nav: [components/system/mobile-nav.tsx](/abs/path/c:/Users/mateu/Downloads/Travelpro%20NEW/components/system/mobile-nav.tsx)
- Bottom mobile nav: [components/system/bottom-mobile-nav.tsx](/abs/path/c:/Users/mateu/Downloads/Travelpro%20NEW/components/system/bottom-mobile-nav.tsx)
- Notification panel: [components/system/notification-panel.tsx](/abs/path/c:/Users/mateu/Downloads/Travelpro%20NEW/components/system/notification-panel.tsx)
- Profile menu: [components/system/profile-menu.tsx](/abs/path/c:/Users/mateu/Downloads/Travelpro%20NEW/components/system/profile-menu.tsx)
- Command palette: [components/system/command-palette.tsx](/abs/path/c:/Users/mateu/Downloads/Travelpro%20NEW/components/system/command-palette.tsx)
- Drawer global: [components/system/drawer.tsx](/abs/path/c:/Users/mateu/Downloads/Travelpro%20NEW/components/system/drawer.tsx)
- Workspace base: [components/system/dedicated-action-workspace.tsx](/abs/path/c:/Users/mateu/Downloads/Travelpro%20NEW/components/system/dedicated-action-workspace.tsx)
- Shells visuais:
  - `PageShell`
  - `DashboardCard`
  - `MetricCard`
  - `SectionHeader`
  - `EmptyState`
  - `FilterTabs`

### Navegação
- Fonte da navegação: [lib/services/navigation.ts](/abs/path/c:/Users/mateu/Downloads/Travelpro%20NEW/lib/services/navigation.ts)
- Portal Agência:
  - Dashboard
  - Clientes
  - Leads
  - Viagens
  - Documentos
  - Catálogo
  - TravelPro Go
  - Expansões
  - Central Operacional
  - Financeiro
  - Equipe
- Portal Master:
  - Dashboard
  - Agências
  - Financeiro
  - Usuários
  - Marketplace
  - IA e Créditos
  - WhatsApp
  - Atlas
  - Relatórios
  - Templates
  - Planos
  - Logs
  - Configurações
- Portal Cliente legado:
  - Dashboard
  - Viagem
  - Documentos
  - Roteiro
  - Mensagens
  - Perfil

### Observação estrutural importante
- Ainda existe uma camada antiga de configuração estática e mockada em [lib/services/portal-pages.ts](/abs/path/c:/Users/mateu/Downloads/Travelpro%20NEW/lib/services/portal-pages.ts).
- Hoje ela serve mais como legado/config visual e fallback, enquanto os módulos reais renderizados vêm de:
  - [components/agency/agency-pages.tsx](/abs/path/c:/Users/mateu/Downloads/Travelpro%20NEW/components/agency/agency-pages.tsx)
  - [components/master/master-real-pages.tsx](/abs/path/c:/Users/mateu/Downloads/Travelpro%20NEW/components/master/master-real-pages.tsx)
  - [components/master/master-stabilized-pages.tsx](/abs/path/c:/Users/mateu/Downloads/Travelpro%20NEW/components/master/master-stabilized-pages.tsx)
  - [components/master/master-report-template-pages.tsx](/abs/path/c:/Users/mateu/Downloads/Travelpro%20NEW/components/master/master-report-template-pages.tsx)

## 2. Portal Agência

Base renderizada principal:
- [app/app/[section]/page.tsx](/abs/path/c:/Users/mateu/Downloads/Travelpro%20NEW/app/app/%5Bsection%5D/page.tsx)
- [components/agency/agency-pages.tsx](/abs/path/c:/Users/mateu/Downloads/Travelpro%20NEW/components/agency/agency-pages.tsx)

### Dashboard
- Rota/componente: `/app/dashboard` → `AgencyDashboardPage`
- Função: cockpit operacional com métricas reais, feed, prioridades, financeiro resumido e blocos de expansão.
- Principais cards:
  - métricas de clientes, leads, viagens, documentos, receitas, despesas, saldo
  - blocos “Sistema Vivo TravelPro”
  - feed operacional
  - prioridades
- Botões:
  - novo cliente
  - novo lead
  - nova viagem
  - novo documento
  - novo lançamento
  - ver módulos
- Modais/drawers: não depende de modal principal; navegação direta.
- Ações backend:
  - `/api/dashboard/agency`
- Empty states: existem para ausência de dados.
- Problemas percebidos:
  - alta densidade textual
  - ainda há alguma sensação de cards demais em partes do dashboard
  - alguns blocos de expansão ainda funcionam como placeholders com toast

### Clientes
- Rota/componente: `/app/clientes` → `AgencyClientsPage`
- Função: CRM básico com base real de clientes.
- Cards/blocos:
  - métricas do módulo
  - listagem com ações
  - detalhe em dialog
- Botões:
  - novo cliente
  - visualizar
  - editar
  - excluir
  - abrir cliente vinculado em outros fluxos
- Modais/drawers:
  - editor em dialog
  - confirmação de exclusão
- Backend:
  - `/api/clients`
  - `/api/clients/[id]`
- Empty states: sim
- Problemas percebidos:
  - detalhe de cliente ainda é denso
  - parte do copy ainda tem ruído operacional excessivo

### Leads
- Rota/componente: `/app/leads` → `AgencyLeadsPage`
- Função: pipeline comercial real.
- Cards:
  - métricas por status/temperatura
  - lista principal
  - detalhe do lead
- Botões:
  - novo lead
  - qualificar
  - editar
  - excluir
  - converter em cliente
  - agendar próximo passo
- Modais:
  - editor/detalhe em dialog
  - confirmação
- Backend:
  - `/api/leads`
  - `/api/leads/[id]`
- Empty states: sim
- Problemas percebidos:
  - parte das ações avançadas ainda são toast/futuro
  - copy técnico e visual denso no detalhe

### Viagens
- Rota/componente: `/app/viagens` → `AgencyTripsPage`
- Função: gestão real de viagens.
- Principais cards:
  - métricas do pipeline de viagens
  - listagem
  - detalhe da viagem com visão rica
- Botões:
  - nova viagem
  - editar
  - excluir
  - compartilhar viagem
  - copiar link
  - abrir link
  - desativar link
  - ver roteiro
  - ver documentos
  - notificar cliente
- Modais/drawers:
  - editor em dialog
  - detalhe em dialog
  - confirmação
- Backend:
  - `/api/trips`
  - `/api/trips/[id]`
  - `/api/trips/[id]/share-link`
- Empty states: sim
- Problemas percebidos:
  - tela de detalhe é poderosa, mas muito carregada
  - múltiplas ações secundárias competem visualmente

### Roteiros
- Rota/componente: `/app/viagens/roteiros`
- Workspace: [app/app/viagens/roteiros/novo/page.tsx](/abs/path/c:/Users/mateu/Downloads/Travelpro%20NEW/app/app/viagens/roteiros/novo/page.tsx)
- Função: roteiros operacionais usando `documents` com tipagem padronizada.
- Botões:
  - novo roteiro
  - visualizar
  - editar
  - excluir
  - baixar resumo
  - gerar roteiro com IA
  - usar template
- Backend:
  - `documents` via `/api/documents`
- Empty states: sim
- Problemas percebidos:
  - reaproveitamento de `documents` funciona, mas deixa a semântica mais abstrata
  - parte das ações premium ainda são placeholders

### Cotações
- Rota/componente: `/app/viagens/cotacoes`
- Workspace: [app/app/viagens/cotacoes/nova/page.tsx](/abs/path/c:/Users/mateu/Downloads/Travelpro%20NEW/app/app/viagens/cotacoes/nova/page.tsx)
- Função: cotações usando `documents` com tipagem canônica.
- Botões:
  - nova cotação
  - visualizar
  - editar
  - excluir
  - registrar follow-up
  - baixar proposta simples
  - criar cotação
- Backend:
  - `documents` via `/api/documents`
- Empty states: sim
- Problemas percebidos:
  - mesma questão de semântica reaproveitada de `documents`
  - detalhamento poderia ser mais limpo visualmente

### Documentos
- Rota/componente: `/app/documentos` → `AgencyDocumentsPage`
- Função: hub documental geral.
- Cards:
  - métricas
  - listagem
  - preview/detalhe
- Botões:
  - novo documento
  - visualizar
  - editar
  - excluir
  - gerar com IA
  - usar template
  - enviar documento
- Modais:
  - detalhe e confirmação
- Backend:
  - `/api/documents`
  - `/api/documents/[id]`
- Empty states: sim
- Problemas percebidos:
  - hub ainda é visualmente carregado
  - muitos subtipos vivem próximos e exigem boa hierarquia visual

### Contratos
- Rota: `/app/documentos/contratos`
- Função: recorte filtrado só para `Contrato`.
- Backend: `documents` filtrados por tipo.
- Problemas percebidos:
  - funcionalmente correto; precisa reforço visual de diferenciação futura no redesign

### Vouchers
- Rota: `/app/documentos/vouchers`
- Função: recorte só para `Voucher`.
- Backend: `documents` filtrados por tipo.

### Recibos
- Rota: `/app/documentos/recibos`
- Função: recorte só para `Recibo`.
- Backend: `documents` filtrados por tipo.

### Passagens
- Rota: `/app/documentos/passagens`
- Função: recorte só para `Passagem`.
- Backend: `documents` filtrados por tipo.

### Templates
- Rota: `/app/documentos/templates`
- Função: biblioteca operacional de templates da agência.
- Botões:
  - novo template
  - visualizar
  - editar
  - ativar/desativar
  - usar como base
- Backend:
  - `documents` filtrados por `Template`
- Problemas percebidos:
  - biblioteca ainda compartilha muito da linguagem documental geral

### Financeiro
- Rota/componente: `/app/financeiro` → `AgencyFinancePage`
- Workspace: [components/agency/financial-record-workspace.tsx](/abs/path/c:/Users/mateu/Downloads/Travelpro%20NEW/components/agency/financial-record-workspace.tsx)
- Função: lançamentos reais, filtros por competência, gráfico real, recorrência simples e parcelamento.
- Principais cards:
  - métricas de receitas, despesas, saldo
  - gráfico por recorte
  - lista de lançamentos
- Botões:
  - novo lançamento
  - editar
  - excluir
  - registrar pagamento
  - gerar relatório
  - exportar
  - aplicar filtros
  - limpar filtros
- Backend:
  - `/api/financial-records`
  - `/api/financial-records/[id]`
  - aliases `/api/finance` e `/api/finance/[id]`
- Empty states: sim
- Problemas percebidos:
  - ainda é uma tela muito densa
  - filtro e contexto financeiro podem ser simplificados visualmente em V2

### Relatórios
- Rota/componente: `/app/relatorios`
- Workspace: [components/agency/report-workspace.tsx](/abs/path/c:/Users/mateu/Downloads/Travelpro%20NEW/components/agency/report-workspace.tsx)
- Função: relatórios operacionais reais com persistência, export HTML, PDF via impressão/fluxo atual, regeneração e histórico.
- Botões:
  - gerar relatório
  - abrir relatório
  - baixar HTML
  - exportar PDF
  - gerar novamente
- Backend:
  - `/api/reports`
  - `/api/reports/[id]`
  - `/api/reports/[id]/download`
  - `/api/reports/[id]/regenerate`
  - `/api/reports/compose`
  - `/api/reports/overview`
- Problemas percebidos:
  - histórico ainda tende a blocos extensos
  - fluxo é operacional, mas pode ser mais “executive friendly” no redesign

### Créditos
- Rota/componente: `/app/creditos` e `/app/central-operacional/creditos`
- Função: saldo, consumo, histórico e origem de créditos.
- Backend:
  - `/api/credit-transactions`
  - `/api/credits/overview`
- Problemas percebidos:
  - histórico pede mais colapso/expansão e leitura progressiva

### Central Operacional
- Rotas:
  - `/app/central-operacional`
  - `/app/central-operacional/insights`
  - `/app/central-operacional/tarefas`
  - `/app/central-operacional/relatorios`
- Função:
  - visão geral operacional
  - tarefas
  - insights
  - relatórios
  - consumo de créditos
- Backend:
  - `/api/operational-center`
  - `/api/tasks`
  - `/api/tasks/[id]`
- Problemas percebidos:
  - alguns blocos ainda podem ser compactados
  - densidade visual alta, principalmente em listas e históricos

### Catálogo
- Rotas:
  - `/app/catalogo`
  - `/app/catalogo/pacotes/novo`
  - `/app/catalogo/travelpro-match`
- Função:
  - catálogo real da agência
  - branding/vitrine pública
  - pacote novo/edição
  - espaço de Match como futuro
- Backend:
  - `/api/catalog`
  - `/api/catalog/agency`
  - `/api/catalog/packages`
  - `/api/catalog/packages/[id]`
- Problemas percebidos:
  - ainda há presença de `<img>` no catálogo
  - branding e preview são ricos, mas o módulo ainda é extenso

### Equipe
- Rota/componente: `/app/equipe`
- Workspace: [components/agency/team-workspace.tsx](/abs/path/c:/Users/mateu/Downloads/Travelpro%20NEW/components/agency/team-workspace.tsx)
- Função: membros, cargo, status e permissões visuais.
- Backend:
  - `/api/team`
  - `/api/team/[id]`
- Problemas percebidos:
  - convite ainda é placeholder/toast
  - pode ganhar um desenho mais simples sem perder valor

## 3. Portal Master

Base renderizada:
- [app/master/[section]/page.tsx](/abs/path/c:/Users/mateu/Downloads/Travelpro%20NEW/app/master/%5Bsection%5D/page.tsx)

### Dashboard
- Componente: `MasterDashboardPremiumPage` / `MasterDashboardRealPage`
- Função: cockpit executivo com dados reais.
- Cards:
  - agências
  - usuários
  - receita paga
  - créditos
  - leituras executivas
  - ações rápidas
- Backend:
  - `/api/master/dashboard/overview`
- Problemas percebidos:
  - texto ainda pode ser denso
  - parte do visual premium ainda convive com legados em outros módulos master

### Agências
- Componente: `MasterAgenciesPage`
- Função: base real de agências, detalhe, edição básica, status, membros e consumo.
- Backend:
  - `/api/master/agencies`
  - `/api/master/agencies/[id]`
- Ações:
  - visualizar
  - editar
  - ativar/inativar
  - ver membros
  - ver consumo

### Usuários
- Componente: `MasterUsersPage`
- Função: listar `profiles`, filtrar por role, visualizar detalhe, editar role/status quando permitido.
- Backend:
  - `/api/master/users`
  - `/api/master/users/[id]`
- Ações futuras:
  - convite
  - reset de acesso

### Financeiro
- Componente: `MasterFinancePage`
- Função: billing global e não tenant.
- Backend:
  - `/api/master/finance`
- Fontes:
  - payments
  - subscriptions
  - credit_transactions
- Observação importante:
  - já foi isolado corretamente do financeiro operacional da agência

### IA e Créditos
- Rotas:
  - `/master/ia-creditos`
  - `/master/ia-creditos/uso-ia`
  - `/master/ia-creditos/creditos`
  - `/master/ia-creditos/custos`
  - `/master/ia-creditos/logs-ia`
- Backend:
  - `/api/master/ai-credits`
- Função:
  - ranking de consumo
  - histórico de créditos
  - leitura de sinais reais
  - custos ainda limitados

### Relatórios
- Componente: `MasterReportsRealPage`
- Função: listar relatórios globais reais, histórico, filtros, abrir detalhe, exportar e regenerar.
- Backend:
  - `/api/master/reports`
  - `/api/master/reports/[id]`
  - reuso de `/api/reports/[id]/regenerate`

### Templates
- Componente: `MasterTemplatesRealPage`
- Workspace: [components/master/master-template-workspace.tsx](/abs/path/c:/Users/mateu/Downloads/Travelpro%20NEW/components/master/master-template-workspace.tsx)
- Função: biblioteca oficial da plataforma.
- Backend:
  - `/api/master/templates`
  - `/api/master/templates/[id]`
- Ações:
  - novo template
  - visualizar
  - editar
  - duplicar
  - publicar
  - ativar/desativar

### Logs
- Componente: `MasterLogsRealPage`
- Backend:
  - `/api/master/logs`
- Função: timeline global via `audit_logs` reais.

### Marketplace
- Componente: `MasterMarketplaceStablePage`
- Backend:
  - `/api/master/marketplace`
- Função: base real do catálogo publicado, sem Match real.
- Observação:
  - é uma camada preparatória para Match, com empty states honestos.

### Planos
- Componente: `MasterPlansStablePage`
- Backend:
  - `/api/master/plans`
- Função:
  - leitura de subscriptions e add-ons
  - sem billing comercial real

### WhatsApp
- Componente: `MasterWhatsAppRealPage`
- Backend:
  - `/api/master/whatsapp`
- Função:
  - estrutura operacional
  - zero states honestos
  - sem integração real ainda

## 4. Experiência pública `/v/[token]`

Arquivos principais:
- [app/v/[token]/page.tsx](/abs/path/c:/Users/mateu/Downloads/Travelpro%20NEW/app/v/%5Btoken%5D/page.tsx)
- [app/v/[token]/loading.tsx](/abs/path/c:/Users/mateu/Downloads/Travelpro%20NEW/app/v/%5Btoken%5D/loading.tsx)
- [components/public/public-trip-experience.tsx](/abs/path/c:/Users/mateu/Downloads/Travelpro%20NEW/components/public/public-trip-experience.tsx)

### Estrutura da página
- hero premium
- resumo da viagem
- timeline
- documentos agrupados por tipo
- checklist
- atualizações
- agência e suporte
- analytics leves do link
- CTA fixo mobile para WhatsApp

### Hero
- destino
- cliente
- período
- status
- branding da agência
- logo
- banner opcional
- botões de compartilhar/copiar/baixar
- contagem regressiva

### Branding da agência
- usa `primary_color`, `logo_url`, `banner_url`, nome, telefone e e-mail quando houver

### Timeline
- construída a partir de:
  - datas da viagem
  - itineraries
  - documentos seguros
- fallback elegante quando não há dados

### Documentos
- agrupados por:
  - vouchers
  - roteiros
  - contratos/propostas
  - passagens
  - anexos
- UI usa accordion simples via expandir/recolher por grupo

### Checklist
- documentos enviados
- pagamento confirmado
- check-in
- roteiro disponível
- suporte
- sem inventar dados além do que a experiência consegue inferir

### CTA WhatsApp
- aparece se a agência tiver telefone
- há CTA inline e CTA fixo mobile
- link simples `wa.me`, sem API real

### Mobile
- prioridade forte para:
  - leitura confortável
  - blocos curtos
  - CTA fixo
  - scroll único

### Loading/erro
- skeleton premium: [app/v/[token]/loading.tsx](/abs/path/c:/Users/mateu/Downloads/Travelpro%20NEW/app/v/%5Btoken%5D/loading.tsx)
- estados:
  - inativo
  - expirado
  - não encontrado

## 5. Landing atual

Arquivo principal:
- [app/page.tsx](/abs/path/c:/Users/mateu/Downloads/Travelpro%20NEW/app/page.tsx)

### Seções existentes
- Header
- Hero
- WhatsApp / TravelPro Go
- Dashboard
- Documents
- Catalog
- Expansions
- Central
- Insights
- Portal
- CTA final
- Footer
- PWA popup
- Atlas assistant

### Proposta atual
- plataforma para agências de viagens
- operação inteligente
- integração com WhatsApp e IA
- promessa de automação e organização operacional

### CTAs
- `Preciso disso`
- `Quero conhecer`
- links para cadastro/login

### Cards e mockups
- hero com mock de chat TravelPro Go
- seção de WhatsApp com mini chat
- seção de dashboard com mock administrativo
- CTA final com promessas de setup, segurança e suporte

### Pontos fracos visuais
- home ainda comunica muito por mockup e menos por prova de produto real
- várias seções parecem marketing + demonstração conceitual, não produto vivo
- há ruído de encoding em alguns textos
- parte dos mockups tem estética boa, mas mais “screenshot ilustrado” do que narrativa clara de valor

### Oportunidades para V2
- reduzir quantidade de seções
- transformar a home em narrativa mais clara por 3-5 pilares
- usar o novo `/v/[token]` e o catálogo público como provas reais de produto
- substituir parte dos mockups por “experiências reais” da plataforma

## 6. Backend usado pelo front

### Tabelas Supabase usadas pelo front
- `agencies`
- `profiles`
- `agency_members`
- `clients`
- `leads`
- `trips`
- `itineraries`
- `documents`
- `catalog_items`
- `financial_records`
- `credit_transactions`
- `reports`
- `tasks`
- `team_members`
- `subscriptions`
- `payments`
- `audit_logs`
- `notifications`
- `trip_share_links`

### APIs `app/api` usadas
- Auth:
  - `/api/auth/bootstrap`
  - `/api/auth/me`
- Agência:
  - `/api/dashboard/agency`
  - `/api/clients`
  - `/api/leads`
  - `/api/trips`
  - `/api/trips/[id]/share-link`
  - `/api/documents`
  - `/api/financial-records`
  - `/api/credit-transactions`
  - `/api/credits/overview`
  - `/api/operational-center`
  - `/api/tasks`
  - `/api/team`
  - `/api/reports`
  - `/api/reports/compose`
  - `/api/reports/overview`
- Catálogo:
  - `/api/catalog`
  - `/api/catalog/agency`
  - `/api/catalog/packages`
  - `/api/catalog/public/[slug]`
- Master:
  - `/api/master/dashboard/overview`
  - `/api/master/agencies`
  - `/api/master/users`
  - `/api/master/finance`
  - `/api/master/ai-credits`
  - `/api/master/reports`
  - `/api/master/templates`
  - `/api/master/logs`
  - `/api/master/marketplace`
  - `/api/master/plans`
  - `/api/master/whatsapp`
- Público:
  - `/api/public/trips/[token]`

### Ações reais
- CRUD de clientes
- CRUD de leads
- CRUD de viagens
- geração/gestão de link compartilhável da viagem
- CRUD documental
- CRUD financeiro
- tarefas
- equipe
- relatórios operacionais
- catálogo e vitrine pública
- leituras globais do Master

### Ações futuras
- Stripe real
- OpenAI real
- WhatsApp real
- Match real
- Go real de produção
- Agent real/autônomo
- marketing IA real
- Advisor real

### Dados mockados ainda presentes
- `portal-pages.ts` como camada legada/config antiga
- alguns arrays mockados ainda importados em `agency-pages.tsx` e páginas antigas, nem sempre renderizados nos fluxos reais
- landing pública ainda usa mockups e exemplos cenográficos
- módulos futuros operam com placeholders honestos

## 7. Problemas atuais percebidos

### Poluição visual
- muitos módulos ainda acumulam:
  - métricas
  - cards
  - listas
  - detalhes
  - CTAs secundários
- a experiência é rica, mas em várias telas já parece “densa demais”

### Excesso de cards
- dashboards e alguns hubs operacionais usam muitos contêineres e muito texto por tela
- há valor percebido alto, mas pouca respiração visual em alguns módulos

### Botões frágeis
- o projeto já teve fragilidade confirmada com drawers/dialog triggers
- a regra nova de drawers controlados em gatilhos críticos é importante e deve continuar

### Drawers/dialogs instáveis
- a arquitetura funciona, mas:
  - gatilhos uncontrolled podem falhar em casos específicos
  - dropdown + dialog/drawer exige cuidado

### Ações sem feedback
- isso melhorou bastante
- ainda existem ações futuras que dependem de toast honesto, mas já estão mais claras

### Fluxos confusos
- alguns módulos reaproveitam demais a mesma estrutura
  - `documents` vira base de documentos, templates, roteiros e cotações
- isso é eficiente no backend, mas torna a linguagem do front mais confusa

### Oportunidades de simplificação
- separar melhor “hub” de “workspace”
- reduzir quantidade de ações visíveis por card
- trocar alguns detalhes longos por disclosure progressivo
- dar mais protagonismo ao que o usuário precisa fazer agora

## 8. Recomendações para V2

### O que manter
- identidade dark premium
- glow laranja
- rounded cards e blur
- sensação de cockpit operacional
- Atlas flutuante
- experiência pública `/v/[token]`
- catálogo público
- dashboards vivos com dados reais

### O que reorganizar
- consolidar menos cards por viewport
- separar melhor:
  - leitura executiva
  - ação operacional
  - detalhe profundo
- diminuir repetição de microcards informativos

### O que transformar em ação rápida
- novo cliente
- novo lead
- nova viagem
- novo documento
- novo lançamento
- gerar relatório
- compartilhar viagem

### O que virar drawer
- ações rápidas de contexto
- visualizações curtas
- filtros leves
- histórico enxuto
- notificações
- navegação móvel

### O que virar modal
- confirmação destrutiva
- edições curtas
- preview simples
- detalhes rápidos sem contexto lateral complexo

### O que deve continuar como “Em breve”
- Go real
- Agent real
- Match real
- WhatsApp real
- IA generativa real
- Stripe real
- Advisor/automações profundas

### Como melhorar a experiência mobile
- reduzir blocos verticais muito longos
- colapsar históricos por padrão
- usar mais CTAs fixos contextuais
- reduzir duplicidade de botões
- dar mais prioridade a:
  - ver
  - salvar
  - compartilhar
  - abrir
- continuar evitando cara de dashboard administrativo na experiência pública

## Conclusão

O TravelPro atual já tem um front grande, premium e funcional, com boa parte dos módulos principais conectados ao Supabase e com uma identidade visual consistente. O maior desafio para o redesign no V0 não é “inventar produto”, e sim reorganizar a experiência:
- reduzir ruído
- melhorar hierarquia
- transformar densidade em clareza
- manter a percepção premium
- tornar o sistema mais respirado sem perder profundidade

Para o V0, a melhor direção é tratar o produto atual como uma base rica e viva, não como um MVP cru. O redesign deve preservar valor percebido e operacionalidade, enquanto simplifica leitura, foco e navegação.
