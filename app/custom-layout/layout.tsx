import type React from "react"
export default function CustomLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-2 border-blue-500 p-4 m-4 rounded-lg">
      <div className="mb-4 bg-blue-100 p-2 rounded">Layout personnalisé</div>
      {children}
    </div>
  )
}
