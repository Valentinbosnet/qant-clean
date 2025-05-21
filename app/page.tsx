import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, BarChart3, Clock, LineChart, Shield, TrendingUp, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MarketOverviewWidget } from "@/components/home/widgets/market-overview-widget"
import { RecentActivityList } from "@/components/recent-activity-list"

export const metadata: Metadata = {
  title: "Finance Dashboard",
  description: "Analyse et suivi de vos investissements en temps réel",
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Prenez le contrôle de vos investissements
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Analysez le marché, suivez vos actions et prenez des décisions éclairées grâce à notre plateforme
                  d'intelligence financière.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/dashboard">
                  <Button size="lg" className="gap-1.5">
                    Accéder au tableau de bord
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/market-predictions">
                  <Button size="lg" variant="outline">
                    Explorer les prédictions
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-full aspect-video overflow-hidden rounded-xl border bg-background shadow-xl">
                <div className="p-4">
                  <MarketOverviewWidget />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Fonctionnalités principales</div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Tout ce dont vous avez besoin</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Notre plateforme combine analyse de marché, prédictions avancées et outils de suivi personnalisés pour
                vous aider à prendre les meilleures décisions d'investissement.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <TrendingUp className="h-6 w-6" />
                <CardTitle className="text-lg">Analyse de marché</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Suivez les tendances du marché en temps réel avec des graphiques interactifs et des indicateurs
                  avancés.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <BarChart3 className="h-6 w-6" />
                <CardTitle className="text-lg">Prédictions IA</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Bénéficiez de prédictions basées sur l'intelligence artificielle pour anticiper les mouvements du
                  marché.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <LineChart className="h-6 w-6" />
                <CardTitle className="text-lg">Suivi de portefeuille</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Gérez et suivez la performance de votre portefeuille d'investissements en un seul endroit.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Clock className="h-6 w-6" />
                <CardTitle className="text-lg">Alertes personnalisées</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Recevez des alertes en temps réel sur les mouvements importants du marché et de vos actions favorites.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Shield className="h-6 w-6" />
                <CardTitle className="text-lg">Mode hors ligne</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Accédez à vos données même sans connexion internet grâce à notre système de préchargement intelligent.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Users className="h-6 w-6" />
                <CardTitle className="text-lg">Collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Partagez vos analyses et stratégies avec d'autres investisseurs pour des décisions plus éclairées.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Votre tableau de bord personnalisé</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Accédez à toutes les informations dont vous avez besoin en un coup d'œil avec notre tableau de bord
                entièrement personnalisable.
              </p>
            </div>
          </div>
          <div className="mx-auto max-w-6xl py-12">
            <Tabs defaultValue="overview" className="w-full">
              <div className="flex justify-center mb-8">
                <TabsList>
                  <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                  <TabsTrigger value="stocks">Actions</TabsTrigger>
                  <TabsTrigger value="predictions">Prédictions</TabsTrigger>
                  <TabsTrigger value="activity">Activité</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="overview" className="border rounded-lg p-6 bg-background shadow-sm">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Aperçu du marché</CardTitle>
                      <CardDescription>Tendances actuelles et indices principaux</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <MarketOverviewWidget />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Actions en vedette</CardTitle>
                      <CardDescription>Performances notables du jour</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-full w-full flex items-center justify-center bg-muted/30 rounded-md p-4">
                        <p className="text-muted-foreground">Actions en vedette</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Activité récente</CardTitle>
                      <CardDescription>Vos dernières interactions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <RecentActivityList />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="stocks" className="border rounded-lg p-6 bg-background shadow-sm">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Performance des actions</CardTitle>
                      <CardDescription>Suivi de vos investissements</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                      <div className="h-full w-full flex items-center justify-center bg-muted/30 rounded-md">
                        <p className="text-muted-foreground">Graphique de performance des actions</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="predictions" className="border rounded-lg p-6 bg-background shadow-sm">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Prédictions du marché</CardTitle>
                      <CardDescription>Tendances futures basées sur l'IA</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                      <div className="h-full w-full flex items-center justify-center bg-muted/30 rounded-md">
                        <p className="text-muted-foreground">Graphique de prédictions</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="activity" className="border rounded-lg p-6 bg-background shadow-sm">
                <Card>
                  <CardHeader>
                    <CardTitle>Historique d'activité</CardTitle>
                    <CardDescription>Toutes vos actions récentes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-full w-full flex items-center justify-center bg-muted/30 rounded-md p-4">
                      <p className="text-muted-foreground">Liste d'activités étendue</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Prêt à commencer?</h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Rejoignez des milliers d'investisseurs qui utilisent notre plateforme pour prendre de meilleures
                décisions.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/auth">
                <Button size="lg" className="gap-1.5">
                  Créer un compte
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline">
                  Explorer la démo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t bg-background py-6 md:py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row px-4 md:px-6">
          <p className="text-sm text-muted-foreground">© 2025 Finance Dashboard. Tous droits réservés.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
              Conditions d'utilisation
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
              Politique de confidentialité
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
