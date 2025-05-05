import { Suspense } from "react"
import { redirect } from "next/navigation"
import VerifyEmailForm from "@/components/verify-email-form"
import { Loader2 } from "lucide-react"

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const email = searchParams.email as string | undefined

  if (!email) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <Suspense
        fallback={
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        }
      >
        <VerifyEmailForm email={email} />
      </Suspense>
    </div>
  )
}
