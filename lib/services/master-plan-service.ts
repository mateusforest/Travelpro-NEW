import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import type { Json, PaymentRow, SubscriptionRow } from "@/types/database"
import type { MasterExtraPackageItem, MasterPlanItem, MasterPlanOverview } from "@/types/master"

function parseMetadata(value: Json | null | undefined) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  return value as Record<string, Json | undefined>
}

function normalize(value?: string | null) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

function isActive(status: string) {
  const normalized = normalize(status)
  return normalized === "active" || normalized === "ativa" || normalized === "ativo"
}

export async function getMasterPlanOverview(): Promise<MasterPlanOverview> {
  const supabase = getSupabaseAdminClient()
  const [subscriptionsResult, paymentsResult] = await Promise.all([
    supabase.from("subscriptions").select("*").order("created_at", { ascending: false }),
    supabase.from("payments").select("*"),
  ])

  if (subscriptionsResult.error) throw subscriptionsResult.error
  if (paymentsResult.error) throw paymentsResult.error

  const subscriptions = (subscriptionsResult.data ?? []) as SubscriptionRow[]
  const payments = (paymentsResult.data ?? []) as PaymentRow[]
  const subscriptionById = new Map(subscriptions.map((item) => [item.id, item]))

  const plansMap = new Map<string, MasterPlanItem>()
  for (const subscription of subscriptions) {
    const current = plansMap.get(subscription.plan_code) ?? {
      id: subscription.plan_code,
      plan_code: subscription.plan_code,
      status: subscription.status,
      price: subscription.price ?? null,
      agencies_count: 0,
      active_subscriptions: 0,
      payments_total: 0,
    }
    current.agencies_count += 1
    if (isActive(subscription.status)) current.active_subscriptions += 1
    if (current.price == null && subscription.price != null) current.price = subscription.price
    plansMap.set(subscription.plan_code, current)
  }

  for (const payment of payments) {
    const subscription = payment.subscription_id ? subscriptionById.get(payment.subscription_id) : null
    if (!subscription) continue
    const current = plansMap.get(subscription.plan_code)
    if (!current) continue
    current.payments_total += Number(payment.amount || 0)
  }

  const extrasMap = new Map<string, MasterExtraPackageItem>()
  for (const subscription of subscriptions) {
    const metadata = parseMetadata(subscription.metadata)
    const rawExtras = Array.isArray(metadata.extra_packages)
      ? metadata.extra_packages
      : Array.isArray(metadata.extras)
        ? metadata.extras
        : Array.isArray(metadata.addons)
          ? metadata.addons
          : []

    for (const rawExtra of rawExtras) {
      if (!rawExtra || typeof rawExtra !== "object" || Array.isArray(rawExtra)) continue
      const extra = rawExtra as Record<string, Json | undefined>
      const name = typeof extra.name === "string" ? extra.name : typeof extra.title === "string" ? extra.title : null
      if (!name) continue
      const key = normalize(name)
      const current = extrasMap.get(key) ?? {
        id: key,
        name,
        status: typeof extra.status === "string" ? extra.status : "Ativo",
        price: typeof extra.price === "number" ? extra.price : null,
        agencies_count: 0,
        source: "subscriptions.metadata",
      }
      current.agencies_count += 1
      if (current.price == null && typeof extra.price === "number") current.price = extra.price
      extrasMap.set(key, current)
    }
  }

  return {
    plans: [...plansMap.values()].sort((left, right) => right.active_subscriptions - left.active_subscriptions),
    extra_packages: [...extrasMap.values()].sort((left, right) => right.agencies_count - left.agencies_count),
  }
}
