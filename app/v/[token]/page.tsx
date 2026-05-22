import { PublicTripExperience, PublicTripUnavailable } from "@/components/public/public-trip-experience"
import { getPublicTripExperienceByToken } from "@/lib/services"

export const dynamic = "force-dynamic"

export default async function PublicTripSharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const data = await getPublicTripExperienceByToken(token)

  if (data.status !== "available") {
    return <PublicTripUnavailable status={data.status} />
  }

  return <PublicTripExperience data={data} />
}
