"use client"

export default function NotFoundClient() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-gray-600">Page Not Found</h2>
      <p className="mt-2 text-gray-500">The page you are looking for doesn't exist or has been moved.</p>
      <a
        href="/"
        className="px-4 py-2 mt-6 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        Go Home
      </a>
    </div>
  )
}
