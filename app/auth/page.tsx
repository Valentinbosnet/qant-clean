import { Suspense } from "react"
import { AuthFormWrapper } from "@/components/auth/auth-form-wrapper"
import { DirectAuthFormWrapper } from "@/components/auth/direct-auth-form-wrapper"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SupabaseConnectivityTest } from "@/components/auth/supabase-connectivity-test"
import { Loader2 } from "lucide-react"

export default function AuthPage() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Authentification</h1>

      <div className="w-full max-w-md mb-8">
        <Suspense
          fallback={
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          }
        >
          <SupabaseConnectivityTest />
        </Suspense>
      </div>

      <Tabs defaultValue="standard" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="standard">Méthode standard</TabsTrigger>
          <TabsTrigger value="alternative">Méthode alternative</TabsTrigger>
        </TabsList>

        <TabsContent value="standard">
          <Suspense
            fallback={
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            }
          >
            <AuthFormWrapper />
          </Suspense>
        </TabsContent>

        <TabsContent value="alternative">
          <Suspense
            fallback={
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            }
          >
            <DirectAuthFormWrapper />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
