import { SupabaseSetupGuide } from "@/components/auth/supabase-setup-guide"

export default function SupabaseSetupPage() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Configuration de Supabase</h1>

      <div className="w-full max-w-3xl mb-8">
        <SupabaseSetupGuide />
      </div>
    </div>
  )
}
