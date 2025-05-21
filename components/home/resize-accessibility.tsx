"use client"

import "@/styles/accessibility.css"

interface ResizeAccessibilityProps {
  isEditMode: boolean
}

export function ResizeAccessibility({ isEditMode }: ResizeAccessibilityProps) {
  if (!isEditMode) return null

  return <div className="sr-only">You are in edit mode. You can resize and move widgets.</div>
}
