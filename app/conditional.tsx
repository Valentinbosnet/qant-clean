import { ConditionalRender } from "@/components/conditional-render"

export default function ConditionalPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Page avec Rendu Conditionnel</h1>
      <ConditionalRender />
    </div>
  )
}
