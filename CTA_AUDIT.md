# CTA Audit

Data da auditoria: 2026-05-22

## Metodologia

- Varredura automática via `node scripts/audit-ctas.mjs`
- Revisão manual dirigida dos CTAs mais sensíveis em rotas públicas, expansões futuras e componentes globais reutilizados
- Critérios auditados:
  - `href="#"` e `href=""`
  - `onClick` vazio
  - `console.log` ou `alert` como ação final
  - `disabled={true}` fixo
  - rota administrativa em contexto público
  - rota legado `/cliente` fora do portal legado
  - rota Master indevida em contexto de Agência

## Resultado automático

- Achados finais do script após correções seguras: `0`
- Arquivo de varredura: [scripts/audit-ctas.mjs](/abs/path/c:/Users/mateu/Downloads/Travelpro%20NEW/scripts/audit-ctas.mjs)

## Itens revisados e corrigidos

| CTA / Texto | Arquivo | Tela provável | Problema | Correção aplicada | Prioridade |
| --- | --- | --- | --- | --- | --- |
| `Voltar` | `app/catalogo/[slug]/page.tsx` | Vitrine pública do catálogo | Link público apontava para `/app/catalogo`, empurrando visitante para área administrativa | Alterado para âncora pública `#pacotes` | Alta |
| `Voltar para o catálogo da agência` | `app/catalogo/[slug]/page.tsx` | Vitrine pública do catálogo | Link público apontava para `/app/catalogo` | Alterado para âncora pública `#top` | Alta |
| `Ver desempenho` | `app/app/catalogo/travelpro-match/page.tsx` | Match da agência | Feedback sugeria execução mockada como se fosse ação real | Mantido como CTA futuro com toast honesto `Em breve` | Média |
| `Configurar destaque` | `app/app/catalogo/travelpro-match/page.tsx` | Match da agência | Feedback vago/preparado | Mantido como CTA futuro com toast honesto `Em breve` | Média |
| `Ativar no Match` | `app/app/catalogo/travelpro-match/page.tsx` | Match da agência | Mensagem simulava ativação executada | Mantido como CTA futuro com toast honesto `Em breve` | Alta |
| `Enviar pacotes ao Match` | `app/app/catalogo/travelpro-match/page.tsx` | Match da agência | Mensagem simulava publicação executada | Mantido como CTA futuro com toast honesto `Em breve` | Alta |
| `Configurar destaque` | `app/app/catalogo/travelpro-match/page.tsx` | Match da agência | Mensagem simulava destaque aplicado | Mantido como CTA futuro com toast honesto `Em breve` | Média |
| `Alterar foto` / `Salvar` / `Aplicar` / `Salvar parâmetros` / `Salvar configurações` | `components/system/profile-menu.tsx` | Menus globais de perfil | Feedback base falava em “fluxo mockado” | Normalizado para feedback honesto sem fingir backend real | Média |
| `Comprar pacote` | `components/system/profile-menu.tsx` | Plano/créditos no menu de perfil | Mensagem simulava compra mockada | Convertido para toast honesto de compra futura | Média |
| `Ver faturas` | `components/system/profile-menu.tsx` | Cobrança no menu de perfil | Mensagem simulava listagem mockada | Convertido para toast honesto de liberação futura | Média |
| `Mapear chaves futuras` | `components/system/profile-menu.tsx` | Configurações Master no menu de perfil | Mensagem falava em registro mockado | Convertido para feedback honesto sem configuração fake | Baixa |
| `Salvar workspace` e ações primárias sem handler real | `components/system/dedicated-action-workspace.tsx` | Workspaces reutilizados | Mensagem base falava em ação mockada | Texto base normalizado para “registrado / em breve” | Média |
| `Exportar relatório` / `Gerar relatório` / fallback genérico | `components/system/action-workbench.tsx` | Workbench genérico | Descrições falavam em mock de forma enganosa | Mensagens e notas normalizadas para fluxo futuro honesto | Média |
| `Salvar qualificação` | `app/app/leads/qualificar/page.tsx` | Qualificação de leads | Descrição final simulava mock | Ajustada para feedback honesto de fluxo futuro | Baixa |
| `Salvar campanha` | `app/app/marketing/campanhas/nova/page.tsx` | Nova campanha | Descrição final simulava mock | Ajustada para feedback honesto de fluxo futuro | Baixa |

## Itens auditados sem correção necessária

| CTA / Área | Arquivo | Situação | Motivo |
| --- | --- | --- | --- |
| `Compartilhar viagem`, `Copiar link`, `Abrir link`, `Desativar link` | `components/agency/agency-pages.tsx` | OK | Já usam API real de share link |
| Sino de notificação | `components/system/portal-header.tsx`, `components/system/notification-panel.tsx` | OK | Painel abre normalmente e usa toast quando não há origem |
| `Abrir preview` genérico | `components/system/dedicated-action-workspace.tsx` | OK | Já mostra toast claro quando o preview completo ainda não existe |
| `Salvar rascunho` genérico | `components/system/dedicated-action-workspace.tsx` | OK | Já usa handler real quando existe, senão toast claro |
| `Conectar WhatsApp`, `Configurar webhook`, `Ver instância`, `Notificar agência`, `Testar conexão` | `components/master/master-ai-whatsapp-pages.tsx` | OK | Já estavam convertidos para toasts honestos |
| `Exportar base`, `Gerar cobrança`, `Convidar usuário` | `components/master/master-real-pages.tsx` | OK | Já estavam com toasts honestos ou fluxo real |

## Itens não corrigidos automaticamente

| Item | Arquivo | Motivo |
| --- | --- | --- |
| Mensagens residuais de “modo mockado” em branding/templates | `components/agency/agency-template-branding-workspace.tsx` | Não são CTAs mortos nem rotas inválidas; podem entrar numa limpeza textual dedicada |
| Mensagens residuais de “modo mockado” no Atlas assistente | `components/system/agency-atlas-assistant.tsx` | Fluxo preparatório fora do escopo desta rodada funcional |
| Textos de apoio sobre preview local mockado | `components/system/media-upload-card.tsx` | Não bloqueiam ação nem navegação; pendência apenas de copy |

## Resumo

- CTAs / pontos auditados manualmente: `24`
- Achados automáticos críticos após correção: `0`
- CTAs / comportamentos corrigidos ou normalizados: `15`
- CTAs convertidos explicitamente para toast honesto nesta rodada: `8`
- Itens mantidos sem correção por não serem falha funcional: `6`
- Pendências reais futuras de copy preparatória: `3`
