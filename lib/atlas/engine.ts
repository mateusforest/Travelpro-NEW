import { atlasContexts, atlasIntents, atlasRouteContexts } from "@/lib/atlas/knowledge-base"
import type { AtlasIntent, AtlasModuleContext, AtlasPortal, AtlasResolvedResponse } from "@/lib/atlas/types"

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9/\s-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function tokenize(value: string) {
  return normalize(value).split(" ").filter(Boolean)
}

function isGenericHelp(query: string) {
  const normalized = normalize(query)
  return !normalized || ["ajuda", "essa tela", "esta tela", "como funciona", "o que tem aqui", "me ajuda"].includes(normalized)
}

export function getAtlasContext(pathname: string, portal: AtlasPortal): AtlasModuleContext {
  const match = atlasRouteContexts.find(([route]) => pathname.startsWith(route))
  const fallbackKey = portal === "master" ? "master-dashboard" : "dashboard"
  const key = match?.[1] ?? fallbackKey

  return (
    atlasContexts.find((item) => item.portal === portal && item.key === key) ??
    atlasContexts.find((item) => item.portal === portal && item.key === fallbackKey)!
  )
}

function scoreIntent(intent: AtlasIntent, query: string, portal: AtlasPortal, context: AtlasModuleContext) {
  if (intent.portal !== "all" && intent.portal !== portal) return -1

  const normalizedQuery = normalize(query)
  const tokens = tokenize(query)
  let score = 0

  if (intent.module === context.key) score += 4
  if (normalizedQuery.includes(normalize(intent.title))) score += 5

  intent.keywords.forEach((keyword) => {
    const normalizedKeyword = normalize(keyword)
    if (normalizedQuery.includes(normalizedKeyword)) score += 6
    if (tokens.some((token) => normalizedKeyword.includes(token))) score += 1
  })

  if (isGenericHelp(query) && intent.module === context.key) score += 8

  return score
}

function toResponse(intent: AtlasIntent): AtlasResolvedResponse {
  return {
    intentId: intent.id,
    title: intent.title,
    summary: intent.summary,
    bullets: intent.bullets,
    nextSteps: intent.nextSteps ?? [],
    route: intent.route,
    routeLabel: intent.routeLabel,
    status: intent.status ?? "ready",
    moduleKey: intent.module,
  }
}

export function resolveAtlasResponse(query: string, pathname: string, portal: AtlasPortal): AtlasResolvedResponse {
  const context = getAtlasContext(pathname, portal)
  const scored = atlasIntents
    .map((intent) => ({ intent, score: scoreIntent(intent, query, portal, context) }))
    .filter((entry) => entry.score >= 0)
    .sort((left, right) => right.score - left.score)

  const best = scored[0]
  if (best && best.score > 0) {
    return toResponse(best.intent)
  }

  return {
    intentId: `context-${context.key}`,
    title: context.label,
    summary: context.summary,
    bullets: [
      `Você está em ${context.label} no portal ${portal === "master" ? "Master" : "Agência"}.`,
      "Posso explicar a tela atual, indicar a rota certa ou resumir o fluxo operacional desse módulo.",
      "Se a dúvida for sobre uma expansão futura, vou sinalizar claramente que ela ainda está em preparação.",
    ],
    nextSteps: ["Tente perguntar algo objetivo, como criar, gerar, compartilhar, exportar ou vincular."],
    route: context.route,
    routeLabel: "Abrir módulo",
    status: "context",
    moduleKey: context.key,
  }
}

export function getAtlasSuggestions(pathname: string, portal: AtlasPortal) {
  const context = getAtlasContext(pathname, portal)
  const contextIntents = atlasIntents.filter((intent) => (intent.portal === portal || intent.portal === "all") && intent.module === context.key)
  const globalFallback = atlasIntents.filter((intent) => intent.portal === portal || intent.portal === "all")
  const questions = [...contextIntents.flatMap((intent) => intent.quickQuestions), ...globalFallback.flatMap((intent) => intent.quickQuestions)]
  return Array.from(new Set(questions)).slice(0, 6)
}

export function getAtlasQuickRoutes(pathname: string, portal: AtlasPortal) {
  const context = getAtlasContext(pathname, portal)
  const routes = atlasIntents
    .filter((intent) => (intent.portal === portal || intent.portal === "all") && intent.module === context.key && intent.route && intent.routeLabel)
    .map((intent) => ({ label: intent.routeLabel!, href: intent.route! }))

  if (routes.length > 0) return routes.slice(0, 3)
  return [{ label: "Abrir módulo", href: context.route }]
}
