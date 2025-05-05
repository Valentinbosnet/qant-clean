import { db } from "@/lib/db"

export async function getUserSubscription(userId: string) {
  if (!userId) {
    return null
  }

  const subscription = await db.subscription.findUnique({
    where: {
      userId: userId,
    },
    select: {
      id: true,
      userId: true,
      status: true,
      plan: true,
      stripeCurrentPeriodEnd: true,
    },
  })

  if (!subscription) {
    return null
  }

  // Vérifier si l'abonnement est actif
  const isActive =
    subscription.status === "active" &&
    subscription.stripeCurrentPeriodEnd &&
    subscription.stripeCurrentPeriodEnd.getTime() > Date.now()

  // Vérifier si l'abonnement est en période de grâce (après annulation mais avant la fin de la période)
  const isInGracePeriod =
    subscription.status === "canceled" &&
    subscription.stripeCurrentPeriodEnd &&
    subscription.stripeCurrentPeriodEnd.getTime() > Date.now()

  return {
    ...subscription,
    isActive: isActive || isInGracePeriod,
    isInGracePeriod,
  }
}

export async function checkSubscription(userId: string, requiredPlan: "premium" | "pro" | null = null) {
  const subscription = await getUserSubscription(userId)

  // Si aucun abonnement n'est requis
  if (!requiredPlan) {
    return true
  }

  // Si l'utilisateur n'a pas d'abonnement
  if (!subscription) {
    return false
  }

  // Si l'abonnement n'est pas actif
  if (!subscription.isActive) {
    return false
  }

  // Si un plan spécifique est requis
  if (requiredPlan === "pro" && subscription.plan !== "pro") {
    return false
  }

  // Si un plan premium est requis, le plan pro est également valide
  if (requiredPlan === "premium" && !["premium", "pro"].includes(subscription.plan || "")) {
    return false
  }

  return true
}
