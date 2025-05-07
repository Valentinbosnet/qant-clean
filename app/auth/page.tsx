import { AuthForm } from "@/components/auth/auth-form"

export default function AuthPage() {
  return (
    <div className="container max-w-screen-md mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Account Access</h1>
      <AuthForm />
    </div>
  )
}
