export const dynamic = "force-dynamic"

export default function NotFound() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <a href="/" className="text-blue-500 hover:underline">
        Go back to home
      </a>
    </div>
  )
}
