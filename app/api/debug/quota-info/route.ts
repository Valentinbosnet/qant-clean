import { NextResponse } from "next/server"
import { apiQuota } from "@/lib/api-quota-manager"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    // Vérifier l'authentification (optionnel, selon votre besoin de sécurité)
    const session = await getServerSession(authOptions)

    // Option: restreindre aux administrateurs
    // if (!session?.user?.isAdmin) {
    //   return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    // }

    // Récupérer les informations de quota
    const quotaInfo = apiQuota.getQuotaInfo()

    // Add recommendations based on quota status
    const recommendations = []

    if (quotaInfo.requestsThisMinute > quotaInfo.minuteLimit * 0.7) {
      recommendations.push({
        level: "warning",
        message: "Minute quota nearly depleted. Consider using simulated data for non-critical requests.",
      })
    }

    if (quotaInfo.requestsToday > quotaInfo.dailyLimit * 0.8) {
      recommendations.push({
        level: "critical",
        message: "Daily quota nearly depleted. Switch to simulated data or cached responses.",
      })
    }

    if (quotaInfo.requestsThisMinute === 0 && quotaInfo.requestsToday < quotaInfo.dailyLimit * 0.5) {
      recommendations.push({
        level: "info",
        message: "Quota available. Good time to prefetch and cache important data.",
      })
    }

    return NextResponse.json({
      ...quotaInfo,
      recommendations,
      timestamp: new Date().toISOString(),
      status: quotaInfo.canMakeRequest ? "available" : "limited",
      healthCheck: {
        apiKey: process.env.ALPHA_VANTAGE_API_KEY ? "configured" : "missing",
        quota: quotaInfo.canMakeRequest ? "ok" : "limited",
      },
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des informations de quota:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des informations de quota" }, { status: 500 })
  }
}
