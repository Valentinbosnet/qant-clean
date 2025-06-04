export function WidgetSkeleton() {
  return (
    <div className="w-full h-full min-h-[100px] animate-pulse">
      <div className="h-4 w-1/3 bg-muted rounded mb-4"></div>
      <div className="space-y-3">
        <div className="h-3 bg-muted rounded"></div>
        <div className="h-3 bg-muted rounded w-5/6"></div>
        <div className="h-3 bg-muted rounded w-4/6"></div>
      </div>
    </div>
  )
}
