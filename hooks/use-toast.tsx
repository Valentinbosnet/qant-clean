"use client"

// Simplified toast hook
export function useToast() {
  return {
    toast: ({ title, description, variant }: any) => {
      console.log(`Toast: ${title} - ${description} (${variant || "default"})`)
    },
  }
}
