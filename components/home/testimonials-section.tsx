import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

interface Testimonial {
  quote: string
  author: string
  role: string
  avatar: string
}

export function TestimonialsSection() {
  const testimonials: Testimonial[] = [
    {
      quote:
        "Cette plateforme a complètement transformé ma façon d'investir. Les prédictions sont précises et l'interface est intuitive.",
      author: "Sophie Martin",
      role: "Investisseur particulier",
      avatar: "/professional-woman-portrait.png",
    },
    {
      quote:
        "Le mode hors ligne est un vrai plus. Je peux analyser mes investissements même pendant mes déplacements sans connexion.",
      author: "Thomas Dubois",
      role: "Entrepreneur",
      avatar: "/professional-man-portrait.png",
    },
    {
      quote:
        "Les analyses sectorielles m'ont permis d'identifier des opportunités que j'aurais manquées autrement. Un outil indispensable.",
      author: "Émilie Rousseau",
      role: "Analyste financière",
      avatar: "/business-woman-portrait.png",
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-background px-3 py-1 text-sm shadow-sm">Témoignages</div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Ce que disent nos utilisateurs</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Découvrez comment notre plateforme aide des investisseurs de tous horizons à prendre de meilleures
              décisions.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="relative h-16 w-16 overflow-hidden rounded-full">
                    <Image
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.author}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm/relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
                    <div>
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
