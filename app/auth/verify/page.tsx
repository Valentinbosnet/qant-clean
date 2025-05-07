import { Suspense } from "react"
import { EmailVerificationForm } from "@/components/auth/email-verification-form"
import { Loader2 } from "lucide-react"

export default function VerifyEmailPage() {
  return (
    <div className="container max-w-md mx-auto py-12">
      <Suspense
        fallback={
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }
      >
        <EmailVerificationForm />
      </Suspense>
    </div>
  )
}
