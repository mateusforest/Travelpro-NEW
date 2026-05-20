# TravelPro Operational Workspace Audit

## Objetivo
Mapear fluxos que hoje dependem de modais curtos e definir o padrão de migração para páginas operacionais dedicadas.

## Ações que podem continuar em modal pequeno
- Confirmações destrutivas
- Avisos rápidos
- Mudança de status
- Aprovação simples
- Feedback de cobrança futura
- Edição rápida de campo isolado
- Ações de notificação

## Ações que devem virar páginas dedicadas

### Portal Agência
- Novo cliente
- Nova viagem
- Novo roteiro
- Nova cotação
- Novo documento
- Criar pacote
- Configuração do catálogo
- Branding e identidade da agência
- Planos, créditos e pacotes extras
- TravelPro Go
- TravelPro Agent
- Marketing IA
- Atlas Advisor
- Automações Premium
- Relatórios operacionais

### Portal Master
- Templates oficiais
- Modelos de documento
- Modelos de roteiro
- Modelos de cotação
- Campanhas
- Estilos visuais
- Estruturas de catálogo
- Templates TravelPro Go
- Planos e pacotes extras

### Portal Cliente
- Mantém majoritariamente fluxos leves
- Modais podem seguir para detalhes, compartilhamento e preferências

## Padrão global criado
- `OperationalWorkspaceLayout`
- `WorkspaceSidebarInfo`
- `LivePreviewPanel`
- `SetupGuideCard`

## Primeiro módulo migrado
- Fluxo antigo: `Criar pacote` em modal curto dentro de `/app/catalogo`
- Novo fluxo: página dedicada em `/app/catalogo/pacotes/novo`

## Estrutura operacional recomendada para próximos passos
1. Cabeçalho forte com ação primária e contexto do fluxo
2. Formulário principal amplo com seções
3. Coluna lateral com preview vivo, dicas e status
4. Blocos de apoio para template, branding, FAQ e checklist
5. Uso de modal apenas para confirmações e ajustes rápidos
