import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Progress">
      {steps.map((s, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={s} className="flex flex-1 items-center gap-2" aria-current={active ? 'step' : undefined}>
            <span
              className={cn(
                'flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold tabular-nums transition-colors',
                done && 'border-primary bg-primary text-primary-foreground',
                active && 'border-primary text-primary',
                !done && !active && 'text-muted-foreground',
              )}
            >
              {done ? <Check className="size-3.5" aria-hidden /> : i + 1}
            </span>
            <span className={cn('hidden text-sm sm:inline', active ? 'font-medium' : 'text-muted-foreground')}>{s}</span>
            {i < steps.length - 1 && <span className={cn('h-px flex-1', done ? 'bg-primary' : 'bg-border')} aria-hidden />}
          </li>
        )
      })}
    </ol>
  )
}
