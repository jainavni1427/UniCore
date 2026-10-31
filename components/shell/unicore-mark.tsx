export function UniCoreMark({ className }: { className?: string }) {
  return (
    <span
      className={`flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground ${className ?? ''}`}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M6 5v8a6 6 0 0 0 12 0V5" />
        <circle cx="12" cy="13" r="1.6" fill="currentColor" stroke="none" />
      </svg>
    </span>
  )
}
