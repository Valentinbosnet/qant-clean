export function Progress({ value = 0, className, ...props }) {
  return (
    <div className={`relative h-4 w-full overflow-hidden rounded-full bg-gray-200 ${className || ""}`} {...props}>
      <div
        className="h-full bg-blue-500 transition-all"
        style={{ width: `${value}%` }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin="0"
        aria-valuemax="100"
      />
    </div>
  )
}
