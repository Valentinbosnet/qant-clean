import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BellOff, ArrowLeft } from "lucide-react"

export default function UnsubscribedPage() {
  return (
    <div className="container max-w-md py-10">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <BellOff className="h-6 w-6" />
          </div>
          <CardTitle>Désabonnement réussi</CardTitle>
          <CardDescription>Vous ne recevrez plus d'emails concernant les alertes sectorielles.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">
            Vous pouvez réactiver les notifications par email à tout moment depuis vos préférences d'alertes.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/alerts/sectors">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux alertes sectorielles
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
