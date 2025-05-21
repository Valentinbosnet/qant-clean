import { AuthProviderSimple } from "@/contexts/auth-context-simple"
import { ConfigurableHome } from "@/components/home/configurable-home"

export default function HomePageWithAuth() {
  return (
    <AuthProviderSimple>
      <main className="min-h-screen">
        <ConfigurableHome />
      </main>
    </AuthProviderSimple>
  )
}
