"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
          <h1 className="text-6xl font-bold text-gray-800">Error</h1>
          <h2 className="mt-4 text-2xl font-semibold text-gray-600">Something went wrong!</h2>
          <p className="mt-2 text-gray-500">A critical error has occurred. Please try again later.</p>
          <button
            onClick={reset}
            className="px-4 py-2 mt-6 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  )
}
