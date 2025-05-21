import { EmailTestPanel } from "@/components/email-test-panel"

export default function EmailTestPage() {
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">Test Sector Alert Emails</h1>
      <div className="max-w-md mx-auto">
        <EmailTestPanel />
      </div>
    </div>
  )
}
