import PredictionsPageClient from "./PredictionsPageClient"

export const dynamic = "force-dynamic"

export const generateStaticParams = () => {
  return []
}

export default function PredictionsPage() {
  return <PredictionsPageClient />
}
