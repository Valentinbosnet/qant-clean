import { Suspense } from "react"
import { AuthFormWrapper } from "@/components/auth/auth-form-wrapper"
import { Loader2 } from "lucide-react"

export default function AuthPage() {
  return (
    <div className="container max-w-screen-md mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Account Access</h1>
      <Suspense
        fallback={
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }
      >
        <AuthFormWrapper />
      </Suspense>
    </div>
  )
}
